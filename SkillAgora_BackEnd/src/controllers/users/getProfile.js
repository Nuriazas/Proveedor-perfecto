import selectUserById from "../../services/users/selectUserById.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getProfile = async (req, res, next) => {
	try {
		if (!req.user || !req.user.id) {
			throw generateErrorsUtils("No autorizado", 401);
		}

		const user = await selectUserById(req.user.id);

		if (!user) {
			throw generateErrorsUtils("Usuario no encontrado", 404);
		}

		res.status(200).json({
			status: "ok",
			data: user,
		});
	} catch (error) {
		next(error);
	}
};

export default getProfile;