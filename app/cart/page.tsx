"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  service?: string | null;
  quantity?: number;
  cart_key?: string;
};

type Message = {
  id: string;
  product_id: string;
  user_email: string;
  message: string;
  created_at: string;
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
};

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [text, setText] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [viewers, setViewers] = useState(18);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || "");
    });

    loadMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    const viewersInterval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 40) + 12);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(viewersInterval);
    };
  }, []);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) || []);
  }

  async function sendMessage(productId: string) {
    if (!text.trim()) return;

    const { error } = await supabase.from("messages").insert({
      product_id: productId,
      user_email: userEmail || "visitante",
      message: text,
    });

    if (error) {
      alert("Erro ao enviar: " + error.message);
      return;
    }

    setText("");
    loadMessages();
  }

  function updateQuantity(index: number, quantity: number) {
    const newCart = cart.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(1, quantity) } : item
    );

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function removeItem(index: number) {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  async function applyCoupon() {
    if (!coupon.trim()) {
      alert("Digite um cupom");
      return;
    }

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon.trim().toUpperCase())
      .eq("active", true)
      .single();

    if (error || !data) {
      alert("Cupom inválido ou inativo.");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(data as Coupon);
    alert("Cupom aplicado com sucesso!");
  }

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percent"
      ? subtotal * (Number(appliedCoupon.discount_value) / 100)
      : Math.min(Number(appliedCoupon.discount_value), subtotal)
    : 0;
  const total = subtotal - discount;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.30),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.20),transparent_35%)] pointer-events-none"></div>

      <section className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="flex flex-wrap justify-between items-center gap-5 mb-10">
          <div>
            <p className="text-purple-300 font-black tracking-[0.3em] text-sm mb-3">
              SHOPP STAR
            </p>

            <h1 className="text-5xl md:text-6xl font-black glitch-text">
              Seu Carrinho
            </h1>

            <p className="text-zinc-400 mt-4 max-w-xl">
              Revise seus produtos antes de finalizar a compra.
            </p>
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.25)]">
            <p className="text-zinc-400 font-bold mb-2">
              👀 {viewers} pessoas finalizando compra agora
            </p>

            <h2 className="text-5xl font-black text-purple-300">
              R$ {total.toFixed(2)}
            </h2>

            <p className="text-green-400 font-bold mt-2">
              {cart.length} itens no carrinho
            </p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
            <div className="text-7xl mb-6">🛒</div>

            <h2 className="text-3xl font-black mb-4">
              Seu carrinho está vazio
            </h2>

            <p className="text-zinc-400 mb-8">
              Adicione produtos para continuar.
            </p>

            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl neon-button-strong font-black text-lg"
            >
              Voltar para loja
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-6">
              {cart.map((item, index) => {
                const productMessages = messages.filter(
                  (msg) => msg.product_id === item.id
                );

                return (
                  <div
                    key={index}
                    className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:border-purple-500/40 transition overflow-hidden relative"
                  >
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full"></div>

                    <div className="grid lg:grid-cols-[170px_1fr_180px_90px] gap-6 items-center relative z-10">
                      <div className="w-full h-40 rounded-3xl bg-purple-900/40 overflow-hidden border border-purple-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            className="w-full h-full object-cover hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <span className="text-6xl">🎮</span>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className="bg-purple-600/20 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-black">
                            MAIS VENDIDO
                          </span>

                          <span className="bg-green-500/10 border border-green-500/40 text-green-300 px-3 py-1 rounded-full text-xs font-black">
                            ENTREGA RÁPIDA
                          </span>
                        </div>

                        <h2 className="text-3xl font-black">
                          {item.name}
                        </h2>

                        <p className="text-purple-400 font-black uppercase tracking-widest mt-2">
                          {item.category || item.service || "Acesso / Conta"}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-5">
                          <div className="inline-flex items-center gap-3 bg-white/10 px-3 py-2 rounded-full">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  index,
                                  Number(item.quantity || 1) - 1
                                )
                              }
                              className="w-7 h-7 rounded-full bg-black/40 border border-white/10 font-black hover:border-purple-500/40 transition"
                            >
                              -
                            </button>

                            <span className="font-black">
                              {Number(item.quantity || 1)} unidade(s)
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  index,
                                  Number(item.quantity || 1) + 1
                                )
                              }
                              className="w-7 h-7 rounded-full bg-black/40 border border-white/10 font-black hover:border-purple-500/40 transition"
                            >
                              +
                            </button>
                          </div>

                          <span className="inline-block bg-black/40 border border-purple-500/30 px-4 py-2 rounded-full text-purple-300">
                            ⚡ Liberação automática
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-zinc-500 line-through text-sm">
                          R$ {(Number(item.price) * Number(item.quantity || 1) * 1.2).toFixed(2)}
                        </p>

                        <p className="text-4xl font-black text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
                          R$ {(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl text-purple-300 hover:text-red-400 hover:border-red-500/40 transition"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="mt-6 bg-black/30 border border-white/10 rounded-3xl p-6 relative z-10">
                      <p className="text-purple-400 font-black tracking-widest mb-4">
                        💬 CHAT DE ENTREGA DO PRODUTO
                      </p>

                      <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-2">
                        {productMessages.length === 0 ? (
                          <div className="border border-purple-500/40 rounded-2xl p-5 bg-purple-950/20 text-purple-300">
                            <p className="font-bold mb-2">Shopp Star:</p>
                            <p>
                              Envie aqui seu Steam ID, email ou dados necessários
                              para entrega do produto.
                            </p>
                          </div>
                        ) : (
                          productMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className="border border-purple-500/30 rounded-2xl p-4 bg-purple-950/20"
                            >
                              <p className="text-purple-300 font-bold">
                                {msg.user_email}
                              </p>
                              <p className="text-zinc-300">{msg.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Digite sua mensagem para entrega..."
                        className="input h-24 mb-4"
                      />

                      <button
                        onClick={() => sendMessage(item.id)}
                        className="w-full neon-button-strong py-4 rounded-2xl font-black"
                      >
                        Enviar mensagem
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky top-6 h-fit bg-black/40 border border-purple-500/20 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_45px_rgba(168,85,247,0.18)]">
              <h2 className="text-3xl font-black mb-6">
                Resumo do pedido
              </h2>

              <div className="space-y-4 border-b border-white/10 pb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-bold">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Desconto</span>
                  <span className="font-bold text-green-400">
                    -R$ {discount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Entrega</span>
                  <span className="font-bold text-green-400">
                    Grátis
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6">
                <span className="text-2xl font-black">Total</span>

                <span className="text-4xl font-black text-purple-300">
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-6">
                <p className="font-black text-purple-300 mb-3">
                  🎟 CUPOM DE DESCONTO
                </p>

                <div className="flex gap-3">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Digite o cupom"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
                  />

                  <button
                    onClick={applyCoupon}
                    className="bg-purple-600 px-5 rounded-xl font-black"
                  >
                    Aplicar
                  </button>
                </div>

                <p className="text-xs text-zinc-500 mt-3">
                  {appliedCoupon
                    ? `Cupom aplicado: ${appliedCoupon.code}`
                    : "Digite um cupom criado no admin"}
                </p>
              </div>

              <button className="w-full neon-button-strong rounded-2xl py-5 font-black text-xl mb-4 hover:scale-[1.02] transition">
                🔒 FINALIZAR COMPRA
              </button>

              <a
                href="/"
                className="w-full flex items-center justify-center border border-purple-500 text-purple-300 rounded-2xl py-4 font-bold text-lg"
              >
                ← Continuar comprando
              </a>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl">🛡️</p>
                  <p className="text-[10px] text-zinc-400">Seguro</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl">⚡</p>
                  <p className="text-[10px] text-zinc-400">Rápido</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl">💬</p>
                  <p className="text-[10px] text-zinc-400">Suporte</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
