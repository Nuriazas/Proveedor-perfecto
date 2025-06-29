// Logger seguro que filtra automáticamente información sensible
const secureLogger = {
  // Función para sanitizar objetos y remover información sensible
  sanitize: (data) => {
    if (!data) return data;
    
    // Si es un string, verificar si contiene información sensible
    if (typeof data === 'string') {
      // Filtrar tokens JWT
      if (data.includes('eyJ') && data.length > 100) {
        return '[TOKEN_JWT_FILTRADO]';
      }
      // Filtrar emails
      if (data.includes('@') && data.includes('.')) {
        return '[EMAIL_FILTRADO]';
      }
      // Filtrar contraseñas (palabras clave comunes)
      const passwordKeywords = ['password', 'pass', 'pwd', 'contraseña', 'clave'];
      if (passwordKeywords.some(keyword => data.toLowerCase().includes(keyword))) {
        return '[PASSWORD_FILTRADO]';
      }
      return data;
    }
    
    // Si es un objeto, sanitizar recursivamente
    if (typeof data === 'object') {
      const sanitized = {};
      const sensitiveKeys = [
        'token', 'password', 'pass', 'pwd', 'secret', 'key', 'auth',
        'email', 'mail', 'contraseña', 'clave', 'jwt', 'authorization'
      ];
      
      for (const [key, value] of Object.entries(data)) {
        const isSensitiveKey = sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive)
        );
        
        if (isSensitiveKey) {
          sanitized[key] = '[INFORMACION_SENSIBLE_FILTRADA]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = secureLogger.sanitize(value);
        } else if (typeof value === 'string') {
          sanitized[key] = secureLogger.sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
    
    return data;
  },

  // Override del console.log para sanitizar automáticamente
  setupConsoleOverride: () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
      const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
      originalLog(...sanitizedArgs);
    };

    console.error = (...args) => {
      const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
      originalError(...sanitizedArgs);
    };

    console.warn = (...args) => {
      const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
      originalWarn(...sanitizedArgs);
    };

    console.info = (...args) => {
      const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
      originalInfo(...sanitizedArgs);
    };

    console.log('🔒 Console override activado - Información sensible será filtrada automáticamente');
  },

  // Log de peticiones HTTP
  request: (method, path, hasToken = false) => {
    console.log(`🌐 ${method} ${path} - Token: ${hasToken ? 'SÍ' : 'NO'}`);
  },

  // Log de autenticación
  auth: {
    success: (userId) => {
      console.log(`✅ Usuario autenticado - ID: ${userId}`);
    },
    failure: (reason) => {
      console.log(`❌ Autenticación fallida - ${reason}`);
    },
    tokenVerified: () => {
      console.log("🔧 Token verificado correctamente");
    }
  },

  // Log de cookies (automáticamente sanitizadas)
  cookies: {
    present: (cookies) => {
      const count = Object.keys(cookies || {}).length;
      console.log(`🍪 Cookies presentes: ${count > 0 ? 'SÍ' : 'NO'} (${count} total)`);
    },
    tokenPresent: (hasToken) => {
      console.log(`🔑 Token presente: ${hasToken ? 'SÍ' : 'NO'}`);
    },
    // Log seguro de cookies (filtra automáticamente)
    safe: (cookies) => {
      const sanitized = secureLogger.sanitize(cookies);
      console.log("🍪 Cookies (sanitizadas):", sanitized);
    }
  },

  // Log de headers (automáticamente sanitizados)
  headers: {
    safe: (headers) => {
      const sanitized = secureLogger.sanitize(headers);
      console.log("📋 Headers (sanitizados):", sanitized);
    }
  },

  // Log de body (automáticamente sanitizado)
  body: {
    safe: (body) => {
      const sanitized = secureLogger.sanitize(body);
      console.log("📦 Body (sanitizado):", sanitized);
    }
  },

  // Log de errores (sin información sensible)
  error: (message, error = null) => {
    if (error && error.message) {
      console.error(`❌ ${message}: ${error.message}`);
    } else {
      console.error(`❌ ${message}`);
    }
  },

  // Log de información general
  info: (message) => {
    console.log(`ℹ️ ${message}`);
  },

  // Log de éxito
  success: (message) => {
    console.log(`✅ ${message}`);
  },

  // Log seguro de cualquier objeto
  safe: (label, data) => {
    const sanitized = secureLogger.sanitize(data);
    console.log(`${label} (sanitizado):`, sanitized);
  }
};

export default secureLogger; 