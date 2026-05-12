"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  category: string | null;
  service: string | null;
  stock: number | null;
};

type ProductOption = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  old_price: number | null;
};

const premiumReviews = [
  {
    name: "Lucas",
    text: "Comprei e chegou certinho. Entrega rápida e sem enrolação.",
    tag: "Compra verificada",
  },
  {
    name: "Rafael",
    text: "Atendimento rápido e produto funcionando. Loja muito confiável.",
    tag: "Cliente satisfeito",
  },
  {
    name: "Matheus",
    text: "Loja bonita, preço bom e compra bem simples. Recomendo demais.",
    tag: "Entrega aprovada",
  },
];

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(600);
  const [viewers, setViewers] = useState(18);
  const [toast, setToast] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setProduct(data as Product);
      setLoading(false);
    }

    async function loadProductOptions() {
      const { data, error } = await supabase
        .from("product_options")
        .select("*")
        .eq("product_id", id)
        .order("price", { ascending: true });

      if (error) {
        console.log(error);
        return;
      }

      setProductOptions((data as ProductOption[]) || []);
    }

    if (id) {
      loadProduct();
      loadProductOptions();
    }

    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const viewersInterval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 35) + 8);
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(viewersInterval);
    };
  }, [id]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  function getCartItem() {
    if (!product) return null;

    const baseItem = selectedOption
      ? {
          ...product,
          name: `${product.name} - ${selectedOption.name}`,
          price: selectedOption.price,
          old_price: selectedOption.old_price,
          selected_option: selectedOption.name,
          selected_option_id: selectedOption.id,
        }
      : product;

    return {
      ...baseItem,
      quantity,
      cart_key: selectedOption ? `${product.id}-${selectedOption.id}` : product.id,
    };
  }

  function mergeCartItem(existingCart: any[], item: any) {
    const itemKey = item.cart_key || item.id;
    const foundIndex = existingCart.findIndex(
      (cartItem) => (cartItem.cart_key || cartItem.id) === itemKey
    );

    if (foundIndex >= 0) {
      return existingCart.map((cartItem, index) => {
        if (index !== foundIndex) return cartItem;

        return {
          ...cartItem,
          quantity: Number(cartItem.quantity || 1) + Number(item.quantity || 1),
        };
      });
    }

    return [...existingCart, item];
  }

  function addToCart() {
    if (!product) return;

    const item = getCartItem();
    if (!item) return;

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const updated = mergeCartItem(existing, item);

    localStorage.setItem("cart", JSON.stringify(updated));
    showToast("Produto adicionado ao carrinho!");
  }

  function buyNow() {
    if (!product) return;

    const item = getCartItem();
    if (!item) return;

    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const updated = mergeCartItem(existing, item);

    localStorage.setItem("cart", JSON.stringify(updated));
    window.location.href = "/checkout";
  }

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.35),transparent_35%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.25),transparent_35%)]"></div>

        <div className="neon-card rounded-3xl p-10 text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
          <p className="text-purple-300 font-black text-2xl animate-pulse">
            Carregando produto premium...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black/70 backdrop-blur-sm text-white flex items-center justify-center">
        <div className="neon-card rounded-2xl p-8 text-center">
          <p className="text-red-400 font-bold text-xl">
            Produto não encontrado.
          </p>

          <a
            href="/"
            className="inline-block mt-5 neon-button-strong px-6 py-3 rounded-xl"
          >
            Voltar para loja
          </a>
        </div>
      </main>
    );
  }

  const displayPrice = selectedOption ? selectedOption.price : product.price;
  const displayOldPrice = selectedOption
    ? selectedOption.old_price
    : product.old_price;

  const discount =
    displayOldPrice && Number(displayOldPrice) > Number(displayPrice)
      ? Math.round(
          ((Number(displayOldPrice) - Number(displayPrice)) /
            Number(displayOldPrice)) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen text-white bg-black relative overflow-hidden p-6">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(168,85,247,0.28),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.18),transparent_35%)]"></div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"></div>

      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-black/90 border border-purple-500 rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(168,85,247,0.8)]">
          <p className="text-purple-300 font-black">✅ {toast}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-8">
          <a
            href="/"
            className="text-purple-300 font-bold hover:underline bg-black/40 border border-purple-500/20 px-5 py-3 rounded-xl backdrop-blur-xl"
          >
            ← Voltar para loja
          </a>

          <a
            href="/cart"
            className="bg-violet-400 text-black px-5 py-3 rounded-xl font-black hover:scale-105 transition shadow-[0_0_25px_rgba(167,139,250,0.6)]"
          >
            🛒 Carrinho
          </a>
        </header>

        <section className="grid lg:grid-cols-2 gap-8">
          <div className="neon-card rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-600/20 blur-3xl rounded-full"></div>

            <div className="relative rounded-3xl overflow-hidden bg-black/50 border border-white/10 shadow-[0_0_45px_rgba(168,85,247,0.18)]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition duration-700"
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-8xl">
                  🎮
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

              <div className="absolute top-4 left-4 flex gap-3">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-black shadow-lg shadow-purple-500/40">
                  🔥 HOT
                </div>

                {discount > 0 && (
                  <div className="bg-pink-600 text-white px-4 py-2 rounded-full font-black shadow-lg shadow-pink-500/40">
                    -{discount}% OFF
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-between gap-3">
                <div className="bg-black/80 border border-purple-500 text-purple-300 px-4 py-2 rounded-full font-bold">
                  ⚡ Entrega rápida
                </div>

                <div className="bg-black/80 border border-green-500 text-green-300 px-4 py-2 rounded-full font-bold">
                  🟢 Online agora
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl">🛡️</p>
                <p className="text-xs text-zinc-400">Compra segura</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl">⚡</p>
                <p className="text-xs text-zinc-400">Entrega rápida</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl">💬</p>
                <p className="text-xs text-zinc-400">Suporte ativo</p>
              </div>
            </div>
          </div>

          <div className="neon-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-600/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex flex-wrap gap-3 mb-5">
                <span className="bg-purple-600/20 border border-purple-500/40 text-purple-300 px-4 py-2 rounded-full text-sm font-bold">
                  Produto Digital
                </span>

                <span className="bg-green-600/10 border border-green-500/40 text-green-300 px-4 py-2 rounded-full text-sm font-bold">
                  Compra Segura
                </span>

                <span className="bg-pink-600/10 border border-pink-500/40 text-pink-300 px-4 py-2 rounded-full text-sm font-bold">
                  Suporte Ativo
                </span>

                <span className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold">
                  Mais vendido
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black glitch-text mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <p className="text-yellow-400 text-sm animate-pulse">
                  ★★★★★
                </p>
                <p className="text-zinc-400 text-sm">
                  4.9/5 baseado em 128 avaliações verificadas
                </p>
              </div>

              <div className="cyber-line mb-6"></div>

              {productOptions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-zinc-300 text-sm font-bold">
                      Escolha uma opção
                    </p>
                    <p className="text-green-400 text-xs font-bold">
                      Estoque ilimitado
                    </p>
                  </div>

                  <div className="space-y-3">
                    {productOptions.map((option, index) => {
                      const optionDiscount =
                        option.old_price &&
                        Number(option.old_price) > Number(option.price)
                          ? Math.round(
                              ((Number(option.old_price) -
                                Number(option.price)) /
                                Number(option.old_price)) *
                                100
                            )
                          : 0;

                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedOption(option)}
                          className={`w-full rounded-2xl border p-4 text-left transition hover:scale-[1.01] relative overflow-hidden ${
                            selectedOption?.id === option.id
                              ? "border-purple-500 bg-purple-600/20 shadow-lg shadow-purple-500/30"
                              : "border-white/10 bg-black/40 hover:border-purple-500/50"
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition"></div>

                          <div className="relative flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-lg">
                                  {option.name}
                                </p>

                                {index === 1 && (
                                  <span className="text-[10px] bg-yellow-500 text-black px-2 py-1 rounded-full font-black">
                                    MELHOR CUSTO
                                  </span>
                                )}
                              </div>

                              <p className="text-green-400 text-sm">
                                Entrega rápida após confirmação
                              </p>
                            </div>

                            <div className="text-right">
                              {option.old_price && (
                                <p className="text-zinc-500 line-through text-sm">
                                  R$ {Number(option.old_price).toFixed(2)}
                                </p>
                              )}

                              <p className="text-2xl font-black text-purple-300">
                                R$ {Number(option.price).toFixed(2)}
                              </p>

                              {optionDiscount > 0 && (
                                <p className="text-pink-300 text-xs font-bold">
                                  -{optionDiscount}% OFF
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-3xl border border-purple-500/30 bg-black/40 p-5">
                <p className="text-zinc-400 text-sm mb-1">Preço final</p>

                <div className="flex items-end gap-4 flex-wrap">
                  <p className="text-5xl font-black text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
                    R$ {Number(displayPrice).toFixed(2)}
                  </p>

                  {displayOldPrice && (
                    <p className="text-zinc-500 line-through text-xl mb-1">
                      R$ {Number(displayOldPrice).toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="text-green-400 font-bold text-sm mt-3">
                  Pagamento via Pix • Liberação após confirmação
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <p className="text-zinc-500 text-sm">Pessoas vendo agora</p>
                  <p className="text-2xl font-black text-purple-300">
                    👀 {viewers}
                  </p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                  <p className="text-zinc-500 text-sm">Oferta termina em</p>
                  <p className="text-2xl font-black text-pink-300">
                    ⏳ {minutes}:{seconds.toString().padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6">
                <p className="text-yellow-300 font-bold">
                  ⚠️ Oferta promocional ativa.
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  Finalize agora para garantir o valor antes que o tempo acabe.
                </p>
              </div>

              <div className="mb-6 rounded-3xl border border-purple-500/30 bg-black/40 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-zinc-400 text-sm font-bold">
                      Quantidade
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Escolha quantas unidades deseja comprar
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-11 h-11 rounded-2xl bg-black/50 border border-white/10 text-2xl font-black hover:border-purple-500/40 transition"
                    >
                      -
                    </button>

                    <div className="w-16 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-xl font-black text-purple-200">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="w-11 h-11 rounded-2xl bg-black/50 border border-white/10 text-2xl font-black hover:border-purple-500/40 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <button
                  onClick={buyNow}
                  className="neon-button-strong py-5 rounded-2xl font-black text-xl hover:scale-[1.02] transition"
                >
                  ⚡ Comprar agora
                </button>

                <button
                  onClick={addToCart}
                  className="neon-outline py-4 rounded-2xl font-bold hover:scale-[1.02] transition"
                >
                  🛒 Adicionar ao carrinho
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center hover:border-purple-500/40 transition">
                  <p className="text-2xl mb-1">🛡️</p>
                  <p className="font-bold text-sm">Garantia</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center hover:border-purple-500/40 transition">
                  <p className="text-2xl mb-1">⚡</p>
                  <p className="font-bold text-sm">Rápido</p>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center hover:border-purple-500/40 transition">
                  <p className="text-2xl mb-1">💬</p>
                  <p className="font-bold text-sm">Suporte</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 neon-card rounded-3xl p-8">
            <p className="text-purple-300 text-sm font-bold tracking-widest mb-2">
              DETALHES
            </p>
            <h2 className="text-3xl font-black glitch-text mb-5">
              Descrição do produto
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              {product.description ||
                "Produto digital entregue após a confirmação do pagamento. Acompanhe seu pedido pela área do cliente."}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-purple-300 font-black">01</p>
                <p className="text-sm text-zinc-300 mt-2">
                  Escolha a opção desejada
                </p>
              </div>

              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-purple-300 font-black">02</p>
                <p className="text-sm text-zinc-300 mt-2">
                  Finalize pelo checkout
                </p>
              </div>

              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4">
                <p className="text-purple-300 font-black">03</p>
                <p className="text-sm text-zinc-300 mt-2">
                  Acompanhe na sua conta
                </p>
              </div>
            </div>
          </div>

          <div className="neon-card rounded-3xl p-8">
            <h2 className="text-2xl font-black text-purple-300 mb-5">
              Informações
            </h2>

            <div className="space-y-4 text-zinc-300">
              <p>
                ✅ Categoria:{" "}
                {product.category || product.service || "Digital"}
              </p>
              <p>✅ Estoque: {product.stock ?? "Disponível"}</p>
              <p>✅ Pagamento: Pix</p>
              <p>✅ Entrega: automática/manual após confirmação</p>
              <p>✅ Suporte: ativo</p>
              <p>✅ Segurança: compra protegida</p>
            </div>
          </div>
        </section>

        <section className="neon-card rounded-3xl p-8 mt-8">
          <p className="text-purple-300 text-sm font-bold tracking-widest mb-2">
            PROVA SOCIAL
          </p>
          <h2 className="text-3xl font-black glitch-text mb-6">
            Avaliações dos clientes
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {premiumReviews.map((review) => (
              <div
                key={review.name}
                className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-yellow-400">★★★★★</p>
                  <span className="text-[10px] text-green-300 border border-green-500/30 bg-green-500/10 px-2 py-1 rounded-full">
                    {review.tag}
                  </span>
                </div>

                <p className="text-zinc-300">“{review.text}”</p>
                <p className="text-purple-300 font-bold mt-3">— {review.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
