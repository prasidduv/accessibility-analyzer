import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PageTransition } from "../components/PageTransition";
import { aiApi } from "../api/ai";

const chips = ["Science", "History", "Sports", "Movies", "Geography", "Tech", "Cricket", "Space"];

type Msg = { role: "user" | "ai"; text: string };

export function ChatPage() {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", text: "Ask a topic to generate 5 quiz questions." }]);
  const loc = useLocation() as { state?: { topic?: string } };

  useEffect(() => {
    if (loc.state?.topic) {
      setTopic(loc.state.topic);
    }
  }, [loc.state]);

  const send = async (t = topic) => {
    if (!t.trim()) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    const res = await aiApi.generate(t);
    const lines = res.data.questions
      .map((q, i) => `Q${i + 1}. ${q.question}\nA) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]}\nAnswer: ${String.fromCharCode(65 + q.answerIndex)}`)
      .join("\n\n");
    setMessages((m) => [...m, { role: "ai", text: lines }]);
    setTopic("");
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto p-4 space-y-3">
        <h1 className="font-heading text-3xl">AI Chatbot</h1>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c} className="px-3 py-2 rounded-full glass" onClick={() => { setTopic(c); void send(c); }}>
              {c}
            </button>
          ))}
        </div>
        <div className="glass p-4 h-[50vh] overflow-auto space-y-2">
          {messages.map((m, i) => (
            <p key={i} className={`p-3 rounded-xl whitespace-pre-wrap ${m.role === "user" ? "bg-zapPurple/30 ml-auto max-w-[85%]" : "bg-white/10 max-w-[90%]"}`}>
              {m.text}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="flex-1 p-3 rounded-xl bg-white/10 border border-zapPurple/30" placeholder="Custom topic..." />
          <button onClick={() => void send()} className="px-4 rounded-xl bg-gradient-to-r from-zapPurple to-zapCoral">Generate</button>
        </div>
      </div>
    </PageTransition>
  );
}
