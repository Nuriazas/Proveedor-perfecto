import getPool from "../../db/getPool.js";
import sendMailBrevoUtils from "../../utils/sendMailBrevoUtils.js";



// Genera un código de recuperación aleatorio y lo actualiza en la base de datos
const updateForgotPassCodeService = async (email, recoverPassCode) => {
    const pool = await getPool();

    // Verifica si el usuario existe
    const [ result] = await pool.query(
        `
        UPDATE users
        SET recoverPassCode = ?
        WHERE email = ?
        `,
        [recoverPassCode, email]

    );
    if (result.affwctednRows === 0){
        throw new Error('no se pude actualizar el codigo de recuperación');
    }

    
    // Genera un código de recuperación aleatorio
    const emailSubject = 'Recuperación de contraseña SkillAgora';
    const emailContent = `
        <html>
            <body>
                <h1>Recuperación de contraseña</h1>
                <p>Tu código de recuperación es: <strong>${recoverPassCode}</strong></p>
                <p>Si no has solicitado este cambio, por favor ignora este mensaje.</p>
            </body>
        </html>
        `;
    // Envía un correo electrónico al usuario con el código de recuperación
        await sendMailBrevoUtils(email, emailSubject, emailContent);
        }

export default updateForgotPassCodeService;