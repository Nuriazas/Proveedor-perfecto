import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import selectUserByEmailService from "../../services/usersServices/selectUserByEmailService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Controlador para manejar el inicio de sesión de un usuario
const loginUserController = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		console.log(password, email);

		// Validar que se proporcionen email y password
		if (!email || !password)
			throw generateErrorsUtils("Faltan datos, email y password", 400);

		const user = await selectUserByEmailService(email); // Solo necesitas el email

		// Verificar si el usuario existe y si la contraseña es correcta
		let isPasswordValid = false;
		if (user) {
			isPasswordValid = await bcrypt.compare(password, user.password);
		}

		if (!user || !isPasswordValid) {
			throw generateErrorsUtils("Email o contraseña incorrectos", 401);
		}

		// Verificar si el usuario está activo
		if (!user.active) {
			console.log(user.active);

			throw generateErrorsUtils("Usuario inactivo", 403);
		}

		// Si las credenciales son correctas, generar un token JWT
		const tokenInfo = {
			id: user.id,
			email: user.email,
			name: user.name,
			firstName: user.firstName,
			lastName: user.lastName,
		};

		// Firmar el token con la clave secreta y establecer una expiración
		const token = jwt.sign(tokenInfo, process.env.JWT_SECRET, {
			expiresIn: "1h", // El token expirará en 1 hora
		});

		res.send({
			status: "ok",
			data: {
				token,
			},
		});
	} catch (error) {
		next(error);
	}
};

export default loginUserController;
