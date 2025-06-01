import getPool from "../../db/getPool.js";

const selectUserByEmailService = async (email) => {
	let pool = await getPool();

	const [user] = await pool.query(
		`SELECT email, password, active FROM users WHERE email = ?`,
		[email]
	);

	return user[0];
};

export default selectUserByEmailService;
