import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";

export function ResultPage() {
  const { state } = useLocation() as { state?: { score: number; correct: number; wrong: number } };
  const score = state?.score ?? 0;
  const correct = state?.correct ?? 0;
  const wrong = state?.wrong ?? 0;
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, score, { duration: 0.8 });
    return () => controls.stop();
  }, [mv, score]);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="glass p-6 text-center">
          <h1 className="font-heading text-3xl">Quiz Complete</h1>
          <motion.p className="mono text-6xl text-zapCoral my-3">{display}</motion.p>
          <p className="text-white/70">Correct: {correct} · Wrong: {wrong}</p>
          <div className="flex justify-center gap-2 mt-4">
            <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-zapPurple">Back Dashboard</Link>
            <Link to="/leaderboard" className="px-4 py-2 rounded-xl glass">Leaderboard</Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
