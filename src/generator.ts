export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  public nextInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(this.random() * (maxFloored - minCeiled + 1) + minCeiled);
  }
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}
