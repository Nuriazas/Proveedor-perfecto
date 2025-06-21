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
                name VARCHAR(50) DEFAULT NULL,
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

            )
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) UNIQUE)
            `);

    await pool.query(`
        INSERT INTO categories (name) VALUES 
                ('Diseño gráfico'),
                ('Desarrollo web'),
                ('Marketing digital'),
                ('Redacción y traducción'),
                ('Vídeo y animación'),
                ('Música y audio'),
                ('Programación'),
                ('Diseño UI/UX'),
                ('Consultoría empresarial'),
                ('Gestión de redes sociales'),
                ('SEO'),
                ('Publicidad en redes'),
                ('Edición de video'),
                ('Animación 2D'),
                ('Animación 3D'),
                ('Modelado 3D'),
                ('Diseño de logos'),
                ('Diseño de presentaciones'),
                ('Diseño de productos'),
                ('Diseño de apps móviles'),
                ('Copywriting'),
                ('Corrección de textos'),
                ('Traducción de idiomas'),
                ('Voice-over'),
                ('Composición musical'),
                ('Producción de podcasts'),
                ('Diseño de portadas'),
                ('Email marketing'),
                ('Gestión de proyectos'),
                ('Automatización con IA'),
                ('Creación de tiendas online'),
                ('Consultoría financiera'),
                ('Diseño de CV'),
                ('Consultoría de RRHH'),
                ('Servicios legales'),
                ('Análisis de datos'),
                ('Scraping web'),
                ('Machine learning'),
                ('Soporte técnico'),
                ('Testing de software'),
                ('Ciberseguridad'),
                ('Asistente virtual'),
                ('Clases particulares'),
                ('Mentoría profesional'),
                ('Diseño de interiores'),
                ('Diseño de moda'),
                ('Fotografía'),
                ('Gestión de comunidades'),
                ('Arquitectura'),
                ('NFT y Web3')
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT,
                services_id INT,
                freelancer_id INT,
                status ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
                total_price DECIMAL(10,2),
                ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                currency_code VARCHAR(10) DEFAULT 'USD',
                FOREIGN KEY (services_id) REFERENCES services(id) ON DELETE CASCADE,
                FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS order_deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                order_id INT,
                message TEXT,
                file_url VARCHAR(255),
                delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
        service_id INT,
        reviewer_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);
    await pool.query(`
                    CREATE TABLE IF NOT EXISTS notification (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                content TEXT,
                type ENUM(
                    'order', 
                    'message', 
                    'system',
                    'review', 
                    'contact_request', 
                    'support'
                ) DEFAULT 'system',
                status ENUM(
                    'contact_request_accepted', 
                    'contact_request_rejected', 
                    'contact_request_pending', 
                    'order_placed', 
                    'order_delivered', 
                    'order_completed', 
                    'order_cancelled',
                    'order_in_progress',
                    'review_received', 
                    'message_received', 
                    'system_update'
                ) DEFAULT 'contact_request_pending',
                is_read BOOLEAN DEFAULT FALSE,
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP NULL,
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
                    INSERT INTO users (name, lastName, email, password, is_admin, active)
                    VALUES ('Admin', 'Admin', ?, ?, true, true)
                `,
        [process.env.ADMIN_EMAIL, hashedPassword]
      );
    };

    const createTestUsers = async () => {
      const defaultPassword = await bcrypt.hash("12312312", 10);

      // Crear cliente
      await pool.query(
        `
				INSERT INTO users (name, lastName, email, password, role, active, bio, location, language)
				VALUES ('Juan', 'Pérez', 'cliente@test.com', ?, 'client', true, 'Cliente interesado en servicios de calidad', 'Madrid, España', 'Español')
			`,
        [defaultPassword]
      );

      // Crear 8 freelancers
      const freelancers = [
        {
          name: "Ana",
          lastName: "García",
          email: "ana.garcia@test.com",
          bio: "Diseñadora gráfica con más de 5 años de experiencia en branding y diseño web.",
          experience:
            "Especializada en diseño de logos, identidad corporativa y diseño web responsive.",
          location: "Barcelona, España",
          language: "Español",
          portfolio_url: "https://portfolio-ana.com",
        },
        {
          name: "Carlos",
          lastName: "Martínez",
          email: "carlos.martinez@test.com",
          bio: "Desarrollador Full Stack especializado en JavaScript y frameworks modernos.",
          experience:
            "Experto en React, Node.js, y bases de datos. Más de 4 años desarrollando aplicaciones web.",
          location: "Valencia, España",
          language: "Español",
          portfolio_url: "https://portfolio-carlos.com",
        },
        {
          name: "María",
          lastName: "López",
          email: "maria.lopez@test.com",
          bio: "Especialista en marketing digital y gestión de redes sociales.",
          experience:
            "Gestión de campañas publicitarias en Google Ads y Facebook Ads durante 3 años.",
          location: "Sevilla, España",
          language: "Español",
          portfolio_url: "https://portfolio-maria.com",
        },
        {
          name: "David",
          lastName: "Fernández",
          email: "david.fernandez@test.com",
          bio: "Traductor profesional especializado en inglés-español.",
          experience:
            "Traductor certificado con más de 6 años de experiencia en textos técnicos y comerciales.",
          location: "Bilbao, España",
          language: "Español",
          portfolio_url: "https://portfolio-david.com",
        },
        {
          name: "Laura",
          lastName: "Sánchez",
          email: "laura.sanchez@test.com",
          bio: "Editora de video y animadora 2D con pasión por contar historias visuales.",
          experience:
            "Especializada en edición de video corporativo y animaciones para redes sociales.",
          location: "Zaragoza, España",
          language: "Español",
          portfolio_url: "https://portfolio-laura.com",
        },
        {
          name: "Sergio",
          lastName: "Ruiz",
          email: "sergio.ruiz@test.com",
          bio: "Productor musical y especialista en audio con estudio propio.",
          experience:
            "Producción musical, mezcla y masterización. Voice-over para publicidad y podcasts.",
          location: "Málaga, España",
          language: "Español",
          portfolio_url: "https://portfolio-sergio.com",
        },
        {
          name: "Elena",
          lastName: "Jiménez",
          email: "elena.jimenez@test.com",
          bio: "Programadora especializada en Python y análisis de datos.",
          experience:
            "Desarrollo de aplicaciones web, scripts de automatización y análisis de datos con Python.",
          location: "Granada, España",
          language: "Español",
          portfolio_url: "https://portfolio-elena.com",
        },
        {
          name: "Alberto",
          lastName: "Torres",
          email: "alberto.torres@test.com",
          bio: "Diseñador UI/UX enfocado en crear experiencias digitales intuitivas.",
          experience:
            "Diseño de interfaces para aplicaciones móviles y web, prototipado y testing de usuario.",
          location: "Murcia, España",
          language: "Español",
          portfolio_url: "https://portfolio-alberto.com",
        },
      ];

      for (const freelancer of freelancers) {
        await pool.query(
          `
					INSERT INTO users (name, lastName, email, password, role, active, bio, experience, location, language, portfolio_url)
					VALUES (?, ?, ?, ?, 'freelancer', true, ?, ?, ?, ?, ?)
				`,
          [
            freelancer.name,
            freelancer.lastName,
            freelancer.email,
            defaultPassword,
            freelancer.bio,
            freelancer.experience,
            freelancer.location,
            freelancer.language,
            freelancer.portfolio_url,
          ]
        );
      }
    };

    const createServices = async () => {
      const services = [
        // Ana García - Diseño gráfico (ID: 3)
        {
          user_id: 3,
          category_id: 1,
          place: "Remoto",
          title: "Diseño de logo profesional",
          description:
            "Creo logos únicos y memorables para tu marca. Incluye 3 propuestas iniciales, revisiones ilimitadas y archivos en alta resolución.",
          price: 150.0,
          delivery_time_days: 5,
        },
        {
          user_id: 3,
          category_id: 17,
          place: "Remoto",
          title: "Identidad corporativa completa",
          description:
            "Desarrollo completo de identidad visual: logo, tarjetas de visita, papelería, manual de marca y más.",
          price: 450.0,
          delivery_time_days: 10,
        },

        // Carlos Martínez - Desarrollo web (ID: 4)
        {
          user_id: 4,
          category_id: 2,
          place: "Remoto",
          title: "Desarrollo de página web responsive",
          description:
            "Desarrollo de sitio web profesional y responsive usando React y Node.js. Incluye diseño moderno y optimización SEO.",
          price: 800.0,
          delivery_time_days: 15,
        },
        {
          user_id: 4,
          category_id: 7,
          place: "Remoto",
          title: "Aplicación web personalizada",
          description:
            "Desarrollo de aplicación web completa con panel de administración, base de datos y funcionalidades avanzadas.",
          price: 1200.0,
          delivery_time_days: 20,
        },

        // María López - Marketing digital (ID: 5)
        {
          user_id: 5,
          category_id: 3,
          place: "Remoto",
          title: "Gestión de redes sociales",
          description:
            "Gestión completa de redes sociales: creación de contenido, programación de posts y análisis de métricas.",
          price: 300.0,
          delivery_time_days: 30,
        },
        {
          user_id: 5,
          category_id: 10,
          place: "Remoto",
          title: "Campaña de Google Ads",
          description:
            "Configuración y optimización de campañas publicitarias en Google Ads con seguimiento y reportes detallados.",
          price: 250.0,
          delivery_time_days: 7,
        },

        // David Fernández - Traducción (ID: 6)
        {
          user_id: 6,
          category_id: 4,
          place: "Remoto",
          title: "Traducción inglés-español",
          description:
            "Traducción profesional de documentos técnicos, comerciales o académicos. Garantía de calidad y confidencialidad.",
          price: 0.12,
          delivery_time_days: 3,
        },
        {
          user_id: 6,
          category_id: 23,
          place: "Remoto",
          title: "Corrección y edición de textos",
          description:
            "Corrección ortográfica, gramatical y de estilo para textos en español. Mejoro la claridad y fluidez de tus contenidos.",
          price: 80.0,
          delivery_time_days: 2,
        },

        // Laura Sánchez - Video (ID: 7)
        {
          user_id: 7,
          category_id: 5,
          place: "Remoto",
          title: "Edición de video profesional",
          description:
            "Edición de videos corporativos, publicitarios o personales. Incluye efectos, transiciones, color grading y audio.",
          price: 200.0,
          delivery_time_days: 7,
        },
        {
          user_id: 7,
          category_id: 14,
          place: "Remoto",
          title: "Animación 2D para redes sociales",
          description:
            "Creación de animaciones 2D atractivas para redes sociales, explicativas o promocionales de tu marca.",
          price: 180.0,
          delivery_time_days: 5,
        },

        // Sergio Ruiz - Audio (ID: 8)
        {
          user_id: 8,
          category_id: 6,
          place: "Remoto",
          title: "Producción musical completa",
          description:
            "Producción musical profesional desde la idea hasta el master final. Incluye grabación, mezcla y masterización.",
          price: 500.0,
          delivery_time_days: 14,
        },
        {
          user_id: 8,
          category_id: 24,
          place: "Remoto",
          title: "Voice-over profesional",
          description:
            "Grabación de voice-over para publicidad, documentales, e-learning o presentaciones con mi voz masculina profesional.",
          price: 120.0,
          delivery_time_days: 3,
        },

        // Elena Jiménez - Programación (ID: 9)
        {
          user_id: 9,
          category_id: 7,
          place: "Remoto",
          title: "Script de automatización Python",
          description:
            "Desarrollo de scripts personalizados en Python para automatizar tareas repetitivas y mejorar la productividad.",
          price: 180.0,
          delivery_time_days: 5,
        },
        {
          user_id: 9,
          category_id: 36,
          place: "Remoto",
          title: "Análisis de datos y visualización",
          description:
            "Análisis completo de datos con Python, pandas y matplotlib. Incluye gráficos y reportes personalizados.",
          price: 300.0,
          delivery_time_days: 8,
        },

        // Alberto Torres - UI/UX (ID: 10)
        {
          user_id: 10,
          category_id: 8,
          place: "Remoto",
          title: "Diseño UI/UX para app móvil",
          description:
            "Diseño completo de interfaz y experiencia de usuario para aplicaciones móviles. Incluye wireframes y prototipos.",
          price: 600.0,
          delivery_time_days: 12,
        },
        {
          user_id: 10,
          category_id: 20,
          place: "Remoto",
          title: "Prototipo interactivo web",
          description:
            "Creación de prototipos interactivos para sitios web usando Figma con todas las interacciones y flujos de usuario.",
          price: 350.0,
          delivery_time_days: 8,
        },
      ];

      for (const service of services) {
        await pool.query(
          `
					INSERT INTO services (user_id, category_id, place, title, description, price, delivery_time_days)
					VALUES (?, ?, ?, ?, ?, ?, ?)
				`,
          [
            service.user_id,
            service.category_id,
            service.place,
            service.title,
            service.description,
            service.price,
            service.delivery_time_days,
          ]
        );
      }
    };

    const createOrders = async () => {
      // Crear una orden para el primer servicio de cada freelancer (servicios con ID impar)
      // El cliente tiene ID 2, los freelancers empiezan desde ID 3
      const orders = [
        { client_id: 2, services_id: 1, freelancer_id: 3, total_price: 150.0 }, // Ana García - Logo
        { client_id: 2, services_id: 3, freelancer_id: 4, total_price: 800.0 }, // Carlos - Web
        { client_id: 2, services_id: 5, freelancer_id: 5, total_price: 300.0 }, // María - RRSS
        { client_id: 2, services_id: 7, freelancer_id: 6, total_price: 120.0 }, // David - Traducción (1000 palabras)
        { client_id: 2, services_id: 9, freelancer_id: 7, total_price: 200.0 }, // Laura - Video
        { client_id: 2, services_id: 11, freelancer_id: 8, total_price: 500.0 }, // Sergio - Música
        { client_id: 2, services_id: 13, freelancer_id: 9, total_price: 180.0 }, // Elena - Python
        {
          client_id: 2,
          services_id: 15,
          freelancer_id: 10,
          total_price: 600.0,
        }, // Alberto - UI/UX
      ];

      for (const order of orders) {
        await pool.query(
          `
					INSERT INTO orders (client_id, services_id, freelancer_id, total_price)
					VALUES (?, ?, ?, ?)
				`,
          [
            order.client_id,
            order.services_id,
            order.freelancer_id,
            order.total_price,
          ]
        );
      }
    };

    const createContactRequests = async () => {
      // Crear notificaciones de contact request del cliente hacia cada freelancer
      // El cliente tiene ID 2, los freelancers empiezan desde ID 3
      const contactMessages = [
        {
          user_id: 3,
          content:
            "Hola Ana, me interesa tu trabajo de diseño gráfico. ¿Podrías ayudarme con el branding de mi empresa?",
        },
        {
          user_id: 4,
          content:
            "Hola Carlos, necesito desarrollar una plataforma web para mi negocio. ¿Tienes disponibilidad?",
        },
        {
          user_id: 5,
          content:
            "Hola María, quiero mejorar la presencia en redes sociales de mi marca. ¿Podemos hablar?",
        },
        {
          user_id: 6,
          content:
            "Hola David, tengo varios documentos técnicos que necesito traducir al español. ¿Cuál sería tu tarifa?",
        },
        {
          user_id: 7,
          content:
            "Hola Laura, me gustaría que editaras un video promocional para mi empresa. ¿Podrías ayudarme?",
        },
        {
          user_id: 8,
          content:
            "Hola Sergio, necesito una pista musical original para un proyecto comercial. ¿Trabajas con ese tipo de encargos?",
        },
        {
          user_id: 9,
          content:
            "Hola Elena, requiero automatizar algunos procesos en mi empresa con Python. ¿Podrías asesorarme?",
        },
        {
          user_id: 10,
          content:
            "Hola Alberto, estoy planificando una app móvil y necesito un buen diseño UI/UX. ¿Te interesaría el proyecto?",
        },
      ];

      for (const message of contactMessages) {
        await pool.query(
          `
					INSERT INTO notification (user_id, content, type, status)
					VALUES (?, ?, 'contact_request', 'contact_request_pending')
				`,
          [message.user_id, message.content]
        );
      }
    };

    console.log("Tablas creadas!");
    console.log("Creando usuario admin...");
    await createAdminUser();
    console.log("Creando usuarios de prueba...");
    await createTestUsers();
    console.log("Creando servicios...");
    await createServices();
    console.log("Creando órdenes...");
    await createOrders();
    console.log("Creando contact requests...");
    await createContactRequests();
    console.log("¡Base de datos inicializada con datos de prueba!");
  } catch (error) {
    console.log(error);
  }
};

initDb();
