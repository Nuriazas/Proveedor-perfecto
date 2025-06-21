import randomstring from "randomstring"; 
import selectUserByEmailService from "../../services/usersServices/selectUserByEmailService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import updateForgotPassCodeService from "../../services/usersServices/updateForgotPassCodeService.js";
import sendMailBrevoUtils from "../../utils/sendMailBrevoUtils.js"; // ✅ función para enviar correos

const sendForgotPassCodeController = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw generateErrorsUtils('Se requiere un email', 400);
    }

    // Buscar al usuario por email
    const user = await selectUserByEmailService(email);

    if (!user) {
      throw generateErrorsUtils('El usuario no existe', 404);
    }

    // Generar un código de recuperación aleatorio
    const recoverPassCode = randomstring.generate({
      length: 6,
      charset: 'numeric'
    });

    // Guardar el código en la base de datos
    await updateForgotPassCodeService(email, recoverPassCode);

    // Enviar correo con el código
    await sendMailBrevoUtils(
      email,
      "Tu código de recuperación de contraseña",
      `<p>Tu código de recuperación es: <strong>${recoverPassCode}</strong></p>`
    );

    // Respuesta
    res.send({
      status: 'ok',
      message: 'Código de recuperación enviado correctamente. Revisa tu correo.'
    });

  } catch (error) {
    next(error);
  }
};

export default sendForgotPassCodeController;


