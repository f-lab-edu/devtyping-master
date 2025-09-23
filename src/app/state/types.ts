export type View = "name" | "countdown" | "game" | "result";

export interface GameResult {
  score: number;
  hits: number;
  misses: number;
}

export interface GameWordState {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  element: HTMLDivElement;
  missed: boolean;
}
