// Servicio Endpoint para aceptar el registro de un proveedor (administrador)

// Importamos la función para obtener conexión a la base de datos
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para aceptar el request de un freelancer
const acceptFreelancerRegisterService = async (id) => {
	// Obtenemos la conexión al pool de la base de datos
	const pool = await getPool();

	try {
		// Actualizamos el rol del usuario a 'freelancer' según el ID proporcionado
		const [userUpdateToFreelancer] = await pool.query(
			`
        UPDATE users SET role = 'freelancer' WHERE id = ?
    `,
			[id]
		);

		// Si no se ha actualizado ninguna fila, lanzamos error personalizado
		if (userUpdateToFreelancer.affectedRows === 0) {
			throw generateErrorsUtils(
				"No se pudo actualizar el rol del usuario a freelancer",
				404
			);
		}

		// Consultamos los datos del usuario actualizado para devolver la información final
		const [userUpdatedToFreelancer] = await pool.query(
			`
            SELECT id, name, email, role FROM users WHERE id = ?
            `,
			[id]
		);

		// Si no se encuentra el usuario tras la actualización, lanzamos error
		if (userUpdatedToFreelancer.length === 0) {
			throw generateErrorsUtils(
				"Usuario no encontrado después de la actualización",
				404
			);
		}

		// Devolvemos el usuario actualizado (primer resultado del array)
		return userUpdatedToFreelancer[0];
	} catch (error) {
		throw generateErrorsUtils(
			"Error al aceptar el registro de freelancer",
			500
		);
	}
};

export default acceptFreelancerRegisterService;
