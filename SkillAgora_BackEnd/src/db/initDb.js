import getPool from "./getPool.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const initDb = async () => {
	try {
		let pool = await getPool();

		console.log("Eliminando base de datos...");

		await pool.query("DROP DATABASE IF EXISTS SkillAgora");

		console.log("Creando base de datos SkillAgora...");

		await pool.query("CREATE DATABASE SkillAgora");

		await pool.query("USE SkillAgora");

		console.log("Borrando tablas...");

		await pool.query(
			"DROP TABLE IF EXISTS notification_history, user_portfolio, notification, reviews, order_deliveries, orders, service_media, services, categories, users"
		);

		console.log("Creando tablas...");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                firstName VARCHAR(50) DEFAULT NULL,
                lastName VARCHAR(50) DEFAULT NULL,
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255),
                avatar VARCHAR(100) DEFAULT NULL,
                active BOOLEAN DEFAULT false,
                role ENUM('client', 'freelancer') NOT NULL,
                registrationCode VARCHAR(250),
                recoverPassCode CHAR(10),
                is_admin BOOLEAN DEFAULT FALSE,
                bio TEXT,
                experience TEXT,
                portfolio_url VARCHAR(255),
                location VARCHAR(100),
                language VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    `);
		await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE)
            `);
		await pool.query(`
        CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                category_id INT,
                place VARCHAR(30),
                title VARCHAR(150),
                description TEXT,
                price DECIMAL(10, 2),
                delivery_time_days INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);
		await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT,
                services_id INT,
                status ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
                total_price DECIMAL(10,2),
                ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                currency_code VARCHAR(10) DEFAULT 'USD',
                FOREIGN KEY (services_id) REFERENCES services(id) ON DELETE CASCADE
                
        )
    `);
		await pool.query(`
            CREATE TABLE IF NOT EXISTS order_deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                message TEXT,
                file_url VARCHAR(255),
                delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )
            `);

		await pool.query(`
            CREATE TABLE IF NOT EXISTS service_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_id INT,
                media_url VARCHAR(255),
                type ENUM('image', 'video') DEFAULT 'image',
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
    `);
		await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            
    `);
		await pool.query(`
                    CREATE TABLE IF NOT EXISTS notification (
                id INT AUTO_INCREMENT PRIMARY KEY,

                -- Usuario al que se dirige la notificación
                user_id INT,

                -- Texto de la notificación
                content TEXT,

                -- Tipo de notificación (para distinguir la lógica: mensajes, pedidos, solicitudes de contacto, etc.)
                type ENUM(
                    'order', 
                    'message', 
                    'system', 
                    'review', 
                    'contact_request', 
                    'support'
                ) DEFAULT 'system',

                -- Estado específico dentro del tipo: por ejemplo, si es una solicitud de contacto puede estar aceptada, pendiente, etc.
                status ENUM(
                    'contact_request_accepted', 
                    'contact_request_rejected', 
                    'contact_request_pending', 
                    'order_placed', 
                    'order_delivered', 
                    'order_completed', 
                    'review_received', 
                    'message_received', 
                    'system_update'
                ) DEFAULT 'contact_request_pending',

                -- Si el usuario ya la leyó
                is_read BOOLEAN DEFAULT FALSE,

                -- Si se ha enviado un correo por esta notificación
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP NULL,

                -- Fecha de creación de la notificación
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);
		await pool.query(`
                CREATE TABLE freelancer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
                );
            `);

		await pool.query(`
            CREATE TABLE IF NOT EXISTS user_portfolio(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(150),
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            
            )
            `);
		await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                content TEXT,
                type ENUM('order', 'message', 'system', 'review', 'support', 'contact_request') DEFAULT 'system',
                status ENUM(
                    'contact_request_accepted', 
                    'contact_request_rejected', 
                    'contact_request_pending', 
                    'order_placed', 
                    'order_delivered', 
                    'order_completed', 
                    'review_received', 
                    'message_received', 
                    'system_update'
                ) DEFAULT 'contact_request_pending',
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);

		const createAdminUser = async () => {
			const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
			await pool.query(
				`
                    INSERT INTO users (name, firstName, lastName, email, password, is_admin, active)
                    VALUES ('Admin', 'Admin', 'Admin', ?, ?, true, true)
                `,
				[process.env.ADMIN_EMAIL, hashedPassword]
			);
		};

		console.log("Tablas creadas!");
		return createAdminUser();
	} catch (error) {
		console.log(error);
	}
};

initDb();
