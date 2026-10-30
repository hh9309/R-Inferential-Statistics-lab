import React, { useState, useMemo } from 'react';
import {
  shapiroWilkTest,
  fVarianceTest,
  twoSampleTTest,
  oneSampleTTest,
  pairedTTest,
  mean,
  sd,
} from '../utils/mathStats';
import { TestAlternative } from '../types/stats';
import {
  Workflow,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sliders,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface WizardProps {
  onFinishToReport: (reportData: any) => void;
}

export const Module8_InferenceWizard: React.FC<WizardProps> = ({ onFinishToReport }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: 数据类型与数据输入
  const [wizardType, setWizardType] = useState<'two_sample' | 'one_sample' | 'paired'>('two_sample');
  const [dataInput1, setDataInput1] = useState<string>(
    '15.4, 16.8, 14.2, 18.5, 17.1, 19.3, 15.9, 16.5, 17.8, 18.2, 14.9, 16.0'
  );
  const [dataInput2, setDataInput2] = useState<string>(
    '8.2, 7.5, 9.1, 6.8, 7.9, 8.4, 7.2, 8.8, 6.9, 7.4, 8.1, 7.7'
  );
  const [nullMu, setNullMu] = useState<number>(25.0);

  // Step 3: 假设与参数设置
  const [alpha, setAlpha] = useState<number>(0.05);
  const [alternative, setAlternative] = useState<TestAlternative>('two.sided');
  const [forceVarEqual, setForceVarEqual] = useState<boolean>(false);

  const arr1 = useMemo(() => {
    return dataInput1
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }, [dataInput1]);

  const arr2 = useMemo(() => {
    return dataInput2
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
  }, [dataInput2]);

  // Step 2: 假设前提检验结果
  const assumptionResults = useMemo(() => {
    if (arr1.length < 3) return null;
    const sw1 = shapiroWilkTest(arr1);
    const sw2 = arr2.length >= 3 ? shapiroWilkTest(arr2) : null;
    const fTest = arr1.length >= 2 && arr2.length >= 2 ? fVarianceTest(arr1, arr2) : null;

    // 智能建议
    let recommendedMethod = "Welch's t 检验 (异方差稳健)";
    if (fTest && fTest.pValue >= 0.05) {
      recommendedMethod = "Student's t 检验 (满足方差齐性) 或 Welch's t 检验";
    }
    const hasNormalityIssue = !sw1.isNormal || (sw2 && !sw2.isNormal);

    return { sw1, sw2, fTest, hasNormalityIssue, recommendedMethod };
  }, [arr1, arr2]);

  // Step 3 & 4: 统计量计算
  const finalInference = useMemo(() => {
    if (wizardType === 'two_sample') {
      if (arr1.length < 2 || arr2.length < 2) return null;
      return twoSampleTTest(arr1, arr2, forceVarEqual, alternative, 1 - alpha);
    } else if (wizardType === 'one_sample') {
      if (arr1.length < 2) return null;
      return oneSampleTTest(arr1, nullMu, alternative, 1 - alpha);
    } else {
      if (arr1.length < 2 || arr2.length < 2) return null;
      return pairedTTest(arr1, arr2, alternative, 1 - alpha);
    }
  }, [wizardType, arr1, arr2, forceVarEqual, alternative, alpha, nullMu]);

  const stepsMeta = [
    { num: 1, title: '数据或参数设定', desc: '样本录入与目标定义' },
    { num: 2, title: '假设前提检验', desc: '正态性与方差齐性' },
    { num: 3, title: '显著性计算', desc: '设定 α 与方向计算' },
    { num: 4, title: '科学推断决策', desc: '效应量与报告汇总' },
  ];

  const handleFinish = () => {
    onFinishToReport({
      wizardType,
      arr1,
      arr2,
      assumptionResults,
      finalInference,
      alpha,
      alternative,
    });
  };

  return (
    <div className="space-y-6">
      {/* 模块顶部 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 08 / Module 08
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">全流程导引向导</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            抽样 → 检验 → 决策 → 报告生成全流程导引 (Inference Wizard)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            规范严谨的 4 步向导式统计推断：从数据录入、前提探索性审查、检验选型与统计量计算，直达科学推断决策与一键式白皮书导出。
          </p>
        </div>
      </div>

      {/* 4 步 Stepper 进度条 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stepsMeta.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setCurrentStep(s.num)}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <div>
                  <div
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-indigo-900'
                        : isDone
                        ? 'text-emerald-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 步骤内容主体 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>步骤 1：确定检验设计类型并录入样本数据</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'two_sample', title: '两独立样本对比', desc: '对照组 vs 实验组' },
                { id: 'one_sample', title: '单样本均值推断', desc: '检验是否等于标称 μ₀' },
                { id: 'paired', title: '配对样本前后对比', desc: '同一受试者干预前后' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setWizardType(t.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    wizardType === t.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  样本组 A (有效样本数: {arr1.length})
                </label>
                <textarea
                  rows={4}
                  value={dataInput1}
                  onChange={(e) => setDataInput1(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              {wizardType !== 'one_sample' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    样本组 B (有效样本数: {arr2.length})
                  </label>
                  <textarea
                    rows={4}
                    value={dataInput2}
                    onChange={(e) => setDataInput2(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    原假设目标标称均值 μ₀
                  </label>
                  <input
                    type="number"
                    value={nullMu}
                    onChange={(e) => setNullMu(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={arr1.length < 2 || (wizardType !== 'one_sample' && arr2.length < 2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                <span>下一步：进行前提假设合规性审查</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && assumptionResults && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>步骤 2：正态性与方差齐性前提假设智能诊断</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 正态性审查 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Shapiro-Wilk 正态性检验
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      !assumptionResults.hasNormalityIssue
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {!assumptionResults.hasNormalityIssue ? '正态性合规 ✓' : '偏离正态 ⚠️'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    样本组 A: W = {assumptionResults.sw1.wStatistic.toFixed(4)}, p ={' '}
                    {assumptionResults.sw1.pValue.toFixed(4)}
                  </div>
                  {assumptionResults.sw2 && (
                    <div>
                      样本组 B: W = {assumptionResults.sw2.wStatistic.toFixed(4)}, p ={' '}
                      {assumptionResults.sw2.pValue.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* 方差齐性审查 */}
              {assumptionResults.fTest && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      两样本方差齐性 F 检验
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        assumptionResults.fTest.pValue >= 0.05
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {assumptionResults.fTest.pValue >= 0.05 ? '方差齐性满足 ✓' : '异方差 ⚠️'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    F 统计量 = {assumptionResults.fTest.statistic.toFixed(3)}, p ={' '}
                    {assumptionResults.fTest.pValue.toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            {/* 智能选型建议 */}
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">推断向导智能推荐：</div>
                <p className="mt-0.5 leading-relaxed">
                  基于当前的探索性检验结果，系统推荐使用：
                  <strong className="underline text-indigo-800">
                    {assumptionResults.recommendedMethod}
                  </strong>
                  。Welch 检验能在即使方差不齐时精确控制第一类错误率，符合现代统计学前沿规范。
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>上一步</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>下一步：设定检验参数并计算显著性</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>步骤 3：设定假设检验方向与显著性水平 α</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-2">
                  检验方向 (Alternative Hypothesis)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'two.sided', label: '双侧检验 ≠' },
                    { id: 'greater', label: '右单侧 >' },
                    { id: 'less', label: '左单侧 <' },
                  ].map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => setAlternative(alt.id as any)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        alternative === alt.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {alt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-2">
                  显著性水平 α 阈值
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.01, 0.05, 0.1].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlpha(a)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                        alpha === a
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      α = {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {finalInference && (
              <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-2">
                <div className="text-sky-300 font-bold">【实时显著性计算结果】</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                  <div>t = {finalInference.statistic.toFixed(4)}</div>
                  <div>df = {finalInference.df.toFixed(2)}</div>
                  <div className="text-amber-300 font-bold">
                    p-value = {finalInference.pValue < 0.0001 ? '< 0.0001' : finalInference.pValue.toFixed(4)}
                  </div>
                  <div>Cohen&apos;s d = {(finalInference as any).cohensD?.toFixed(3) || 'N/A'}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>上一步</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <span>下一步：生成科学推断结论</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && finalInference && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>步骤 4：统计推断最终决策与综合白皮书</span>
            </h3>

            {/* 决策卡片 */}
            <div
              className={`p-5 rounded-2xl border ${
                finalInference.decision === 'reject'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold tracking-wide uppercase font-mono">
                  {finalInference.decision === 'reject'
                    ? '🎯 决策结论：拒绝原假设 H₀ (Statistically Significant)'
                    : '🛡️ 决策结论：未拒绝原假设 H₀ (Fail to Reject)'}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-current">
                  p = {finalInference.pValue < 0.0001 ? '< 0.0001' : finalInference.pValue.toFixed(4)}
                </span>
              </div>
              <p className="text-xs mt-2 leading-relaxed opacity-95">
                {finalInference.decision === 'reject'
                  ? `在 α = ${alpha} 水平下，数据提供了极强的统计证据拒绝原假设。效应量 Cohen's d 为 ${(finalInference as any).cohensD?.toFixed(2)}，${(finalInference as any).cohensD > 0.8 ? '属于大效应' : '属于中等效应'}。`
                  : `在 α = ${alpha} 水平下，当前样本未能提供推翻 H₀ 的充分证据。请注意：这绝不代表证明了 H₀ 为真，建议进一步评估样本容量与统计功效。`}
              </p>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>上一步</span>
              </button>

              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>生成并跳转到全套报告导出中心 →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
