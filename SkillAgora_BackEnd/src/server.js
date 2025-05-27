import dotenv from "dotenv";
import express from "express";
import errorHandler from "./errors/errorHandler.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Importar dependencias
const server = express();

// Configurar el servidor para que pueda recibir datos en formato JSON
server.use(express.json());

// Middleware para servir archivos estáticos (imágenes en /public)
server.use('/public', express.static('public'));

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Ruta de prueba
server.get("/", (req, res) => {
	res.send("¡Servidor funcionando!");
});

// Implementar Middleware 404
server.use((req, res, next) => {
	res.status(404).json({ message: "Ruta no encontrada" });
});

// Middleware de gestión de errores importado
server.use(errorHandler);

// Middleware de Verificación de Autenticación
server.get("/protected", authMiddleware, (req, res) => {
    res.send("Acceso a ruta protegida, usuario autenticado.");
});

export default server;
