import type { ScoreRecord } from "../types";

const STORAGE_KEY = "devtyping_rankings";
const MAX_RECORDS = 10;

export function saveScore(record: ScoreRecord): void {
  const rankings = getRankings();
  rankings.push(record);

  // 점수 내림차순, 같으면 최신순
  rankings.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return b.timestamp - a.timestamp;
  });

  // 상위 10개만 유지
  const topRankings = rankings.slice(0, MAX_RECORDS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topRankings));
  } catch (error) {
    console.error("Failed to save score:", error);
  }
}

export function getRankings(): ScoreRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error("Failed to load rankings:", error);
    return [];
  }
}

export function getPersonalBest(playerName: string): ScoreRecord | null {
  const rankings = getRankings();
  const personalRecords = rankings.filter(r => r.playerName === playerName);

  if (personalRecords.length === 0) return null;

  // 점수가 가장 높은 기록 반환
  return personalRecords.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}

export function clearRankings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear rankings:", error);
  }
}
