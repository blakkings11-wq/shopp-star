import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopp Star",
  description: "Loja gamer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-purple-500/40 selection:text-white`}
      >
        {/* BACKGROUND CYBER GLOBAL */}
        <div className="fixed inset-0 -z-50 overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(168,85,247,0.28),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.20),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.14),transparent_36%)]" />

          <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(115deg,transparent_0%,rgba(168,85,247,0.35)_45%,transparent_55%)] animate-[scan_7s_linear_infinite]" />

          <div className="absolute w-[600px] h-[600px] bg-purple-600 opacity-25 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite] top-[-180px] left-[-160px]" />

          <div className="absolute w-[520px] h-[520px] bg-pink-600 opacity-20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite] bottom-[-160px] right-[-150px]" />

          <div className="absolute w-[380px] h-[380px] bg-violet-500 opacity-20 rounded-full blur-3xl animate-[float_9s_ease-in-out_infinite] top-[45%] left-[58%]" />

          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_25px_rgba(168,85,247,0.9)]" />
        </div>

        {/* GLOW FIXO DE TOPO */}
        <div className="fixed top-0 left-0 right-0 h-1 z-[999999] bg-gradient-to-r from-purple-600 via-pink-500 to-violet-500 shadow-[0_0_25px_rgba(168,85,247,0.9)]" />

        {/* SITE */}
        <div className="relative z-10 min-h-screen animate-[pageFade_0.45s_ease-out]">
          {children}
        </div>

        <style>{`
          html {
            scroll-behavior: smooth;
          }

          body {
            overflow-x: hidden;
          }

          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: #050006;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #9333ea, #ec4899);
            border-radius: 999px;
            border: 2px solid #050006;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #a855f7, #f472b6);
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px) scale(1);
            }
            50% {
              transform: translateY(-24px) translateX(16px) scale(1.05);
            }
          }

          @keyframes scan {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(120%);
            }
          }

          @keyframes pageFade {
            0% {
              opacity: 0;
              transform: translateY(10px);
              filter: blur(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }

          a, button {
            -webkit-tap-highlight-color: transparent;
          }

          button:active,
          a:active {
            transform: scale(0.98);
          }
        `}</style>
      </body>
    </html>
  );
}
