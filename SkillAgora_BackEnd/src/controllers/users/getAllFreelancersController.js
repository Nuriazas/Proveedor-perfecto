// Importamos el servicio que obtiene todos los freelancers de la base de datos
import getAllFreelancers from "../../services/users/getAllFreelancers.js";

// Controlador para manejar la petición de obtener todos los freelancers
async function getAllFreelancersController(req, res) {
    try {
        // Llamamos al servicio para obtener la lista de freelancers
        const freelancers = await getAllFreelancers();
        
        // Enviamos respuesta exitosa con los freelancers
        res.json({
            success: true,
            data: freelancers,
        });
        
    } catch (error) {
        // Si hay error, enviamos respuesta de error con mensaje
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export default getAllFreelancersController;

// ¿Qué hace este controlador?
// 1. Recibe una petición HTTP para obtener freelancers
// 2. Llama al servicio para obtener los datos de usuarios
// 3. Devuelve respuesta JSON con la lista de freelancers
// 4. Maneja errores localmente (diferente a los otros controladores)