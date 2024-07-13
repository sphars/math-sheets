export interface Font {
  name: string;
  family: string;
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

export interface Operand {
  min: number;
  max: number;
}

export interface GeneratorOptions {
  seed: number;
  operator: string;
  operands: {
    left: Operand;
    right: Operand;
  };
  numProblems: number;
  descOrder: boolean;
  noNegatives: boolean;
  intsOnly: boolean;
  fontSelect: string;
}
