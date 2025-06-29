import createServiceService from "../../services/servicesServices/createServiceService.js";
import { savePhotoUtils } from "../../utils/photoUtils.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const createServiceController = async (req, res, next) => {
	try {
		const user_id = req.user.id;
		const user_role = req.user.role;

		// Validar que el usuario tenga rol de freelancer
		if (user_role !== 'freelancer') {
			return res.status(403).send({
				status: "error",
				message: "Solo los freelancers pueden crear servicios. Solicita el cambio de rol a un administrador.",
			});
		}

		const { category_name, title, description, price, place} = req.body;
		
		console.log("=== DEBUG ARCHIVO ===");
		console.log("req.files:", req.files);
		console.log("req.body:", req.body);
		console.log("Headers:", req.headers);
		console.log("Content-Type:", req.headers['content-type']);
		console.log("=====================");

		if (!category_name || !title || !description || !price || !place) {
			return res.status(400).send({
				status: "error",
				message: "Faltan datos requeridos para crear el servicio",
			});
		}
		

		let media_url = null;

		if (req.files && req.files.img) {
			const mediaFile = req.files.img;
			console.log("Archivo recibido:", mediaFile);
			const fileName = await savePhotoUtils(mediaFile, 800);
			media_url = fileName;
			
		}

		console.log("media_url que se enviará al servicio:", media_url);

		const newService = await createServiceService({
			user_id,
			category_name,
			title,
			description,
			place,
			price,
			media_url,
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
