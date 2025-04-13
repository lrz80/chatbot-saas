require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const twilio = require("twilio");
const OpenAI = require("openai"); // Correcto para OpenAI v1.65.0
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const FREE_PLAN_LIMIT = 500;

require("dotenv").config();
console.log("OpenAI API Key cargada:", process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a PostgreSQL
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Configurar Twilio
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Configurar OpenAI correctamente con la nueva versión
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ruta para el chatbot
app.post("/chatbot", async (req, res) => {
    try {
      const { mensaje, tenant_id } = req.body;
  
      if (!mensaje || !tenant_id) {
        return res.status(400).json({ error: "Mensaje y tenant_id son requeridos." });
      }
  
      // 1. Verificar plan del negocio
      const tenantRes = await db.query("SELECT plan FROM tenants WHERE id = $1", [tenant_id]);
      const plan = tenantRes.rows[0]?.plan || "free";
  
      // 2. Si es plan gratuito, verificar límite mensual
      if (plan === "free") {
        const countRes = await db.query(
          `SELECT COUNT(*) FROM messages
           WHERE tenant_id = $1 AND sender = 'user'
           AND timestamp >= date_trunc('month', CURRENT_DATE)`,
          [tenant_id]
        );
  
        const usados = parseInt(countRes.rows[0].count);
        if (usados >= FREE_PLAN_LIMIT) {
          return res.status(403).json({
            error: "Límite mensual alcanzado para el plan gratuito.",
          });
        }
      }
  
      // 3. Generar respuesta con OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Eres un asistente útil" },
          { role: "user", content: mensaje }
        ]
      });
  
      const respuestaBot = response.choices[0].message.content;
  
      // 4. Guardar ambos mensajes
      await db.query(
        "INSERT INTO messages (tenant_id, sender, content) VALUES ($1, 'user', $2)",
        [tenant_id, mensaje]
      );
      await db.query(
        "INSERT INTO messages (tenant_id, sender, content) VALUES ($1, 'bot', $2)",
        [tenant_id, respuestaBot]
      );
  
      res.json({ respuesta: respuestaBot });
  
    } catch (error) {
      console.error("Error en /chatbot:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });  

// Webhook para mensajes de Twilio
app.post("/webhook", async (req, res) => {
    const incomingMsg = req.body.Body;
    const from = req.body.From;

    try {
        // Buscar el tenant asociado (en este ejemplo lo hacemos por número)
        const toNumber = req.body.To; // número Twilio que recibió el mensaje

        const tenantRes = await db.query(
            "SELECT id FROM tenants WHERE twilio_number = $1",
            [toNumber]
        );

        const tenant_id = tenantRes.rows[0]?.id;

        if (!tenant_id) return res.sendStatus(404);

        // Guardar mensaje del cliente
        await db.query(
            "INSERT INTO messages (tenant_id, sender, content) VALUES ($1, $2, $3)",
            [tenant_id, "user", incomingMsg]
        );

        // Obtener respuesta del bot (OpenAI)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente amable." },
                { role: "user", content: incomingMsg },
            ],
        });

        const botResponse = response.choices[0].message.content;

        // Guardar mensaje del bot
        await db.query(
            "INSERT INTO messages (tenant_id, sender, content) VALUES ($1, $2, $3)",
            [tenant_id, "bot", botResponse]
        );

        // Responder al cliente vía Twilio
        res.set("Content-Type", "text/xml");
        res.send(`
            <Response>
              <Message>${botResponse}</Message>
            </Response>
        `);
    } catch (error) {
        console.error("Error en webhook:", error);
        res.status(500).send("Error en el webhook");
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000");
});
