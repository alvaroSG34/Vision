import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
]);

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La transcripción con OpenAI no está configurada." },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Se requiere un archivo de audio." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "La respuesta no contiene audio." }, { status: 400 });
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "La respuesta supera el límite de 10 MB." },
        { status: 413 },
      );
    }
    const normalizedType = file.type.toLowerCase();
    const isAcceptedType = [...ACCEPTED_AUDIO_TYPES].some(
      (type) => normalizedType === type || normalizedType.startsWith(`${type};`),
    );
    if (!isAcceptedType) {
      return NextResponse.json({ error: "El formato de audio no es compatible." }, { status: 415 });
    }

    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
      language: "es",
    });
    const text = transcription.text.trim();

    if (!text) {
      return NextResponse.json({ error: "No se detectó texto en la respuesta." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Transcription request failed", error);
    return NextResponse.json(
      { error: "No fue posible transcribir la respuesta. Inténtalo nuevamente." },
      { status: 502 },
    );
  }
}
