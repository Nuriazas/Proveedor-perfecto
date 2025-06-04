/**
 * Core Application Class - Versión Corregida
 * Maneja la lógica principal de la aplicación de forma modular
 */

import { NavigationController } from "../controllers/NavigationController.js";
import { ThemeController } from "../controllers/ThemeController.js";
import { FilterController } from "../controllers/FilterController.js";
import { EventManager } from "./EventManager.js";

// Components
import { Dashboard } from "../components/dashboard.js";
import { modals } from "../components/modals.js";
import { presentationManager } from "../components/presentation.js";
import { taskRenderer } from "../components/taskRender.js";

// Services
import { taskManager } from "../services/taskManager.js";
import { storageManager } from "../services/storageManager.js";

export class App {
	constructor(config = {}) {
		this.config = config;
		this.isInitialized = false;
		this.components = new Map();
		this.controllers = new Map();

		// Event manager para comunicación entre módulos
		this.eventManager = new EventManager();

		// Estado de la aplicación
		this.state = {
			currentSection: "overview",
			isLoading: false,
			hasErrors: false,
		};
	}

	/**
	 * Inicializar aplicación
	 */
	async init() {
		if (this.isInitialized) {
			console.warn("App ya está inicializada");
			return;
		}

		try {
			console.log("🚀 Iniciando App...");
			this.setState({ isLoading: true });

			// 1. Verificar dependencias críticas
			await this.checkDependencies();

			// 2. Inicializar gestión de eventos
			this.eventManager.init();

			// 3. Inicializar controladores de forma segura
			await this.initializeControllers();

			// 4. Inicializar componentes de forma segura
			await this.initializeComponents();

			// 5. Configurar comunicación entre módulos
			this.setupModuleCommunication();

			// 6. Cargar estado inicial
			await this.loadInitialState();

			// 7. Configurar eventos globales
			this.setupGlobalEvents();

			this.isInitialized = true;
			this.setState({ isLoading: false });

			console.log("✅ App inicializada correctamente");

			// Emitir evento de inicialización completa
			this.eventManager.emit("app:initialized", {
				config: this.config,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("❌ Error inicializando App:", error);
			this.setState({ isLoading: false, hasErrors: true });
			throw new Error(`Error inicializando App: ${error.message}`);
		}
	}

	/**
	 * Verificar dependencias críticas
	 */
	async checkDependencies() {
		console.log("🔍 Verificando dependencias...");

		// Verificar que los módulos críticos estén disponibles
		const criticalModules = [
			{ name: "taskManager", module: taskManager },
			{ name: "storageManager", module: storageManager },
			{ name: "modals", module: modals },
			{ name: "presentationManager", module: presentationManager },
			{ name: "taskRenderer", module: taskRenderer },
		];

		for (const { name, module } of criticalModules) {
			if (!module) {
				throw new Error(`Módulo crítico no disponible: ${name}`);
			}
		}

		// Verificar elementos DOM críticos
		const criticalElements = ["sidebar", "mainContent", "contentBody"];
		for (const elementId of criticalElements) {
			if (!document.getElementById(elementId)) {
				console.warn(`⚠️ Elemento DOM no encontrado: ${elementId}`);
			}
		}

		console.log("✅ Dependencias verificadas");
	}

	/**
	 * Inicializar controladores de forma segura
	 */
	async initializeControllers() {
		console.log("🔧 Inicializando controladores...");

		try {
			// Navigation Controller
			const navigationController = new NavigationController(this.eventManager);
			await navigationController.init();
			this.controllers.set("navigation", navigationController);
			console.log("✅ NavigationController inicializado");
		} catch (error) {
			console.error("❌ Error en NavigationController:", error);
			// Continuar sin este controlador
		}

		try {
			// Theme Controller
			const themeController = new ThemeController(this.eventManager);
			await themeController.init();
			this.controllers.set("theme", themeController);
			console.log("✅ ThemeController inicializado");
		} catch (error) {
			console.error("❌ Error en ThemeController:", error);
			// Continuar sin este controlador
		}

		try {
			// Filter Controller
			const filterController = new FilterController(this.eventManager);
			await filterController.init();
			this.controllers.set("filter", filterController);
			console.log("✅ FilterController inicializado");
		} catch (error) {
			console.error("❌ Error en FilterController:", error);
			// Continuar sin este controlador
		}
	}

	/**
	 * Inicializar componentes de forma segura
	 */
	async initializeComponents() {
		console.log("📦 Inicializando componentes...");

		try {
			// Task Renderer - con validación
			if (taskRenderer && typeof taskRenderer.init === "function") {
				taskRenderer.init();

				// Verificar que renderTasks existe antes de llamarlo
				if (typeof taskRenderer.renderTasks === "function") {
					taskRenderer.renderTasks();
				}

				// Verificar que updateDashboard existe antes de llamarlo
				if (typeof taskRenderer.updateDashboard === "function") {
					taskRenderer.updateDashboard();
				}

				this.components.set("taskRenderer", taskRenderer);
				console.log("✅ TaskRenderer inicializado");
			}
		} catch (error) {
			console.error("❌ Error en TaskRenderer:", error);
		}

		try {
			// Presentation Manager
			if (
				presentationManager &&
				typeof presentationManager.loadSavedPresentationContent === "function"
			) {
				presentationManager.loadSavedPresentationContent();
				this.components.set("presentation", presentationManager);
				console.log("✅ PresentationManager inicializado");
			}
		} catch (error) {
			console.error("❌ Error en PresentationManager:", error);
		}

		try {
			// Dashboard - con validación
			if (Dashboard) {
				const dashboard = new Dashboard();
				if (typeof dashboard.init === "function") {
					dashboard.init();
					this.components.set("dashboard", dashboard);
					console.log("✅ Dashboard inicializado");
				}
			}
		} catch (error) {
			console.error("❌ Error en Dashboard:", error);
		}

		// Modals está disponible globalmente, no necesita inicialización especial
		this.components.set("modals", modals);
		console.log("✅ Modals registrado");
	}

	/**
	 * Configurar comunicación entre módulos
	 */
	setupModuleCommunication() {
		try {
			// Navigation -> Filter
			this.eventManager.on("navigation:sectionChanged", (data) => {
				const filterController = this.controllers.get("filter");
				if (
					filterController &&
					typeof filterController.onSectionChange === "function"
				) {
					filterController.onSectionChange(data.sectionId);
				}
			});

			// Filter -> TaskRenderer
			this.eventManager.on("filter:applied", (data) => {
				const taskRenderer = this.components.get("taskRenderer");
				if (taskRenderer && typeof taskRenderer.applyFilters === "function") {
					taskRenderer.applyFilters(data.filters);
				}
			});

			// Task Changes -> Dashboard (CORREGIDO)
			this.eventManager.on("task:toggled", (data) => {
				console.log("🎯 Task toggled event:", data);
				const dashboard = this.components.get("dashboard");
				if (dashboard && typeof dashboard.update === "function") {
					dashboard.update();
				}

				const taskRenderer = this.components.get("taskRenderer");
				if (
					taskRenderer &&
					typeof taskRenderer.updateDashboard === "function"
				) {
					taskRenderer.updateDashboard();
				}
			});

			// Subtask Changes -> Dashboard (CORREGIDO)
			this.eventManager.on("subtask:toggled", (data) => {
				console.log("🎯 Subtask toggled event:", data);
				const dashboard = this.components.get("dashboard");
				if (dashboard && typeof dashboard.update === "function") {
					dashboard.update();
				}

				const taskRenderer = this.components.get("taskRenderer");
				if (
					taskRenderer &&
					typeof taskRenderer.updateDashboard === "function"
				) {
					taskRenderer.updateDashboard();
				}
			});

			// Toggle directo desde TaskRenderer (NUEVO)
			this.eventManager.on("task:toggle", (taskId) => {
				console.log("🎯 Direct task toggle:", taskId);
				if (taskManager && typeof taskManager.toggleTask === "function") {
					const result = taskManager.toggleTask(taskId);

					// Re-renderizar
					const taskRenderer = this.components.get("taskRenderer");
					if (taskRenderer) {
						if (taskRenderer.renderTasks) taskRenderer.renderTasks();
						if (taskRenderer.updateDashboard) taskRenderer.updateDashboard();
					}

					// Actualizar dashboard
					const dashboard = this.components.get("dashboard");
					if (dashboard && dashboard.update) {
						dashboard.update();
					}
				}
			});

			// Toggle directo de subtask (NUEVO)
			this.eventManager.on("subtask:toggle", (data) => {
				console.log("🎯 Direct subtask toggle:", data);
				if (taskManager && typeof taskManager.toggleSubtask === "function") {
					const result = taskManager.toggleSubtask(data.taskId, data.index);

					// Re-renderizar
					const taskRenderer = this.components.get("taskRenderer");
					if (taskRenderer) {
						if (taskRenderer.renderTasks) taskRenderer.renderTasks();
						if (taskRenderer.updateDashboard) taskRenderer.updateDashboard();
					}

					// Actualizar dashboard
					const dashboard = this.components.get("dashboard");
					if (dashboard && dashboard.update) {
						dashboard.update();
					}
				}
			});

			// Theme Changes -> All Components
			this.eventManager.on("theme:changed", (data) => {
				this.onThemeChanged(data.theme);
			});

			console.log("✅ Comunicación entre módulos configurada");
		} catch (error) {
			console.error("❌ Error configurando comunicación:", error);
		}
	}

	/**
	 * Cargar estado inicial
	 */
	async loadInitialState() {
		console.log("📋 Cargando estado inicial...");

		try {
			// Cargar configuración guardada
			const savedConfig = storageManager.getItem("appConfig");
			if (savedConfig) {
				this.config = { ...this.config, ...savedConfig };
			}

			// Establecer sección inicial
			const initialSection = this.config.initialSection || "overview";
			await this.navigateToSection(initialSection);

			// Actualizar última visita
			storageManager.setItem("lastVisit", new Date().toISOString());

			console.log("✅ Estado inicial cargado");
		} catch (error) {
			console.error("❌ Error cargando estado inicial:", error);
		}
	}

	/**
	 * Configurar eventos globales
	 */
	setupGlobalEvents() {
		try {
			// Eventos de ventana
			window.addEventListener("scroll", this.onWindowScroll.bind(this));
			window.addEventListener("resize", this.onWindowResize.bind(this));
			window.addEventListener("beforeunload", this.onBeforeUnload.bind(this));

			// Eventos de navegación personalizada
			document.addEventListener("navigate", (e) => {
				this.navigateToSection(e.detail.section);
			});

			// Atajos de teclado
			document.addEventListener("keydown", this.onKeyDown.bind(this));

			console.log("✅ Eventos globales configurados");
		} catch (error) {
			console.error("❌ Error configurando eventos globales:", error);
		}
	}

	/**
	 * Navegar a sección
	 */
	async navigateToSection(sectionId) {
		if (this.state.currentSection === sectionId) {
			return; // Ya estamos en esa sección
		}

		try {
			const previousSection = this.state.currentSection;
			this.setState({ currentSection: sectionId });

			// Delegar a NavigationController
			const navigationController = this.controllers.get("navigation");
			if (
				navigationController &&
				typeof navigationController.showSection === "function"
			) {
				await navigationController.showSection(sectionId);
			}

			// Emitir evento
			this.eventManager.emit("navigation:sectionChanged", {
				previousSection,
				currentSection: sectionId,
			});
		} catch (error) {
			console.error("❌ Error navegando a sección:", error);
		}
	}

	/**
	 * Obtener controlador
	 */
	getController(name) {
		return this.controllers.get(name);
	}

	/**
	 * Obtener componente
	 */
	getComponent(name) {
		return this.components.get(name);
	}

	/**
	 * Actualizar estado
	 */
	setState(newState) {
		const oldState = { ...this.state };
		this.state = { ...this.state, ...newState };

		this.eventManager.emit("app:stateChanged", {
			oldState,
			newState: this.state,
		});
	}

	/**
	 * Obtener estado actual
	 */
	getState() {
		return { ...this.state };
	}

	/**
	 * Manejar cambio de tema
	 */
	onThemeChanged(theme) {
		try {
			// Propagar a componentes que lo necesiten
			const dashboard = this.components.get("dashboard");
			if (dashboard && dashboard.onThemeChanged) {
				dashboard.onThemeChanged(theme);
			}
		} catch (error) {
			console.error("❌ Error en cambio de tema:", error);
		}
	}

	/**
	 * Manejar scroll de ventana
	 */
	onWindowScroll() {
		try {
			const backToTop = document.getElementById("backToTop");
			if (backToTop) {
				const shouldShow = window.pageYOffset > 300;
				backToTop.style.display = shouldShow ? "block" : "none";
			}
		} catch (error) {
			console.error("❌ Error en scroll handler:", error);
		}
	}

	/**
	 * Manejar redimensionado de ventana
	 */
	onWindowResize() {
		try {
			// Emitir evento para componentes que lo necesiten
			this.eventManager.emit("window:resized", {
				width: window.innerWidth,
				height: window.innerHeight,
			});
		} catch (error) {
			console.error("❌ Error en resize handler:", error);
		}
	}

	/**
	 * Manejar antes de cerrar ventana
	 */
	onBeforeUnload() {
		try {
			// Guardar estado antes de cerrar
			this.saveCurrentState();
		} catch (error) {
			console.error("❌ Error en beforeunload handler:", error);
		}
	}

	/**
	 * Manejar teclas de acceso rápido
	 */
	onKeyDown(event) {
		try {
			// Ctrl/Cmd + K - Enfocar búsqueda
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				const searchBox = document.getElementById("searchBox");
				if (searchBox) {
					searchBox.focus();
					searchBox.select();
				}
			}

			// Escape - Limpiar búsqueda o cerrar modales
			if (event.key === "Escape") {
				if (modals && modals.hasActiveModals && modals.hasActiveModals()) {
					// Se maneja automáticamente por el sistema de modales
					return;
				}

				const filterController = this.controllers.get("filter");
				if (filterController && filterController.clearSearch) {
					filterController.clearSearch();
				}
			}

			// Ctrl/Cmd + D - Toggle tema
			if ((event.ctrlKey || event.metaKey) && event.key === "d") {
				event.preventDefault();
				const themeController = this.controllers.get("theme");
				if (themeController && themeController.toggleTheme) {
					themeController.toggleTheme();
				}
			}
		} catch (error) {
			console.error("❌ Error en keydown handler:", error);
		}
	}

	/**
	 * Guardar estado actual
	 */
	saveCurrentState() {
		try {
			if (!this.config.autoSave) return;

			const stateToSave = {
				currentSection: this.state.currentSection,
				timestamp: new Date().toISOString(),
				config: this.config,
			};

			storageManager.setItem("appState", stateToSave);
		} catch (error) {
			console.error("❌ Error guardando estado:", error);
		}
	}

	/**
	 * Restaurar estado guardado
	 */
	async restoreState() {
		try {
			const savedState = storageManager.getItem("appState");
			if (!savedState) return;

			if (savedState.currentSection) {
				await this.navigateToSection(savedState.currentSection);
			}

			if (savedState.config) {
				this.config = { ...this.config, ...savedState.config };
			}
		} catch (error) {
			console.warn("❌ Error restaurando estado:", error);
		}
	}

	/**
	 * Exportar configuración
	 */
	exportConfig() {
		return {
			config: this.config,
			state: this.state,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Importar configuración
	 */
	async importConfig(configData) {
		try {
			if (!configData || typeof configData !== "object") {
				throw new Error("Configuración inválida");
			}

			if (configData.config) {
				this.config = { ...this.config, ...configData.config };
			}

			if (configData.state) {
				await this.restoreState();
			}

			// Guardar nueva configuración
			storageManager.setItem("appConfig", this.config);
		} catch (error) {
			console.error("❌ Error importando configuración:", error);
		}
	}

	/**
	 * Reiniciar aplicación
	 */
	async restart() {
		console.log("🔄 Reiniciando aplicación...");

		try {
			// Limpiar estado actual
			await this.cleanup();

			// Reinicializar
			this.isInitialized = false;
			await this.init();

			console.log("✅ Aplicación reiniciada");
		} catch (error) {
			console.error("❌ Error reiniciando aplicación:", error);
			throw error;
		}
	}

	/**
	 * Limpiar recursos
	 */
	async cleanup() {
		console.log("🧹 Limpiando recursos...");

		try {
			// Guardar estado final
			this.saveCurrentState();

			// Limpiar event listeners globales
			window.removeEventListener("scroll", this.onWindowScroll);
			window.removeEventListener("resize", this.onWindowResize);
			window.removeEventListener("beforeunload", this.onBeforeUnload);

			// Limpiar controladores
			for (const [name, controller] of this.controllers) {
				if (controller && controller.destroy) {
					await controller.destroy();
				}
			}
			this.controllers.clear();

			// Limpiar componentes
			for (const [name, component] of this.components) {
				if (component && component.destroy) {
					await component.destroy();
				}
			}
			this.components.clear();

			// Limpiar event manager
			if (this.eventManager && this.eventManager.destroy) {
				this.eventManager.destroy();
			}
		} catch (error) {
			console.error("❌ Error limpiando recursos:", error);
		}
	}

	/**
	 * Destruir aplicación
	 */
	async destroy() {
		await this.cleanup();
		this.isInitialized = false;
		console.log("💥 Aplicación destruida");
	}
}
