// Importamos la función que nos da la conexión a la base de datos
import getPool from "../../db/getPool.js";

// Servicio para obtener todas las categorías con el número de servicios
const getCategoriesService = async () => {
    let pool;
    
    try {
        // Obtenemos la conexión a la base de datos
        pool = await getPool();
        
        // Query SQL que obtiene categorías y cuenta sus servicios
        const query = `
            SELECT 
                c.id,
                c.name,
                COUNT(s.id) as total_services
            FROM categories c
            LEFT JOIN services s ON c.id = s.category_id
            GROUP BY c.id, c.name
            ORDER BY c.name ASC
        `;
        
        // Explicación del SQL:
        // - SELECT: seleccionamos ID, nombre y contamos servicios
        // - FROM categories c: tabla principal con alias 'c'
        // - LEFT JOIN: unimos con servicios (incluye categorías sin servicios)
        // - GROUP BY: agrupamos para poder usar COUNT()
        // - ORDER BY: ordenamos alfabéticamente por nombre

        // Ejecutamos la consulta en la base de datos
        const [categories] = await pool.execute(query);
        
        // Devolvemos las categorías obtenidas
        return categories;

    } catch (error) {
        // Si hay error, lo mostramos en consola para debugging
        console.error('Error al obtener categorías:', error);
        
        // Re-lanzamos el error para que el controlador lo maneje
        throw error;
    }
};

export default getCategoriesService;

// ¿Qué hace este servicio?
// 1. Se conecta a la base de datos
// 2. Ejecuta una consulta SQL compleja con JOIN y COUNT
// 3. Obtiene categorías con el número de servicios de cada una
// 4. Devuelve los datos al controlador que lo llamó
// 5. Maneja errores de base de datos