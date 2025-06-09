import Joi from "joi";

// Validación para el registro de usuario
const registerUserSchema = Joi.object({
	email: Joi.string()
		.email({ minDomainSegments: 2 })
		.lowercase()
		.trim()
		.max(255)
		.required()
		.messages({
			"string.email": "El email debe tener un formato válido",
			"string.max": "El email no puede exceder 255 caracteres",
			"any.required": "El email es obligatorio",
		}),

	password: Joi.string().min(8).max(100).required().messages({
		"string.min": "La contraseña debe tener al menos 8 caracteres",
		"string.max": "La contraseña no puede exceder 100 caracteres",
		"any.required": "La contraseña es obligatoria",
	}),

	name: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.required()
		.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
		.messages({
			"string.min": "El nombre debe tener al menos 2 caracteres",
			"string.pattern.base": "El nombre solo puede contener letras y espacios",
			"any.required": "El nombre es obligatorio",
		}),

	lastName: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.required()
		.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
		.messages({
			"string.min": "El apellido debe tener al menos 2 caracteres",
			"string.pattern.base":
				"El apellido solo puede contener letras y espacios",
			"any.required": "El apellido es obligatorio",
		}),
});

const validateRegisterUser = (req, res, next) => {
	const { error, value } = registerUserSchema.validate(req.body, {
		abortEarly: false,
		stripUnknown: true,
	});

	if (error) {
		return res.status(400).json({
			status: "error",
			message: "Datos de registro inválidos",
			errors: error.details.map((detail) => ({
				field: detail.path[0],
				message: detail.message,
			})),
		});
	}

	req.body = value;
	next();
};

export default validateRegisterUser;
