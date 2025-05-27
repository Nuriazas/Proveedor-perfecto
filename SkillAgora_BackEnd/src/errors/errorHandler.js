// Middleware general para manejar errores 

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  // Creamos una respuesta en formato JSON
  res.status(statusCode).json({
    success: false, 
    message: err.message || "Ocurrió un error en el servidor", 
  });

  // Mostramos el error en la consola para poder depurar durante el desarrollo
  console.error(err);
};

export default errorHandler;