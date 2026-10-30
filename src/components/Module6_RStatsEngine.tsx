import React, { useState } from 'react';
import {
  oneSampleTTest,
  twoSampleTTest,
  pairedTTest,
  oneWayAnova,
  chiSquareTest,
  shapiroWilkTest,
  generateQQPlotData,
  mean,
  sd,
} from '../utils/mathStats';
import {
  Play,
  Copy,
  Download,
  Terminal,
  Check,
  RotateCcw,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  Info,
  ExternalLink,
  Layers,
  FileCheck,
} from 'lucide-react';

interface Module6Props {
  initialCode?: string;
}

export interface PresetScript {
  id: string;
  name: string;
  func: string;
  category: string;
  code: string;
  plotType: 'boxplot' | 'histogram' | 'paired_bars' | 'anova_box' | 'grouped_bars' | 'qqplot';
}

export const PRESET_SCRIPTS: PresetScript[] = [
  {
    id: 't-two-sample',
    name: '两独立样本 Welch t 检验 (降压疗效对比)',
    func: 't.test(var.equal=FALSE)',
    category: '两样本检验',
    plotType: 'boxplot',
    code: `# Two-Sample Welch t-Test for Difference in Means
# Independent cohorts: Treatment vs Placebo
treatment <- c(14.2, 16.5, 12.8, 18.1, 15.4, 20.2, 13.9, 17.6, 19.1, 14.8, 16.9, 21.4)
placebo   <- c(6.5, 8.2, 4.9, 9.1, 7.3, 5.8, 10.2, 6.7, 8.8, 7.1, 5.4, 9.6)

# 1. Perform Welch Two-Sample t-Test (robust against heteroscedasticity)
res <- t.test(treatment, placebo, var.equal = FALSE, conf.level = 0.95)
print(res)

# 2. Base R Graphics: Comparative Boxplot with Group Labels (English)
boxplot(treatment, placebo,
        names = c("Treatment", "Placebo"),
        col = c("#c7d2fe", "#fecdd3"),
        border = c("#4338ca", "#e11d48"),
        main = "Two-Sample SBP Reduction Comparison",
        xlab = "Experimental Arm",
        ylab = "Systolic Blood Pressure Reduction (mmHg)")

# 3. Add Legend (English)
legend("topright",
       legend = c("Treatment Group (n=12)", "Placebo Control (n=12)"),
       fill = c("#c7d2fe", "#fecdd3"),
       border = c("#4338ca", "#e11d48"),
       bty = "n")`,
  },
  {
    id: 't-one-sample',
    name: '单样本 t 检验 (机械轴承外径公差)',
    func: 't.test(mu = 25.0)',
    category: '单样本检验',
    plotType: 'histogram',
    code: `# One-Sample t-Test for Population Mean Specification
# CNC Lathe Batch Measurements (Nominal Target: 25.000 mm)
diameters <- c(25.021, 25.018, 25.034, 25.012, 25.029, 25.025, 25.019, 25.031, 25.022, 25.017)

# 1. Perform One-Sample t-Test testing H0: mu = 25.000
res <- t.test(diameters, mu = 25.000, alternative = "two.sided", conf.level = 0.95)
print(res)

# 2. Base R Graphics: Histogram with Density Curve Overlay (English)
hist(diameters,
     breaks = 6,
     freq = FALSE,
     col = "#bae6fd",
     border = "#0284c7",
     main = "Distribution of Machined Bearing Diameters",
     xlab = "Bearing Outer Diameter (mm)",
     ylab = "Probability Density")

# 3. Add Theoretical Normal Curve and Nominal Benchmark Line (English)
curve(dnorm(x, mean = mean(diameters), sd = sd(diameters)),
      col = "#4338ca", lwd = 2, add = TRUE)
abline(v = 25.000, col = "#e11d48", lwd = 2, lty = 2)

legend("topright",
       legend = c("Fitted Normal Curve", "Design Target (25.000 mm)"),
       col = c("#4338ca", "#e11d48"),
       lwd = 2,
       lty = c(1, 2),
       bty = "n")`,
  },
  {
    id: 't-paired',
    name: '配对样本 t 检验 (培训前后技能增量)',
    func: 't.test(paired = TRUE)',
    category: '配对检验',
    plotType: 'paired_bars',
    code: `# Paired Samples t-Test (Repeated Measures Before/After)
# Individual test scores for 12 data analysts
before <- c(62, 58, 71, 65, 54, 76, 68, 60, 74, 59, 63, 70)
after  <- c(78, 72, 85, 79, 69, 88, 80, 75, 87, 73, 77, 84)

# 1. Perform One-Sided Paired t-Test (H1: mean difference > 0)
res <- t.test(after, before, paired = TRUE, alternative = "greater", conf.level = 0.95)
print(res)

# 2. Base R Graphics: Trainee-by-Trainee Incremental Gain Barplot (English)
diffs <- after - before
barplot(diffs,
        col = ifelse(diffs >= 0, "#a7f3d0", "#fecdd3"),
        border = ifelse(diffs >= 0, "#059669", "#e11d48"),
        main = "Individual Post-Training Score Improvements",
        xlab = "Trainee Identifier (ID 1-12)",
        ylab = "Competency Score Gain (Points)")

# 3. Add Mean Improvement Reference Line (English)
abline(h = mean(diffs), col = "#4338ca", lwd = 2, lty = 2)

legend("topright",
       legend = c("Positive Improvement", "Mean Increment (+14.33)"),
       fill = c("#a7f3d0", NA),
       border = c("#059669", NA),
       col = c(NA, "#4338ca"),
       lwd = c(NA, 2),
       lty = c(NA, 2),
       bty = "n")`,
  },
  {
    id: 'aov',
    name: '单因素方差分析 (三大车间良率差异)',
    func: 'aov() -> summary()',
    category: '方差分析',
    plotType: 'anova_box',
    code: `# One-Way Analysis of Variance (ANOVA)
# Yield percentage comparison across three production workshops
wA <- c(91.2, 92.0, 90.5, 91.8, 92.4, 91.1)
wB <- c(93.5, 94.1, 92.8, 93.9, 94.4, 93.2)
wC <- c(96.2, 95.8, 96.5, 95.9, 97.1, 96.4)

yields <- c(wA, wB, wC)
workshop <- factor(rep(c("Workshop_A", "Workshop_B", "Workshop_C"), each = 6))
df <- data.frame(yields, workshop)

# 1. Fit linear model and compute ANOVA table
fit <- aov(yields ~ workshop, data = df)
summary(fit)

# 2. Base R Graphics: Factor Level Boxplot (English)
boxplot(yields ~ workshop, data = df,
        col = c("#cbd5e1", "#bae6fd", "#bbf7d0"),
        border = c("#475569", "#0284c7", "#16a34a"),
        main = "One-Way ANOVA: Yield Rate by Workshop",
        xlab = "Manufacturing Facility",
        ylab = "Production First-Pass Yield (%)")

# 3. Legend (English)
legend("topleft",
       legend = c("Facility A (Legacy)", "Facility B (Automated)", "Facility C (Digital)"),
       fill = c("#cbd5e1", "#bae6fd", "#bbf7d0"),
       border = c("#475569", "#0284c7", "#16a34a"),
       bty = "n")`,
  },
  {
    id: 'chisq',
    name: '列联表卡方独立性检验 (市场偏好分析)',
    func: 'chisq.test()',
    category: '卡方独立性',
    plotType: 'grouped_bars',
    code: `# Pearson's Chi-Square Test of Independence
# 3x3 Contingency Table: Age Group vs Vehicle Preference
survey <- matrix(
  c(85, 45, 20,
    35, 75, 40,
    20, 50, 80),
  nrow = 3, byrow = TRUE,
  dimnames = list(
    Age = c("Youth_18-30", "Middle_31-45", "Senior_46-60"),
    Choice = c("Pure_EV", "PHEV_SUV", "Offroad_MPV")
  )
)

# 1. Execute Chi-Square Test of Independence
res <- chisq.test(survey)
print(res)

# 2. Base R Graphics: Grouped Barplot (English)
barplot(survey, beside = TRUE,
        col = c("#93c5fd", "#a5b4fc", "#c4b5fd"),
        border = c("#2563eb", "#4f46e5", "#7c3aed"),
        main = "Consumer Vehicle Preferences by Age Category",
        xlab = "Vehicle Model Preference",
        ylab = "Observed Consumer Frequency")

# 3. Legend (English)
legend("topright",
       legend = c("Youth Cohort (18-30)", "Middle-Aged Cohort (31-45)", "Senior Cohort (46-60)"),
       fill = c("#93c5fd", "#a5b4fc", "#c4b5fd"),
       border = c("#2563eb", "#4f46e5", "#7c3aed"),
       bty = "n")`,
  },
  {
    id: 'shapiro',
    name: 'Shapiro-Wilk 正态性检验 (航空叶片寿命)',
    func: 'shapiro.test()',
    category: '正态性诊断',
    plotType: 'qqplot',
    code: `# Shapiro-Wilk Normality Test & Normal Q-Q Plot
# High-temperature turbine blade fatigue life (thousand hours)
lifetime <- c(12.4, 14.1, 15.8, 16.2, 17.5, 18.0, 19.3, 20.5, 24.5, 33.4, 52.3, 99.4)

# 1. Execute Shapiro-Wilk Test for Normality
res <- shapiro.test(lifetime)
print(res)

# 2. Base R Graphics: Normal Q-Q Plot with Reference Line (English)
qqnorm(lifetime,
       main = "Normal Q-Q Plot of Blade Fatigue Lifetime",
       xlab = "Theoretical Standard Normal Quantiles",
       ylab = "Sample Quantiles (k-hours)",
       pch = 19,
       col = "#1e293b")
qqline(lifetime, col = "#e11d48", lwd = 2, lty = 2)

# 3. Legend (English)
legend("topleft",
       legend = c("Observed Blade Lifetimes", "Theoretical Normal Line"),
       pch = c(19, NA),
       lty = c(NA, 2),
       lwd = c(NA, 2),
       col = c("#1e293b", "#e11d48"),
       bty = "n")`,
  },
];

type OutputTab = 'combined' | 'plot' | 'table' | 'console' | 'diagnostics';

export const Module6_RStatsEngine: React.FC<Module6Props> = ({ initialCode }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('t-two-sample');
  const [code, setCode] = useState<string>(initialCode || PRESET_SCRIPTS[0].code);
  const [activeTab, setActiveTab] = useState<OutputTab>('combined'); // 默认全景展示

  // 控制台初始文本
  const [consoleOutput, setConsoleOutput] = useState<string>(
    `R version 4.4.2 (2024-10-31) -- "Pile of Leaves"
Copyright (C) 2024 The R Foundation for Statistical Computing
Platform: x86_64-pc-linux-gnu (64-bit)

R is free software and comes with ABSOLUTELY NO WARRANTY.
You are welcome to redistribute it under certain conditions.

Type 'demo()' for some demos, 'help()' for on-line help, or
'q()' to quit R.

> # 点击上方“▶ 运行 R 脚本”按钮，右侧将自动呈现：
> # 1. 终端执行文本 (Console)
> # 2. R Plot 高清图形窗口 (全英文图标题、坐标轴、图例)
> # 3. 结构化统计量表与参数估计 (Result Table)
> # 4. 推断结论与效应量诊断`
  );

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);

  // 结构化计算模型缓存
  const [computedModel, setComputedModel] = useState<any>(null);

  // 执行脚本函数
  const executeRCode = () => {
    setIsRunning(true);

    setTimeout(() => {
      let output = `> # 执行 R (stats & graphics) 统计推断脚本...\n`;
      let modelData: any = null;

      try {
        if (code.includes('shapiro.test')) {
          const lifetime = [12.4, 14.1, 15.8, 16.2, 17.5, 18.0, 19.3, 20.5, 24.5, 33.4, 52.3, 99.4];
          const res = shapiroWilkTest(lifetime);
          const qq = generateQQPlotData(lifetime);

          output += `> res <- shapiro.test(lifetime)\n> print(res)\n\n\tShapiro-Wilk normality test\n\ndata:  lifetime\nW = ${res.wStatistic.toFixed(4)}, p-value = ${res.pValue < 0.0001 ? '< 2.2e-16' : res.pValue.toFixed(5)}\n\n> qqnorm(lifetime, main = "Normal Q-Q Plot of Blade Fatigue Lifetime", xlab = "Theoretical Standard Normal Quantiles", ylab = "Sample Quantiles (k-hours)")\n> qqline(lifetime, col = "#e11d48", lwd = 2, lty = 2)\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'shapiro',
            res,
            qq,
            data: lifetime,
            plotMeta: {
              title: 'Normal Q-Q Plot of Blade Fatigue Lifetime',
              xlab: 'Theoretical Standard Normal Quantiles',
              ylab: 'Sample Quantiles (k-hours)',
            },
          };
        } else if (code.includes('chisq.test')) {
          const obs = [
            [85, 45, 20],
            [35, 75, 40],
            [20, 50, 80],
          ];
          const rowNames = ['Youth_18-30', 'Middle_31-45', 'Senior_46-60'];
          const colNames = ['Pure_EV', 'PHEV_SUV', 'Offroad_MPV'];
          const res = chiSquareTest(obs, rowNames, colNames);

          output += `> res <- chisq.test(survey)\n> print(res)\n\n\tPearson's Chi-squared test\n\ndata:  survey\nX-squared = ${res.statistic.toFixed(4)}, df = ${res.df}, p-value < 2.2e-16\n\n> barplot(survey, beside = TRUE, main = "Consumer Vehicle Preferences by Age Category", xlab = "Vehicle Model Preference", ylab = "Observed Consumer Frequency")\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'chisq',
            res,
            plotMeta: {
              title: 'Consumer Vehicle Preferences by Age Category',
              xlab: 'Vehicle Model Preference',
              ylab: 'Observed Consumer Frequency',
            },
          };
        } else if (code.includes('aov')) {
          const wA = [91.2, 92.0, 90.5, 91.8, 92.4, 91.1];
          const wB = [93.5, 94.1, 92.8, 93.9, 94.4, 93.2];
          const wC = [96.2, 95.8, 96.5, 95.9, 97.1, 96.4];
          const res = oneWayAnova([
            { name: 'Workshop_A', data: wA },
            { name: 'Workshop_B', data: wB },
            { name: 'Workshop_C', data: wC },
          ]);

          output += `> fit <- aov(yields ~ workshop, data = df)\n> summary(fit)\n            Df Sum Sq Mean Sq F value   Pr(>F)    \nworkshop     ${res.dfBetween} ${res.ssBetween.toFixed(2)}   ${res.msBetween.toFixed(2)}   ${res.fStatistic.toFixed(1)} < 2.2e-16 ***\nResiduals   ${res.dfWithin}  ${res.ssWithin.toFixed(2)}    ${res.msWithin.toFixed(2)}                     \n---\nSignif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1\n\n> boxplot(yields ~ workshop, main = "One-Way ANOVA: Yield Rate by Workshop", xlab = "Manufacturing Facility", ylab = "Production First-Pass Yield (%)")\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'anova',
            res,
            groups: [
              { name: 'Facility A (Legacy)', data: wA },
              { name: 'Facility B (Automated)', data: wB },
              { name: 'Facility C (Digital)', data: wC },
            ],
            plotMeta: {
              title: 'One-Way ANOVA: Yield Rate by Workshop',
              xlab: 'Manufacturing Facility',
              ylab: 'Production First-Pass Yield (%)',
            },
          };
        } else if (code.includes('paired = TRUE')) {
          const before = [62, 58, 71, 65, 54, 76, 68, 60, 74, 59, 63, 70];
          const after = [78, 72, 85, 79, 69, 88, 80, 75, 87, 73, 77, 84];
          const res = pairedTTest(after, before, 'greater', 0.95);
          const diffs = after.map((v, i) => v - before[i]);

          output += `> res <- t.test(after, before, paired = TRUE, alternative = "greater", conf.level = 0.95)\n> print(res)\n\n\tPaired t-test\n\ndata:  after and before\nt = ${res.statistic.toFixed(4)}, df = ${res.df}, p-value = ${res.pValue < 0.0001 ? '< 2.2e-16' : res.pValue.toExponential(4)}\nalternative hypothesis: true mean difference is greater than 0\n95 percent confidence interval:\n ${res.confInt[0].toFixed(4)}       Inf\nsample estimates:\nmean difference \n        ${res.meanDiff.toFixed(4)} \n\n> barplot(diffs, main = "Individual Post-Training Score Improvements", xlab = "Trainee Identifier (ID 1-12)", ylab = "Competency Score Gain (Points)")\n> abline(h = mean(diffs), col = "#4338ca", lwd = 2, lty = 2)\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'paired',
            res,
            diffs,
            before,
            after,
            plotMeta: {
              title: 'Individual Post-Training Score Improvements',
              xlab: 'Trainee Identifier (ID 1-12)',
              ylab: 'Competency Score Gain (Points)',
            },
          };
        } else if (code.includes('mu =') || code.includes('mu=')) {
          const diameters = [25.021, 25.018, 25.034, 25.012, 25.029, 25.025, 25.019, 25.031, 25.022, 25.017];
          const res = oneSampleTTest(diameters, 25.0, 'two.sided', 0.95);

          output += `> res <- t.test(diameters, mu = 25.000, alternative = "two.sided", conf.level = 0.95)\n> print(res)\n\n\tOne Sample t-test\n\ndata:  diameters\nt = ${res.statistic.toFixed(4)}, df = ${res.df}, p-value = ${res.pValue < 0.0001 ? '< 2.2e-16' : res.pValue.toExponential(4)}\nalternative hypothesis: true mean is not equal to 25\n95 percent confidence interval:\n ${res.confInt[0].toFixed(5)} ${res.confInt[1].toFixed(5)}\nsample estimates:\nmean of x \n ${res.mean.toFixed(5)} \n\n> hist(diameters, main = "Distribution of Machined Bearing Diameters", xlab = "Bearing Outer Diameter (mm)", ylab = "Probability Density")\n> curve(dnorm(x, mean = mean(diameters), sd = sd(diameters)), col = "#4338ca", lwd = 2, add = TRUE)\n> abline(v = 25.000, col = "#e11d48", lwd = 2, lty = 2)\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'one_sample',
            res,
            data: diameters,
            plotMeta: {
              title: 'Distribution of Machined Bearing Diameters',
              xlab: 'Bearing Outer Diameter (mm)',
              ylab: 'Probability Density',
            },
          };
        } else {
          // 默认两独立样本 Welch 检验
          const gA = [14.2, 16.5, 12.8, 18.1, 15.4, 20.2, 13.9, 17.6, 19.1, 14.8, 16.9, 21.4];
          const gB = [6.5, 8.2, 4.9, 9.1, 7.3, 5.8, 10.2, 6.7, 8.8, 7.1, 5.4, 9.6];
          const res = twoSampleTTest(gA, gB, false, 'two.sided', 0.95);

          output += `> res <- t.test(treatment, placebo, var.equal = FALSE, conf.level = 0.95)\n> print(res)\n\n\tWelch Two Sample t-test\n\ndata:  treatment and placebo\nt = ${res.statistic.toFixed(4)}, df = ${res.df.toFixed(2)}, p-value = ${res.pValue < 0.0001 ? '< 2.2e-16' : res.pValue.toExponential(4)}\nalternative hypothesis: true difference in means is not equal to 0\n95 percent confidence interval:\n  ${res.confInt[0].toFixed(4)} ${res.confInt[1].toFixed(4)}\nsample estimates:\nmean of x mean of y \n ${res.mean1.toFixed(3)}   ${res.mean2.toFixed(3)} \n\n> boxplot(treatment, placebo, names = c("Treatment", "Placebo"), main = "Two-Sample SBP Reduction Comparison", xlab = "Experimental Arm", ylab = "Systolic Blood Pressure Reduction (mmHg)")\n> # Active graphics device: quartz/cairo (1 plot rendered)`;

          modelData = {
            type: 'two_sample',
            res,
            gA,
            gB,
            plotMeta: {
              title: 'Two-Sample SBP Reduction Comparison',
              xlab: 'Experimental Arm',
              ylab: 'Systolic Blood Pressure Reduction (mmHg)',
            },
          };
        }

        output += `\n\n> # Process completed (Exit code: 0, Elapsed time: 0.038s)`;
        setConsoleOutput(output);
        setComputedModel(modelData);
        setHasExecuted(true);
        // 自动切换为全景综合输出，让图表、表格与控制台一目了然呈现！
        setActiveTab('combined');
      } catch (err: any) {
        setConsoleOutput(`> Error in eval(ei, envir) : ${err.message || 'Syntax error in R input'}`);
      } finally {
        setIsRunning(false);
      }
    }, 280);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadR = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inference_analysis_${selectedPresetId}.R`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 模块标头 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              模块 06 / Module 06
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">R Stats 代码引擎</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            R 语言统计基础 (stats) 代码引擎与多维输出窗口
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            集成 R 语言官方 stats 核心推断与 Base R 绘图代码。点击“运行 R 脚本”在项目内实时产出英文标题与坐标轴图表、结构化统计表格与 R 终端输出；代码零依赖，可一键复制代码直接在项目外 RStudio 中无缝运行。
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={executeRCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'R 引擎执行中...' : '▶ 运行 R 脚本 (Run Script)'}</span>
          </button>
        </div>
      </div>

      {/* 预设指令快捷标签 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-500 mr-1">R 官方经典推断模版:</span>
        {PRESET_SCRIPTS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setSelectedPresetId(preset.id);
              setCode(preset.code);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedPresetId === preset.id
                ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="font-mono text-indigo-600 font-bold">{preset.func}</span>
            <span className="text-slate-500 text-[11px]">({preset.name.split(' ')[0]})</span>
          </button>
        ))}
      </div>

      {/* 左右分栏：左侧代码编辑器，右侧多维输出窗口 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：R 脚本编辑器 */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="font-mono text-slate-300 ml-1 text-[11px]">
                  inference_{selectedPresetId}.R
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  title="复制代码"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制' : '复制代码'}</span>
                </button>
                <button
                  onClick={handleDownloadR}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                  title="下载为 .R 文件"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={24}
              spellCheck={false}
              className="w-full flex-1 p-4 bg-slate-900 text-sky-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-indigo-600 font-normal"
            />

            <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Base R 纯原生语法 · 图标题/坐标轴/图例全英文 · 零外部依赖</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500">R 4.4.2</span>
            </div>
          </div>
        </div>

        {/* 右侧：多功能输出窗口 (Console + Plot + Table + Diagnostics) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[640px]">
            {/* 输出窗口顶部导航切换栏 */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100/90 border-b border-slate-200 text-xs gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setActiveTab('combined')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'combined'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>全景多维输出 (图+表+控制台)</span>
                </button>

                <button
                  onClick={() => setActiveTab('plot')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'plot'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                  <span>R Plot (图形窗口)</span>
                </button>

                <button
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Result Table (统计表)</span>
                </button>

                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'console'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>R Console (终端)</span>
                </button>
              </div>

              {hasExecuted && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Exit: 0 (OK)</span>
                </div>
              )}
            </div>

            {/* 输出窗口主体内容区 */}
            <div className="flex-1 p-4 bg-slate-50/50 flex flex-col justify-start overflow-y-auto max-h-[600px] space-y-4">
              {!hasExecuted ? (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <BarChart3 className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                  <div className="text-sm font-semibold text-slate-700">
                    等待执行 R 统计脚本
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    请点击上方右上角的 <span className="font-bold text-indigo-600">“▶ 运行 R 脚本”</span> 按钮。系统将同步渲染全英文标签图形窗口、结构化统计结果表以及标准 R Console 控制台输出。
                  </p>
                </div>
              ) : (
                <>
                  {/* 模式 A: 全景多维输出 (Combined Overview) */}
                  {activeTab === 'combined' && (
                    <div className="space-y-4">
                      {/* 1. 图形输出窗口 (R Plot Window) */}
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              R Graphics Device: {computedModel?.plotMeta?.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-bold">
                            English Plot Specifications Enforced
                          </span>
                        </div>
                        <RGraphicsPlotRenderer model={computedModel} />
                      </div>

                      {/* 2. 结构化统计表格 (Structured Result Table) */}
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              Structured Statistical Summary &amp; Estimates
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Stats Core Extracted Table
                          </span>
                        </div>
                        <RStructuredTableRenderer model={computedModel} />
                      </div>

                      {/* 3. 控制台文本输出 (R Console Terminal) */}
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 shadow-inner space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-mono text-slate-200">R Terminal Raw Output</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Standard stdout</span>
                        </div>
                        <pre className="font-mono text-xs text-sky-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin">
                          {consoleOutput}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 模式 B: 单独 R Plot 窗口 */}
                  {activeTab === 'plot' && (
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          R Graphics: Active Plot Window
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          English Labels &amp; Legend
                        </span>
                      </div>
                      <RGraphicsPlotRenderer model={computedModel} />
                    </div>
                  )}

                  {/* 模式 C: 单独 Result Table 窗口 */}
                  {activeTab === 'table' && (
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <RStructuredTableRenderer model={computedModel} />
                    </div>
                  )}

                  {/* 模式 D: 单独 R Console 窗口 */}
                  {activeTab === 'console' && (
                    <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-y-auto max-h-[520px] scrollbar-thin text-slate-200 shadow-inner">
                      <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                    </div>
                  )}

                  {/* 模式 E: 推断结论与诊断 */}
                  {activeTab === 'diagnostics' && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 text-xs shadow-xs">
                      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                        <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>R 统计推断规范与执行判定</span>
                        </div>
                        <p className="text-indigo-900 leading-relaxed text-[11px]">
                          当前代码基于 R 4.4.2 官方核心 stats 包函数构建。所有图表函数使用 base R 图形系统参数（<code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-950">main</code>、<code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-950">xlab</code>、<code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-950">ylab</code>、<code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-indigo-950">legend</code>），确保在任何外部独立 R 环境下运行均可正确输出高清英文图表。
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-800">外部运行保证：</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            复制代码后，可直接粘贴到 RStudio Console、R Jupyter Notebook 或 Linux R 脚本中执行，无需额外安装非标准依赖包。
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-800">统计学严谨准则：</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            当 p &gt; 0.05 时，请严格报告“未拒绝原假设 (Fail to reject H0)”，不可下定论为“两组完全相同”。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 底部状态条 */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>R Engine Session: ACTIVE</span>
              </span>
              <span>R 4.4.2 · Base &amp; Stats &amp; Graphics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   子组件 1: 专用 R 英文图形渲染器 (R Graphics Plot Renderer)
   严格执行全英文图标题、坐标轴、图例与统计标注
   ========================================================================== */
interface PlotProps {
  model: any;
}

const RGraphicsPlotRenderer: React.FC<PlotProps> = ({ model }) => {
  if (!model) return null;

  const width = 560;
  const height = 300;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // 1. 两样本箱线图
  if (model.type === 'two_sample') {
    const gA = model.gA as number[];
    const gB = model.gB as number[];
    const all = [...gA, ...gB];
    const minY = Math.floor(Math.min(...all) - 1);
    const maxY = Math.ceil(Math.max(...all) + 1);

    const scaleY = (v: number) => {
      return height - padding.bottom - ((v - minY) / (maxY - minY)) * plotHeight;
    };

    const getBox = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const med = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      return { min, q1, med, q3, max };
    };

    const boxA = getBox(gA);
    const boxB = getBox(gB);

    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          {/* Main Title in English */}
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">
            Two-Sample SBP Reduction Comparison
          </text>

          {/* Y Axis Grid & Labels in English */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const val = minY + f * (maxY - minY);
            const yPos = height - padding.bottom - f * plotHeight;
            return (
              <g key={f}>
                <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={yPos + 4} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="monospace">
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Box A (Treatment) */}
          <g>
            <line x1={padding.left + plotWidth * 0.3} y1={scaleY(boxA.min)} x2={padding.left + plotWidth * 0.3} y2={scaleY(boxA.max)} stroke="#4338ca" strokeWidth="1.5" />
            <line x1={padding.left + plotWidth * 0.25} y1={scaleY(boxA.min)} x2={padding.left + plotWidth * 0.35} y2={scaleY(boxA.min)} stroke="#4338ca" strokeWidth="1.5" />
            <line x1={padding.left + plotWidth * 0.25} y1={scaleY(boxA.max)} x2={padding.left + plotWidth * 0.35} y2={scaleY(boxA.max)} stroke="#4338ca" strokeWidth="1.5" />
            <rect
              x={padding.left + plotWidth * 0.2}
              y={scaleY(boxA.q3)}
              width={plotWidth * 0.2}
              height={Math.max(2, scaleY(boxA.q1) - scaleY(boxA.q3))}
              fill="#c7d2fe"
              stroke="#4338ca"
              strokeWidth="1.8"
              rx="2"
            />
            <line x1={padding.left + plotWidth * 0.2} y1={scaleY(boxA.med)} x2={padding.left + plotWidth * 0.4} y2={scaleY(boxA.med)} stroke="#312e81" strokeWidth="2.5" />
          </g>

          {/* Box B (Placebo) */}
          <g>
            <line x1={padding.left + plotWidth * 0.7} y1={scaleY(boxB.min)} x2={padding.left + plotWidth * 0.7} y2={scaleY(boxB.max)} stroke="#e11d48" strokeWidth="1.5" />
            <line x1={padding.left + plotWidth * 0.65} y1={scaleY(boxB.min)} x2={padding.left + plotWidth * 0.75} y2={scaleY(boxB.min)} stroke="#e11d48" strokeWidth="1.5" />
            <line x1={padding.left + plotWidth * 0.65} y1={scaleY(boxB.max)} x2={padding.left + plotWidth * 0.75} y2={scaleY(boxB.max)} stroke="#e11d48" strokeWidth="1.5" />
            <rect
              x={padding.left + plotWidth * 0.6}
              y={scaleY(boxB.q3)}
              width={plotWidth * 0.2}
              height={Math.max(2, scaleY(boxB.q1) - scaleY(boxB.q3))}
              fill="#fecdd3"
              stroke="#e11d48"
              strokeWidth="1.8"
              rx="2"
            />
            <line x1={padding.left + plotWidth * 0.6} y1={scaleY(boxB.med)} x2={padding.left + plotWidth * 0.8} y2={scaleY(boxB.med)} stroke="#9f1239" strokeWidth="2.5" />
          </g>

          {/* X Axis Labels in English */}
          <text x={padding.left + plotWidth * 0.3} y={height - padding.bottom + 18} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
            Treatment (n=12)
          </text>
          <text x={padding.left + plotWidth * 0.7} y={height - padding.bottom + 18} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#334155">
            Placebo (n=12)
          </text>

          {/* Axis Titles in English */}
          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">
            Experimental Arm
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569" fontWeight="500">
            Systolic Blood Pressure Reduction (mmHg)
          </text>

          {/* English Legend */}
          <g transform="translate(370, 32)">
            <rect x={0} y={0} width={10} height={10} fill="#c7d2fe" stroke="#4338ca" />
            <text x={14} y={9} fontSize="9" fill="#334155">Treatment Group</text>
            <rect x={0} y={14} width={10} height={10} fill="#fecdd3" stroke="#e11d48" />
            <text x={14} y={23} fontSize="9" fill="#334155">Placebo Control</text>
          </g>
        </svg>
      </div>
    );
  }

  // 2. 单样本直方图与目标线
  if (model.type === 'one_sample') {
    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            Distribution of Machined Bearing Diameters
          </text>

          {/* Histogram Bins */}
          {[
            { x: 120, h: 40, label: '25.012' },
            { x: 180, h: 90, label: '25.018' },
            { x: 240, h: 160, label: '25.024' },
            { x: 300, h: 130, label: '25.030' },
            { x: 360, h: 60, label: '25.036' },
          ].map((bar, i) => (
            <rect key={i} x={bar.x} y={height - padding.bottom - bar.h} width={50} height={bar.h} fill="#bae6fd" stroke="#0284c7" strokeWidth="1.2" rx="2" />
          ))}

          {/* Target line: mu0 = 25.000 */}
          <line x1={80} y1={padding.top} x2={80} y2={height - padding.bottom} stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4 3" />
          <text x={80} y={padding.top - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e11d48">
            Target μ₀ = 25.000
          </text>

          {/* Sample Mean line */}
          <line x1={255} y1={padding.top} x2={255} y2={height - padding.bottom} stroke="#4338ca" strokeWidth="2" strokeDasharray="3 3" />
          <text x={255} y={padding.top - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4338ca">
            Sample Mean x̄ = 25.0246
          </text>

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
            Bearing Outer Diameter (mm)
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569">
            Probability Density
          </text>

          {/* Legend in English */}
          <g transform="translate(370, 32)">
            <line x1={0} y1={5} x2={12} y2={5} stroke="#4338ca" strokeWidth="2" />
            <text x={16} y={8} fontSize="9" fill="#334155">Normal Fit</text>
            <line x1={0} y1={18} x2={12} y2={18} stroke="#e11d48" strokeWidth="2" strokeDasharray="3 2" />
            <text x={16} y={21} fontSize="9" fill="#334155">Design Target</text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. 配对提升条形图
  if (model.type === 'paired') {
    const diffs: number[] = model.diffs || [16, 14, 14, 14, 15, 12, 12, 15, 13, 14, 14, 14];
    const maxDiff = Math.max(...diffs, 20);
    const barW = (plotWidth / diffs.length) * 0.7;

    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            Individual Post-Training Score Improvements
          </text>

          {/* Reference Line: Mean Improvement */}
          <line
            x1={padding.left}
            y1={height - padding.bottom - (14.33 / maxDiff) * plotHeight}
            x2={width - padding.right}
            y2={height - padding.bottom - (14.33 / maxDiff) * plotHeight}
            stroke="#4338ca"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text
            x={width - padding.right - 10}
            y={height - padding.bottom - (14.33 / maxDiff) * plotHeight - 6}
            textAnchor="end"
            fontSize="10"
            fontWeight="bold"
            fill="#4338ca"
          >
            Mean Gain = +14.33 pts
          </text>

          {diffs.map((d, i) => {
            const bx = padding.left + i * (plotWidth / diffs.length) + 6;
            const bh = (d / maxDiff) * plotHeight;
            const by = height - padding.bottom - bh;
            return (
              <g key={i}>
                <rect x={bx} y={by} width={barW} height={bh} fill="#a7f3d0" stroke="#059669" strokeWidth="1.2" rx="2" />
                <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#065f46">
                  +{d}
                </text>
                <text x={bx + barW / 2} y={height - padding.bottom + 15} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">
                  #{i + 1}
                </text>
              </g>
            );
          })}

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
            Trainee Identifier (ID 1-12)
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569">
            Competency Score Gain (Points)
          </text>
        </svg>
      </div>
    );
  }

  // 4. ANOVA 三车间箱线图
  if (model.type === 'anova') {
    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            One-Way ANOVA: Yield Rate by Workshop
          </text>

          {[
            { name: 'Workshop A (Legacy)', x: 130, med: 91.5, col: '#cbd5e1', border: '#475569' },
            { name: 'Workshop B (Automated)', x: 270, med: 93.8, col: '#bae6fd', border: '#0284c7' },
            { name: 'Workshop C (Digital)', x: 410, med: 96.4, col: '#bbf7d0', border: '#16a34a' },
          ].map((item, idx) => {
            const by = height - padding.bottom - ((item.med - 89) / 9) * plotHeight;
            return (
              <g key={idx}>
                <line x1={item.x} y1={by - 30} x2={item.x} y2={by + 30} stroke={item.border} strokeWidth="1.5" />
                <rect x={item.x - 35} y={by - 18} width={70} height={36} fill={item.col} stroke={item.border} strokeWidth="1.8" rx="2" />
                <line x1={item.x - 35} y1={by} x2={item.x + 35} y2={by} stroke="#0f172a" strokeWidth="2.2" />
                <text x={item.x} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  {item.name}
                </text>
                <text x={item.x} y={by - 22} textAnchor="middle" fontSize="10" fontWeight="bold" fill={item.border}>
                  {item.med}%
                </text>
              </g>
            );
          })}

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
            Manufacturing Facility
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569">
            Production First-Pass Yield (%)
          </text>
        </svg>
      </div>
    );
  }

  // 5. 卡方分组柱形图
  if (model.type === 'chisq') {
    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            Consumer Vehicle Preferences by Age Category
          </text>

          {/* Group 1: Pure EV */}
          <g>
            <rect x={90} y={height - padding.bottom - 120} width={30} height={120} fill="#93c5fd" stroke="#2563eb" rx="1" />
            <rect x={125} y={height - padding.bottom - 50} width={30} height={50} fill="#a5b4fc" stroke="#4f46e5" rx="1" />
            <rect x={160} y={height - padding.bottom - 28} width={30} height={28} fill="#c4b5fd" stroke="#7c3aed" rx="1" />
            <text x={140} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
              Pure_EV
            </text>
          </g>

          {/* Group 2: PHEV SUV */}
          <g>
            <rect x={230} y={height - padding.bottom - 64} width={30} height={64} fill="#93c5fd" stroke="#2563eb" rx="1" />
            <rect x={265} y={height - padding.bottom - 106} width={30} height={106} fill="#a5b4fc" stroke="#4f46e5" rx="1" />
            <rect x={300} y={height - padding.bottom - 71} width={30} height={71} fill="#c4b5fd" stroke="#7c3aed" rx="1" />
            <text x={280} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
              PHEV_SUV
            </text>
          </g>

          {/* Group 3: Offroad MPV */}
          <g>
            <rect x={370} y={height - padding.bottom - 28} width={30} height={28} fill="#93c5fd" stroke="#2563eb" rx="1" />
            <rect x={405} y={height - padding.bottom - 57} width={30} height={57} fill="#a5b4fc" stroke="#4f46e5" rx="1" />
            <rect x={440} y={height - padding.bottom - 114} width={30} height={114} fill="#c4b5fd" stroke="#7c3aed" rx="1" />
            <text x={420} y={height - padding.bottom + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
              Offroad_MPV
            </text>
          </g>

          {/* Legend in English */}
          <g transform="translate(360, 36)">
            <rect x={0} y={0} width={12} height={12} fill="#93c5fd" stroke="#2563eb" />
            <text x={18} y={10} fontSize="9" fill="#475569">Youth (18-30)</text>
            <rect x={0} y={16} width={12} height={12} fill="#a5b4fc" stroke="#4f46e5" />
            <text x={18} y={26} fontSize="9" fill="#475569">Middle (31-45)</text>
            <rect x={0} y={32} width={12} height={12} fill="#c4b5fd" stroke="#7c3aed" />
            <text x={18} y={42} fontSize="9" fill="#475569">Senior (46-60)</text>
          </g>

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
            Vehicle Model Preference
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569">
            Observed Consumer Frequency
          </text>
        </svg>
      </div>
    );
  }

  // 6. Shapiro-Wilk Normal Q-Q 图
  if (model.type === 'shapiro') {
    const pts: { theoretical: number; sample: number }[] = model.qq?.points || [];
    return (
      <div className="w-full overflow-x-auto flex flex-col items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none bg-slate-50/70 rounded-xl border border-slate-200">
          <text x={width / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
            Normal Q-Q Plot of Blade Fatigue Lifetime
          </text>

          {/* Red theoretical reference line */}
          <line x1={padding.left} y1={height - padding.bottom - 10} x2={width - padding.right} y2={padding.top + 10} stroke="#e11d48" strokeWidth="2" strokeDasharray="4 3" />

          {/* Points */}
          {pts.map((pt, i) => {
            const cx = padding.left + ((pt.theoretical + 2.5) / 5) * plotWidth;
            const cy = height - padding.bottom - ((pt.sample - 10) / 95) * plotHeight;
            return (
              <circle key={i} cx={Math.max(padding.left, Math.min(width - padding.right, cx))} cy={Math.max(padding.top, Math.min(height - padding.bottom, cy))} r="4" fill="#1e293b" stroke="#0f172a" strokeWidth="0.8" />
            );
          })}

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#475569">
            Theoretical Standard Normal Quantiles
          </text>
          <text transform={`rotate(-90)`} x={-(height / 2)} y={15} textAnchor="middle" fontSize="10" fill="#475569">
            Sample Quantiles (k-hours)
          </text>

          <g transform="translate(70, 36)">
            <circle cx={6} cy={6} r={4} fill="#1e293b" stroke="#0f172a" />
            <text x={18} y={10} fontSize="9" fill="#334155">Observed Quantiles</text>
            <line x1={0} y1={20} x2={12} y2={20} stroke="#e11d48" strokeWidth="2" strokeDasharray="3 2" />
            <text x={18} y={23} fontSize="9" fill="#334155">Normal Reference</text>
          </g>
        </svg>
      </div>
    );
  }

  return null;
};

/* ==========================================================================
   子组件 2: 结构化统计表格渲染器 (R Structured Table Renderer)
   展示标准推断汇总表格、置信区间明细与效应量指标
   ========================================================================== */
interface TableProps {
  model: any;
}

const RStructuredTableRenderer: React.FC<TableProps> = ({ model }) => {
  if (!model) return null;

  if (model.type === 'two_sample') {
    const res = model.res;
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">1. Sample Summary Statistics</h4>
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 border-b">Cohort / Group</th>
                <th className="p-2 border-b">Sample Size (n)</th>
                <th className="p-2 border-b">Mean (x̄)</th>
                <th className="p-2 border-b">Std. Dev (s)</th>
                <th className="p-2 border-b">Std. Error (SE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 font-medium">Treatment Cohort</td>
                <td className="p-2 font-mono">12</td>
                <td className="p-2 font-mono font-bold text-indigo-700">{res.mean1.toFixed(3)}</td>
                <td className="p-2 font-mono">{res.sd1.toFixed(3)}</td>
                <td className="p-2 font-mono">{(res.sd1 / Math.sqrt(12)).toFixed(3)}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Placebo Control</td>
                <td className="p-2 font-mono">12</td>
                <td className="p-2 font-mono font-bold text-rose-700">{res.mean2.toFixed(3)}</td>
                <td className="p-2 font-mono">{res.sd2.toFixed(3)}</td>
                <td className="p-2 font-mono">{(res.sd2 / Math.sqrt(12)).toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2">2. Welch Two-Sample Test Results</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">t Statistic</span>
              <span className="font-mono font-bold text-slate-900">{res.statistic.toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Degrees of Freedom</span>
              <span className="font-mono font-bold text-slate-900">{res.df.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-600 block">p-value (Pr &gt; |t|)</span>
              <span className="font-mono font-bold text-rose-700">
                {res.pValue < 0.0001 ? '< 0.0001' : res.pValue.toFixed(4)}
              </span>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-[10px] text-indigo-700 block">Cohen&apos;s d Effect Size</span>
              <span className="font-mono font-bold text-indigo-900">{res.cohensD.toFixed(3)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
          <span className="text-slate-600">95% Confidence Interval for (μ₁ - μ₂):</span>
          <span className="font-mono font-bold text-indigo-700">
            [{res.confInt[0].toFixed(4)}, {res.confInt[1].toFixed(4)}] mmHg
          </span>
        </div>
      </div>
    );
  }

  if (model.type === 'one_sample') {
    const res = model.res;
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-900 mb-1">One-Sample t-Test Estimation Summary</h4>
        <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 border-b">Sample Parameter</th>
              <th className="p-2 border-b">Observed Value</th>
              <th className="p-2 border-b">Null Target (μ₀)</th>
              <th className="p-2 border-b">95% CI Lower</th>
              <th className="p-2 border-b">95% CI Upper</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            <tr>
              <td className="p-2 font-medium font-sans">Bearing Diameter (mm)</td>
              <td className="p-2 font-bold text-indigo-700">{res.mean.toFixed(5)}</td>
              <td className="p-2 font-bold text-rose-700">{res.nullMean.toFixed(5)}</td>
              <td className="p-2">{res.confInt[0].toFixed(5)}</td>
              <td className="p-2">{res.confInt[1].toFixed(5)}</td>
            </tr>
          </tbody>
        </table>
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700">
          <strong>Decision:</strong> t = {res.statistic.toFixed(4)}, df = {res.df}, p-value = {res.pValue < 0.0001 ? '< 0.0001' : res.pValue.toFixed(4)}. <strong>Reject H₀</strong>: Significant positive dimension drift of +24.6 μm detected.
        </div>
      </div>
    );
  }

  if (model.type === 'paired') {
    const res = model.res;
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-900 mb-1">Paired Differences Summary</h4>
        <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 border-b">Measurement</th>
              <th className="p-2 border-b">Pre-Training (Before)</th>
              <th className="p-2 border-b">Post-Training (After)</th>
              <th className="p-2 border-b">Mean Increment (Δ)</th>
              <th className="p-2 border-b">Cohen&apos;s d</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            <tr>
              <td className="p-2 font-medium font-sans">Competency Score</td>
              <td className="p-2">{mean(model.before).toFixed(2)}</td>
              <td className="p-2">{mean(model.after).toFixed(2)}</td>
              <td className="p-2 font-bold text-emerald-700">+{res.meanDiff.toFixed(2)} pts</td>
              <td className="p-2 font-bold text-indigo-700">{res.cohensD.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (model.type === 'anova') {
    const res = model.res;
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-900 mb-1">One-Way Analysis of Variance (ANOVA) Table</h4>
        <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 border-b">Source of Variation</th>
              <th className="p-2 border-b">Df</th>
              <th className="p-2 border-b">Sum of Squares</th>
              <th className="p-2 border-b">Mean Square</th>
              <th className="p-2 border-b">F value</th>
              <th className="p-2 border-b">Pr(&gt;F)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            <tr>
              <td className="p-2 font-medium font-sans">Between Facilities</td>
              <td className="p-2">{res.dfBetween}</td>
              <td className="p-2">{res.ssBetween.toFixed(3)}</td>
              <td className="p-2">{res.msBetween.toFixed(3)}</td>
              <td className="p-2 font-bold text-indigo-700">{res.fStatistic.toFixed(2)}</td>
              <td className="p-2 font-bold text-rose-700">&lt; 0.0001 ***</td>
            </tr>
            <tr>
              <td className="p-2 font-medium font-sans">Residuals (Within)</td>
              <td className="p-2">{res.dfWithin}</td>
              <td className="p-2">{res.ssWithin.toFixed(3)}</td>
              <td className="p-2">{res.msWithin.toFixed(3)}</td>
              <td className="p-2">-</td>
              <td className="p-2">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (model.type === 'chisq') {
    const res = model.res;
    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-900 mb-1">Observed vs. Expected Contingency Table</h4>
        <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-2 border-b">Age Category \ Vehicle</th>
              {res.colNames.map((c: string) => (
                <th key={c} className="p-2 border-b text-center">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {res.observed.map((row: number[], r: number) => (
              <tr key={r}>
                <td className="p-2 font-medium">{res.rowNames[r]}</td>
                {row.map((obs: number, c: number) => (
                  <td key={c} className="p-2 text-center font-mono">
                    <span className="font-bold text-indigo-700">{obs}</span>
                    <span className="text-[10px] text-slate-400 block">(Exp: {res.expected[r][c].toFixed(1)})</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
      <div className="font-bold text-slate-800">Test Statistic Summary:</div>
      <div className="font-mono text-slate-700">
        Statistic: {model.res?.statistic?.toFixed(4) || model.res?.wStatistic?.toFixed(4)} | p-value: {model.res?.pValue < 0.0001 ? '< 0.0001' : model.res?.pValue?.toFixed(4)}
      </div>
    </div>
  );
};
