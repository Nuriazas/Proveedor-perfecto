import getPool from "../../db/getPool.js";

// Servicio para obtener todas las valoraciones de un freelancer
const getFreelancerReviewsService = async (freelancerId) => {
    try {
        const pool = await getPool();

        // Obtener valoraciones con información del cliente y servicio
        const [reviews] = await pool.query(`
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.name as reviewer_name,
                u.avatar as reviewer_avatar,
                s.title as service_title,
                s.id as service_id,
                o.ordered_at,
                o.total_price
            FROM reviews r 
            JOIN orders o ON r.order_id = o.id
            JOIN services s ON o.services_id = s.id
            JOIN users u ON o.client_id = u.id
            WHERE s.user_id = ?
            ORDER BY r.created_at DESC
        `, [freelancerId]);

        // Calcular el promedio de valoraciones
        const [avgResult] = await pool.query(`
            SELECT 
                AVG(r.rating) as average_rating,
                COUNT(r.id) as total_reviews,
                COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_reviews
            FROM reviews r 
            JOIN orders o ON r.order_id = o.id
            JOIN services s ON o.services_id = s.id
            WHERE s.user_id = ?
        `, [freelancerId]);

        // Formatear el promedio a un decimal
        const averageRating = parseFloat(avgResult[0].average_rating || 0).toFixed(1);

        return {
            reviews,
            statistics: {
                averageRating,
                totalReviews: avgResult[0].total_reviews,
                fiveStarReviews: avgResult[0].five_star_reviews
            }
        };

    } catch (error) {
        console.error('Error en getFreelancerReviewsService:', error);
        throw error;
    }
};

// Este servicio maneja la lógica de negocio para obtener las reseñas de un freelancer.
// Funcionalidades principales:
// - Obtiene todas las reseñas con información detallada del cliente y servicio
// - Calcula estadísticas como promedio de valoraciones y total de reseñas
// - Incluye información del cliente y detalles del servicio
// - Ordena las reseñas por fecha de creación

export default getFreelancerReviewsService;
