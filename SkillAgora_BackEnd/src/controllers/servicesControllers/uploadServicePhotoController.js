import express from "express";
import { uploadServicePhotoService } from "../../services/servicesServices/uploadServicePhotoService.js";

const ServicesRouter = express.Router();

const uploadServicePhotoController = async (req, res) => {
	try {
		const imgs = req.files?.img;
		const oldImgs = req.body?.serviceImg; // Nombre de la imagen anterior, si existe

		const result = await uploadServicePhotoService(imgs, oldImgs);

		res.status(200).json(result);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error al guardar la imagen", error: error.message });
	}
};

export default uploadServicePhotoController;
