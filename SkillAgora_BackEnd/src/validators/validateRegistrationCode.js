import Joi from "joi";

// Schema de validación para código de registro
const registrationCodeSchema = Joi.object({
	registrationCode: Joi.string()
		.trim()
		.min(10) // Ajusta según la longitud de tus códigos
		.max(255)
		.required()
		.messages({
			"string.empty": "El código de registro es requerido",
			"string.min": "El código de registro debe tener al menos 10 caracteres",
			"string.max": "El código de registro no puede exceder 255 caracteres",
			"any.required": "El código de registro es requerido",
		}),
});

// Middleware de validación para código de registro
const validateRegistrationCode = (req, res, next) => {
	const { error, value } = registrationCodeSchema.validate(req.params, {
		convert: true,
		stripUnknown: true,
	});

	if (error) {
		return res.status(400).json({
			status: "error",
			message: "Código de registro inválido",
			errors: error.details.map((detail) => ({
				field: detail.path[0],
				message: detail.message,
			})),
		});
	}

	req.params = value;
	next();
};

export default validateRegistrationCode;
