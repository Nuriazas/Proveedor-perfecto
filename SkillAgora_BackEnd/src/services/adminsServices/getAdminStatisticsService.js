import getPool from "../../db/getPool.js";
import generateErrorsUtils from "../../utils/generateErrorsUtils.js";
import priceUtils from "../../utils/priceUtils.js";

// Este servicio obtiene estadísticas generales del sistema para admins
const getAdminStatisticsService = async () => {
	try {
		const pool = await getPool();

		// Estadísticas de usuarios
		const userStatsQuery = `
			SELECT 
				COUNT(*) AS total_users,
				SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active_users,
				SUM(CASE WHEN role = 'freelancer' THEN 1 ELSE 0 END) AS total_freelancers,
				SUM(CASE WHEN role = 'client' THEN 1 ELSE 0 END) AS total_clients,
				SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) AS total_admins,
				SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS new_users_last_month
			FROM users
		`;

		// Estadísticas de servicios
		const serviceStatsQuery = `
			SELECT 
				COUNT(*) AS total_services,
				AVG(price) AS average_price,
				MIN(price) AS min_price,
				MAX(price) AS max_price,
				AVG(delivery_time_days) AS average_delivery_time,
				SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS new_services_last_month
			FROM services
		`;

		// Estadísticas de órdenes
		const orderStatsQuery = `
			SELECT 
				COUNT(*) AS total_orders,
				SUM(total_price) AS total_revenue,
				AVG(total_price) AS average_order_value,
				SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
				SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
				SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_orders,
				SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
				SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders,
				SUM(CASE WHEN ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_price ELSE 0 END) AS revenue_last_month,
				SUM(CASE WHEN ordered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS orders_last_month
			FROM orders
		`;

		// Estadísticas de reviews
		const reviewStatsQuery = `
			SELECT 
				COUNT(*) AS total_reviews,
				AVG(rating) AS average_rating,
				SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star_reviews,
				SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) AS positive_reviews
			FROM reviews
		`;

		// Categorías más populares
		const popularCategoriesQuery = `
			SELECT 
				c.name as category_name,
				COUNT(s.id) as service_count,
				COUNT(o.id) as order_count
			FROM categories c
			LEFT JOIN services s ON c.id = s.category_id
			LEFT JOIN orders o ON s.id = o.services_id
			GROUP BY c.id, c.name
			ORDER BY service_count DESC
			LIMIT 5
		`;

		// Últimas actividades
		const recentActivitiesQuery = `
			SELECT 
				'new_user' as activity_type,
				CONCAT(name, ' ', lastName) as description,
				created_at as activity_date
			FROM users 
			WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
			
			UNION ALL
			
			SELECT 
				'new_service' as activity_type,
				title as description,
				created_at as activity_date
			FROM services 
			WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
			
			UNION ALL
			
			SELECT 
				'new_order' as activity_type,
				CONCAT('Order #', id, ' - $', total_price) as description,
				ordered_at as activity_date
			FROM orders 
			WHERE ordered_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
			
			ORDER BY activity_date DESC
			LIMIT 10
		`;

		// Ejecutamos todas las consultas
		const [[userStats]] = await pool.execute(userStatsQuery);
		const [[serviceStats]] = await pool.execute(serviceStatsQuery);
		const [[orderStats]] = await pool.execute(orderStatsQuery);
		const [[reviewStats]] = await pool.execute(reviewStatsQuery);
		const [popularCategories] = await pool.execute(popularCategoriesQuery);
		const [recentActivities] = await pool.execute(recentActivitiesQuery);

		// Calculamos métricas adicionales
		const conversionRate = userStats.total_users > 0 
			? ((orderStats.total_orders / userStats.total_users) * 100).toFixed(2)
			: 0;

		const completionRate = orderStats.total_orders > 0 
			? ((orderStats.completed_orders / orderStats.total_orders) * 100).toFixed(2)
			: 0;

		// Devolvemos los resultados formateados
		return {
			// Estadísticas de usuarios
			users: {
				total: parseInt(userStats.total_users || 0),
				active: parseInt(userStats.active_users || 0),
				freelancers: parseInt(userStats.total_freelancers || 0),
				clients: parseInt(userStats.total_clients || 0),
				admins: parseInt(userStats.total_admins || 0),
				new_last_month: parseInt(userStats.new_users_last_month || 0)
			},

			// Estadísticas de servicios
			services: {
				total: parseInt(serviceStats.total_services || 0),
				average_price: parseFloat(serviceStats.average_price || 0).toFixed(2),
				average_price_formatted: priceUtils.formatPrice(serviceStats.average_price, 'USD'),
				min_price: parseFloat(serviceStats.min_price || 0).toFixed(2),
				min_price_formatted: priceUtils.formatPrice(serviceStats.min_price, 'USD'),
				max_price: parseFloat(serviceStats.max_price || 0).toFixed(2),
				max_price_formatted: priceUtils.formatPrice(serviceStats.max_price, 'USD'),
				average_delivery_time: Math.round(serviceStats.average_delivery_time || 0),
				new_last_month: parseInt(serviceStats.new_services_last_month || 0)
			},

			// Estadísticas de órdenes y ingresos
			orders: {
				total: parseInt(orderStats.total_orders || 0),
				completed: parseInt(orderStats.completed_orders || 0),
				pending: parseInt(orderStats.pending_orders || 0),
				in_progress: parseInt(orderStats.in_progress_orders || 0),
				delivered: parseInt(orderStats.delivered_orders || 0),
				cancelled: parseInt(orderStats.cancelled_orders || 0),
				last_month: parseInt(orderStats.orders_last_month || 0)
			},

			// Estadísticas financieras
			revenue: {
				total: parseFloat(orderStats.total_revenue || 0).toFixed(2),
				total_formatted: priceUtils.formatPrice(orderStats.total_revenue, 'USD'),
				average_order: parseFloat(orderStats.average_order_value || 0).toFixed(2),
				average_order_formatted: priceUtils.formatPrice(orderStats.average_order_value, 'USD'),
				last_month: parseFloat(orderStats.revenue_last_month || 0).toFixed(2),
				last_month_formatted: priceUtils.formatPrice(orderStats.revenue_last_month, 'USD')
			},

			// Estadísticas de reviews
			reviews: {
				total: parseInt(reviewStats.total_reviews || 0),
				average_rating: parseFloat(reviewStats.average_rating || 0).toFixed(1),
				five_star: parseInt(reviewStats.five_star_reviews || 0),
				positive: parseInt(reviewStats.positive_reviews || 0),
				positive_percentage: reviewStats.total_reviews > 0 
					? ((reviewStats.positive_reviews / reviewStats.total_reviews) * 100).toFixed(1)
					: 0
			},

			// Métricas calculadas
			metrics: {
				conversion_rate: conversionRate,
				completion_rate: completionRate,
				active_user_percentage: userStats.total_users > 0 
					? ((userStats.active_users / userStats.total_users) * 100).toFixed(1)
					: 0
			},

			// Categorías populares
			popular_categories: popularCategories,

			// Actividades recientes
			recent_activities: recentActivities
		};
	} catch (error) {
		throw generateErrorsUtils("Error fetching admin statistics.", 500, error);
	}
};

export default getAdminStatisticsService;