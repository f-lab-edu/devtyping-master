# 학습 내용 정리

이 프로젝트를 통해 학습하고 구현한 JavaScript/TypeScript 핵심 개념들입니다.

## 1. 클래스 (Class)

### 구현 위치
- `src/core/state/game-state.ts` - StateManager 클래스

### 학습한 내용
```typescript
export class StateManager {
  // 1. private 필드: 클래스 내부에서만 접근 가능
  private listeners: Array<() => void> = [];

  // 2. readonly 필드: 읽기 전용 (재할당 불가)
  readonly state: AppState;

  // 3. constructor: 인스턴스 초기화
  constructor() {
    this.state = { /* ... */ };
  }

  // 4. public 메서드: 외부에서 접근 가능
  subscribe(fn: () => void) { /* ... */ }

  // 5. private 메서드: 클래스 내부에서만 사용
  private notify() { /* ... */ }

  // 6. getter: 계산된 속성
  get snapshot(): Readonly<AppState> {
    return this.state;
  }
}
```

### 왜 클래스를 사용했나?
- ✅ **캡슐화**: 상태와 관련 로직을 하나로 묶음
- ✅ **접근 제어**: private/public으로 인터페이스 명확화
- ✅ **싱글톤 패턴**: `export const stateManager = new StateManager();`

---

## 2. 클로저 (Closure)

### 구현 위치
- `src/core/state/game-state.ts:45-50` - subscribe 메서드

### 학습한 내용
```typescript
subscribe(fn: () => void) {
  this.listeners.push(fn);

  // 클로저: 반환된 함수가 외부 변수 'fn'을 기억
  return () => {
    // 'fn'은 이 함수가 생성될 때의 값을 계속 기억함
    this.listeners = this.listeners.filter(f => f !== fn);
  };
}
```

### 클로저의 활용
**예제: 구독 취소 함수**
```typescript
const unsubscribe = stateManager.subscribe(() => {
  console.log('State changed!');
});

// 나중에 구독 취소
unsubscribe(); // 클로저 덕분에 정확한 구독자를 제거 가능
```

### 왜 클로저가 필요한가?
- ✅ **데이터 은닉**: listeners 배열을 외부에 노출하지 않음
- ✅ **상태 유지**: 각 구독자마다 고유한 취소 함수 제공
- ✅ **메모리 관리**: 필요 없는 구독을 정확히 제거

---

## 3. 프로토타입 (Prototype)

### 프로토타입 체인의 이해
```typescript
class StateManager {
  subscribe(fn: () => void) { /* ... */ }
}

const manager = new StateManager();

// 프로토타입 체인:
// manager.__proto__ === StateManager.prototype
// StateManager.prototype.__proto__ === Object.prototype
```

### instanceof 활용
```typescript
// 타입 가드에서 프로토타입 체인 확인
const element = document.getElementById("skip-button");

if (element instanceof HTMLButtonElement) {
  // 프로토타입 체인을 통해 HTMLButtonElement 타입임을 확인
  element.disabled = true; // ✅ OK
}
```

### 구현 위치
- `src/core/game/game-engine.ts:142` - instanceof 사용
- 모든 클래스 메서드는 프로토타입에 저장됨

---

## 4. 디자인 패턴

### Observer 패턴 (Pub-Sub)
**구현**: `StateManager.subscribe()` / `notify()`

```typescript
// 구독자 등록
stateManager.subscribe(() => {
  render(); // 상태 변경 시 자동 렌더링
});

// 상태 변경 시 자동으로 모든 구독자에게 알림
stateManager.setView("game"); // → notify() 호출 → render() 실행
```

**장점**:
- 상태와 UI를 분리
- 하나의 상태 변경이 여러 곳에 자동 반영

### Singleton 패턴
```typescript
// game-state.ts
export const stateManager = new StateManager();

// 앱 전체에서 동일한 인스턴스 사용
import { stateManager } from './core/state';
```

**장점**:
- 전역 상태를 하나의 인스턴스로 관리
- 일관된 상태 접근

---

## 5. TypeScript 고급 기능

### Strict Type Checking
```typescript
// tsconfig.json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,  // 배열 접근 시 undefined 체크 강제
  "exactOptionalPropertyTypes": true,
  "noUnusedLocals": true
}
```

### Type-only Import
```typescript
// 런타임에 포함되지 않는 타입만 import
import type { WordState } from "../../types";
```

### Type Guards
```typescript
const game = stateManager.snapshot.game;
if (!game?.running) return; // Optional chaining + type narrowing
```

---

## 6. 모듈 시스템

### ES Modules
- **Named Export**: `export function spawnWord() { }`
- **Default Export**: 사용하지 않음 (명시성을 위해)
- **Re-export**: `export * from './game.types'`

### 폴더 구조
```
src/
├── core/          # 비즈니스 로직
│   ├── state/     # 상태 관리 (클래스)
│   ├── game/      # 게임 엔진
│   └── constants/ # 설정값
├── components/    # UI 컴포넌트
├── utils/         # 유틸리티 함수
└── types/         # TypeScript 타입 정의
```

---

## 7. 성능 최적화

### requestAnimationFrame
```typescript
// 브라우저 렌더링 주기에 맞춰 60fps로 실행
const loop = (now: number) => {
  updateWords(delta);
  requestAnimationFrame(loop);
};
```

### Debounce (렌더링 최적화)
```typescript
let scheduled = false;
stateManager.subscribe(() => {
  if (scheduled) return; // 중복 렌더링 방지
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    render();
  });
});
```

---

## 8. 실전 예제

### 클로저 + 클래스 조합
```typescript
class Timer {
  private intervalId: number | null = null;

  start(callback: () => void, delay: number) {
    // 클로저: callback을 기억
    this.intervalId = setInterval(() => {
      callback();
    }, delay);

    // 클로저: intervalId를 기억하는 정리 함수 반환
    return () => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }
}
```

---

## 참고 자료

- [MDN - Classes](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes)
- [MDN - Closures](https://developer.mozilla.org/ko/docs/Web/JavaScript/Closures)
- [MDN - Prototype](https://developer.mozilla.org/ko/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
