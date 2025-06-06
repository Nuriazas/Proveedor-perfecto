import updateServiceService from "../../services/servicesServices/UpdateServiceService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateServiceController = async (req, res, next) => {
	try {
		const {
			id,
			title,
			description,
			price,
			delivery_time_days,
			place
		} = req.body;

		// Obtenemos el ID del usuario logueado desde el token (req.user)
		const userId = req.user.id;

		if (!id) {
			throw generateErrorsUtils("Service ID is required.", 400);
		}

		const result = await updateServiceService(
			id,
			title,
			description,
			price,
			delivery_time_days,
			place,
			userId // <- se lo pasamos aquí
		);

		res.status(200).json({ message: "Service updated successfully", result });
	} catch (error) {
		next(error);
	}
};

export default updateServiceController;
