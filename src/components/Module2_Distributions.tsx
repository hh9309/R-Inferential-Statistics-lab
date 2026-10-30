import React, { useState, useMemo } from 'react';
import {
  normPdf,
  normCdf,
  normInv,
  tPdf,
  tCdf,
  tInv,
  chiSquarePdf,
  chiSquareCdf,
  fPdf,
  fCdf,
  rNorm,
  mean,
  variance,
  quantile,
} from '../utils/mathStats';
import { Activity, Sliders, Play, Code2, Layers, Check } from 'lucide-react';

type DistFamily = 'normal' | 't' | 'chisq' | 'f';

export const Module2_Distributions: React.FC = () => {
  const [family, setFamily] = useState<DistFamily>('t');
  const [viewType, setViewType] = useState<'pdf' | 'cdf'>('pdf');
  const [alpha, setAlpha] = useState<number>(0.05);

  // 参数配置
  const [normMu, setNormMu] = useState<number>(0);
  const [normSigma, setNormSigma] = useState<number>(1);
  const [tDf, setTDf] = useState<number>(4);
  const [chiDf, setChiDf] = useState<number>(5);
  const [fDf1, setFDf1] = useState<number>(5);
  const [fDf2, setFDf2] = useState<number>(10);

  // 蒙特卡洛抽样状态
  const [mcSamples, setMcSamples] = useState<number[]>([]);
  const [isSampling, setIsSampling] = useState<boolean>(false);

  // 确定当前分布的 x 轴绘图范围与理论函数
  const { xMin, xMax, getPdf, getCdf, getCrit, rCodeSnippet, paramLabel } = useMemo(() => {
    switch (family) {
      case 'normal':
        return {
          xMin: normMu - 4 * normSigma,
          xMax: normMu + 4 * normSigma,
          getPdf: (x: number) => normPdf(x, normMu, normSigma),
          getCdf: (x: number) => normCdf(x, normMu, normSigma),
          getCrit: () => [normInv(alpha / 2, normMu, normSigma), normInv(1 - alpha / 2, normMu, normSigma)],
          paramLabel: `μ = ${normMu}, σ = ${normSigma}`,
          rCodeSnippet: `# 正态分布 R 基础函数调用
dnorm(x = 0, mean = ${normMu}, sd = ${normSigma})   # 概率密度 PDF
pnorm(q = 1.96, mean = ${normMu}, sd = ${normSigma})# 累积分布 CDF P(X <= q)
qnorm(p = 0.975, mean = ${normMu}, sd = ${normSigma}) # 分位数 Quantile
rnorm(n = 1000, mean = ${normMu}, sd = ${normSigma})  # 蒙特卡洛随机抽样`,
        };
      case 't':
        return {
          xMin: -5,
          xMax: 5,
          getPdf: (x: number) => tPdf(x, tDf),
          getCdf: (x: number) => tCdf(x, tDf),
          getCrit: () => [-tInv(1 - alpha / 2, tDf), tInv(1 - alpha / 2, tDf)],
          paramLabel: `df = ${tDf}`,
          rCodeSnippet: `# 学生氏 t 分布 R 函数调用
dt(x = 1.5, df = ${tDf})       # 概率密度 PDF
pt(q = 2.13, df = ${tDf})      # 累积分布 CDF
qt(p = 0.975, df = ${tDf})     # 双侧 α=${alpha} 临界分位点
rt(n = 1000, df = ${tDf})      # 随机生成服从 t(${tDf}) 的样本点`,
        };
      case 'chisq':
        return {
          xMin: 0,
          xMax: Math.max(30, chiDf + 4 * Math.sqrt(2 * chiDf)),
          getPdf: (x: number) => chiSquarePdf(x, chiDf),
          getCdf: (x: number) => chiSquareCdf(x, chiDf),
          // 卡方右尾拒绝域临界点
          getCrit: () => [0, chiDf + Math.sqrt(2 * chiDf) * 1.96],
          paramLabel: `df = ${chiDf}`,
          rCodeSnippet: `# 卡方分布 (Chi-Square) R 函数调用
dchisq(x = 5.0, df = ${chiDf})    # 卡方 PDF
pchisq(q = 11.07, df = ${chiDf})  # 累积分布 CDF
qchisq(p = 0.95, df = ${chiDf})   # 右侧拒绝域临界值
rchisq(n = 1000, df = ${chiDf})   # 随机生成样本点`,
        };
      case 'f':
        return {
          xMin: 0,
          xMax: 6,
          getPdf: (x: number) => fPdf(x, fDf1, fDf2),
          getCdf: (x: number) => fCdf(x, fDf1, fDf2),
          getCrit: () => [0, 3.2],
          paramLabel: `df₁ = ${fDf1}, df₂ = ${fDf2}`,
          rCodeSnippet: `# Fisher-Snedecor F 分布 R 函数调用
df(x = 2.0, df1 = ${fDf1}, df2 = ${fDf2})    # F 分布概率密度
pf(q = 2.5, df1 = ${fDf1}, df2 = ${fDf2})    # 累积分布
qf(p = 0.95, df1 = ${fDf1}, df2 = ${fDf2})   # 方差分析临界拒绝值
rf(n = 1000, df1 = ${fDf1}, df2 = ${fDf2})   # 随机抽样`,
        };
    }
  }, [family, normMu, normSigma, tDf, chiDf, fDf1, fDf2, alpha]);

  // 生成分布曲线坐标点
  const width = 640;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const steps = 120;
  const stepSize = (xMax - xMin) / steps;

  const pointsData = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    let maxY = 0;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const y = viewType === 'pdf' ? getPdf(x) : getCdf(x);
      if (y > maxY) maxY = y;
      pts.push({ x, y });
    }
    const finalMaxY = viewType === 'cdf' ? 1.05 : maxY * 1.25 || 0.5;
    return { pts, maxY: finalMaxY };
  }, [xMin, xMax, stepSize, getPdf, getCdf, viewType]);

  const scaleX = (val: number) => {
    return padding.left + ((val - xMin) / (xMax - xMin || 1)) * plotWidth;
  };

  const scaleY = (val: number) => {
    return height - padding.bottom - (val / pointsData.maxY) * plotHeight;
  };

  const pathD = useMemo(() => {
    return pointsData.pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
      .join(' ');
  }, [pointsData, scaleX, scaleY]);

  // 对比标准正态分布 (当选 t 分布时对比厚尾)
  const normComparisonD = useMemo(() => {
    if (family !== 't' || viewType !== 'pdf') return null;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const y = normPdf(x, 0, 1);
      pts.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x).toFixed(1)} ${scaleY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [family, viewType, xMin, stepSize, scaleX, scaleY]);

  // 执行一次蒙特卡洛抽样
  const handleMonteCarlo = () => {
    setIsSampling(true);
    const n = 1000;
    const samples: number[] = [];
    for (let i = 0; i < n; i++) {
      if (family === 'normal') {
        samples.push(rNorm(normMu, normSigma));
      } else if (family === 't') {
        // t 分布生成：Z / sqrt(V/df)
        const z = rNorm(0, 1);
        let chi = 0;
        for (let j = 0; j < tDf; j++) {
          const u = rNorm(0, 1);
          chi += u * u;
        }
        samples.push(z / Math.sqrt(chi / tDf));
      } else if (family === 'chisq') {
        let chi = 0;
        for (let j = 0; j < chiDf; j++) {
          const u = rNorm(0, 1);
          chi += u * u;
        }
        samples.push(chi);
      } else {
        // F 分布
        let chi1 = 0, chi2 = 0;
        for (let j = 0; j < fDf1; j++) { const u = rNorm(0, 1); chi1 += u * u; }
        for (let j = 0; j < fDf2; j++) { const u = rNorm(0, 1); chi2 += u * u; }
        samples.push((chi1 / fDf1) / (chi2 / fDf2 || 1));
      }
    }
    setMcSamples(samples);
    setTimeout(() => setIsSampling(false), 200);
  };

  const sampleStats = useMemo(() => {
    if (!mcSamples.length) return null;
    const m = mean(mcSamples);
    const v = variance(mcSamples, true);
    const q025 = quantile(mcSamples, 0.025);
    const q975 = quantile(mcSamples, 0.975);
    return { mean: m, variance: v, sd: Math.sqrt(v), q025, q975 };
  }, [mcSamples]);

  return (
    <div className="space-y-6">
      {/* 模块顶部 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 font-mono">
              模块 02 / Module 02
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">连续型核心分布</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            四大推断分布演变与蒙特卡洛抽样模拟 (Distributions & Sampling)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            交互探索正态分布、学生氏 t 分布、卡方分布与 Fisher F 分布的密度函数演进，观测自由度（df）对分布形态与厚尾（Heavy-tail）收敛特性的决定性影响。
          </p>
        </div>

        {/* 分布选择 Tab */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          {(
            [
              { id: 'normal', name: '正态分布 N' },
              { id: 't', name: 't 分布 (Student)' },
              { id: 'chisq', name: '卡方分布 χ²' },
              { id: 'f', name: 'F 分布 (Fisher)' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFamily(item.id);
                setMcSamples([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                family === item.id
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧参数调节面板 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>动态分布参数调控</span>
              </h3>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {paramLabel}
              </span>
            </div>

            {/* 视角切换: PDF vs CDF */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setViewType('pdf')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  viewType === 'pdf' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                概率密度 PDF f(x)
              </button>
              <button
                onClick={() => setViewType('cdf')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  viewType === 'cdf' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                累积分布 CDF F(x)
              </button>
            </div>

            {/* 针对不同分布的专属滑动条 */}
            {family === 'normal' && (
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">均值 μ (位置参数)</span>
                    <span className="font-mono font-bold text-slate-900">{normMu}</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={normMu}
                    onChange={(e) => setNormMu(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">标准差 σ (尺度参数)</span>
                    <span className="font-mono font-bold text-slate-900">{normSigma}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.2"
                    value={normSigma}
                    onChange={(e) => setNormSigma(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {family === 't' && (
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">自由度 df (Degrees of Freedom)</span>
                    <span className="font-mono font-bold text-indigo-600">df = {tDf}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={tDf}
                    onChange={(e) => setTDf(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>df=1 (柯西厚尾)</span>
                    <span>df=5 (中小样本)</span>
                    <span>df=40 (趋于正态)</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>厚尾观察指南：</strong>注意虚线代表的标准正态分布 N(0,1)。当 df 较小（如 df=1~4）时，t 分布中心峰更平缓、两侧尾部更“厚重”，发生极端离群值的概率显著高于正态分布！当 df ≥ 30 时两曲线几乎完全重合。
                </div>
              </div>
            )}

            {family === 'chisq' && (
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">自由度 df (独立标准正态平方和项数)</span>
                    <span className="font-mono font-bold text-indigo-600">df = {chiDf}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={chiDf}
                    onChange={(e) => setChiDf(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  卡方分布理论期望 E(χ²) = df，理论方差 Var(χ²) = 2df。随着 df 增加，形态由强右偏逐渐趋于对称。
                </div>
              </div>
            )}

            {family === 'f' && (
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">分子自由度 df₁</span>
                    <span className="font-mono font-bold text-slate-900">{fDf1}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={fDf1}
                    onChange={(e) => setFDf1(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700">分母自由度 df₂</span>
                    <span className="font-mono font-bold text-slate-900">{fDf2}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={fDf2}
                    onChange={(e) => setFDf2(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 蒙特卡洛抽样按钮 */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleMonteCarlo}
                disabled={isSampling}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>一键抽取 1,000 个蒙特卡洛样本点</span>
              </button>
            </div>
          </div>

          {/* R 语言原生代码对应 */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-slate-300 text-xs shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>R 语言原生 stats 指令映射</span>
              </span>
              <span className="font-mono text-emerald-400">stats package</span>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-sky-200 overflow-x-auto p-1">
              {rCodeSnippet}
            </pre>
          </div>
        </div>

        {/* 右侧分布曲线可视化 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>
                    {family === 'normal' && `正态分布 N(${normMu}, ${normSigma}²)`}
                    {family === 't' && `学生氏 t 分布 t(df = ${tDf})`}
                    {family === 'chisq' && `卡方分布 χ²(df = ${chiDf})`}
                    {family === 'f' && `Fisher-Snedecor F 分布 F(${fDf1}, ${fDf2})`}
                  </span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    [{viewType.toUpperCase()}]
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {viewType === 'pdf'
                    ? '连续随机变量在各点附近的微元概率密度值，全实数轴积分面积恒等于 1.0'
                    : '累积概率值 F(x) = P(X ≤ x)，严格单调递增，值域限定在 [0, 1]'}
                </p>
              </div>

              {family === 't' && viewType === 'pdf' && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-indigo-600"></span>
                    <span className="text-slate-600 font-medium">t({tDf}) 密度</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-rose-500 border-t border-dashed"></span>
                    <span className="text-rose-600 font-medium">标准正态 N(0,1)</span>
                  </div>
                </div>
              )}
            </div>

            {/* SVG 画布 */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto select-none bg-slate-50/50 rounded-xl border border-slate-100"
              >
                {/* 网格参考线 */}
                {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                  const yPos = height - padding.bottom - frac * plotHeight;
                  return (
                    <line
                      key={frac}
                      x1={padding.left}
                      y1={yPos}
                      x2={width - padding.right}
                      y2={yPos}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* 曲线下方渐变阴影填充 (仅 PDF 模式) */}
                {viewType === 'pdf' && (
                  <path
                    d={`${pathD} L ${scaleX(xMax)} ${height - padding.bottom} L ${scaleX(
                      xMin
                    )} ${height - padding.bottom} Z`}
                    fill="#e0e7ff"
                    opacity="0.4"
                  />
                )}

                {/* t 分布对比标准正态曲线 */}
                {normComparisonD && (
                  <path
                    d={normComparisonD}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                )}

                {/* 当前分布主曲线 */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* X 轴 */}
                <line
                  x1={padding.left}
                  y1={height - padding.bottom}
                  x2={width - padding.right}
                  y2={height - padding.bottom}
                  stroke="#64748b"
                  strokeWidth="1"
                />

                {/* X 轴刻度标记 */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const val = xMin + frac * (xMax - xMin);
                  const xPos = padding.left + frac * plotWidth;
                  return (
                    <g key={frac}>
                      <line
                        x1={xPos}
                        y1={height - padding.bottom}
                        x2={xPos}
                        y2={height - padding.bottom + 4}
                        stroke="#64748b"
                      />
                      <text
                        x={xPos}
                        y={height - padding.bottom + 16}
                        fontSize="10"
                        textAnchor="middle"
                        fill="#64748b"
                        fontFamily="monospace"
                      >
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 蒙特卡洛 1000 次样本实测数据看板 */}
            {sampleStats && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>蒙特卡洛 N = 1,000 次随机抽样实测指标</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    R::r{family} 仿真模拟
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">样本实测均值 x̄</div>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      {sampleStats.mean.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">样本方差 s²</div>
                    <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                      {sampleStats.variance.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">经验 2.5% 分位数</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {sampleStats.q025.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">经验 97.5% 分位数</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {sampleStats.q975.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
