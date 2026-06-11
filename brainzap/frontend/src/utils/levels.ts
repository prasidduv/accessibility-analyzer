export const levelThresholds = [0, 200, 500, 1000, 2000];
export const levelLabels = ["Rookie", "Explorer", "Scholar", "Expert", "Master"];

export function levelName(level: number): string {
  return levelLabels[Math.max(0, Math.min(levelLabels.length - 1, level - 1))];
}
