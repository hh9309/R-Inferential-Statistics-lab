import React from 'react';
import {
  Compass,
  Activity,
  BarChart2,
  GitCommit,
  Layers,
  FileCode,
  Bot,
  Workflow,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeModule: number;
  setActiveModule: (id: number) => void;
  onOpenAIDrawer: () => void;
  onOpenReport: () => void;
}

export const MODULE_TABS = [
  { id: 1, name: '推断代数', sub: 'CLT与大数定律', icon: Compass },
  { id: 2, name: '抽样模拟', sub: '四大连续分布', icon: Activity },
  { id: 3, name: '置信区间', sub: '100次抽样覆盖', icon: BarChart2 },
  { id: 4, name: '参数检验', sub: '单/双/配对/方差', icon: GitCommit },
  { id: 5, name: '六大案例', sub: '实战案例库', icon: Layers },
  { id: 6, name: 'R代码引擎', sub: 'stats控制台', icon: FileCode },
  { id: 7, name: 'AI随诊', sub: '统计谬误诊断', icon: Bot },
  { id: 8, name: '全流程导引', sub: '抽样检验决策', icon: Workflow },
  { id: 9, name: '报告导出', sub: 'PDF/HTML/Rmd', icon: Download },
  { id: 10, name: '推断要素', sub: '四大多维切片', icon: BookOpen },
];

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onOpenAIDrawer,
  onOpenReport,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      {/* 顶部主品牌栏 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-mono font-bold text-lg text-sky-400">
              R
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                R 统计推断与假设检验 WebApp 实验室
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                v2.6 Stats Core
              </span>
            </div>
            <p className="text-xs text-slate-400">
              概率抽样 · 参数估计 · 显著性检验 · 严密推断代数与实战决策
            </p>
          </div>
        </div>

        {/* 顶部右侧快捷操作 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAIDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors border border-indigo-400/40"
            title="唤醒 AI 随诊专家，诊断统计谬误"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 随诊专家</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="打开报告导出中心"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>导出报告</span>
          </button>
        </div>
      </div>

      {/* 10大核心模块导航条 */}
      <div className="border-t border-slate-800/80 bg-slate-900/95 backdrop-blur overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex space-x-1 py-1.5 min-w-max">
          {MODULE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight">{tab.name}</div>
                  <div className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
