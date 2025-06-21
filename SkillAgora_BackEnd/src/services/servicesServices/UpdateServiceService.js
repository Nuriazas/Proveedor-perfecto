import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const updateServiceService = async (
 fieldsToUpdate, id, userId
) => {
  const pool = await getPool();

  try {
    // 1. Verificamos que el servicio exista y pertenezca al usuario logueado
    const [service] = await pool.query(
      "SELECT user_id FROM services WHERE id = ?", // ✅ Campo correcto
      [id] // ✅ Parámetro correcto
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

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw generateErrorsUtils("No fields to update.", 400);
    }

    // Siempre actualizamos updated_at
    fields.push("updated_at = NOW()");

    const query = `UPDATE services SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      throw generateErrorsUtils("Update failed: Service not updated.", 500);
    }

    return result;
  } catch (error) {
    throw generateErrorsUtils("Error updating service: " + error.message, 500);
  }
};

export default updateServiceService;
