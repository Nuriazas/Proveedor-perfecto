import selectUserById from "../../services/usersServices/selectUserById.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";



// Controlador para obtener el perfil de un usuario por ID
const getProfile = async (req, res, next) => {

  
  try {
      // Extraemos el ID del usuario de los parámetros de la solicitud
    
    const nameQuery = req.params.name;
    
    // Si no se proporciona un ID de usuario, lanzamos un error
    if (!nameQuery) {
      throw generateErrorsUtils("Se requiere el nombre del usuario", 400);
    }
    // Llamamos al servicio para obtener el perfil del usuario
    const userProfile = await selectUserById(nameQuery);
    // Si no se encuentra el perfil del usuario, lanzamos un error
    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export default getProfile;