import randomstring from "randomstring"; 
import selectUserByEmailService from "../../services/usersServices/selectUserByEmailService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import updateForgotPassCodeService from "../../services/usersServices/updateForgotPassCodeService.js";


// Este controlador maneja la solicitud de envío del código de recuperación de contraseña
const sendForgotPassCodeController = async (req, res, next) => {
    try {
       
        const { email } = req.body;
         // Validar que se proporcione el email
         if (!email) {
            throw generateErrorsUtils('Se requiere un email', 400);
        }
        // Si no se proporciona el email, lanzar un error
        const user = await selectUserByEmailService(email);
        
        if (!user) {
            throw generateErrorsUtils('El usuario no existe', 404);
        }
        // Generar un código de recuperación aleatorio
        const recoverPassCode = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
        // Actualizar el código de recuperación en la base de datos
       
        await updateForgotPassCodeService(email, recoverPassCode);
        
        res.send({
            status: 'ok',
            message: 'Código de recuperación enviado correctamente. Revisa tu correo.'
        });
        
    } catch (error) {
        next(error);
    }

}
export default sendForgotPassCodeController;
