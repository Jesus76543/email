import express from "express";
import { sendEmail } from "../controllers/emailController.js";

const router = express.Router();

router.post("/send", async (req, res) => {
    try {
        const { to, subject, text, name, message } = req.body;
        await sendEmail({ to, subject, text, name, message });
        res.json({ message: "Email enviado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el email", error: error.message });
    }
});

export default router;
