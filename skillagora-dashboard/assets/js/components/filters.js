/**
 * Filters Component
 * Maneja el sistema de filtros y búsqueda
 */

import { taskManager } from '../services/taskManager.js';
import { TaskDataUtils } from '../data/taskData.js';

export class Filters {
    constructor() {
        this.currentFilters = {
            category: 'all',
            status: 'all',
            time: 'all',
            search: ''
        };
        
        this.availableTags = TaskDataUtils.getAllTags();
        this.isVisible = true;
        
        // Event listeners
        this.listeners = {
            filterChange: [],
            searchChange: [],
            reset: []
        };
    }

    /**
     * Inicializar filtros
     */
    init() {
        this.loadSavedFilters();
        this.bindEvents();
        this.update();
        return this;
    }

    /**
     * Cargar filtros guardados
     */
    loadSavedFilters() {
        const saved = taskManager.filters;
        this.currentFilters = { ...this.currentFilters, ...saved };
        this.applyFiltersToUI();
    }

    /**
     * Aplicar filtros a la UI
     */
    applyFiltersToUI() {
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const timeFilter = document.getElementById('timeFilter');
        const searchBox = document.getElementById('searchBox');

        if (categoryFilter) categoryFilter.value = this.currentFilters.category;
        if (statusFilter) statusFilter.value = this.currentFilters.status;
        if (timeFilter) timeFilter.value = this.currentFilters.time;
        if (searchBox) searchBox.value = this.currentFilters.search;
    }

    /**
     * Bind eventos
     */
    bindEvents() {
        // Filtros de select
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const timeFilter = document.getElementById('timeFilter');
        const resetButton = document.getElementById('resetFiltersBtn');
        const searchBox = document.getElementById('searchBox');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.updateFilter('category', e.target.value);
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.updateFilter('status', e.target.value);
            });
        }

        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.updateFilter('time', e.target.value);
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        if (searchBox) {
            // Debounce para búsqueda
            let searchTimeout;
            searchBox.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.updateFilter('search', e.target.value);
                }, 300);
            });

            // Limpiar búsqueda con Escape
            searchBox.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }
    }

    /**
     * Actualizar filtro individual
     */
    updateFilter(filterType, value) {
        const oldValue = this.currentFilters[filterType];
        this.currentFilters[filterType] = value;
        
        // Guardar en taskManager
        taskManager.applyFilters(this.currentFilters);
        
        // Aplicar filtros
        this.applyFilters();
        
        // Emitir evento
        this.emit('filterChange', {
            filterType,
            oldValue,
            newValue: value,
            allFilters: this.currentFilters
        });
        
        // Actualizar contador de resultados
        this.updateResultsCount();
    }

    /**
     * Aplicar todos los filtros
     */
    applyFilters() {
        const allTasks = TaskDataUtils.getAllTasks();
        let filteredTasks = [...allTasks];

        // Filtro por categoría
        if (this.currentFilters.category !== 'all') {
            filteredTasks = TaskDataUtils.getTasksByCategory(this.currentFilters.category);
        }

        // Filtro por estado
        if (this.currentFilters.status !== 'all') {
            filteredTasks = filteredTasks.filter(task => {
                const isCompleted = taskManager.isTaskCompleted(task.id);
                return this.currentFilters.status === 'completed' ? isCompleted : !isCompleted;
            });
        }

        // Filtro por tiempo
        if (this.currentFilters.time !== 'all') {
            const timeLimit = parseInt(this.currentFilters.time);
            filteredTasks = filteredTasks.filter(task => task.time <= timeLimit);
        }

        // Filtro por búsqueda
        if (this.currentFilters.search.trim()) {
            filteredTasks = this.searchInTasks(filteredTasks, this.currentFilters.search);
        }

        // Aplicar visibilidad a las tareas en el DOM
        this.applyTaskVisibility(filteredTasks);
        
        return filteredTasks;
    }

    /**
     * Buscar en tareas
     */
    searchInTasks(tasks, query) {
        const lowerQuery = query.toLowerCase().trim();
        
        return tasks.filter(task => {
            // Buscar en título
            const titleMatch = task.title.toLowerCase().includes(lowerQuery);
            
            // Buscar en descripción
            const descMatch = task.description.toLowerCase().includes(lowerQuery);
            
            // Buscar en tags
            const tagMatch = task.tags.some(tag => 
                tag.toLowerCase().includes(lowerQuery)
            );
            
            // Buscar en subtareas
            const subtaskMatch = task.tasks.some(subtask => 
                subtask.toLowerCase().includes(lowerQuery)
            );
            
            return titleMatch || descMatch || tagMatch || subtaskMatch;
        });
    }

    /**
     * Aplicar visibilidad a las tareas en el DOM
     */
    applyTaskVisibility(visibleTasks) {
        const visibleTaskIds = new Set(visibleTasks.map(task => task.id));
        
        // Obtener todos los elementos de tarea
        const taskElements = document.querySelectorAll('.task-item');
        
        taskElements.forEach(element => {
            const taskId = element.dataset.taskId;
            const shouldShow = visibleTaskIds.has(taskId);
            
            element.style.display = shouldShow ? 'block' : 'none';
            
            // Añadir clase para animación
            if (shouldShow) {
                element.classList.remove('filtered-out');
                element.classList.add('filtered-in');
            } else {
                element.classList.remove('filtered-in');
                element.classList.add('filtered-out');
            }
        });

        // Ocultar secciones vacías
        this.updateSectionVisibility(visibleTasks);
    }

    /**
     * Actualizar visibilidad de secciones
     */
    updateSectionVisibility(visibleTasks) {
        const categories = ['critical', 'important', 'optional', 'technical', 'fixes'];
        
        categories.forEach(category => {
            const sectionElement = document.getElementById(`section-${category}`);
            const hasTasks = visibleTasks.some(task => 
                TaskDataUtils.getCategoryByTaskId(task.id) === category
            );
            
            if (sectionElement) {
                if (hasTasks) {
                    sectionElement.classList.remove('hidden');
                } else {
                    sectionElement.classList.add('hidden');
                }
            }
        });
    }

    /**
     * Actualizar contador de resultados
     */
    updateResultsCount() {
        const filteredTasks = this.applyFilters();
        const count = filteredTasks.length;
        const total = TaskDataUtils.getAllTasks().length;
        
        // Actualizar indicador en la UI
        this.updateResultsIndicator(count, total);
    }

    /**
     * Actualizar indicador de resultados
     */
    updateResultsIndicator(count, total) {
        let indicator = document.getElementById('resultsIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'resultsIndicator';
            indicator.className = 'results-indicator';
            indicator.style.cssText = `
                background: var(--info-color);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 600;
                margin-left: auto;
                white-space: nowrap;
            `;
            
            const filtersContainer = document.querySelector('.filters-container .filters-grid');
            if (filtersContainer) {
                filtersContainer.appendChild(indicator);
            }
        }
        
        indicator.textContent = count === total 
            ? `${total} tareas` 
            : `${count} de ${total} tareas`;
        
        // Cambiar color según los resultados
        if (count === 0) {
            indicator.style.background = 'var(--danger-color)';
        } else if (count < total) {
            indicator.style.background = 'var(--warning-color)';
        } else {
            indicator.style.background = 'var(--info-color)';
        }
    }

    /**
     * Resetear filtros
     */
    resetFilters() {
        const oldFilters = { ...this.currentFilters };
        
        this.currentFilters = {
            category: 'all',
            status: 'all',
            time: 'all',
            search: ''
        };
        
        // Aplicar a UI
        this.applyFiltersToUI();
        
        // Aplicar filtros
        this.applyFilters();
        
        // Guardar en taskManager
        taskManager.resetFilters();
        
        // Emitir evento
        this.emit('reset', {
            oldFilters,
            newFilters: this.currentFilters
        });
        
        // Actualizar contador
        this.updateResultsCount();
        
        // Mostrar notificación
        this.showNotification('Filtros restablecidos', 'info');
    }

    /**
     * Limpiar búsqueda
     */
    clearSearch() {
        this.updateFilter('search', '');
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.value = '';
            searchBox.blur();
        }
    }

    /**
     * Obtener sugerencias de búsqueda
     */
    getSearchSuggestions(query) {
        return TaskDataUtils.getSearchSuggestions(query);
    }

    /**
     * Crear autocompletado de búsqueda
     */
    createSearchAutocomplete() {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;
        
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'search-autocomplete';
        autocompleteContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 6px 6px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        // Posicionar relativo al search box
        searchBox.parentElement.style.position = 'relative';
        searchBox.parentElement.appendChild(autocompleteContainer);
        
        // Eventos de autocompletado
        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showAutocomplete(autocompleteContainer, query);
            } else {
                this.hideAutocomplete(autocompleteContainer);
            }
        });
        
        searchBox.addEventListener('blur', () => {
            setTimeout(() => this.hideAutocomplete(autocompleteContainer), 200);
        });
        
        return autocompleteContainer;
    }

    /**
     * Mostrar autocompletado
     */
    showAutocomplete(container, query) {
        const suggestions = this.getSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideAutocomplete(container);
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="autocomplete-item" style="
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
            " data-suggestion="${suggestion}">
                ${this.highlightMatch(suggestion, query)}
            </div>
        `).join('');
        
        // Eventos de click
        container.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                this.updateFilter('search', suggestion);
                document.getElementById('searchBox').value = suggestion;
                this.hideAutocomplete(container);
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--hover-bg)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = '';
            });
        });
        
        container.style.display = 'block';
    }

    /**
     * Ocultar autocompletado
     */
    hideAutocomplete(container) {
        container.style.display = 'none';
    }

    /**
     * Resaltar coincidencias en texto
     */
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    /**
     * Crear filtros avanzados
     */
    createAdvancedFilters() {
        const advancedHTML = `
            <div class="advanced-filters" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <h4 style="margin-bottom: 10px; color: var(--secondary-color);">Filtros Avanzados</h4>
                
                <div class="filter-group">
                    <label class="filter-label">Tags</label>
                    <div class="tag-filters" style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${this.availableTags.map(tag => `
                            <label class="tag-filter" style="display: flex; align-items: center; gap: 5px; font-size: 0.9em;">
                                <input type="checkbox" value="${tag}" class="tag-checkbox">
                                <span class="tag-name">${tag}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-group" style="margin-top: 10px;">
                    <label class="filter-label">Rango de Tiempo</label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="range" id="timeRangeMin" min="1" max="7" value="1" class="time-range">
                        <span id="timeRangeDisplay">1-7 días</span>
                        <input type="range" id="timeRangeMax" min="1" max="7" value="7" class="time-range">
                    </div>
                </div>
            </div>
        `;
        
        const filtersContainer = document.querySelector('.filters-container');
        if (filtersContainer) {
            filtersContainer.insertAdjacentHTML('beforeend', advancedHTML);
            this.bindAdvancedFilterEvents();
        }
    }

    /**
     * Bind eventos de filtros avanzados
     */
    bindAdvancedFilterEvents() {
        // Tag filters
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
        tagCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateTagFilters();
            });
        });
        
        // Time range
        const timeRangeInputs = document.querySelectorAll('.time-range');
        timeRangeInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateTimeRange();
            });
        });
    }

    /**
     * Actualizar filtros de tags
     */
    updateTagFilters() {
        const selectedTags = Array.from(document.querySelectorAll('.tag-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        this.currentFilters.tags = selectedTags;
        this.applyFilters();
        this.updateResultsCount();
    }

    /**
     * Actualizar rango de tiempo
     */
    updateTimeRange() {
        const minInput = document.getElementById('timeRangeMin');
        const maxInput = document.getElementById('timeRangeMax');
        const display = document.getElementById('timeRangeDisplay');
        
        if (minInput && maxInput && display) {
            const min = parseInt(minInput.value);
            const max = parseInt(maxInput.value);
            
            // Asegurar que min <= max
            if (min > max) {
                if (minInput === document.activeElement) {
                    maxInput.value = min;
                } else {
                    minInput.value = max;
                }
            }
            
            const finalMin = Math.min(min, max);
            const finalMax = Math.max(min, max);
            
            display.textContent = `${finalMin}-${finalMax} días`;
            
            this.currentFilters.timeRange = [finalMin, finalMax];
            this.applyFilters();
            this.updateResultsCount();
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Obtener estado actual
     */
    getState() {
        return {
            filters: { ...this.currentFilters },
            isVisible: this.isVisible,
            resultsCount: this.applyFilters().length
        };
    }

    /**
     * Restaurar estado
     */
    restoreState(state) {
        if (state.filters) {
            this.currentFilters = { ...state.filters };
            this.applyFiltersToUI();
            this.applyFilters();
            this.updateResultsCount();
        }
        
        if (state.isVisible !== undefined) {
            this.setVisibility(state.isVisible);
        }
    }

    /**
     * Establecer visibilidad de filtros
     */
    setVisibility(visible) {
        this.isVisible = visible;
        const filtersContainer = document.querySelector('.filters-container');
        if (filtersContainer) {
            filtersContainer.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Toggle visibilidad de filtros
     */
    toggleVisibility() {
        this.setVisibility(!this.isVisible);
        return this.isVisible;
    }

    /**
     * Exportar configuración de filtros
     */
    exportConfig() {
        return {
            filters: this.currentFilters,
            availableTags: this.availableTags,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Importar configuración de filtros
     */
    importConfig(config) {
        if (config.filters) {
            this.currentFilters = { ...config.filters };
            this.applyFiltersToUI();
            this.applyFilters();
            this.updateResultsCount();
        }
    }

    /**
     * Sistema de eventos
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en listener ${event}:`, error);
                }
            });
        }
    }

    /**
     * Limpiar componente
     */
    destroy() {
        // Limpiar event listeners
        this.listeners = {
            filterChange: [],
            searchChange: [],
            reset: []
        };
        
        // Remover autocomplete si existe
        const autocomplete = document.querySelector('.search-autocomplete');
        if (autocomplete) {
            autocomplete.remove();
        }
        
        // Remover indicador de resultados
        const indicator = document.getElementById('resultsIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Instancia singleton
export const filters = new Filters();