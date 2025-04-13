import { twiml } from "twilio";

export async function POST() {
  const response = new twiml.VoiceResponse();

  const demos = [
    {
      voice: "Polly.Joanna",
      language: "en-US",
      text: "Hi, I'm Joanna. Thank you for calling. I sound quite natural, don't I?",
    },
    {
      voice: "Polly.Matthew",
      language: "en-US",
      text: "Hello, this is Matthew. I am a male voice speaking in American English.",
    },
    {
      voice: "Polly.Conchita",
      language: "es-ES",
      text: "Hola, soy Conchita. Gracias por llamar. ¿Qué puedo hacer por ti?",
    },
    {
      voice: "Polly.Miguel",
      language: "es-ES",
      text: "Buenos días. Mi nombre es Miguel. Estoy aquí para ayudarte.",
    },
    {
      voice: "Polly.Lupe",
      language: "es-MX",
      text: "Hola, soy Lupe. Estoy usando acento mexicano. ¿Te gusta cómo suena?",
    },
  ];

  demos.forEach(({ voice, language, text }) => {
    response.pause({ length: 1 });
    response.say(
      {
        voice: voice as any,
        language: language as any,
      },
      text
    );
  });

  response.say(
    { voice: "alice" as any, language: "es-ES" as any },
    "Gracias por probar las voces. ¡Hasta pronto!"
  );

  return new Response(response.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
