import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userApi } from "../api/user";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { PageTransition } from "../components/PageTransition";
import { UserProfile } from "../types/api";
import { levelName } from "../utils/levels";

const modes = [
  { id: "easy", q: 5, sec: 20, pts: 10, level: 1 },
  { id: "medium", q: 8, sec: 15, pts: 20, level: 1 },
  { id: "hard", q: 10, sec: 10, pts: 35, level: 2 },
  { id: "blitz", q: 15, sec: 5, pts: 50, level: 4 }
];

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8 });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span className="mono">{rounded}</motion.span>;
}

export function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const nav = useNavigate();
  const [topic, setTopic] = useState("");

  useEffect(() => {
    userApi.profile().then((r) => setProfile(r.data)).catch(() => toast.error("Could not load profile"));
  }, []);

  const accuracy = useMemo(() => {
    if (!profile) return 0;
    return profile.totalAnswers ? Math.round((profile.correctAnswers / profile.totalAnswers) * 100) : 0;
  }, [profile]);

  if (!profile) {
    return (
      <PageTransition>
        <div className="app-container grid gap-3">
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="app-container space-y-5">
        <div className="glass p-5 flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-zapPurple/30">🏅 {levelName(profile.level)}</span>
          <span className="mono">Score <CountUp value={profile.score} /></span>
          <span className="mono">Games <CountUp value={profile.gamesPlayed} /></span>
          <span className="mono">Accuracy {accuracy}%</span>
        </div>

        <div>
          <h2 className="section-title text-2xl mb-3">Play Modes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map((m) => {
            const locked = profile.level < m.level;
            return (
              <motion.div
                key={m.id}
                className={`glass p-4 ${locked ? "opacity-60" : ""}`}
                whileHover={{ y: -3, rotateX: 2, rotateY: -2 }}
              >
                <h3 className="font-heading text-xl capitalize mb-1">{m.id}</h3>
                <p className="text-white/70">{m.q} questions · {m.sec}s · +{m.pts} pts</p>
                {locked ? (
                  <p className="mt-2 text-zapCoral">🔒 Requires level {m.level}</p>
                ) : (
                  <Link className="inline-block mt-3 px-3 py-2 rounded-lg bg-zapPurple hover:bg-zapPurple/90 transition" to={`/quiz/${m.id}`}>
                    Play
                  </Link>
                )}
              </motion.div>
            );
          })}
          </div>
        </div>

        <div className="glass p-5 space-y-3">
          <h3 className="font-heading text-xl">AI Random Questions</h3>
          <p className="text-white/70">Enter any topic and instantly open AI chat with a pre-filled request.</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input className="flex-1 p-3 rounded-xl bg-white/10 border border-zapPurple/30 focus:border-zapPurple outline-none" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic" />
            <button onClick={() => nav("/chat", { state: { topic } })} className="px-4 py-3 rounded-xl bg-gradient-to-r from-zapPurple to-zapCoral font-semibold">Ask AI</button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
