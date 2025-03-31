import transporter from "../config/emailConfig.js";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async ({ to, subject, text, name, message, isNewClient = false }) => {
    try {
        let emailSubject = subject;
        let emailMessage = message;
        let emailTemplate = "plantilla";
        
        // Si es un cliente nuevo, personalizar el email
        if (isNewClient) {
            emailSubject = "¡Bienvenido a nuestro sistema de clientes!";
            emailMessage = `Gracias por registrarte como cliente en nuestro sistema. 
                          Hemos creado automáticamente una cuenta de usuario para ti.
                          Tu nombre de usuario es tu correo electrónico.`;
        }
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: emailSubject,
            text: text || emailMessage,  
            template: emailTemplate, 
            context: { 
                name: name || to, 
                message: emailMessage,
                email: process.env.EMAIL_USER
            }
        });

        console.log(`Email enviado a ${to}`);
        return { message: "Email enviado" };
    } catch (error) {
        console.error("Error enviando email:", error);
        throw new Error("Error enviando email: " + error.message);
    }
};
