import selectUserByIdService from "../../services/usersServices/selectUserByIdService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Controlador para obtener el perfil del usuario autenticado
const getCurrentUserProfileController = async (req, res, next) => {
  try {
    // El usuario ya está autenticado por el middleware authMiddleware
    // req.user contiene la información del token JWT
    const userId = req.user.id;
    
    console.log("🔍 Obteniendo perfil para usuario ID:", userId);
    
    if (!userId) {
      throw generateErrorsUtils("Usuario no autenticado", 401);
    }
    
    // Llamamos al servicio para obtener el perfil del usuario
    const userProfile = await selectUserByIdService(userId);
    
    if (!userProfile) {
      throw generateErrorsUtils("Perfil de usuario no encontrado", 404);
    }
    
    // Devolvemos el perfil del usuario
    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export default getCurrentUserProfileController; 