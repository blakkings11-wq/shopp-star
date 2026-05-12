"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function cadastrar() {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: nome,
        },
      },
    });

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Conta criada com sucesso!");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-purple-500/20 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-purple-400 mb-6 text-center">
          Criar Conta
        </h1>

        <input
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/40"
        />

        <input
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/40"
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-black/40"
        />

        <button
          onClick={cadastrar}
          className="w-full bg-purple-600 py-3 rounded-xl font-bold"
        >
          Criar Conta
        </button>
      </div>
    </main>
  );
}