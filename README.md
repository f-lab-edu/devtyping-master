# DevTyping 🎮⌨️

> TypeScript 기반 타이핑 게임 - 관심사 분리와 상태 관리 학습 프로젝트

## 📌 프로젝트 소개

떨어지는 프로그래밍 용어를 빠르게 타이핑하여 점수를 획득하는 웹 게임입니다.
바닐라 TypeScript로 구현하여 JavaScript의 핵심 개념과 아키텍처 패턴을 학습하고 적용했습니다.

**🎯 학습 목표**

- ✅ 관심사 분리 (Separation of Concerns) - Core / Components / Utils
- ✅ 클래스 기반 상태 관리 패턴
- ✅ Observer 패턴 구현 (이중 구독 시스템)
- ✅ 뷰-로직 분리 (GameEngine + GameView)
- ✅ CSS 애니메이션과 DOM 최적화
- ✅ TypeScript Strict 모드 적용

## 🎮 게임 방법

1. 이름을 입력하고 시작
2. 3초 카운트다운 후 게임 시작
3. 화면 위에서 떨어지는 단어를 입력 후 Enter
4. 60초 동안 최대한 많은 단어를 맞추세요!
5. 목표 점수: 120점 (CLEAR)

**조작법**

- `Enter`: 단어 제출
- `스킵 버튼`: 가장 아래 단어 건너뛰기 (정확도 감소)

**점수 시스템**

- 정답: +10점
- 오답/스킵: 정확도 감소
- 정확도 = hits / (hits + misses) × 100%

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

→ http://127.0.0.1:5173 접속

### 프로덕션 빌드

```bash
npm run build
```

## 🏗️ 기술 스택

- **언어**: TypeScript (Strict Mode)
- **런타임**: Browser (ES Module)
- **스타일**: Vanilla CSS + CSS Animations
- **상태 관리**: 자체 구현 StateManager (Observer Pattern)
- **아키텍처**: Layered Architecture (Core-Components-Utils)

## 📁 프로젝트 구조

```
src/
├── app.ts                      # 애플리케이션 진입점 + 라우터
├── index.html                  # HTML 템플릿
├── styles.css                  # 글로벌 스타일 + 애니메이션
│
├── core/                       # 핵심 비즈니스 로직 (DOM 독립)
│   ├── state/                  # 전역 상태 관리
│   │   └── game-state.ts       # StateManager 클래스
│   ├── game/                   # 게임 엔진
│   │   ├── game-engine.ts      # 단어 생성/매칭/물리 연산
│   │   └── timer.ts            # 타이머/카운트다운/게임 루프
│   └── constants/              # 게임 설정 상수
│       └── game-config.ts      # 게임 난이도, 단어 뱅크
│
├── components/                 # UI 컴포넌트 (DOM 렌더링)
│   ├── screens/                # 화면별 렌더링 함수
│   │   ├── name-input.ts       # 이름 입력 화면
│   │   ├── countdown.ts        # 카운트다운 화면
│   │   ├── game.ts             # 게임 플레이 화면
│   │   └── result.ts           # 결과 화면
│   └── ui/                     # 재사용 가능한 UI 요소
│       ├── ui-elements.ts      # 통계 블록 등
│       └── game-view.ts        # 게임 뷰 클래스 (단어 렌더링)
│
├── utils/                      # 유틸리티 함수
│   └── game-utils.ts           # 정확도 계산 등
│
└── types/                      # TypeScript 타입 정의
    └── game.types.ts           # AppState, GameState, WordState
```

## 💡 핵심 구현 사항

### 1. 이중 구독 시스템 (Dual Subscription)

```typescript
export class StateManager {
  private listeners: Array<() => void> = []; // 화면 전환용
  private gameListeners: Array<() => void> = []; // 게임 루프용

  subscribe(fn: () => void) {
    /* ... */
  } // 화면 전환 시 호출
  subscribeGame(fn: () => void) {
    /* ... */
  } // 게임 상태 변경 시 호출
}
```

**목적**: 화면 전환과 게임 루프를 분리하여 불필요한 렌더링 방지

### 2. 뷰-로직 분리 패턴

```typescript
// GameEngine (core/game) - 순수 로직
class GameEngine {
  submitTypedWord(inputValue: string): boolean {
    /* 매칭 로직만 */
  }
  updateWords(delta: number): void {
    /* 물리 연산만 */
  }
}

// GameView (components/ui) - 렌더링만
class GameView {
  render(gameState: GameState): void {
    /* DOM 업데이트만 */
  }
  showHitEffect(wordId: string): void {
    /* 애니메이션만 */
  }
}
```

**장점**:

- ✅ 테스트 용이 (로직과 DOM 분리)
- ✅ 재사용성 향상
- ✅ 단일 책임 원칙 준수

### 3. CSS 애니메이션 최적화

```typescript
// 이펙트 처리 흐름
render(gameState) {
  // 1. 이펙트 클래스 추가 (hit/miss)
  this.showHitEffect(wordId);

  // 2. syncWords에서 이펙트 중인 element 보호
  if (element.classList.contains('hit')) continue;

  // 3. setTimeout으로 애니메이션 후 제거
  setTimeout(() => element.remove(), 180);
}
```

**애니메이션**:

- `hit`: 확대 → 축소 (180ms, scale 효과)
- `miss`: 좌우 흔들림 (240ms, shake 효과)

### 4. requestAnimationFrame 게임 루프

```typescript
private gameLoop(now: number): void {
  const delta = now - this.lastFrame;  // 프레임 간격 계산
  this.lastFrame = now;

  this.gameEngine.updateWords(delta);  // 물리 업데이트
  this.updateTimer(now);               // 타이머 업데이트

  if (now >= game.endsAt) {
    this.finishGame();
    return;
  }

  requestAnimationFrame(this.gameLoop.bind(this));
}
```

**특징**:

- 60fps 유지
- 디바이스 리프레시 레이트에 맞춰 실행
- delta time 기반 물리 연산 (속도 = pixel/s)

### 5. 상태 중심 설계

```typescript
interface GameState {
  // 게임 메타데이터
  startedAt: number;
  endsAt: number;
  running: boolean;

  // 게임 데이터
  score: number;
  hits: number;
  misses: number;
  words: WordState[];
  remainingTime: number;

  // 이펙트 추적
  lastHitWordId: string | null;
  lastMissWordId: string | null;

  // DOM 참조 (리팩토링 예정)
  area: HTMLDivElement;
  input: HTMLInputElement;
  // ...
}
```

### 6. TypeScript Strict 모드

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // 배열 접근 시 undefined 체크
    "exactOptionalPropertyTypes": true, // 옵셔널 엄격 검사
  }
}
```

## 🎨 아키텍처 다이어그램

```
┌─────────────────────────────────────────────┐
│              app.ts (Router)                │
│  - subscribe(render)                        │
│  - View Router (name/countdown/game/result) │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐
│ StateManager  │    │ Components/     │
│ (core/state)  │───▶│ Screens         │
│               │    │ - renderGame()  │
│ - subscribe   │    │ - renderResult()│
│ - updateGame  │    └────────┬────────┘
└───────┬───────┘             │
        │                     ▼
        │            ┌─────────────────┐
        │            │ GameView        │
        │            │ (components/ui) │
        │            │                 │
        ▼            │ - render()      │
┌───────────────┐   │ - syncWords()   │
│ GameEngine    │   │ - showEffect()  │
│ (core/game)   │   └─────────────────┘
│               │
│ - spawnWord() │
│ - updateWords()│
│ - submitWord()│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ GameTimer     │
│ (core/game)   │
│               │
│ - gameLoop()  │
│ - countdown() │
└───────────────┘
```

## 📚 주요 학습 내용

### 1. 관심사 분리 (Separation of Concerns)

- **Core**: 비즈니스 로직, 상태 관리 (DOM 독립)
- **Components**: UI 렌더링, 이벤트 핸들링
- **Utils**: 순수 함수, 유틸리티

### 2. 상태 관리 패턴

- Observer Pattern으로 상태 변경 구독
- 이중 구독 시스템 (화면/게임 분리)
- Mutator 패턴으로 상태 업데이트

### 3. 성능 최적화

- `requestAnimationFrame`으로 렌더링 최적화
- Delta time 기반 물리 연산
- CSS 애니메이션 하드웨어 가속
- Element 보호 로직 (이펙트 중복 방지)

### 4. TypeScript 활용

- Strict 모드로 타입 안정성 확보
- Interface로 도메인 모델 정의
- Generic 없이도 명확한 타입 시스템

## 🔧 리팩토링 예정 사항

### 현재 아키텍처 이슈

**GameState에 DOM 참조 저장** (game.types.ts:22-31)

- `input`, `area`, `timerDisplay` 등을 state에 저장 중
- 컴포넌트 레벨에서 관리하도록 수정 예정

## 🎯 향후 개선 계획

### 기능

- [ ] 난이도 선택 (Easy/Normal/Hard)
- [ ] 로컬 스토리지로 최고 점수 저장
