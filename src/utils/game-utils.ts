import { CLEAR_SCORE, PERCENTAGE_MULTIPLIER, DEFAULT_ACCURACY } from "../core/constants";

export function calculateAccuracy(hits: number, misses: number): number {
  const total = hits + misses;
  return total === 0 ? DEFAULT_ACCURACY : Math.round((hits / total) * PERCENTAGE_MULTIPLIER);
}

export function getGameOutcome(score: number): "CLEAR" | "FAIL" {
  return score >= CLEAR_SCORE ? "CLEAR" : "FAIL";
}
