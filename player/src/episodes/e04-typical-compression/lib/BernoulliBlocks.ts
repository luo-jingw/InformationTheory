/** Exact finite-block binomial probabilities used only as illustrations. */
export class BernoulliBlocks {
  static entropy(p: number): number {
    return p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }

  static surprisal(n: number, ones: number, p: number): number {
    return -(ones * Math.log2(p) + (n - ones) * Math.log2(1 - p)) / n;
  }

  static masses(n: number, p: number): readonly number[] {
    const values: number[] = [];
    let logChoose = 0;
    for (let k = 0; k <= n; k++) {
      if (k > 0) logChoose += Math.log(n - k + 1) - Math.log(k);
      values.push(Math.exp(logChoose + k * Math.log(p) + (n - k) * Math.log(1 - p)));
    }
    return values;
  }

  static atypical(n: number, p: number, epsilon: number): number {
    const h = BernoulliBlocks.entropy(p);
    return BernoulliBlocks.masses(n, p).reduce((sum: number, value: number, k: number): number =>
      sum + (Math.abs(BernoulliBlocks.surprisal(n, k, p) - h) > epsilon + 1e-12 ? value : 0), 0);
  }
}
