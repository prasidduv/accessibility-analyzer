import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

function animateBackgroundCurve() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const p = Math.min(1, window.scrollY / maxScroll);
  const wave = Math.sin(p * Math.PI * 2);
  const hue = Math.round(246 + 16 * wave);
  const sat = 42 + Math.round(Math.abs(wave) * 12);
  const l = Math.max(0, Math.round(7 + 4 * Math.sin(p * Math.PI)));
  document.documentElement.style.setProperty("--bg-h", String(hue));
  document.documentElement.style.setProperty("--bg-s", `${sat}%`);
  document.documentElement.style.setProperty("--bg-l", `${l}%`);
}

window.addEventListener("scroll", animateBackgroundCurve, { passive: true });
window.addEventListener("resize", animateBackgroundCurve);
animateBackgroundCurve();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
