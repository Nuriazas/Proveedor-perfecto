// Importamos la función que nos da la conexión a la base de datos
import getPool from "../../db/getPool.js";

// Servicio para obtener un freelancer específico por su ID
async function getFreelancerById(id) {
	// Obtenemos la conexión a la base de datos
	const pool = await getPool();

	try {
		// Ejecutamos consulta SQL con parámetro seguro
		const [freelancer] = await pool.query(
			`
            SELECT 
                id,
                name,
                email,
                avatar,
                bio,
                created_at
            FROM users
            WHERE role = 'freelancer' AND id = ?
            GROUP BY id;
            `,
			[id] // Parámetro seguro para evitar SQL injection
		);

		// Explicación del SQL:
		// - SELECT: seleccionamos datos básicos del perfil
		// - FROM users: tabla de usuarios
		// - WHERE: filtramos por rol 'freelancer' Y por ID específico
		// - ? : placeholder seguro para el parámetro ID
		// - [id]: array con el valor real que reemplaza el ?

		// Devolvemos el primer (y único) resultado
		// freelancer[0] porque query() devuelve un array
		return freelancer[0];
	} catch (error) {
		// Si hay error, creamos un mensaje más descriptivo
		throw new Error("Error al obtener el freelancer: " + error.message);
	}
}

export default getFreelancerById;

// ¿Qué hace este servicio?
// 1. Recibe un ID como parámetro
// 2. Busca un freelancer específico con ese ID
// 3. Usa parámetros seguros (?) para evitar ataques SQL
// 4. Devuelve un solo freelancer o undefined si no existe
// 5. Maneja errores con mensajes descriptivos
