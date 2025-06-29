import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import selectUserByEmailService from "../../services/usersServices/selectUserByEmailService.js";
import secureLogger from "../../utils/secureLogger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Controlador para manejar el inicio de sesión de un usuario
const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Log seguro del intento de login (sin exponer credenciales)
    secureLogger.info(
      `Intento de login para usuario: ${
        email ? "[EMAIL_FILTRADO]" : "NO_PROPORCIONADO"
      }`
    );

    // Validar que se proporcionen email y password
    if (!email || !password)
      throw generateErrorsUtils("Faltan datos, email y password", 400);

    const user = await selectUserByEmailService(email);

    // Verificar si el usuario existe y si la contraseña es correcta
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!user || !isPasswordValid) {
      secureLogger.auth.failure("Credenciales incorrectas");
      throw generateErrorsUtils("Email o contraseña incorrectos", 401);
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      secureLogger.auth.failure("Usuario inactivo");
      throw generateErrorsUtils("Usuario inactivo", 403);
    }

    // Si las credenciales son correctas, generar un token JWT
    const tokenInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      is_admin: user.is_admin,
    };

    // Firmar el token con la clave secreta y establecer una expiración
    const token = jwt.sign(tokenInfo, process.env.JWT_SECRET, {
      expiresIn: "7d", // El token expirará en 7 días
    });

    // Configurar la cookie con el token
    const cookieOptions = {
      httpOnly: process.env.NODE_ENV === "production", // Solo httpOnly en producción
      secure: process.env.NODE_ENV === "production", // HTTPS solo en producción
      sameSite: "Lax", // Más permisivo para desarrollo
      path: "/", // El token estará disponible en todas las rutas
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
    };

    secureLogger.info("Configurando cookie de autenticación");
    secureLogger.info("Token generado correctamente");

    res.cookie("token", token, cookieOptions);

    secureLogger.success("Cookie establecida correctamente");
    secureLogger.auth.success(user.id);

    res.send({
      status: "ok",
      message: "login correcto",
      token: process.env.NODE_ENV === "development" ? token : undefined, // Solo en desarrollo
    });
  } catch (error) {
    secureLogger.error("Error en login", error);
    next(error);
  }
};

export default loginUserController;
