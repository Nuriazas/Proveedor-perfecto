// Importamos el servicio que obtiene todos los freelancers de la base de datos
import getAllFreelancers from "../../services/usersServices/getAllFreelancers.js";

// Controlador para manejar la petición de obtener todos los freelancers con filtros opcionales
async function getAllFreelancersController(req, res) {
	try {
		// Extraemos parámetros de filtro de la query string
		const {
			specialty,
			minRating,
			maxRating,
			minPrice,
			maxPrice,
			minServices,
			location,
			sortBy,
			sortOrder,
			search,
			page,
			limit
		} = req.query;

		// Llamamos al servicio para obtener la lista completa de freelancers
		let freelancers = await getAllFreelancers();

		// APLICAMOS FILTROS EN EL BACKEND
		if (specialty && specialty !== 'all') {
			freelancers = freelancers.filter(f => 
				f.specialty?.toLowerCase().includes(specialty.toLowerCase())
			);
		}

		if (minRating) {
			freelancers = freelancers.filter(f => 
				parseFloat(f.average_rating) >= parseFloat(minRating)
			);
		}

		if (maxRating) {
			freelancers = freelancers.filter(f => 
				parseFloat(f.average_rating) <= parseFloat(maxRating)
			);
		}

		if (minPrice) {
			freelancers = freelancers.filter(f => 
				parseFloat(f.average_service_price) >= parseFloat(minPrice)
			);
		}

		if (maxPrice) {
			freelancers = freelancers.filter(f => 
				parseFloat(f.average_service_price) <= parseFloat(maxPrice)
			);
		}

		if (minServices) {
			freelancers = freelancers.filter(f => 
				parseInt(f.total_services) >= parseInt(minServices)
			);
		}

		if (location) {
			freelancers = freelancers.filter(f => 
				f.location?.toLowerCase().includes(location.toLowerCase())
			);
		}

		if (search) {
			const searchTerm = search.toLowerCase();
			freelancers = freelancers.filter(f => 
				f.name?.toLowerCase().includes(searchTerm) ||
				f.bio?.toLowerCase().includes(searchTerm) ||
				f.specialty?.toLowerCase().includes(searchTerm) ||
				f.location?.toLowerCase().includes(searchTerm)
			);
		}

		// APLICAMOS ORDENAMIENTO
		if (sortBy) {
			freelancers.sort((a, b) => {
				let aVal, bVal;
				
				switch (sortBy) {
					case 'rating':
						aVal = parseFloat(a.average_rating);
						bVal = parseFloat(b.average_rating);
						break;
					case 'price':
						aVal = parseFloat(a.average_service_price);
						bVal = parseFloat(b.average_service_price);
						break;
					case 'services':
						aVal = parseInt(a.total_services);
						bVal = parseInt(b.total_services);
						break;
					case 'reviews':
						aVal = parseInt(a.total_reviews);
						bVal = parseInt(b.total_reviews);
						break;
					case 'name':
						aVal = a.name?.toLowerCase() || '';
						bVal = b.name?.toLowerCase() || '';
						break;
					case 'recent':
						aVal = new Date(a.created_at);
						bVal = new Date(b.created_at);
						break;
					default:
						aVal = parseFloat(a.average_rating);
						bVal = parseFloat(b.average_rating);
				}

				// Aplicamos dirección de ordenamiento
				const order = sortOrder === 'asc' ? 1 : -1;
				
				if (typeof aVal === 'string') {
					return aVal.localeCompare(bVal) * order;
				}
				return (bVal - aVal) * order;
			});
		}

		// APLICAMOS PAGINACIÓN
		const currentPage = parseInt(page) || 1;
		const itemsPerPage = parseInt(limit) || freelancers.length; // Sin límite por defecto
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		
		const paginatedFreelancers = freelancers.slice(startIndex, endIndex);
		const totalPages = Math.ceil(freelancers.length / itemsPerPage);

		// Calculamos estadísticas de los resultados filtrados
		const filteredStats = {
			totalResults: freelancers.length,
			currentPage,
			totalPages,
			itemsPerPage,
			hasNextPage: currentPage < totalPages,
			hasPrevPage: currentPage > 1
		};

		// OBTENEMOS ESPECIALIDADES ÚNICAS para el frontend
		const specialties = [...new Set(freelancers.map(f => f.specialty).filter(Boolean))];

		// Enviamos respuesta exitosa con los freelancers y metadatos
		res.json({
			success: true,
			data: paginatedFreelancers,
			pagination: filteredStats,
			filters: {
				availableSpecialties: specialties,
				appliedFilters: {
					specialty,
					minRating,
					maxRating,
					minPrice,
					maxPrice,
					minServices,
					location,
					search,
					sortBy: sortBy || 'rating',
					sortOrder: sortOrder || 'desc'
				}
			}
		});
	} catch (error) {
		// Si hay error, enviamos respuesta de error con mensaje
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export default getAllFreelancersController;

// ¿Qué hace este controlador mejorado?
// 1. Mantiene compatibilidad total con el frontend actual
// 2. Añade soporte para filtros opcionales via query parameters
// 3. Permite ordenamiento por múltiples campos
// 4. Incluye paginación opcional
// 5. Proporciona metadatos útiles (especialidades disponibles, estadísticas)
// 6. Maneja búsqueda por texto en múltiples campos
// 7. Devuelve información de paginación para el frontend

// PARÁMETROS DE QUERY SOPORTADOS:
// ?specialty=Desarrollo web
// ?minRating=4.0
// ?maxRating=5.0  
// ?minPrice=50
// ?maxPrice=500
// ?minServices=3
// ?location=Madrid
// ?search=react developer
// ?sortBy=rating|price|services|reviews|name|recent
// ?sortOrder=asc|desc
// ?page=1
// ?limit=10

// EJEMPLOS DE USO:
// GET /users/freelancers (comportamiento actual, sin cambios)
// GET /users/freelancers?specialty=Desarrollo web&minRating=4.5
// GET /users/freelancers?sortBy=services&sortOrder=desc&limit=6
// GET /users/freelancers?search=react&minPrice=100&page=2