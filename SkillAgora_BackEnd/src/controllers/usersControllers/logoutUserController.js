// Controlador para manejar el cierre de sesión de un usuario
const logoutUserController = (req, res) => {
  try {
    // Configurar las opciones de la cookie para limpiarla
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      path: '/',
      maxAge: 0, // Expirar inmediatamente
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    };

    // Limpiar la cookie del token
    res.clearCookie("token", cookieOptions);
    
    res.send({ 
      status: "ok", 
      message: "Logout exitoso" 
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error durante el logout"
    });
  }
};

export default logoutUserController; 