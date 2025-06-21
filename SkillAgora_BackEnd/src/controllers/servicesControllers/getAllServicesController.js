import getAllServicesService from "../../services/servicesServices/getAllServicesService.js";




const getAllServicesController = async (req, res) => {
	try {
		const services = await getAllServicesService();
		
		// ✅ AGREGAR ESTE LOG TEMPORAL
		console.log("🔧 SERVICIOS devueltos desde el backend:", JSON.stringify(services[0], null, 2));
		
		if (!services || services.length === 0) {
			return res.status(404).json({
				success: false,
				message: "No se encontraron servicios",
			});
		}
		
		res.status(200).json({
			success: true,
			data: services,
		});
	} catch (error) {
		console.error("Error al obtener todos los servicios:", error);
		res.status(500).json({
			success: false,
			message: "Error interno del servidor al obtener todos los servicios",
		});
	}
};

export default getAllServicesController;