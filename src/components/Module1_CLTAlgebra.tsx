import React, { useState, useMemo } from 'react';
import { simulateCLT, normPdf } from '../utils/mathStats';
import { DistributionType } from '../types/stats';
import { RefreshCw, Play, Info, CheckCircle2, Sigma, ArrowRight } from 'lucide-react';

export const Module1_CLTAlgebra: React.FC = () => {
  const [distType, setDistType] = useState<DistributionType>('uniform');
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [repetitions, setRepetitions] = useState<number>(1000);
  const [activeTab, setActiveTab] = useState<'simulator' | 'proof'>('simulator');
  const [seedKey, setSeedKey] = useState<number>(0);

  // 运行 CLT 抽样模拟
  const simResult = useMemo(() => {
    return simulateCLT(distType, sampleSize, repetitions, 32);
  }, [distType, sampleSize, repetitions, seedKey]);

  // 绘制直方图与理论正态曲线的 SVG 尺寸与坐标映射
  const width = 640;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // 计算最大密度以确定 y 轴比例
  const maxHistDensity = Math.max(...simResult.histogram.map((b) => b.density), 0.001);
  const theoreticalMaxNormDensity = normPdf(
    simResult.theoreticalMean,
    simResult.theoreticalMean,
    simResult.theoreticalSE || 1
  );
  const maxY = Math.max(maxHistDensity, theoreticalMaxNormDensity) * 1.25;

  const scaleX = (val: number) => {
    return (
      padding.left +
      ((val - simResult.min) / (simResult.max - simResult.min || 1)) * plotWidth
    );
  };

  const scaleY = (density: number) => {
    return height - padding.bottom - (density / maxY) * plotHeight;
  };

  // 生成平滑的理论正态密度曲线点集
  const curvePoints = useMemo(() => {
    const points: string[] = [];
    const steps = 80;
    const stepSize = (simResult.max - simResult.min) / steps;
    for (let i = 0; i <= steps; i++) {
      const xVal = simResult.min + i * stepSize;
      const density = normPdf(xVal, simResult.theoreticalMean, simResult.theoreticalSE);
      const px = scaleX(xVal);
      const py = scaleY(density);
      points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return points.join(' ');
  }, [simResult, scaleX, scaleY]);

  const distDescriptions: Record<DistributionType, { name: string; tag: string; desc: string }> = {
    uniform: {
      name: '连续均匀分布 Uniform(0, 100)',
      tag: '平顶无峰',
      desc: '总体概率在 [0, 100] 上完全平坦均等，无单峰，理论均值 μ = 50, σ ≈ 28.87。',
    },
    exponential: {
      name: '指数分布 Exp(λ=0.05)',
      tag: '重度右偏',
      desc: '总体呈强不对称长拖尾分布，理论均值 μ = 20, σ = 20。小样本下均值右偏，但大样本下迅速对称。',
    },
    bimodal: {
      name: '双峰混合分布 (Bimodal Mixture)',
      tag: '双驼峰形态',
      desc: '由两个不同均值的正态分布等权混合而成，原总体具有两个明显的分离尖峰，完全违反正态性。',
    },
    skewed: {
      name: '重度偏态分布 (Log-Normal 形态)',
      tag: '极度右偏',
      desc: '具有极长右侧拖尾，模拟收入或降雨量等偏态经济现实数据。',
    },
    normal: {
      name: '正态分布 N(50, 10)',
      tag: '基准对称',
      desc: '基准正态总体，抽样均值对任意样本量 n 均严格服从正态分布。',
    },
  };

  return (
    <div className="space-y-6">
      {/* 模块标头切片 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 01 / Module 01
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">统计推断基石</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            统计推断代数与中心极限定理建模 (Inference Algebra & CLT)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            形式化构建大数定律（LLN）与抽样分布代数映射，推导中心极限定理（CLT）的本质收敛特性，在动态交互中验证“无论总体分布如何，样本均值分布皆趋于正态”。
          </p>
        </div>

        {/* 模式切换 Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            蒙特卡洛 CLT 交互仿真
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'proof'
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            数学代数推导与形式化
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：控制面板与参数配置 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>1. 选择母体（总体）分布形态</span>
                <span className="text-xs font-normal text-slate-400">Population f(x)</span>
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {(
                  ['uniform', 'exponential', 'bimodal', 'skewed', 'normal'] as DistributionType[]
                ).map((type) => {
                  const meta = distDescriptions[type];
                  const isSelected = distType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setDistType(type)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-indigo-900' : 'text-slate-800'
                          }`}
                        >
                          {meta.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected
                              ? 'bg-indigo-200 text-indigo-800 font-medium'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {meta.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{meta.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                {/* 样本容量 n */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">样本容量 n (每个样本抽样数)</span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      n = {sampleSize}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="120"
                    step="2"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>n=2 (极小样本)</span>
                    <span>n=30 (临界标准)</span>
                    <span>n=120 (大样本)</span>
                  </div>
                </div>

                {/* 重复抽样次数 K */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">抽样轮次 K (生成多少个均值)</span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      K = {repetitions} 次
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={repetitions}
                    onChange={(e) => setRepetitions(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => setSeedKey((prev) => prev + 1)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>重新执行蒙特卡洛抽样模拟</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：抽样均值直方图与理论曲线展示 */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    抽样分布经验直方图 vs 渐近理论正态密度曲线
                  </h3>
                  <p className="text-xs text-slate-500">
                    浅蓝柱体为蒙特卡洛抽样均值 X̄ 的经验分布，深靛蓝平滑线为根据 CLT 预测的理论正态密度 N(μ, σ²/n)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-sky-200 border border-sky-400 rounded-sm"></span>
                    <span className="text-slate-600">样本均值直方图</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-indigo-600"></span>
                    <span className="text-slate-600 font-medium">理论正态曲线 (CLT)</span>
                  </div>
                </div>
              </div>

              {/* SVG 图表 */}
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

                  {/* 直方图柱体 */}
                  {simResult.histogram.map((bin, idx) => {
                    const x0 = scaleX(bin.binStart);
                    const x1 = scaleX(bin.binEnd);
                    const barWidth = Math.max(1, x1 - x0 - 1);
                    const barHeight = (bin.density / maxY) * plotHeight;
                    const y0 = height - padding.bottom - barHeight;

                    return (
                      <rect
                        key={idx}
                        x={x0}
                        y={y0}
                        width={barWidth}
                        height={barHeight}
                        fill="#bae6fd"
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                        rx="1"
                        className="transition-all hover:fill-sky-300"
                      >
                        <title>{`区间: [${bin.binStart.toFixed(2)}, ${bin.binEnd.toFixed(
                          2
                        )}]\n频数: ${bin.count}\n概率密度: ${bin.density.toFixed(4)}`}</title>
                      </rect>
                    );
                  })}

                  {/* 理论正态曲线 */}
                  <path
                    d={curvePoints}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* 总体理论均值参考垂直虚线 */}
                  <line
                    x1={scaleX(simResult.theoreticalMean)}
                    y1={padding.top}
                    x2={scaleX(simResult.theoreticalMean)}
                    y2={height - padding.bottom}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
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

                  {/* X 轴刻度文本 */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const val = simResult.min + frac * (simResult.max - simResult.min);
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

                  {/* 均值标记文字 */}
                  <text
                    x={scaleX(simResult.theoreticalMean)}
                    y={padding.top - 8}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    μ = {simResult.theoreticalMean.toFixed(1)}
                  </text>
                </svg>
              </div>

              {/* 核心统计量比较指示卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">总体理论均值 μ</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                    {simResult.theoreticalMean.toFixed(2)}
                  </div>
                </div>

                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                  <div className="text-[11px] text-indigo-700 font-medium">抽样均值均值 E(X̄)</div>
                  <div className="text-base font-bold font-mono text-indigo-900 mt-0.5">
                    {simResult.meanOfMeans.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-indigo-600 mt-0.5">
                    误差: {Math.abs(simResult.meanOfMeans - simResult.theoreticalMean).toFixed(3)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">理论标准误 SE = σ/√n</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                    {simResult.theoreticalSE.toFixed(3)}
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-emerald-700 font-medium">经验抽样标准差 S_X̄</div>
                  <div className="text-base font-bold font-mono text-emerald-900 mt-0.5">
                    {simResult.sdOfMeans.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    逼近度: {(100 - (Math.abs(simResult.sdOfMeans - simResult.theoreticalSE) / simResult.theoreticalSE) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* 动态诊断结论切片 */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">推断代数观察结论：</span>
                  当前母体为【{distDescriptions[distType].name}】，尽管原分布具有明显的非正态或偏态特征，但当样本量{' '}
                  <span className="font-mono font-semibold">n = {sampleSize}</span> 时，样本均值的经验分布已展现出高度对称的钟形正态特征；其离散度随{' '}
                  <span className="font-mono font-semibold">1/√{sampleSize}</span> 显著衰减收敛，精确验证了
                  Lindeberg-Lévy 中心极限定理的代数必然性。
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 代数推导与大数定律数学卡片 */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 卡片 1: 辛钦大数定律 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Sigma className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. 辛钦大数定律 (Khinchin&apos;s Law of Large Numbers)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">依概率收敛 P-lim</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                设随机变量序列 X₁, X₂, ..., X_n 独立同分布 (i.i.d.)，且数学期望有限 E(X_i) = μ，则对任意给定的正数 ε &gt; 0，样本均值依概率收敛于总体真均值：
              </p>

              <div className="bg-slate-900 text-sky-300 p-4 rounded-xl font-mono text-center text-sm shadow-inner">
                lim P(|X̄_n - μ| &lt; ε) = 1  (当 n → ∞)
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="font-semibold text-slate-800">代数切片推导：</div>
                <p>
                  由切比雪夫不等式 (Chebyshev Inequality)，若方差 σ² &lt; ∞：
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[11px] text-slate-700">
                  P(|X̄_n - μ| ≥ ε) ≤ Var(X̄_n) / ε² = σ² / (n·ε²) → 0  (当 n → ∞)
                </div>
                <p className="text-slate-500 text-[11px]">
                  这保证了样本均值 X̄_n 是总体真均值 μ 的<strong>相合估计量（一致性）</strong>。
                </p>
              </div>
            </div>

            {/* 卡片 2: 中心极限定理 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. 林德伯格-列维中心极限定理 (Lindeberg-Lévy CLT)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">按分布收敛 d-lim</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                若独立同分布总体具有有限方差 σ² &gt; 0，则标准化样本均值 Z_n 随着 n → ∞ 弱收敛于标准正态分布：
              </p>

              <div className="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-center text-sm shadow-inner">
                Z_n = (X̄_n - μ) / (σ / √n) ⎯⎯d⎯→ N(0, 1)
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <div className="font-semibold text-slate-800">特征函数法核心脉络：</div>
                <p>
                  设中心化变量 Y_i = (X_i - μ)/σ，其特征函数泰勒级数展开：
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-[11px] text-slate-700">
                  φ_Y(t) = 1 - t²/2 + o(t²) ⟹ φ_Z_n(t) = [1 - t²/(2n) + o(t²/n)]ⁿ → e^(-t²/2)
                </div>
                <p className="text-slate-500 text-[11px]">
                  e^(-t²/2) 正是标准正态分布的特征函数，由连续性定理即得分布收敛。
                </p>
              </div>
            </div>
          </div>

          {/* 方差缩减律与为什么除以根号 n */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>推断代数核心解构：为什么标准误是 σ / √n 而非 σ / n？</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">步骤 1: 均值的方差公式</div>
                <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                  Var(X̄) = Var((1/n) ∑ X_i) = (1/n²) ∑ Var(X_i)
                </p>
                <p className="text-slate-500 text-[11px] mt-1">
                  常数提出方差算子时必须平方，产生 1/n² 系数。
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 mb-1">步骤 2: 独立变量方差可加性</div>
                <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                  ∑ Var(X_i) = n · σ²
                </p>
                <p className="text-slate-500 text-[11px] mt-1">
                  因为各样本点彼此独立，协方差 Cov(X_i, X_j) = 0，方差直接求和为 n·σ²。
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="font-bold text-indigo-900 mb-1">步骤 3: 开方得到标准误 SE</div>
                <p className="text-indigo-800 font-mono text-[11px] leading-relaxed">
                  Var(X̄) = σ²/n  ⟹  SE = √(σ²/n) = σ / √n
                </p>
                <p className="text-indigo-700 text-[11px] mt-1">
                  样本容量增加 4 倍，标准误才减半；这决定了统计学中获取精度的边际成本递增律。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
