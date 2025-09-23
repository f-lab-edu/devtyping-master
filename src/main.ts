import "./styles/main.css";
import { App } from "./app/app";

declare global {
  interface Window {
    devTypingApp?: App;
  }
}

const root = document.getElementById("app");
if (!root) {
  throw new Error("앱 루트 요소를 찾을 수 없었음.");
}

const app = new App(root);
app.start();

window.devTypingApp = app;
