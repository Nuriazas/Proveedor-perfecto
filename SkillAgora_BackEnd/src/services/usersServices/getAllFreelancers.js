// Importamos la función que nos da la conexión a la base de datos
import getPool from "../../db/getPool.js";
import priceUtils from "../../utils/priceUtils.js";

// Servicio para obtener todos los usuarios que son freelancers con datos completos
async function getAllFreelancers() {
	// Obtenemos la conexión a la base de datos
	const pool = await getPool();

	try {
		// Ejecutamos consulta SQL mejorada para obtener freelancers con datos calculados
		const [freelancers] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.lastName,
                u.email,
                u.avatar,
                u.bio,
                u.experience,
                u.portfolio_url,
                u.location,
                u.language,
                u.created_at,
                
                -- Datos calculados para filtros
                COUNT(DISTINCT s.id) as total_services,
                COALESCE(AVG(s.price), 0) as average_service_price,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as total_reviews,
                
                -- Especialidad principal (categoría con más servicios)
                COALESCE(
                    (SELECT c.name 
                     FROM services s2 
                     JOIN categories c ON s2.category_id = c.id 
                     WHERE s2.user_id = u.id 
                     GROUP BY c.id 
                     ORDER BY COUNT(*) DESC 
                     LIMIT 1), 
                    'General'
                ) as specialty,
                
                -- Precio mínimo y máximo de servicios
                COALESCE(MIN(s.price), 0) as min_service_price,
                COALESCE(MAX(s.price), 0) as max_service_price,
                
                -- Tiempo promedio de entrega
                COALESCE(AVG(s.delivery_time_days), 0) as avg_delivery_time,
                
                -- Fecha del último servicio creado
                MAX(s.created_at) as last_service_date,
                
                -- Estado de actividad (tiene servicios activos o no)
                CASE 
                    WHEN COUNT(s.id) > 0 THEN 'active'
                    ELSE 'inactive'
                END as activity_status
                
            FROM users u
            LEFT JOIN services s ON u.id = s.user_id
            LEFT JOIN orders o ON s.id = o.services_id
            LEFT JOIN reviews r ON o.id = r.order_id
            WHERE u.role = 'freelancer'
            GROUP BY u.id, u.name, u.lastName, u.email, u.avatar, u.bio, 
                     u.experience, u.portfolio_url, u.location, u.language, u.created_at
            ORDER BY u.created_at DESC
        `);

		// Procesamos los datos para formatear números y añadir campos calculados
		const processedFreelancers = freelancers.map(freelancer => {
			return {
				...freelancer,
				// Formateamos el rating a 1 decimal
				average_rating: parseFloat(freelancer.average_rating).toFixed(1),
				// Formateamos precios a 2 decimales y agregamos símbolo de dólar
				average_service_price: parseFloat(freelancer.average_service_price).toFixed(2),
				average_service_price_formatted: priceUtils.formatPrice(freelancer.average_service_price, 'USD'),
				min_service_price: parseFloat(freelancer.min_service_price).toFixed(2),
				min_service_price_formatted: priceUtils.formatPrice(freelancer.min_service_price, 'USD'),
				max_service_price: parseFloat(freelancer.max_service_price).toFixed(2),
				max_service_price_formatted: priceUtils.formatPrice(freelancer.max_service_price, 'USD'),
				// Formateamos tiempo de entrega
				avg_delivery_time: Math.round(freelancer.avg_delivery_time),
				// Convertimos a números enteros
				total_services: parseInt(freelancer.total_services),
				total_reviews: parseInt(freelancer.total_reviews),
				// Añadimos campo para compatibilidad con frontend actual
				hourly_rate: freelancer.average_service_price, // Alias para compatibilidad
				hourly_rate_formatted: priceUtils.formatPrice(freelancer.average_service_price, 'USD'),
				rating: freelancer.average_rating // Alias para compatibilidad
			};
		});

		// Devolvemos la lista de freelancers procesada
		return processedFreelancers;
	} catch (error) {
		// Si hay error, creamos un mensaje más descriptivo
		throw new Error("Error al obtener los freelancers: " + error.message);
	}
}

export default getAllFreelancers;

// ¿Qué hace este servicio mejorado?
// 1. Se conecta a la base de datos
// 2. Obtiene freelancers con datos calculados de servicios y reviews
// 3. Incluye estadísticas como rating promedio, número de servicios, etc.
// 4. Determina la especialidad principal de cada freelancer
// 5. Calcula precios mínimos, máximos y promedios
// 6. Mantiene compatibilidad con el frontend existente
// 7. Añade campos útiles para filtros avanzados
// 8. Formatea números para mejor presentación
// 9. Maneja errores con mensajes descriptivos

// NUEVOS CAMPOS DISPONIBLES PARA EL FRONTEND:
// - total_services: número de servicios del freelancer
// - average_service_price: precio promedio de servicios  
// - average_rating: valoración promedia (0-5)
// - total_reviews: número total de reseñas
// - specialty: especialidad principal
// - min_service_price, max_service_price: rangos de precios
// - avg_delivery_time: tiempo promedio de entrega
// - last_service_date: fecha del último servicio
// - activity_status: 'active' o 'inactive'
// - hourly_rate: alias de average_service_price (compatibilidad)
// - rating: alias de average_rating (compatibilidad)