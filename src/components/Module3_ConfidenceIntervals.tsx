import React, { useState, useMemo } from 'react';
import { simulateConfidenceIntervals, tInv, normInv } from '../utils/mathStats';
import { CIIntervalItem } from '../types/stats';
import { RefreshCw, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const Module3_ConfidenceIntervals: React.FC = () => {
  const [trueMean, setTrueMean] = useState<number>(100);
  const [trueSd, setTrueSd] = useState<number>(15);
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [confLevel, setConfLevel] = useState<number>(0.95);
  const [seed, setSeed] = useState<number>(0);

  // 运行 100 次置信区间抽样模拟
  const simData = useMemo(() => {
    return simulateConfidenceIntervals(trueMean, trueSd, sampleSize, 100, confLevel);
  }, [trueMean, trueSd, sampleSize, confLevel, seed]);

  // 计算 Caterpillar 图的横坐标范围
  const minVal = Math.min(...simData.intervals.map((i) => i.lower), trueMean - 20);
  const maxVal = Math.max(...simData.intervals.map((i) => i.upper), trueMean + 20);

  const svgWidth = 640;
  const svgHeight = 440;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = (val: number) => {
    return padding.left + ((val - minVal) / (maxVal - minVal || 1)) * plotWidth;
  };

  const scaleY = (id: number) => {
    return padding.top + ((id - 1) / 99) * plotHeight;
  };

  // 比例置信区间计算小工具状态
  const [propSuccess, setPropSuccess] = useState<number>(58);
  const [propTotal, setPropTotal] = useState<number>(100);

  const propResults = useMemo(() => {
    const p = propSuccess / (propTotal || 1);
    const zCrit = normInv(1 - (1 - confLevel) / 2);
    // Wald 区间
    const seWald = Math.sqrt((p * (1 - p)) / (propTotal || 1));
    const waldLower = Math.max(0, p - zCrit * seWald);
    const waldUpper = Math.min(1, p + zCrit * seWald);

    // Wilson Score 区间 (小样本或极端比例更稳健)
    const n = propTotal;
    const denom = 1 + (zCrit * zCrit) / n;
    const center = (p + (zCrit * zCrit) / (2 * n)) / denom;
    const halfWidth = (zCrit * Math.sqrt((p * (1 - p)) / n + (zCrit * zCrit) / (4 * n * n))) / denom;
    const wilsonLower = Math.max(0, center - halfWidth);
    const wilsonUpper = Math.min(1, center + halfWidth);

    return { p, wald: [waldLower, waldUpper], wilson: [wilsonLower, wilsonUpper] };
  }, [propSuccess, propTotal, confLevel]);

  return (
    <div className="space-y-6">
      {/* 模块顶部标头 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
              模块 03 / Module 03
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">参数区间估计</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            参数点估计与置信区间动态构建 (Point Estimation & CI Simulator)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            构建经典 100 次独立抽样“毛毛虫图”（Caterpillar Plot），生动揭示置信水平（1-α）的真正频数释义，破除“参数有 95% 概率落入区间”的流俗误区。
          </p>
        </div>

        <button
          onClick={() => setSeed((prev) => prev + 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>重新抽取 100 组样本区间</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧参数调节面板 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>母体参数与抽样规格</span>
              <span className="text-xs text-slate-400 font-mono">Ground Truth</span>
            </h3>

            {/* 总体真均值 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">总体真实均值 μ_true</span>
                <span className="font-mono font-bold text-slate-900">{trueMean}</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={trueMean}
                onChange={(e) => setTrueMean(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 总体真实标准差 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">总体真实标准差 σ</span>
                <span className="font-mono font-bold text-slate-900">{trueSd}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={trueSd}
                onChange={(e) => setTrueSd(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* 样本容量 n */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700">每次抽样容量 n</span>
                <span className="font-mono font-bold text-indigo-600">n = {sampleSize}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                区间宽度理论缩放比: 1/√{sampleSize} = {(1 / Math.sqrt(sampleSize)).toFixed(3)}
              </div>
            </div>

            {/* 置信水平选择 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 font-medium">置信水平 (1 - α)</span>
                <span className="font-mono font-bold text-emerald-600">
                  {(confLevel * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.9, 0.95, 0.99].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConfLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      confLevel === lvl
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {(lvl * 100).toFixed(0)}% CI
                  </button>
                ))}
              </div>
            </div>

            {/* 覆盖统计结果卡片 */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="text-xs text-slate-400 font-medium">100 组抽样实测覆盖率统计</div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {simData.coveredCount} / 100
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    实测 {simData.coverageRate.toFixed(1)}% (期望 {simData.expectedRate}%)
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${simData.coverageRate}%` }}
                  ></div>
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${100 - simData.coverageRate}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    捕获真值: {simData.coveredCount} 组
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                    遗漏脱靶: {100 - simData.coveredCount} 组
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 总体比例 (Proportion) 置信区间计算器切片 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>单总体比例置信区间 (Wilson vs Wald)</span>
              <span className="text-[10px] text-slate-400 font-mono">p̂ = x / n</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-500">阳性事件数 x</label>
                <input
                  type="number"
                  min="0"
                  max={propTotal}
                  value={propSuccess}
                  onChange={(e) => setPropSuccess(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full mt-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">总样本数 n</label>
                <input
                  type="number"
                  min="1"
                  value={propTotal}
                  onChange={(e) => setPropTotal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full mt-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">样本比例 p̂</span>
                <span className="font-mono font-bold text-slate-900">
                  {(propResults.p * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-indigo-800 font-medium">Wilson Score 区间 (推荐)</span>
                <span className="font-mono font-bold text-indigo-900">
                  [{(propResults.wilson[0] * 100).toFixed(1)}%, {(propResults.wilson[1] * 100).toFixed(1)}%]
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">Wald 正态近似区间</span>
                <span className="font-mono text-slate-700">
                  [{(propResults.wald[0] * 100).toFixed(1)}%, {(propResults.wald[1] * 100).toFixed(1)}%]
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧毛毛虫图 (Caterpillar Plot) 可视化 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  100 次独立重复抽样置信区间覆盖轨迹 (Caterpillar Plot)
                </h3>
                <p className="text-xs text-slate-500">
                  每条横线代表单次抽样计算的 {(confLevel * 100).toFixed(0)}% 置信区间 [x̄ - t*SE, x̄ + t*SE]，中点为样本均值 x̄
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                  覆盖真值 ({simData.coveredCount})
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-3 h-1 bg-rose-500 rounded"></span>
                  脱靶错过 ({100 - simData.coveredCount})
                </span>
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-3 h-0.5 border-t border-dashed border-red-500"></span>
                  真值 μ={trueMean}
                </span>
              </div>
            </div>

            {/* SVG 画布 */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none bg-slate-50/60 rounded-xl border border-slate-100"
              >
                {/* 纵坐标网格与真值垂直参考线 */}
                <line
                  x1={scaleX(trueMean)}
                  y1={padding.top}
                  x2={scaleX(trueMean)}
                  y2={svgHeight - padding.bottom}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* 100 条置信区间线 */}
                {simData.intervals.map((item) => {
                  const y = scaleY(item.id);
                  const x1 = scaleX(item.lower);
                  const x2 = scaleX(item.upper);
                  const xMid = scaleX(item.sampleMean);
                  const strokeColor = item.coversTrue ? '#10b981' : '#f43f5e';

                  return (
                    <g key={item.id} className="transition-opacity hover:opacity-100">
                      {/* 横向区间线 */}
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke={strokeColor}
                        strokeWidth={item.coversTrue ? '1.2' : '2.2'}
                        opacity={item.coversTrue ? 0.75 : 1}
                      />
                      {/* 样本均值点 */}
                      <circle
                        cx={xMid}
                        cy={y}
                        r={item.coversTrue ? '1.5' : '2.2'}
                        fill={strokeColor}
                      />
                    </g>
                  );
                })}

                {/* X 轴线 */}
                <line
                  x1={padding.left}
                  y1={svgHeight - padding.bottom}
                  x2={svgWidth - padding.right}
                  y2={svgHeight - padding.bottom}
                  stroke="#64748b"
                  strokeWidth="1"
                />

                {/* X 轴刻度 */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                  const val = minVal + frac * (maxVal - minVal);
                  const xPos = padding.left + frac * plotWidth;
                  return (
                    <g key={frac}>
                      <line
                        x1={xPos}
                        y1={svgHeight - padding.bottom}
                        x2={xPos}
                        y2={svgHeight - padding.bottom + 4}
                        stroke="#64748b"
                      />
                      <text
                        x={xPos}
                        y={svgHeight - padding.bottom + 15}
                        fontSize="10"
                        textAnchor="middle"
                        fill="#64748b"
                        fontFamily="monospace"
                      >
                        {val.toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* 真实参数标注文本 */}
                <text
                  x={scaleX(trueMean)}
                  y={padding.top - 6}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#ef4444"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  μ_true = {trueMean}
                </text>
              </svg>
            </div>

            {/* 哲学认知纠偏切片 */}
            <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>统计推断核心认识纠偏：置信区间（Confidence Interval）的科学定义</span>
              </div>
              <div className="text-xs text-indigo-900 leading-relaxed space-y-1">
                <p>
                  ❌ <strong>经典流俗误区：</strong>“计算出 95% 置信区间为 [94.6, 105.4]，说明总体真均值 μ 有 95% 的概率落在此区间内。”
                </p>
                <p>
                  ✅ <strong>统计学正解：</strong>在频率学派框架下，<strong>总体参数 μ 是一个客观存在但未知的确定常数，绝非随机变量！</strong>真正随机变动的是我们抽样生成的区间两端端点 [L(X), U(X)]。一旦某次抽样完成，计算出的固定区间要么“100% 包含了真值”，要么“0% 未包含真值”。所谓的 95% 置信水平，是指**“如果我们重复抽样 100 次，使用此方法计算出的 100 个区间中，大约有 95 个能够捕获住真实参数”**。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
