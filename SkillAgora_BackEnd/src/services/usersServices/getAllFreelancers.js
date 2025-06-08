// Importamos la función que nos da la conexión a la base de datos
import getPool from "../../db/getPool.js";

// Servicio para obtener todos los usuarios que son freelancers
async function getAllFreelancers() {
	// Obtenemos la conexión a la base de datos
	const pool = await getPool();

	try {
		// Ejecutamos consulta SQL para obtener solo freelancers
		const [freelancers] = await pool.query(`
            SELECT 
                id,
                name,
                email,
                avatar,
                bio,
                created_at
            FROM users
            WHERE role = 'freelancer'
            GROUP BY id
        `);

		// Explicación del SQL:
		// - SELECT: seleccionamos datos básicos del perfil
		// - FROM users: tabla de usuarios
		// - WHERE role = 'freelancer': filtramos solo freelancers
		// - GROUP BY id: agrupamos por ID (elimina duplicados si los hay)

		// Devolvemos la lista de freelancers
		return freelancers;
	} catch (error) {
		// Si hay error, creamos un mensaje más descriptivo
		throw new Error("Error al obtener los freelancers: " + error.message);
	}
}

export default getAllFreelancers;

// ¿Qué hace este servicio?
// 1. Se conecta a la base de datos
// 2. Filtra usuarios por rol 'freelancer'
// 3. Obtiene datos básicos del perfil (sin datos sensibles)
// 4. Devuelve lista completa de freelancers
// 5. Maneja errores con mensajes descriptivos
