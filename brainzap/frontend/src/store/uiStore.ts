import { create } from "zustand";

type Theme = "dark" | "light";

type UIState = {
  theme: Theme;
  muted: boolean;
  setTheme: (theme: Theme) => void;
  toggleMuted: () => void;
};

const savedTheme = (localStorage.getItem("brainzap_theme") as Theme | null) ?? "dark";
const savedMuted = localStorage.getItem("brainzap_muted") === "1";

export const useUIStore = create<UIState>((set) => ({
  theme: savedTheme,
  muted: savedMuted,
  setTheme: (theme) => {
    localStorage.setItem("brainzap_theme", theme);
    set({ theme });
  },
  toggleMuted: () =>
    set((state) => {
      const next = !state.muted;
      localStorage.setItem("brainzap_muted", next ? "1" : "0");
      return { muted: next };
    })
}));
