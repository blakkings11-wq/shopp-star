"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string;
  order_code: string;
  total: number;
  status: string;
  payment_method: string | null;
  items: any[];
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(18);

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_email", user.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setOrders((data as Order[]) || []);
      setLoading(false);
    }

    loadOrders();

    const onlineInterval = setInterval(() => {
      setOnline(Math.floor(Math.random() * 30) + 12);
    }, 4000);

    return () => clearInterval(onlineInterval);
  }, []);

  function statusStyle(status: string) {
    if (status === "pago")
      return "text-green-400 border-green-500/40 bg-green-500/10";

    if (status === "entregue")
      return "text-purple-300 border-purple-500/40 bg-purple-500/10";

    if (status === "pendente")
      return "text-yellow-300 border-yellow-500/40 bg-yellow-500/10";

    return "text-zinc-300 border-white/10 bg-white/5";
  }

  function timeline(status: string) {
    return {
      created: true,
      paid: status === "pago" || status === "entregue",
      delivered: status === "entregue",
    };
  }

  if (loading) {
    return (
      <main className="min-h-screen text-white bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.35),transparent_35%)]"></div>

        <div className="neon-card rounded-3xl p-10 text-center relative z-10">
          <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

          <p className="text-purple-300 text-2xl font-black animate-pulse">
            Carregando seus pedidos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.30),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_35%)]"></div>

      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="neon-card rounded-[2rem] p-10 mb-8 relative overflow-hidden border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.18)]">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full"></div>

          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-600/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-8 items-start xl:items-center">
            <div>
              <p className="text-purple-300 font-black tracking-[0.35em] text-sm mb-3">
                CENTRAL PREMIUM
              </p>

              <h1 className="text-6xl font-black glitch-text leading-tight">
                Meus Pedidos
              </h1>

              <p className="text-zinc-400 mt-4 text-lg break-all">
                {email}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-black/50 border border-purple-500/30 rounded-3xl px-6 py-5 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.18)]">
                <p className="text-zinc-400 text-sm font-bold">
                  👀 Usuários online
                </p>

                <h2 className="text-4xl font-black text-purple-300 mt-2">
                  {online}
                </h2>
              </div>

              <a
                href="/account"
                className="neon-button-strong px-8 py-5 rounded-2xl font-black text-lg"
              >
                ← Minha Conta
              </a>
            </div>
          </div>
        </header>

        {orders.length === 0 && (
          <div className="neon-card rounded-[2rem] p-14 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <p className="text-8xl mb-6">📦</p>

              <h2 className="text-4xl font-black mb-4">
                Nenhum pedido encontrado
              </h2>

              <p className="text-zinc-400 mb-8 text-lg">
                Seus pedidos aparecerão aqui depois da primeira compra.
              </p>

              <a
                href="/"
                className="inline-flex items-center justify-center neon-button-strong px-8 py-5 rounded-2xl font-black text-xl"
              >
                Ver produtos
              </a>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {orders.map((order) => {
            const tl = timeline(order.status);

            return (
              <div
                key={order.id}
                className="neon-card rounded-[2rem] p-8 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.12)] relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div>
                      <p className="text-zinc-500 text-xs tracking-[0.25em] font-black">
                        PEDIDO
                      </p>

                      <h2 className="text-4xl font-black mt-2">
                        {order.order_code}
                      </h2>

                      <p className="text-zinc-400 text-sm mt-3">
                        {new Date(order.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 min-w-[150px]">
                        <p className="text-zinc-500 text-xs font-bold">
                          TOTAL
                        </p>

                        <p className="text-3xl font-black text-purple-300 mt-2">
                          R$ {Number(order.total).toFixed(2)}
                        </p>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 min-w-[150px]">
                        <p className="text-zinc-500 text-xs font-bold mb-2">
                          STATUS
                        </p>

                        <span
                          className={`inline-block border px-4 py-2 rounded-xl font-black ${statusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 min-w-[150px]">
                        <p className="text-zinc-500 text-xs font-bold">
                          PAGAMENTO
                        </p>

                        <p className="text-green-400 font-black mt-2">
                          {order.payment_method || "pix"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          localStorage.setItem(
                            "orderId",
                            order.order_code
                          );
                          window.location.href = "/order";
                        }}
                        className="neon-button-strong rounded-2xl font-black px-6 py-4 min-w-[180px]"
                      >
                        Ver detalhes →
                      </button>
                    </div>
                  </div>

                  <div className="mt-10">
                    <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-5">
                      TIMELINE DO PEDIDO
                    </p>

                    <div className="grid md:grid-cols-3 gap-5">
                      <div
                        className={`rounded-3xl border p-6 ${
                          tl.created
                            ? "border-yellow-500/40 bg-yellow-500/10"
                            : "border-white/10 bg-black/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-5xl">📦</p>

                          {tl.created && (
                            <span className="text-yellow-300 text-sm font-black">
                              ✓
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black mt-5">
                          Pedido criado
                        </h3>

                        <p className="text-zinc-400 mt-3">
                          Seu pedido foi registrado com sucesso.
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border p-6 ${
                          tl.paid
                            ? "border-green-500/40 bg-green-500/10"
                            : "border-white/10 bg-black/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-5xl">💠</p>

                          {tl.paid && (
                            <span className="text-green-300 text-sm font-black">
                              ✓
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black mt-5">
                          Pagamento aprovado
                        </h3>

                        <p className="text-zinc-400 mt-3">
                          O pagamento foi confirmado pelo sistema.
                        </p>
                      </div>

                      <div
                        className={`rounded-3xl border p-6 ${
                          tl.delivered
                            ? "border-purple-500/40 bg-purple-500/10"
                            : "border-white/10 bg-black/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-5xl">🚀</p>

                          {tl.delivered && (
                            <span className="text-purple-300 text-sm font-black">
                              ✓
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-black mt-5">
                          Entrega finalizada
                        </h3>

                        <p className="text-zinc-400 mt-3">
                          Seu produto foi entregue com sucesso.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-white/10 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-2">
                          ITENS
                        </p>

                        <h3 className="text-3xl font-black">
                          Produtos do pedido
                        </h3>
                      </div>

                      <span className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm font-black">
                        ⚡ Entrega rápida
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="bg-black/40 border border-white/10 rounded-3xl p-4 flex items-center gap-4 hover:border-purple-500/40 transition"
                        >
                          <div className="w-20 h-20 bg-purple-700/30 rounded-2xl overflow-hidden flex items-center justify-center border border-purple-500/30">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-4xl">🎮</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-black text-lg line-clamp-1">
                              {item.name}
                            </p>

                            <p className="text-zinc-400 text-sm mt-1">
                              Produto digital premium
                            </p>

                            <p className="text-purple-300 font-black text-xl mt-3">
                              R$ {Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 grid md:grid-cols-3 gap-4">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                      <p className="text-zinc-500 text-sm font-bold">
                        Segurança
                      </p>

                      <h3 className="text-2xl font-black text-green-400 mt-2">
                        🛡️ Protegido
                      </h3>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                      <p className="text-zinc-500 text-sm font-bold">
                        Entrega
                      </p>

                      <h3 className="text-2xl font-black text-purple-300 mt-2">
                        ⚡ Rápida
                      </h3>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                      <p className="text-zinc-500 text-sm font-bold">
                        Suporte
                      </p>

                      <h3 className="text-2xl font-black text-pink-300 mt-2">
                        💬 Online
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
