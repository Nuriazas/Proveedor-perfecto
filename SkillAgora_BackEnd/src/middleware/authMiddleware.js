import jwt from "jsonwebtoken";

// Middleware para verificar el token JWT
const authMiddleware = (req, res, next) => {
	// Obtener el token del encabezado de autorización
	const token = req.headers["authorization"]?.split(" ")[1];

	if (!token) {
		return res
			.status(401)
			.json({ message: "Acceso denegado. No se proporcionó token." });
	}

	try {
		// Verificar el token
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified; // Almacenar la información del usuario en la solicitud
		console.log("TOKEN VERIFICADO:", verified);
		next(); // Continuar con la siguiente función de middleware
	} catch (error) {
		return res.status(400).json({ message: "Token no válido." });
	}
};

export default authMiddleware;
