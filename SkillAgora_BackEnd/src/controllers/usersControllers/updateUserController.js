import updateUserService from "../../services/usersServices/updateUserService.js";

const updateUserController = async (req, res, next) => {
	try {
		const { id } = req.params;

		// Validación más robusta del ID
		if (!id || isNaN(id)) {
			return res.status(400).json({
				status: "error",
				message: "ID de usuario inválido",
			});
		}

		const {
			email,
			name,
			lastName,
			bio,
			experience,
			location,
			language,
			portfolio_url,
		} = req.body;

		// Validar que al menos un campo esté presente
		if (
			!email &&
			!name &&
			!lastName &&
			!bio &&
			!experience &&
			!location &&
			!language &&
			!portfolio_url
		) {
			return res.status(400).json({
				status: "error",
				message: "Debe proporcionar al menos un campo para actualizar",
			});
		}

		// Validaciones básicas
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({
				status: "error",
				message: "Formato de email inválido",
			});
		}

		if (bio && bio.length > 500) {
			return res.status(400).json({
				status: "error",
				message: "La biografía no puede exceder 500 caracteres",
			});
		}

		if (portfolio_url && !/^https?:\/\/[^\s]+$/.test(portfolio_url)) {
			return res.status(400).json({
				status: "error",
				message: "URL del portafolio debe ser válida",
			});
		}

		// Verificar autorización (solo el propio usuario puede actualizarse)
		if (req.user.id !== parseInt(id)) {
			return res.status(403).json({
				status: "error",
				message: "No tienes permisos para actualizar este usuario",
			});
		}

		await updateUserService(id, {
			email,
			name,
			lastName,
			bio,
			experience,
			location,
			language,
			portfolio_url,
		});

		res.json({
			status: "ok",
			message: "Usuario actualizado correctamente",
		});
	} catch (error) {
		next(error);
	}
};

export default updateUserController;

// ¿Qué hace este controlador?
// 1. Recibe una petición HTTP PUT para actualizar un usuario específico
// 2. Valida que el ID del usuario sea correcto y que vengan datos para cambiar
// 3. Verifica que el usuario solo pueda editarse a sí mismo (autorización)
// 4. Llama al servicio para hacer la actualización en la base de datos
// 5. Devuelve respuesta JSON confirmando que se actualizó correctamente
