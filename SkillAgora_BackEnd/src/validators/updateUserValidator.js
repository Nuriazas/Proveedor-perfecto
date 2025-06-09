import Joi from "joi";

// Schema de validación para actualización de usuario
const updateUserSchema = Joi.object({
	email: Joi.string()
		.email({
			minDomainSegments: 2,
			tlds: {
				allow: [
					"com",
					"net",
					"org",
					"edu",
					"gov",
					"mil",
					"es",
					"mx",
					"ar",
					"co",
					"cl",
					"pe",
					"ec",
					"bo",
					"uy",
					"py",
					"ve",
					"cr",
					"gt",
					"pa",
				],
			},
		})
		.lowercase()
		.trim()
		.max(255)
		.messages({
			"string.email": "El email debe tener un formato válido",
			"string.max": "El email no puede exceder 255 caracteres",
		}),

	name: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)
		.messages({
			"string.min": "El nombre debe tener al menos 2 caracteres",
			"string.max": "El nombre no puede exceder 50 caracteres",
			"string.pattern.base":
				"El nombre solo puede contener letras y espacios (sin espacios al inicio, final o múltiples consecutivos)",
		}),

	lastName: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)
		.messages({
			"string.min": "El apellido debe tener al menos 2 caracteres",
			"string.max": "El apellido no puede exceder 50 caracteres",
			"string.pattern.base":
				"El apellido solo puede contener letras y espacios (sin espacios al inicio, final o múltiples consecutivos)",
		}),

	bio: Joi.string().trim().max(500).allow("").messages({
		"string.max": "La biografía no puede exceder 500 caracteres",
	}),
	location: Joi.string().trim().max(100).allow("").messages({
		"string.max": "La ubicación no puede exceder 100 caracteres",
	}),
	experience: Joi.string().trim().max(500).allow("").messages({
		"string.max": "La experiencia no puede exceder 500 caracteres",
	}),
	portfolio_url: Joi.string().uri().max(255).allow("").messages({
		"string.uri": "El URL del portafolio debe ser válido",
		"string.max": "El URL del portafolio no puede exceder 255 caracteres",
	}),
	language: Joi.string().trim().max(50).allow("").messages({
		"string.max": "El idioma no puede exceder 50 caracteres",
	}),
})
	.min(1) // Al menos un campo debe estar presente
	.messages({
		"object.min": "Debe proporcionar al menos un campo para actualizar",
	});

// Schema de validación para parámetros de URL
const updateUserParamsSchema = Joi.object({
	id: Joi.number().integer().positive().required().messages({
		"number.base": "El ID debe ser un número",
		"number.integer": "El ID debe ser un número entero",
		"number.positive": "El ID debe ser un número positivo",
		"any.required": "El ID del usuario es requerido",
	}),
});

// Middleware de validación para el body
const validateUpdateUserBody = (req, res, next) => {
	const { error, value } = updateUserSchema.validate(req.body, {
		abortEarly: false, // Mostrar todos los errores, no solo el primero
		stripUnknown: true, // Remover campos no permitidos
		convert: true, // Convertir tipos automáticamente
	});

	if (error) {
		const errors = error.details.map((detail) => ({
			field: detail.path[0],
			message: detail.message,
		}));

		return res.status(400).json({
			status: "error",
			message: "Datos de entrada inválidos",
			errors: errors,
		});
	}

	// Reemplazar req.body con los datos validados y limpiados
	req.body = value;
	next();
};

// Middleware de validación para parámetros
const validateUpdateUserParams = (req, res, next) => {
	const { error, value } = updateUserParamsSchema.validate(req.params, {
		convert: true,
	});

	if (error) {
		return res.status(400).json({
			status: "error",
			message: "Parámetros inválidos",
			errors: error.details.map((detail) => ({
				field: detail.path[0],
				message: detail.message,
			})),
		});
	}

	req.params = value;
	next();
};

// Middleware de validación de autorización (verifica que el usuario solo pueda actualizar su propio perfil)
const validateUserAuthorization = (req, res, next) => {
	// Verificar que el usuario autenticado solo pueda actualizar su propio perfil
	if (req.user && req.user.id !== parseInt(req.params.id)) {
		return res.status(403).json({
			status: "error",
			message: "No tienes permisos para actualizar este usuario",
		});
	}
	next();
};

// Schema para validación manual (si necesitas usarlo en el servicio)
const manualValidateUpdateUser = (data) => {
	return updateUserSchema.validate(data, {
		abortEarly: false,
		stripUnknown: true,
		convert: true,
	});
};

// Esquemas adicionales para casos específicos
const emailOnlySchema = Joi.object({
	email: updateUserSchema.extract("email").required(),
});

const nameOnlySchema = Joi.object({
	name: updateUserSchema.extract("name").required(),
	lastName: updateUserSchema.extract("lastName").required(),
});

// Schema para validar solo la biografía
const bioOnlySchema = Joi.object({
	bio: updateUserSchema.extract("bio").required(),
});

const locationOnlySchema = Joi.object({
	location: updateUserSchema.extract("location").required(),
});

const languageOnlySchema = Joi.object({
	language: updateUserSchema.extract("language").required(),
});

const portfolioOnlySchema = Joi.object({
	portfolio: updateUserSchema.extract("portfolio_url").required(),
});

const experienceOnlySchema = Joi.object({
	experience: updateUserSchema.extract("experience").required(),
});

// Middleware combinado que valida params, body y autorización
const validateUpdateUser = [
	validateUpdateUserParams,
	validateUserAuthorization,
	validateUpdateUserBody,
];

export {
	updateUserSchema,
	updateUserParamsSchema,
	validateUpdateUserBody,
	validateUpdateUserParams,
	validateUserAuthorization,
	manualValidateUpdateUser,
	emailOnlySchema,
	nameOnlySchema,
	bioOnlySchema,
	locationOnlySchema,
	languageOnlySchema,
	portfolioOnlySchema,
	experienceOnlySchema,
};

export default validateUpdateUser;
