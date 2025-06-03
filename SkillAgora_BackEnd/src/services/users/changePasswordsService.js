import getPool from "../../db/getPool.js";

const getUserById = async (id) => {
  const pool = await getPool();
  const [rows] = await pool.execute(`SELECT id, password FROM users WHERE id = ?`, [id]);
  return rows[0];
};

const updatePassword = async (id, hashedPassword) => {
  const pool = await getPool();
  await pool.execute(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
};

export default {
  getUserById,
  updatePassword,
};
