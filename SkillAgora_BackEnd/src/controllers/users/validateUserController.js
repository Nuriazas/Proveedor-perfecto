import updateUserRegCodeService from '../../services/users/updateUserRegCodeService.js';



// Controlador para validar un usuario mediante su código de registro
const validateUserController = async (req, res, next) => {


    // Este controlador recibe el código de registro del usuario desde la URL
    try {

        const { registrationCode } = req.params;


        // Validar que se proporcione un código de registro
        if (!registrationCode) {
            throw new Error('Código de registro no proporcionado');
        }

        // Llamar al servicio para actualizar el código de registro del usuario
        await updateUserRegCodeService(registrationCode);
        res.send({
            status: 'ok',
            message: 'Usuario validado correctamente. Ahora puedes iniciar sesión.'
        });
    } catch (error) {
        next(error);
    }
}

export default validateUserController;