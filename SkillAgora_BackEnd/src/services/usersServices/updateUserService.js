import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateUserService = async (userId, updateData) => {
	const pool = await getPool();
	const { email, name, lastName, bio, experience, location, language, portfolio_url } = updateData;

	try {
		// Validar que el usuario existe
		const [userRows] = await pool.query(
			`SELECT id, email FROM users WHERE id = ?`,
			[userId]
		);

		if (userRows.length === 0) {
			throw generateErrorsUtils("Usuario no encontrado", 404);
		}

		// Si se actualiza el email, verificar que no esté en uso
		if (email && email !== userRows[0].email) {
			const [emailExists] = await pool.query(
				`SELECT id FROM users WHERE email = ? AND id != ?`,
				[email, userId]
			);

			if (emailExists.length > 0) {
				throw generateErrorsUtils("El email ya está en uso", 409);
			}
		}

		// Construir query dinámicamente solo con campos que se van a actualizar
		const fieldsToUpdate = [];
		const values = [];

		if (email !== undefined) {
			fieldsToUpdate.push("email = ?");
			values.push(email);
		}
		if (name !== undefined) {
			fieldsToUpdate.push("name = ?");
			values.push(name);
		}
		if (lastName !== undefined) {
			fieldsToUpdate.push("lastName = ?");
			values.push(lastName);
		}
		if (bio !== undefined) {
			fieldsToUpdate.push("bio = ?");
			values.push(bio);
		}
        if (experience !== undefined) {
			fieldsToUpdate.push("experience = ?");
			values.push(experience);
		}

        if (portfolio_url !== undefined) {
			fieldsToUpdate.push("portfolio_url = ?");
			values.push(portfolio_url);
		}

        if (location !== undefined) {
			fieldsToUpdate.push("location = ?");
			values.push(location);
		}

        if (language !== undefined) {
			fieldsToUpdate.push("language = ?");
			values.push(language);
		}


		// Solo actualizar si hay campos que cambiar
		if (fieldsToUpdate.length === 0) {
			throw generateErrorsUtils("No hay campos para actualizar", 400);
		}

		// Agregar timestamp de actualización
		fieldsToUpdate.push("updated_at = NOW()");
		values.push(userId);

		const updateQuery = `
        UPDATE users 
        SET ${fieldsToUpdate.join(", ")} 
        WHERE id = ?
    `;

		const [result] = await pool.query(updateQuery, values);

		if (result.affectedRows === 0) {
			throw generateErrorsUtils("No se pudo actualizar el usuario", 500);
		}

		return {
			message: "Usuario actualizado correctamente",
			updatedFields: Object.keys(updateData).filter(
				(key) => updateData[key] !== undefined
			),
		};
	} catch (error) {
		throw error;
	}
};

export default updateUserService;

// ¿Qué hace este servicio?
// 1. Recibe el ID del usuario y los datos nuevos que se quieren cambiar
// 2. Verifica en la base de datos que el usuario exista realmente
// 3. Si hay email nuevo, revisa que no esté siendo usado por otro usuario
// 4. Construye y ejecuta la query SQL para actualizar solo los campos enviados
// 5. Confirma que la actualización se hizo correctamente en la base de datos
