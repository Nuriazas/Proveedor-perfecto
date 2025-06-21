import updateServiceService from "../../services/servicesServices/UpdateServiceService.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import getPool from "../../db/getPool.js";
import getServiceDetailsByIdService from "../../services/servicesServices/getServiceDetailsByIdService.js";

const updateServiceController = async (req, res, next) => {
  const { action } = req.params;

  switch (action) {
    case "update":
      try {
        const { title, description, price, delivery_time_days, place } =
          req.body;
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
          throw generateErrorsUtils("Service ID is required.", 400);
        }

      const fieldsToUpdate = req.body;

      console.log("🚨 Campos para actualizar:", fieldsToUpdate);

       
       
      const result = await updateServiceService(fieldsToUpdate, id, userId);

      const updatedService = await getServiceDetailsByIdService(id);

        const updateService = await getServiceDetailsByIdService(id);

        console.log(
          "✅ Datos del servicio actualizado que se enviarán al cliente:",
          updateService
        );

        res.status(200).json({
          success: true,
          message: "Service update successfully",
          service: updateService,
        });
      } catch (error) {
        next(error);
      }
      break;

    case "delete":
      try {
        const userId = req.user.id;
        const { serviceId } = req.params;

        if (!serviceId) {
          // ✅ Corregido nombre de variable
          throw generateErrorsUtils("Service ID is required.", 400);
        }

        const pool = await getPool();

        // ✅ Verificar que el servicio pertenezca al usuario
        const [service] = await pool.query(
          "SELECT user_id FROM services WHERE id = ?",
          [serviceId]
        );

        if (service.length === 0) {
          throw generateErrorsUtils("Service not found.", 404);
        }

        if (service[0].user_id !== userId) {
          throw generateErrorsUtils(
            "Unauthorized: You don't own this service.",
            403
          );
        }

        // ✅ Eliminar el servicio
        const [result] = await pool.execute(
          "DELETE FROM services WHERE id = ?",
          [id]
        );

        if (result.affectedRows === 0) {
          throw generateErrorsUtils("Delete failed: Service not deleted.", 500);
        }

        res.status(200).json({
          success: true,
          message: "Service deleted successfully",
        });
      } catch (error) {
        next(error);
      }
      break;

    default:
      res.status(400).json({
        success: false,
        message: "Invalid action. Use 'update' or 'delete'.",
      });
  }
};

export default updateServiceController;
