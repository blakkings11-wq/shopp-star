"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  user_email: string;
  total: number;
  status: string;
  items: any[];
  delivery_content: string | null;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryMap, setDeliveryMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erro ao carregar pedidos: " + error.message);
      return;
    }

    setOrders((data as Order[]) || []);
  }

  function handleChange(id: string, value: string) {
    setDeliveryMap((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  async function marcarPago(id: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "pago" })
      .eq("id", id);

    if (error) {
      alert("Erro ao marcar como pago: " + error.message);
      return;
    }

    loadOrders();
  }

  async function entregarPedido(id: string) {
    const content = deliveryMap[id];

    if (!content) {
      alert("Digite o conteúdo da entrega!");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "entregue",
        delivery_content: content,
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao entregar pedido: " + error.message);
      return;
    }

    alert("Pedido entregue!");
    loadOrders();
  }

  return (
    <main className="min-h-screen bg-black/70 backdrop-blur-sm text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="neon-card rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-purple-600/20 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-purple-300 font-bold mb-2">
                CENTRAL DE PEDIDOS
              </p>

              <h1 className="text-5xl font-black glitch-text">
                Entregas Manuais
              </h1>

              <p className="text-zinc-400 mt-2">
                Confirme pagamentos e entregue produtos manualmente.
              </p>
            </div>

            <a
              href="/admin"
              className="neon-button-strong px-6 py-3 rounded-xl font-bold"
            >
              ← Dashboard
            </a>
          </div>
        </header>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="neon-card rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                <div>
                  <p className="text-zinc-500 text-xs">PEDIDO</p>
                  <h2 className="text-2xl font-black">{order.order_code}</h2>

                  <p className="text-zinc-400 mt-2">{order.customer_name}</p>
                  <p className="text-zinc-400">{order.user_email}</p>

                  <p className="text-zinc-500 text-sm mt-2">
                    {new Date(order.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="text-left lg:text-right">
                  <p className="text-zinc-500 text-xs">TOTAL</p>

                  <p className="text-3xl font-black text-purple-300">
                    R$ {Number(order.total).toFixed(2)}
                  </p>

                  <span
                    className={`inline-block mt-3 px-4 py-2 rounded-xl border font-bold ${
                      order.status === "entregue"
                        ? "text-purple-300 border-purple-500/40 bg-purple-500/10"
                        : order.status === "pago"
                        ? "text-green-400 border-green-500/40 bg-green-500/10"
                        : "text-yellow-300 border-yellow-500/40 bg-yellow-500/10"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5 mb-5">
                <p className="font-bold mb-3">Itens do pedido</p>

                <div className="grid md:grid-cols-3 gap-3">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 bg-purple-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🎮"
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-sm line-clamp-1">
                          {item.name}
                        </p>

                        <p className="text-zinc-400 text-xs">
                          R$ {Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Cole aqui a entrega manual: KEY, LOGIN/SENHA, LINK..."
                className="input h-28"
                value={deliveryMap[order.id] || ""}
                onChange={(e) => handleChange(order.id, e.target.value)}
              />

              {order.delivery_content && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-5">
                  <p className="text-green-400 font-bold mb-2">
                    🎁 Conteúdo já entregue:
                  </p>

                  <pre className="whitespace-pre-wrap break-words text-zinc-200">
                    {order.delivery_content}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => marcarPago(order.id)}
                  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold transition"
                >
                  💰 Marcar como pago
                </button>

                <button
                  onClick={() => entregarPedido(order.id)}
                  className="neon-button-strong px-5 py-3 rounded-xl font-bold"
                >
                  📦 Entregar pedido
                </button>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="neon-card rounded-2xl p-8 text-center">
              Nenhum pedido encontrado.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}