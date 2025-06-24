import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import getOrderByIdService from "../ordersServices/getOrderByIdService.js";

// Servicio para crear una nueva valoración de un servicio
const createReviewService = async (orderId, reviewerId, rating, comment) => {
  try {
    const pool = await getPool();

    if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
      throw generateErrorsUtils("El comentario es requerido", 400);
    }

    if (comment.length > 500) {
      throw generateErrorsUtils("El comentario no puede exceder los 500 caracteres", 400);
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw generateErrorsUtils("La puntuación debe estar entre 1 y 5", 400);
    }

    // Usamos getOrderByIdService para validar que la orden existe, pertenece al usuario y obtener datos
    const order = await getOrderByIdService(orderId, reviewerId);

    if (order.status !== "delivered") {
      throw generateErrorsUtils("Solo puedes valorar pedidos completados", 400);
    }

    // Verificamos que no exista una valoración previa para esta orden
    const [existingReview] = await pool.query(
      "SELECT * FROM reviews WHERE order_id = ?",
      [orderId]
    );

    if (existingReview.length > 0) {
      throw generateErrorsUtils("Ya has valorado este pedido", 400);
    }

    // Insertamos la nueva valoración
    await pool.query(
      "INSERT INTO reviews (order_id, rating, comment, service_id, , reviewer_id) VALUES (?, ?, ?, ?, ?)",
      [orderId, rating, comment, order.service_id, reviewerId]
    );

    // Notificamos al freelancer sobre la nueva valoración
    if (order.freelancer_id) {
      await pool.query(
        "INSERT INTO notification (user_id, content, type) VALUES (?, ?, ?)",
        [order.freelancer_id, "Has recibido una nueva valoración", "review"]
      );
    }

    return {
      orderId,
      rating,
      comment,
    };
  } catch (error) {
    console.error("Error al crear la valoración:", error);
    throw error;
  }
};

export default createReviewService;