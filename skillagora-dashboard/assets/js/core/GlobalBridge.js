/**
 * Global Bridge
 * Proporciona funciones globales para compatibilidad con onclick del HTML
 * Actúa como puente entre el HTML legacy y la arquitectura modular
 */

import { taskManager } from "../services/taskManager.js";
import { modals } from "../components/modals.js";
import { presentationManager } from "../components/presentation.js";
import { TASK_DATA, TASK_CATEGORIES } from "../data/taskData.js";

export class GlobalBridge {
	constructor() {
		this.app = null; // Se asignará cuando la app esté disponible
	}

	/**
	 * Configurar todas las funciones globales para el HTML
	 */
	setupGlobalFunctions() {
		// Referencias de datos para compatibilidad
		window.taskManager = taskManager;
		window.TASK_DATA = TASK_DATA;
		window.TASK_CATEGORIES = TASK_CATEGORIES;
		window.modals = modals;

		// === FUNCIONES DE NAVEGACIÓN ===
		window.showSection = (sectionId) => this.showSection(sectionId);
		window.toggleSidebar = () => this.toggleSidebar();
		window.toggleMobileSidebar = () => this.toggleMobileSidebar();
		window.scrollToTop = () => this.scrollToTop();

		// === FUNCIONES DE MODALES ===
		window.showStatsModal = () => modals.showStatsModal();
		window.showHelpModal = () => modals.showHelpModal();
		window.showAddTaskModal = () => modals.showAddTaskModal();

		// === FUNCIONES DE TEMA ===
		window.toggleTheme = () => this.toggleTheme();

		// === FUNCIONES DE FILTROS Y BÚSQUEDA ===
		window.searchTasks = () => this.searchTasks();
		window.applyFilters = () => this.applyFilters();
		window.resetFilters = () => this.resetFilters();

		// === FUNCIONES DE PRESENTACIÓN ===
		window.toggleEditMode = () => presentationManager.toggleEditMode();
		window.savePresentationContent = () =>
			presentationManager.savePresentationContent();

		// === FUNCIONES DE TAREAS ===
		window.toggleTask = (taskId) => this.toggleTask(taskId);
		window.toggleSubtask = (taskId, subtaskIndex) =>
			this.toggleSubtask(taskId, subtaskIndex);
		window.deleteCustomTask = (taskId) => this.deleteCustomTask(taskId);

		// === FUNCIONES ADICIONALES ===
		window.renderTasks = () => this.renderTasks();
		window.updateDashboard = () => this.updateDashboard();

		console.log("🌉 GlobalBridge configurado - Funciones HTML disponibles");
	}

	/**
	 * Establecer referencia a la app principal
	 */
	setApp(app) {
		this.app = app;
		window.app = app; // Para debugging
		console.log("🌉 GlobalBridge conectado con App principal");
	}

	// ===== IMPLEMENTACIONES DE FUNCIONES GLOBALES =====

	/**
	 * Mostrar sección (delegar al NavigationController)
	 */
	showSection(sectionId) {
		if (this.app) {
			this.app.navigateToSection(sectionId);
		} else {
			// Fallback directo si la app no está disponible
			this._fallbackShowSection(sectionId);
		}
		return false; // Para onclick handlers
	}

	/**
	 * Toggle sidebar (delegar al NavigationController)
	 */
	toggleSidebar() {
		const navigationController = this.app?.getController("navigation");
		if (navigationController) {
			return navigationController.toggleSidebar();
		} else {
			return this._fallbackToggleSidebar();
		}
	}

	/**
	 * Toggle mobile sidebar
	 */
	toggleMobileSidebar() {
		const navigationController = this.app?.getController("navigation");
		if (navigationController) {
			return navigationController.toggleMobileSidebar();
		} else {
			return this._fallbackToggleMobileSidebar();
		}
	}

	/**
	 * Scroll to top
	 */
	scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	/**
	 * Toggle tema (delegar al ThemeController)
	 */
	toggleTheme() {
		const themeController = this.app?.getController("theme");
		if (themeController) {
			return themeController.toggleTheme();
		} else {
			return this._fallbackToggleTheme();
		}
	}

	/**
	 * Búsqueda de tareas (delegar al FilterController)
	 */
	searchTasks() {
		const filterController = this.app?.getController("filter");
		if (filterController) {
			const searchValue = document.getElementById("searchBox")?.value || "";
			return filterController.handleSearchInput(searchValue);
		} else {
			console.log("Búsqueda:", document.getElementById("searchBox")?.value);
		}
	}

	/**
	 * Aplicar filtros (delegar al FilterController)
	 */
	applyFilters() {
		const filterController = this.app?.getController("filter");
		if (filterController) {
			return filterController.applyCurrentFilters();
		} else {
			console.log("Aplicando filtros...");
		}
	}

	/**
	 * Resetear filtros (delegar al FilterController)
	 */
	resetFilters() {
		const filterController = this.app?.getController("filter");
		if (filterController) {
			return filterController.resetFilters();
		} else {
			this._fallbackResetFilters();
		}
	}

	/**
	 * Toggle tarea - CORREGIDO para persistencia
	 */
	toggleTask(taskId) {
		const result = taskManager.toggleTask(taskId);

		// Notificar a la app para actualizar UI
		if (this.app && this.app.eventManager) {
			this.app.eventManager.emit("task:toggled", { taskId, completed: result });
		}

		// Actualizar renderizado
		this.renderTasks();
		this.updateDashboard();

		console.log(`✅ Tarea ${taskId} ${result ? "completada" : "pendiente"}`);
		return result;
	}

	/**
	 * Toggle subtarea - CORREGIDO para persistencia
	 */
	toggleSubtask(taskId, subtaskIndex) {
		const result = taskManager.toggleSubtask(taskId, subtaskIndex);

		// Notificar a la app
		if (this.app && this.app.eventManager) {
			this.app.eventManager.emit("subtask:toggled", {
				taskId,
				subtaskIndex,
				completed: result,
			});
		}

		// Actualizar renderizado
		this.renderTasks();
		this.updateDashboard();

		console.log(
			`✅ Subtarea ${taskId}[${subtaskIndex}] ${
				result ? "completada" : "pendiente"
			}`
		);
		return result;
	}

	/**
	 * Eliminar tarea personalizada
	 */
	deleteCustomTask(taskId) {
		if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
			let customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
			customTasks = customTasks.filter((task) => task.id !== taskId);
			localStorage.setItem("customTasks", JSON.stringify(customTasks));

			// Actualizar renderizado
			this.renderTasks();

			// Mostrar notificación
			modals.showNotificationModal(
				"Éxito",
				"Tarea eliminada correctamente",
				"success"
			);
		}
	}

	/**
	 * Renderizar tareas
	 */
	renderTasks() {
		const taskRenderer = this.app?.getComponent("taskRenderer");
		if (taskRenderer) {
			taskRenderer.renderTasks();
		}
	}

	/**
	 * Actualizar dashboard
	 */
	updateDashboard() {
		const dashboard = this.app?.getComponent("dashboard");
		if (dashboard) {
			dashboard.update();
		}
	}

	// ===== FUNCIONES FALLBACK (cuando la app no está disponible) =====

	_fallbackShowSection(sectionId) {
		console.log("Fallback: Mostrando sección:", sectionId);

		// Actualizar navegación activa
		document.querySelectorAll(".nav-link").forEach((link) => {
			link.classList.remove("active");
		});

		const activeLink = document.querySelector(
			`[onclick*="showSection('${sectionId}')"]`
		);
		if (activeLink) {
			activeLink.classList.add("active");
		}

		// Ocultar todas las secciones
		document.querySelectorAll(".content-section").forEach((section) => {
			section.style.display = "none";
		});

		// Mostrar sección seleccionada
		const targetSection = document.getElementById(sectionId);
		if (targetSection) {
			targetSection.style.display = "block";
		}

		// Actualizar título
		this._fallbackUpdatePageTitle(sectionId);
	}

	_fallbackUpdatePageTitle(sectionId) {
		const titles = {
			overview: "Dashboard SkillAgora",
			proposal: "Propuesta del Proyecto",
			presentation: "Documentación de la Aplicación",
			critical: "Tareas Críticas",
			important: "Tareas Importantes",
			optional: "Tareas Opcionales",
			technical: "Tareas Técnicas",
			fixes: "Correcciones",
			timeline: "Timeline",
		};

		const pageTitle = document.getElementById("pageTitle");
		if (pageTitle && titles[sectionId]) {
			pageTitle.textContent = titles[sectionId];
		}
	}

	_fallbackToggleSidebar() {
		const sidebar = document.getElementById("sidebar");
		const mainContent = document.getElementById("mainContent");
		const toggleIcon = document.getElementById("toggleIcon");

		if (sidebar && mainContent) {
			sidebar.classList.toggle("collapsed");
			mainContent.classList.toggle("expanded");

			if (toggleIcon) {
				toggleIcon.textContent = sidebar.classList.contains("collapsed")
					? "→"
					: "←";
			}
		}
	}

	_fallbackToggleMobileSidebar() {
		const sidebar = document.getElementById("sidebar");
		if (sidebar) {
			sidebar.classList.toggle("mobile-open");
		}
	}

	_fallbackToggleTheme() {
		const currentTheme =
			document.documentElement.getAttribute("data-theme") || "light";
		const newTheme = currentTheme === "dark" ? "light" : "dark";

		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("skillAgora_theme", newTheme);

		const themeToggle = document.getElementById("themeToggle");
		if (themeToggle) {
			themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
		}
	}

	_fallbackResetFilters() {
		const categoryFilter = document.getElementById("categoryFilter");
		const statusFilter = document.getElementById("statusFilter");
		const timeFilter = document.getElementById("timeFilter");
		const searchBox = document.getElementById("searchBox");

		if (categoryFilter) categoryFilter.value = "all";
		if (statusFilter) statusFilter.value = "all";
		if (timeFilter) timeFilter.value = "all";
		if (searchBox) searchBox.value = "";
	}

	/**
	 * Obtener información del puente
	 */
	getInfo() {
		return {
			hasApp: !!this.app,
			functionsRegistered: this._getFunctionNames(),
			timestamp: new Date().toISOString(),
		};
	}

	_getFunctionNames() {
		const globalFunctions = [];
		for (const key in window) {
			if (
				(typeof window[key] === "function" && key.startsWith("show")) ||
				key.startsWith("toggle") ||
				key.startsWith("apply") ||
				key.startsWith("reset") ||
				key.startsWith("save") ||
				key.startsWith("delete") ||
				key.startsWith("render") ||
				key.startsWith("update") ||
				key.startsWith("search") ||
				key === "scrollToTop"
			) {
				globalFunctions.push(key);
			}
		}
		return globalFunctions;
	}

	/**
	 * Limpiar funciones globales
	 */
	cleanup() {
		const functionsToClean = [
			"showSection",
			"toggleSidebar",
			"toggleMobileSidebar",
			"scrollToTop",
			"showStatsModal",
			"showHelpModal",
			"showAddTaskModal",
			"toggleTheme",
			"searchTasks",
			"applyFilters",
			"resetFilters",
			"toggleEditMode",
			"savePresentationContent",
			"toggleTask",
			"toggleSubtask",
			"deleteCustomTask",
			"renderTasks",
			"updateDashboard",
		];

		functionsToClean.forEach((fnName) => {
			if (window[fnName]) {
				delete window[fnName];
			}
		});

		// Limpiar referencias
		delete window.taskManager;
		delete window.TASK_DATA;
		delete window.TASK_CATEGORIES;
		delete window.modals;
		delete window.app;

		console.log("🧹 GlobalBridge limpiado");
	}
}
