import { startCountdown } from "../../core/game";
import { stateManager } from "../../core/state";

import { createCard, createButton, createInput } from "../ui";

export function renderNameScreen(container: HTMLElement): void {
  container.innerHTML = "";

  const card = createCard();

  const header = document.createElement("div");
  const title = document.createElement("h1");
  title.textContent = "DevTyping Week 1";

  const description = document.createElement("p");
  description.textContent = "플레이어 이름을 입력하고 60초 타이핑 레이스를 시작하세요.";

  header.appendChild(title);
  header.appendChild(description);

  const form = document.createElement("form");
  form.id = "name-form";

  const label = document.createElement("label");
  label.setAttribute("for", "playerName");
  label.textContent = "플레이어 이름";

  const input = createInput("예: 호두누나!");
  input.required = true;

  const button = createButton("게임 시작");
  button.type = "submit";

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(button);

  card.appendChild(header);
  card.appendChild(form);
  container.appendChild(card);

  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }

    stateManager.setPlayerName(value);
    startCountdown();
  });

  card.appendChild(header);
  card.appendChild(form);
  container.appendChild(card);

  window.requestAnimationFrame(() => input.focus());
}
