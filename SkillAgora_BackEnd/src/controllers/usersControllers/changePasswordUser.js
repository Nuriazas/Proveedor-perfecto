import changePasswordsService from "../../services/usersServices/changePasswordsService.js";
import  errorHandler  from "../../errors/errorHandler.js";

const changePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validar que los campos requeridos estén presentes
        if (!currentPassword || !newPassword) {
            const error = new Error("Se requieren la contraseña actual y la nueva contraseña");
            error.statusCode = 400;
            throw error;
        }

        await changePasswordsService(userId, currentPassword, newPassword);

        res.status(200).json({
            success: true,
            message: "Contraseña actualizada exitosamente",
            data: null
        });
    } catch (error) {
        errorHandler(error, res);
    }
};

// Controlador que maneja la petición de cambio de contraseña:
// 1. Recibe la petición HTTP con las contraseñas
// 2. Valida que los campos requeridos estén presentes
// 3. Obtiene el ID del usuario del token JWT
// 4. Llama al servicio para procesar el cambio
// 5. Devuelve respuesta de éxito o error

export default changePasswordController;
