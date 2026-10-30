import {
  DistributionType,
  TestAlternative,
  OneSampleTResult,
  TwoSampleTResult,
  PairedTResult,
  FVarTestResult,
  ShapiroWilkResult,
  ANOVAResult,
  ChiSquareResult,
  CIIntervalItem,
  CLTSimulationResult,
  QQPoint,
} from '../types/stats';

/* ==========================================================================
   1. 数学特殊函数与分布概率函数 (Special Functions & Distributions)
   ========================================================================== */

/**
 * 误差函数 erf(x) - 基于 Abramowitz and Stegun 7.1.26 高精度有理逼近 (精度 < 1.5e-7)
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const a = Math.abs(x);

  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1.0 / (1.0 + p * a);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-a * a));
  return sign * y;
}

/**
 * 互补误差函数 erfc(x) = 1 - erf(x)
 */
export function erfc(x: number): number {
  return 1 - erf(x);
}

/**
 * 自然对数伽马函数 ln(Γ(x)) - Lanczos 逼近 (g=7, n=9)
 */
export function logGamma(z: number): number {
  if (z <= 0) return 0;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  const g = 7;
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * 不完全伽马函数正则化下半 P(a, x) = γ(a, x) / Γ(a)
 */
export function regularizedGammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    // 级数展开法
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n <= 100; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-12) {
        return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
      }
    }
  }
  // 连分数法 Q(a, x) = 1 - P(a, x)
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 100; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
  return 1 - q;
}

/**
 * 不完全贝塔函数正则化 I_x(a, b) = B(x; a, b) / B(a, b)
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // 使用对称性
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedIncompleteBeta(1 - x, b, a);
  }

  const factor = Math.exp(
    a * Math.log(x) + b * Math.log(1 - x) - logGamma(a) - logGamma(b) + logGamma(a + b)
  ) / a;

  // 连分数逼近
  let c = 1;
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 100; m++) {
    // 偶数步 2m
    let num = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    // 奇数步 2m+1
    num = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }

  return factor * h;
}

/* ==========================================================================
   2. 概率分布统计函数 (PDF, CDF, Quantile)
   ========================================================================== */

// --- 正态分布 (Normal Distribution) ---
export function normPdf(x: number, mu = 0, sigma = 1): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

export function normCdf(x: number, mu = 0, sigma = 1): number {
  if (sigma <= 0) return x >= mu ? 1 : 0;
  const z = (x - mu) / (sigma * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

/**
 * 标准正态分位数函数 qnorm(p) - Beasley-Springer-Moro / Acklam 逼近
 */
export function normInv(p: number, mu = 0, sigma = 1): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return mu;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const q = p - 0.5;
  let r: number, x: number;

  if (Math.abs(q) <= 0.42) {
    r = q * q;
    x =
      (q *
        (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5])) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
  } else {
    r = p < 0.5 ? p : 1 - p;
    r = Math.log(-Math.log(r));
    x =
      c[0] +
      r *
        (c[1] +
          r *
            (c[2] +
              r *
                (c[3] +
                  r *
                    (c[4] +
                      r * c[5])))) /
        (1.0 +
          r *
            (d[0] +
              r *
                (d[1] +
                  r *
                    (d[2] +
                      r * d[3]))));
    if (p < 0.5) x = -x;
  }
  return mu + sigma * x;
}

// --- 学生氏 t 分布 (Student's t Distribution) ---
export function tPdf(x: number, df: number): number {
  if (df <= 0) return 0;
  const num = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2));
  const denom = Math.sqrt(df * Math.PI) * Math.pow(1 + (x * x) / df, (df + 1) / 2);
  return num / denom;
}

export function tCdf(t: number, df: number): number {
  if (df <= 0) return 0;
  const x = df / (df + t * t);
  const ibeta = regularizedIncompleteBeta(x, df / 2, 0.5);
  if (t > 0) {
    return 1 - 0.5 * ibeta;
  } else {
    return 0.5 * ibeta;
  }
}

/**
 * t 分布逆累积函数 qt(p, df) - Hill 展开及二分牛顿迭代结合
 */
export function tInv(p: number, df: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  if (df > 1000) return normInv(p);

  // 初值：基于 Hill 展开
  const z = normInv(p);
  let x = z + (z * z * z + z) / (4 * df);

  // 牛顿迭代校准 (3-5 步可达到双精度)
  for (let i = 0; i < 8; i++) {
    const error = tCdf(x, df) - p;
    const pdf = tPdf(x, df);
    if (Math.abs(error) < 1e-12 || pdf === 0) break;
    x -= error / pdf;
  }
  return x;
}

// --- 卡方分布 (Chi-Square Distribution) ---
export function chiSquarePdf(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 0;
  const k = df / 2;
  return (
    (Math.pow(x, k - 1) * Math.exp(-x / 2)) /
    (Math.pow(2, k) * Math.exp(logGamma(k)))
  );
}

export function chiSquareCdf(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 0;
  return regularizedGammaP(df / 2, x / 2);
}

// --- F 分布 (Fisher-Snedecor F Distribution) ---
export function fPdf(x: number, df1: number, df2: number): number {
  if (x <= 0 || df1 <= 0 || df2 <= 0) return 0;
  const num = Math.pow(df1 * x, df1) * Math.pow(df2, df2);
  const denom = Math.pow(df1 * x + df2, df1 + df2);
  const betaConst = Math.exp(logGamma(df1 / 2) + logGamma(df2 / 2) - logGamma((df1 + df2) / 2));
  return (Math.sqrt(num / denom) / (x * betaConst));
}

export function fCdf(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 0;
  const x = (df1 * f) / (df1 * f + df2);
  return regularizedIncompleteBeta(x, df1 / 2, df2 / 2);
}

/* ==========================================================================
   3. 描述性统计量与样本计算 (Descriptive Statistics)
   ========================================================================== */

export function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

export function variance(arr: number[], isSample = true): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const sumSq = arr.reduce((acc, v) => acc + (v - m) * (v - m), 0);
  return sumSq / (arr.length - (isSample ? 1 : 0));
}

export function sd(arr: number[], isSample = true): number {
  return Math.sqrt(variance(arr, isSample));
}

export function standardError(arr: number[]): number {
  if (arr.length <= 1) return 0;
  return sd(arr, true) / Math.sqrt(arr.length);
}

export function quantile(arr: number[], q: number): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

export function skewness(arr: number[]): number {
  const n = arr.length;
  if (n < 3) return 0;
  const m = mean(arr);
  const s = sd(arr, true);
  if (s === 0) return 0;
  const m3 = arr.reduce((acc, v) => acc + Math.pow(v - m, 3), 0) / n;
  return (m3 / Math.pow(s, 3)) * (Math.sqrt(n * (n - 1)) / (n - 2));
}

/* ==========================================================================
   4. 参数检验与推断核心引擎 (Hypothesis Testing Engines)
   ========================================================================== */

/**
 * 单样本 t 检验 (One-Sample t-test)
 * 映射 R: t.test(x, mu = nullMean, alternative = alternative, conf.level = confLevel)
 */
export function oneSampleTTest(
  x: number[],
  nullMean = 0,
  alternative: TestAlternative = 'two.sided',
  confLevel = 0.95
): OneSampleTResult {
  const n = x.length;
  const sampleMean = mean(x);
  const sampleSd = sd(x, true);
  const se = sampleSd / Math.sqrt(n);
  const df = n - 1;
  const t = se === 0 ? 0 : (sampleMean - nullMean) / se;

  let pValue: number;
  if (alternative === 'two.sided') {
    const cdfVal = tCdf(Math.abs(t), df);
    pValue = 2 * (1 - cdfVal);
  } else if (alternative === 'greater') {
    pValue = 1 - tCdf(t, df);
  } else {
    pValue = tCdf(t, df);
  }
  pValue = Math.max(0, Math.min(1, pValue));

  // 置信区间计算
  const alpha = 1 - confLevel;
  let lower: number, upper: number;
  if (alternative === 'two.sided') {
    const tCrit = tInv(1 - alpha / 2, df);
    lower = sampleMean - tCrit * se;
    upper = sampleMean + tCrit * se;
  } else if (alternative === 'greater') {
    const tCrit = tInv(1 - alpha, df);
    lower = sampleMean - tCrit * se;
    upper = Infinity;
  } else {
    const tCrit = tInv(1 - alpha, df);
    lower = -Infinity;
    upper = sampleMean + tCrit * se;
  }

  // 效应量 Cohen's d = (mean - mu0) / sd
  const cohensD = sampleSd === 0 ? 0 : (sampleMean - nullMean) / sampleSd;
  const alphaCrit = 1 - confLevel;
  const decision = pValue < alphaCrit ? 'reject' : 'fail_to_reject';

  return {
    statistic: t,
    df,
    pValue,
    mean: sampleMean,
    sd: sampleSd,
    se,
    sampleSize: n,
    confLevel,
    confInt: [lower, upper],
    nullMean,
    alternative,
    cohensD,
    decision,
  };
}

/**
 * 两独立样本 t 检验 (Independent Two-Sample t-test)
 * 映射 R: t.test(x, y, var.equal = varEqual, alternative = alternative, conf.level = confLevel)
 */
export function twoSampleTTest(
  x: number[],
  y: number[],
  varEqual = false,
  alternative: TestAlternative = 'two.sided',
  confLevel = 0.95
): TwoSampleTResult {
  const n1 = x.length;
  const n2 = y.length;
  const m1 = mean(x);
  const m2 = mean(y);
  const v1 = variance(x, true);
  const v2 = variance(y, true);
  const sd1 = Math.sqrt(v1);
  const sd2 = Math.sqrt(v2);
  const meanDiff = m1 - m2;

  let t: number, df: number, seDiff: number;

  if (varEqual) {
    // Student's t 检验 (合并方差 pooled variance)
    const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    seDiff = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    df = n1 + n2 - 2;
    t = seDiff === 0 ? 0 : meanDiff / seDiff;
  } else {
    // Welch's t 检验 (异方差 Satterthwaite 近似)
    seDiff = Math.sqrt(v1 / n1 + v2 / n2);
    const num = Math.pow(v1 / n1 + v2 / n2, 2);
    const denom = Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1);
    df = denom === 0 ? n1 + n2 - 2 : num / denom;
    t = seDiff === 0 ? 0 : meanDiff / seDiff;
  }

  let pValue: number;
  if (alternative === 'two.sided') {
    pValue = 2 * (1 - tCdf(Math.abs(t), df));
  } else if (alternative === 'greater') {
    pValue = 1 - tCdf(t, df);
  } else {
    pValue = tCdf(t, df);
  }
  pValue = Math.max(0, Math.min(1, pValue));

  const alpha = 1 - confLevel;
  let lower: number, upper: number;
  if (alternative === 'two.sided') {
    const tCrit = tInv(1 - alpha / 2, df);
    lower = meanDiff - tCrit * seDiff;
    upper = meanDiff + tCrit * seDiff;
  } else if (alternative === 'greater') {
    const tCrit = tInv(1 - alpha, df);
    lower = meanDiff - tCrit * seDiff;
    upper = Infinity;
  } else {
    const tCrit = tInv(1 - alpha, df);
    lower = -Infinity;
    upper = meanDiff + tCrit * seDiff;
  }

  // Cohen's d: 使用合并标准差
  const spPooled = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  const cohensD = spPooled === 0 ? 0 : meanDiff / spPooled;
  const decision = pValue < (1 - confLevel) ? 'reject' : 'fail_to_reject';

  return {
    statistic: t,
    df,
    pValue,
    mean1: m1,
    mean2: m2,
    meanDiff,
    sd1,
    sd2,
    n1,
    n2,
    seDiff,
    confLevel,
    confInt: [lower, upper],
    alternative,
    varEqual,
    cohensD,
    decision,
  };
}

/**
 * 配对样本 t 检验 (Paired t-test)
 * 映射 R: t.test(x, y, paired = TRUE, conf.level = confLevel)
 */
export function pairedTTest(
  x: number[],
  y: number[],
  alternative: TestAlternative = 'two.sided',
  confLevel = 0.95
): PairedTResult {
  const n = Math.min(x.length, y.length);
  const diffs: number[] = [];
  for (let i = 0; i < n; i++) {
    diffs.push(x[i] - y[i]);
  }
  const oneRes = oneSampleTTest(diffs, 0, alternative, confLevel);

  return {
    statistic: oneRes.statistic,
    df: oneRes.df,
    pValue: oneRes.pValue,
    meanDiff: oneRes.mean,
    sdDiff: oneRes.sd,
    seDiff: oneRes.se,
    n,
    confLevel,
    confInt: oneRes.confInt,
    alternative,
    cohensD: oneRes.cohensD,
    decision: oneRes.decision,
  };
}

/**
 * 方差齐性 F 检验 (Two-Sample F-test for equal variances)
 * 映射 R: var.test(x, y)
 */
export function fVarianceTest(x: number[], y: number[], confLevel = 0.95): FVarTestResult {
  const v1 = variance(x, true);
  const v2 = variance(y, true);
  const df1 = x.length - 1;
  const df2 = y.length - 1;
  const f = v1 / (v2 || 1e-10);

  // 双侧 p 值 = 2 * min(P(F <= f), P(F >= f))
  const cdfF = fCdf(f, df1, df2);
  const pValue = Math.min(1, 2 * Math.min(cdfF, 1 - cdfF));

  // 置信区间
  const alpha = 1 - confLevel;
  // 近似 F 分位数基于正态逼近或标准范围
  const fLow = 1 / (fCdf(1 - alpha / 2, df2, df1) || 1.96);
  const fHigh = fCdf(1 - alpha / 2, df1, df2) || 1.96;
  const lower = f / fHigh;
  const upper = f * fLow;

  return {
    statistic: f,
    df1,
    df2,
    pValue,
    var1: v1,
    var2: v2,
    ratio: f,
    confInt: [lower, upper],
    decision: pValue < (1 - confLevel) ? 'reject' : 'fail_to_reject',
  };
}

/**
 * Shapiro-Wilk 正态性检验 (Royston 近似算法)
 * 映射 R: shapiro.test(x)
 */
export function shapiroWilkTest(data: number[]): ShapiroWilkResult {
  const n = data.length;
  if (n < 3) {
    return { wStatistic: 1, pValue: 1, isNormal: true };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const m = mean(sorted);
  const ssTotal = sorted.reduce((acc, v) => acc + (v - m) * (v - m), 0);

  if (ssTotal === 0) {
    return { wStatistic: 1, pValue: 1, isNormal: true };
  }

  // 计算标准正态分位数近似系数 m_i
  const normalScores: number[] = [];
  for (let i = 1; i <= n; i++) {
    const p = (i - 0.375) / (n + 0.25);
    normalScores.push(normInv(p));
  }
  const mNorm = Math.sqrt(normalScores.reduce((acc, v) => acc + v * v, 0));
  const aWeights = normalScores.map((v) => v / mNorm);

  // W = (sum a_i * x_(i))^2 / ssTotal
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += aWeights[i] * sorted[i];
  }
  const w = Math.min(1, Math.max(0, (numerator * numerator) / ssTotal));

  // Royston (1992) 对 W 转换正态变量计算 p 值
  const y = Math.log(1 - w);
  let muY: number, sigmaY: number;

  if (n <= 11) {
    muY = -0.0006714 * Math.pow(n, 3) + 0.025054 * Math.pow(n, 2) - 0.39978 * n - 0.544;
    sigmaY = Math.exp(-0.0020322 * Math.pow(n, 3) + 0.062767 * Math.pow(n, 2) - 0.77857 * n + 1.3822);
  } else {
    const lnN = Math.log(n);
    muY = -2.706056 + 4.434685 * lnN - 2.07119 * lnN * lnN + 0.4497 * Math.pow(lnN, 3);
    sigmaY = Math.exp(-0.45301 - 0.28319 * lnN);
  }

  const z = (y - muY) / sigmaY;
  const pValue = Math.max(0, Math.min(1, 1 - normCdf(z)));

  return {
    wStatistic: w,
    pValue,
    isNormal: pValue >= 0.05,
  };
}

/**
 * 生成 Normal Q-Q 图的理论分位数点对
 */
export function generateQQPlotData(data: number[]): { points: QQPoint[]; slope: number; intercept: number } {
  const n = data.length;
  if (!n) return { points: [], slope: 1, intercept: 0 };
  const sorted = [...data].sort((a, b) => a - b);
  const points: QQPoint[] = [];

  for (let i = 1; i <= n; i++) {
    const p = (i - 0.5) / n;
    const theoretical = normInv(p);
    points.push({ theoretical, sample: sorted[i - 1] });
  }

  // Q-Q 参考参考线穿过 Q1 和 Q3
  const q1Theor = normInv(0.25);
  const q3Theor = normInv(0.75);
  const q1Sample = quantile(sorted, 0.25);
  const q3Sample = quantile(sorted, 0.75);
  const slope = (q3Sample - q1Sample) / (q3Theor - q1Theor || 1);
  const intercept = q1Sample - slope * q1Theor;

  return { points, slope, intercept };
}

/**
 * 单因素方差分析 (One-Way ANOVA)
 * 映射 R: summary(aov(y ~ group))
 */
export function oneWayAnova(groups: { name: string; data: number[] }[]): ANOVAResult {
  const k = groups.length;
  let N = 0;
  let grandSum = 0;
  const groupStats: { name: string; n: number; mean: number; sd: number; data: number[] }[] = [];

  for (const g of groups) {
    const n = g.data.length;
    const m = mean(g.data);
    const s = sd(g.data, true);
    groupStats.push({ name: g.name, n, mean: m, sd: s, data: g.data });
    N += n;
    grandSum += g.data.reduce((acc, v) => acc + v, 0);
  }

  const grandMean = grandSum / N;

  // SS_between = sum(n_i * (mean_i - grandMean)^2)
  let ssBetween = 0;
  for (const g of groupStats) {
    ssBetween += g.n * Math.pow(g.mean - grandMean, 2);
  }

  // SS_within = sum(sum((x_ij - mean_i)^2))
  let ssWithin = 0;
  for (const g of groupStats) {
    for (const val of g.data) {
      ssWithin += Math.pow(val - g.mean, 2);
    }
  }

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;

  const msBetween = ssBetween / (dfBetween || 1);
  const msWithin = ssWithin / (dfWithin || 1);
  const fStatistic = msBetween / (msWithin || 1e-10);
  const pValue = 1 - fCdf(fStatistic, dfBetween, dfWithin);
  const etaSquared = ssTotal === 0 ? 0 : ssBetween / ssTotal;

  return {
    ssBetween,
    ssWithin,
    ssTotal,
    dfBetween,
    dfWithin,
    dfTotal,
    msBetween,
    msWithin,
    fStatistic,
    pValue: Math.max(0, Math.min(1, pValue)),
    etaSquared,
    groups: groupStats.map(({ name, n, mean, sd }) => ({ name, n, mean, sd })),
    decision: pValue < 0.05 ? 'reject' : 'fail_to_reject',
  };
}

/**
 * 卡方独立性检验 (Chi-Square Test of Independence)
 * 映射 R: chisq.test(table_matrix)
 */
export function chiSquareTest(
  observed: number[][],
  rowNames: string[] = [],
  colNames: string[] = []
): ChiSquareResult {
  const r = observed.length;
  const c = observed[0].length;
  const rowTotals = new Array(r).fill(0);
  const colTotals = new Array(c).fill(0);
  let grandTotal = 0;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      rowTotals[i] += observed[i][j];
      colTotals[j] += observed[i][j];
      grandTotal += observed[i][j];
    }
  }

  const expected: number[][] = [];
  let chi2 = 0;

  for (let i = 0; i < r; i++) {
    expected[i] = [];
    for (let j = 0; j < c; j++) {
      const exp = (rowTotals[i] * colTotals[j]) / (grandTotal || 1);
      expected[i][j] = exp;
      const obs = observed[i][j];
      if (exp > 0) {
        chi2 += Math.pow(obs - exp, 2) / exp;
      }
    }
  }

  const df = (r - 1) * (c - 1);
  const pValue = 1 - chiSquareCdf(chi2, df);

  // Cramér's V = sqrt(chi2 / (N * min(r-1, c-1)))
  const minDim = Math.min(r - 1, c - 1);
  const cramersV = minDim > 0 && grandTotal > 0 ? Math.sqrt(chi2 / (grandTotal * minDim)) : 0;

  return {
    statistic: chi2,
    df,
    pValue: Math.max(0, Math.min(1, pValue)),
    observed,
    expected,
    rowTotals,
    colTotals,
    grandTotal,
    cramersV,
    rowNames: rowNames.length ? rowNames : Array.from({ length: r }, (_, i) => `行 ${i + 1}`),
    colNames: colNames.length ? colNames : Array.from({ length: c }, (_, j) => `列 ${j + 1}`),
    decision: pValue < 0.05 ? 'reject' : 'fail_to_reject',
  };
}

/* ==========================================================================
   5. 蒙特卡洛随机抽样生成器 (Monte Carlo Sampling Generators)
   ========================================================================== */

/**
 * 正态分布抽样 (Box-Muller 变换)
 */
export function rNorm(mu = 0, sigma = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mu + z0 * sigma;
}

export function rUnif(min = 0, max = 1): number {
  return min + Math.random() * (max - min);
}

export function rExp(lambda = 1): number {
  let u = Math.random();
  while (u === 0) u = Math.random();
  return -Math.log(u) / lambda;
}

export function rSkewed(): number {
  // 贝塔或右偏分布 (类似对数正态或卡方形态)
  return Math.exp(rNorm(1.5, 0.6));
}

export function rBimodal(): number {
  // 两个正态分布的等权混合
  return Math.random() < 0.5 ? rNorm(10, 2) : rNorm(24, 3);
}

export function sampleFromDistribution(type: DistributionType): number {
  switch (type) {
    case 'uniform':
      return rUnif(0, 100);
    case 'exponential':
      return rExp(0.05); // 均值 20
    case 'bimodal':
      return rBimodal();
    case 'skewed':
      return rSkewed();
    case 'normal':
    default:
      return rNorm(50, 10);
  }
}

/* ==========================================================================
   6. 中心极限定理 (CLT) 与大数定律模拟
   ========================================================================== */

export function simulateCLT(
  distType: DistributionType,
  sampleSize: number,
  repetitions = 1000,
  binCount = 28
): CLTSimulationResult {
  const sampleMeans: number[] = [];

  for (let r = 0; r < repetitions; r++) {
    let sum = 0;
    for (let i = 0; i < sampleSize; i++) {
      sum += sampleFromDistribution(distType);
    }
    sampleMeans.push(sum / sampleSize);
  }

  const meanOfMeans = mean(sampleMeans);
  const sdOfMeans = sd(sampleMeans, true);

  // 理论参数估算
  let theoreticalMean = 50;
  let theoreticalPopSd = 10;
  if (distType === 'uniform') {
    theoreticalMean = 50;
    theoreticalPopSd = Math.sqrt(Math.pow(100, 2) / 12); // ~28.87
  } else if (distType === 'exponential') {
    theoreticalMean = 20; // 1/0.05
    theoreticalPopSd = 20;
  } else if (distType === 'bimodal') {
    theoreticalMean = 17;
    theoreticalPopSd = 7.5;
  } else if (distType === 'skewed') {
    theoreticalMean = Math.exp(1.5 + 0.36 / 2); // ~5.36
    theoreticalPopSd = 3.5;
  }
  const theoreticalSE = theoreticalPopSd / Math.sqrt(sampleSize);

  // 直方图划分
  let min = Math.min(...sampleMeans);
  let max = Math.max(...sampleMeans);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const binWidth = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * binWidth,
    binEnd: min + (i + 1) * binWidth,
    count: 0,
    density: 0,
  }));

  for (const val of sampleMeans) {
    const idx = Math.min(binCount - 1, Math.floor((val - min) / binWidth));
    if (idx >= 0 && idx < binCount) {
      bins[idx].count++;
    }
  }

  for (const b of bins) {
    b.density = b.count / (repetitions * binWidth);
  }

  return {
    sampleMeans,
    meanOfMeans,
    sdOfMeans,
    theoreticalMean,
    theoreticalSE,
    min,
    max,
    histogram: bins,
  };
}

/* ==========================================================================
   7. 100 次重复抽样置信区间覆盖模拟 (Caterpillar Plot Simulation)
   ========================================================================== */

export function simulateConfidenceIntervals(
  trueMean = 100,
  trueSd = 15,
  sampleSize = 30,
  repetitions = 100,
  confLevel = 0.95
): {
  intervals: CIIntervalItem[];
  coveredCount: number;
  coverageRate: number;
  expectedRate: number;
} {
  const intervals: CIIntervalItem[] = [];
  const alpha = 1 - confLevel;
  const df = sampleSize - 1;
  const tCrit = tInv(1 - alpha / 2, df);

  let coveredCount = 0;

  for (let i = 0; i < repetitions; i++) {
    const sample: number[] = [];
    for (let j = 0; j < sampleSize; j++) {
      sample.push(rNorm(trueMean, trueSd));
    }
    const sm = mean(sample);
    const se = sd(sample, true) / Math.sqrt(sampleSize);
    const lower = sm - tCrit * se;
    const upper = sm + tCrit * se;
    const coversTrue = lower <= trueMean && trueMean <= upper;

    if (coversTrue) coveredCount++;

    intervals.push({
      id: i + 1,
      sampleMean: sm,
      lower,
      upper,
      coversTrue,
    });
  }

  return {
    intervals,
    coveredCount,
    coverageRate: (coveredCount / repetitions) * 100,
    expectedRate: confLevel * 100,
  };
}
