import { Link, useNavigate } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { sfx } from "../utils/sound";

export function Navbar() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const muted = useUIStore((s) => s.muted);
  const toggleMuted = useUIStore((s) => s.toggleMuted);
  const setToken = useAuthStore((s) => s.setAccessToken);
  const nav = useNavigate();

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    nav("/login");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-black/45 border-b border-zapPurple/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="font-heading text-2xl bg-gradient-to-r from-zapPurple to-zapCoral bg-clip-text text-transparent">
          BrainZap
        </Link>
        <nav className="flex items-center gap-2 text-sm flex-wrap justify-end">
          <Link to="/dashboard" className="px-3 py-2 rounded-full glass hover:-translate-y-0.5">Dashboard</Link>
          <Link to="/leaderboard" className="px-3 py-2 rounded-full glass hover:-translate-y-0.5">Leaderboard</Link>
          <Link to="/chat" className="px-3 py-2 rounded-full glass hover:-translate-y-0.5">Chat</Link>
          <button className="px-3 py-2 rounded-full glass" onClick={() => { sfx.click(); setTheme(theme === "dark" ? "light" : "dark"); }}>
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button className="px-3 py-2 rounded-full glass" onClick={() => { sfx.click(); toggleMuted(); }}>
            {muted ? "🔇" : "🔊"}
          </button>
          <button className="px-3 py-2 rounded-full bg-zapPurple/80 hover:bg-zapPurple" onClick={logout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
