import React, { useState, useMemo } from 'react';
import { CASE_STUDIES } from '../data/caseStudiesData';
import {
  twoSampleTTest,
  oneSampleTTest,
  pairedTTest,
  oneWayAnova,
  chiSquareTest,
  shapiroWilkTest,
  generateQQPlotData,
  mean,
  sd,
} from '../utils/mathStats';
import {
  TwoSampleTResult,
  OneSampleTResult,
  PairedTResult,
  ANOVAResult,
  ChiSquareResult,
  ShapiroWilkResult,
  QQPoint,
} from '../types/stats';
import {
  Pill,
  Cog,
  GraduationCap,
  Cpu,
  ShoppingBag,
  Plane,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart,
  Table,
} from 'lucide-react';

interface Module5Props {
  onLoadIntoREngine?: (code: string) => void;
}

type CaseAnalysisResult =
  | { type: 'two_sample'; res: TwoSampleTResult; m1: number; m2: number; s1: number; s2: number }
  | { type: 'one_sample'; res: OneSampleTResult; m: number; s: number }
  | { type: 'paired'; res: PairedTResult; m1: number; m2: number }
  | { type: 'anova'; res: ANOVAResult }
  | { type: 'chisq'; res: ChiSquareResult }
  | { type: 'normality'; res: ShapiroWilkResult; qq: { points: QQPoint[]; slope: number; intercept: number }; m: number; s: number };

export const Module5_CaseStudies: React.FC<Module5Props> = ({ onLoadIntoREngine }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currentCase = useMemo(() => {
    return CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];
  }, [selectedCaseId]);

  // 根据当前案例类型动态执行计算
  const analysisResult = useMemo((): CaseAnalysisResult => {
    const d = currentCase.data;
    if (d.type === 'two_sample') {
      return {
        type: 'two_sample',
        res: twoSampleTTest(d.group1, d.group2, false, 'two.sided', 0.95),
        m1: mean(d.group1),
        m2: mean(d.group2),
        s1: sd(d.group1, true),
        s2: sd(d.group2, true),
      };
    } else if (d.type === 'one_sample') {
      return {
        type: 'one_sample',
        res: oneSampleTTest(d.sample, d.nullMean, 'two.sided', 0.95),
        m: mean(d.sample),
        s: sd(d.sample, true),
      };
    } else if (d.type === 'paired') {
      return {
        type: 'paired',
        res: pairedTTest(d.data2, d.data1, 'greater', 0.95), // after - before
        m1: mean(d.data1),
        m2: mean(d.data2),
      };
    } else if (d.type === 'anova') {
      return {
        type: 'anova',
        res: oneWayAnova(d.groups),
      };
    } else if (d.type === 'chisq') {
      return {
        type: 'chisq',
        res: chiSquareTest(d.observed, d.rowNames, d.colNames),
      };
    } else {
      // normality
      return {
        type: 'normality',
        res: shapiroWilkTest(d.sample),
        qq: generateQQPlotData(d.sample),
        m: mean(d.sample),
        s: sd(d.sample, true),
      };
    }
  }, [currentCase]);

  const caseIcons: Record<string, any> = {
    'case-1': Pill,
    'case-2': Cog,
    'case-3': GraduationCap,
    'case-4': Cpu,
    'case-5': ShoppingBag,
    'case-6': Plane,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCase.rCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 模块顶部 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 05 / Module 05
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">领域推断实战</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            六大统计推断实战案例库 (Real-World Case Studies)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            覆盖医药临床、工业制造、教育培训、半导体封测、市场调研与可靠性工程六大真实推断场景，深入剖析假设设定、数据探索与业务决策全流程。
          </p>
        </div>
      </div>

      {/* 六大案例卡片选择栏 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CASE_STUDIES.map((c) => {
          const Icon = caseIcons[c.id] || Pill;
          const isSelected = selectedCaseId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  案例 {c.number}
                </span>
              </div>
              <div className="text-xs font-bold leading-tight line-clamp-1">{c.title}</div>
              <div
                className={`text-[10px] mt-1 line-clamp-1 ${
                  isSelected ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {c.testMapping.split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 案例主体内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：案例背景、研究问题与假设 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                {currentCase.domain}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentCase.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{currentCase.subtitle}</p>
            </div>

            {/* 映射检验类型 */}
            <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-900">推断方法映射：</span>
              <span className="text-xs font-bold font-mono text-indigo-700">
                {currentCase.testMapping}
              </span>
            </div>

            {/* 业务背景 */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">【实际业务背景】</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {currentCase.background}
              </p>
            </div>

            {/* 科学研究问题与假设 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">【形式化研究假设】</h4>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="text-rose-300">{currentCase.h0}</div>
                <div className="text-emerald-300">{currentCase.h1}</div>
              </div>
            </div>

            {/* 业务与统计决策结论 */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">【统计推断专家决策解读】</h4>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 leading-relaxed">
                {currentCase.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：统计分析结果与可视化图表看板 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>实战数据统计量计算与决策看板</span>
              </h4>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-semibold">
                α = {currentCase.defaultAlpha}
              </span>
            </div>

            {/* Case 1: 新药双样本展示 */}
            {analysisResult.type === 'two_sample' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">新药组均值 x̄₁</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.m1.toFixed(2)} mmHg
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">安慰剂组均值 x̄₂</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.m2.toFixed(2)} mmHg
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-[11px] text-indigo-700 font-medium">Welch t 统计量</div>
                    <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
                      t = {analysisResult.res.statistic.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="text-[11px] text-rose-700 font-medium">显著性 p 值</div>
                    <div className="text-base font-bold font-mono text-rose-900 mt-0.5">
                      p &lt; 0.0001
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-slate-600">
                    均值差 95% 置信区间 [x̄₁ - x̄₂]:
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    [{analysisResult.res.confInt[0].toFixed(2)}, {analysisResult.res.confInt[1].toFixed(2)}] mmHg
                  </span>
                  <span className="text-slate-600">
                    效应量 Cohen&apos;s d: <strong className="text-indigo-700 font-mono">{analysisResult.res.cohensD.toFixed(2)} (超大效应)</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Case 2: 零件加工单样本 */}
            {analysisResult.type === 'one_sample' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">样本实测均值 x̄</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.m.toFixed(4)} mm
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">目标公差基准 μ₀</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      25.0000 mm
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-[11px] text-indigo-700 font-medium">t 统计量 (df=34)</div>
                    <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
                      t = {analysisResult.res.statistic.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="text-[11px] text-rose-700 font-medium">显著性 p 值</div>
                    <div className="text-base font-bold font-mono text-rose-900 mt-0.5">
                      p &lt; 0.0001
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  系统性尺寸偏移判定：95% 置信区间为{' '}
                  <span className="font-mono font-bold text-rose-600">
                    [{analysisResult.res.confInt[0].toFixed(4)}, {analysisResult.res.confInt[1].toFixed(4)}] mm
                  </span>
                  ，整个区间完全位于 25.000 mm 上方，证实设备存在 +24.6 μm 系统性正向偏差，必须立即调整刀补。
                </div>
              </div>
            )}

            {/* Case 3: 教育培训前后成绩配对 */}
            {analysisResult.type === 'paired' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">培训前均分 (Before)</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.m1.toFixed(1)} 分
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500">培训后均分 (After)</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.m2.toFixed(1)} 分
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-emerald-700 font-medium">平均提分 (增量)</div>
                    <div className="text-base font-bold font-mono text-emerald-900 mt-0.5">
                      +{analysisResult.res.meanDiff.toFixed(2)} 分
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-[11px] text-indigo-700 font-medium">配对 t 统计量</div>
                    <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
                      t = {analysisResult.res.statistic.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  配对消除个体差异结论：单侧检验 p &lt; 0.0001，效应量 Cohen&apos;s d = {analysisResult.res.cohensD.toFixed(2)}，能力提升幅度极显著。
                </div>
              </div>
            )}

            {/* Case 4: 多车间方差分析 (ANOVA) */}
            {analysisResult.type === 'anova' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {analysisResult.res.groups.map((g) => (
                    <div key={g.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-medium">{g.name}</div>
                      <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {g.mean.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">标准差 s = {g.sd.toFixed(2)}%</div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1 font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-400">
                    <span>ANOVA 方差分解表</span>
                    <span>Df, SS, MS, F-value, Pr(&gt;F)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>组间 (Between Workshops):</span>
                    <span className="text-sky-300">
                      SS = {analysisResult.res.ssBetween.toFixed(2)}, F = {analysisResult.res.fStatistic.toFixed(2)}, p &lt; 0.0001
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>效应量 η² (Eta-Squared):</span>
                    <span className="text-emerald-400 font-bold">
                      {(analysisResult.res.etaSquared * 100).toFixed(1)}% (极其显著)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Case 5: 消费者偏好卡方检验 */}
            {analysisResult.type === 'chisq' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5 border-b">年龄段 \ 车型偏好</th>
                        {analysisResult.res.colNames.map((col) => (
                          <th key={col} className="p-2.5 border-b text-center">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.res.observed.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b last:border-b-0 hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">
                            {analysisResult.res.rowNames[rIdx]}
                          </td>
                          {row.map((obs, cIdx) => (
                            <td key={cIdx} className="p-2.5 text-center font-mono">
                              <span className="font-bold text-indigo-700">{obs}</span>
                              <span className="text-[10px] text-slate-400 block">
                                (期望: {analysisResult.res.expected[rIdx][cIdx].toFixed(1)})
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500">卡方统计量 χ²</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {analysisResult.res.statistic.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500">自由度 df</div>
                    <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      df = {analysisResult.res.df}
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-indigo-700 font-medium">Cramér&apos;s V 关联系数</div>
                    <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
                      {analysisResult.res.cramersV.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 6: 寿命分布正态性诊断 */}
            {analysisResult.type === 'normality' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500">Shapiro-Wilk W</div>
                    <div className="text-base font-bold font-mono text-rose-700 mt-0.5">
                      W = {analysisResult.res.wStatistic.toFixed(4)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="text-rose-700 font-medium">p-value (正态检验)</div>
                    <div className="text-base font-bold font-mono text-rose-900 mt-0.5">
                      p &lt; 0.0001
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-500">正态假设决策</div>
                    <div className="text-xs font-bold text-rose-600 mt-1">
                      强烈违反正态性 (右偏)
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-950 leading-relaxed">
                  ⚠️ <strong>工程安全警告：</strong>叶片寿命数据严重偏离正态，属于威布尔寿命分布。若盲目使用正态分布推算 3σ 质保下限，将低估早期断裂概率，引发严重飞行事故！
                </div>
              </div>
            )}

            {/* R 语言复现代码展示与一键运行联动 */}
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>R 语言标准可复现脚本 (stats package)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                    >
                      {copiedCode ? '已复制 ✓' : '复制 R 代码'}
                    </button>
                    {onLoadIntoREngine && (
                      <button
                        onClick={() => onLoadIntoREngine(currentCase.rCode)}
                        className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] transition-colors font-medium"
                      >
                        载入 R 引擎执行 →
                      </button>
                    )}
                  </div>
                </div>
                <pre className="text-sky-200 text-[11px] leading-relaxed overflow-x-auto max-h-48 scrollbar-thin">
                  {currentCase.rCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
