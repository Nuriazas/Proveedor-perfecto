/**
 * Task Data Module
 * Contiene todas las tareas organizadas por categorías
 */

export const TASK_DATA = {
	critical: [],
	important: [],
	optional: [],
	technical: [],
	fixes: [],
};

/**
 * Categorías de tareas con metadata
 */
export const TASK_CATEGORIES = {
	critical: {
		name: "Tareas Críticas",
		icon: "🔴",
		color: "var(--danger-color)",
		description: "Funcionalidades esenciales para el MVP",
	},
	important: {
		name: "Tareas Importantes",
		icon: "🟡",
		color: "var(--warning-color)",
		description: "Mejoras significativas de experiencia",
	},
	optional: {
		name: "Tareas Opcionales",
		icon: "🟢",
		color: "var(--success-color)",
		description: "Funcionalidades premium",
	},
	technical: {
		name: "Tareas Técnicas",
		icon: "🔧",
		color: "var(--purple-color)",
		description: "Calidad y mantenibilidad",
	},
	fixes: {
		name: "Correcciones",
		icon: "🔨",
		color: "var(--orange-color)",
		description: "Fixes y optimizaciones",
	},
};

/**
 * Configuración del proyecto
 */
export const PROJECT_CONFIG = {
	name: "SkillAgora",
	subtitle: "Where every skill is an achievement.",
	description: "Propuesta de Proyecto Final - Bootcamp Desarrollo Web",
	version: "1.0.0",
	estimatedDuration: {
		weeks: 4,
		days: 28,
	},
};

/**
 * Utilidades para trabajar con los datos
 */
export class TaskDataUtils {
	/**
	 * Obtiene todas las tareas como array plano
	 */
	static getAllTasks() {
		// Incluir tareas personalizadas del localStorage
		const customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
		const allTasks = Object.values(TASK_DATA).flat();

		// Combinar tareas originales (vacías) con personalizadas
		return [...allTasks, ...customTasks];
	}

	/**
	 * Obtiene una tarea por su ID
	 */
	static getTaskById(taskId) {
		const allTasks = this.getAllTasks();
		return allTasks.find((task) => task.id === taskId);
	}

	/**
	 * Obtiene tareas por categoría
	 */
	static getTasksByCategory(category) {
		const originalTasks = TASK_DATA[category] || [];
		const customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
		const categoryCustomTasks = customTasks.filter(
			(task) => task.category === category
		);

		return [...originalTasks, ...categoryCustomTasks];
	}

	/**
	 * Obtiene estadísticas de las tareas
	 */
	static getTaskStats() {
		const allTasks = this.getAllTasks();
		const totalTime = allTasks.reduce((sum, task) => sum + (task.time || 0), 0);

		const statsByCategory = {};
		Object.keys(TASK_CATEGORIES).forEach((category) => {
			const tasks = this.getTasksByCategory(category);
			statsByCategory[category] = {
				count: tasks.length,
				totalTime: tasks.reduce((sum, task) => sum + (task.time || 0), 0),
				subtasks: tasks.reduce(
					(sum, task) => sum + (task.tasks ? task.tasks.length : 0),
					0
				),
			};
		});

		return {
			totalTasks: allTasks.length,
			totalTime,
			totalSubtasks: allTasks.reduce(
				(sum, task) => sum + (task.tasks ? task.tasks.length : 0),
				0
			),
			categories: statsByCategory,
		};
	}

	/**
	 * Busca tareas por texto
	 */
	static searchTasks(query) {
		if (!query) return this.getAllTasks();

		const lowerQuery = query.toLowerCase();
		return this.getAllTasks().filter((task) => {
			const titleMatch = task.title.toLowerCase().includes(lowerQuery);
			const descMatch = (task.description || "")
				.toLowerCase()
				.includes(lowerQuery);
			const tagMatch = (task.tags || []).some((tag) =>
				tag.toLowerCase().includes(lowerQuery)
			);
			const subtaskMatch = (task.tasks || []).some((subtask) =>
				subtask.toLowerCase().includes(lowerQuery)
			);

			return titleMatch || descMatch || tagMatch || subtaskMatch;
		});
	}

	/**
	 * Filtra tareas por criterios
	 */
	static filterTasks(criteria) {
		let tasks = this.getAllTasks();

		if (criteria.category && criteria.category !== "all") {
			tasks = this.getTasksByCategory(criteria.category);
		}

		if (criteria.time && criteria.time !== "all") {
			const timeLimit = parseInt(criteria.time);
			tasks = tasks.filter((task) => (task.time || 0) <= timeLimit);
		}

		if (criteria.tags && criteria.tags.length > 0) {
			tasks = tasks.filter((task) =>
				criteria.tags.some((tag) => (task.tags || []).includes(tag))
			);
		}

		return tasks;
	}

	/**
	 * Obtiene todos los tags únicos
	 */
	static getAllTags() {
		const allTasks = this.getAllTasks();
		const tags = new Set();
		allTasks.forEach((task) => {
			if (task.tags && Array.isArray(task.tags)) {
				task.tags.forEach((tag) => tags.add(tag));
			}
		});
		return Array.from(tags).sort();
	}

	/**
	 * Obtiene la categoría de una tarea
	 */
	static getCategoryByTaskId(taskId) {
		// Buscar en tareas originales
		for (const [category, tasks] of Object.entries(TASK_DATA)) {
			if (tasks.some((task) => task.id === taskId)) {
				return category;
			}
		}

		// Buscar en tareas personalizadas
		const customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
		const customTask = customTasks.find((task) => task.id === taskId);
		if (customTask) {
			return customTask.category;
		}

		return null;
	}

	/**
	 * Valida la estructura de una tarea
	 */
	static validateTask(task) {
		const required = ["id", "title"];
		return required.every((field) => task.hasOwnProperty(field));
	}

	/**
	 * Obtiene sugerencias de autocompletado
	 */
	static getSearchSuggestions(query, limit = 5) {
		if (!query || query.length < 2) return [];

		const suggestions = new Set();
		const lowerQuery = query.toLowerCase();

		// Buscar en títulos
		this.getAllTasks().forEach((task) => {
			if (task.title.toLowerCase().includes(lowerQuery)) {
				suggestions.add(task.title);
			}
		});

		// Buscar en tags
		this.getAllTags().forEach((tag) => {
			if (tag.toLowerCase().includes(lowerQuery)) {
				suggestions.add(tag);
			}
		});

		return Array.from(suggestions).slice(0, limit);
	}
}
