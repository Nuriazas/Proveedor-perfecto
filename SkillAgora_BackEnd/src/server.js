import dotenv from "dotenv";
import express from "express";
import errorHandler from "./errors/errorHandler.js";
import authMiddleware from "./middleware/authMiddleware.js";
import secureLoggingMiddleware from "./middleware/secureLoggingMiddleware.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";	
import secureLogger from "./utils/secureLogger.js";

import routes from "./router/index.js";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Activar override del console.log para sanitizar automáticamente
secureLogger.setupConsoleOverride();

console.log("🌍 Entorno:", process.env.NODE_ENV);
console.log("🔗 Frontend URL:", process.env.FRONTEND_URL || "http://localhost:5173");

// Importar dependencias
const server = express();

// Configurar CORS para permitir solicitudes desde el frontend
const corsOptions = {
	origin: process.env.FRONTEND_URL || "http://localhost:5173", 
	credentials: true, // Permitir el envío de cookies
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type', 
		'Authorization', 
		'X-Requested-With',
		'Cache-Control',
		'Accept',
		'Origin',
		'X-Requested-With',
		'Pragma',
		'Expires' 
	],
	exposedHeaders: ['Set-Cookie']
};

console.log("🔧 Configuración CORS:", corsOptions);

server.use(cors(corsOptions));

server.use(cookieParser()); // Middleware para parsear cookies

// Middleware de logging seguro (reemplaza el logging manual)
server.use(secureLoggingMiddleware);

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

// Ruta de prueba
server.get("/", (req, res) => {
	res.send("¡Servidor funcionando!");
});

// Ruta de prueba para cookies
server.get("/test-cookie", (req, res) => {
	console.log("🍪 Test cookie endpoint");
	console.log("🍪 Cookies presentes:", Object.keys(req.cookies || {}).length > 0 ? "SÍ" : "NO");
	res.cookie("test", "cookie-value", {
		httpOnly: true,
		secure: false,
		sameSite: "Lax",
		path: '/',
		maxAge: 60 * 60 * 1000
	});
	res.json({ 
		message: "Cookie de prueba establecida",
		cookiesCount: Object.keys(req.cookies || {}).length
	});
});

// Ruta para verificar estado de autenticación
server.get("/auth-status", (req, res) => {
	console.log("🔍 Verificando estado de autenticación");
	console.log("🍪 Cookies presentes:", Object.keys(req.cookies || {}).length > 0 ? "SÍ" : "NO");
	console.log("🔑 Token presente:", !!req.cookies?.token ? "SÍ" : "NO");
	
	res.json({
		authenticated: !!req.cookies?.token,
		cookiesCount: Object.keys(req.cookies || {}).length,
		hasToken: !!req.cookies?.token
	});
});

// Ruta de prueba para contact request sin autenticación
server.post("/test-contact-request", (req, res) => {
	console.log("🧪 Test contact request");
	console.log("🍪 Cookies presentes:", Object.keys(req.cookies || {}).length > 0 ? "SÍ" : "NO");
	console.log("📋 Body recibido:", Object.keys(req.body || {}).length > 0 ? "SÍ" : "NO");
	console.log("🔑 Token presente:", !!req.cookies?.token ? "SÍ" : "NO");
	
	res.json({
		message: "Test contact request recibido",
		cookiesCount: Object.keys(req.cookies || {}).length,
		hasToken: !!req.cookies?.token,
		bodyReceived: Object.keys(req.body || {}).length > 0
	});
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
