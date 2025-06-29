import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import priceUtils from "../../utils/priceUtils.js";

const selectUserByIdService = async (userId) => {
  const pool = await getPool();
  
  console.log("🔍 Buscando usuario con ID:", userId);

  const [userRow] = await pool.query(
    `
    SELECT 
      u.id, 
      u.email,
      u.name,
      u.lastName,
      u.avatar,
      u.role,
      u.bio,
      u.active,
      u.is_admin,
      u.created_at
    FROM users u
    WHERE u.id = ?
    `,
    [userId]
  );
  
  if (userRow.length === 0) {
    throw generateErrorsUtils("Usuario no encontrado", 404);
  }
  
  const user = userRow[0];
  
  // Obtener servicios del usuario
  const [servicesRow] = await pool.query(
    `
    SELECT 
      s.id AS service_id,
      s.title, 
      s.description, 
      s.price,
      s.place,
      s.delivery_time_days,
      c.name AS category_name, 
      s.created_at,
      s.updated_at
    FROM services s
    JOIN categories c ON s.category_id = c.id
    WHERE s.user_id = ?
    `,
    [user.id]
  );
  
  // Obtener rating promedio
  const [avgRatingResult] = await pool.query(
    `
    SELECT COALESCE(AVG(r.rating), 0) AS average_rating
    FROM services s
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE s.user_id = ?
    `,
    [user.id]
  );

  const average_rating = avgRatingResult[0].average_rating;

  // Obtener reviews
  const [reviewsRow] = await pool.query(
    `
    SELECT 
      r.id AS review_id,
      r.comment,
      r.rating,
      r.created_at,
      r.order_id,
      r.service_id,
      s.title AS service_title,
      u.name AS reviewer_name
    FROM reviews r
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN users u ON r.reviewer_id = u.id
    WHERE r.service_id IN (SELECT id FROM services WHERE user_id = ?)
    ORDER BY r.created_at DESC
    `,
    [user.id]
  );
  
  // Preparar datos del usuario (sin el ID para evitar conflictos)
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    avatar: user.avatar,
    role: user.role,
    bio: user.bio,
    active: user.active,
    is_admin: user.is_admin,
    created_at: user.created_at
  };

  // Procesar servicios para agregar precios formateados
  const processedServices = servicesRow.map(service => ({
    ...service,
    price_formatted: priceUtils.formatPrice(service.price, 'USD'),
    price_number: parseFloat(service.price) || 0
  }));
  
  return {
    ...userData,
    services: processedServices,
    average_rating,
    reviews: reviewsRow,  
  };
};

export default selectUserByIdService; 