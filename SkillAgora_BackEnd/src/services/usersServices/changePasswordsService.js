import bcrypt from "bcrypt";
import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const changePasswordsService = async (userId, currentPassword, newPassword) => {
	const pool = await getPool();

	if (newPassword.length < 8) {
		throw generateErrorsUtils(
			"La nueva contraseña debe tener al menos 8 caracteres"
		);
	}

	const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [
		userId,
	]);

	if (!rows.length) {
		throw generateErrorsUtils("Usuario no encontrado", 404);
	}

	const user = rows[0];

	const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
	if (!isPasswordValid) {
		throw generateErrorsUtils("La contraseña actual es incorrecta", 401);
	}

	const isSamePassword = await bcrypt.compare(newPassword, user.password);
	if (isSamePassword) {
		throw generateErrorsUtils(
			"La nueva contraseña no puede ser la misma que la actual",
			400
		);
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(newPassword, salt);

	await pool.query("UPDATE users SET password = ? WHERE id = ?", [
		hashedPassword,
		userId,
	]);
};

export default changePasswordsService;
