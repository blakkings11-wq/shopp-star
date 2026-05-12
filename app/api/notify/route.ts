import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API notify funcionando",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const BOT_TOKEN = "8635354957:AAHdzDoNkhprFw21ufvDO44MTUAQ0CxSIa0"; // seu token completo
    const CHAT_ID = "7482901893"; // seu chat id

    const message = `
🛒 NOVO PEDIDO!

👤 Cliente: ${body.name}
📧 Email: ${body.email}
💰 Total: R$ ${body.total}

📦 Pedido: ${body.order_code}
`;

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      }
    );

    const result = await response.json();

    console.log("TELEGRAM RESULT:", result);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.log("ERRO TELEGRAM:", error);

    return NextResponse.json(
      { success: false, error: "Erro ao enviar Telegram" },
      { status: 500 }
    );
  }
}