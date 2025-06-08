import createServiceService from "../../services/servicesServices/createServiceService.js";

const createServiceController = async (req, res, next) => {
	try {
		const user_id = req.user.id;

		const { category_name, title, description, price, place } = req.body;

		if (!category_name || !title || !description || !price || !place) {
			return res.status(400).send({
				status: "error",
				message: "Faltan datos requeridos para crear el servicio",
			});
		}
		const newService = await createServiceService({
			user_id,
			category_name,
			title,
			description,
			place,
			price,
		});

		return res.status(201).send({
			status: "ok",
			message: "Servicio creado correctamente",
			data: newService,
		});
	} catch (error) {
		next(error);
	}
};

export default createServiceController;
