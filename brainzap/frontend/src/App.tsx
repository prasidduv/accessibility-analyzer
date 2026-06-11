import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { QuizPage } from "./pages/QuizPage";
import { ResultPage } from "./pages/ResultPage";
import { useUIStore } from "./store/uiStore";

export default function App() {
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);

  if (theme === "light") {
    document.body.classList.add("bg-slate-100", "text-slate-900");
    document.body.classList.remove("bg-black", "text-white");
  } else {
    document.body.classList.remove("bg-slate-100", "text-slate-900");
    document.body.classList.add("bg-black", "text-white");
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      {location.pathname !== "/login" && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/quiz/:mode" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
