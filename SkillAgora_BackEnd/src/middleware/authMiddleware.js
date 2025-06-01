// Importamos la librería para manejar tokens JWT (JSON Web Tokens)
import jwt from 'jsonwebtoken';

// Middleware de autenticación - verifica si el usuario tiene un token válido
const authMiddleware = (req, res, next) => {
    
    // Extraemos el token del header 'Authorization' (formato: "Bearer token123")
    // Split nos ayuda a separar "Bearer" del token real
    const token = req.headers['authorization']?.split(' ')[1];

    // Verificamos si se envió un token
    if (!token) {
        // Si no hay token, denegamos el acceso con error 401
        return res.status(401).json({ 
            message: 'Acceso denegado. No se proporcionó token.' 
        });
    }

    try {
        // Verificamos que el token sea válido usando la clave secreta
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Si es válido, guardamos la info del usuario en req.user
        // para que otros middlewares/controladores puedan usarla
        req.user = verified;

        // Continuamos al siguiente middleware o controlador
        next();
        
    } catch (error) {
        // Si el token no es válido, devolvemos error 400
        return res.status(400).json({ 
            message: 'Token no válido.' 
        });
    }
};

export default authMiddleware;

// ¿Qué hace este middleware?
// 1. Se ejecuta ANTES que los controladores
// 2. Verifica si hay un token en los headers de la petición
// 3. Valida que el token sea auténtico y no haya expirado
// 4. Si todo está bien, permite continuar al controlador
// 5. Si algo falla, bloquea la petición con error