export interface Font {
  name: string;
  family: string;
  url?: string;
  format?: string;
  weight?: string | number;
  style?: string;
  base64?: string;
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
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  numProblems: number;
  descOrder: boolean;
  noNegatives: boolean;
  intsOnly: boolean;
  fontSelect: string;
}
