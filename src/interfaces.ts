export interface Font {
  name: string;
  family: string;
  file: string;
  url?: string;
  format?: string;
  weight?: string | number;
  style?: string;
}

export interface Problem {
  left: number;
  right: number;
  operator: string;
  answer: number;
}

export interface GeneratorOptions {
  seed: number;
  operator: string;
  upperMin: number;
  upperMax: number;
  lowerMin: number;
  lowerMax: number;
  numProblems: number;
  descOrder: boolean;
  noNegatives: boolean;
  intsOnly: boolean;
  longDivNotation: boolean;
  fontSelect: string;
}
