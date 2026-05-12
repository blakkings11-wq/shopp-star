"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  category: string | null;
  service?: string | null;
  sales_count?: number;
  rating?: number;
  reviews_total?: number;
};

type Review = {
  name: string;
  avatar: string;
  time: string;
  text: string;
  badge: string;
};

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  icon: string | null;
  color_from: string | null;
  color_to: string | null;
  link_url: string | null;
  active: boolean;
  position: number | null;
};

const reviews: Review[] = [
  {
    name: "Luana T.",
    avatar: "L",
    time: "há 2 min",
    badge: "Compra verificada",
    text: "Comprei seguidores e caiu muito rápido. Achei que ia demorar, mas chegou certinho. Vou comprar de novo.",
  },
  {
    name: "Tiago M.",
    avatar: "T",
    time: "há 5 min",
    badge: "Entrega rápida",
    text: "Atendimento rápido demais. Fiz o pedido, paguei e recebi sem enrolação. Pode comprar tranquilo.",
  },
  {
    name: "Luna A.",
    avatar: "A",
    time: "há 8 min",
    badge: "Recomenda",
    text: "Preço muito bom e entrega rápida. Peguei o pacote maior porque compensava mais. Gostei muito.",
  },
  {
    name: "Willian S.",
    avatar: "W",
    time: "há 11 min",
    badge: "Cliente fiel",
    text: "Já comprei 3 vezes e sempre chegou certo. Loja confiável e visual muito profissional.",
  },
  {
    name: "Carlos Z.",
    avatar: "C",
    time: "há 16 min",
    badge: "Top cliente",
    text: "Achei pelo anúncio e testei com medo, mas deu tudo certo. Agora só compro aqui.",
  },
  {
    name: "Marcos P.",
    avatar: "M",
    time: "há 22 min",
    badge: "Aprovado",
    text: "Entrega absurda de rápida. O pacote chegou e ainda recebi suporte no WhatsApp. 10/10.",
  },
  {
    name: "Rafaela N.",
    avatar: "R",
    time: "há 31 min",
    badge: "Compra segura",
    text: "Comprei um produto digital e recebi certinho. O site passa confiança e é fácil de usar.",
  },
  {
    name: "Diego F.",
    avatar: "D",
    time: "há 45 min",
    badge: "Entrega ok",
    text: "Melhor preço que encontrei. Finalizei a compra e o pedido apareceu certinho na minha conta.",
  },
];

const reviewLoop = [...reviews, ...reviews];

const tickerItems = [
  "⚡ Entrega rápida em produtos digitais",
  "🔥 Promoções ativas hoje",
  "👀 Clientes comprando agora",
  "💎 Produtos premium selecionados",
  "🎧 Suporte online disponível",
  "🛒 Checkout simples e seguro",
];

const tickerLoop = [...tickerItems, ...tickerItems];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [viewers, setViewers] = useState(22);
  const [showSale, setShowSale] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dynamicBanners, setDynamicBanners] = useState<Banner[]>([]);

  const promoBanners = [
    {
      title: "NETFLIX PREMIUM",
      subtitle: "ATÉ 30% OFF",
      desc: "Entrega rápida e garantia premium.",
      glow: "from-red-600 to-pink-600",
      icon: "🎬",
    },
    {
      title: "SEGUIDORES INSTAGRAM",
      subtitle: "SUPER PROMOÇÃO",
      desc: "Painel automático e envio rápido.",
      glow: "from-purple-600 to-violet-600",
      icon: "📈",
    },
    {
      title: "XBOX GAME PASS",
      subtitle: "TOP VENDAS",
      desc: "Contas premium com acesso imediato.",
      glow: "from-green-600 to-emerald-600",
      icon: "🎮",
    },
  ];


  const router = useRouter();

  async function loadProducts() {
    setLoading(true);
    setErro("");

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErro(error.message);
        return;
      }

      await loadTopSellingData((data as Product[]) || []);
    } catch {
      setErro("Erro ao conectar com o banco");
    } finally {
      setLoading(false);
    }
  }

  async function getUser() {
    const { data } = await supabase.auth.getUser();

    setUserEmail(data.user?.email || "");

    const avatar =
      data.user?.user_metadata?.avatar_url ||
      data.user?.user_metadata?.picture ||
      "";

    setUserAvatar(avatar);
  }


  async function loadTopSellingData(productsList: Product[]) {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("items");

    const salesMap: Record<string, number> = {};

    (ordersData || []).forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const qty = Number(item.quantity || 1);

        salesMap[item.id] = (salesMap[item.id] || 0) + qty;
      });
    });

    const updatedProducts = productsList.map((product) => ({
      ...product,
      sales_count: salesMap[product.id] || Math.floor(Math.random() * 15),
      rating: Number((4.7 + Math.random() * 0.3).toFixed(1)),
      reviews_total: Math.floor(Math.random() * 320) + 18,
    }));

    setProducts(updatedProducts);
  }

  async function loadBanners() {
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .eq("active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setDynamicBanners((data as Banner[]) || []);
  }

  useEffect(() => {
    setMounted(true);
    loadProducts();
    getUser();
    loadBanners();

    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);

    const reload = () => {
      router.refresh();
      loadProducts();
      getUser();
      loadBanners();
    };

    window.addEventListener("focus", reload);
    window.addEventListener("pageshow", reload);

    const viewersInterval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 35) + 12);
    }, 4000);

    const saleInterval = setInterval(() => {
      setShowSale(true);
      setTimeout(() => setShowSale(false), 5000);
    }, 14000);

    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("pageshow", reload);
      clearInterval(viewersInterval);
      clearInterval(saleInterval);
    };
  }, []);


  function toggleFavorite(productId: string) {
    const updated = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  const effectiveBanners =
    dynamicBanners.length > 0
      ? dynamicBanners.map((banner) => ({
          title: banner.title,
          subtitle: banner.subtitle,
          desc: banner.description || "Oferta especial por tempo limitado.",
          glow: `from-${banner.color_from || "purple"}-600 to-${
            banner.color_to || "pink"
          }-600`,
          icon: banner.icon || "🔥",
          link: banner.link_url || "#produtos",
        }))
      : promoBanners.map((banner) => ({
          ...banner,
          link: "#produtos",
        }));

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      product.name.toLowerCase().includes(term) ||
      (product.category || "").toLowerCase().includes(term) ||
      (product.service || "").toLowerCase().includes(term)
    );
  });

  const destaques = filteredProducts.slice(0, 5);

  const streamings = filteredProducts.filter((p) =>
    ["netflix", "spotify", "youtube"].includes(
      (p.category || "").toLowerCase()
    )
  );

  const jogos = filteredProducts.filter((p) =>
    ["steam", "games", "keys", "key"].includes(
      (p.category || "").toLowerCase()
    )
  );

  const contas = filteredProducts.filter((p) =>
    ["contas", "conta"].includes((p.category || "").toLowerCase())
  );

  const redesSociais = filteredProducts.filter((p) =>
    ["instagram", "tiktok", "discord"].includes(
      (p.category || "").toLowerCase()
    )
  );

  const giftCards = filteredProducts.filter((p) =>
    ["gift card", "gift cards", "giftcard"].includes(
      (p.category || "").toLowerCase()
    )
  );

  const outros = filteredProducts.filter((p) => {
    const cat = (p.category || "").toLowerCase();

    return (
      cat &&
      ![
        "netflix",
        "spotify",
        "youtube",
        "steam",
        "games",
        "keys",
        "key",
        "contas",
        "conta",
        "instagram",
        "tiktok",
        "discord",
        "gift card",
        "gift cards",
        "giftcard",
      ].includes(cat)
    );
  });

  function SectionTitle({ title }: { title: string }) {
    return (
      <div className="flex items-center gap-6 my-14">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/10"></div>

        <h2 className="text-2xl md:text-3xl font-black text-white whitespace-nowrap">
          {title}
        </h2>

        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/30 to-white/10"></div>
      </div>
    );
  }

  function ProductCard({ product }: { product: Product }) {
    const hasDiscount = Boolean(product.old_price && product.old_price > product.price);
    const isFavorite = favorites.includes(product.id);
    const discount = hasDiscount
      ? Math.round(100 - (Number(product.price) / Number(product.old_price)) * 100)
      : 0;

    return (
      <div
        onClick={() => (window.location.href = `/product/${product.id}`)}
        className="premium-product-card neon-card rounded-3xl overflow-hidden cursor-pointer transition duration-500 group hover:-translate-y-3"
      >
        <div className="absolute inset-0 pointer-events-none rounded-3xl premium-card-glow"></div>
        <div className="absolute inset-0 pointer-events-none rounded-3xl premium-card-shine"></div>

        <div className="relative h-44 bg-black/50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition duration-700 group-hover:scale-115 group-hover:rotate-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-950 via-black to-pink-950">
              🎮
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_50%_10%,rgba(168,85,247,0.35),transparent_45%)]"></div>

          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/50 border border-purple-300/50 flex items-center justify-center shadow-lg shadow-purple-500/50 backdrop-blur-xl">
              ⚡
            </div>

            {(product.sales_count || 0) >= 5 && (
              <div className="px-3 py-2 rounded-2xl bg-yellow-500/30 border border-yellow-300/50 text-[11px] font-black shadow-lg shadow-yellow-500/30 backdrop-blur-xl text-yellow-100">
                🏆 MAIS VENDIDO
              </div>
            )}

            {hasDiscount && (
              <div className="px-3 py-2 rounded-2xl bg-pink-600/40 border border-pink-300/50 text-[11px] font-black shadow-lg shadow-pink-500/40 backdrop-blur-xl">
                -{discount}% OFF
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={`absolute top-3 right-3 text-sm px-3 py-2 rounded-full font-black shadow-lg backdrop-blur-xl transition ${
              isFavorite
                ? "bg-pink-600/70 border border-pink-300/60 text-white shadow-pink-500/40"
                : "bg-black/75 border border-yellow-400/40 text-yellow-300 shadow-yellow-500/20"
            }`}
          >
            {isFavorite ? "❤️" : "♡"}
          </button>

          <div className="absolute bottom-3 right-3 bg-black/80 border border-purple-500 text-xs px-3 py-2 rounded-full font-bold shadow-lg shadow-purple-500/30">
            Instantâneo
          </div>
        </div>

        <div className="relative p-5">
          <span className="inline-flex items-center gap-2 text-[10px] font-black border border-white/20 px-3 py-1.5 rounded-full text-zinc-200 mb-4 uppercase bg-white/5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {product.category || product.service || "Digital"}
          </span>

          <h3 className="font-black text-base line-clamp-2 min-h-[48px] group-hover:text-purple-200 transition">
            {product.name}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
                R$ {Number(product.price).toFixed(2)}
              </p>

              {product.old_price && (
                <p className="text-zinc-500 line-through text-xs mt-1">
                  R$ {Number(product.old_price).toFixed(2)}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-yellow-400 text-xs star-twinkle">★★★★★</p>
              <p className="text-[10px] text-zinc-500 mt-1">
                {product.rating}/5 ({product.reviews_total})
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-green-300 font-black">
              ✓ Cliente verificado
            </span>

            <span className="text-zinc-400">
              {product.reviews_total} avaliações
            </span>
          </div>

          <div className="mt-4 h-10 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/30 flex items-center justify-center text-xs font-black text-purple-100 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] transition">
            Ver oferta agora
          </div>
        </div>
      </div>
    );
  }

  function ProductSection({
    title,
    list,
  }: {
    title: string;
    list: Product[];
  }) {
    if (list.length === 0) return null;

    return (
      <section className="mb-16">
        <SectionTitle title={title} />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  }

  function ReviewsSection() {
    return (
      <section className="mt-24 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-white/10"></div>

            <div className="text-center">
              <p className="text-purple-300 text-sm font-bold tracking-widest mb-2">
                PROVA SOCIAL REAL
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white">
                O QUE NOSSOS CLIENTES DIZEM
              </h2>
            </div>

            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/30 to-white/10"></div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/30 py-6">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-black/90 to-transparent"></div>
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-black/90 to-transparent"></div>

            <div className="reviews-track flex w-max gap-6 px-6">
              {reviewLoop.map((review, i) => (
                <div
                  key={`${review.name}-${i}`}
                  className="min-w-[330px] max-w-[330px] rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-xl shadow-lg shadow-purple-500/10 transition hover:-translate-y-1 hover:border-purple-500/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-violet-400 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/30">
                          {review.avatar}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></span>
                      </div>

                      <div>
                        <p className="font-black text-white leading-tight">
                          {review.name}
                        </p>
                        <p className="text-zinc-500 text-xs">{review.time}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full whitespace-nowrap">
                      {review.badge}
                    </span>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span
                        key={starIndex}
                        className="star-pop text-yellow-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                        style={{ animationDelay: `${starIndex * 120}ms` }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed">
                    “{review.text}”
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          .reviews-track {
            animation: reviews-scroll 38s linear infinite;
          }

          .reviews-track:hover {
            animation-play-state: paused;
          }

          @keyframes reviews-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-50% - 12px));
            }
          }

          .star-pop {
            display: inline-block;
            animation: star-pop 1.8s ease-in-out infinite;
          }

          @keyframes star-pop {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.85;
            }
            50% {
              transform: scale(1.25) rotate(-6deg);
              opacity: 1;
            }
          }
        `}</style>
      </section>
    );
  }



  function SearchSection() {
    const favoriteProducts = products.filter((product) =>
      favorites.includes(product.id)
    );

    return (
      <section className="relative z-10 max-w-7xl mx-auto px-6 -mt-8 mb-10">
        <div className="neon-card rounded-[2rem] p-5 md:p-6 border border-purple-500/20 bg-black/50 backdrop-blur-xl shadow-[0_0_45px_rgba(168,85,247,0.16)]">
          <div className="grid lg:grid-cols-[1fr_auto] gap-5 items-center">
            <div>
              <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-3">
                BUSCA INTELIGENTE
              </p>

              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por produto, categoria, streaming, jogo..."
                  className="w-full bg-black/60 border border-purple-500/30 rounded-2xl px-5 py-4 pr-14 outline-none text-white placeholder:text-zinc-500 focus:border-purple-400 focus:shadow-[0_0_30px_rgba(168,85,247,0.25)] transition"
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                  🔎
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-[300px]">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-purple-300">
                  {filteredProducts.length}
                </p>
                <p className="text-[10px] text-zinc-400">resultados</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-pink-300">
                  {favorites.length}
                </p>
                <p className="text-[10px] text-zinc-400">favoritos</p>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-green-300">ON</p>
                <p className="text-[10px] text-zinc-400">suporte</p>
              </div>
            </div>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-zinc-300 font-black mb-3">
                ❤️ Seus favoritos
              </p>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {favoriteProducts.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => (window.location.href = `/product/${product.id}`)}
                    className="min-w-[220px] bg-black/40 border border-pink-500/20 rounded-2xl p-3 text-left hover:border-pink-500/50 transition"
                  >
                    <p className="font-black text-sm line-clamp-1">
                      {product.name}
                    </p>

                    <p className="text-purple-300 font-black mt-1">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }


  function PromoSection() {
    const topSelling = [...products]
      .sort(
        (a, b) =>
          Number(b.sales_count || 0) - Number(a.sales_count || 0)
      )
      .slice(0, 6);

    return (
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="grid md:grid-cols-3 gap-5">
            {effectiveBanners.slice(0, 3).map((banner, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 bg-black/50 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.16)] group"
              >
                <div
                  className={`absolute inset-0 opacity-20 bg-gradient-to-br ${banner.glow}`}
                ></div>

                <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-5xl">
                      {banner.icon}
                    </span>

                    <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-full text-xs font-black">
                      HOT
                    </span>
                  </div>

                  <p className="text-zinc-400 text-xs font-black tracking-[0.25em] mt-6">
                    {banner.title}
                  </p>

                  <h3 className="text-3xl font-black mt-3 leading-tight">
                    {banner.subtitle}
                  </h3>

                  <p className="text-zinc-400 mt-4">
                    {banner.desc}
                  </p>

                  <a
                    href={banner.link}
                    className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 py-3 font-black hover:bg-white/10 transition flex items-center justify-center"
                  >
                    Ver oferta →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="neon-card rounded-[2rem] p-6 border border-yellow-500/20 bg-black/50 backdrop-blur-xl shadow-[0_0_40px_rgba(234,179,8,0.12)] relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-yellow-300 text-xs font-black tracking-[0.25em]">
                    RANKING
                  </p>

                  <h2 className="text-3xl font-black mt-2">
                    Mais vendidos
                  </h2>
                </div>

                <span className="text-4xl">
                  🏆
                </span>
              </div>

              <div className="space-y-3">
                {topSelling.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      (window.location.href = `/product/${product.id}`)
                    }
                    className="w-full text-left bg-black/40 border border-white/10 rounded-2xl p-4 hover:border-yellow-500/40 transition flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center font-black text-yellow-300">
                      #{index + 1}
                    </div>

                    <div className="flex-1">
                      <p className="font-black line-clamp-1">
                        {product.name}
                      </p>

                      <p className="text-zinc-500 text-sm mt-1">
                        {(product.sales_count || 0)} vendas realizadas
                      </p>
                    </div>

                    <p className="text-purple-300 font-black">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function HeroSection() {
    return (
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.35),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.22),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.14),transparent_32%)]"></div>
        <div className="absolute inset-0 opacity-[0.16] hero-grid"></div>
        <div className="absolute -top-28 left-10 w-80 h-80 rounded-full bg-purple-700/25 blur-3xl animate-pulse"></div>
        <div className="absolute top-24 right-10 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-44 bg-purple-500/10 blur-3xl rounded-full"></div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-3 mb-5 bg-black/50 border border-purple-500/40 text-purple-200 px-4 py-2 rounded-full text-sm font-black shadow-[0_0_25px_rgba(168,85,247,0.25)]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
              </span>
              Entrega rápida • Suporte online • Produtos premium
            </div>

            <p className="text-purple-300 font-black tracking-[0.35em] text-xs md:text-sm mb-4">
              SHOPP STAR DIGITAL MARKET
            </p>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-6 glitch-text">
              Produtos Digitais
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-violet-300">
                No Nível Insano
              </span>
            </h1>

            <p className="text-zinc-300 max-w-2xl text-lg leading-relaxed mb-8">
              Contas, keys, gift cards, streamings, jogos e produtos digitais com visual premium, compra simples e entrega rápida direto pela loja.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="#produtos"
                className="relative overflow-hidden px-7 py-4 rounded-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-violet-600 shadow-[0_0_35px_rgba(168,85,247,0.55)] hover:scale-105 transition"
              >
                <span className="relative z-10">🔥 Ver Produtos</span>
                <span className="absolute inset-0 hero-shine"></span>
              </a>

              <button
                type="button"
                onClick={() => setShowSupport(true)}
                className="px-7 py-4 rounded-2xl font-black bg-black/50 border border-purple-500/40 hover:border-purple-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] transition"
              >
                🎧 Falar com Suporte
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              <div className="neon-card rounded-2xl p-4">
                <p className="text-2xl font-black text-green-400">{viewers}</p>
                <p className="text-xs text-zinc-400">vendo agora</p>
              </div>

              <div className="neon-card rounded-2xl p-4">
                <p className="text-2xl font-black text-purple-300">{products.length}</p>
                <p className="text-xs text-zinc-400">produtos ativos</p>
              </div>

              <div className="neon-card rounded-2xl p-4">
                <p className="text-2xl font-black text-pink-300">24/7</p>
                <p className="text-xs text-zinc-400">loja online</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] hidden lg:block">
            <div className="absolute inset-0 rounded-[2rem] border border-purple-500/30 bg-black/35 backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/10"></div>
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Status da loja</p>
                  <p className="text-green-400 font-black">● Online agora</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                  ⚡
                </div>
              </div>

              <div className="absolute top-28 left-6 right-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-black/50 border border-white/10 p-5 hero-float-one">
                  <p className="text-3xl mb-3">🎮</p>
                  <p className="font-black">Jogos & Keys</p>
                  <p className="text-xs text-zinc-400 mt-1">Ofertas digitais premium</p>
                </div>

                <div className="rounded-2xl bg-black/50 border border-white/10 p-5 hero-float-two">
                  <p className="text-3xl mb-3">📺</p>
                  <p className="font-black">Streamings</p>
                  <p className="text-xs text-zinc-400 mt-1">Planos e contas digitais</p>
                </div>

                <div className="rounded-2xl bg-black/50 border border-white/10 p-5 hero-float-two">
                  <p className="text-3xl mb-3">📦</p>
                  <p className="font-black">Entrega rápida</p>
                  <p className="text-xs text-zinc-400 mt-1">Pedido acompanhado</p>
                </div>

                <div className="rounded-2xl bg-black/50 border border-white/10 p-5 hero-float-one">
                  <p className="text-3xl mb-3">💎</p>
                  <p className="font-black">Visual premium</p>
                  <p className="text-xs text-zinc-400 mt-1">Compra simples e segura</p>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-gradient-to-r from-purple-600/25 to-pink-600/20 border border-purple-400/30 p-5">
                <p className="font-black text-purple-100">🔥 Promoções em destaque</p>
                <p className="text-sm text-zinc-300 mt-1">Produtos digitais organizados por categorias.</p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .hero-grid {
            background-image: linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: radial-gradient(circle at center, black, transparent 72%);
          }

          .hero-shine {
            background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.55) 45%, transparent 70%);
            transform: translateX(-120%);
            animation: hero-shine 2.8s ease-in-out infinite;
          }

          @keyframes hero-shine {
            0% { transform: translateX(-120%); }
            55%, 100% { transform: translateX(140%); }
          }

          .hero-float-one {
            animation: hero-float-one 4s ease-in-out infinite;
          }

          .hero-float-two {
            animation: hero-float-two 4.8s ease-in-out infinite;
          }

          @keyframes hero-float-one {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes hero-float-two {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(10px); }
          }
        `}</style>
      </section>
    );
  }


  function TopPromoBar() {
    return (
      <div className="relative z-40 overflow-hidden border-b border-purple-500/20 bg-black/80 backdrop-blur-xl">
        <div className="top-ticker-track flex w-max gap-10 py-2 text-xs md:text-sm font-black text-purple-100">
          {tickerLoop.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]"></span>
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  function CyberBackground() {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(236,72,153,0.16),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.10),transparent_35%)]"></div>
        <div className="absolute inset-0 cyber-grid-bg"></div>
        <div className="absolute top-24 left-12 w-72 h-72 rounded-full bg-purple-700/20 blur-3xl cyber-glow-one"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 rounded-full bg-pink-600/15 blur-3xl cyber-glow-two"></div>
        <div className="absolute inset-0 cyber-noise"></div>
      </div>
    );
  }

  function VisualStyles() {
    return (
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #020007;
        }

        .page-shell-enter {
          animation: page-shell-enter 700ms ease both;
        }

        @keyframes page-shell-enter {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .top-ticker-track {
          animation: top-ticker-scroll 28s linear infinite;
        }

        @keyframes top-ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .cyber-grid-bg {
          opacity: 0.14;
          background-image: linear-gradient(rgba(168, 85, 247, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.28) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: radial-gradient(circle at center, black, transparent 72%);
          animation: cyber-grid-move 18s linear infinite;
        }

        @keyframes cyber-grid-move {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(54px, 54px, 0);
          }
        }

        .cyber-glow-one {
          animation: cyber-glow-one 7s ease-in-out infinite;
        }

        .cyber-glow-two {
          animation: cyber-glow-two 8s ease-in-out infinite;
        }

        @keyframes cyber-glow-one {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.55;
          }
          50% {
            transform: translate(40px, 30px) scale(1.18);
            opacity: 0.9;
          }
        }

        @keyframes cyber-glow-two {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translate(-40px, -25px) scale(1.12);
            opacity: 0.8;
          }
        }

        .cyber-noise {
          opacity: 0.06;
          background-image: repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 7px);
        }

        .premium-product-card {
          position: relative;
          transform-style: preserve-3d;
          isolation: isolate;
        }

        .premium-product-card:hover {
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.35), inset 0 0 30px rgba(168, 85, 247, 0.08);
        }

        .premium-card-glow {
          opacity: 0;
          background: radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.35), transparent 48%);
          transition: opacity 500ms ease;
          z-index: 1;
        }

        .premium-product-card:hover .premium-card-glow {
          opacity: 1;
        }

        .premium-card-shine {
          background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.14) 38%, transparent 60%);
          transform: translateX(-130%);
          transition: transform 900ms ease;
          z-index: 2;
        }

        .premium-product-card:hover .premium-card-shine {
          transform: translateX(130%);
        }

        .star-twinkle {
          animation: star-twinkle 1.7s ease-in-out infinite;
        }

        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.7;
            filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.9));
          }
        }

        .support-orb {
          animation: support-orb-pulse 1.8s ease-in-out infinite;
        }

        .support-orb-icon {
          animation: support-icon-float 2.2s ease-in-out infinite;
        }

        @keyframes support-orb-pulse {
          0%, 100% {
            box-shadow: 0 0 28px rgba(168,85,247,0.85), 0 0 0 0 rgba(168,85,247,0.45);
          }
          50% {
            box-shadow: 0 0 42px rgba(236,72,153,0.95), 0 0 0 12px rgba(168,85,247,0);
          }
        }

        @keyframes support-icon-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(-8deg);
          }
        }

        .support-modal-enter {
          animation: support-modal-enter 220ms ease both;
        }

        .support-panel-pop {
          animation: support-panel-pop 320ms cubic-bezier(.2,.9,.2,1.2) both;
        }

        @keyframes support-modal-enter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes support-panel-pop {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    );
  }

  const fixedLayer =
    mounted &&
    createPortal(
      <>
        {showSale && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "24px",
              zIndex: 2147483647,
            }}
            className="bg-black/90 border border-purple-500 rounded-2xl p-4 shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-bounce"
          >
            <p className="text-purple-300 font-bold">🔥 Nova compra</p>
            <p className="text-sm text-zinc-300">
              Um cliente acabou de comprar
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowMobileMenu(true)}
          style={{
            position: "fixed",
            bottom: "102px",
            right: "24px",
            zIndex: 2147483647,
          }}
          className="md:hidden w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(168,85,247,0.95)] hover:scale-110 transition border border-white/20"
        >
          ☰
        </button>

        <button
          type="button"
          onClick={() => setShowSupport(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 2147483647,
          }}
          className="support-orb w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-violet-500 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(168,85,247,0.95)] hover:scale-110 transition border border-white/20"
        >
          <span className="support-orb-icon">🎧</span>
        </button>

        {showMobileMenu && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
            }}
            className="bg-black/85 backdrop-blur-md flex items-end md:hidden"
          >
            <div className="w-full rounded-t-[2rem] bg-black border-t border-purple-500/40 p-5 shadow-[0_0_45px_rgba(168,85,247,0.75)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-purple-300 text-xs font-black tracking-[0.25em]">
                    SHOPP STAR APP
                  </p>
                  <h2 className="text-2xl font-black">
                    Menu rápido
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a href="/" className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 font-black">
                  🏠 Início
                </a>
                <a href="/cart" className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 font-black">
                  🛒 Carrinho
                </a>
                <a href="/account" className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 font-black">
                  👤 Conta
                </a>
                <a href="/orders" className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 font-black">
                  📦 Pedidos
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowSupport(true);
                }}
                className="w-full mt-4 neon-button-strong py-4 rounded-2xl font-black"
              >
                🎧 Abrir suporte
              </button>
            </div>
          </div>
        )}

        {showSupport && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
            }}
            className="bg-black/85 backdrop-blur-md flex items-center justify-center p-4 support-modal-enter"
          >
            <div className="w-full max-w-md rounded-3xl overflow-hidden bg-black border border-purple-500/40 shadow-[0_0_45px_rgba(168,85,247,0.9)] support-panel-pop">
              <div className="relative bg-gradient-to-br from-purple-700 via-pink-600 to-violet-700 p-6">
                <div className="absolute inset-0 bg-black/10"></div>

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white/80 text-xs font-black tracking-[0.25em] mb-2">
                      SHOPP STAR
                    </p>
                    <h2 className="text-2xl font-black text-white">
                      🎧 Central de Atendimento
                    </h2>
                    <p className="text-white/80 text-sm mt-2">
                      Escolha uma opção abaixo para receber suporte.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSupport(false)}
                    className="w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-black">
                <div className="bg-green-500/10 border border-green-500/40 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <div>
                      <p className="font-black text-green-300">
                        Atendimento disponível
                      </p>
                      <p className="text-sm text-zinc-400">
                        Segunda a sexta: 12:00 às 20:00
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://wa.me/SEUNUMERO"
                  target="_blank"
                  className="block bg-purple-500/10 border border-purple-500/40 p-4 rounded-2xl hover:bg-purple-500/20 transition"
                >
                  <p className="font-black text-purple-300">
                    💬 Comunidade WhatsApp
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Entre no grupo para novidades, avisos e promoções.
                  </p>
                </a>

                <a
                  href="https://discord.gg/SEULINK"
                  target="_blank"
                  className="block bg-blue-500/10 border border-blue-500/40 p-4 rounded-2xl hover:bg-blue-500/20 transition"
                >
                  <p className="font-black text-blue-300">
                    🎮 Servidor Discord
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Fale com a comunidade e acompanhe atualizações.
                  </p>
                </a>

                <a
                  href="https://wa.me/SEUNUMERO"
                  target="_blank"
                  className="block bg-pink-500/10 border border-pink-500/40 p-4 rounded-2xl hover:bg-pink-500/20 transition"
                >
                  <p className="font-black text-pink-300">
                    ⚡ Atendimento humano
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Precisa de ajuda com pedido ou pagamento? Chame agora.
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}
      </>,
      document.body
    );

  return (
    <>
      <main className="relative min-h-screen text-white bg-black/70 backdrop-blur-sm overflow-hidden page-shell-enter">
        <CyberBackground />
        <VisualStyles />
        <TopPromoBar />

        <header className="sticky top-0 z-[9999] border-b border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_0_35px_rgba(168,85,247,0.14)]">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6 py-4 gap-4">
            <a
              href="/"
              className="flex items-center gap-3 min-w-fit group"
              aria-label="Voltar para a página inicial"
            >
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/40 bg-gradient-to-br from-purple-700 via-black to-pink-600 shadow-[0_0_25px_rgba(168,85,247,0.45)] group-hover:scale-105 transition">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_35%)]"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
                  ⭐
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-purple-200 transition">
                  Shopp Star
                </span>

                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shadow-[0_0_18px_rgba(59,130,246,0.7)]">
                  ✓
                </span>
              </div>
            </a>



            <div className="flex gap-3 items-center">
              <a
                href="/account"
                className="relative px-4 md:px-6 py-2 font-bold uppercase tracking-wider text-white rounded-xl overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-70 blur-lg group-hover:opacity-100 transition"></span>
                <span className="absolute inset-0 border border-purple-400 rounded-xl group-hover:shadow-[0_0_20px_rgba(168,85,247,0.9)]"></span>
                <span className="relative z-10 flex items-center gap-2 group-hover:scale-110 transition">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Foto do perfil"
                      className="w-7 h-7 rounded-full border border-white/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    "👤"
                  )}
                  <span className="hidden md:inline">Minha Conta</span>
                </span>
              </a>

              {userEmail === "blakkings11@gmail.com" && (
                <a
                  href="/admin"
                  className="neon-button-strong px-4 py-2 rounded-xl hidden md:inline-flex"
                >
                  ⚙ Admin
                </a>
              )}

              <a
                href="/cart"
                className="bg-violet-400 text-black px-4 py-2 rounded-xl font-black hover:scale-105 transition"
              >
                🛒 <span className="hidden md:inline">Carrinho</span>
              </a>
            </div>
          </div>
        </header>

        <HeroSection />

        <SearchSection />

        <PromoSection />

        <section id="produtos" className="max-w-7xl mx-auto px-6 pb-16">
          {loading && (
            <>
              <SectionTitle title="Carregando produtos" />

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="neon-card rounded-2xl p-4 animate-pulse"
                  >
                    <div className="h-40 rounded-xl bg-white/10 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-3"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3 mb-4"></div>
                    <div className="h-6 bg-purple-500/20 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {erro && (
            <div className="neon-card rounded-2xl p-8 text-center">
              <p className="text-red-400 text-xl font-bold">❌ {erro}</p>

              <button
                onClick={loadProducts}
                className="mt-5 neon-button-strong px-6 py-3 rounded-xl"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && !erro && (
            <div className="neon-card rounded-2xl p-10 text-center">
              <p className="text-5xl mb-4">📦</p>

              <h2 className="text-2xl font-black mb-2">
                Nenhum produto encontrado
              </h2>

              <p className="text-zinc-400">
                {search
                  ? "Nenhum produto encontrado nessa busca."
                  : "Adicione produtos pelo painel admin para aparecerem aqui."}
              </p>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && !erro && (
            <>
              <ProductSection title="🔥 Top vendas automáticas" list={[...products]
                .sort(
                  (a, b) =>
                    Number(b.sales_count || 0) - Number(a.sales_count || 0)
                )
                .slice(0, 5)} />

              <ProductSection title="Destaques de hoje" list={destaques} />

              <ProductSection title="Streamings" list={streamings} />

              <ProductSection title="Jogos" list={jogos} />

              <ProductSection title="Contas" list={contas} />

              <ProductSection title="Redes sociais" list={redesSociais} />

              <ProductSection title="Gift Cards" list={giftCards} />

              <ProductSection title="Outros produtos" list={outros} />
            </>
          )}
        </section>

        <ReviewsSection />
      </main>

      {fixedLayer}
    </>
  );
}
