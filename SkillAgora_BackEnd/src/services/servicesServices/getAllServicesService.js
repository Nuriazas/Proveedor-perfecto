import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";

const getAllServicesService = async () => {
	try {
		const pool = await getPool();
		const query = `
            SELECT * FROM services
            JOIN users ON services.user_id = users.id
            JOIN categories ON services.category_id = categories.id
            ORDER BY services.created_at DESC
        `;

		const [rows] = await pool.execute(query);
		if (rows.length === 0) {
			throw generateErrorsUtils("No services found", 404);
		}

		return rows;
	} catch (error) {
		console.error("Error in getAllServicesService:", error);
		throw generateErrorsUtils("Error retrieving services", 500);
	}
};

export default getAllServicesService;
