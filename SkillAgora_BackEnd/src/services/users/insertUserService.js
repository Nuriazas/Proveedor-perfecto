import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import bcrypt from "bcrypt";
import sendMailBrevoUtils from "../../utils/sendMailBrevoUtils.js";

// Servicio para insertar un nuevo usuario en la base de datos
const insertUserService = async (email, password, registrationCode) => {
	const pool = await getPool();

	// Verificar si el usuario ya existe
	const [user] = await pool.query(
		`
        SELECT * FROM users WHERE email = ?        
        
        
        `,
		[email]
	);

	// Si el usuario ya existe, lanzar un error
	if (user.length) {
		throw generateErrorsUtils("El usuario ya existe", 409);
	}

	// Logica para envio de Email
	const emailSubject = "Bienvenido a SkillAgora. Activa tu cuenta";

	const emailBody = `

        <html>
            <body>
                <h1>Bienvenido a SkillAgora</h1>
                <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                <a href="${process.env.VITE_URL_API}users/validate/${registrationCode}">Activar cuenta</a>
            </body> 
        </html>
    `;

	await sendMailBrevoUtils(email, emailSubject, emailBody);

	// Encriptar la contraseña
	const hashedPassword = await bcrypt.hash(password, 10);

	await pool.query(
		`
        INSERT INTO users (email, password, registrationCode) 
        VALUES (?, ?, ?)
        `,
		[email, hashedPassword, registrationCode]
	);
};

export default insertUserService;
