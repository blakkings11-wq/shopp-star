"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const pixCode = "ec531ca0-d7a9-4665-8643-4b5cb1f02491";

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [viewers, setViewers] = useState(21);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const viewersInterval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 35) + 12);
    }, 4000);

    const checkingInterval = setInterval(() => {
      setChecking((prev) => !prev);
    }, 1400);

    return () => {
      clearInterval(timer);
      clearInterval(viewersInterval);
      clearInterval(checkingInterval);
    };
  }, []);

  function copyPix() {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2500);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden p-6 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.30),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_35%)]"></div>

      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px]"></div>

      {copied && (
        <div className="fixed top-6 right-6 z-[9999] bg-black/90 border border-green-500 rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
          <p className="text-green-300 font-black">
            ✅ Chave Pix copiada
          </p>
        </div>
      )}

      <div className="w-full max-w-7xl relative z-10">
        <div className="neon-card rounded-[2rem] overflow-hidden border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.18)] relative">
          <div className="absolute -top-28 -right-28 w-[420px] h-[420px] bg-purple-600/20 blur-3xl rounded-full"></div>

          <div className="absolute -bottom-28 -left-28 w-[420px] h-[420px] bg-pink-600/10 blur-3xl rounded-full"></div>

          <div className="grid lg:grid-cols-[1fr_420px]">
            <section className="p-8 md:p-12 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full text-purple-300 font-black tracking-[0.25em]">
                    ⚡ PIX INSTANTÂNEO
                  </span>

                  <h1 className="text-5xl md:text-6xl font-black glitch-text mt-6 leading-tight">
                    Finalize seu pagamento
                  </h1>

                  <p className="text-zinc-400 text-lg mt-4 max-w-2xl">
                    Após realizar o Pix, clique em{" "}
                    <span className="text-purple-300 font-bold">
                      “Ir para o pedido”
                    </span>{" "}
                    para acompanhar sua entrega.
                  </p>
                </div>

                <div className="bg-black/50 border border-purple-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.18)]">
                  <p className="text-zinc-400 text-sm font-bold">
                    👀 Comprando agora
                  </p>

                  <h2 className="text-4xl font-black text-purple-300 mt-2">
                    {viewers}
                  </h2>

                  <p className="text-green-400 text-sm font-bold mt-2">
                    pessoas online
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-[2rem] bg-purple-500 blur-3xl opacity-40"></div>

                    <div className="relative w-[290px] h-[290px] bg-black border border-purple-500/40 rounded-[2rem] p-5 shadow-[0_0_50px_rgba(168,85,247,0.28)] overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(168,85,247,0.15),transparent)]"></div>

                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

                      <div className="grid grid-cols-6 gap-[5px] h-full">
                        {Array.from({ length: 144 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              Math.random() > 0.5
                                ? "bg-white"
                                : "bg-black"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="absolute bottom-4 right-4 bg-black/80 border border-purple-500/30 px-3 py-1 rounded-full text-xs text-purple-300 font-black">
                        PIX
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-purple-500/40 rounded-3xl p-6 text-center w-full max-w-md mt-8 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                    <p className="text-zinc-400 text-sm mb-3 font-bold">
                      CHAVE PIX
                    </p>

                    <p className="font-black text-xl text-purple-300 break-all leading-relaxed">
                      {pixCode}
                    </p>

                    <button
                      onClick={copyPix}
                      className="mt-6 w-full neon-button-strong py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition"
                    >
                      {copied ? "✅ COPIADO" : "📋 COPIAR CHAVE PIX"}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-6">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-2xl">🛡️</p>
                      <p className="text-[10px] text-zinc-400 mt-2">
                        Seguro
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-2xl">⚡</p>
                      <p className="text-[10px] text-zinc-400 mt-2">
                        Instantâneo
                      </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-2xl">💬</p>
                      <p className="text-[10px] text-zinc-400 mt-2">
                        Suporte
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-black/40 border border-purple-500/20 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-zinc-400 text-sm font-bold">
                          Tempo restante
                        </p>

                        <h2 className="text-5xl font-black text-pink-300 mt-2">
                          {minutes}:{seconds.toString().padStart(2, "0")}
                        </h2>
                      </div>

                      <div className="w-20 h-20 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                    </div>

                    <p className="text-zinc-500 text-sm mt-4">
                      O pedido permanecerá aguardando pagamento até o tempo
                      acabar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:border-purple-500/40 transition">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl">
                          1
                        </div>

                        <div>
                          <p className="font-black text-xl">
                            Abra seu banco
                          </p>

                          <p className="text-zinc-400 mt-2">
                            Entre no aplicativo do seu banco e escolha a opção
                            Pix.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:border-purple-500/40 transition">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-2xl">
                          2
                        </div>

                        <div>
                          <p className="font-black text-xl">
                            Copie a chave Pix
                          </p>

                          <p className="text-zinc-400 mt-2">
                            Use o botão acima para copiar rapidamente sua chave.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-3xl p-5 hover:border-purple-500/40 transition">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-600/20 border border-green-500/30 flex items-center justify-center text-2xl">
                          3
                        </div>

                        <div>
                          <p className="font-black text-xl">
                            Aguarde confirmação
                          </p>

                          <p className="text-zinc-400 mt-2">
                            Após pagar, clique no botão abaixo e acompanhe o
                            pedido.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-5 mt-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          checking ? "bg-green-400" : "bg-purple-400"
                        } animate-pulse`}
                      ></span>

                      <div>
                        <p className="text-green-300 font-black">
                          Sistema monitorando pagamento
                        </p>

                        <p className="text-zinc-400 text-sm mt-1">
                          O admin será notificado após a confirmação.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/order"
                    className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-violet-500 py-5 rounded-3xl font-black text-xl text-white hover:scale-[1.02] transition shadow-[0_0_40px_rgba(168,85,247,0.35)]"
                  >
                    🚀 IR PARA O PEDIDO
                  </Link>

                  <div className="text-center mt-5">
                    <p className="text-zinc-500 text-sm">
                      Problemas com pagamento? Entre em contato com o suporte.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <aside className="border-l border-purple-500/20 bg-black/40 backdrop-blur-2xl p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <p className="text-purple-300 font-black tracking-[0.3em] text-xs mb-3">
                  STATUS DO PAGAMENTO
                </p>

                <h2 className="text-4xl font-black glitch-text mb-6">
                  Aguardando Pix
                </h2>

                <div className="space-y-5">
                  <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-5">
                    <p className="text-yellow-300 font-black">
                      ⏳ Pedido criado
                    </p>

                    <p className="text-zinc-400 text-sm mt-2">
                      Seu pedido já foi registrado no sistema.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-5">
                    <p className="text-purple-300 font-black">
                      💠 Pix aguardando pagamento
                    </p>

                    <p className="text-zinc-400 text-sm mt-2">
                      Realize o pagamento para liberar sua entrega.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-green-500/30 rounded-2xl p-5">
                    <p className="text-green-300 font-black">
                      🔔 Admin será notificado
                    </p>

                    <p className="text-zinc-400 text-sm mt-2">
                      O sistema enviará o pedido automaticamente.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-black/50 border border-white/10 rounded-3xl p-6">
                  <p className="text-zinc-400 text-sm font-bold mb-2">
                    Segurança
                  </p>

                  <h3 className="text-3xl font-black text-purple-300">
                    Compra protegida
                  </h3>

                  <p className="text-zinc-500 text-sm mt-4">
                    Ambiente seguro com monitoramento em tempo real.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
