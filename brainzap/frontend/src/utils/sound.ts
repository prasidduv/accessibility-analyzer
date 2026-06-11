import { Howl } from "howler";
import { useUIStore } from "../store/uiStore";

function canPlay() {
  return !useUIStore.getState().muted;
}

function tone(freq: number, durationMs: number, type: OscillatorType, endFreq = freq) {
  if (!canPlay()) return;
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  osc.frequency.linearRampToValueAtTime(endFreq, audio.currentTime + durationMs / 1000);
  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + durationMs / 1000);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + durationMs / 1000);
}

export const sfx = {
  click: () => {
    if (!canPlay()) return;
    new Howl({ src: [], volume: 0 }).play();
    tone(420, 55, "triangle", 500);
  },
  correct: () => {
    tone(650, 100, "sine", 820);
    setTimeout(() => tone(820, 100, "sine", 980), 60);
  },
  wrong: () => tone(240, 220, "sawtooth", 110),
  levelUp: () => [520, 660, 830, 1030].forEach((f, i) => setTimeout(() => tone(f, 120, "triangle", f * 1.05), i * 90)),
  tick: () => tone(560, 45, "square", 490),
  complete: () => [390, 520, 680, 840].forEach((f, i) => setTimeout(() => tone(f, 120, "sine", f * 1.06), i * 70))
};
