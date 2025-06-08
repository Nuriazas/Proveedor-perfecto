import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para crear un nuevo servicio en la base de datos
const createServiceService = async ({
	user_id,
	category_name,
	place,
	title,
	description,
	price,
}) => {
	// Obtener la conexión a la base de datos

	const pool = await getPool();

	try {
		const [categoryRows] = await pool.query(
			`SELECT id FROM categories WHERE name = ?`,
			[category_name]
		);
		if (categoryRows.length === 0) {
			throw generateErrorsUtils(`La categoria ${category_name} no existe`, 404);
		}

		const category_id = categoryRows[0].id;
		// Validar que se proporcionen todos los campos necesarios
		const [result] = await pool.query(
			`
                INSERT INTO services (user_id, category_id, place, title, description, price)
                VALUES (?, ?, ?, ?, ?, ?)
            
            `,
			[user_id, category_id, place, title, description, price]
		);

		const newServiceId = result.insertId;
		// Consultar el servicio recién creado para devolverlo
		const [serviceRows] = await pool.query(
			`
            
                SELECT
                    s.id,
                    s.place,
                    s.title,
                    s.description,
                    s.price,
                    c.name AS category_name,
                    u.name,
                    u.name,
                    u.lastName
                FROM services s
                JOIN categories c ON s.category_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ?
            
            `,
			[newServiceId]
		);
		return serviceRows[0];
		// Si no se encontró el servicio, lanzar un error
	} catch (error) {
		console.error("Error al crear el servicio:", error);
		throw generateErrorsUtils("Error al crear el servicio", 500);
	}
};

export default createServiceService;
