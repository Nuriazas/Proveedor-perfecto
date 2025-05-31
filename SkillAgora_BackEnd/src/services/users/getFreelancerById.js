import getPool from "../../db/getPool.js";

async function getFreelancerById(id) {
	const pool = await getPool();
	try {
		const [freelancer] = await pool.query(
			`
              SELECT 
                id,
                name,
                email,
                avatar,
                bio,
                created_at
                FROM users
                WHERE role = 'freelancer' AND id = ?
                GROUP BY id;
            `,
			[id]
		);
		return freelancer[0];
	} catch (error) {
		throw new Error("Error al obtener el freelancer: " + error.message);
	}
}

export default getFreelancerById;