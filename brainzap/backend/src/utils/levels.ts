const thresholds = [0, 200, 500, 1000, 2000];

export function scoreToLevel(score: number): number {
  let level = 1;
  thresholds.forEach((t, idx) => {
    if (score >= t) level = idx + 1;
  });
  return level;
}
