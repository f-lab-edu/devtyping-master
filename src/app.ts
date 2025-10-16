import { renderCountdownScreen, renderNameScreen, renderGameScreen, renderResultScreen } from "./components/screens";
import { stateManager } from "./core/state";

const app = document.getElementById("app") as HTMLElement;

let scheduled = false;
stateManager.subscribe(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    render();
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
  stateManager.setView("name");
}

startApp();
