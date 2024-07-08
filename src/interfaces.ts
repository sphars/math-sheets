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
  operator: string;
  min: number;
  max: number;
  numProblems: number;
  descOrder: boolean;
  noNegatives: boolean;
  intsOnly: boolean;
  fontSelect: string;
}
