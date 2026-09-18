import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const hasConfiguredKey = Boolean(apiKey && apiKey !== "tu_clave_aqui");

  return NextResponse.json({
    provider: hasConfiguredKey ? "openai" : "web-speech",
  });
}
