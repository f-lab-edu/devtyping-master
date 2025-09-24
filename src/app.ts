import {
  renderCountdownScreen,
  renderNameScreen,
  renderGameScreen,
  renderResultScreen
} from "./components/screens";
import { setView, state } from "./core/state";

const app = document.getElementById("app") as HTMLElement;

function render(): void {
  switch (state.view) {
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
  setView("name");
  render();
}

startApp();
