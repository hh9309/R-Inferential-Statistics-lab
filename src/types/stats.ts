export type DistributionType = 'normal' | 'uniform' | 'exponential' | 'bimodal' | 'skewed';

export type TestAlternative = 'two.sided' | 'less' | 'greater';

export interface OneSampleTResult {
  statistic: number;
  df: number;
  pValue: number;
  mean: number;
  sd: number;
  se: number;
  sampleSize: number;
  confLevel: number;
  confInt: [number, number];
  nullMean: number;
  alternative: TestAlternative;
  cohensD: number;
  decision: 'reject' | 'fail_to_reject';
}

export interface TwoSampleTResult {
  statistic: number;
  df: number;
  pValue: number;
  mean1: number;
  mean2: number;
  meanDiff: number;
  sd1: number;
  sd2: number;
  n1: number;
  n2: number;
  seDiff: number;
  confLevel: number;
  confInt: [number, number];
  alternative: TestAlternative;
  varEqual: boolean;
  cohensD: number;
  decision: 'reject' | 'fail_to_reject';
}

export interface PairedTResult {
  statistic: number;
  df: number;
  pValue: number;
  meanDiff: number;
  sdDiff: number;
  seDiff: number;
  n: number;
  confLevel: number;
  confInt: [number, number];
  alternative: TestAlternative;
  cohensD: number;
  decision: 'reject' | 'fail_to_reject';
}

export interface FVarTestResult {
  statistic: number;
  df1: number;
  df2: number;
  pValue: number;
  var1: number;
  var2: number;
  ratio: number;
  confInt: [number, number];
  decision: 'reject' | 'fail_to_reject';
}

export interface ShapiroWilkResult {
  wStatistic: number;
  pValue: number;
  isNormal: boolean;
}

export interface ANOVAResult {
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  dfBetween: number;
  dfWithin: number;
  dfTotal: number;
  msBetween: number;
  msWithin: number;
  fStatistic: number;
  pValue: number;
  etaSquared: number;
  groups: { name: string; n: number; mean: number; sd: number }[];
  decision: 'reject' | 'fail_to_reject';
}

export interface ChiSquareResult {
  statistic: number;
  df: number;
  pValue: number;
  observed: number[][];
  expected: number[][];
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
  cramersV: number;
  rowNames: string[];
  colNames: string[];
  decision: 'reject' | 'fail_to_reject';
}

export interface QQPoint {
  theoretical: number;
  sample: number;
}

export interface CaseStudy {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  domain: string;
  testMapping: string;
  background: string;
  researchQuestion: string;
  h0: string;
  h1: string;
  data: any;
  defaultAlpha: number;
  explanation: string;
  rCode: string;
}

export interface CIIntervalItem {
  id: number;
  sampleMean: number;
  lower: number;
  upper: number;
  coversTrue: boolean;
}

export interface CLTSimulationResult {
  sampleMeans: number[];
  meanOfMeans: number;
  sdOfMeans: number;
  theoreticalMean: number;
  theoreticalSE: number;
  min: number;
  max: number;
  histogram: { binStart: number; binEnd: number; count: number; density: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isDiagnostic?: boolean;
}
