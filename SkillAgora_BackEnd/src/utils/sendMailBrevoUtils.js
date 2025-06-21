import brevo from "@getbrevo/brevo";
import "dotenv/config";
import generateErrorsUtils from "./generateErrorsUtils.js";

// Configurar API KEY y remitente
const { SMTP_API_KEY, SMTP_USER } = process.env;

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, SMTP_API_KEY);

// Función para enviar correo con Brevo
const sendMailBrevoUtils = async (email, subject, body) => {
  console.log("📤 Preparando para enviar correo a:", email);

  try {
    const sendSmtpMail = new brevo.SendSmtpEmail();

    sendSmtpMail.subject = subject;
    sendSmtpMail.to = [{ email }];
    sendSmtpMail.htmlContent = body;
    sendSmtpMail.sender = {
      email: SMTP_USER,
      name: "SkillAgora" // puedes cambiar el nombre si quieres
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpMail);
    console.log("✅ Correo enviado correctamente:", result);

  } catch (error) {
    console.error("❌ Error al enviar el correo electrónico a Brevo:");
    if (error.response?.body) {
      console.error("Respuesta del servidor:", JSON.stringify(error.response.body, null, 2));
    } else {
      console.error("Mensaje de error:", error.message || error);
    }

    throw generateErrorsUtils("Error al enviar el correo electrónico", 500);
  }
};

export default sendMailBrevoUtils;

