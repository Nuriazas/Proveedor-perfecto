import getAdminStatisticsService from "../../services/adminsServices/getAdminStatisticsService.js";

// Controlador para manejar la petición de estadísticas generales
const getAdminStatisticsController = async (req, res, next) => {
	try {
		// Llamamos al servicio para obtener las estadísticas completas
		const adminStats = await getAdminStatisticsService();

		// Enviamos respuesta ok con las estadísticas al cliente
		res.status(200).json({ 
			success: true, 
			message: "Admin statistics retrieved successfully",
			data: adminStats 
		});
	} catch (error) {
		next(error);
	}
};

export default getAdminStatisticsController;