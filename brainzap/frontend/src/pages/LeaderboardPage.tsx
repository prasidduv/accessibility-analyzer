import { useEffect, useState } from "react";
import { PageTransition } from "../components/PageTransition";
import { api } from "../api/client";

type Leader = {
  id: string;
  name: string;
  username: string;
  score: number;
  level: number;
};

export function LeaderboardPage() {
  const [top, setTop] = useState<Leader[]>([]);

  useEffect(() => {
    api.get<{ top: Leader[] }>("/api/leaderboard").then((r) => setTop(r.data.top)).catch(() => setTop([]));
  }, []);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        <h1 className="font-heading text-3xl">Leaderboard</h1>
        {top.map((user, idx) => (
          <div
            key={user.id}
            className="glass p-4 flex items-center justify-between animate-[fadeIn_0.4s_ease_forwards]"
            style={{ animationDelay: `${idx * 70}ms`, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}</span>
              <div>
                <p>{user.name}</p>
                <p className="text-white/60 text-sm">@{user.username}</p>
              </div>
            </div>
            <p className="mono">{user.score}</p>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
