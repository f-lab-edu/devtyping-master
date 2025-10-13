import { CLEAR_SCORE } from "../core/constants";

export function calculateAccuracy(result: { hits: number; misses: number }) {
  const { hits, misses } = result;
  return hits + misses === 0 ? 100 : Math.round((hits / (hits + misses)) * 100);
}
export function getGameOutcome(result: { score: number }): "CLEAR" | "FAIL" {
  const { score } = result;
  return score >= CLEAR_SCORE ? "CLEAR" : "FAIL";
}
