import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const selectUserById = async (nameQuery) => {
	const pool = await getPool();
	console.log(pool);

	const [userRow] = await pool.query(
		`
                SELECT 
                u.id, 
                u.email,
                u.name,
                u.name,
                u.lastName,
                u.avatar,
                u.role,
                u.bio,
                IFNULL (AVG(r.rating), 0) AS average_rating
                FROM users u
                LEFT JOIN orders o ON o.client_id = u.id
                LEFT JOIN reviews r ON r.order_id = o.id
                WHERE u.name LIKE ?  
                GROUP BY u.id

            `,
		[`%${nameQuery}%`]
	);
	if (userRow.length === 0) {
		throw generateErrorsUtils("Usuario no encontrado", 404);
	}
	const user = userRow[0];
	const [servicesRow] = await pool.query(
		`
                SELECT 
                s.id AS service_id,
                s.title, 
                s.description, 
                s.price, 
                c.name AS category_name, 
                s.created_at
                FROM services s
                JOIN categories c ON s.category_id = c.id
                WHERE s.user_id = ?
                
            
            `,
		[user.id]
	);

	delete user.id; // Eliminar el ID del usuario para evitar conflictos con el ID de los servicios
	return {
		...user,
		services: servicesRow,
	};
};

export default selectUserById;
