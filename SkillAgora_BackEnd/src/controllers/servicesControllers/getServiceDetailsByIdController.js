
import getServiceDetailsByIdService from "../../services/servicesServices/getServiceDetailsByIdService.js";


const getServiceDetailsByIdController = async (req, res, next) => {
	try {
		const { id } = req.params;

		if (!id || isNaN(id)) {
			return res.status(400).json({ message: "ID inválido" });
		}

		const service = await getServiceDetailsByIdService(id);

		if (!service) {
			return res.status(404).json({ message: "Servicio no encontrado" });
		} else {
			res.status(200).json({
				success: true,
				data: service,
			});
		}
	} catch (error) {
		console.error("Error al obtener los detalles del servicio:", error);
		res.status(500).json({
			success: false,
			message:
				"Error interno del servidor al obtener los detalles del servicio",
		});
	}
};

export default getServiceDetailsByIdController;
