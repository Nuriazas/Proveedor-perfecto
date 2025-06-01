// Controlador Endpoint detalle de un producto/servicio

// Importamos el servicio que obtiene las estadísticas de los servicios
import getServiceStatisticsService from '../../services/services/getServiceStatisticsService.js';

// Controlador para manejar la petición de estadísticas de servicios
const getServiceStatisticsController = async (req, res, next) => {
    try {
        // Llamamos al servicio para obtener las estadísticas
        const serviceStats = await getServiceStatisticsService();

         // Enviamos respuesta exitosa con las estadísticas al cliente
        res.status(200).json({ success: true, data: serviceStats });
    } catch (error) {
        next(error);
    }
};

export default getServiceStatisticsController;