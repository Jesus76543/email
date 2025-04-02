import amqp from "amqplib";
import dotenv from "dotenv";
import { sendEmail } from "../controllers/emailController.js"; 

dotenv.config();

const USER_QUEUE = "user_create_queue";
const CLIENT_EXCHANGE = "cliente_event";
const CLIENT_ROUTING_KEY = "cliente.created";
const CLIENT_QUEUE = "cliente_email_queue";

export const listenForEmails = async () => {
    try {
        // Conexión con configuración actualizada
        const connection = await amqp.connect(process.env.RABBITMQ_URL); // Usar RABBITMQ_URL
        const channel = await connection.createChannel();

        // Configurar cola para usuarios
        await channel.assertQueue(USER_QUEUE, { durable: true });
        
        // Configurar exchange y cola para clientes
        await channel.assertExchange(CLIENT_EXCHANGE, "topic", { durable: true });
        await channel.assertQueue(CLIENT_QUEUE, { durable: true });
        await channel.bindQueue(CLIENT_QUEUE, CLIENT_EXCHANGE, CLIENT_ROUTING_KEY);

        console.log(`Esperando mensajes en ${USER_QUEUE} y ${CLIENT_QUEUE}...`);
        
        // Consumir mensajes de usuarios
        channel.consume(
            USER_QUEUE,
            async (msg) => {
                if (msg !== null) {
                    try {
                        const emailData = JSON.parse(msg.content.toString());
                        console.log("Nuevo usuario registrado:", emailData);

                        // Datos para el email
                        const emailInfo = {
                            to: emailData.username,
                            subject: "¡Bienvenido a nuestro servicio!",
                            text: `Hola,\n\nGracias por registrarte en nuestro servicio. ¡Esperamos que disfrutes de la experiencia!\n\nSaludos, El equipo.`,
                            name: emailData.username,
                            message: "Te damos la bienvenida a nuestro sistema."
                        };

                        await sendEmail(emailInfo);
                        console.log(`📨 Correo enviado a ${emailData.username}`);
                        
                        channel.ack(msg);
                    } catch (error) {
                        console.error("❌ Error al procesar el mensaje de usuario:", error.message);
                        channel.nack(msg, false, false);
                    }
                }
            },
            { noAck: false }
        );
        
        // Consumir mensajes de clientes
        channel.consume(
            CLIENT_QUEUE,
            async (msg) => {
                if (msg !== null) {
                    try {
                        const clienteData = JSON.parse(msg.content.toString());
                        console.log("Nuevo cliente registrado:", clienteData);

                        // Datos para el email de cliente
                        const emailInfo = {
                            to: clienteData.username, // Email del cliente
                            subject: "¡Bienvenido como nuevo cliente!",
                            text: `Hola,\n\nGracias por registrarte como cliente en nuestro sistema. Se ha creado automáticamente una cuenta de usuario para ti.\n\nSaludos, El equipo.`,
                            name: clienteData.username,
                            message: "¡Gracias por convertirte en cliente! Hemos creado automáticamente un usuario para ti.",
                            isNewClient: true
                        };

                        await sendEmail(emailInfo);
                        console.log(`📨 Correo de bienvenida de cliente enviado a ${clienteData.username}`);
                        
                        channel.ack(msg);
                    } catch (error) {
                        console.error("❌ Error al procesar el mensaje de cliente:", error.message);
                        channel.nack(msg, false, false);
                    }
                }
            },
            { noAck: false }
        );

        connection.on("close", () => {
            console.error("Conexión cerrada, reintentando en 5 segundos...");
            setTimeout(listenForEmails, 5000);
        });
    } catch (error) {
        console.error("Error conectando a RabbitMQ:", error.message);
        console.log("🔄 Reintentando en 5 segundos...");
        setTimeout(listenForEmails, 5000);
    }
};

// Iniciar la escucha de eventos al cargar el servicio
listenForEmails();
