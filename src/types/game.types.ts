export interface WordState {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  element: HTMLDivElement;
  missed: boolean;
}

export interface GameState {
  startedAt: number;
  endsAt: number;
  score: number;
  hits: number;
  misses: number;
  words: WordState[];
  area: HTMLDivElement;
  input: HTMLInputElement;
  timerDisplay: HTMLElement;
  scoreDisplay: HTMLElement;
  accuracyDisplay: HTMLElement;
  skipButton: HTMLButtonElement;
  running: boolean;
}
export interface AppState {
  view: "name" | "countdown" | "game" | "result";
  playerName: string;
  countdownValue: number;
  game: GameState | null;
  result: {
    score: number;
    hits: number;
    misses: number;
  } | null;
}
