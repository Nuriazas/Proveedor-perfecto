// Importamos la librería para manejar tokens JWT (JSON Web Tokens)
import jwt from "jsonwebtoken";
import secureLogger from "../utils/secureLogger.js";

// Middleware de autenticación - verifica si el usuario tiene un token válido
const authMiddleware = (req, res, next) => {
	
	secureLogger.request(req.method, req.path, !!req.cookies?.token);
	
	// Extraemos el token del header 'Authorization' (formato: "Bearer token123")
	const token = req.cookies?.token || null;
	
	if (!token) {
		secureLogger.auth.failure("No se encontró token en cookies");
		return res.status(401).json({
			message: "Acceso denegado. No se proporcionó token.",
		});
	}

	try {
		// Verificamos que el token sea válido usando la clave secreta
		secureLogger.info("Verificando token...");
		
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		
		secureLogger.auth.tokenVerified();

		// Si es válido, guardamos la info del usuario en req.user
		req.user = verified;
		
		secureLogger.auth.success(req.user.id);

		// Continuamos al siguiente middleware o controlador
		next();
	} catch (error) {
		secureLogger.error("Error verificando token", error);
		// Si el token no es válido, devolvemos error 400
		return res.status(400).json({
			message: "Token no válido.",
		});
	}
};

export default authMiddleware;