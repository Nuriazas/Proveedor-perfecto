import brevo from "@getbrevo/brevo";
import "dotenv/config";
import generateErrorsUtils from "./generateErrorsUtils.js";

// Configuración de Brevo
const { SMTP_API_KEY, SMTP_USER } = process.env;

// Verifica que las variables de entorno estén definidas
const apiInstance = new brevo.TransactionalEmailsApi();

// Configura la clave API de Brevo
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, SMTP_API_KEY);

// Función para enviar correos electrónicos utilizando Brevo
const sendMailBrevoUtils = async (email, subject, body) => {
	console.log(email);
	try {
		const sendSmtpMail = new brevo.SendSmtpEmail();
		sendSmtpMail.subject = subject;
		sendSmtpMail.to = [{ email: email }];

		sendSmtpMail.htmlContent = body;

		sendSmtpMail.sender = { email: SMTP_USER, name: "SkillAgora" };

		await apiInstance.sendTransacEmail(sendSmtpMail);
	} catch (error) {
		console.error("Error al enviar el correo electrónico a Brevo:");
		if (error.response && error.response.body) {
			console.error(
				`Respuets del servidor:`,
				JSON.stringify(error.response.body, null, 2)
			);
		} else {
			console.log(`Mensaje genérico:`, error.message || error);
		}

		throw generateErrorsUtils("Error al enviar el correo electrónico", 500);
		// console.log(error);
		// throw generateErrorsUtils('Error al enviar el correo electrónico', 500);
	}
};

export default sendMailBrevoUtils;
