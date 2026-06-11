import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { quizApi } from "../api/quiz";
import { QuizQuestion } from "../types/api";
import { useInterval } from "../hooks/useInterval";
import { PageTransition } from "../components/PageTransition";
import { sfx } from "../utils/sound";

const modeMeta = {
  easy: { time: 20, points: 10 },
  medium: { time: 15, points: 20 },
  hard: { time: 10, points: 35 },
  blitz: { time: 5, points: 50 }
} as const;

export function QuizPage() {
  const { mode = "easy" } = useParams();
  const nav = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(modeMeta[mode as keyof typeof modeMeta]?.time ?? 20);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    quizApi.getQuestions(mode).then((r) => setQuestions(r.data.questions)).catch(() => setLocked(true));
  }, [mode]);

  const total = questions.length || 1;
  const progress = (index / total) * 100;
  const meta = modeMeta[mode as keyof typeof modeMeta] ?? modeMeta.easy;

  const finish = async (finalCorrect = correct, finalWrong = wrong, finalScore = score) => {
    try {
      await quizApi.submit({ mode, score: finalScore, correctCount: finalCorrect, wrongCount: finalWrong, timeTaken: 0 });
    } catch {
      toast.error("Submit failed");
    }
    sfx.complete();
    nav("/result", { state: { score: finalScore, correct: finalCorrect, wrong: finalWrong } });
  };

  const next = (isCorrect?: boolean) => {
    if (typeof isCorrect === "boolean") {
      if (isCorrect) {
        setCorrect((v) => v + 1);
        setScore((v) => v + meta.points);
        sfx.correct();
      } else {
        setWrong((v) => v + 1);
        sfx.wrong();
      }
    }
    if (index + 1 >= questions.length) {
      const c = typeof isCorrect === "boolean" ? correct + (isCorrect ? 1 : 0) : correct;
      const w = typeof isCorrect === "boolean" ? wrong + (isCorrect ? 0 : 1) : wrong;
      const s = typeof isCorrect === "boolean" ? score + (isCorrect ? meta.points : 0) : score;
      void finish(c, w, s);
      return;
    }
    setIndex((v) => v + 1);
    setLeft(meta.time);
  };

  useInterval(
    () => {
      setLeft((v) => {
        if (v <= 1) {
          next(false);
          return meta.time;
        }
        const n = v - 1;
        if (n <= 5) sfx.tick();
        return n;
      });
    },
    questions.length ? 1000 : null
  );

  const q = useMemo(() => questions[index], [questions, index]);
  if (locked) return <div className="p-4">Mode unavailable</div>;
  if (!q) return <div className="p-4">Loading questions...</div>;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4 space-y-3">
        <div className="glass p-4">
          <div className="flex justify-between items-center">
            <span className="mono">{mode.toUpperCase()} · Q{index + 1}/{questions.length}</span>
            <span className={`mono text-3xl ${left <= 5 ? "animate-pulse text-red-400" : "text-zapCoral"}`}>{left}</span>
          </div>
          <div className="h-3 mt-3 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-zapPurple to-zapCoral transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="glass p-4 space-y-3">
          <h2 className="font-heading text-2xl">{q.question}</h2>
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => next(idx === q.answerIndex)} className="w-full text-left p-3 rounded-xl border border-zapPurple/30 hover:bg-white/10">
              <strong>{String.fromCharCode(65 + idx)}.</strong> {opt}
            </button>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
