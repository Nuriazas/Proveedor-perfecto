import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const contactProvider = async (req, res, next) => {
  try {
    const { name, email, company, message } = req.body;

    // Validaciones básicas
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw generateErrorsUtils("Faltan datos obligatorios", 400);
    }

    const pool = await getPool();

    // Insertar en la base de datos
    await pool.query(
      `INSERT INTO contact_requests (name, email, company, message) VALUES (?, ?, ?, ?)`,
      [name, email, company || null, message]
    );

    res.status(201).json({
      status: "ok",
      message: "Solicitud de contacto enviada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

export default contactProvider;
