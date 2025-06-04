/**
 * Dashboard Component
 * Maneja las métricas, cards de progreso y estimaciones
 */

import { TASK_CATEGORIES } from "../data/taskData.js";
import { taskManager } from "../services/taskManager.js";

export class Dashboard {
	constructor() {
		this.updateInterval = null;
		this.animationEnabled = true;

		// Configuración de cards
		this.cardConfigs = [
			{
				id: "critical",
				title: "Tareas Críticas",
				icon: "🔴",
				category: "critical",
			},
			{
				id: "important",
				title: "Tareas Importantes",
				icon: "🟡",
				category: "important",
			},
			{
				id: "optional",
				title: "Tareas Opcionales",
				icon: "🟢",
				category: "optional",
			},
			{
				id: "technical",
				title: "Tareas Técnicas",
				icon: "🔧",
				category: "technical",
			},
		];
	}

	/**
	 * Inicializar dashboard
	 */
	init() {
		this.createDashboardHTML();
		this.bindEvents();
		this.update();
		this.startAutoUpdate();
		return this;
	}

	/**
	 * Crear HTML del dashboard
	 */
	createDashboardHTML() {
		const dashboardHTML = `
            <div class="dashboard-grid">
                ${this.cardConfigs
									.map((config) => this.createDashboardCard(config))
									.join("")}
            </div>
            
            ${this.createTimeEstimator()}
            
            ${this.createFiltersContainer()}
        `;

		const overviewSection = document.getElementById("overview");
		if (overviewSection) {
			overviewSection.innerHTML = dashboardHTML;
		}
	}

	/**
	 * Crear card de dashboard
	 */
	createDashboardCard(config) {
		return `
            <div class="dashboard-card" data-category="${config.category}">
                <div class="card-icon">${config.icon}</div>
                <div class="card-title">${config.title}</div>
                <div class="card-value" id="${config.id}Count">0/0</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="${config.id}Progress" style="width: 0%"></div>
                </div>
            </div>
        `;
	}

	/**
	 * Crear estimador de tiempo
	 */
	createTimeEstimator() {
		return `
            <div class="time-estimator">
                <div class="estimator-title">⏱️ Estimación de Tiempo</div>
                <div class="estimator-grid">
                    <div class="estimator-item">
                        <div class="estimator-label">Progreso Total</div>
                        <div class="estimator-value" id="totalProgress">0%</div>
                    </div>
                    <div class="estimator-item">
                        <div class="estimator-label">Días Restantes</div>
                        <div class="estimator-value" id="daysRemaining">--</div>
                    </div>
                    <div class="estimator-item">
                        <div class="estimator-label">Tareas Completadas</div>
                        <div class="estimator-value" id="completedTasks">0</div>
                    </div>
                    <div class="estimator-item">
                        <div class="estimator-label">Total Tareas</div>
                        <div class="estimator-value" id="totalTasks">0</div>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * Crear contenedor de filtros
	 */
	createFiltersContainer() {
		return `
            <div class="filters-container">
                <div class="filters-grid">
                    <div class="filter-group">
                        <label class="filter-label">Categoría</label>
                        <select class="filter-select" id="categoryFilter">
                            <option value="all">Todas las categorías</option>
                            <option value="critical">🔴 Críticas</option>
                            <option value="important">🟡 Importantes</option>
                            <option value="optional">🟢 Opcionales</option>
                            <option value="technical">🔧 Técnicas</option>
                            <option value="fixes">🔨 Correcciones</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Estado</label>
                        <select class="filter-select" id="statusFilter">
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="completed">Completadas</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">Tiempo</label>
                        <select class="filter-select" id="timeFilter">
                            <option value="all">Todos los tiempos</option>
                            <option value="1">1 día</option>
                            <option value="2">2-3 días</option>
                            <option value="5">4-5 días</option>
                            <option value="7">1 semana+</option>
                        </select>
                    </div>

                    <button class="reset-filters" id="resetFiltersBtn">
                        🔄 Resetear Filtros
                    </button>
                </div>
            </div>
        `;
	}

	/**
	 * Bind eventos
	 */
	bindEvents() {
		// Escuchar cambios en el task manager
		taskManager.on("progressUpdate", () => this.update());
		taskManager.on("taskToggle", () => this.update());
		taskManager.on("subtaskToggle", () => this.update());

		// Cards interactivas
		const dashboardCards = document.querySelectorAll(".dashboard-card");
		dashboardCards.forEach((card) => {
			card.addEventListener("click", () => {
				const category = card.dataset.category;
				this.navigateToCategory(category);
			});
		});

		// Hover effects
		dashboardCards.forEach((card) => {
			card.addEventListener("mouseenter", () =>
				this.animateCard(card, "hover")
			);
			card.addEventListener("mouseleave", () =>
				this.animateCard(card, "leave")
			);
		});
	}

	/**
	 * Actualizar dashboard
	 */
	update() {
		this.updateCategoryCards();
		this.updateTimeEstimator();
		this.updateProgressAnimations();
	}

	/**
	 * Actualizar cards de categorías
	 */
	updateCategoryCards() {
		const categoryProgress = taskManager.getProgressByCategory();

		this.cardConfigs.forEach((config) => {
			const progress = categoryProgress[config.category];
			if (progress) {
				this.updateCard(config.id, progress);
			}
		});
	}

	/**
	 * Actualizar card individual
	 */
	updateCard(cardId, progress) {
		const countElement = document.getElementById(`${cardId}Count`);
		const progressElement = document.getElementById(`${cardId}Progress`);

		if (countElement) {
			const newValue = `${progress.completedTasks}/${progress.totalTasks}`;
			this.animateValue(countElement, newValue);
		}

		if (progressElement) {
			this.animateProgress(progressElement, progress.percentage);
		}
	}

	/**
	 * Actualizar estimador de tiempo
	 */
	updateTimeEstimator() {
		const globalProgress = taskManager.getProgress();
		const stats = taskManager.getDetailedStats();

		// Progreso total
		const totalProgressElement = document.getElementById("totalProgress");
		if (totalProgressElement) {
			const percentage = Math.round(globalProgress.percentage);
			this.animateValue(totalProgressElement, `${percentage}%`);
		}

		// Días restantes
		const daysRemainingElement = document.getElementById("daysRemaining");
		if (daysRemainingElement) {
			this.animateValue(
				daysRemainingElement,
				globalProgress.remainingTime.toString()
			);
		}

		// Tareas completadas
		const completedTasksElement = document.getElementById("completedTasks");
		if (completedTasksElement) {
			this.animateValue(
				completedTasksElement,
				globalProgress.completedTasks.toString()
			);
		}

		// Total tareas
		const totalTasksElement = document.getElementById("totalTasks");
		if (totalTasksElement) {
			this.animateValue(
				totalTasksElement,
				globalProgress.totalTasks.toString()
			);
		}
	}

	/**
	 * Animar valor de texto
	 */
	animateValue(element, newValue) {
		if (!this.animationEnabled) {
			element.textContent = newValue;
			return;
		}

		const currentValue = element.textContent;
		if (currentValue === newValue) return;

		// Animación de fade
		element.style.opacity = "0.5";
		element.style.transform = "scale(0.95)";

		setTimeout(() => {
			element.textContent = newValue;
			element.style.opacity = "1";
			element.style.transform = "scale(1)";
		}, 150);
	}

	/**
	 * Animar barra de progreso
	 */
	animateProgress(element, percentage) {
		if (!this.animationEnabled) {
			element.style.width = `${percentage}%`;
			return;
		}

		// Animar width gradualmente
		const currentWidth = parseFloat(element.style.width) || 0;
		const targetWidth = Math.min(percentage, 100);

		if (Math.abs(currentWidth - targetWidth) < 1) return;

		element.style.transition = "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
		element.style.width = `${targetWidth}%`;

		// Efecto de brillo al completar
		if (targetWidth === 100) {
			element.style.boxShadow = "0 0 10px var(--success-color)";
			setTimeout(() => {
				element.style.boxShadow = "";
			}, 1000);
		}
	}

	/**
	 * Actualizar animaciones de progreso
	 */
	updateProgressAnimations() {
		const progressBars = document.querySelectorAll(".progress-fill");
		progressBars.forEach((bar) => {
			const width = parseFloat(bar.style.width) || 0;

			// Añadir clase de estado basado en progreso
			bar.classList.remove(
				"progress-low",
				"progress-medium",
				"progress-high",
				"progress-complete"
			);

			if (width === 100) {
				bar.classList.add("progress-complete");
			} else if (width >= 75) {
				bar.classList.add("progress-high");
			} else if (width >= 50) {
				bar.classList.add("progress-medium");
			} else {
				bar.classList.add("progress-low");
			}
		});
	}

	/**
	 * Animar card
	 */
	animateCard(cardElement, action) {
		if (!this.animationEnabled) return;

		switch (action) {
			case "hover":
				cardElement.style.transform = "translateY(-8px) scale(1.02)";
				cardElement.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.15)";
				break;
			case "leave":
				cardElement.style.transform = "translateY(0) scale(1)";
				cardElement.style.boxShadow = "";
				break;
			case "click":
				cardElement.style.transform = "scale(0.98)";
				setTimeout(() => {
					cardElement.style.transform = "";
				}, 150);
				break;
		}
	}

	/**
	 * Navegar a categoría
	 */
	navigateToCategory(category) {
		// Animar click
		const cardElement = document.querySelector(`[data-category="${category}"]`);
		if (cardElement) {
			this.animateCard(cardElement, "click");
		}

		// Dispatch evento de navegación
		setTimeout(() => {
			const event = new CustomEvent("navigate", {
				detail: { section: category },
			});
			document.dispatchEvent(event);
		}, 200);
	}

	/**
	 * Mostrar estadísticas detalladas
	 */
	showDetailedStats() {
		const stats = taskManager.getDetailedStats();
		const modal = this.createStatsModal(stats);
		document.body.appendChild(modal);
	}

	/**
	 * Crear modal de estadísticas
	 */
	createStatsModal(stats) {
		const modal = document.createElement("div");
		modal.className = "modal-overlay";
		modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h2 class="modal-header">📊 Estadísticas Detalladas</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedTasks}</div>
                        <div class="stat-label">Tareas Completadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalTasks}</div>
                        <div class="stat-label">Total Tareas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completedSubtasks}</div>
                        <div class="stat-label">Subtareas Completadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(
													stats.percentage
												)}%</div>
                        <div class="stat-label">Progreso General</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3>Progreso por Categoría</h3>
                    ${Object.entries(stats.categoryProgress)
											.map(
												([category, progress]) => `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${
																	TASK_CATEGORIES[category]?.name || category
																}</span>
                                <span>${progress.completedTasks}/${
													progress.totalTasks
												}</span>
                            </div>
                            <div class="progress-bar" style="margin-top: 5px;">
                                <div class="progress-fill" style="width: ${
																	progress.percentage
																}%"></div>
                            </div>
                        </div>
                    `
											)
											.join("")}
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3>Distribución por Tiempo</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div class="stat-card">
                            <div class="stat-value">${
															stats.tasksByTime.quick
														}</div>
                            <div class="stat-label">Rápidas (≤2 días)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${
															stats.tasksByTime.medium
														}</div>
                            <div class="stat-label">Medias (3-4 días)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${
															stats.tasksByTime.long
														}</div>
                            <div class="stat-label">Largas (>4 días)</div>
                        </div>
                    </div>
                </div>
                
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    Cerrar
                </button>
            </div>
        `;

		// Cerrar con click fuera
		modal.addEventListener("click", (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});

		return modal;
	}

	/**
	 * Exportar progreso
	 */
	exportProgress() {
		const data = taskManager.exportProgress();
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `skillagora-progress-${
			new Date().toISOString().split("T")[0]
		}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		return data;
	}

	/**
	 * Importar progreso
	 */
	importProgress() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.onchange = (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const data = JSON.parse(e.target.result);
						const result = taskManager.importProgress(data);

						if (result.success) {
							this.showNotification(
								"Progreso importado exitosamente!",
								"success"
							);
							this.update();
						} else {
							this.showNotification(result.message, "error");
						}
					} catch (error) {
						this.showNotification(
							"Error al importar el archivo: " + error.message,
							"error"
						);
					}
				};
				reader.readAsText(file);
			}
		};

		input.click();
	}

	/**
	 * Mostrar notificación
	 */
	showNotification(message, type = "info") {
		const notification = document.createElement("div");
		notification.className = `notification ${type}`;
		notification.textContent = message;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.style.animation = "slideOutRight 0.3s ease";
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 300);
		}, 3000);
	}

	/**
	 * Configurar auto-update
	 */
	startAutoUpdate(interval = 30000) {
		this.stopAutoUpdate();
		this.updateInterval = setInterval(() => {
			this.update();
		}, interval);
	}

	/**
	 * Detener auto-update
	 */
	stopAutoUpdate() {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}

	/**
	 * Habilitar/deshabilitar animaciones
	 */
	setAnimationEnabled(enabled) {
		this.animationEnabled = enabled;

		if (!enabled) {
			// Remover todas las transiciones CSS temporalmente
			const style = document.createElement("style");
			style.innerHTML = `
                .dashboard-card,
                .progress-fill,
                .estimator-value,
                .card-value {
                    transition: none !important;
                }
            `;
			document.head.appendChild(style);

			setTimeout(() => {
				document.head.removeChild(style);
			}, 100);
		}
	}

	/**
	 * Obtener métricas de rendimiento
	 */
	getPerformanceMetrics() {
		const stats = taskManager.getDetailedStats();
		const velocity = this.calculateVelocity();
		const burndown = this.calculateBurndown();

		return {
			completion: stats.percentage,
			velocity,
			burndown,
			efficiency: this.calculateEfficiency(),
			estimatedCompletion: stats.estimatedCompletionDate,
		};
	}

	/**
	 * Calcular velocidad de trabajo
	 */
	calculateVelocity() {
		// Simplificado: tareas completadas por día
		const completedTasks = taskManager.getProgress().completedTasks;
		const startDate = new Date("2024-01-01"); // Fecha de inicio del proyecto
		const daysPassed = Math.ceil(
			(new Date() - startDate) / (1000 * 60 * 60 * 24)
		);

		return daysPassed > 0 ? (completedTasks / daysPassed).toFixed(2) : 0;
	}

	/**
	 * Calcular burndown
	 */
	calculateBurndown() {
		const progress = taskManager.getProgress();
		return {
			ideal: progress.totalTime,
			actual: progress.completedTime,
			remaining: progress.remainingTime,
		};
	}

	/**
	 * Calcular eficiencia
	 */
	calculateEfficiency() {
		const stats = taskManager.getDetailedStats();
		const subtaskEfficiency =
			stats.totalSubtasks > 0
				? (stats.completedSubtasks / stats.totalSubtasks) * 100
				: 0;

		return Math.round((stats.percentage + subtaskEfficiency) / 2);
	}

	/**
	 * Crear gráfico de progreso (simple)
	 */
	createProgressChart(containerId) {
		const container = document.getElementById(containerId);
		if (!container) return;

		const categoryProgress = taskManager.getProgressByCategory();
		const chartHTML = `
            <div class="progress-chart">
                <h3>Progreso por Categoría</h3>
                ${Object.entries(categoryProgress)
									.map(
										([category, progress]) => `
                    <div class="chart-bar">
                        <div class="chart-label">
                            ${TASK_CATEGORIES[category]?.icon || "📝"} 
                            ${TASK_CATEGORIES[category]?.name || category}
                        </div>
                        <div class="chart-progress">
                            <div class="chart-bar-bg">
                                <div class="chart-bar-fill" 
                                     style="width: ${
																				progress.percentage
																			}%; background: ${
											TASK_CATEGORIES[category]?.color || "var(--primary-color)"
										}">
                                </div>
                            </div>
                            <span class="chart-percentage">${Math.round(
															progress.percentage
														)}%</span>
                        </div>
                    </div>
                `
									)
									.join("")}
            </div>
        `;

		container.innerHTML = chartHTML;
	}

	/**
	 * Obtener estado del dashboard
	 */
	getState() {
		return {
			animationEnabled: this.animationEnabled,
			autoUpdateEnabled: this.updateInterval !== null,
			lastUpdate: new Date().toISOString(),
		};
	}

	/**
	 * Restaurar estado del dashboard
	 */
	restoreState(state) {
		if (state.animationEnabled !== undefined) {
			this.setAnimationEnabled(state.animationEnabled);
		}

		if (state.autoUpdateEnabled) {
			this.startAutoUpdate();
		} else {
			this.stopAutoUpdate();
		}
	}

	/**
	 * Limpiar dashboard
	 */
	destroy() {
		this.stopAutoUpdate();

		// Remover event listeners del task manager
		taskManager.off("progressUpdate", () => this.update());
		taskManager.off("taskToggle", () => this.update());
		taskManager.off("subtaskToggle", () => this.update());

		// Limpiar referencias
		this.cardConfigs = [];
	}
}
