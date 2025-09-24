import { state } from "../../core/state";
import { createCard } from "../ui";

export function renderCountdownScreen(container: HTMLElement): void {
  container.innerHTML = "";

  const card = createCard();

  const title = document.createElement("h1");
  title.textContent = state.playerName + " 님, 준비되셨나요?";

  const description = document.createElement("p");
  description.textContent = "3 · 2 · 1 카운트다운 후 게임이 시작됩니다.";

  const number = document.createElement("div");
  number.className = "countdown-number";
  number.textContent = state.countdownValue > 0 ? String(state.countdownValue) : "START!";

  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(number);
  container.appendChild(card);
}
