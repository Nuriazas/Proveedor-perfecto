// Importamos el servicio que obtiene los servicios destacados de la base de datos
import getFeaturedServices from '../../services/servicesServices/getFeaturedServices.js';

// Controlador para manejar la petición de obtener servicios destacados
const getFeaturedServicesController = async (req, res, next) => {
    try {
        // Llamamos al servicio para obtener los servicios destacados
        const featured = await getFeaturedServices();
        
        // Enviamos respuesta exitosa con los servicios destacados
        res.status(200).json({ 
            success: true, 
            data: featured 
        });
        
    } catch (error) {
        // Si hay error, lo pasamos al middleware de errores
        next(error);
    }
};

export default getFeaturedServicesController;

// ¿Qué hace este controlador?
// 1. Recibe una petición HTTP para servicios destacados
// 2. Llama al servicio para obtener los datos destacados
// 3. Devuelve respuesta JSON con los servicios destacados
// 4. Maneja errores si algo sale mal