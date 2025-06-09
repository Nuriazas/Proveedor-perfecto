import Joi from "joi";

// Validación para el login
const loginUserSchema = Joi.object({
	email: Joi.string()
		.email({ minDomainSegments: 2 })
		.lowercase()
		.trim()
		.required()
		.messages({
			"string.email": "El email debe tener un formato válido",
			"any.required": "El email es obligatorio",
		}),

	password: Joi.string().min(8).max(100).required().messages({
		"string.min": "La contraseña debe tener al menos 8 caracteres",
		"any.required": "La contraseña es obligatoria",
	}),
});

const validateLoginUser = (req, res, next) => {
	const { error, value } = loginUserSchema.validate(req.body, {
		abortEarly: false,
		stripUnknown: true,
	});

	if (error) {
		return res.status(400).json({
			status: "error",
			message: "Datos de inicio de sesión inválidos",
			errors: error.details.map((detail) => ({
				field: detail.path[0],
				message: detail.message,
			})),
		});
	}

	req.body = value;
	next();
};

export default validateLoginUser;
