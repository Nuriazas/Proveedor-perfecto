import randomstring from "randomstring";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import insertUserService from "../../services/usersServices/insertUserService.js";
import {savePhotoUtils} from "../../utils/photoUtils.js";

const registerUserController = async (req, res, next) => {
	

		try {
			const { email, password, firstName, lastName} = req.body;
			console.log(
			`Depuración recibo de email por req.body en el endpoint register: ${email}`
		);
			// Validar que se proporcionen email y password
			if (!email || !password || !firstName || !lastName)
				throw generateErrorsUtils("Faltan campos obligatorios", 400);
			let avatar = null;
			if(req.files && req.files.avatar) {
				const avatarFile = req.files.avatar;
				avatar = await savePhotoUtils(avatarFile.data, "avatars")
			}
			// Generar un código de registro aleatorio
			const registrationCode = randomstring.generate({
				length: 15,
				charset: "alphanumeric",
			});

			await insertUserService(email, password, registrationCode, firstName, lastName);

			res.send({
				status: "ok",
				message:
					"Usuario registrado correctamente. Revisa tu correo para activar tu cuenta.",
			});
		} catch (error) {
			next(error);
		}

		
};
export default registerUserController;
