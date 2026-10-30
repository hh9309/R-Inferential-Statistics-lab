import React, { useState } from 'react';
import { Header } from './components/Header';
import { Module1_CLTAlgebra } from './components/Module1_CLTAlgebra';
import { Module2_Distributions } from './components/Module2_Distributions';
import { Module3_ConfidenceIntervals } from './components/Module3_ConfidenceIntervals';
import { Module4_HypothesisTesting } from './components/Module4_HypothesisTesting';
import { Module5_CaseStudies } from './components/Module5_CaseStudies';
import { Module6_RStatsEngine } from './components/Module6_RStatsEngine';
import { Module7_AIDiagnosisModal } from './components/Module7_AIDiagnosisModal';
import { Module8_InferenceWizard } from './components/Module8_InferenceWizard';
import { Module9_ReportExport } from './components/Module9_ReportExport';
import { Module10_KnowledgeSlices } from './components/Module10_KnowledgeSlices';
import { ShieldCheck, Compass, Sparkles } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);
  const [customReportData, setCustomReportData] = useState<any>(null);
  const [rEngineCode, setREngineCode] = useState<string>('');

  const handleLoadIntoREngine = (code: string) => {
    setREngineCode(code);
    setActiveModule(6); // 跳转至 R 引擎
  };

  const handleFinishWizard = (data: any) => {
    setCustomReportData(data);
    setActiveModule(9); // 跳转至报告导出中心
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 顶部主导航栏 */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenAIDrawer={() => setIsAIDrawerOpen(true)}
        onOpenReport={() => setActiveModule(9)}
      />

      {/* 主体交互模块工作区 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 1 && <Module1_CLTAlgebra />}
        {activeModule === 2 && <Module2_Distributions />}
        {activeModule === 3 && <Module3_ConfidenceIntervals />}
        {activeModule === 4 && <Module4_HypothesisTesting />}
        {activeModule === 5 && (
          <Module5_CaseStudies onLoadIntoREngine={handleLoadIntoREngine} />
        )}
        {activeModule === 6 && <Module6_RStatsEngine initialCode={rEngineCode} />}
        {activeModule === 7 && <Module7_AIDiagnosisModal isStandaloneTab={true} />}
        {activeModule === 8 && (
          <Module8_InferenceWizard onFinishToReport={handleFinishWizard} />
        )}
        {activeModule === 9 && <Module9_ReportExport customReportData={customReportData} />}
        {activeModule === 10 && <Module10_KnowledgeSlices />}
      </main>

      {/* 悬浮 AI 随诊专家抽屉 */}
      <Module7_AIDiagnosisModal
        isOpenFloating={isAIDrawerOpen}
        onCloseFloating={() => setIsAIDrawerOpen(false)}
        isStandaloneTab={false}
      />

      {/* 底部实验室状态与学术背书栏 */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px]">
              R
            </div>
            <span className="font-semibold text-slate-200">
              R-Statistical-Inference-lab · 统计推断与假设检验 WebApp 实验室
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>规范基准: ASA 2016 p-value 官方准则</span>
            <span>·</span>
            <span>核心库: R::stats & pwr</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              在线模拟引擎就绪
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
