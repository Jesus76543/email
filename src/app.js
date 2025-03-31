import express from "express";
import emailRoutes from "./routes/emailRoutes.js";
import { listenForEmails } from "./services/rabbitServiceEvent.js"; // Asegurar que el nombre del import es correcto

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas de la API
app.use('/api/email', emailRoutes);

// Iniciar escucha de eventos en RabbitMQ
listenForEmails().catch((err) => {
    console.error("❌ Error al iniciar RabbitMQ:", err);
});

export default app;
