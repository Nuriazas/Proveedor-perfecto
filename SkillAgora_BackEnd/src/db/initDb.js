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
            
    // CREAR TABLAS SIN FOREIGN KEYS PRIMERO
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT,
            service_id INT,
            reviewer_id INT,
            rating INT CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
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
                review_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        delivery_url VARCHAR(500) DEFAULT NULL,
        delivered_at TIMESTAMP NULL DEFAULT NULL,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        currency_code VARCHAR(10) DEFAULT 'USD'
    )
`);
    
    await pool.query(`
            CREATE TABLE IF NOT EXISTS order_deliveries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                order_id INT,
                message TEXT,
                file_url VARCHAR(255),
                delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS service_media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_id INT,
                media_url VARCHAR(255),
                type ENUM('image', 'video') DEFAULT 'image'
            )
    `);
    
    // ✅ TABLA NOTIFICATION ACTUALIZADA CON SENDER_ID
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notification (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            sender_id INT DEFAULT NULL,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
    await pool.query(`
                CREATE TABLE freelancer_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS user_portfolio(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(150),
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            
            )
            `);
            
    // ✅ TABLA NOTIFICATION_HISTORY ACTUALIZADA CON SENDER_ID
    await pool.query(`
            CREATE TABLE IF NOT EXISTS notification_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                sender_id INT DEFAULT NULL,
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
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

    // AHORA AÑADIR TODAS LAS FOREIGN KEYS
    console.log("Añadiendo foreign keys...");
    
    // Services foreign keys
    await pool.query(`
        ALTER TABLE services 
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (category_id) REFERENCES categories(id),
        ADD FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE SET NULL
    `);
    
    // Orders foreign keys
    await pool.query(`
        ALTER TABLE orders 
        ADD FOREIGN KEY (services_id) REFERENCES services(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // Reviews foreign keys
    await pool.query(`
        ALTER TABLE reviews 
        ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // Order deliveries foreign keys
    await pool.query(`
        ALTER TABLE order_deliveries 
        ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // Service media foreign keys
    await pool.query(`
        ALTER TABLE service_media 
        ADD FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    `);
    
    // Notification foreign keys
    await pool.query(`
        ALTER TABLE notification 
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
    `);
    
    // Freelancer requests foreign keys
    await pool.query(`
        ALTER TABLE freelancer_requests 
        ADD FOREIGN KEY (user_id) REFERENCES users(id)
    `);
    
    // User portfolio foreign keys
    await pool.query(`
        ALTER TABLE user_portfolio 
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    
    // Notification history foreign keys
    await pool.query(`
        ALTER TABLE notification_history 
        ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        ADD FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
    `);

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

      // Crear 3 clientes
      const clients = [
        {
          name: "Juan",
          lastName: "Pérez",
          email: "cliente1@test.com",
          bio: "Emprendedor interesado en servicios digitales de calidad",
          location: "Madrid, España",
          language: "Español"
        },
        {
          name: "Laura",
          lastName: "Rodríguez", 
          email: "cliente2@test.com",
          bio: "Directora de marketing buscando servicios profesionales",
          location: "Barcelona, España",
          language: "Español"
        },
        {
          name: "Miguel",
          lastName: "González",
          email: "cliente3@test.com", 
          bio: "CEO de startup necesitando apoyo en desarrollo y diseño",
          location: "Valencia, España",
          language: "Español"
        }
      ];

      for (const client of clients) {
        await pool.query(
          `
          INSERT INTO users (name, lastName, email, password, role, active, bio, location, language)
          VALUES (?, ?, ?, ?, 'client', true, ?, ?, ?)
        `,
          [
            client.name,
            client.lastName,
            client.email,
            defaultPassword,
            client.bio,
            client.location,
            client.language,
          ]
        );
      }

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
        // Ana García - Diseño gráfico (ID: 5)
        {
          user_id: 5,
          category_id: 1,
          place: "Remoto",
          title: "Diseño de logo profesional",
          description: "Creo logos únicos y memorables para tu marca. Incluye 3 propuestas iniciales, revisiones ilimitadas y archivos en alta resolución.",
          price: 150.0,
          delivery_time_days: 5,
        },
        {
          user_id: 5,
          category_id: 17,
          place: "Remoto", 
          title: "Identidad corporativa completa",
          description: "Desarrollo completo de identidad visual: logo, tarjetas de visita, papelería, manual de marca y más.",
          price: 450.0,
          delivery_time_days: 10,
        },
        {
          user_id: 5,
          category_id: 1,
          place: "Remoto",
          title: "Diseño de brochure empresarial",
          description: "Diseño profesional de brochures corporativos con diseño atractivo y contenido optimizado.",
          price: 120.0,
          delivery_time_days: 4,
        },
        {
          user_id: 5,
          category_id: 27,
          place: "Remoto",
          title: "Diseño de portada de libro",
          description: "Diseño creativo de portadas para libros físicos y digitales que capten la atención del lector.",
          price: 200.0,
          delivery_time_days: 6,
        },

        // Carlos Martínez - Desarrollo web (ID: 6)
        {
          user_id: 6,
          category_id: 2,
          place: "Remoto",
          title: "Desarrollo de página web responsive",
          description: "Desarrollo de sitio web profesional y responsive usando React y Node.js. Incluye diseño moderno y optimización SEO.",
          price: 800.0,
          delivery_time_days: 15,
        },
        {
          user_id: 6,
          category_id: 7,
          place: "Remoto",
          title: "Aplicación web personalizada",
          description: "Desarrollo de aplicación web completa con panel de administración, base de datos y funcionalidades avanzadas.",
          price: 1200.0,
          delivery_time_days: 20,
        },
        {
          user_id: 6,
          category_id: 31,
          place: "Remoto",
          title: "Tienda online con Shopify",
          description: "Desarrollo completo de tienda online personalizada con Shopify, integración de pagos y optimización.",
          price: 600.0,
          delivery_time_days: 12,
        },
        {
          user_id: 6,
          category_id: 2,
          place: "Remoto",
          title: "Landing page de alta conversión",
          description: "Desarrollo de landing page optimizada para conversión con diseño atractivo y llamadas a la acción efectivas.",
          price: 300.0,
          delivery_time_days: 7,
        },

        // María López - Marketing digital (ID: 7)
        {
          user_id: 7,
          category_id: 3,
          place: "Remoto",
          title: "Gestión de redes sociales",
          description: "Gestión completa de redes sociales: creación de contenido, programación de posts y análisis de métricas.",
          price: 300.0,
          delivery_time_days: 30,
        },
        {
          user_id: 7,
          category_id: 12,
          place: "Remoto",
          title: "Campaña de Google Ads",
          description: "Configuración y optimización de campañas publicitarias en Google Ads con seguimiento y reportes detallados.",
          price: 250.0,
          delivery_time_days: 7,
        },
        {
          user_id: 7,
          category_id: 11,
          place: "Remoto",
          title: "Optimización SEO completa",
          description: "Auditoría SEO completa y optimización on-page para mejorar el posicionamiento en buscadores.",
          price: 400.0,
          delivery_time_days: 14,
        },
        {
          user_id: 7,
          category_id: 28,
          place: "Remoto",
          title: "Campaña de email marketing",
          description: "Diseño y configuración de campañas de email marketing automatizadas con alta tasa de apertura.",
          price: 180.0,
          delivery_time_days: 5,
        },

        // David Fernández - Traducción (ID: 8)
        {
          user_id: 8,
          category_id: 4,
          place: "Remoto",
          title: "Traducción inglés-español",
          description: "Traducción profesional de documentos técnicos, comerciales o académicos. Garantía de calidad y confidencialidad.",
          price: 0.12,
          delivery_time_days: 3,
        },
        {
          user_id: 8,
          category_id: 22,
          place: "Remoto",
          title: "Corrección y edición de textos",
          description: "Corrección ortográfica, gramatical y de estilo para textos en español. Mejoro la claridad y fluidez de tus contenidos.",
          price: 80.0,
          delivery_time_days: 2,
        },
        {
          user_id: 8,
          category_id: 21,
          place: "Remoto",
          title: "Copywriting persuasivo",
          description: "Redacción de textos publicitarios y comerciales que conviertan visitantes en clientes.",
          price: 150.0,
          delivery_time_days: 4,
        },
        {
          user_id: 8,
          category_id: 23,
          place: "Remoto",
          title: "Traducción técnica especializada",
          description: "Traducción de manuales técnicos, documentación científica y textos especializados.",
          price: 0.18,
          delivery_time_days: 5,
        },

        // Laura Sánchez - Video (ID: 9)
        {
          user_id: 9,
          category_id: 5,
          place: "Remoto",
          title: "Edición de video profesional",
          description: "Edición de videos corporativos, publicitarios o personales. Incluye efectos, transiciones, color grading y audio.",
          price: 200.0,
          delivery_time_days: 7,
        },
        {
          user_id: 9,
          category_id: 14,
          place: "Remoto",
          title: "Animación 2D para redes sociales",
          description: "Creación de animaciones 2D atractivas para redes sociales, explicativas o promocionales de tu marca.",
          price: 180.0,
          delivery_time_days: 5,
        },
        {
          user_id: 9,
          category_id: 13,
          place: "Remoto",
          title: "Video promocional para empresa",
          description: "Creación de video promocional profesional para empresas con guión, edición y efectos visuales.",
          price: 350.0,
          delivery_time_days: 10,
        },
        {
          user_id: 9,
          category_id: 15,
          place: "Remoto",
          title: "Animación 3D de producto",
          description: "Animación 3D profesional para mostrar productos desde todos los ángulos con movimientos fluidos.",
          price: 500.0,
          delivery_time_days: 14,
        },

        // Sergio Ruiz - Audio (ID: 10)
        {
          user_id: 10,
          category_id: 6,
          place: "Remoto",
          title: "Producción musical completa",
          description: "Producción musical profesional desde la idea hasta el master final. Incluye grabación, mezcla y masterización.",
          price: 500.0,
          delivery_time_days: 14,
        },
        {
          user_id: 10,
          category_id: 24,
          place: "Remoto",
          title: "Voice-over profesional",
          description: "Grabación de voice-over para publicidad, documentales, e-learning o presentaciones con mi voz masculina profesional.",
          price: 120.0,
          delivery_time_days: 3,
        },
        {
          user_id: 10,
          category_id: 25,
          place: "Remoto",
          title: "Composición musical original",
          description: "Composición de música original para videojuegos, publicidad, cortometrajes o proyectos personales.",
          price: 300.0,
          delivery_time_days: 10,
        },
        {
          user_id: 10,
          category_id: 26,
          place: "Remoto",
          title: "Producción de podcast",
          description: "Producción completa de podcast: grabación, edición, mezcla y masterización con calidad profesional.",
          price: 150.0,
          delivery_time_days: 5,
        },

        // Elena Jiménez - Programación (ID: 11)
        {
          user_id: 11,
          category_id: 7,
          place: "Remoto",
          title: "Script de automatización Python",
          description: "Desarrollo de scripts personalizados en Python para automatizar tareas repetitivas y mejorar la productividad.",
          price: 180.0,
          delivery_time_days: 5,
        },
        {
          user_id: 11,
          category_id: 36,
          place: "Remoto",
          title: "Análisis de datos y visualización",
          description: "Análisis completo de datos con Python, pandas y matplotlib. Incluye gráficos y reportes personalizados.",
          price: 300.0,
          delivery_time_days: 8,
        },
        {
          user_id: 11,
          category_id: 37,
          place: "Remoto",
          title: "Web scraping personalizado",
          description: "Desarrollo de herramientas de web scraping para extraer datos de sitios web de forma automatizada.",
          price: 250.0,
          delivery_time_days: 6,
        },
        {
          user_id: 11,
          category_id: 38,
          place: "Remoto",
          title: "Modelo de Machine Learning",
          description: "Desarrollo de modelos de machine learning personalizados para clasificación, predicción o análisis de datos.",
          price: 600.0,
          delivery_time_days: 15,
        },

        // Alberto Torres - UI/UX (ID: 12)
        {
          user_id: 12,
          category_id: 8,
          place: "Remoto",
          title: "Diseño UI/UX para app móvil",
          description: "Diseño completo de interfaz y experiencia de usuario para aplicaciones móviles. Incluye wireframes y prototipos.",
          price: 600.0,
          delivery_time_days: 12,
        },
        {
          user_id: 12,
          category_id: 20,
          place: "Remoto",
          title: "Prototipo interactivo web",
          description: "Creación de prototipos interactivos para sitios web usando Figma con todas las interacciones y flujos de usuario.",
          price: 350.0,
          delivery_time_days: 8,
        },
        {
          user_id: 12,
          category_id: 8,
          place: "Remoto",
          title: "Rediseño de interfaz web",
          description: "Rediseño completo de interfaz web existente mejorando usabilidad y experiencia de usuario.",
          price: 450.0,
          delivery_time_days: 10,
        },
        {
          user_id: 12,
          category_id: 20,
          place: "Remoto", 
          title: "Diseño de dashboard administrativo",
          description: "Diseño de dashboard moderno y funcional para paneles de administración con excelente UX.",
          price: 400.0,
          delivery_time_days: 9,
        }
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
      // Cada cliente (IDs 2, 3, 4) hace 4 órdenes, total 12 órdenes
      const orders = [
        // Cliente 1 (ID: 2) - 4 órdenes
        { client_id: 2, services_id: 1, freelancer_id: 5, total_price: 150.0, status: 'delivered' }, // Ana - Logo
        { client_id: 2, services_id: 5, freelancer_id: 6, total_price: 800.0, status: 'delivered' }, // Carlos - Web
        { client_id: 2, services_id: 9, freelancer_id: 7, total_price: 300.0, status: 'delivered' }, // María - RRSS
        { client_id: 2, services_id: 13, freelancer_id: 8, total_price: 120.0, status: 'pending' }, // David - Traducción

        // Cliente 2 (ID: 3) - 4 órdenes  
        { client_id: 3, services_id: 17, freelancer_id: 9, total_price: 200.0, status: 'delivered' }, // Laura - Video
        { client_id: 3, services_id: 21, freelancer_id: 10, total_price: 500.0, status: 'delivered' }, // Sergio - Música
        { client_id: 3, services_id: 25, freelancer_id: 11, total_price: 180.0, status: 'in_progress' }, // Elena - Python
        { client_id: 3, services_id: 29, freelancer_id: 12, total_price: 600.0, status: 'pending' }, // Alberto - UI/UX

        // Cliente 3 (ID: 4) - 4 órdenes
        { client_id: 4, services_id: 2, freelancer_id: 5, total_price: 450.0, status: 'delivered' }, // Ana - Identidad
        { client_id: 4, services_id: 7, freelancer_id: 6, total_price: 600.0, status: 'delivered' }, // Carlos - Tienda
        { client_id: 4, services_id: 11, freelancer_id: 7, total_price: 400.0, status: 'completed' }, // María - SEO
        { client_id: 4, services_id: 19, freelancer_id: 9, total_price: 350.0, status: 'in_progress' } // Laura - Video promocional
      ];

      for (const order of orders) {
        await pool.query(
          `
					INSERT INTO orders (client_id, services_id, freelancer_id, total_price, status)
					VALUES (?, ?, ?, ?, ?)
				`,
          [
            order.client_id,
            order.services_id,
            order.freelancer_id,
            order.total_price,
            order.status
          ]
        );
      }
    };

    const createReviews = async () => {
      // Crear reviews solo para las órdenes que están en estado 'delivered'
      const reviews = [
        // Cliente 1 reviews (órdenes delivered: 1, 2, 3)
        {
          order_id: 1,
          service_id: 1, 
          reviewer_id: 2,
          rating: 5,
          comment: "Excelente trabajo en el diseño del logo. Ana entendió perfectamente lo que buscaba y el resultado superó mis expectativas. Muy profesional y cumplió los tiempos acordados."
        },
        {
          order_id: 2,
          service_id: 5,
          reviewer_id: 2, 
          rating: 5,
          comment: "Carlos desarrolló exactamente la web que necesitaba. Muy técnico, buena comunicación y el sitio quedó responsive y optimizado. Totalmente recomendable."
        },
        {
          order_id: 3,
          service_id: 9,
          reviewer_id: 2,
          rating: 4,
          comment: "María hizo un gran trabajo gestionando nuestras redes sociales. Incrementó notablemente nuestro engagement. Solo pequeños detalles de mejora pero muy satisfecho en general."
        },

        // Cliente 2 reviews (órdenes delivered: 5, 6)
        {
          order_id: 5,
          service_id: 17,
          reviewer_id: 3,
          rating: 5,
          comment: "Laura editó nuestro video corporativo de manera espectacular. Gran creatividad, excelente timing y acabado muy profesional. Sin duda volveré a trabajar con ella."
        },
        {
          order_id: 6,
          service_id: 21,
          reviewer_id: 3,
          rating: 4,
          comment: "Sergio creó una banda sonora original increíble para nuestro proyecto. Muy talentoso y profesional, aunque tardó un poco más de lo esperado. El resultado final valió la pena."
        },

        // Cliente 3 reviews (órdenes delivered: 9, 10)
        {
          order_id: 9,
          service_id: 2,
          reviewer_id: 4,
          rating: 5,
          comment: "Ana desarrolló una identidad corporativa completa impresionante. Cada elemento está perfectamente diseñado y cohesionado. Superó ampliamente nuestras expectativas."
        },
        {
          order_id: 10,
          service_id: 7,
          reviewer_id: 4,
          rating: 4,
          comment: "Carlos nos ayudó a crear nuestra tienda online con Shopify. Muy funcional y bien optimizada. Buena comunicación durante todo el proceso. Recomendado."
        }
      ];

      for (const review of reviews) {
        await pool.query(
          `
					INSERT INTO reviews (order_id, service_id, reviewer_id, rating, comment)
					VALUES (?, ?, ?, ?, ?)
				`,
          [
            review.order_id,
            review.service_id,
            review.reviewer_id,
            review.rating,
            review.comment
          ]
        );
      }
    };

    // ✅ FUNCIÓN ACTUALIZADA PARA CREAR CONTACT REQUESTS CON SENDER_ID
    const createContactRequests = async () => {
      // Crear notificaciones de contact request de los clientes hacia algunos freelancers
      const contactMessages = [
        {
          user_id: 5,
          sender_id: 2,
          content: "Hola Ana, me interesa tu trabajo de diseño gráfico. ¿Podrías ayudarme con el branding de mi empresa?",
        },
        {
          user_id: 6,
          sender_id: 2,
          content: "Hola Carlos, necesito desarrollar una plataforma web para mi negocio. ¿Tienes disponibilidad?",
        },
        {
          user_id: 7,
          sender_id: 3,
          content: "Hola María, quiero mejorar la presencia en redes sociales de mi marca. ¿Podemos hablar?",
        },
        {
          user_id: 8,
          sender_id: 3,
          content: "Hola David, tengo varios documentos técnicos que necesito traducir al español. ¿Cuál sería tu tarifa?",
        },
        {
          user_id: 9,
          sender_id: 4,
          content: "Hola Laura, me gustaría que editaras un video promocional para mi empresa. ¿Podrías ayudarme?",
        },
        {
          user_id: 10,
          sender_id: 4,
          content: "Hola Sergio, necesito una pista musical original para un proyecto comercial. ¿Trabajas con ese tipo de encargos?",
        }
      ];

      for (const message of contactMessages) {
        await pool.query(
          `
					INSERT INTO notification (user_id, sender_id, content, type, status)
					VALUES (?, ?, ?, 'contact_request', 'contact_request_pending')
				`,
          [message.user_id, message.sender_id, message.content]
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
    console.log("Creando reviews...");
    await createReviews();
    console.log("Creando contact requests...");
    await createContactRequests();
    console.log("¡Base de datos inicializada con datos de prueba!");
  } catch (error) {
    console.log(error);
  }
};

initDb();