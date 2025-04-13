import { NextRequest } from "next/server";
import { twiml } from "twilio";

export async function POST(req: NextRequest) {
  const response = new twiml.VoiceResponse();

  const gather = response.gather({
    input: ["speech", "dtmf"], // ✅ Arreglo correcto
    numDigits: 1,
    timeout: 5,
    language: "es-ES",
    action: "/api/voice-language-select",
  });

  gather.say(
    { voice: "alice", language: "es-ES" },
    "Para español, presione uno o diga uno. For English, press two or say two."
  );

  return new Response(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
