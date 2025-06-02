// Importamos la conexión a la base de datos
import getPool from "../../db/getPool.js";

// Función que obtiene todos los servicios según filtros aplicados
const getAllServicesByFiltersService = async (filters) => {
	const pool = await getPool(); // Obtenemos conexión con la BDD

	// Extraemos los filtros que vienen desde el controlador
	const {
		category,
		place,
		minPrice,
		maxPrice,
		orderBy = "created_at", // Campo por el que se ordena (por defecto, la fecha)
		orderDirection = "DESC", // Dirección de orden (por defecto descendente)
		limit = 50, // Cantidad máxima de resultados a devolver
		offset = 0, // Desde qué resultado empezar (para paginación)
	} = filters;

	// Consulta SQL base: une servicios, usuarios y categorías
	let query = `
		SELECT 
			s.id, s.title, s.description, s.price, s.created_at, s.delivery_time_days,
			u.name AS user_name,
			c.name AS category_name,
			(
				-- Subconsulta para devolver un array JSON con todas las imágenes/videos del servicio
				SELECT JSON_ARRAYAGG(JSON_OBJECT('media_url', sm.media_url, 'type', sm.type))
				FROM service_media sm
				WHERE sm.service_id = s.id
			) AS media
		FROM services s
		JOIN users u ON s.user_id = u.id
		JOIN categories c ON s.category_id = c.id
		WHERE 1 = 1
	`;

	const values = []; // Array para pasar los valores de forma segura (evita SQL injection)

	// Si se filtra por categoría
	if (category) {
		query += " AND c.name = ?"; // Se añade condición
		values.push(category); // Se añade valor al array
	}

	// Si se filtra por lugar (online/presencial)
	if (place) {
		query += " AND s.place = ?";
		values.push(place);
	}

	// Si hay precio mínimo
	if (minPrice) {
		query += " AND s.price >= ?";
		values.push(minPrice);
	}

	// Si hay precio máximo
	if (maxPrice) {
		query += " AND s.price <= ?";
		values.push(maxPrice);
	}

	// Validamos que el campo por el que se ordena sea válido
	const allowedOrderFields = ["created_at", "price", "delivery_time_days"];
	const allowedDirections = ["ASC", "DESC"];

	if (allowedOrderFields.includes(orderBy)) {
		// Añadimos ordenamiento si es correcto
		query += ` ORDER BY ${orderBy} ${
			allowedDirections.includes(orderDirection) ? orderDirection : "DESC"
		}`;
	}

	// Aplicamos límite y desplazamiento para paginación
	query += " LIMIT ? OFFSET ?";
	values.push(Number(limit), Number(offset));

	// Ejecutamos la query final con los valores
	const [rows] = await pool.query(query, values);

	return rows; // Retornamos el array de servicios filtrados
};

export default getAllServicesByFiltersService;
