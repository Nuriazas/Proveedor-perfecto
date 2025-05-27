-- =============================================
-- FUNCIONALIDADES BÁSICAS
-- =============================================

-- Instrucciones para eliminar tablas duplicadas y evitar errores.
DROP TABLE IF EXISTS support_replies;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS order_revisions;
DROP TABLE IF EXISTS order_deliveries;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS gig_media;
DROP TABLE IF EXISTS gigs;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- Tabla: usuarios,identificamos de manera única a cada usuario de la plataforma,gestionamos roles,relacionamos a usuarios con servicios,pedidos,mensajes,pagos y además almacenamos la información necesaria para cada usuario.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('client', 'freelancer') NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Perfil extendido del usuaario,aquí podemos almacenar información adicional sobre el usuario,útil para ganar atractivo respecto a los clientes y hacer más eficiente la búsqueda de servicios y la gestión de todos los datos.
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    experience TEXT,
    portfolio_url VARCHAR(255),
    location VARCHAR(100),
    language VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla: habilidades:Organizamos las habilidades de cada usuario haciendo más sencilla la búsqueda de servicios.
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE user_skills (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- Categorías:Organizamos toda la oferta de servicios que nos ofrece el sitio web.
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

-- Servicios (Gigs)Con esta tabla representamos y almacenamos todos los servicios que tendrá nuestra plataforma
CREATE TABLE gigs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    title VARCHAR(150),
    description TEXT,
    price DECIMAL(10, 2),
    delivery_time_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Media del Gig:Con esta table almacenamos imágenes y videos de los servicios que ofrecen los usuarios,así los freelancers muestran su trabajo y los clientes ven los resultados.
CREATE TABLE gig_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gig_id INT,
    media_url VARCHAR(255),
    type ENUM('image', 'video') DEFAULT 'image',
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);

-- Pedidos / Contrataciones:Almacenamos los pedidos de los clientes para que los freelancers puedan realizar el trabajo requerido,además el campo "status" nos permite comprobar el estado en el que se encuentra el pedido.Agregamos currency code para manejar pedidos en diferentes divisas.
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    gig_id INT,
    freelancer_id INT,
    status ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2),
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    currency_code VARCHAR(10) DEFAULT 'USD',
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- EntregasLlevamos un control de las entregas de los freelancers,así los clientes pueden revisarlas y calificarlas.
CREATE TABLE order_deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    message TEXT,
    file_url VARCHAR(255),
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Revisiones:Los clientes pueden aquí solicitar revisiones de los trabajos que hacen los freelancers,así los usuarios pueden hacer las modificaciones necesarias.
CREATE TABLE order_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Mensajes:Con esta tabla permitimos la interacción entre los usuarios de la plataforma.
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    order_id INT,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Reseñas:Aquí almacenamos las valoraciones de los usuarios,que será un punto clave para facilitar las elecciones en base a las experiencias de trabajo.
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    reviewer_id INT,
    reviewee_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Pagos:Esta t abla nos ayudará a gestionar todos los pagos que se produzcan en nuestra plataforma,así aseguraremos transparencia y control al respecto de las transacciones entre los clientes y los freelancers.
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    currency_code VARCHAR(10) DEFAULT 'USD',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- Retiros:Esta tabla nos ayudará a gestionar el retiro de los fondos por el trabajo realizado,clave para que cada usuario reciba el pago correspondiente por el servicio realizado.
CREATE TABLE payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2),
    method VARCHAR(50),
    status ENUM('requested', 'paid', 'failed') DEFAULT 'requested',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notificaciones:Tabla importante para informar a los usuarios sobre eventos importantes dentro de la plataforma.
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT,
    type ENUM('order', 'message', 'system', 'review', 'support') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Soporte:Permite a los usuarios abrir tickets y reportar problemas,resolver dudas y solicitar ayuda.
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255),
    message TEXT,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE support_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    sender_id INT,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- FUNCIONALIDADES QUE PODRÍAMOS AÑADIR
-- =============================================


-- Portafolio de freelancers:Permite a los freelancers mostrar ejemplos de su trabajo,muy útil para atraer a los clientes dentro de la plataforma.
CREATE TABLE user_portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(150),
    description TEXT,
    project_url VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

--Soporte para múltiples métodos de pago y divisas:Almacena las monedas que nuestra plataforma acepta,así podremos gestionar los pagos en diferentes divisas.
CREATE TABLE currencies (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50),
    symbol VARCHAR(10)
);

-- Agregar columna de moneda a la tabla de pagos y pedidos:Nos permiten que los pagos y los pedidos se registren en una moneda específica,así las transacciones y el manejo de las divisas será más eficiente dentro de la plataforma.
ALTER TABLE payments ADD COLUMN currency_code VARCHAR(10) DEFAULT 'USD';
ALTER TABLE payments ADD FOREIGN KEY (currency_code) REFERENCES currencies(code);
ALTER TABLE orders ADD COLUMN currency_code VARCHAR(10) DEFAULT 'USD';
ALTER TABLE orders ADD FOREIGN KEY (currency_code) REFERENCES currencies(code);

-- Tabla para disputas entre clientes y freelancers:Gestionamos las reclamaciones entre usuarios de la plataforma sobre un pedido y ayudamos a resolver posibles conflictos.
CREATE TABLE disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    raised_by INT,
    reason TEXT,
    status ENUM('open', 'in_review', 'resolved', 'rejected') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para cupones de descuento:Gestionamos posibles promociones y descuentos,muy útil para atraer a usuarios nuevos y para fidelizar a los ya existentes.
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    discount_percent INT,
    valid_from DATE,
    valid_to DATE,
    max_uses INT,
    used_count INT DEFAULT 0
);

-- Tabla para referidos:Gestiona las invitaciones que pueden enviar usuarios existentes a personas que aún no conozcan la plataforma.
CREATE TABLE referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT,
    referee_id INT,
    referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para guardar todas las notificaciones enviadas por los usuarios.
CREATE TABLE notification_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content TEXT,
    type ENUM('order', 'message', 'system', 'review', 'support') DEFAULT 'system',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

--Verificación de identidad:Con esta tabla podemos gestionar el proceso de verificación de identidad de los usuarios de la plataforma,muy úil para ganar en confianza y seguridad.

CREATE TABLE user_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    document_type VARCHAR(50),
    document_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para archivos adjuntos en mensajes:Nos permite que los usuarios puedan adjuntar archivos en las conversaciones.
CREATE TABLE message_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT,
    file_url VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Tabla para preferencias y configuraciones de usuario:Útil para que el usuario adapte la plataforma a sus preferencias (idioma,activar notificaciones,elegir modo oscuro,nivel de privacidad de su perfil,etc)
CREATE TABLE user_settings (
    user_id INT PRIMARY KEY,
    language VARCHAR(50) DEFAULT 'es',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    privacy_level ENUM('public', 'private', 'friends') DEFAULT 'public',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contenido extra sugerido por la IA para que nuestra base de datos funcione de manera más rápida (index) y para que tengamos datos básicos listos para usar (insert)
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_id ON order_deliveries(order_id);

INSERT INTO currencies (code, name, symbol) VALUES ('USD', 'Dólar estadounidense', '$');
INSERT INTO categories (name) VALUES ('Diseño'), ('Programación'), ('Traducción');