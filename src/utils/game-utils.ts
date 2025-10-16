import { CLEAR_SCORE } from "../core/constants";

export function calculateAccuracy(hits: number, misses: number): number {
  const total = hits + misses;
  return total === 0 ? 100 : Math.round((hits / total) * 100);
}

export function getGameOutcome(score: number): "CLEAR" | "FAIL" {
  return score >= CLEAR_SCORE ? "CLEAR" : "FAIL";
}
