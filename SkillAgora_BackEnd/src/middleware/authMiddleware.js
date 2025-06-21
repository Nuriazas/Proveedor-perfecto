// Importamos la librería para manejar tokens JWT (JSON Web Tokens)
import jwt from "jsonwebtoken";

// Middleware de autenticación - verifica si el usuario tiene un token válido
const authMiddleware = (req, res, next) => {
	// ✅ DEBUG COMPLETO
	console.log("🔧 MIDDLEWARE - req.headers:", req.headers);
	console.log("🔧 MIDDLEWARE - authorization header:", req.headers["authorization"]);
	
	// Extraemos el token del header 'Authorization' (formato: "Bearer token123")
	const token = req.headers["authorization"]?.split(" ")[1];
	
	console.log("🔧 MIDDLEWARE - token extraído:", token ? `${token.substring(0, 20)}...` : "AUSENTE");

	// Verificamos si se envió un token
	if (!token) {
		console.log("❌ MIDDLEWARE - No se proporcionó token");
		return res.status(401).json({
			message: "Acceso denegado. No se proporcionó token.",
		});
	}

	try {
		// Verificamos que el token sea válido usando la clave secreta
		console.log("🔧 MIDDLEWARE - JWT_SECRET:", process.env.JWT_SECRET ? "✅ Presente" : "❌ AUSENTE");
		
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		
		console.log("🔧 MIDDLEWARE - Token verificado:", verified);

		// Si es válido, guardamos la info del usuario en req.user
		req.user = verified;
		
		console.log("🔧 MIDDLEWARE - req.user seteado:", req.user);

		// Continuamos al siguiente middleware o controlador
		next();
	} catch (error) {
		console.error("❌ MIDDLEWARE - Error verificando token:", error);
		// Si el token no es válido, devolvemos error 400
		return res.status(400).json({
			message: "Token no válido.",
		});
	}
};

export default authMiddleware;