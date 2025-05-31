import getPool from "../../db/getPool.js";

async function getAllFreelancers() {
    const pool = await getPool();
    try {
      const [freelancers] = await pool.query(`
                SELECT 
                    id,
                    name,
                    email,
                    avatar,
                    bio,
                    created_at
                FROM users
                WHERE role = 'freelancer'
                GROUP BY id
            `);
      return freelancers;
    } catch (error) {
      throw new Error("Error al obtener los freelancers: " + error.message);
    }
}

export default getAllFreelancers;