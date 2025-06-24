import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const selectUserById = async (nameQuery) => {
  const pool = await getPool();
  

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
                COALESCE(AVG(r.rating), 0) AS average_rating
                FROM users u
                LEFT JOIN orders o ON o.client_id = u.id
                LEFT JOIN reviews r ON r.order_id = o.id
                WHERE u.name LIKE ?  
                GROUP BY u.id

            `,
    [`%${nameQuery}%`]
  );
  if (userRow.length === 0) {
    throw generateErrorsUtils("Usuario no encontrado", 404);
  }
  const user = userRow[0];
  const [servicesRow] = await pool.query(
    `
                SELECT 
        s.id AS service_id,
        s.title, 
        s.description, 
        s.price,
        s.place,
        s.delivery_time_days,
        s.review_id,
        c.name AS category_name, 
        s.created_at,
        s.updated_at
      FROM services s
      JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = ?
                
            
            `,
    [user.id]
  );
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
  delete user.id; // Eliminar el ID del usuario para evitar conflictos con el ID de los servicios
  const userData = {
  email: user.email,
  name: user.name,
  lastName: user.lastName,
  avatar: user.avatar,
  role: user.role,
  bio: user.bio
};
  return {
      ...userData,
      services: servicesRow,
      average_rating,
      reviews: reviewsRow,  
      };
};

export default selectUserById;
