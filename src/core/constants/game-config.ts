// 게임 타이밍
export const GAME_DURATION_MS: number = 60000;
export const COUNTDOWN_START: number = 3;
export const WORD_SPAWN_INTERVAL_MS: number = 2000;
export const SPEED_CONVERSION_FACTOR = 1000;

// 점수 및 난이도
export const CLEAR_SCORE: number = 120;
export const POINTS_PER_WORD: number = 10;
export const WORD_SPEED_RANGE: [number, number] = [70, 120];

// 난이도별 속도 범위
export const DIFFICULTY_SPEED_RANGES: Record<"easy" | "normal" | "hard", [number, number]> = {
  easy: [40, 70], // 느림
  normal: [70, 120], // 기본 (기존 설정)
  hard: [120, 180], // 빠름
};

// 레이아웃 및 위치
export const WORD_SPAWN_Y = -40;
export const WORD_BOTTOM_OFFSET = 34;
export const WORD_WIDTH_PER_CHAR = 12;
export const WORD_BASE_PADDING = 40;
export const WORD_SPAWN_PADDING = 20;

// 애니메이션
export const HIT_ANIMATION_DURATION = 180;
export const MISS_ANIMATION_DURATION = 240;

// 타이머 계산
export const TIMER_DISPLAY_PRECISION = 100; // 0.1초 단위 (1000ms / 10)
export const TIMER_DECIMAL_PLACES = 10; // Math.round(...) / 10

// ID 생성
export const RANDOM_ID_SLICE_START = 2;
export const RANDOM_ID_SLICE_END = 6;

// 정확도 계산
export const PERCENTAGE_MULTIPLIER = 100;
export const DEFAULT_ACCURACY = 100;
export const WORD_BANK: string[] = [
  "function",
  "variable",
  "object",
  "browser",
  "promise",
  "callback",
  "closure",
  "module",
  "async",
  "await",
  "event",
  "state",
  "render",
  "layout",
  "debug",
  "commit",
  "branch",
  "deploy",
  "refactor",
  "typing",
  "coding",
  "developer",
  "keyboard",
  "snippet",
  "canvas",
  "script",
  "string",
  "number",
  "boolean",
  "array",
  "method",
  "component",
  "props",
  "hook",
  "router",
];
