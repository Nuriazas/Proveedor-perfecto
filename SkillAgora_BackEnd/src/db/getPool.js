import dotenv from "dotenv";
import mysql from "mysql2/promise";
import generateErrorsUtils from "../utils/generateErrorsUtils.js";

dotenv.config();

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_NAME } = process.env;

let pool;

const getPool = async () => {
	try {
		if (!pool) {
			// Crear el pool de conexiones
			const poolTemp = mysql.createPool({
				host: MYSQL_HOST,
				user: MYSQL_USER,
				password: MYSQL_PASS,
			});

			await poolTemp.query(`CREATE DATABASE IF NOT EXISTS ${MYSQL_NAME}`);
			pool = mysql.createPool({
				connectionLimit: 10,
				host: MYSQL_HOST,
				user: MYSQL_USER,
				password: MYSQL_PASS,
				database: MYSQL_NAME,
				timezone: "Z",
			});
		}

		return  pool; // Devolver el objeto pool directamente
	} catch (error) {
		console.log(error);
		throw generateErrorsUtils(
			"Error connecting to MySQL or database not found",
			400
		);
	}
};

export default getPool;
