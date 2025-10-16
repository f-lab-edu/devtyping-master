# DevTyping 🎮⌨️

> TypeScript 기반 타이핑 게임 - 클래스, 클로저, 프로토타입 학습 프로젝트

## 📌 프로젝트 소개

떨어지는 프로그래밍 용어를 빠르게 타이핑하여 점수를 획득하는 웹 게임입니다.
바닐라 TypeScript로 구현하여 JavaScript의 핵심 개념들을 학습하고 적용했습니다.

**🎯 학습 목표**

- ✅ 클래스를 활용한 상태 관리 패턴
- ✅ 클로저를 통한 데이터 은닉 및 함수형 프로그래밍
- ✅ 프로토타입 체인의 이해와 활용
- ✅ Observer 패턴 구현 (Pub-Sub)
- ✅ TypeScript Strict 모드 적용

## 🎮 게임 방법

1. 이름을 입력하고 시작
2. 3초 카운트다운 후 게임 시작
3. 화면 위에서 떨어지는 단어를 입력 후 Enter
4. 60초 동안 최대한 많은 단어를 맞추세요!
5. 목표 점수: 120점 (CLEAR)

**조작법**

- `Enter`: 단어 제출
- `스킵`: 가장 아래 단어 건너뛰기

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:5173 접속

### 프로덕션 빌드

```bash
npm run build
```

### 타입 체크

```bash
npm run typecheck
```

## 🏗️ 기술 스택

- **언어**: TypeScript (Strict Mode)
- **빌드 도구**: Vite
- **스타일**: Vanilla CSS
- **상태 관리**: 자체 구현 (StateManager 클래스)
- **패턴**: Observer Pattern, Singleton Pattern

## 📁 프로젝트 구조

```
src/
├── app.ts                    # 애플리케이션 진입점
├── index.html               # HTML 템플릿
├── styles.css               # 글로벌 스타일
├── core/                    # 핵심 비즈니스 로직
│   ├── state/              # 상태 관리
│   │   └── game-state.ts   # StateManager 클래스 (클로저 활용)
│   ├── game/               # 게임 엔진
│   │   ├── game-engine.ts  # 단어 생성, 충돌 감지
│   │   └── timer.ts        # 타이머 관리
│   └── constants/          # 게임 설정
│       └── game-config.ts  # 난이도, 단어 뱅크
├── components/             # UI 컴포넌트
│   ├── screens/           # 화면 렌더링
│   │   ├── name-input.ts
│   │   ├── countdown.ts
│   │   ├── game.ts
│   │   └── result.ts
│   └── ui/                # 재사용 가능한 UI 요소
│       └── ui-elements.ts
├── utils/                 # 유틸리티 함수
│   └── game-utils.ts
└── types/                 # TypeScript 타입 정의
    └── game.types.ts
```

## 💡 핵심 구현 사항

### 1. 클래스 기반 상태 관리

```typescript
export class StateManager {
  private listeners: Array<() => void> = []; // 클로저로 보호
  readonly state: AppState;

  subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      // 클로저: fn을 기억하는 unsubscribe 함수
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }
}
```

**특징**:

- `private`로 구독자 목록 보호
- `readonly`로 상태 불변성 보장
- Singleton 패턴으로 전역 상태 관리

### 2. Observer 패턴

```typescript
stateManager.subscribe(() => {
  render(); // 상태 변경 시 자동 UI 업데이트
});

stateManager.setView("game"); // → notify() → render() 자동 호출
```

### 3. TypeScript Strict 모드

- `noUncheckedIndexedAccess`: 배열 접근 시 undefined 체크 강제
- `exactOptionalPropertyTypes`: 옵셔널 프로퍼티 엄격 검사
- `verbatimModuleSyntax`: Type-only import 명시

### 4. 성능 최적화

- `requestAnimationFrame`으로 60fps 유지
- Debounce 패턴으로 불필요한 렌더링 방지

## 📚 학습 내용

자세한 학습 내용은 [LEARNING.md](LEARNING.md)를 참고하세요.

**주요 개념**:

1. **클래스**: 캡슐화, 접근 제어, 생성자
2. **클로저**: 데이터 은닉, 상태 유지, 함수 반환
3. **프로토타입**: 프로토타입 체인, instanceof, 메서드 상속
4. **디자인 패턴**: Observer, Singleton
5. **TypeScript**: 타입 시스템, Strict 모드, Type Guards

## 🎯 향후 개선 계획

- [ ] 난이도 선택 (Easy/Normal/Hard)
- [ ] 콤보 시스템 (연속 정답 시 보너스)
- [ ] 로컬 스토리지로 최고 점수 저장
- [ ] WPM (Words Per Minute) 계산
- [ ] 사운드 효과
- [ ] 다크모드 지원
