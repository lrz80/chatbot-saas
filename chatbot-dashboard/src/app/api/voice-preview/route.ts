import { NextRequest } from "next/server";
import { twiml } from "twilio";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const voice = formData.get("voice")?.toString() ?? "alice";
  const language = formData.get("language")?.toString() ?? "es-ES";

  const response = new twiml.VoiceResponse();

  const testText =
    language === "en-US"
      ? "Hi! This is a preview using the selected voice."
      : "Hola, esta es una demostración de la voz seleccionada.";

  if (process.env.NODE_ENV !== "production") {
    console.log("🧪 Enviando preview con voz:", voice, "| idioma:", language);
  }

  response.say(
    { voice: voice as any, language: language as any },
    `${testText} Voice: ${voice.replace("Polly.", "")}.`
  );

  response.say(
    { voice: "alice", language: "es-ES" },
    "Gracias por probar la voz. Hasta pronto."
  );

  return new Response(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

