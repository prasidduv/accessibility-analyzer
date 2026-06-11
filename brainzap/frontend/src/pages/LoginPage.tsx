import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { PageTransition } from "../components/PageTransition";

export function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useAuthStore((s) => s.setAccessToken);
  const nav = useNavigate();

  const submit = async () => {
    try {
      if (tab === "register") {
        const res = await authApi.register({ name, username, password });
        setToken(res.data.accessToken);
      } else {
        const res = await authApi.login({ username, password });
        setToken(res.data.accessToken);
      }
      toast.success("Welcome to BrainZap");
      nav("/dashboard");
    } catch (e) {
      const message = axios.isAxiosError(e)
        ? (e.response?.data?.message ?? "Server unavailable. Check backend and env setup.")
        : "Unexpected authentication error.";
      toast.error(`Auth failed: ${message}`);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen grid place-items-center p-4 md:p-6">
        <div className="glass w-full max-w-md p-7 md:p-8 space-y-5">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl bg-gradient-to-r from-zapPurple to-zapCoral bg-clip-text text-transparent">BrainZap</h1>
            <p className="text-white/70">Compete smarter with AI-powered quiz rounds.</p>
          </div>
          <div className="flex gap-2 p-1 rounded-full bg-white/5 border border-zapPurple/20">
            <button className={`flex-1 px-3 py-2 rounded-full transition ${tab === "login" ? "bg-zapPurple text-white" : "text-white/75 hover:bg-white/10"}`} onClick={() => setTab("login")}>Login</button>
            <button className={`flex-1 px-3 py-2 rounded-full transition ${tab === "register" ? "bg-zapPurple text-white" : "text-white/75 hover:bg-white/10"}`} onClick={() => setTab("register")}>Register</button>
          </div>
          {tab === "register" && <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-xl bg-white/10 border border-zapPurple/30 focus:border-zapPurple outline-none" placeholder="Name" />}
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 rounded-xl bg-white/10 border border-zapPurple/30 focus:border-zapPurple outline-none" placeholder="Username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-xl bg-white/10 border border-zapPurple/30 focus:border-zapPurple outline-none" placeholder="Password" />
          <button onClick={submit} className="w-full py-3 rounded-xl bg-gradient-to-r from-zapPurple to-zapCoral font-semibold hover:opacity-95 transition">
            {tab === "login" ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
