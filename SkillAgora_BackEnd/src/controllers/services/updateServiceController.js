import updateServiceService from "../../services/services/UpdateServiceService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateServiceController = async (req, res, next) => {
    try {
        // Obtenemos los datos del cuerpo de la solicitud
        const { id, title, description, price, delivery_time_days, place, category_id } = req.body;

        // Validamos que se haya proporcionado un ID
        if (!id) {
            throw generateErrorsUtils("Service ID is required.", 400);
        }

        // Llamamos al servicio para actualizar el servicio
        const result = await updateServiceService(
            id,
            title,
            description,
            price,
            delivery_time_days,
            place,
            category_id
        );

        // Enviamos la respuesta con el resultado de la actualización
        res.status(200).json({ message: "Service updated successfully", result });
    } catch (error) {
        next(error);
    }
}

export default updateServiceController;
