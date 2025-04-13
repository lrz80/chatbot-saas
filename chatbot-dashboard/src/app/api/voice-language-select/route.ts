// src/app/api/voice-language-select/route.ts
import { NextRequest } from "next/server";
import { twiml } from "twilio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const digits = formData.get("Digits")?.toString();
  const speechRaw = formData.get("SpeechResult");
  const speech = typeof speechRaw === "string" ? speechRaw.toLowerCase() : "";

  let language = "es-ES";
  if (digits === "2" || speech.includes("two")) {
    language = "en-US";
  }

  const response = new twiml.VoiceResponse();
  response.redirect({ method: "POST" }, `/api/voice-main?lang=${language}`);

  return new Response(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
