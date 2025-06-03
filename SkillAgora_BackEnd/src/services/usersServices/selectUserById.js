import getPool from "../../db/getPool.js";

const selectUserById = async (userId) => {
  const pool = await getPool();

  const [rows] = await pool.query(
    `SELECT id, name, firstName, lastName, email, avatar, active, role,
     bio, experience, portfolio_url, location, language, created_at
     FROM users
     WHERE id = ?`,
    [userId]
  );

  return rows[0];
};

export default selectUserById;