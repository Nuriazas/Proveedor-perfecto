import { uploadProfilePhotoService } from "../../services/usersServices/uploadProfilePhotoService.js";

const uploadProfilePhotoController = async (req, res) => {
	try {
		if (!req.files || !req.files.img) {
			return res
				.status(400)
				.json({ message: "No se ha enviado ninguna imagen" });
		}

		// Verificar que solo se haya enviado una imagen
		if (Array.isArray(req.files.img)) {
			return res.status(400).json({ message: "Solo se permite una imagen" });
		}
		const img = req.files.img;

		const oldImg = req.body.profileImg; // Nombre de la imagen anterior, si existe

		const result = await uploadProfilePhotoService(img, oldImg);

		res.status(200).json(result);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error al guardar la imagen", error: error.message });
	}
};

export default uploadProfilePhotoController;
