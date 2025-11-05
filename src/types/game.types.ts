export interface WordState {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  missed: boolean;
}

export interface wordElement {
  id: string;
  element: HTMLDivElement;
}

export interface GameState {
  startedAt: number;
  endsAt: number;
  score: number;
  hits: number;
  misses: number;
  words: WordState[];
  area: HTMLDivElement;
  remainingTime: number;
  lastHitWordId: string | null; //맞춘단어
  lastMissWordId: string | null; // 놓친단어

  input: HTMLInputElement;
  timerDisplay: HTMLElement;
  scoreDisplay: HTMLElement;
  accuracyDisplay: HTMLElement;
  skipButton: HTMLButtonElement;
  running: boolean;
}

export type Difficulty = "easy" | "normal" | "hard";

export interface ScoreRecord {
  playerName: string;
  score: number;
  accuracy: number;
  difficulty: Difficulty;
  timestamp: number;
}

export interface AppState {
  view: "name" | "countdown" | "game" | "result";
  difficulty: Difficulty;
  playerName: string;
  countdownValue: number;
  game: GameState | null;
  result: {
    score: number;
    hits: number;
    misses: number;
  } | null;
}
