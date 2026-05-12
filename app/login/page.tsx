"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      window.location.href = "/";
    }
  }

  async function loginGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      alert("Erro Google: " + error.message);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.25),transparent_35%)]"></div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-700/30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/20 blur-3xl rounded-full animate-pulse"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-purple-300 font-black tracking-[0.3em] text-sm mb-3">
            SHOPP STAR
          </p>

          <h1 className="text-5xl font-black glitch-text">
            Entrar
          </h1>

          <p className="text-zinc-400 mt-3">
            Acesse sua conta e acompanhe pedidos, entregas e compras.
          </p>
        </div>

        <div className="neon-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-600/20 blur-3xl rounded-full"></div>

          <div className="relative z-10">
            <button
              onClick={loginGoogle}
              className="w-full mb-5 bg-white text-black py-4 rounded-xl font-black hover:scale-[1.03] transition flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-xl">🌐</span>
              Entrar com Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-zinc-500 text-sm">OU ENTRE COM EMAIL</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <label className="text-sm font-bold text-zinc-400">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mb-4"
            />

            <label className="text-sm font-bold text-zinc-400">
              SENHA
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
              className="input mb-5"
            />

            <button
              onClick={login}
              disabled={loading}
              className="w-full neon-button-strong py-4 rounded-xl font-black text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "⚡ Login"}
            </button>

            <p className="text-center text-zinc-400 mt-6">
              Não tem conta?{" "}
              <a
                href="/register"
                className="text-purple-300 font-bold hover:underline"
              >
                Criar cadastro
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-xl">🛡️</p>
            <p className="text-xs text-zinc-400">Seguro</p>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-xl">⚡</p>
            <p className="text-xs text-zinc-400">Rápido</p>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-xl">🎁</p>
            <p className="text-xs text-zinc-400">Entregas</p>
          </div>
        </div>
      </div>
    </main>
  );
}