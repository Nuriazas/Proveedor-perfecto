import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";


const updateUserRegCodeService = async (registrationCode) => {

    const pool = await getPool();

    // Verificar si el código de registro existe
    const [user] = await pool.query(
        `
        SELECT * FROM users WHERE registrationCode = ?
        `,
        [registrationCode]
    );

    // Si el código no existe, lanzar un error
    if (!user.length) {
        throw generateErrorsUtils("Código de registro inválido", 404);
    }

    // Actualizar el estado del usuario a activo
    await pool.query(
        `
        UPDATE users SET isActive = true, registrationCode = NULL WHERE registrationCode = ?
        `,
        [registrationCode]
    );
};

export default updateUserRegCodeService;