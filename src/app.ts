import { renderCountdownScreen, renderNameScreen, renderGameScreen, renderResultScreen } from "./components/screens";
import { stateManager } from "./core/state";

const app = document.getElementById("app") as HTMLElement;

// 상태 변경 알림을 받으면 중앙에서 한 번만 렌더
let scheduled = false;
stateManager.subscribe(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    render(); // ← 상태를 읽어 해당 화면 렌더
  });
});

function render(): void {
  switch (stateManager.snapshot.view) {
    case "name":
      renderNameScreen(app);
      break;
    case "countdown":
      renderCountdownScreen(app);
      break;
    case "game":
      renderGameScreen(app);
      break;
    case "result":
      renderResultScreen(app);
      break;
  }
}

function startApp(): void {
  stateManager.setView("name"); // ✅ notify → render() 자동 호출
}

startApp();
