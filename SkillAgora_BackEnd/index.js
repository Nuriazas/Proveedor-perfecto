import server from "./src/server.js";

// Almacenar la configuración del puerto en una variable de entorno
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
server.listen(PORT, () => {
	console.log(`Servidor escuchando en puerto ${PORT}`);
});
