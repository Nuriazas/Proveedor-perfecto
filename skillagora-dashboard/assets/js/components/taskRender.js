// assets/js/components/taskRenderer.js - Versión Corregida
import { taskManager } from "../services/taskManager.js";
import { TASK_CATEGORIES, TASK_DATA } from "../data/taskData.js";

export class TaskRenderer {
	constructor() {
		this.renderedSections = new Set(); // Trackear qué secciones se han renderizado
	}

	init() {
		console.log("🎨 Inicializando TaskRenderer...");

		// Hacer funciones disponibles globalmente
		window.deleteCustomTask = this.deleteCustomTask.bind(this);
		window.renderTasks = this.renderTasks.bind(this);
		window.updateDashboard = this.updateDashboard.bind(this);

		// Renderizar todas las secciones al inicializar
		this.renderAllSections();

		console.log("✅ TaskRenderer inicializado");
	}

	// Función para combinar tareas originales con personalizadas
	getAllTasksData() {
		const customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
		const allTasks = { ...TASK_DATA };

		// Crear un Set para evitar duplicados por ID
		const addedTaskIds = new Set();

		// Primero añadir las tareas originales
		Object.keys(allTasks).forEach((category) => {
			if (allTasks[category] && Array.isArray(allTasks[category])) {
				allTasks[category].forEach((task) => {
					addedTaskIds.add(task.id);
				});
			}
		});

		// Luego añadir tareas personalizadas, evitando duplicados
		customTasks.forEach((task) => {
			if (!addedTaskIds.has(task.id)) {
				if (!allTasks[task.category]) {
					allTasks[task.category] = [];
				}
				allTasks[task.category].push(task);
				addedTaskIds.add(task.id);
			}
		});

		return allTasks;
	}

	// Función para limpiar localStorage de duplicados
	cleanDuplicateCustomTasks() {
		const customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
		const uniqueTasks = [];
		const seenIds = new Set();

		customTasks.forEach((task) => {
			if (!seenIds.has(task.id)) {
				uniqueTasks.push(task);
				seenIds.add(task.id);
			}
		});

		if (uniqueTasks.length !== customTasks.length) {
			localStorage.setItem("customTasks", JSON.stringify(uniqueTasks));
			console.log("🧹 Limpiados duplicados del localStorage");
		}
	}

	// Renderizar todas las secciones (FIX para problema 1)
	renderAllSections() {
		console.log("🎨 Renderizando todas las secciones...");

		Object.keys(TASK_CATEGORIES).forEach((category) => {
			this.renderTaskSection(category);
		});

		this.updateDashboard();
	}

	// Renderizar sección específica
	renderTaskSection(category) {
		const container = document.getElementById(`${category}Tasks`);
		const allTasksData = this.getAllTasksData();

		if (!container) {
			console.warn(`⚠️ Contenedor no encontrado: ${category}Tasks`);
			return;
		}

		if (!allTasksData[category] || !Array.isArray(allTasksData[category])) {
			console.warn(`⚠️ No hay tareas para la categoría: ${category}`);
			container.innerHTML = `
                <div class="task-section ${category}">
                    <div class="task-section-header">
                        <div class="section-title">
                            ${TASK_CATEGORIES[category]?.icon || "📝"} ${
				TASK_CATEGORIES[category]?.name || category
			}
                        </div>
                        <div class="section-stats">
                            <span>0/0 completadas</span>
                            <span>0 días</span>
                        </div>
                    </div>
                    <div class="task-section-body">
                        <p style="padding: 20px; text-align: center; color: var(--secondary-color);">
                            No hay tareas en esta categoría
                        </p>
                    </div>
                </div>
            `;
			return;
		}

		const tasks = allTasksData[category];
		const categoryInfo = TASK_CATEGORIES[category];

		const completedCount = tasks.filter((task) =>
			taskManager.isTaskCompleted(task.id)
		).length;

		container.innerHTML = `
            <div class="task-section ${category}" id="section-${category}">
                <div class="task-section-header" onclick="app.toggleTaskSection ? app.toggleTaskSection('${category}') : null">
                    <div class="section-title">
                        ${categoryInfo.icon} ${categoryInfo.name}
                    </div>
                    <div class="section-stats">
                        <span>${completedCount}/${
			tasks.length
		} completadas</span>
                        <span>${tasks.reduce(
													(sum, task) => sum + (task.time || 0),
													0
												)} días</span>
                        <span class="collapse-icon">▼</span>
                    </div>
                </div>
                <div class="task-section-body">
                    ${tasks
											.map((task) => this.renderTaskItem(task, category))
											.join("")}
                </div>
            </div>
        `;

		this.renderedSections.add(category);
	}

	// Renderizar item de tarea (FIX para problema 3 - persistencia)
	renderTaskItem(task, category) {
		const isCompleted = taskManager.isTaskCompleted(task.id);
		const completedSubtasks = task.tasks
			? task.tasks.filter((_, index) =>
					taskManager.isSubtaskCompleted(task.id, index)
			  ).length
			: 0;

		const totalSubtasks = task.tasks ? task.tasks.length : 0;

		return `
            <div class="task-item ${category} ${
			isCompleted ? "completed" : ""
		}" data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox"
                           ${isCompleted ? "checked" : ""}
                           onchange="window.app ? window.app.eventManager.emit('task:toggle', '${
															task.id
														}') : (taskManager.toggleTask('${
			task.id
		}'), window.renderTasks(), window.updateDashboard())">
                    <div class="task-title">${task.title}${
			task.isCustom ? " ✨" : ""
		}</div>
                    <div class="task-time">${task.time || 0} día${
			(task.time || 0) > 1 ? "s" : ""
		}</div>
                    ${
											task.isCustom
												? `<button class="delete-task-btn" onclick="deleteCustomTask('${task.id}')" title="Eliminar tarea">🗑️</button>`
												: ""
										}
                </div>
                <div class="task-description">${task.description || ""}</div>
                ${
									totalSubtasks > 0
										? `
                <div style="margin: 15px 0 0 28px;">
                    <div style="font-weight: 600; margin-bottom: 10px;">
                        Subtareas (${completedSubtasks}/${totalSubtasks}):
                    </div>
                    ${task.tasks
											.map(
												(subtask, index) => `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <input type="checkbox"
                                   ${
																			taskManager.isSubtaskCompleted(
																				task.id,
																				index
																			)
																				? "checked"
																				: ""
																		}
                                   onchange="window.app ? window.app.eventManager.emit('subtask:toggle', {taskId: '${
																			task.id
																		}', index: ${index}}) : (taskManager.toggleSubtask('${
													task.id
												}', ${index}), window.renderTasks(), window.updateDashboard())"
                                   style="margin-right: 8px;">
                            <span style="color: var(--secondary-color); font-size: 0.9em; ${
															taskManager.isSubtaskCompleted(task.id, index)
																? "text-decoration: line-through;"
																: ""
														}">${subtask}</span>
                        </div>
                    `
											)
											.join("")}
                </div>
                `
										: ""
								}
                ${
									task.tags && task.tags.length > 0
										? `
                <div class="task-tags">
                    ${task.tags
											.map((tag) => `<span class="task-tag">${tag}</span>`)
											.join("")}
                </div>
                `
										: ""
								}
            </div>
        `;
	}

	// Renderizar tareas (mejorado)
	renderTasks() {
		console.log("🎨 Renderizando tareas...");

		// Limpiar duplicados primero
		this.cleanDuplicateCustomTasks();

		// Renderizar todas las secciones
		this.renderAllSections();
	}

	// Actualizar dashboard (mejorado)
	updateDashboard() {
		console.log("📊 Actualizando dashboard...");

		const allTasksData = this.getAllTasksData();

		Object.keys(TASK_CATEGORIES).forEach((category) => {
			const tasks = allTasksData[category] || [];
			const completedTasks = tasks.filter((task) =>
				taskManager.isTaskCompleted(task.id)
			).length;

			const countElement = document.getElementById(`${category}Count`);
			const progressElement = document.getElementById(`${category}Progress`);

			if (countElement) {
				countElement.textContent = `${completedTasks}/${tasks.length}`;
			}

			if (progressElement) {
				const percentage =
					tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
				progressElement.style.width = `${percentage}%`;
			}
		});

		// Totales
		const allTasks = Object.values(allTasksData).flat();
		const completedTasks = allTasks.filter((task) =>
			taskManager.isTaskCompleted(task.id)
		).length;

		const totalTasksElement = document.getElementById("totalTasks");
		const completedTasksElement = document.getElementById("completedTasks");
		const totalProgressElement = document.getElementById("totalProgress");
		const daysRemainingElement = document.getElementById("daysRemaining");

		if (totalTasksElement) {
			totalTasksElement.textContent = allTasks.length;
		}

		if (completedTasksElement) {
			completedTasksElement.textContent = completedTasks;
		}

		if (totalProgressElement) {
			const percentage =
				allTasks.length > 0
					? Math.round((completedTasks / allTasks.length) * 100)
					: 0;
			totalProgressElement.textContent = `${percentage}%`;
		}

		if (daysRemainingElement) {
			const remainingTasks = allTasks.filter(
				(task) => !taskManager.isTaskCompleted(task.id)
			);
			const remainingDays = remainingTasks.reduce(
				(sum, task) => sum + (task.time || 0),
				0
			);
			daysRemainingElement.textContent = remainingDays;
		}
	}

	// Función para eliminar tarea personalizada (FIX para problema 2 - modales)
	deleteCustomTask(taskId) {
		if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
			let customTasks = JSON.parse(localStorage.getItem("customTasks") || "[]");
			const initialLength = customTasks.length;
			customTasks = customTasks.filter((task) => task.id !== taskId);

			if (customTasks.length < initialLength) {
				localStorage.setItem("customTasks", JSON.stringify(customTasks));

				// Volver a renderizar
				this.renderTasks();

				// Mostrar notificación - FIX: usar alert como fallback
				if (window.modals && window.modals.showNotificationModal) {
					window.modals.showNotificationModal(
						"Éxito",
						"Tarea eliminada correctamente",
						"success"
					);
				} else {
					// Fallback
					setTimeout(() => {
						alert("✅ Tarea eliminada correctamente");
					}, 100);
				}
			} else {
				console.error("❌ No se pudo eliminar la tarea");
				alert("❌ Error al eliminar la tarea");
			}
		}
	}

	// Aplicar filtros (nuevo método para compatibilidad)
	applyFilters(filters) {
		console.log("🔍 Aplicando filtros:", filters);
		// Este método será llamado por el FilterController
		// Por ahora, simplemente re-renderizar
		this.renderTasks();
	}

	// Toggle sección de tareas
	toggleTaskSection(category) {
		const section = document.getElementById(`section-${category}`);
		if (section) {
			section.classList.toggle("collapsed");
		}
	}

	// Limpiar componente
	destroy() {
		this.renderedSections.clear();

		// Limpiar funciones globales
		if (window.deleteCustomTask) delete window.deleteCustomTask;
		if (window.renderTasks) delete window.renderTasks;
		if (window.updateDashboard) delete window.updateDashboard;

		console.log("🧹 TaskRenderer limpiado");
	}
}

// Crear instancia
export const taskRenderer = new TaskRenderer();
