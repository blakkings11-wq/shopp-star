"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  user_email: string;
  total: number;
  status: string;
  items: any[];
};

type Delivery = {
  id: string;
  order_code: string;
  product_id: string;
  content: string;
};

export default function OrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadOrder() {
      const orderCode = localStorage.getItem("orderId");
      if (!orderCode) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_code", orderCode)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setOrder(data as Order);

      if (data.status === "pendente") {
        iniciarAprovacao(data as Order);
      } else {
        loadDeliveries(orderCode);
      }
    }

    loadOrder();
  }, []);

  async function loadDeliveries(orderCode: string) {
    const { data } = await supabase
      .from("deliveries")
      .select("*")
      .eq("order_code", orderCode);

    setDeliveries((data as Delivery[]) || []);
  }

  async function createDeliveries(orderData: Order) {
    for (const item of orderData.items) {
      const { data: product } = await supabase
        .from("products")
        .select("delivery_content")
        .eq("id", item.id)
        .single();

      const content =
        product?.delivery_content ||
        "Entrega pendente. Aguarde contato da Shopp Star.";

      await supabase.from("deliveries").insert({
        order_code: orderData.order_code,
        product_id: item.id,
        content,
      });
    }

    loadDeliveries(orderData.order_code);
  }

  function iniciarAprovacao(orderData: Order) {
    let current = 0;

    const interval = setInterval(async () => {
      current += 15;
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);

        const { error } = await supabase
          .from("orders")
          .update({ status: "pago" })
          .eq("order_code", orderData.order_code);

        if (error) {
          alert("Erro ao atualizar pedido: " + error.message);
          return;
        }

        const updatedOrder = { ...orderData, status: "pago" };
        setOrder(updatedOrder);

        await createDeliveries(updatedOrder);

        localStorage.removeItem("cart");
      }
    }, 800);
  }

  function timelineStatus(index: number) {
    if (!order) return false;

    if (order.status === "pago") return true;
    if (order.status === "pendente") return index === 0;

    return index === 0;
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(168,85,247,0.28),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.18),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.14),transparent_40%)]"></div>

        <div className="relative z-10 neon-card rounded-3xl p-10 text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-purple-300 text-2xl font-black">
            Carregando pedido...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-black overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(168,85,247,0.28),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(236,72,153,0.18),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.14),transparent_40%)]"></div>

      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:55px_55px]"></div>

      <section className="relative z-10 max-w-7xl mx-auto p-6 md:p-8">
        <div className="rounded-[2rem] border border-purple-500/20 bg-black/50 backdrop-blur-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(168,85,247,0.16)] relative overflow-hidden mb-8">
          <div className="absolute -top-24 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-3xl"></div>
          <div className="absolute -bottom-24 left-0 w-[350px] h-[350px] rounded-full bg-pink-600/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
            <div>
              <span className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm font-black">
                🟢 Sistema monitorando pedido em tempo real
              </span>

              <h1 className="text-5xl md:text-6xl font-black mt-6 leading-none glitch-text">
                Central
                <br />
                do Pedido
              </h1>

              <p className="text-zinc-400 max-w-2xl mt-5 text-lg">
                Acompanhe entrega, pagamento e acesso premium da sua compra.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 min-w-[320px]">
              <div className="bg-black/40 border border-white/10 rounded-3xl p-5">
                <p className="text-zinc-500 text-sm">Status</p>
                <h3 className="text-3xl font-black text-green-400 mt-2">
                  LIVE ⚡
                </h3>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-3xl p-5">
                <p className="text-zinc-500 text-sm">Segurança</p>
                <h3 className="text-3xl font-black text-purple-300 mt-2">
                  SSL 🔒
                </h3>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-3xl p-5">
                <p className="text-zinc-500 text-sm">Entrega</p>
                <h3 className="text-3xl font-black text-pink-300 mt-2">
                  Premium
                </h3>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-3xl p-5">
                <p className="text-zinc-500 text-sm">Atualização</p>
                <h3 className="text-3xl font-black text-cyan-300 mt-2">
                  AUTO
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.2fr_420px] gap-8">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-purple-500/20 bg-black/50 backdrop-blur-2xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.14)] text-center relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <div className="text-[90px] mb-4 animate-pulse">
                  {order.status === "pago" ? "✅" : "⚡"}
                </div>

                <h1 className="text-4xl font-black glitch-text mb-2">
                  {order.status === "pago"
                    ? "Pagamento aprovado"
                    : "Processando pagamento"}
                </h1>

                <p className="text-zinc-400 mb-6">
                  Status:{" "}
                  <span className="text-purple-400 font-bold">
                    {order.status}
                  </span>
                </p>

                {order.status === "pendente" && (
                  <div className="mb-8">
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-purple-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-violet-500 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.8)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="text-purple-300 mt-3 font-bold">
                      Confirmando pagamento...
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-4 gap-4 mt-8">
                  {[
                    {
                      icon: "📦",
                      title: "Pedido criado",
                      desc: "Seu pedido entrou no sistema.",
                    },
                    {
                      icon: "💳",
                      title: "Pagamento",
                      desc: "Confirmação automática ativa.",
                    },
                    {
                      icon: "⚡",
                      title: "Entrega",
                      desc: "Preparando acesso digital.",
                    },
                    {
                      icon: "🎉",
                      title: "Finalizado",
                      desc: "Produto liberado na tela.",
                    },
                  ].map((step, index) => {
                    const active = timelineStatus(index);

                    return (
                      <div
                        key={step.title}
                        className={`rounded-3xl border p-5 text-left ${
                          active
                            ? "border-purple-500/40 bg-purple-500/10"
                            : "border-white/10 bg-black/40"
                        }`}
                      >
                        <p className="text-4xl mb-4">{step.icon}</p>
                        <h3 className="font-black text-lg">{step.title}</h3>
                        <p className="text-zinc-400 text-sm mt-2">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="neon-card p-5 rounded-2xl text-left">
                <p className="text-zinc-500 text-xs">CLIENTE</p>
                <p className="font-bold mt-2">{order.customer_name}</p>
              </div>

              <div className="neon-card p-5 rounded-2xl text-left">
                <p className="text-zinc-500 text-xs">EMAIL</p>
                <p className="font-bold mt-2 break-all">{order.user_email}</p>
              </div>

              <div className="neon-card p-5 rounded-2xl text-left">
                <p className="text-zinc-500 text-xs">PEDIDO</p>
                <p className="font-bold mt-2 text-purple-300">
                  {order.order_code}
                </p>
              </div>
            </div>

            <div className="neon-card rounded-3xl p-6 text-left">
              <div className="flex justify-between mb-6">
                <h2 className="font-black text-2xl">Itens do pedido</h2>
                <p className="font-black text-2xl text-green-400">
                  R$ {Number(order.total).toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="w-16 h-16 bg-purple-700 rounded-xl overflow-hidden flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          🎮
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-zinc-400 text-sm">
                        {Number(item.quantity || 1)} unidade(s)
                      </p>
                    </div>

                    <p className="text-purple-300 font-black">
                      R${" "}
                      {(
                        Number(item.price) * Number(item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {order.status === "pago" && (
              <div className="mt-8 neon-card rounded-3xl p-6 text-left border border-green-500/30">
                <h2 className="text-2xl font-black text-green-400 mb-4">
                  🎁 Seus Produtos
                </h2>

                {deliveries.length === 0 ? (
                  <p className="text-zinc-400">Gerando entrega...</p>
                ) : (
                  <div className="space-y-4">
                    {deliveries.map((d) => (
                      <div
                        key={d.id}
                        className="bg-black/40 border border-green-500/30 p-4 rounded-2xl"
                      >
                        <p className="text-zinc-400 mb-2">
                          Conteúdo entregue:
                        </p>

                        <div className="flex gap-2">
                          <input
                            value={d.content}
                            readOnly
                            className="input flex-1 mb-0"
                          />

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(d.content);
                              alert("Copiado!");
                            }}
                            className="neon-button-strong px-4 rounded-xl"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <a
              href="/"
              className="inline-block neon-button-strong px-8 py-4 text-lg rounded-2xl"
            >
              Voltar para loja
            </a>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-purple-500/20 bg-black/50 backdrop-blur-2xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.12)] sticky top-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-purple-300 text-sm tracking-[0.3em] font-black">
                    RESUMO
                  </p>

                  <h2 className="text-3xl font-black mt-2">
                    Status do pedido
                  </h2>
                </div>

                <div className="text-5xl">📦</div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Pedido</p>

                  <h3 className="font-black text-2xl mt-2 text-purple-300">
                    #{order.order_code}
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Cliente</p>

                  <h3 className="font-black text-xl mt-2">
                    {order.customer_name}
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Total</p>

                  <h3 className="font-black text-3xl mt-2 text-green-400">
                    R$ {Number(order.total).toFixed(2)}
                  </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Status</p>

                  <h3 className="font-black text-2xl mt-2 text-pink-300">
                    {order.status}
                  </h3>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <a
                  href="/orders"
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-black flex items-center justify-center hover:scale-[1.02] transition"
                >
                  📦 Ver todos pedidos
                </a>

                <a
                  href="/"
                  className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 font-black flex items-center justify-center hover:bg-white/10 transition"
                >
                  🛒 Continuar comprando
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
