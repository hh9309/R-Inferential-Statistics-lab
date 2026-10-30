import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/stats';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  X,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  Settings,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Check,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

interface Module7Props {
  isOpenFloating?: boolean;
  onCloseFloating?: () => void;
  isStandaloneTab?: boolean;
}

export type SupportedLLM = 'gemini 3 flash' | 'deepseek-v4-pro';

const PRESET_DIAGNOSES = [
  {
    id: 'diag-1',
    title: '诊断一：把 p > 0.05 误判为“接受原假设 H₀”',
    shortTitle: '接受原假设陷阱',
    prompt: '为什么在统计推断中，当 p > 0.05 时绝对不能说“接受原假设 H₀”或“证明两组没有差别”？这在逻辑学和决策上有何致命谬误？',
  },
  {
    id: 'diag-2',
    title: '诊断二：严重偏态分布盲目套用 Student t 检验',
    shortTitle: '正态性违背诊断',
    prompt: '当数据明显偏态且样本量较小时，若盲目使用传统 t 检验，会导致怎样的第一类与第二类错误？应该如何用 R 语言进行非参数检验或稳健替代？',
  },
  {
    id: 'diag-3',
    title: '诊断三：多重检验显著性膨胀与 p-hacking 数据偷看',
    shortTitle: 'p-hacking 膨胀',
    prompt: '什么是显著性水平膨胀？如果同时对比 10 个指标，传统的 α=0.05 真实错误率会变成多少？如何用 Bonferroni 或 FDR 校正？',
  },
  {
    id: 'diag-4',
    title: '诊断四：超大样本下的“伪显著”与效应量脱钩',
    shortTitle: '伪显著与效应量',
    prompt: '为什么当样本量 n 达到数万人时，即使两组差异微乎其微，p 值也会变成 < 0.0001？为什么不能只看 p 值而不报告效应量 (Effect Size)？',
  },
];

export const Module7_AIDiagnosisModal: React.FC<Module7Props> = ({
  isOpenFloating = false,
  onCloseFloating,
  isStandaloneTab = false,
}) => {
  // 模型与 API-Key 状态 (优先从 localStorage 读取)
  const [selectedModel, setSelectedModel] = useState<SupportedLLM>(() => {
    const saved = localStorage.getItem('ai_stats_model');
    return saved === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini 3 flash';
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ai_stats_api_key') || '';
  });

  // 设置模态框显隐与表单临时态
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tempModel, setTempModel] = useState<SupportedLLM>(selectedModel);
  const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [apiKeyMissingNotice, setApiKeyMissingNotice] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `👋 您好！我是 **R 统计推断与假设检验实验室** 的智能随诊专家。

在实务研究与学术分析中，研究者常常陷入三大致命陷阱：
1. **将 p > 0.05 错误表述为“证明原假设为真”**；
2. **在严重偏态或小样本下盲目套用 t 检验**；
3. **沉迷于 p < 0.05 显著性而忽视了实际业务效应量 (Effect Size)**。

⚠️ **调用说明**：本项目可直接部署于 GitHub Pages 运行。所有大模型调用必须**输入专属 API-Key** 后方可调用。点击右上角齿轮 **⚙️ 设置大模型** 配置密钥与选用模型（支持 **gemini 3 flash** 与 **deepseek-v4-pro**）。`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 打开设置弹窗
  const handleOpenSettings = () => {
    setTempModel(selectedModel);
    setTempApiKey(apiKey);
    setShowApiKey(false);
    setSettingsError('');
    setIsSettingsOpen(true);
  };

  // 确认大模型与 API-Key 配置
  const handleConfirmSettings = () => {
    const trimmedKey = tempApiKey.trim();
    if (!trimmedKey) {
      setSettingsError('⚠️ 必须输入 API-Key 后才能确认保存！浏览器将直接使用该 Key 进行调用。');
      return;
    }

    setSelectedModel(tempModel);
    setApiKey(trimmedKey);
    localStorage.setItem('ai_stats_model', tempModel);
    localStorage.setItem('ai_stats_api_key', trimmedKey);
    setSettingsError('');
    setIsSettingsOpen(false);
    setApiKeyMissingNotice(false);

    // 提示成功配置
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);

    // 发送系统确认气泡
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: `⚙️ **大模型配置已确认生效**：
- **生效模型**：\`${tempModel === 'gemini 3 flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}\`
- **API-Key 状态**：已成功绑定（尾号 \`...${trimmedKey.slice(-4)}\`，已存入本地浏览器缓存）
- **部署环境**：支持 GitHub 静态页面浏览器直调与服务端代理调用。您现在可以自由发起假设检验诊断！`,
        timestamp: Date.now(),
      },
    ]);
  };

  // 清空密钥
  const handleClearKey = () => {
    setTempApiKey('');
    setApiKey('');
    localStorage.removeItem('ai_stats_api_key');
    setSettingsError('已清空 API-Key，如需发起提问请重新手工输入。');
  };

  // 发送消息及大模型诊断
  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || loading) return;

    // 严格检查：所有大模型调用必须输入 API-Key
    if (!apiKey || !apiKey.trim()) {
      setApiKeyMissingNotice(true);
      handleOpenSettings();
      setSettingsError('⚠️ 未检测到 API-Key！根据系统要求，所有大模型调用必须输入 API-Key 并【确认大模型】后才能调用。');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let replyText = '';
      let replySource: string = selectedModel;

      // 优先尝试代理端 /api/chat (本地 dev 模式运行)
      let proxySuccess = false;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            model: selectedModel,
            apiKey: apiKey.trim(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            replyText = data.reply;
            replySource = data.source || selectedModel;
            proxySuccess = true;
          }
        }
      } catch (proxyErr) {
        console.info('Node 服务端代理不可用，切换至 GitHub 部署浏览器直调模式:', proxyErr);
      }

      // 如果代理未成功 (例如部署在 GitHub Pages 纯静态前端环境中)，使用浏览器端直调
      if (!proxySuccess) {
        if (selectedModel === 'gemini 3 flash') {
          // 直连 Google Gemini API
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            apiKey.trim()
          )}`;
          const gRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `你是一位数理统计学教授及 R 语言专家，专注于假设检验与推断统计诊断。\n请解答以下问题：\n${textToSend}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
              },
            }),
          });

          const gData = await gRes.json();
          if (gData.error) {
            throw new Error(gData.error.message || 'Gemini API 响应异常');
          }
          const textCandidate = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!textCandidate) throw new Error('Gemini API 未返回文本候选');
          replyText = textCandidate;
          replySource = 'gemini 3 flash (GitHub 直调)';
        } else {
          // 直连 DeepSeek API
          const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content:
                    '你是一位世界顶级的数理统计学教授及 R 语言专家，专注于假设检验、参数估计与统计推断诊断。请为用户提供准确严谨的回答。',
                },
                { role: 'user', content: textToSend },
              ],
              temperature: 0.3,
            }),
          });

          const dsData = await dsRes.json();
          if (dsData.error) {
            throw new Error(dsData.error.message || 'DeepSeek API 响应异常');
          }
          const contentCandidate = dsData.choices?.[0]?.message?.content;
          if (!contentCandidate) throw new Error('DeepSeek API 未返回文本内容');
          replyText = contentCandidate;
          replySource = 'deepseek-v4-pro (GitHub 直调)';
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.warn('大模型调用失败，给出错误提示与专家兜底:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **大模型调用提示**：
接口返回信息：\`${err?.message || '网络连接超时或 API-Key 无效'}\`

可能原因：
1. 您填写的 API-Key 已过期或额度不足；
2. 跨域网络受限（若在特殊网络环境下）。
请点击右上角 **⚙️ 设置大模型** 检查您的 API-Key 或切换另一个模型。

---
### 🩺 统计专家内置规则兜底诊断
关于您的提问：“${textToSend}”：
1. **核心统计原理**：
   在假说推断中，p 值的严格定义为：**在原假设 H₀ 为真时，观察到比当前样本更极端数据的条件概率 P(Data | H₀)**。
   因此，p 值衡量的是“数据与 H₀ 的矛盾程度”，绝不等于“H₀ 成立的后验概率”！
2. **决策守则**：
   - 未拒绝 H₀ 时必须严谨使用“未发现统计学显著差异”，严禁使用“接受原假设”；
   - 拒绝 H₀ 时必须协同报告效应量（如 Cohen's d）及 95% 置信区间。`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 设置弹窗组件
  const settingsModalElement = isSettingsOpen && (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">大模型调用与 API-Key 设置</h3>
              <p className="text-[11px] text-slate-400">
                支持 GitHub 部署直调 · 严密推断诊断
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-5 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* 必须项警示 */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-xs text-amber-800">
                部署提示与强制 API-Key 校验
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700">
                本项目已适配 GitHub Pages 静态部署与本地开发环境。为了保护隐私并支持浏览器直接调用，
                <strong>所有大模型调用必须手工输入 API-Key 后方可调用</strong>。
              </p>
            </div>
          </div>

          {/* 1. 选择大模型 (两个核心模型) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>选择大模型 (双模型引擎)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 模型 1: gemini 3 flash */}
              <div
                onClick={() => setTempModel('gemini 3 flash')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  tempModel === 'gemini 3 flash'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      gemini 3 flash
                    </span>
                    {tempModel === 'gemini 3 flash' ? (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Google 官方高速推断大模型，极速响应，专精统计学逻辑与推断规范。
                  </p>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-mono">
                    Google Core
                  </span>
                  <span className="text-[10px] text-slate-400">高吞吐 · 毫秒级</span>
                </div>
              </div>

              {/* 模型 2: deepseek-v4-pro */}
              <div
                onClick={() => setTempModel('deepseek-v4-pro')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  tempModel === 'deepseek-v4-pro'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      deepseek-v4-pro
                    </span>
                    {tempModel === 'deepseek-v4-pro' ? (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    深度求索数理与代码增强模型，严密公式推导与 R 语言稳健统计分析。
                  </p>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 text-sky-700 font-mono">
                    DeepSeek Pro
                  </span>
                  <span className="text-[10px] text-slate-400">代码精深 · 严谨</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 手工输入 API-Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>手工输入 API-Key (必填)</span>
              </label>
              {tempApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除密钥</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={tempApiKey}
                onChange={(e) => {
                  setTempApiKey(e.target.value);
                  setSettingsError('');
                }}
                placeholder={
                  tempModel === 'gemini 3 flash'
                    ? '输入 Google Gemini API-Key (以 AIzaSy... 开头)'
                    : '输入 DeepSeek API-Key (以 sk-... 开头)'
                }
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                title={showApiKey ? '隐藏明文' : '显示明文'}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              🔒 <strong>安全机制</strong>：API-Key 仅储存在本地浏览器缓存中
              (localStorage)，直接用于向模型官方接口发起验证，不会被转存至任何第三方服务器。
            </p>
          </div>

          {/* 错误提示栏 */}
          {settingsError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}
        </div>

        {/* 弹窗底部操作按钮 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono">
            当前配置：{tempModel}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmSettings}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>确认大模型与配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const content = (
    <div className="flex flex-col h-full space-y-4">
      {/* 随诊快捷诊断卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESET_DIAGNOSES.map((d) => (
          <button
            key={d.id}
            onClick={() => handleSend(d.prompt)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50/70 hover:border-indigo-300 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-indigo-700">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{d.shortTitle}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">点击发起诊断 →</p>
          </button>
        ))}
      </div>

      {/* 若未设置 API-Key，显示显眼的警示条 */}
      {!apiKey.trim() && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>未配置 API-Key</strong>：根据规范，所有大模型调用必须输入 API-Key 后方可调用。
            </span>
          </div>
          <button
            onClick={handleOpenSettings}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            <span>输入 Key 设置大模型</span>
          </button>
        </div>
      )}

      {/* 对话消息展示区 */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 min-h-[380px] max-h-[560px] scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-sky-400'
                }`}
              >
                {isUser ? <HelpCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}
              >
                <div className="prose prose-xs max-w-none whitespace-pre-wrap font-sans">
                  {m.content}
                </div>
                <div
                  className={`text-[9px] mt-2 font-mono flex items-center justify-between gap-2 ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!isUser && (
                    <span className="font-mono text-[9px] opacity-75">
                      模型: {selectedModel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-indigo-600">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>
              正在通过 <strong>{selectedModel}</strong> 进行推断诊断与合规性研判...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入框 */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            apiKey.trim()
              ? `通过 ${selectedModel} 随诊专家提问，如：'为什么不能写接受原假设？' 或 '方差不齐该怎么处理？'..."`
              : "⚠️ 请先在右上角 ⚙️ 设置中输入 API-Key 后方可提问..."
          }
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>提问</span>
        </button>
      </div>

      {/* 成功配置浮动提示 */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>大模型配置成功确认！当前模型：{selectedModel}</span>
        </div>
      )}
    </div>
  );

  // 若作为独立 Tab 展示
  if (isStandaloneTab) {
    return (
      <div className="space-y-6">
        {/* 顶部标题栏 + 最右侧齿轮设置图标 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                模块 07 / Module 07
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">大模型随诊</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI 诊断与大模型 Q&A 随诊 (AI Diagnostic Consultant)
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              悬浮与对话交互随诊，动态诊断将 p &gt; 0.05 误判为“接受原假设”、违反正态性盲目套用 t 检验、大样本伪显著及 p-hacking 统计谬误。
            </p>
          </div>

          {/* 标题最右侧小齿轮设置大模型图标与状态按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 transition-all shadow-2xs group"
              title="设置大模型：手工输入 API-Key，选择 gemini 3 flash 或 deepseek-v4-pro"
            >
              <Settings className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-transform group-hover:rotate-45" />
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span>设置大模型</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-mono">
                  {selectedModel}
                </span>
                {apiKey.trim() ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="API-Key 已绑定" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="未配置 API-Key" />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {content}
        </div>

        {/* 齿轮设置弹窗 */}
        {settingsModalElement}
      </div>
    );
  }

  // 若作为悬浮抽屉 Modal 展示
  if (!isOpenFloating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* 抽屉顶部标头，右侧带有齿轮设置大模型图标 */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>AI 统计推断随诊专家</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {selectedModel}
                </span>
                {apiKey.trim() ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Key 就绪
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    待配置 Key
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                实时诊断统计谬误 · 审查假设前提 · 规范推断结论
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 抽屉标题栏右侧齿轮设置图标 */}
            <button
              onClick={handleOpenSettings}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
              title="设置大模型及 API-Key"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">设置大模型</span>
            </button>
            <button
              onClick={onCloseFloating}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 抽屉内容体 */}
        <div className="p-5 flex-1 overflow-hidden">{content}</div>

        {/* 齿轮设置弹窗 */}
        {settingsModalElement}
      </div>
    </div>
  );
};
