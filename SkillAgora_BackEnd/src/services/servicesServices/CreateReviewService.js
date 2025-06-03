import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

// Servicio para crear una nueva valoración de un servicio
const createReviewService = async (orderId, reviewerId, rating, comment) => {
    let pool;
    
    try {
        // Obtenemos la conexión a la base de datos
        pool = await getPool();

        if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
            throw generateErrorsUtils('El comentario es requerido', 400);
        }

        if (comment.length > 500) {
            throw generateErrorsUtils('El comentario no puede exceder los 500 caracteres', 400);
        }

        if (typeof rating !== 'number' || rating <= 0 || rating >= 5) {
            throw generateErrorsUtils('La puntuación debe estar entre 1 y 5', 400);
        }

        // Verificamos que el pedido existe y pertenece al usuario
        const [order] = await pool.query(
            `SELECT o.*, s.user_id as freelancer_id 
             FROM orders o 
             JOIN services s ON o.services_id = s.id 
             WHERE o.id = ? AND o.client_id = ?`,
            [orderId, reviewerId]
        );

        // Si no existe el pedido o no pertenece al usuario
        if (!order.length) {
            throw generateErrorsUtils('Pedido no encontrado o no tienes permiso para valorarlo', 404);
        }

        // Verificamos que el pedido esté completado
        if (order[0].status !== 'completed') {
            throw generateErrorsUtils('Solo puedes valorar pedidos completados', 400);
        }

        // Verificamos que no exista una valoración previa
        const [existingReview] = await pool.query(
            'SELECT * FROM reviews WHERE order_id = ?',
            [orderId]
        );

        if (existingReview.length > 0) {
            throw generateErrorsUtils('Ya has valorado este pedido', 400);
        }

        // Insertamos la nueva valoración
        const [result] = await pool.query(
            'INSERT INTO reviews (order_id, rating, comment) VALUES (?, ?, ?)',
            [orderId, rating, comment]
        );

        // Notificamos al freelancer sobre la nueva valoración
        if (order[0].freelancer_id) {
            await pool.query(
                'INSERT INTO notification (user_id, content, type) VALUES (?, ?, ?)',
                [order[0].freelancer_id, 'Has recibido una nueva valoración', 'review']
            );
        }

        // Devolvemos el resultado de la operación
        return {
            orderId,
            rating,
            comment
        };


    } catch (error) {
        // Si hay error, lo mostramos en consola para debugging
        console.error('Error al crear la valoración:', error);
        
        // Re-lanzamos el error para que el controlador lo maneje
        throw error;
    }
};

// Explicación del servicio:
// - Valida los datos de entrada (puntuación y comentario)
// - Verifica que el pedido existe y pertenece al usuario
// - Comprueba que el pedido está completado
// - Evita valoraciones duplicadas
// - Crea la valoración en la base de datos
// - Notifica al freelancer sobre la nueva valoración

export default createReviewService;