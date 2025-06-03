import bcrypt from "bcrypt";
import getPool from "../../db/getPool.js";

const changePasswordsService = async (userId, currentPassword, newPassword) => {
    const pool = await getPool();

    // Validar que la nueva contraseña cumpla con los requisitos mínimos
    if (newPassword.length < 8) {
        const error = new Error("La nueva contraseña debe tener al menos 8 caracteres");
        error.statusCode = 400;
        throw error;
    }

    // Obtener el usuario actual
    const [user] = await pool.query(
        "SELECT password FROM users WHERE id = ?",
        [userId]
    );

    if (!user.length) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 404;
        throw error;
    }
// Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
    if (!isPasswordValid) {
        const error = new Error("Contraseña actual incorrecta");
        error.statusCode = 401;
        throw error;
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await bcrypt.compare(newPassword, user[0].password);
    if (isSamePassword) {
        const error = new Error("La nueva contraseña debe ser diferente a la actual");
        error.statusCode = 400;
        throw error;
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña
    await pool.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId]
    );
}

// Servicio que implementa la lógica de negocio para el cambio de contraseña:
// 1. Valida requisitos de la nueva contraseña (mínimo 8 caracteres)
// 2. Verifica que el usuario exista en la base de datos
// 3. Comprueba que la contraseña actual sea correcta
// 4. Asegura que la nueva contraseña sea diferente a la actual
// 5. Encripta la nueva contraseña con bcrypt
// 6. Actualiza la contraseña en la base de datos

export default changePasswordsService;