import dotenv from "dotenv";
import express from "express";
import errorHandler from "./errors/errorHandler.js";
import authMiddleware from "./middleware/authMiddleware.js";
import cors from "cors";
import fileUpload from "express-fileupload";

import routes from "./router/index.js";
// Importar dependencias
const server = express();

// Configurar CORS para permitir solicitudes desde cualquier origen
server.use(cors());
// Configurar el servidor para que pueda recibir datos en formato JSON
server.use(express.json());
// Configurar el servidor para que pueda recibir archivos
server.use(
	fileUpload({
		limits: { fileSize: 50 * 1024 * 1024 },
		abortOnLimit: true,
		responseOnLimit: "archvo demadiado grande",
		safeFileNames: true,
		preserveExtension: true,
	})
);

// Middleware para servir archivos estáticos
server.use("/uploads", express.static("src/uploads"));

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Ruta de prueba
server.get("/", (req, res) => {
	res.send("¡Servidor funcionando!");
});

// Middleware de Verificación de Autenticación
server.get("/protected", authMiddleware, (req, res) => {
	res.send("Acceso a ruta protegida, usuario autenticado.");
});

// Importar las rutas del router principal
server.use(routes);

// Implementar Middleware 404
server.use((req, res, next) => {
	res.status(404).json({ message: "Ruta no encontrada" });
});
// Middleware de gestión de errores importado
server.use(errorHandler);

export default server;
