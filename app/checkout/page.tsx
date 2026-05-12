"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  quantity?: number;
  cart_key?: string;
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [step, setStep] = useState(1);
  const [buyersOnline, setBuyersOnline] = useState(27);
  const [securePulse, setSecurePulse] = useState(true);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    async function carregarUsuario() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setEmail(data.user.email || "");
        setNome(
          (data.user.user_metadata?.nome as string) ||
            (data.user.user_metadata?.full_name as string) ||
            (data.user.user_metadata?.name as string) ||
            ""
        );
      }
    }

    carregarUsuario();

    const buyersInterval = setInterval(() => {
      setBuyersOnline(Math.floor(Math.random() * 35) + 18);
    }, 4500);

    const pulseInterval = setInterval(() => {
      setSecurePulse((prev) => !prev);
    }, 1200);

    return () => {
      clearInterval(buyersInterval);
      clearInterval(pulseInterval);
    };
  }, []);

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

  async function aplicarCupom() {
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

  async function criarPedido() {
    if (cart.length === 0) {
      alert("Carrinho vazio");
      return;
    }

    if (!nome || !email) {
      alert("Preencha nome e email");
      return;
    }

    if (!termos) {
      alert("Você precisa aceitar os termos");
      return;
    }

    setLoading(true);
    setStep(2);

    const orderCode =
      "SH-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error } = await supabase.from("orders").insert({
      order_code: orderCode,
      user_email: email,
      customer_name: nome,
      total: total,
      status: "pendente",
      payment_method: "pix",
      items: cart,
      coupon_code: appliedCoupon?.code || null,
      discount: discount,
    });

    if (error) {
      alert("Erro ao criar pedido: " + error.message);
      setLoading(false);
      setStep(1);
      return;
    }

    localStorage.setItem("orderId", orderCode);

    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        total: total.toFixed(2),
        order_code: orderCode,
      }),
    });

    setStep(3);

    setTimeout(() => {
      window.location.href = "/payment";
    }, 900);
  }

  return (
    <main className="min-h-screen text-white bg-black relative overflow-hidden p-6">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_38%)]"></div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px]"></div>

      {loading && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="neon-card rounded-3xl p-10 w-full max-w-md text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-600/20 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-6"></div>

              <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-3">
                CHECKOUT SEGURO
              </p>

              <h2 className="text-3xl font-black glitch-text mb-4">
                {step === 2 ? "Criando pedido..." : "Redirecionando para o Pix"}
              </h2>

              <p className="text-zinc-400">
                Estamos preparando sua compra e notificando o admin.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-8 text-sm">
                <div
                  className={`rounded-xl border p-3 ${
                    step >= 1
                      ? "border-green-500/40 bg-green-500/10 text-green-300"
                      : "border-white/10 bg-black/40 text-zinc-400"
                  }`}
                >
                  Dados
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    step >= 2
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                      : "border-white/10 bg-black/40 text-zinc-400"
                  }`}
                >
                  Pedido
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    step >= 3
                      ? "border-pink-500/40 bg-pink-500/10 text-pink-300"
                      : "border-white/10 bg-black/40 text-zinc-400"
                  }`}
                >
                  Pix
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <a
              href="/cart"
              className="inline-block text-purple-300 font-bold hover:underline mb-5"
            >
              ← Voltar para o carrinho
            </a>

            <p className="text-purple-300 font-black tracking-[0.35em] text-sm mb-3">
              SHOPP STAR
            </p>

            <h1 className="text-5xl md:text-6xl font-black glitch-text">
              Checkout Premium
            </h1>

            <p className="text-zinc-400 mt-4 max-w-2xl">
              Finalize sua compra com segurança. Após gerar o pedido, você será
              levado para a tela Pix.
            </p>
          </div>

          <div className="bg-black/50 border border-purple-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.18)]">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  securePulse ? "bg-green-400" : "bg-purple-400"
                } animate-pulse`}
              ></span>

              <div>
                <p className="font-black text-green-300">
                  Ambiente protegido
                </p>
                <p className="text-zinc-400 text-sm">
                  👀 {buyersOnline} pessoas comprando agora
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_430px] gap-8">
          <div className="space-y-6">
            <div className="neon-card rounded-3xl overflow-hidden relative">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full"></div>

              <h2 className="relative z-10 p-6 font-black text-2xl border-b border-white/10 flex items-center gap-3">
                💠 Formas de pagamento
              </h2>

              <div className="relative z-10 p-6">
                <div className="border border-purple-500/50 rounded-3xl p-5 flex items-center gap-5 bg-purple-950/20 shadow-[0_0_25px_rgba(168,85,247,0.16)]">
                  <div className="w-16 h-16 bg-black/70 border border-purple-500/40 rounded-2xl flex items-center justify-center text-3xl">
                    💠
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <p className="font-black text-xl">Pix</p>
                      <span className="bg-green-500/10 border border-green-500/40 text-green-300 px-3 py-1 rounded-full text-xs font-black">
                        Recomendado
                      </span>
                    </div>

                    <p className="text-zinc-400 text-sm mt-1">
                      Pagamento manual via Nubank com confirmação rápida.
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-purple-600 border border-white/30 flex items-center justify-center">
                    ✓
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-5">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl">🛡️</p>
                    <p className="text-sm font-bold">Seguro</p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl">⚡</p>
                    <p className="text-sm font-bold">Rápido</p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl">📲</p>
                    <p className="text-sm font-bold">Pix</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="neon-card rounded-3xl overflow-hidden relative">
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-600/10 blur-3xl rounded-full"></div>

              <h2 className="relative z-10 p-6 font-black text-2xl border-b border-white/10 flex items-center gap-3">
                👤 Informações de contato
              </h2>

              <div className="relative z-10 p-6">
                <label className="text-sm font-black text-zinc-400">
                  NOME COMPLETO
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  placeholder="Nome completo"
                />

                <label className="text-sm font-black text-zinc-400">
                  EMAIL
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Email"
                />

                <label className="flex gap-3 items-start text-zinc-300 bg-black/40 border border-white/10 rounded-2xl p-4 mt-3">
                  <input
                    type="checkbox"
                    checked={termos}
                    onChange={(e) => setTermos(e.target.checked)}
                    className="mt-1"
                  />

                  <span>
                    Eu aceito os termos e condições desta compra e confirmo que
                    meus dados estão corretos.
                  </span>
                </label>
              </div>
            </div>

            <div className="neon-card rounded-3xl p-6">
              <h2 className="text-2xl font-black mb-5">
                🚀 Como funciona após pagar?
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-5">
                  <p className="text-purple-300 font-black text-2xl">01</p>
                  <p className="text-zinc-300 mt-2">
                    Seu pedido é criado automaticamente.
                  </p>
                </div>

                <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-5">
                  <p className="text-purple-300 font-black text-2xl">02</p>
                  <p className="text-zinc-300 mt-2">
                    Você vai para a tela Pix e realiza o pagamento.
                  </p>
                </div>

                <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-5">
                  <p className="text-purple-300 font-black text-2xl">03</p>
                  <p className="text-zinc-300 mt-2">
                    O admin recebe notificação e libera sua entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="neon-card rounded-3xl p-6 h-fit sticky top-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-600/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-2xl">Resumo do pedido</h2>

                <span className="text-green-400 text-sm border border-green-500/30 px-3 py-1 rounded-full bg-green-500/10">
                  🔒 Seguro
                </span>
              </div>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                {cart.length === 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                    <p className="text-zinc-300">Carrinho vazio.</p>
                    <a
                      href="/"
                      className="inline-block mt-4 neon-button-strong px-5 py-3 rounded-xl font-bold"
                    >
                      Voltar para loja
                    </a>
                  </div>
                )}

                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-purple-700 overflow-hidden border border-purple-500/30">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            🎮
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-black text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          {item.category || "Digital"} • {Number(item.quantity || 1)} unidade(s)
                        </p>
                      </div>
                    </div>

                    <p className="font-black text-purple-300">
                      R$ {(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4">
                <p className="text-purple-300 font-black mb-3">
                  🎟 Cupom de desconto
                </p>

                <div className="flex gap-3">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Digite seu cupom"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
                  />

                  <button
                    onClick={aplicarCupom}
                    className="bg-purple-600 hover:bg-purple-700 px-5 rounded-xl font-black transition"
                  >
                    Aplicar
                  </button>
                </div>

                <p className="text-zinc-500 text-xs mt-3">
                  {appliedCoupon
                    ? `Cupom aplicado: ${appliedCoupon.code}`
                    : "Digite um cupom criado no admin"}
                </p>
              </div>

              <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Descontos</span>
                  <span className="text-green-400">
                    -R$ {discount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Taxas</span>
                  <span className="text-green-400">Grátis</span>
                </div>

                <div className="flex justify-between font-black text-xl border-t border-white/10 pt-4">
                  <span>Total</span>
                  <span className="text-purple-300">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                <p className="text-yellow-300 font-bold">
                  ⚡ Após clicar em pagar
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  Seu pedido será criado, você receberá a tela Pix e o admin
                  será notificado no Telegram.
                </p>
              </div>

              <button
                onClick={criarPedido}
                disabled={loading || cart.length === 0}
                className="w-full neon-button-strong py-5 rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:scale-[1.02] transition"
              >
                {loading ? "Criando pedido..." : `Pagar R$ ${total.toFixed(2)}`}
              </button>

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
          </aside>
        </div>
      </div>
    </main>
  );
}
