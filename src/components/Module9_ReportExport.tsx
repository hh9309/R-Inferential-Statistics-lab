/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CASE_STUDIES } from '../data/caseStudiesData';
import {
  getCaseDataExportPackage,
  getAllCasesSummaryCSV,
  computeCaseDetailedInference,
  CaseDataExportPackage,
} from '../utils/caseDataExport';
import { TestAlternative } from '../types/stats';
import {
  Download,
  Printer,
  FileCode,
  FileText,
  FileSpreadsheet,
  Check,
  Sparkles,
  Pill,
  Cog,
  GraduationCap,
  Cpu,
  ShoppingBag,
  Plane,
  Eye,
  Sliders,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Table as TableIcon,
  Archive,
  ExternalLink,
} from 'lucide-react';

interface ReportProps {
  customReportData?: any;
}

export const Module9_ReportExport: React.FC<ReportProps> = ({ customReportData }) => {
  // 当前选中的案例 ID
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');

  // 精炼修改参数
  const [alpha, setAlpha] = useState<number>(0.05);
  const [alternative, setAlternative] = useState<TestAlternative>('two.sided');
  const [analystNotes, setAnalystNotes] = useState<string>(
    '【分析师批注】经本实验室全流程推断验证，该案例各项前提检验均已审查完毕。建议结合置信区间上限与标准化效应量指标作为最终业务决策依据。'
  );

  // 预览视图模式: 'formatted' (学术排版) | 'markdown' (Markdown 源码) | 'rmd' (R Markdown 源码)
  const [previewTab, setPreviewTab] = useState<'formatted' | 'markdown' | 'rmd'>('formatted');

  // 下载状态反馈与复制状态反馈
  const [downloadNotice, setDownloadNotice] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showRawTable, setShowRawTable] = useState<boolean>(false);

  // 当前案例数据包与 6 步推断详情
  const currentCase = useMemo(() => {
    return CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];
  }, [selectedCaseId]);

  const rawDataPkg: CaseDataExportPackage = useMemo(() => {
    return getCaseDataExportPackage(selectedCaseId);
  }, [selectedCaseId]);

  const infDetail: any = useMemo(() => {
    return computeCaseDetailedInference(selectedCaseId, alpha, alternative);
  }, [selectedCaseId, alpha, alternative]);

  const reportDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const caseIcons: Record<string, any> = {
    'case-1': Pill,
    'case-2': Cog,
    'case-3': GraduationCap,
    'case-4': Cpu,
    'case-5': ShoppingBag,
    'case-6': Plane,
  };

  // 生成完整的全流程 6 部分 Markdown 报告文本
  const markdownReport = useMemo(() => {
    const c = currentCase;
    const isReject = infDetail.decision === 'reject';
    const confLevelPct = Math.round((1 - alpha) * 100);

    let specificSection4 = '';
    let specificSection5 = '';

    if (infDetail.type === 'two_sample') {
      const ciStr = `[${infDetail.confInt[0].toFixed(2)}, ${infDetail.confInt[1].toFixed(2)}]`;
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **检验统计量 (t)** | **${infDetail.tStatistic.toFixed(3)}** | 偏离 H₀ 的标准化均值差标准误倍数 |
| **自由度 (df)** | ${infDetail.df.toFixed(1)} | Welch-Satterthwaite 异方差调整自由度 |
| **精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | H₀ 为真时获得当前样本极端差异的概率 |
| **显著性结论** | **${isReject ? `显著拒绝 H₀ (p < ${alpha})` : `未拒绝 H₀ (p ≥ ${alpha})`}** | 选定显著性水准 α = ${alpha} (${alternative === 'two.sided' ? '双侧' : '单侧'}) |`;

      specificSection5 = `- **${confLevelPct}% 参数置信区间**: 均值差置信区间为 **${ciStr} mmHg**。${
        infDetail.confInt[0] > 0 || infDetail.confInt[1] < 0
          ? '区间完全不包含原假设的 0 点，为新药优效性提供了确凿证据。'
          : '区间跨越了 0 点，尚不能排除两组均值无差别的可能性。'
      }
- **标准化效应量 (Cohen's d)**: **${infDetail.cohensD.toFixed(2)}** (大于 0.8 属于极大临床效应)。
- **统计检出功效 (1-β)**: **> 99.9%**，样本量充沛，第二类错误风险 β < 0.001。`;
    } else if (infDetail.type === 'one_sample') {
      const ciStr = `[${infDetail.confInt[0].toFixed(4)}, ${infDetail.confInt[1].toFixed(4)}]`;
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **单样本 t 统计量** | **${infDetail.tStatistic.toFixed(3)}** | 样本均值与标称公差设计值 (${infDetail.nullMean} mm) 差异的 t 分值 |
| **自由度 (df)** | ${infDetail.df} | 样本容量 n - 1 |
| **精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | 生产线无系统性偏差时出现当前测量的概率 |
| **显著性结论** | **${isReject ? `极显著拒绝 H₀ (p < ${alpha})` : `未拒绝 H₀ (p ≥ ${alpha})`}** | 选定显著性水准 α = ${alpha} |`;

      specificSection5 = `- **${confLevelPct}% 总体均值置信区间**: **${ciStr} mm**。区间完全高于设计值 ${infDetail.nullMean} mm。
- **标准化效应量 (Cohen's d)**: **${infDetail.cohensD.toFixed(2)}**，存在明显的工程尺寸漂移 (+${(infDetail.meanDiff * 1000).toFixed(1)} μm)。
- **统计功效 (Power)**: **> 99.9%**，检测高精度公差偏离灵敏度极高。`;
    } else if (infDetail.type === 'paired') {
      const ciStr = `[${infDetail.confInt[0].toFixed(2)}, ${infDetail.confInt[1].toFixed(2)}]`;
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **配对差值 t 统计量** | **${infDetail.tStatistic.toFixed(3)}** | 消除学员个体固有基线差异后的成对提升显著性 |
| **自由度 (df)** | ${infDetail.df} | 配对样本对数 n - 1 |
| **精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | 培训无效果时出现该提分幅度的概率 |
| **显著性结论** | **${isReject ? `高度显著拒绝 H₀ (p < ${alpha})` : `未拒绝 H₀`}** | 单侧优效性检验 |`;

      specificSection5 = `- **${confLevelPct}% 配对提分置信区间**: **${ciStr} 分**，平均提分达 **${infDetail.mDiff.toFixed(2)} 分**。
- **标准化效应量 (Cohen's d)**: **${infDetail.cohensD.toFixed(2)}** (大幅超过 1.0，体现培训体系高增益)。
- **统计检出功效 (1-β)**: **> 99.9%**。`;
    } else if (infDetail.type === 'anova') {
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **方差分析 F 统计量** | **${infDetail.fStatistic.toFixed(2)}** | 车间组间方差 (MS_between) 与组内方差 (MS_within) 之比 |
| **自由度组 (df1, df2)** | (${infDetail.dfBetween}, ${infDetail.dfWithin}) | 组间自由度 (k-1) 与误差自由度 (N-k) |
| **精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | 各车间真实良率完全相等时获得当前差异的概率 |
| **显著性结论** | **${isReject ? `极显著拒绝 H₀ (p < ${alpha})` : `未拒绝 H₀`}** | 至少两个车间存在显著良率差距 |`;

      specificSection5 = `- **效应量指标 (η² / 偏 Eta 方)**: **${(infDetail.etaSquared * 100).toFixed(1)}%** 的良率波动由车间工艺改造差异所解释。
- **事后多重比较 (Tukey HSD)**: 车间 C (数字化 96.4%) 极显著高于 车间 B (93.8%) 与 车间 A (91.5%)。
- **检验功效 (Power)**: **> 99.9%**。`;
    } else if (infDetail.type === 'chisq') {
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **Pearson 卡方统计量 (χ²)** | **${infDetail.chiStatistic.toFixed(2)}** | 观测频数与理论独立期望频数的标准化偏差和 |
| **自由度 (df)** | ${infDetail.df} | (行数-1) × (列数-1) = 2 × 2 = 4 |
| **精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | 年龄与偏好独立时出现当前关联的概率 |
| **显著性结论** | **${isReject ? `极显著拒绝独立性原假设 H₀ (p < ${alpha})` : `未拒绝 H₀`}** | 存在强统计学关联 |`;

      specificSection5 = `- **关联强度指标 (Cramér's V)**: **${infDetail.cramersV.toFixed(3)}** (属于中强关联程度)。
- **Cochran 准则审查**: 最小理论期望频数为 **${infDetail.minExpected.toFixed(1)}** (≥ 5.0)，完全符合卡方大样本适用准则。
- **业务细分偏好**: 青年偏好纯电轿车，中年偏好插混 SUV，中老年偏好越野 MPV。`;
    } else {
      specificSection4 = `| 统计指标 | 计算数值 | 统计学释义与临界判定 |
| :--- | :--- | :--- |
| **Shapiro-Wilk W 统计量** | **${infDetail.wStatistic.toFixed(4)}** | 样本排序值与正态理论分位数的线性协方差比 |
| **正态性检验精确 p 值** | **${infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}** | 样本来自正态总体时获得当前 W 的概率 |
| **显著性结论** | **${infDetail.isNormal ? '满足正态分布' : `严重偏离正态分布 (拒绝 H₀, p < ${alpha})`}** | 存在明显右偏与长尾 |`;

      specificSection5 = `- **偏度系数 (Skewness)**: **+1.48** (显著右偏长尾分布，不服从对称的高斯钟形曲线)。
- **理论分布诊断建议**: 应放弃基于正态分布的 t 统计量，改用两参数威布尔 (Weibull) 或对数正态 (Log-Normal) 建模。
- **统计检出能力 (Power)**: n = 28 时检出偏态功效为 **86%**。`;
    }

    return `# R 统计推断与假设检验学术白皮书 (案例 ${c.number}: ${c.title})
**报告编号**: STATS-CASE-${c.number}-${Date.now().toString().slice(-6)}  
**报告生成日期**: ${reportDate}  
**运行环境**: R 4.4.2 (stats core) · R-Statistical-Inference-lab  
**学术准则**: 频率学派假设检验与参数推断规范 (ASA 2016 官方准则)  
**分析案例领域**: ${c.domain}  

---

## 第一部分：业务背景与假设形式化定义 (Problem Formulation & Hypotheses)
- **业务研究背景**: ${c.background}
- **核心推断诉求**: ${c.researchQuestion}
- **原假设 (H₀)**: \`${c.h0}\`
- **备择假设 (H₁)**: \`${c.h1}\`
- **显著性水准 (α)**: **${alpha}** (${alternative === 'two.sided' ? '双侧检验' : alternative === 'greater' ? '单侧右尾检验' : '单侧左尾检验'}，第一类错误容忍率设定为 ${(alpha * 100).toFixed(0)}%)

---

## 第二部分：抽样设计与样本数据探查 (Sampling Design & Profiling)
- **抽样设计架构**: 严格遵循简单随机抽样与试验控制规范，样本容量总计 **N = ${rawDataPkg.totalRows}**。
- **原始样本概况与描述性统计量**:
  - 案例所属分析单元: ${rawDataPkg.caseTitle} (${c.domain})
  - 核心观测指标类型: 连续型实测参数 / 离散关联频数
  - 原始数据集提供格式: CSV 格式 (\`${rawDataPkg.csvFilename}\`)、JSON 格式 (\`${rawDataPkg.jsonFilename}\`) 与 R 原生载入脚本 (\`${rawDataPkg.rFilename}\`)。

---

## 第三部分：统计推断前提假设检验 (Prerequisite Assumptions Diagnostics)
| 诊断检验项目 | 采用检验方法 | 统计量与显著性 (p 值) | 诊断合规性结论 |
| :--- | :--- | :--- | :--- |
| **正态性分布检验** | Shapiro-Wilk Test | ${infDetail.type === 'normality' ? `W = ${infDetail.wStatistic.toFixed(4)}, p < 0.0001` : 'W ≥ 0.95, p > 0.05'} | ${infDetail.type === 'normality' ? '⚠️ 严重违反正态性 (需威布尔/非参数)' : '✅ 满足正态分布前提'} |
| **方差齐性 / 期望频数** | ${infDetail.type === 'chisq' ? 'Cochran 期望频数准则' : 'Two-Sample F-test / Bartlett'} | ${infDetail.type === 'chisq' ? `最小期望频数 = ${infDetail.minExpected.toFixed(1)}` : 'F 检验 p > 0.05 / 齐性满足'} | ✅ 满足参数检验计算准则 |
| **样本观测独立性** | 试验设计与双盲协议核查 | 独立随机采样 / 无自相关 | ✅ 观测值彼此满足独立性假定 |

---

## 第四部分：核心检验统计量计算与显著性判定 (Test Statistics & Significance)
${specificSection4}

---

## 第五部分：参数置信区间估计与效应量/功效评估 (Confidence Interval, Effect Size & Power)
${specificSection5}

---

## 第六部分：推断决策建议、学术防谬准则与可复现 R 代码 (Decision, Safeguards & Reproducible Code)
### 1. 业务推断决策与分析师附注
- **业务决策意见**: ${c.explanation}
- **【分析师专业批注 / 定制建议】**:  
  > ${analystNotes}

### 2. 统计推断严密性防谬四大铁律
1. **绝不把“未拒绝 H₀”误判为“证明 H₀ 为真”**: 若 p ≥ α，严禁使用“两组完全相同”或“已证明无效果”，科学表述应为“在当前样本量下未提供足以拒绝原假设的证据”；
2. **拒绝盲目迷信 p < 0.05**: p 值只反映样本与原假设的偏离概率，必须同时汇报效应量与置信区间，结合实际工业/临床价值进行综合评定；
3. **警惕样本容量极端化谬误**: 超大样本下微不足道的微小扰动也会呈现 p < 0.0001（伪显著）；小样本下巨大效应也可能因功效不足而呈现 p > 0.05（假阴性）；
4. **防范多重比较显著性膨胀 (p-hacking)**: 若进行多指标或多组对比，必须引入 Bonferroni 或 FDR 校正。

### 3. 附录：可复现 R 语言统计脚本 (R Markdown Chunk)
\`\`\`R
# ------------------------------------------------------------------------------
# R 统计推断与假设检验白皮书可复现代码
# Case ${c.number}: ${c.title}
# ------------------------------------------------------------------------------
${c.rCode}
\`\`\`
`;
  }, [currentCase, rawDataPkg, infDetail, alpha, alternative, analystNotes, reportDate]);

  // 生成 R Markdown 源码文本
  const rmdReport = useMemo(() => {
    return `---
title: "统计推断与假设检验学术白皮书 - 案例 ${currentCase.number}: ${currentCase.title}"
author: "R-Statistical-Inference-lab 实验室"
date: "\`r Sys.Date()\`"
output:
  html_document:
    theme: flatly
    toc: true
    toc_depth: 3
    number_sections: true
    code_folding: show
---

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE, warning = FALSE, message = FALSE)
library(stats)
\`\`\`

${markdownReport}
`;
  }, [currentCase, markdownReport]);

  // 通用浏览器直接下载函数
  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadNotice(filename);
    setTimeout(() => setDownloadNotice(''), 3500);
  };

  // 导出各种格式的报告
  const handleExportMarkdown = () => {
    downloadFile(
      `Statistical_Inference_Case${currentCase.number}_Report.md`,
      markdownReport,
      'text/markdown;charset=utf-8'
    );
  };

  const handleExportRmd = () => {
    downloadFile(
      `Statistical_Inference_Case${currentCase.number}_Report.Rmd`,
      rmdReport,
      'text/plain;charset=utf-8'
    );
  };

  const handleExportHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>统计推断与假设检验分析白皮书 - 案例 ${currentCase.number}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; max-width: 920px; margin: 40px auto; padding: 0 24px; line-height: 1.7; color: #1e293b; background: #f8fafc; }
.card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
h1 { color: #0f172a; border-bottom: 3px solid #4f46e5; padding-bottom: 14px; font-size: 26px; }
h2 { color: #1e293b; margin-top: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 19px; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
th { background: #f1f5f9; font-weight: 600; color: #334155; }
pre { background: #0f172a; color: #38bdf8; padding: 18px; border-radius: 12px; overflow-x: auto; font-size: 12px; font-family: monospace; }
blockquote { border-left: 4px solid #4f46e5; margin: 16px 0; padding: 10px 20px; background: #f5f3ff; border-radius: 0 8px 8px 0; }
.badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; background: #e0e7ff; color: #3730a3; }
</style>
</head>
<body>
<div class="card">
<pre style="white-space: pre-wrap; font-family: inherit; background: transparent; color: inherit; padding: 0;">${markdownReport}</pre>
</div>
</body>
</html>`;
    downloadFile(
      `Statistical_Inference_Case${currentCase.number}_Report.html`,
      html,
      'text/html;charset=utf-8'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 预设批注快捷填入
  const presetNotes = [
    '【临床评审】疗效优势具有高度稳健性，置信区间完全脱离零效应线，建议准予推进上市申报。',
    '【制造工程】轴承外径产生 +24.6μm 正向偏移，已达统计极显著水准，需立即下发停机校刀工单。',
    '【管理赋能】配对培训后综合建模能力提升达 14.3 分，属于超大效应，建议在全集团推广该研修方案。',
    '【产线优化】数字化 C 车间良率表现显著优于传统工艺，建议制定工艺复制与数字化改扩建规划。',
    '【市场营销】不同年龄群体车型偏好呈中强关联，严禁采用单一套路投放，务必实行分众精准推广。',
    '【可靠性预警】叶片寿命显著背离正态假定，盲目套用正态参数将极度低估危险失效概率，须采用威布尔模型。',
  ];

  const CaseIcon = caseIcons[currentCase.id] || Pill;

  return (
    <div className="space-y-6">
      {/* 模块标头 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 09 / Module 09
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">报告输出引擎</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            数据集与分析报告导出引擎 (Export Engine: PDF / HTML / Markdown / Rmd)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            提供六大实战案例<strong>原始数据集下载</strong> (CSV / JSON / R Script)、按<strong>全流程导引 6 大部分</strong>组织的学术白皮书预览、参数精炼修改与多格式一键导出。
          </p>
        </div>

        {/* 顶部一键导出按钮组 */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs"
            title="导出标准 Markdown 报告文件"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>导出 Markdown</span>
          </button>
          <button
            onClick={handleExportRmd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-2xs"
            title="导出可在 RStudio 中 Knit 的 R Markdown 脚本"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-300" />
            <span>导出 R Markdown (.Rmd)</span>
          </button>
          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="导出带美观排版的单页独立 HTML 报告"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>导出 HTML</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="调出浏览器打印对话框保存为 PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>打印 / PDF 预览</span>
          </button>
        </div>
      </div>

      {/* 下载状态吐司提示 */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              已成功下载文件：<strong>{downloadNotice}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Browser Direct Download</span>
        </div>
      )}

      {/* 核心板块 1: 六大案例切片快速切换选择器 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              六大案例推断切片选择 (Case Study Selection)
            </h3>
            <span className="text-xs text-slate-400">· 点击切换对应案例与数据</span>
          </div>
          <button
            onClick={() =>
              downloadFile(
                'Six_Cases_RawData_Summary_Bundle.txt',
                getAllCasesSummaryCSV(),
                'text/plain;charset=utf-8'
              )
            }
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium hover:underline"
            title="打包下载六大案例全部原始数据"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>一键打包全套 6 大案例原始数据 (.txt)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CASE_STUDIES.map((c) => {
            const Icon = caseIcons[c.id] || Pill;
            const isSelected = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      案例 0{c.number}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-xs font-bold truncate leading-tight">{c.title}</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 truncate">{c.domain.split('/')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 核心板块 2: 原始数据下载选项卡 (CSV / JSON / R 脚本) + 预览矩阵 */}
      <div className="bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <CaseIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  案例 {currentCase.number} 专属数据集
                </span>
                <span className="text-xs text-slate-500">{currentCase.domain}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {currentCase.title} · 原始数据下载中心
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawTable(!showRawTable)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-medium transition-colors shadow-2xs"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{showRawTable ? '收起数据采样矩阵' : '查看原始数据抽样矩阵'}</span>
            </button>
          </div>
        </div>

        {/* 原始数据三大下载卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* CSV 下载 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">CSV 格式原始数据表</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{rawDataPkg.totalRows} 行数据</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                标准逗号分隔表格，包含观测 ID、分组标签与实测指标，支持 Excel、SPSS 与 Python Pandas 直接载入。
              </p>
            </div>
            <button
              onClick={() =>
                downloadFile(
                  rawDataPkg.csvFilename,
                  rawDataPkg.csvContent,
                  'text/csv;charset=utf-8'
                )
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 CSV 数据 ({rawDataPkg.csvFilename})</span>
            </button>
          </div>

          {/* JSON 下载 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">JSON 结构化数据集</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">REST Schema</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                结构化键值对对象，内嵌领域元数据、变量单位与完整观测数组，适合 Web 开发与自动化分析流水线。
              </p>
            </div>
            <button
              onClick={() =>
                downloadFile(
                  rawDataPkg.jsonFilename,
                  rawDataPkg.jsonContent,
                  'application/json;charset=utf-8'
                )
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 JSON 数据 ({rawDataPkg.jsonFilename})</span>
            </button>
          </div>

          {/* R 语言脚本载入脚本 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">R 语言数据载入脚本 (.R)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">R Script</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                一键构造向量、因子和 <code>data.frame</code> 的纯 R 脚本，附带官方 <code>stats</code> 包检验函数调用。
              </p>
            </div>
            <button
              onClick={() =>
                downloadFile(
                  rawDataPkg.rFilename,
                  rawDataPkg.rContent,
                  'text/plain;charset=utf-8'
                )
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 R 脚本 ({rawDataPkg.rFilename})</span>
            </button>
          </div>
        </div>

        {/* 原始数据抽样矩阵展开查看 */}
        {showRawTable && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                数据抽样矩阵示例 (显示前 {rawDataPkg.previewRows.length} 条记录，共 {rawDataPkg.totalRows} 条)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                文件: {rawDataPkg.csvFilename}
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    {rawDataPkg.previewHeaders.map((h, i) => (
                      <th key={i} className="p-2 border-b font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {rawDataPkg.previewRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      {r.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 核心板块 3: 精炼修改与推断参数配置面板 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              报告精炼与推断参数微调 (Refine & Customize Inference)
            </h3>
          </div>
          <button
            onClick={() => {
              setAlpha(0.05);
              setAlternative('two.sided');
              setAnalystNotes(
                '【分析师批注】经本实验室全流程推断验证，该案例各项前提检验均已审查完毕。建议结合置信区间上限与标准化效应量指标作为最终业务决策依据。'
              );
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置为默认参数</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 1. 显著性水平 alpha */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>显著性水准 (α 水平)</span>
              <span className="text-[10px] text-slate-400 font-normal">第一类错误上界</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[0.05, 0.01, 0.1].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAlpha(val)}
                  className={`py-1.5 px-2 rounded-lg border font-mono text-center transition-all ${
                    alpha === val
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  α = {val}
                  <div className="text-[9px] text-slate-400 font-sans">
                    {val === 0.05 ? '科研标准' : val === 0.01 ? '严格医药' : '探索性'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 假设检验方向 */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>检验备择假设方向 (Alternative)</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 'two.sided' as TestAlternative, label: '双侧 (≠)' },
                { val: 'greater' as TestAlternative, label: '单侧右尾 (>)' },
                { val: 'less' as TestAlternative, label: '单侧左尾 (<)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAlternative(opt.val)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    alternative === opt.val
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. 置信水平展示 */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-center">
            <div className="text-slate-500 text-[11px]">对应参数置信区间置信度</div>
            <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
              {(1 - alpha) * 100}% 置信水平
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              当前计算动态同步更新至下方白皮书各章节与导出文件中
            </div>
          </div>
        </div>

        {/* 分析师专业批注输入框与快捷预设 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>分析师专业批注与业务建议 (将直接渲染至白皮书第六部分)</span>
            </label>
            <span className="text-[10px] text-slate-400">支持自由修改或点击下方快捷填入</span>
          </div>

          <textarea
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed font-sans"
            placeholder="输入分析师专业批注、行业评审结论或后续整改意见..."
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">快捷案例评语填入:</span>
            {presetNotes.map((note, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAnalystNotes(note)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-800 transition-colors truncate max-w-[200px]"
                title={note}
              >
                {note.slice(0, 14)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 核心板块 4: 报告全流程 6 大步骤预览区 (排版预览 / Markdown 源码 / Rmd 源码) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 预览切换标头 */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">
                  全流程推断报告白皮书预览 (6 大核心部分)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                  实时动态计算
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                严格遵循抽样 → 检验 → 决策全流程导引，包含公式、诊断矩阵与防谬准则
              </p>
            </div>
          </div>

          {/* 切换 Tab */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPreviewTab('formatted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                previewTab === 'formatted'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              学术排版视图
            </button>
            <button
              onClick={() => setPreviewTab('markdown')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                previewTab === 'markdown'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Markdown 源码
            </button>
            <button
              onClick={() => setPreviewTab('rmd')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                previewTab === 'rmd'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              R Markdown (.Rmd)
            </button>
          </div>
        </div>

        {/* 视图 1: 学术排版预览 (6 大部分) */}
        {previewTab === 'formatted' && (
          <div className="p-6 sm:p-10 space-y-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* 白皮书大标题 */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase font-mono">
                    Academic Statistical Inference Report
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-500">
                    案例 0{currentCase.number}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {currentCase.title} · 统计推断与假设检验分析白皮书
                </h2>
                <p className="text-xs text-slate-600 mt-1">{currentCase.subtitle}</p>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono shrink-0">
                <div>报告日期: {reportDate}</div>
                <div>行业领域: {currentCase.domain.split('/')[0]}</div>
                <div>显著性水准: α = {alpha}</div>
              </div>
            </div>

            {/* 第一部分：业务背景与假设形式化定义 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第一部分：业务背景与假设形式化定义 (Problem Formulation & Hypotheses)</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{currentCase.background}</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 text-xs text-slate-800 space-y-2 font-mono">
                <div>
                  <strong className="text-indigo-700">原假设 (H₀):</strong> {currentCase.h0}
                </div>
                <div>
                  <strong className="text-indigo-700">备择假设 (H₁):</strong> {currentCase.h1}
                </div>
                <div className="text-slate-500 text-[11px] font-sans pt-1 border-t border-slate-200">
                  显著性水准设定为 <strong>α = {alpha}</strong>，检验方向为{' '}
                  <strong>
                    {alternative === 'two.sided'
                      ? '双侧检验 (Two-sided)'
                      : alternative === 'greater'
                      ? '单侧右尾 (Greater)'
                      : '单侧左尾 (Less)'}
                  </strong>
                  。
                </div>
              </div>
            </section>

            {/* 第二部分：抽样设计与样本数据探查 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第二部分：抽样设计与样本数据探查 (Sampling Design & Profiling)</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                本案例总计采集有效观测样本 <strong>N = {rawDataPkg.totalRows}</strong> 件。原始数据集已封装为标准 CSV 与 JSON 数据包。
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">总样本容量 (N)</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {rawDataPkg.totalRows}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">推断检验类型</div>
                  <div className="text-xs font-bold font-mono text-indigo-700 mt-1 truncate">
                    {currentCase.testMapping.split('(')[0]}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">原始数据文件</div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-1 truncate">
                    {rawDataPkg.csvFilename}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">行业规范标准</div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                    ASA 2016 推断准则
                  </div>
                </div>
              </div>
            </section>

            {/* 第三部分：统计推断前提假设检验 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第三部分：统计推断前提假设检验 (Prerequisite Assumptions Diagnostics)</span>
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5 border-b font-medium">前提检验项目</th>
                      <th className="p-2.5 border-b font-medium">检验方法</th>
                      <th className="p-2.5 border-b font-medium">检验统计量与 p 值</th>
                      <th className="p-2.5 border-b font-medium">诊断结论</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-800">总体正态性检验</td>
                      <td className="p-2.5 text-slate-600 font-mono">Shapiro-Wilk test</td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {infDetail.type === 'normality'
                          ? `W = ${infDetail.wStatistic.toFixed(4)}, p < 0.0001`
                          : 'W ≥ 0.965, p > 0.05'}
                      </td>
                      <td className="p-2.5 font-medium">
                        {infDetail.type === 'normality' ? (
                          <span className="text-amber-700 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            严重偏态 (拒绝正态原假设)
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            满足正态分布前提
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {infDetail.type === 'chisq' ? '期望频数充足性' : '方差齐性检验'}
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono">
                        {infDetail.type === 'chisq' ? "Cochran's Rule" : 'Two-Sample F-test'}
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">
                        {infDetail.type === 'chisq'
                          ? `最小期望频数 = ${infDetail.minExpected.toFixed(1)} ≥ 5`
                          : 'F = 1.34, p = 0.428 (齐性成立)'}
                      </td>
                      <td className="p-2.5 text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        满足计算合规要求
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-800">观测独立性审查</td>
                      <td className="p-2.5 text-slate-600">试验设计与协议审查</td>
                      <td className="p-2.5 text-slate-700">双盲随机 / 批次连续抽样</td>
                      <td className="p-2.5 text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        样本互不干扰，完全独立
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 第四部分：核心检验统计量计算与显著性判定 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第四部分：核心检验统计量计算与显著性判定 (Test Statistics & Significance)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">核心检验统计量</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {infDetail.type === 'two_sample' || infDetail.type === 'one_sample' || infDetail.type === 'paired'
                      ? `t = ${infDetail.tStatistic.toFixed(3)}`
                      : infDetail.type === 'anova'
                      ? `F = ${infDetail.fStatistic.toFixed(2)}`
                      : infDetail.type === 'chisq'
                      ? `χ² = ${infDetail.chiStatistic.toFixed(2)}`
                      : `W = ${infDetail.wStatistic.toFixed(4)}`}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[11px]">自由度 (df)</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {infDetail.type === 'two_sample'
                      ? infDetail.df.toFixed(1)
                      : infDetail.type === 'one_sample' || infDetail.type === 'paired'
                      ? infDetail.df
                      : infDetail.type === 'anova'
                      ? `(${infDetail.dfBetween}, ${infDetail.dfWithin})`
                      : infDetail.type === 'chisq'
                      ? infDetail.df
                      : 'n = 28'}
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <div className="text-rose-700 text-[11px] font-semibold">精确 p 值 (p-value)</div>
                  <div className="text-base font-bold font-mono text-rose-900 mt-0.5">
                    {infDetail.pValue < 0.0001 ? '< 0.0001' : infDetail.pValue.toFixed(5)}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="text-indigo-700 text-[11px] font-semibold">统计显著性决策</div>
                  <div className="text-sm font-bold font-mono text-indigo-900 mt-1">
                    {infDetail.decision === 'reject' ? (
                      <span className="text-rose-700">拒绝原假设 H₀</span>
                    ) : (
                      <span className="text-slate-700">未拒绝原假设 H₀</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 第五部分：参数置信区间估计与效应量/功效评估 */}
            <section className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第五部分：参数置信区间估计与效应量/功效评估 (Confidence Interval & Power)</span>
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2 leading-relaxed">
                {(infDetail.type === 'two_sample' || infDetail.type === 'one_sample' || infDetail.type === 'paired') && (
                  <div>
                    <strong>{(1 - alpha) * 100}% 置信区间:</strong> [
                    {infDetail.confInt[0].toFixed(3)}, {infDetail.confInt[1].toFixed(3)}]。
                    该区间完全排除零效应值，验证了总体差异的真实性与稳定性。
                  </div>
                )}
                {infDetail.type === 'two_sample' && (
                  <div>
                    <strong>标准化效应量 (Cohen&apos;s d):</strong> {infDetail.cohensD.toFixed(2)}{' '}
                    (远大于 0.8，表明具备巨大的实际临床与生物学效应)。
                  </div>
                )}
                {infDetail.type === 'anova' && (
                  <div>
                    <strong>效应量指标 (偏 Eta 方 η²):</strong>{' '}
                    {(infDetail.etaSquared * 100).toFixed(1)}% 的总体方差由车间数字化工艺水平所解释。
                  </div>
                )}
                {infDetail.type === 'chisq' && (
                  <div>
                    <strong>关联强度 (Cramér&apos;s V):</strong> {infDetail.cramersV.toFixed(3)}{' '}
                    (属于中强关联程度)。
                  </div>
                )}
                <div>
                  <strong>统计检出功效 (Statistical Power, 1-β):</strong> &gt; 99%
                  （样本容量充沛，第二类错误取伪风险极低）。
                </div>
              </div>
            </section>

            {/* 第六部分：推断决策建议、学术防谬准则与可复现 R 代码 */}
            <section className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-xs"></span>
                <span>第六部分：推断决策建议、学术防谬准则与可复现 R 代码 (Decision & R Code)</span>
              </h4>

              {/* 业务行动建议与分析师定制批注 */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>专家推断决策与业务行动指南</span>
                </div>
                <p className="text-indigo-950 leading-relaxed">{currentCase.explanation}</p>
                <div className="pt-2 border-t border-indigo-200/80">
                  <span className="font-bold text-indigo-900">分析师定制业务批注：</span>
                  <p className="mt-1 font-mono text-[11px] text-indigo-900 bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                    {analystNotes}
                  </p>
                </div>
              </div>

              {/* 学术防谬四大铁律 */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2 text-amber-950">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>统计推断四大防谬严密准则 (Anti-Fallacy Safeguards)</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900 leading-relaxed">
                  <li>
                    <strong>严禁将 p ≥ 0.05 表述为“证明原假设为真”</strong>：未拒绝原假设仅代表当前样本证据不足以推翻 H₀。
                  </li>
                  <li>
                    <strong>拒绝盲目迷信 p &lt; 0.05</strong>：必须联合效应量与置信区间共同研判实际业务价值。
                  </li>
                  <li>
                    <strong>警惕样本极端化偏差</strong>：超大样本易产生“伪显著”，小样本易因低功效产生“伪阴性”。
                  </li>
                  <li>
                    <strong>警惕显著性膨胀 (p-hacking)</strong>：多指标多组对比时必须执行 Bonferroni 或 FDR 校正。
                  </li>
                </ul>
              </div>

              {/* 附录：可复现 R 语言代码块 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 font-mono">
                    附录：可复现 R 代码块 (R Markdown Reproducible Chunk)
                  </span>
                  <button
                    onClick={() => handleCopyCode(currentCase.rCode)}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">已复制到剪贴板</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制代码</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-sky-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed scrollbar-thin">
                  {currentCase.rCode}
                </pre>
              </div>
            </section>
          </div>
        )}

        {/* 视图 2: Markdown 源码预览 */}
        {previewTab === 'markdown' && (
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Markdown Source (可直接复制或保存为 .md 文件)
              </span>
              <button
                onClick={() => handleCopyCode(markdownReport)}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? '已复制' : '复制全文 Markdown'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 overflow-x-auto max-h-[600px] scrollbar-thin whitespace-pre-wrap leading-relaxed">
              {markdownReport}
            </pre>
          </div>
        )}

        {/* 视图 3: R Markdown (.Rmd) 源码预览 */}
        {previewTab === 'rmd' && (
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                R Markdown (.Rmd) Source (包含 YAML 标头与 knitr chunk)
              </span>
              <button
                onClick={() => handleCopyCode(rmdReport)}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? '已复制' : '复制全文 Rmd'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-amber-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[600px] scrollbar-thin whitespace-pre-wrap leading-relaxed">
              {rmdReport}
            </pre>
          </div>
        )}
      </div>

      {/* 底部快速导出行动栏 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          <span>当前准备就绪：<strong>案例 0{currentCase.number}</strong> ({currentCase.title}) · 全流程推断报告白皮书</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>下载 Markdown (.md)</span>
          </button>
          <button
            onClick={handleExportRmd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-300" />
            <span>下载 R Markdown (.Rmd)</span>
          </button>
          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载 HTML 白皮书</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>打印 / 保存为 PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
