// SkillAgora_BackEnd/src/services/entries/gigsService.js
import getPool from "../../db/getPool.js";

// Servicio extra por implementar

// Servicio para obtener gigs populares/destacados
const getFeaturedServices = async () => {
    let pool;

    try {
        pool = await getPool();

        const query = `
            SELECT 
                s.id,
                s.title,
                s.price,
                s.delivery_time_days,
                u.name as freelancer_name,
                c.name as category_name,
                (SELECT sm.media_url 
                 FROM service_media sm
                 WHERE sm.service_id = s.id AND sm.type = 'image' 
                 LIMIT 1) as main_image,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(DISTINCT o.id) as total_orders
            FROM services s
            INNER JOIN users u ON s.user_id = u.id
            INNER JOIN categories c ON s.category_id = c.id
            LEFT JOIN orders o ON s.id = o.services_id
            LEFT JOIN reviews r ON o.id = r.order_id
            GROUP BY s.id, s.title, s.price, s.delivery_time_days, u.name, c.name
            ORDER BY total_orders DESC, rating DESC, s.created_at DESC
        `;

        const [featuredServices] = await pool.execute(query);

        // Formatear rating
        featuredServices.forEach((service) => {
            service.rating = parseFloat(service.rating).toFixed(1);
        });

        return featuredServices;
    } catch (error) {
        console.error("Error al obtener servicios destacados:", error);
        throw error;
    } 
};

export default getFeaturedServices;