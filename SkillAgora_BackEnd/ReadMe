# SkillAgora Backend

SkillAgora es una plataforma que conecta clientes con freelancers para contratar servicios digitales. Este repositorio contiene el backend del proyecto, desarrollado con Node.js, Express y MySQL.

---

## Tecnologías utilizadas

* **Node.js**
* **Express.js**
* **MySQL**
* **JWT** (JSON Web Tokens)
* **bcrypt** (hashing de contraseñas)
* **dotenv** (configuración segura de variables de entorno)
* **express-fileupload** (manejo de archivos)
* **Brevo** (envío de emails)

---

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu_usuario/skillagora-backend.git
cd skillagora-backend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con la siguiente estructura:

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=tu_password
MYSQL_NAME=SkillAgora
JWT_SECRET=tu_jwt_secret
SMTP_API_KEY=tu_api_key_brevo
SMTP_USER=tu_email_brevo
VITE_URL_API=http://localhost:3000
```

4. Inicializa la base de datos:

```bash
node src/db/initDb.js
```

5. Ejecuta el servidor:

```bash
npm run dev
```

---

## Rutas principales

### Usuarios

* `POST /users/register` – Registro de usuarios
* `GET /users/validate/:registrationCode` – Validar cuenta
* `POST /users/login` – Login y generación de token JWT
* `GET /profile` – Obtener perfil del usuario autenticado
* `POST /change-password` – Cambiar contraseña

### Servicios

* `POST /services/create` – Crear un servicio (freelancer)
* `GET /services` – Obtener todos los servicios
* `GET /services/:id` – Obtener detalles de un servicio
* `PUT /services/update` – Actualizar información de un servicio
* `POST /services/upload-photo` – Subir imagen a un servicio
* `GET /services/statistics` – Obtener estadísticas globales
* `GET /services/featured` – Servicios destacados
* `GET /services/filters` – Filtrado de servicios por criterios

### Reseñas

* `POST /reviews` – Crear una reseña sobre un servicio
* `GET /reviews/:freelancer_id` – Obtener reseñas de un freelancer

### Contacto y Notificaciones

* `POST /contact-provider` – Enviar solicitud de contacto general
* `POST /notifications/contact` – Enviar solicitud de contacto a freelancer
* `GET /notifications/contact` – Obtener solicitudes de contacto (admin)

### Freelancers

* `GET /freelancers` – Obtener todos los freelancers
* `GET /freelancers/:id` – Obtener un freelancer por ID
* `POST /freelancers/request/:userId` – Solicitar estatus de freelancer

### Admin

* `POST /admin/accept-freelancer-request/:id` – Aprobar un freelancer

---

## Seguridad

* Todas las rutas protegidas utilizan JWT para autenticación.
* Algunas rutas (como las de administración) requieren verificación adicional.

---

## Estructura del proyecto

```bash
src/
├── controllers/        # Lógica de negocio y endpoints
├── db/                 # Conexión e inicialización de base de datos
├── errors/             # Middleware global para manejo de errores
├── middleware/         # Middlewares personalizados (auth, etc.)
├── router/             # Agrupación de rutas
├── services/           # Lógica de negocio desacoplada de controladores
├── utils/              # Utilidades: errores, correo, fotos, etc.
```

---

## Licencia

Este proyecto está licenciado bajo MIT.

---

## Contacto

Para más información, contacta al equipo de desarrollo de **SkillAgora**.
