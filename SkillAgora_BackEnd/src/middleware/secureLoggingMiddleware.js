import secureLogger from "../utils/secureLogger.js";

// Middleware que intercepta y sanitiza automáticamente los logs
const secureLoggingMiddleware = (req, res, next) => {
  // Log de la petición de forma segura
  secureLogger.request(req.method, req.path, !!req.cookies?.token);
  
  // Log de cookies de forma segura
  secureLogger.cookies.present(req.cookies);
  
  // Log de headers de forma segura (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    secureLogger.headers.safe(req.headers);
  }
  
  // Log de body de forma segura (solo en desarrollo y para métodos que lo usan)
  if (process.env.NODE_ENV === 'development' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    secureLogger.body.safe(req.body);
  }
  
  next();
};

export default secureLoggingMiddleware; 