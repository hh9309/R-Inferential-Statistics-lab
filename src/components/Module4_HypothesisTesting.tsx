import React, { useState, useMemo } from 'react';
import {
  oneSampleTTest,
  twoSampleTTest,
  pairedTTest,
  fVarianceTest,
  shapiroWilkTest,
  generateQQPlotData,
  tPdf,
  tInv,
} from '../utils/mathStats';
import { TestAlternative } from '../types/stats';
import {
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

type TestMode = 'one_sample' | 'two_sample' | 'paired' | 'f_var' | 'shapiro';

export const Module4_HypothesisTesting: React.FC = () => {
  const [testMode, setTestMode] = useState<TestMode>('two_sample');
  const [alternative, setAlternative] = useState<TestAlternative>('two.sided');
  const [alpha, setAlpha] = useState<number>(0.05);
  const [nullMu, setNullMu] = useState<number>(25.0);
  const [varEqual, setVarEqual] = useState<boolean>(false);

  // 样本数据输入字符串
  const [inputData1, setInputData1] = useState<string>(
    '14.2, 16.5, 12.8, 18.1, 15.4, 20.2, 13.9, 17.6, 19.1, 14.8, 16.9, 21.4, 15.1, 18.7, 13.3, 17.0, 19.8, 16.2'
  );
  const [inputData2, setInputData2] = useState<string>(
    '6.5, 8.2, 4.9, 9.1, 7.3, 5.8, 10.2, 6.7, 8.8, 7.1, 5.4, 9.6, 6.0, 8.3, 7.7, 11.0, 6.9, 5.1'
  );

  // 解析数组
  const parsed1 = useMemo(() => {
    return inputData1
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }, [inputData1]);

  const parsed2 = useMemo(() => {
    return inputData2
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }, [inputData2]);

  // 执行检验计算
  const testResult = useMemo(() => {
    if (parsed1.length < 2) return null;

    if (testMode === 'one_sample') {
      return {
        type: 'one_sample' as const,
        res: oneSampleTTest(parsed1, nullMu, alternative, 1 - alpha),
      };
    } else if (testMode === 'two_sample') {
      if (parsed2.length < 2) return null;
      return {
        type: 'two_sample' as const,
        res: twoSampleTTest(parsed1, parsed2, varEqual, alternative, 1 - alpha),
      };
    } else if (testMode === 'paired') {
      if (parsed2.length < 2) return null;
      return {
        type: 'paired' as const,
        res: pairedTTest(parsed1, parsed2, alternative, 1 - alpha),
      };
    } else if (testMode === 'f_var') {
      if (parsed2.length < 2) return null;
      return {
        type: 'f_var' as const,
        res: fVarianceTest(parsed1, parsed2, 1 - alpha),
      };
    } else {
      // shapiro
      const sw = shapiroWilkTest(parsed1);
      const qq = generateQQPlotData(parsed1);
      return {
        type: 'shapiro' as const,
        res: sw,
        qq,
      };
    }
  }, [testMode, parsed1, parsed2, nullMu, alternative, alpha, varEqual]);

  // 预设数据快捷载入
  const loadPreset = (preset: 'treatment' | 'manufacturing' | 'education') => {
    if (preset === 'treatment') {
      setTestMode('two_sample');
      setInputData1(
        '14.2, 16.5, 12.8, 18.1, 15.4, 20.2, 13.9, 17.6, 19.1, 14.8, 16.9, 21.4, 15.1, 18.7, 13.3'
      );
      setInputData2(
        '6.5, 8.2, 4.9, 9.1, 7.3, 5.8, 10.2, 6.7, 8.8, 7.1, 5.4, 9.6, 6.0, 8.3, 7.7'
      );
      setVarEqual(false);
      setAlternative('two.sided');
    } else if (preset === 'manufacturing') {
      setTestMode('one_sample');
      setNullMu(25.0);
      setInputData1(
        '25.021, 25.018, 25.034, 25.012, 25.029, 25.025, 25.019, 25.031, 25.022, 25.017, 25.028, 25.033, 25.015, 25.026'
      );
      setAlternative('two.sided');
    } else {
      setTestMode('paired');
      setInputData1('62, 58, 71, 65, 54, 76, 68, 60, 74, 59, 63, 70, 56, 67, 72');
      setInputData2('78, 72, 85, 79, 69, 88, 80, 75, 87, 73, 77, 84, 71, 81, 86');
      setAlternative('greater');
    }
  };

  return (
    <div className="space-y-6">
      {/* 模块顶部 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 04 / Module 04
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">经典参数与假设检验</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            单双样本、配对检验与方差齐性 (Parametric Tests & Assumptions)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            集成单样本 t 检验、两样本独立 t (Student vs Welch)、配对 t 检验、方差齐性 F 检验与 Shapiro-Wilk 正态性检验，输出统计量、精确 p 值、拒绝域与效应量评估。
          </p>
        </div>

        {/* 预设快速载入按钮 */}
        <div className="flex items-center gap-1.5 flex-wrap self-start md:self-auto">
          <span className="text-xs text-slate-400 mr-1">快速预设:</span>
          <button
            onClick={() => loadPreset('treatment')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            新药双样本
          </button>
          <button
            onClick={() => loadPreset('manufacturing')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            零件单样本
          </button>
          <button
            onClick={() => loadPreset('education')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            培训配对
          </button>
        </div>
      </div>

      {/* 检验方法导航条 */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'two_sample', name: '两独立样本 t 检验 (Student / Welch)' },
            { id: 'one_sample', name: '单样本 t 检验 (One-Sample t)' },
            { id: 'paired', name: '配对样本 t 检验 (Paired t)' },
            { id: 'f_var', name: '方差齐性 F 检验 (Two-Sample F)' },
            { id: 'shapiro', name: 'Shapiro-Wilk 正态性诊断' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setTestMode(item.id)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              testMode === item.id
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：输入与参数配置 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>实验样本数据录入</span>
              <span className="text-xs text-slate-400 font-mono">Input Data</span>
            </h3>

            {/* 样本 1 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">
                  {testMode === 'paired'
                    ? '处理前基线数据 (Before, n = ' + parsed1.length + ')'
                    : '样本组 1 (Sample 1, n = ' + parsed1.length + ')'}
                </span>
                <span className="text-[11px] text-slate-400">支持逗号或空格分隔</span>
              </div>
              <textarea
                rows={3}
                value={inputData1}
                onChange={(e) => setInputData1(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* 样本 2 (当需要两组时) */}
            {testMode !== 'one_sample' && testMode !== 'shapiro' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">
                    {testMode === 'paired'
                      ? '处理后随访数据 (After, n = ' + parsed2.length + ')'
                      : '样本组 2 (Sample 2, n = ' + parsed2.length + ')'}
                  </span>
                  <span className="text-[11px] text-slate-400">支持逗号或空格分隔</span>
                </div>
                <textarea
                  rows={3}
                  value={inputData2}
                  onChange={(e) => setInputData2(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* 单样本检验目标均值 mu0 */}
            {testMode === 'one_sample' && (
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  原假设检验均值 μ₀ (Null Hypothesis Mean)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={nullMu}
                  onChange={(e) => setNullMu(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            )}

            {/* 两样本独立检验：方差齐性选项 */}
            {testMode === 'two_sample' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">等方差假设 (var.equal)</div>
                  <div className="text-[11px] text-slate-500">
                    {varEqual ? 'Student t 检验 (Pooled 方差)' : "Welch's t 检验 (推荐，稳健抗方差不齐)"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={varEqual}
                  onChange={(e) => setVarEqual(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            )}

            {/* 假设方向与显著性水平 */}
            {testMode !== 'f_var' && testMode !== 'shapiro' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    备择假设方向 (Alternative)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'two.sided', label: '双侧 ≠' },
                        { id: 'greater', label: '右单侧 >' },
                        { id: 'less', label: '左单侧 <' },
                      ] as const
                    ).map((alt) => (
                      <button
                        key={alt.id}
                        onClick={() => setAlternative(alt.id)}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                          alternative === alt.id
                            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {alt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700">显著性水平 α (第一类错误阈值)</span>
                    <span className="font-mono font-bold text-indigo-600">α = {alpha}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0.01, 0.05, 0.1].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAlpha(a)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          alpha === a
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        α = {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：统计检验推断看板 */}
        <div className="lg:col-span-7 space-y-4">
          {testResult && testResult.type !== 'shapiro' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              {/* 决策结果大卡片 */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  testResult.res.decision === 'reject'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                {testResult.res.decision === 'reject' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      {testResult.res.decision === 'reject' ? 'REJECT H₀ (拒绝原假设)' : 'FAIL TO REJECT H₀ (未拒绝原假设)'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-current">
                      p = {testResult.res.pValue < 0.0001 ? '< 0.0001' : testResult.res.pValue.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                    {testResult.res.decision === 'reject'
                      ? `在 α = ${alpha} 水平下，观察到的极端样本差异在原假设成立的前提下发生概率仅为 ${(testResult.res.pValue * 100).toFixed(2)}% < ${alpha * 100}%。有充分的统计学证据支持备择假设。`
                      : `在 α = ${alpha} 水平下，当前数据差异的 p 值 (${testResult.res.pValue.toFixed(4)}) ≥ ${alpha}。切记：不能表述为“接受 H₀”或“证明两组相同”，准确学术结论是“当前样本证据不足以推翻原假设”。`}
                  </p>
                </div>
              </div>

              {/* 核心统计量指标网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">检验统计量</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {testResult.type === 'f_var' ? 'F = ' : 't = '}
                    {testResult.res.statistic.toFixed(3)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">自由度 (df)</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {testResult.type === 'f_var'
                      ? `${(testResult.res as any).df1}, ${(testResult.res as any).df2}`
                      : (testResult.res as any).df.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">{(1 - alpha) * 100}% 置信区间</div>
                  <div className="text-[11px] font-bold font-mono text-indigo-700 mt-1 truncate">
                    [{testResult.res.confInt[0].toFixed(2)}, {testResult.res.confInt[1] === Infinity ? '+∞' : testResult.res.confInt[1].toFixed(2)}]
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">效应量 Cohen&apos;s d</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {(testResult.res as any).cohensD !== undefined
                      ? (testResult.res as any).cohensD.toFixed(3)
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* R 语言对齐代码一览 */}
              <div className="bg-slate-900 rounded-xl p-3.5 text-xs text-sky-200 font-mono">
                <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-2 flex justify-between">
                  <span>R Console 标准执行代码</span>
                  <span>stats::t.test</span>
                </div>
                {testResult.type === 'one_sample' && (
                  <div>t.test(x, mu = {nullMu}, alternative = &quot;{alternative}&quot;, conf.level = {1 - alpha})</div>
                )}
                {testResult.type === 'two_sample' && (
                  <div>t.test(x, y, var.equal = {varEqual ? 'TRUE' : 'FALSE'}, alternative = &quot;{alternative}&quot;, conf.level = {1 - alpha})</div>
                )}
                {testResult.type === 'paired' && (
                  <div>t.test(after, before, paired = TRUE, alternative = &quot;{alternative}&quot;, conf.level = {1 - alpha})</div>
                )}
                {testResult.type === 'f_var' && (
                  <div>var.test(x, y, conf.level = {1 - alpha})</div>
                )}
              </div>
            </div>
          )}

          {/* Shapiro-Wilk 正态性检验专用视图 */}
          {testResult && testResult.type === 'shapiro' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Shapiro-Wilk 正态性检验与理论 Q-Q 图
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    testResult.res.isNormal
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {testResult.res.isNormal ? '满足正态性 (p ≥ 0.05)' : '显著偏离正态 (p < 0.05)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">W 统计量 (接近 1 表示越正态)</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {testResult.res.wStatistic.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">p 值 (H₀: 数据服从正态分布)</div>
                  <div className="text-lg font-bold font-mono text-indigo-700 mt-0.5">
                    {testResult.res.pValue.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Q-Q 图 SVG */}
              <div className="w-full bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Normal Q-Q Plot (理论正态分位数 vs 样本经验分位数)
                </div>
                <svg viewBox="0 0 500 240" className="w-full h-auto select-none">
                  {/* 参考线 */}
                  <line
                    x1="40"
                    y1="200"
                    x2="460"
                    y2="40"
                    stroke="#f43f5e"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  {testResult.qq.points.map((pt, i) => {
                    // 缩放点
                    const cx = 250 + pt.theoretical * 65;
                    const cy = 120 - (pt.sample - 16) * 12;
                    return (
                      <circle
                        key={i}
                        cx={Math.max(40, Math.min(460, cx))}
                        cy={Math.max(20, Math.min(220, cy))}
                        r="3"
                        fill="#334155"
                        stroke="#0f172a"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
