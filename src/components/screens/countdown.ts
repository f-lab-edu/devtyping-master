import { stateManager } from "../../core/state";
import { createCard } from "../ui";

export function renderCountdownScreen(container: HTMLElement): void {
  container.innerHTML = "";

  const card = createCard();

  const title = document.createElement("h1");
  title.textContent = stateManager.snapshot.playerName + " 님, 준비되셨나요?";

  const description = document.createElement("p");
  description.textContent = "3 · 2 · 1 카운트다운 후 게임이 시작됩니다.";

  const number = document.createElement("div");
  number.className = "countdown-number";
  number.textContent =
    stateManager.snapshot.countdownValue > 0 ? String(stateManager.snapshot.countdownValue) : "START!";

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(number);
  container.appendChild(card);
}
