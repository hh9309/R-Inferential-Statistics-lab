import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System prompt for statistical inference AI
const STATS_SYSTEM_INSTRUCTION = `你是一位世界顶级的生物统计学与数理统计学教授、资深 R 语言专家，专注于假设检验、参数估计与推断统计学诊断。
你的职责是为 WebApp 实验室用户提供精准、严密、符合数理统计现代规范的诊断与答疑。

请遵循以下核心准则：
1. 【零容忍统计谬误】：
   - 坚决纠正“p > 0.05 代表接受原假设 H0 或证明 H0 为真”的错误，强调“未拒绝 H0”并不等于“H0 成立”（Absence of evidence is not evidence of absence）。
   - 坚决指出“p 值是原假设为真时观察到当前极端数据的概率，而不是原假设为真的后验概率”。
   - 严厉提示仅看 p 值而不报告效应量（Effect Size, 如 Cohen's d, η², Cramér's V）和置信区间（Confidence Interval）的缺陷。
   - 强调 t 检验的正态性前提与方差齐性前提，指出严重偏态时盲目套用 t 检验的危害，并推荐稳健方法（如 Wilcoxon 秩和检验、Welch's t 检验）。
   - 警惕数据偷看（Optional Stopping）、事后选择假设（HARKing）与多重比较显著性膨胀（p-hacking）。
2. 【标准 R 代码支持】：
   - 在适当时提供符合 R 语言 stats 包或现代规范的精确代码（如 stats::t.test, stats::aov, stats::shapiro.test, pwr::pwr.t.test）。
3. 【语言风格】：
   - 中文简体，语气严谨专业、条理清晰、兼具启发性与学术深度。
   - 善用排版、粗体与数学符号（如 H₀, H₁, α, β, p-value, df）。`;

async function callGeminiWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 6000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini API request timeout')), timeoutMs);
  });
  try {
    const res = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timer!);
    return res;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

// AI Diagnostic Endpoint
app.post('/api/diagnose', async (req, res) => {
  try {
    const { testType, sampleSize, pValue, effectSize, normalityP, equalVarP, context } = req.body;

    const prompt = `请对以下当前的统计推断实验进行深度诊断分析：
- 检验类型：${testType || '未指定'}
- 样本量 n：${sampleSize ?? '未提供'}
- 观察到的 p 值：${pValue ?? '未提供'}
- 效应量指标：${effectSize ?? '未计算/未提供'}
- 正态性检验 p 值 (Shapiro-Wilk)：${normalityP ?? '未检验'}
- 方差齐性检验 p 值 (F-test)：${equalVarP ?? '未检验'}
- 业务情境描述：${context || '常规学术/工业抽样检验'}

请按以下三部分输出诊断意见：
1. 【前提假设合规性审查】（检验正态性、方差齐性、独立性及样本容量敏感性）
2. 【统计结论逻辑审查】（重点审查是否存在"接受原假设"、"误判效应量"或"伪显著/统计功效不足"陷阱）
3. 【R 语言标准复现与稳健建议】（给出精准 R 代码及备选稳健统计方法，如 Welch t.test 或非参数检验）`;

    if (ai) {
      try {
        const response = await callGeminiWithTimeout(() =>
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: STATS_SYSTEM_INSTRUCTION,
              temperature: 0.2,
            },
          })
        );

        if (response && response.text) {
          return res.json({
            success: true,
            text: response.text,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini diagnose call timed out or failed, falling back:', geminiErr);
      }
    }

    // Built-in expert rule-based fallback
    const fallbackDiagnosis = generateRuleBasedDiagnosis({
      testType,
      sampleSize,
      pValue,
      effectSize,
      normalityP,
      equalVarP,
    });

    return res.json({
      success: true,
      text: fallbackDiagnosis,
      source: 'expert-engine-builtin',
    });
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || '统计诊断生成失败',
      text: '诊断服务暂时不可用，请检查网络或后端环境。',
    });
  }
});

// AI Chat Q&A Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentContext, model = 'gemini 3 flash', apiKey } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const contextPrompt = currentContext
      ? `【当前实验模块上下文】：${JSON.stringify(currentContext)}\n\n`
      : '';

    // 1. 若选择 deepseek-v4-pro 模型
    if (model === 'deepseek-v4-pro' || model === 'deepseek') {
      const deepseekKey = apiKey || process.env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        try {
          const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: STATS_SYSTEM_INSTRUCTION },
                { role: 'user', content: `${contextPrompt}用户提问：${lastMessage}` },
              ],
              temperature: 0.3,
            }),
          });
          const dsData = (await dsResponse.json()) as any;
          if (dsData?.choices?.[0]?.message?.content) {
            return res.json({
              success: true,
              reply: dsData.choices[0].message.content,
              source: 'deepseek-v4-pro',
            });
          }
        } catch (dsErr) {
          console.warn('DeepSeek API proxy call failed, falling back:', dsErr);
        }
      }
    }

    // 2. 若选择 gemini 3 flash 模型
    const effectiveAi = apiKey
      ? new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        })
      : ai;

    if (effectiveAi) {
      try {
        const prompt = `${contextPrompt}用户提问：${lastMessage}`;
        const response = await callGeminiWithTimeout(() =>
          effectiveAi.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction: STATS_SYSTEM_INSTRUCTION,
              temperature: 0.3,
            },
          })
        );

        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            source: 'gemini 3 flash',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini chat call timed out or failed, falling back:', geminiErr);
      }
    }

    // 3. 内置严密数理统计专家规则兜底引擎
    const defaultReply = getFallbackChatResponse(lastMessage);
    return res.json({
      success: true,
      reply: defaultReply,
      source: 'expert-engine-builtin',
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'AI 随诊服务异常',
    });
  }
});

function generateRuleBasedDiagnosis(params: any): string {
  const { testType, sampleSize, pValue, normalityP, equalVarP, effectSize } = params;
  const p = typeof pValue === 'number' ? pValue : parseFloat(pValue);
  const normP = typeof normalityP === 'number' ? normalityP : parseFloat(normalityP);
  const eqP = typeof equalVarP === 'number' ? equalVarP : parseFloat(equalVarP);

  let diagnosis = `### 🩺 统计推断随诊专家诊断意见书\n\n`;

  // Section 1
  diagnosis += `#### 1. 前提假设合规性审查\n`;
  if (!isNaN(normP) && normP < 0.05) {
    diagnosis += `- ⚠️ **严重警示：数据违反正态性假设** (Shapiro-Wilk p = ${normP.toFixed(4)} < 0.05)。盲目套用经典 Student's t 检验可能导致第一类错误率失真。若样本量 $n < 30$，强烈建议改用非参数方法（如 Wilcoxon 秩和检验）或对数/Box-Cox 变换。\n`;
  } else {
    diagnosis += `- ✅ **正态性前提合规**：数据分布未检测出显著偏离正态形态（p > 0.05 或已满足中心极限定理大样本渐近条件）。\n`;
  }

  if (!isNaN(eqP) && eqP < 0.05) {
    diagnosis += `- ⚠️ **方差不齐预警** (F-test p = ${eqP.toFixed(4)} < 0.05)。严禁使用传统等方差 Student's t 检验，必须强制使用 **Welch's t 检验**（Satterthwaite 自由度近似）。\n`;
  } else if (!isNaN(eqP)) {
    diagnosis += `- ✅ **方差齐性满足**：两组方差未显现显著差异。\n`;
  }

  // Section 2
  diagnosis += `\n#### 2. 统计推断决策逻辑审查\n`;
  if (!isNaN(p)) {
    if (p > 0.05) {
      diagnosis += `- 🛑 **重大误区警示（未拒绝 ≠ 证明为真）**：当前 p 值 (${p.toFixed(4)}) > 0.05。请切记：**在统计学逻辑中绝不能表述为“接受原假设 H₀”或“证明两组均值完全相等”**！准确表述是“在 α=0.05 检验水准下，当前样本数据未提供足以拒绝原假设的充分统计证据”（Fail to reject H₀）。\n`;
      diagnosis += `- 🔍 **统计功效检视**：未拒绝 H₀ 极可能是因为样本容量过小（Underpowered Study），导致第二类错误概率 β 偏高。建议结合功效分析 (Power Analysis) 评估是否达到 80% 检出力。\n`;
    } else {
      diagnosis += `- 🎯 **显著性决策**：p = ${p.toFixed(4)} < 0.05，在统计学上拒绝原假设 H₀，支持备择假设 H₁。\n`;
      if (sampleSize && sampleSize > 1000) {
        diagnosis += `- ⚠️ **警惕“大样本伪显著”**：当前样本量较大 ($n = ${sampleSize}$)。极小的实际无意义差异在超大样本下也会导致 p < 0.001。必须严密考察效应量 (Effect Size) 与置信区间宽度，而非仅仅盯着 p 值！\n`;
      }
    }
  }

  // Section 3
  diagnosis += `\n#### 3. R 语言规范复现脚本\n\`\`\`R
# 稳健假设检验推荐调用
# 针对两样本推断 (自动处理异方差)：
t.test(group_A, group_B, var.equal = FALSE, conf.level = 0.95)

# 若需进行正态性前提诊断：
shapiro.test(group_A)
qqnorm(group_A); qqline(group_A, col = "indianred", lwd = 2)

# 计算效应量 Cohen's d：
# library(effsize)
# cohen.d(group_A, group_B)
\`\`\``;

  return diagnosis;
}

function getFallbackChatResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('p值') || q.includes('p-value') || q.includes('接受原假设')) {
    return `### 💡 为什么统计推断中绝不能说“接受原假设（Accept H₀）”？

1. **逻辑学上的“无罪推定”原则**：
   假设检验采用反证法与保守决策准则。原假设 H₀ 设定为“无差异/无效应”。
   - 当观察到的数据极其罕见（p < α）时，我们有足够的证据**推翻**这一预设，即“拒绝 H₀”。
   - 但当数据与原假设不矛盾（p > α）时，只是说明**当前证据不足以定罪**，绝不等于**证明了其清白无辜**！

2. **统计学后果**：
   若两组真实存在微小的有价值差异，但因为你只抽了 15 个样本，导致检验功效（Power = 1-β）极低，p 算出来为 0.12。此时若草率得出“两组没有差异、疗效完全一样”的结论，属于经典的**第二类错误（取伪错误）**。

3. **学术规范表述**：
   - ❌ 错误：“数据证明了原假设 H₀ 为真，两组均值无差别。”
   - ✅ 正确：“在 α = 0.05 的显著性水平下，未发现统计学显著差异（p = 0.12），未拒绝原假设。”同时必须报告效应量及 95% 置信区间。`;
  }

  if (q.includes('配对') || q.includes('两样本') || q.includes('独立')) {
    return `### ⚖️ 配对 t 检验 vs 独立样本 t 检验的辨析决策指南

1. **配对样本 t 检验 (Paired t-test)**：
   - **适用条件**：同一受试对象在不同处理前后（如新员工培训前/后测试），或者严格配对的孪生子、左右对称部位。
   - **统计核心**：直接将每个观测对做差 $D_i = X_{1i} - X_{2i}$，将问题转化为对差值序列均值 $\mu_d = 0$ 的**单样本 t 检验**。
   - **优势**：消除了受试者个体间的固有变异（例如学员底子好坏），统计功效显著高于独立样本。

2. **两独立样本 t 检验 (Independent Two-Sample t-test)**：
   - **适用条件**：两组实验对象来自两个相互独立的总体（如实验组 A vs 对照组 B），彼此互不干扰。
   - **关键前提**：需要关注方差齐性！若方差齐使用 Student's t，若方差不齐（$s_1^2 \neq s_2^2$）必须使用 **Welch's t 检验**。

3. **R 语言语法对照**：
   \`\`\`R
   # 配对 t 检验
   t.test(before, after, paired = TRUE)

   # 独立双样本 t 检验 (推荐默认使用 Welch)
   t.test(group_A, group_B, paired = FALSE, var.equal = FALSE)
   \`\`\``;
  }

  return `您好！我是 R 统计推断实验室的智能学术随诊助手。
我可以为您解答：
- **概念诊断**：为什么 p > 0.05 不能称为“接受原假设”？第一类错误 (α) 与第二类错误 (β) 的权衡。
- **检验选型**：单样本、双样本 Welch、配对 t 检验、方差分析 (ANOVA) 与卡方检验的选择树。
- **前提诊断**：数据违反正态性或方差齐性时如何补救？
- **R 语言实操**：如何使用 stats 包编写可复现的专业推断脚本？

请随时在下方输入您在实验中遇到的困惑或疑问！`;
}

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('.', 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('.', 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[R-Statistical-Inference-lab] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
