import getPool from "../../db/getPool.js";

// Servicio para obtener categorías disponibles
const getCategoriesService = async () => {
    let pool;
    
    try {
        pool = await getPool();
        
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

        const [categories] = await pool.execute(query);
        return categories;

    } catch (error) {
        console.error('Error al obtener categorías:', error);
        throw error;
    } 
};

export default getCategoriesService;