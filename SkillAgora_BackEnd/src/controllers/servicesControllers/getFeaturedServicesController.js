import getFeaturedServices from '../../services/servicesServices/getFeaturedServices.js';

const getFeaturedServicesController = async (req, res, next) => {
    try {
        // Llamar al servicio para obtener los servicios destacados
        const featured = await getFeaturedServices();
        res.status(200).json({ success: true, data: featured });
    } catch (error) {
        next(error);
    }
};

export default getFeaturedServicesController;