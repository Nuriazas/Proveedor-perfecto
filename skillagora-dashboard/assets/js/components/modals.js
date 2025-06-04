/**
 * Modals Component - Versión Corregida
 * Sistema de modales reutilizable con botones OK funcionando
 */

import { taskManager } from "../services/taskManager.js";
import { TASK_CATEGORIES } from "../data/taskData.js";

export class Modals {
	constructor() {
		this.activeModals = new Set();
		this.zIndexCounter = 1000;

		// Configuración por defecto
		this.defaultConfig = {
			closable: true,
			closeOnOverlay: true,
			closeOnEscape: true,
			animation: "fade",
			size: "medium",
			position: "center",
		};
	}

	/**
	 * Crear modal base
	 */
	createModal(content, config = {}) {
		const modalConfig = { ...this.defaultConfig, ...config };
		const modalId = this.generateModalId();

		const modal = document.createElement("div");
		modal.className = "modal-overlay";
		modal.id = modalId;
		modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: ${this.zIndexCounter++};
            animation: fadeIn 0.3s ease;
        `;

		const modalContent = document.createElement("div");
		modalContent.className = `modal-content ${modalConfig.size}`;
		modalContent.style.cssText = `
            background: var(--card-bg);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
            position: relative;
        `;

		// Aplicar tamaños
		this.applySizeStyles(modalContent, modalConfig.size);

		// Añadir botón de cerrar si es necesario
		if (modalConfig.closable) {
			const closeButton = this.createCloseButton();
			modalContent.appendChild(closeButton);
		}

		// Añadir contenido
		if (typeof content === "string") {
			modalContent.innerHTML += content;
		} else if (content instanceof HTMLElement) {
			modalContent.appendChild(content);
		}

		modal.appendChild(modalContent);

		// Bind eventos DESPUÉS de agregar al DOM
		document.body.appendChild(modal);
		this.bindModalEvents(modal, modalConfig);

		// Registrar modal activo
		this.activeModals.add(modalId);

		return modal;
	}

	/**
	 * Aplicar estilos de tamaño
	 */
	applySizeStyles(element, size) {
		const sizes = {
			small: { width: "400px", padding: "20px" },
			medium: { width: "600px", padding: "30px" },
			large: { width: "800px", padding: "40px" },
			fullscreen: { width: "95vw", height: "90vh", padding: "20px" },
		};

		const sizeConfig = sizes[size] || sizes.medium;
		Object.assign(element.style, sizeConfig);
	}

	/**
	 * Crear botón de cerrar
	 */
	createCloseButton() {
		const closeButton = document.createElement("button");
		closeButton.className = "modal-close-x";
		closeButton.innerHTML = "×";
		closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            color: var(--secondary-color);
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all var(--transition-fast);
        `;

		closeButton.addEventListener("mouseenter", () => {
			closeButton.style.background = "var(--danger-color)";
			closeButton.style.color = "white";
		});

		closeButton.addEventListener("mouseleave", () => {
			closeButton.style.background = "none";
			closeButton.style.color = "var(--secondary-color)";
		});

		return closeButton;
	}

	/**
	 * Bind eventos del modal - CORREGIDO
	 */
	bindModalEvents(modal, config) {
		// Cerrar con overlay
		if (config.closeOnOverlay) {
			modal.addEventListener("click", (e) => {
				if (e.target === modal) {
					this.closeModal(modal.id);
				}
			});
		}

		// Cerrar con botón X
		const closeButton = modal.querySelector(".modal-close-x");
		if (closeButton) {
			closeButton.addEventListener("click", (e) => {
				e.stopPropagation();
				this.closeModal(modal.id);
			});
		}

		// CORREGIDO: Bind todos los botones con clase modal-close
		const closeButtons = modal.querySelectorAll(".modal-close, .btn-primary");
		closeButtons.forEach((button) => {
			if (
				button.textContent.includes("OK") ||
				button.textContent.includes("Cerrar") ||
				button.classList.contains("modal-close")
			) {
				button.addEventListener("click", (e) => {
					e.stopPropagation();
					this.closeModal(modal.id);
				});
			}
		});

		// Cerrar con Escape
		if (config.closeOnEscape) {
			const escapeHandler = (e) => {
				if (e.key === "Escape") {
					this.closeModal(modal.id);
					document.removeEventListener("keydown", escapeHandler);
				}
			};
			document.addEventListener("keydown", escapeHandler);
		}

		// Prevenir scroll del body
		document.body.style.overflow = "hidden";
	}

	/**
	 * Mostrar modal
	 */
	showModal(content, config = {}) {
		const modal = this.createModal(content, config);
		return modal.id;
	}

	/**
	 * Cerrar modal
	 */
	closeModal(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;

		// Animación de salida
		modal.style.animation = "fadeOut 0.3s ease";

		setTimeout(() => {
			if (modal.parentNode) {
				modal.parentNode.removeChild(modal);
			}
			this.activeModals.delete(modalId);

			// Restaurar scroll si no hay más modales
			if (this.activeModals.size === 0) {
				document.body.style.overflow = "";
			}
		}, 300);
	}

	/**
	 * Cerrar todos los modales
	 */
	closeAllModals() {
		this.activeModals.forEach((modalId) => {
			this.closeModal(modalId);
		});
	}

	/**
	 * Modal de notificación - CORREGIDO
	 */
	showNotificationModal(title, message, type = "info") {
		const icons = {
			info: "ℹ️",
			success: "✅",
			warning: "⚠️",
			error: "❌",
		};

		const content = `
            <div class="modal-header">
                <h3>${icons[type]} ${title}</h3>
            </div>
            
            <div class="modal-body" style="margin: 20px 0;">
                <p>${message}</p>
            </div>
            
            <div class="modal-actions" style="text-align: center;">
                <button class="btn-primary modal-close-btn">OK</button>
            </div>
        `;

		const modalId = this.showModal(content, { size: "small" });

		// CORREGIDO: Bind específico para el botón OK
		setTimeout(() => {
			const modal = document.getElementById(modalId);
			if (modal) {
				const okButton = modal.querySelector(".modal-close-btn");
				if (okButton) {
					okButton.addEventListener("click", (e) => {
						e.stopPropagation();
						this.closeModal(modalId);
					});
				}
			}
		}, 100);

		return modalId;
	}

	/**
	 * Modal de estadísticas
	 */
	showStatsModal() {
		const stats = taskManager.getDetailedStats();

		const content = `
            <div class="modal-header">
                <h2>📊 Estadísticas del Proyecto</h2>
            </div>
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
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
            
            <div class="category-progress" style="margin-bottom: 20px;">
                <h3>Progreso por Categoría</h3>
                ${Object.entries(stats.categoryProgress)
									.map(
										([category, progress]) => `
                    <div class="progress-item" style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span>${TASK_CATEGORIES[category]?.icon || "📝"} ${
											TASK_CATEGORIES[category]?.name || category
										}</span>
                            <span>${progress.completedTasks}/${
											progress.totalTasks
										}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${
															progress.percentage
														}%; background: ${
											TASK_CATEGORIES[category]?.color || "var(--primary-color)"
										}"></div>
                        </div>
                    </div>
                `
									)
									.join("")}
            </div>
            
            <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn-secondary" onclick="modals.exportStats()">📤 Exportar</button>
                <button class="btn-primary modal-close">Cerrar</button>
            </div>
        `;

		return this.showModal(content, { size: "large" });
	}

	/**
	 * Modal de ayuda
	 */
	showHelpModal() {
		const content = `
            <div class="modal-header">
                <h2>❓ Guía de Uso</h2>
            </div>
            
            <div class="help-content">
                <div class="help-section">
                    <h3>🎯 Navegación</h3>
                    <ul>
                        <li>Usa el menú lateral para navegar entre secciones</li>
                        <li>Haz clic en las categorías para ver las tareas</li>
                        <li>El dashboard muestra tu progreso general</li>
                        <li>Usa el botón ← para colapsar/expandir el menú</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h3>✅ Gestión de Tareas</h3>
                    <ul>
                        <li>Marca las casillas para completar tareas principales</li>
                        <li>Las subtareas se pueden marcar individualmente</li>
                        <li>El progreso se guarda automáticamente en tu navegador</li>
                        <li>Las tareas completadas se marcan con una línea tachada</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h3>🔍 Filtros y Búsqueda</h3>
                    <ul>
                        <li>Usa los filtros para mostrar tareas específicas por categoría, estado o tiempo</li>
                        <li>La búsqueda funciona en títulos, descripciones, tags y subtareas</li>
                        <li>Los resultados se resaltan automáticamente</li>
                        <li>Usa "Resetear Filtros" para mostrar todas las tareas</li>
                    </ul>
                </div>

                <div class="help-section">
                    <h3>⌨️ Atajos de Teclado</h3>
                    <ul>
                        <li><kbd>Ctrl/Cmd + K</kbd> - Enfocar búsqueda</li>
                        <li><kbd>Ctrl/Cmd + D</kbd> - Cambiar tema (claro/oscuro)</li>
                        <li><kbd>Escape</kbd> - Limpiar búsqueda o cerrar modales</li>
                        <li><kbd>↑↓</kbd> - Navegar sugerencias de búsqueda</li>
                    </ul>
                </div>
            </div>
            
            <div class="modal-actions" style="margin-top: 30px; text-align: center;">
                <button class="btn-primary modal-close">¡Entendido!</button>
            </div>
        `;

		return this.showModal(content, { size: "large" });
	}

	/**
	 * Modal para añadir nueva tarea - CORREGIDO
	 */
	showAddTaskModal() {
		const content = `
        <div class="modal-header">
            <h3>➕ Añadir Nueva Tarea</h3>
        </div>
        
        <div class="add-task-form" style="margin: 20px 0;">
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="taskTitle" style="display: block; margin-bottom: 5px; font-weight: 600;">Título de la Tarea:</label>
                <input type="text" id="taskTitle" placeholder="Ej. Completar el informe" required 
                       style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); box-sizing: border-box;">
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="taskDescription" style="display: block; margin-bottom: 5px; font-weight: 600;">Descripción:</label>
                <textarea id="taskDescription" placeholder="Detalles adicionales sobre la tarea" rows="4" 
                          style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); box-sizing: border-box; resize: vertical;"></textarea>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="taskCategory" style="display: block; margin-bottom: 5px; font-weight: 600;">Categoría:</label>
                <select id="taskCategory" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); box-sizing: border-box;">
                    ${Object.entries(TASK_CATEGORIES)
											.map(
												([key, category]) => `
                            <option value="${key}">${category.icon} ${category.name}</option>
                        `
											)
											.join("")}
                </select>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="taskTime" style="display: block; margin-bottom: 5px; font-weight: 600;">Tiempo Estimado:</label>
                <select id="taskTime" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); box-sizing: border-box;">
                    <option value="1">1 día</option>
                    <option value="2">2 días</option>
                    <option value="3">3 días</option>
                    <option value="4">4 días</option>
                    <option value="5">5 días</option>
                    <option value="7">1 semana</option>
                    <option value="14">2 semanas</option>
                    <option value="30">1 mes</option>
                </select>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
                <label for="taskTags" style="display: block; margin-bottom: 5px; font-weight: 600;">Tags (separados por comas):</label>
                <input type="text" id="taskTags" placeholder="frontend, javascript, api" 
                       style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); box-sizing: border-box;">
            </div>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; font-weight: 600;">Subtareas:</label>
                <div id="subtasks-container">
                    <div class="subtask-input" style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" placeholder="Descripción de la subtarea" 
                               style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                        <button type="button" class="btn-danger remove-subtask" style="padding: 8px 12px;">✕</button>
                    </div>
                </div>
                <button type="button" id="add-subtask" class="btn-secondary" style="width: 100%; padding: 8px;">
                    ➕ Añadir Subtarea
                </button>
            </div>
        </div>
        
        <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn-secondary modal-close">Cancelar</button>
            <button class="btn-primary" id="saveTask">💾 Guardar Tarea</button>
        </div>
    `;

		const modalId = this.showModal(content, { size: "medium" });

		// CORREGIDO: Setup eventos después de que el modal esté en el DOM
		setTimeout(() => {
			this.setupAddTaskEvents(modalId);
		}, 100);

		return modalId;
	}

	/**
	 * Configurar eventos del modal de añadir tarea - CORREGIDO
	 */
	setupAddTaskEvents(modalId) {
		const modal = document.getElementById(modalId);
		if (!modal) return;

		const addSubtaskBtn = modal.querySelector("#add-subtask");
		const subtasksContainer = modal.querySelector("#subtasks-container");
		const saveTaskBtn = modal.querySelector("#saveTask");
		const titleInput = modal.querySelector("#taskTitle");

		// Añadir subtarea
		if (addSubtaskBtn) {
			addSubtaskBtn.addEventListener("click", () => {
				const subtaskDiv = document.createElement("div");
				subtaskDiv.className = "subtask-input";
				subtaskDiv.style.cssText =
					"display: flex; gap: 10px; margin-bottom: 10px;";

				subtaskDiv.innerHTML = `
                <input type="text" placeholder="Descripción de la subtarea" 
                       style="flex: 1; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                <button type="button" class="btn-danger remove-subtask" style="padding: 8px 12px;">✕</button>
            `;

				subtasksContainer.appendChild(subtaskDiv);

				// Evento para remover subtarea
				const removeBtn = subtaskDiv.querySelector(".remove-subtask");
				if (removeBtn) {
					removeBtn.addEventListener("click", () => {
						subtaskDiv.remove();
					});
				}
			});
		}

		// Remover subtareas existentes
		modal.addEventListener("click", (e) => {
			if (e.target.classList.contains("remove-subtask")) {
				e.target.closest(".subtask-input").remove();
			}
		});

		// Enfocar título al abrir
		if (titleInput) {
			setTimeout(() => titleInput.focus(), 100);
		}

		// Guardar tarea
		if (saveTaskBtn) {
			saveTaskBtn.addEventListener("click", () => {
				this.saveNewTask(modal, modalId);
			});
		}

		// Guardar con Enter en título
		if (titleInput) {
			titleInput.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
					this.saveNewTask(modal, modalId);
				}
			});
		}
	}

	/**
	 * Guardar nueva tarea - CORREGIDO
	 */
	saveNewTask(modal, modalId) {
		const title = modal.querySelector("#taskTitle")?.value.trim();
		const description = modal.querySelector("#taskDescription")?.value.trim();
		const category = modal.querySelector("#taskCategory")?.value;
		const time = parseInt(modal.querySelector("#taskTime")?.value);
		const tags = modal.querySelector("#taskTags")?.value.trim();

		// Validación
		if (!title) {
			alert("❌ El título es obligatorio");
			return;
		}

		// Obtener subtareas
		const subtaskInputs = modal.querySelectorAll(".subtask-input input");
		const subtasks = Array.from(subtaskInputs)
			.map((input) => input.value.trim())
			.filter((text) => text.length > 0);

		// Procesar tags
		const taskTags = tags
			? tags
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag.length > 0)
			: [];

		// Crear objeto de tarea
		const newTask = {
			id: `custom-${Date.now()}`,
			title,
			description,
			category,
			time,
			tags: taskTags,
			tasks: subtasks, // CORREGIDO: usar 'tasks' en lugar de 'subtasks'
			isCustom: true,
			dateAdded: new Date().toISOString(),
		};

		try {
			// Guardar en localStorage
			const customTasks = JSON.parse(
				localStorage.getItem("customTasks") || "[]"
			);
			customTasks.push(newTask);
			localStorage.setItem("customTasks", JSON.stringify(customTasks));

			// Cerrar modal
			this.closeModal(modalId);

			// Mostrar notificación de éxito
			this.showNotificationModal(
				"Éxito",
				"Tarea añadida correctamente",
				"success"
			);

			// CORREGIDO: Refrescar la vista para mostrar la nueva tarea
			setTimeout(() => {
				if (window.renderTasks) {
					window.renderTasks();
				}
				if (window.updateDashboard) {
					window.updateDashboard();
				}
			}, 500);
		} catch (error) {
			console.error("Error al guardar tarea:", error);
			this.showNotificationModal("Error", "Error al añadir la tarea", "error");
		}
	}

	/**
	 * Exportar estadísticas
	 */
	exportStats() {
		const stats = taskManager.getDetailedStats();
		const content = JSON.stringify(stats, null, 2);
		this.downloadFile(
			content,
			`skillagora-stats-${Date.now()}.json`,
			"application/json"
		);
	}

	/**
	 * Descargar archivo
	 */
	downloadFile(content, filename, mimeType) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Generar ID único para modal
	 */
	generateModalId() {
		return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Verificar si hay modales activos
	 */
	hasActiveModals() {
		return this.activeModals.size > 0;
	}

	/**
	 * Obtener modal activo (el último)
	 */
	getActiveModal() {
		if (this.activeModals.size === 0) return null;
		const modalIds = Array.from(this.activeModals);
		return document.getElementById(modalIds[modalIds.length - 1]);
	}

	/**
	 * Limpiar todos los modales
	 */
	destroy() {
		this.closeAllModals();
		document.body.style.overflow = "";
		this.activeModals.clear();
	}
}

// Instancia singleton
export const modals = new Modals();

// Hacer disponible globalmente para onclick handlers
window.modals = modals;
