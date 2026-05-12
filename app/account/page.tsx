"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    avatar: "",
  });

  const [onlineUsers, setOnlineUsers] = useState(132);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    loadUser();

    const onlineInterval = setInterval(() => {
      setOnlineUsers(Math.floor(Math.random() * 80) + 90);
    }, 5000);

    const pulseInterval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);

    return () => {
      clearInterval(onlineInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  async function loadUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      router.push("/login");
      return;
    }

    const metadata = data.user.user_metadata;

    const name =
      metadata?.full_name ||
      metadata?.name ||
      data.user?.email?.split("@")[0] ||
      "Cliente";

    const avatar =
      metadata?.avatar_url ||
      metadata?.picture ||
      metadata?.photoURL ||
      "";

    setUser({
      name,
      email: data.user?.email || "",
      avatar,
    });

    console.log("USER METADATA:", metadata);

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-purple-300 font-black tracking-widest">
            Carregando conta...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative p-6">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.30),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_center,rgba(59,130,246,0.10),transparent_40%)]"></div>

      <div className="fixed inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-purple-300 font-black tracking-[0.35em] text-sm mb-3">
              SHOPP STAR ACCOUNT
            </p>

            <h1 className="text-5xl md:text-6xl font-black glitch-text">
              Painel do Cliente
            </h1>

            <p className="text-zinc-400 mt-4 max-w-2xl">
              Gerencie seus pedidos, acompanhe entregas e acesse sua conta.
            </p>
          </div>

          <div className="bg-black/40 border border-purple-500/30 rounded-3xl px-6 py-5 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.18)]">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  pulse ? "bg-green-400" : "bg-purple-400"
                } animate-pulse`}
              ></span>

              <div>
                <p className="font-black text-green-300">
                  Conta protegida
                </p>

                <p className="text-zinc-400 text-sm">
                  👀 {onlineUsers} usuários online
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="neon-card rounded-3xl p-6 h-fit sticky top-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-pink-600/10 blur-3xl rounded-full"></div>

            <div className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-purple-500 blur-2xl opacity-50"></div>

                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 p-1 shadow-[0_0_40px_rgba(168,85,247,0.7)]">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Foto do perfil"
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover bg-black"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-7xl bg-black/40">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full border-4 border-black bg-green-400 animate-pulse"></div>
                </div>

                <div className="mt-8">
                  <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-3">
                    CLIENTE PREMIUM
                  </p>

                  <h2 className="text-4xl font-black glitch-text leading-tight">
                    {user.name}
                  </h2>

                  <p className="text-zinc-400 mt-4 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full mt-8">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-purple-300">
                      12
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Compras
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-green-300">
                      4.9
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Avaliação
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                    <p className="text-2xl font-black text-pink-300">
                      PRO
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Status
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full mt-8 border border-red-500 text-red-300 px-6 py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="neon-card rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <p className="text-zinc-400 font-bold">Status</p>

                  <div className="flex items-center gap-3 mt-4">
                    <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>

                    <h2 className="text-3xl font-black text-green-400">
                      Ativo
                    </h2>
                  </div>

                  <p className="text-zinc-500 text-sm mt-3">
                    Conta operacional e protegida.
                  </p>
                </div>
              </div>

              <div className="neon-card rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <p className="text-zinc-400 font-bold">Tipo de conta</p>

                  <h2 className="text-3xl font-black text-purple-300 mt-4">
                    Premium
                  </h2>

                  <p className="text-zinc-500 text-sm mt-3">
                    Cliente verificado Shopp Star.
                  </p>
                </div>
              </div>

              <div className="neon-card rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <p className="text-zinc-400 font-bold">Segurança</p>

                  <h2 className="text-3xl font-black text-pink-400 mt-4">
                    Protegida
                  </h2>

                  <p className="text-zinc-500 text-sm mt-3">
                    Login seguro e criptografado.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <a
                href="/orders"
                className="neon-card rounded-3xl p-8 hover:scale-[1.02] transition relative overflow-hidden group"
              >
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-5xl mb-4">📦</p>

                    <span className="bg-purple-500/10 border border-purple-500/40 text-purple-300 px-3 py-1 rounded-full text-xs font-black">
                      12 pedidos
                    </span>
                  </div>

                  <h2 className="text-4xl font-black glitch-text mb-3">
                    Meus Pedidos
                  </h2>

                  <p className="text-zinc-400">
                    Veja todos os seus pedidos, status e entregas.
                  </p>
                </div>
              </a>

              <a
                href="/cart"
                className="neon-card rounded-3xl p-8 hover:scale-[1.02] transition relative overflow-hidden group"
              >
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-pink-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-5xl mb-4">🛒</p>

                    <span className="bg-green-500/10 border border-green-500/40 text-green-300 px-3 py-1 rounded-full text-xs font-black">
                      Checkout rápido
                    </span>
                  </div>

                  <h2 className="text-4xl font-black mb-3">
                    Meu Carrinho
                  </h2>

                  <p className="text-zinc-400">
                    Veja os produtos adicionados e finalize sua compra.
                  </p>
                </div>
              </a>

              <a
                href="/order"
                className="neon-card rounded-3xl p-8 hover:scale-[1.02] transition relative overflow-hidden group"
              >
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-5xl mb-4">⚡</p>

                    <span className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 px-3 py-1 rounded-full text-xs font-black">
                      Em andamento
                    </span>
                  </div>

                  <h2 className="text-4xl font-black mb-3">
                    Último Pedido
                  </h2>

                  <p className="text-zinc-400">
                    Acompanhe pagamento, entrega e conteúdo liberado.
                  </p>
                </div>
              </a>

              <a
                href="/"
                className="neon-card rounded-3xl p-8 hover:scale-[1.02] transition relative overflow-hidden group"
              >
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-600/10 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-5xl mb-4">🔥</p>

                    <span className="bg-pink-500/10 border border-pink-500/40 text-pink-300 px-3 py-1 rounded-full text-xs font-black">
                      Novidades
                    </span>
                  </div>

                  <h2 className="text-4xl font-black mb-3">
                    Continuar Comprando
                  </h2>

                  <p className="text-zinc-400">
                    Volte para a loja e descubra novos produtos digitais.
                  </p>
                </div>
              </a>
            </div>

            <div className="neon-card rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full"></div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-purple-300 font-black tracking-[0.25em] text-xs mb-2">
                      ESTATÍSTICAS
                    </p>

                    <h2 className="text-4xl font-black glitch-text">
                      Atividade da conta
                    </h2>
                  </div>

                  <span className="bg-green-500/10 border border-green-500/40 text-green-300 px-4 py-2 rounded-full text-sm font-black">
                    Conta ativa
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Pedidos finalizados
                    </p>

                    <h3 className="text-4xl font-black text-purple-300 mt-3">
                      12
                    </h3>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Produtos adquiridos
                    </p>

                    <h3 className="text-4xl font-black text-pink-300 mt-3">
                      24
                    </h3>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Tempo de cliente
                    </p>

                    <h3 className="text-4xl font-black text-green-300 mt-3">
                      2Y
                    </h3>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                    <p className="text-zinc-500 text-sm">
                      Reputação
                    </p>

                    <h3 className="text-4xl font-black text-yellow-300 mt-3">
                      4.9
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
