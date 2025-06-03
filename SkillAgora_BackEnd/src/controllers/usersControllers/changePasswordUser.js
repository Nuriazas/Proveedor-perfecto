import changePasswordsService from "../../services/usersServices/changePasswordsService.js";
import errorHandler from "../../errors/errorHandler.js";

const changePasswordUser = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		if (!currentPassword || !newPassword) {
			res.status(400).json({
				success: false,
				message:
					"Por favor, proporciona la contraseña actual y la nueva contraseña",
			});
			return;
		}

		await changePasswordsService(userId, currentPassword, newPassword);

		res.status(200).json({
			success: true,
			message: "Contraseña actualizada exitosamente",
		});
	} catch (error) {
		res.status(error.status || 500).json({
			success: false,
			message: error.message || "Error al cambiar la contraseña",
		});
	}
};

export default changePasswordUser;
