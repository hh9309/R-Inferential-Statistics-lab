import React, { useState, useMemo } from 'react';
import { normPdf, normCdf, normInv } from '../utils/mathStats';
import {
  BookOpen,
  Scale,
  Sliders,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Percent,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const Module10_KnowledgeSlices: React.FC = () => {
  const [activeSlice, setActiveSlice] = useState<number>(2); // 默认打开最具视觉交互的切片二

  // 切片二：第一类与第二类错误动态交互权衡状态
  const [critZ, setCritZ] = useState<number>(1.645); // 临界值
  const [deltaEffect, setDeltaEffect] = useState<number>(2.5); // H1 真实效应漂移距离
  const [sampleN, setSampleN] = useState<number>(25);

  // 计算 alpha, beta, power
  const errorMetrics = useMemo(() => {
    // H0: N(0, 1)
    // H1: N(deltaEffect, 1)
    const alphaRate = 1 - normCdf(critZ, 0, 1);
    const betaRate = normCdf(critZ, deltaEffect, 1);
    const powerRate = 1 - betaRate;

    return {
      alpha: Math.max(0, Math.min(1, alphaRate)),
      beta: Math.max(0, Math.min(1, betaRate)),
      power: Math.max(0, Math.min(1, powerRate)),
    };
  }, [critZ, deltaEffect]);

  // 切片三：多重检验膨胀计算器
  const [testCount, setTestCount] = useState<number>(10);
  const familywiseAlpha = useMemo(() => {
    return (1 - Math.pow(1 - 0.05, testCount)) * 100;
  }, [testCount]);

  // 切片二双曲线绘图
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xMin = -3.5;
  const xMax = 6.5;

  const scaleX = (x: number) => {
    return padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  };
  const scaleY = (y: number) => {
    return height - padding.bottom - (y / 0.45) * plotHeight;
  };

  // 生成 H0 和 H1 的曲线路径
  const { pathH0, pathH1 } = useMemo(() => {
    const steps = 100;
    const stepSize = (xMax - xMin) / steps;
    const pts0: string[] = [];
    const pts1: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const y0 = normPdf(x, 0, 1);
      const y1 = normPdf(x, deltaEffect, 1);
      pts0.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x).toFixed(1)} ${scaleY(y0).toFixed(1)}`);
      pts1.push(`${i === 0 ? 'M' : 'L'} ${scaleX(x).toFixed(1)} ${scaleY(y1).toFixed(1)}`);
    }

    return { pathH0: pts0.join(' '), pathH1: pts1.join(' ') };
  }, [xMin, xMax, deltaEffect, scaleX, scaleY]);

  const slices = [
    {
      id: 1,
      title: '切片一：统计推断四大基本要素解构',
      sub: 'H₀ · H₁ · 统计量 · 显著性水平 α',
      icon: Scale,
    },
    {
      id: 2,
      title: '切片二：第一类错误与第二类错误的权衡',
      sub: 'α (弃真) · β (取伪) · 功效 Power (1-β)',
      icon: Sliders,
    },
    {
      id: 3,
      title: '切片三：三大致命统计推断陷阱',
      sub: '逻辑反转 · 显著性膨胀 · 低功效危机',
      icon: AlertTriangle,
    },
    {
      id: 4,
      title: '切片四：误区警示与诊断陷阱',
      sub: 'p < 0.05 迷信 · 效应量回归 · 置信区间',
      icon: Lightbulb,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 模块顶部 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 10 / Module 10
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">多维知识切片</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            统计推断基本要素与多维切片知识导引 (Inference Knowledge Slices)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            对假设检验四要素、两类错误权衡与功效（Power）、多重检验膨胀及效应量进行多维切片解构，系统筑牢现代推断统计学的底层认知基石。
          </p>
        </div>
      </div>

      {/* 四大致命切片切换 Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slices.map((s) => {
          const Icon = s.icon;
          const isActive = activeSlice === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSlice(s.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-500/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-xs font-bold ${
                    isActive ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {s.title.split('：')[0]}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 line-clamp-1">
                {s.title.split('：')[1]}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{s.sub}</div>
            </button>
          );
        })}
      </div>

      {/* 切片一：四大基本要素解构 */}
      {activeSlice === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片一：统计推断基本要素的假设检验解构】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              假设检验由原假设（H₀）、备择假设（H₁）、检验统计量与显著性水平（α）四大基本要素交织构成。通过样本统计量推断总体未知参数，实现科学严密决策。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center font-mono">1</span>
                <span>原假设 (Null Hypothesis, H₀) — 现状/无效应</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                原假设设定为“无实质效应”、“均值相等”或“新药与对照组无差异”（如 μ₁ = μ₂）。在法庭审判的经典隐喻中，原假设相当于<strong>“无罪推定原则”</strong>：在出示确凿极端证据之前，默认被试对象无罪（无效应）。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-mono">2</span>
                <span>备择假设 (Alternative, H₁) — 研究者意图证明</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                研究者真正期望通过实验数据证实的研究假说（如新药显著降压 μ₁ &gt; μ₂）。只有当样本数据在 H₀ 成立的前提下极其罕见极端时，才推翻 H₀ 转而支持 H₁。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center font-mono">3</span>
                <span>检验统计量 (Test Statistic) — 差异距离标尺</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                将多维样本数据浓缩映射为一个标准化的实数标量（如 t = (x̄ - μ₀) / (s/√n)）。它量化了“观测样本距离原假设理论中心的标准化偏离倍数”，其在 H₀ 下的理论抽样分布已知。
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center font-mono">4</span>
                <span>显著性水平 (Significance Level, α) — 容忍上限</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                研究者在实验设计之初主观设定的、容忍将真实成立的原假设错误拒绝的最大概率上限（即第一类错误率，常设为 0.05 或 0.01）。它划定了拒绝域与临界分位点。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 切片二：第一类与第二类错误动态权衡仿真器 */}
      {activeSlice === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                【切片二：第一类错误与第二类错误的权衡 (Trade-off & Power)】
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                α 控制弃真错误（Type I Error），β 控制取伪错误（Type II Error）。检验功效 (1-β) 量化了在备择假设真实成立时正确拒绝 H₀ 的能力。
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 self-start">
              交互动态权衡模型
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧交互控制器 */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">决定性临界值 c (Critical Value)</span>
                    <span className="font-mono font-bold text-indigo-600">c = {critZ.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.5"
                    step="0.05"
                    value={critZ}
                    onChange={(e) => setCritZ(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">滑动改变拒绝域分界线</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">真实效应大小 Δ (H₁ 相对偏移)</span>
                    <span className="font-mono font-bold text-indigo-600">Δ = {deltaEffect.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    value={deltaEffect}
                    onChange={(e) => setDeltaEffect(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 三大指标对比大看板 */}
              <div className="space-y-2">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-rose-700 font-semibold">第一类错误 α (弃真概率)</div>
                    <div className="text-[10px] text-rose-500">原假设为真却错误拒绝</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-rose-700">
                    {(errorMetrics.alpha * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-amber-800 font-semibold">第二类错误 β (取伪概率)</div>
                    <div className="text-[10px] text-amber-600">备择为真却未能拒绝 H₀</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-amber-800">
                    {(errorMetrics.beta * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-emerald-800 font-semibold">统计功效 Power (1 - β)</div>
                    <div className="text-[10px] text-emerald-600">正确检出真实效应的概率</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-800">
                    {(errorMetrics.power * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：双峰分布与面积重叠交互图 */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  原假设分布 N(0,1) 与真实备择分布 N(Δ,1) 重叠阴影
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <span className="w-3 h-0.5 bg-rose-500"></span>
                    α 弃真区
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-3 h-0.5 bg-emerald-500"></span>
                    1-β 功效区
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto select-none bg-slate-50/60 rounded-xl border border-slate-100"
                >
                  {/* 临界值垂直参考线 */}
                  <line
                    x1={scaleX(critZ)}
                    y1={padding.top}
                    x2={scaleX(critZ)}
                    y2={height - padding.bottom}
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />

                  {/* H0 曲线 */}
                  <path d={pathH0} fill="none" stroke="#64748b" strokeWidth="2" />

                  {/* H1 曲线 */}
                  <path d={pathH1} fill="none" stroke="#10b981" strokeWidth="2.5" />

                  {/* 轴线 */}
                  <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#64748b"
                    strokeWidth="1"
                  />

                  {/* 文本标注 */}
                  <text
                    x={scaleX(0)}
                    y={padding.top + 15}
                    fontSize="11"
                    textAnchor="middle"
                    fill="#64748b"
                    fontFamily="monospace"
                  >
                    H₀: μ=0
                  </text>
                  <text
                    x={scaleX(deltaEffect)}
                    y={padding.top + 15}
                    fontSize="11"
                    textAnchor="middle"
                    fill="#10b981"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    H₁: μ={deltaEffect.toFixed(1)}
                  </text>
                  <text
                    x={scaleX(critZ)}
                    y={height - padding.bottom + 18}
                    fontSize="11"
                    textAnchor="middle"
                    fill="#4f46e5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    临界值 c={critZ.toFixed(2)}
                  </text>
                </svg>
              </div>

              <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-950 leading-relaxed">
                💡 <strong>黄金权衡律：</strong>观察临界值 c 移动时的动态：向右移动 c 会压低 α（弃真风险减少），但会急剧放大 β（取伪漏报增加，功效降低）。<strong>在样本量固定时，α 与 β 无法同时降低，此消彼长；唯一能够同时压低 α 并降低 β（提升 Power）的唯一科学途径，唯有扩大样本容量 n！</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 切片三：三大致命统计推断陷阱 */}
      {activeSlice === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片三：三大致命统计推断陷阱】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              将“未拒绝 H₀”错误等同于“证明 H₀ 绝对成立”；滥用多重比较导致显著性膨胀（Family-wise Error Rate）；忽视样本量不足导致的低统计功效。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 陷阱 1 */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>陷阱一：条件概率逻辑反转</span>
              </div>
              <p className="text-xs text-rose-950/90 leading-relaxed">
                研究者常误以为 p 值是“原假设为真的概率 P(H₀|Data)”。<strong>这是经典的逆概率谬误！</strong>p 值本质是 P(Data|H₀)。正如“如果某人是美国总统，他必然是美国人（概率为1）”，但绝不等于“如果某人是美国人，他是美国总统的概率也是1”。
              </p>
            </div>

            {/* 陷阱 2 */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-600 shrink-0" />
                <span>陷阱二：多重比较显著性指数膨胀</span>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed">
                若单次检验 α = 0.05，同时检验 k 个独立指标时，至少犯一次第一类错误的族误差率（FWER）为：
                <span className="font-mono font-bold block mt-1 text-slate-900">
                  FWER = 1 - (1 - 0.05)^k
                </span>
                当 k = 10 时，虚假发现率高达 40.1%！当 k = 20 时飙升至 64.2%！
              </p>

              {/* 动态计算微交互 */}
              <div className="pt-2 border-t border-amber-200/60">
                <div className="flex justify-between text-[11px] mb-1">
                  <span>多重检验指标数 k = {testCount}</span>
                  <span className="font-mono font-bold text-rose-600">
                    假阳性率: {familywiseAlpha.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={testCount}
                  onChange={(e) => setTestCount(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 h-1.5 bg-amber-200 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 陷阱 3 */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
              <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>陷阱三：低统计功效不可重复危机</span>
              </div>
              <p className="text-xs text-indigo-950/90 leading-relaxed">
                样本容量不足时（如小鼠实验每组仅 5 只），检验功效可能只有 20%~30%。在此情形下即使获得 p &lt; 0.05，其真实阳性发现的后验可靠性（PPV）极低，极易导致科研结果不可重复（Replication Crisis）。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 切片四：误区警示与诊断陷阱 */}
      {activeSlice === 4 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              【切片四：误区警示与诊断陷阱 (Effect Size & ASA Statement)】
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              警惕“盲目迷信 p &lt; 0.05”（p 值仅代表拒绝原假设的概率，必须结合效应量 Effect Size 与置信区间共同评估实际业务价值）。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">
                1. 统计学显著性 (p &lt; 0.05) ≠ 实际业务显著性
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                随着样本量 n 膨胀到十万级别，哪怕两组只相差 0.0001 的微不足道差异，p 值也能达到惊人的 &lt; 0.000001。因此，<strong>绝不能单凭 p 值判定方案优劣</strong>，必须结合标准化效应量 Cohen&apos;s d 或未标准化实际差异均值差评估。
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900">
                2. 置信区间提供“位置 + 精度”双重信息
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                孤立的 p 值只给出一个拒绝与否的二元截断信号，而 95% 置信区间不仅清晰展示了效应估计的最佳点估计值，还通过区间宽度透露了抽样精度。美国统计学会（ASA）强烈建议全面用“置信区间 + 效应量”补充或替代单一 p 值。
              </p>
            </div>
          </div>

          {/* 效应量参考尺 */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-indigo-900">
              现代统计学效应量 (Effect Size) 标准参考基准 (Cohen, 1988)
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">微小效应 (Small)</span>
                <span className="font-bold text-slate-800">d = 0.20</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">两组重叠率 ~85%</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">中等效应 (Medium)</span>
                <span className="font-bold text-indigo-700">d = 0.50</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">肉眼可辨别差异</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-100">
                <span className="text-slate-500 block text-[10px]">巨大效应 (Large)</span>
                <span className="font-bold text-emerald-700">d ≥ 0.80</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">两组差异显著分离</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
