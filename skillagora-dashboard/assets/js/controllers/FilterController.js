/**
 * Filter Controller
 * Maneja filtros, búsqueda y lógica de visualización de tareas
 */

import { taskManager } from '../services/taskManager.js';
import { TaskDataUtils } from '../data/taskData.js';

export class FilterController {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.currentFilters = {
            category: 'all',
            status: 'all',
            time: 'all',
            search: ''
        };
        
        this.searchConfig = {
            minQueryLength: 2,
            debounceDelay: 300,
            highlightResults: true,
            caseSensitive: false
        };
        
        this.debounceTimeout = null;
        this.lastSearchQuery = '';
        this.searchHistory = [];
        this.maxSearchHistory = 10;
        
        // Elementos DOM
        this.elements = {
            categoryFilter: null,
            statusFilter: null,
            timeFilter: null,
            searchBox: null,
            resetButton: null
        };
    }

    /**
     * Inicializar controlador
     */
    async init() {
        console.log('🔍 Inicializando FilterController...');
        
        this.cacheElements();
        this.loadSavedFilters();
        this.loadSearchHistory();
        this.bindEvents();
        this.setupSearchAutocomplete();
        this.applyInitialFilters();
        
        return this;
    }

    /**
     * Cachear elementos DOM
     */
    cacheElements() {
        this.elements.categoryFilter = document.getElementById('categoryFilter');
        this.elements.statusFilter = document.getElementById('statusFilter');
        this.elements.timeFilter = document.getElementById('timeFilter');
        this.elements.searchBox = document.getElementById('searchBox');
        this.elements.resetButton = document.querySelector('.reset-filters');
    }

    /**
     * Cargar filtros guardados
     */
    loadSavedFilters() {
        const savedFilters = taskManager.filters;
        this.currentFilters = { ...this.currentFilters, ...savedFilters };
    }

    /**
     * Cargar historial de búsqueda
     */
    loadSearchHistory() {
        const saved = localStorage.getItem('skillAgora_searchHistory');
        if (saved) {
            try {
                this.searchHistory = JSON.parse(saved);
            } catch (e) {
                this.searchHistory = [];
            }
        }
    }

    /**
     * Bind eventos
     */
    bindEvents() {
        // Filtros de select
        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.addEventListener('change', (e) => {
                this.updateFilter('category', e.target.value);
            });
        }

        if (this.elements.statusFilter) {
            this.elements.statusFilter.addEventListener('change', (e) => {
                this.updateFilter('status', e.target.value);
            });
        }

        if (this.elements.timeFilter) {
            this.elements.timeFilter.addEventListener('change', (e) => {
                this.updateFilter('time', e.target.value);
            });
        }

        // Búsqueda
        if (this.elements.searchBox) {
            this.elements.searchBox.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            this.elements.searchBox.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });

            this.elements.searchBox.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });

            this.elements.searchBox.addEventListener('blur', () => {
                setTimeout(() => this.hideSearchSuggestions(), 200);
            });
        }

        // Botón reset
        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Escuchar eventos de navegación
        this.eventManager.on('navigation:sectionChanged', (data) => {
            this.onSectionChange(data.currentSection);
        });
    }

    /**
     * Configurar autocompletado de búsqueda
     */
    setupSearchAutocomplete() {
        if (!this.elements.searchBox) return;

        const container = this.elements.searchBox.parentElement;
        if (!container.classList.contains('search-container')) {
            container.style.position = 'relative';
        }

        // Crear dropdown de sugerencias
        const dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.id = 'searchDropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 6px 6px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
            box-shadow: var(--shadow-md);
        `;
        
        container.appendChild(dropdown);
    }

    /**
     * Aplicar filtros iniciales
     */
    applyInitialFilters() {
        this.updateFiltersUI();
        this.applyAllFilters();
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
        this.applyAllFilters();
        
        // Emitir evento
        this.eventManager.emit('filter:changed', {
            filterType,
            oldValue,
            newValue: value,
            allFilters: { ...this.currentFilters }
        });
        
        console.log(`🔍 Filtro ${filterType} cambiado a: ${value}`);
    }

    /**
     * Manejar input de búsqueda
     */
    handleSearchInput(query) {
        // Limpiar timeout anterior
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Aplicar debounce
        this.debounceTimeout = setTimeout(() => {
            this.performSearch(query);
        }, this.searchConfig.debounceDelay);
    }

    /**
     * Manejar teclas en búsqueda
     */
    handleSearchKeydown(e) {
        switch (e.key) {
            case 'Escape':
                this.clearSearch();
                e.target.blur();
                break;
            case 'Enter':
                e.preventDefault();
                this.addToSearchHistory(e.target.value);
                this.hideSearchSuggestions();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSearchSuggestions('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSearchSuggestions('up');
                break;
        }
    }

    /**
     * Realizar búsqueda
     */
    performSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery === this.lastSearchQuery) {
            return; // No ha cambiado
        }
        
        this.lastSearchQuery = trimmedQuery;
        this.updateFilter('search', trimmedQuery);
        
        // Actualizar sugerencias
        if (trimmedQuery.length >= this.searchConfig.minQueryLength) {
            this.updateSearchSuggestions(trimmedQuery);
        } else {
            this.hideSearchSuggestions();
        }
    }

    /**
     * Aplicar todos los filtros
     */
    applyAllFilters() {
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
        
        // Actualizar contador de resultados
        this.updateResultsCounter(filteredTasks.length, allTasks.length);
        
        // Emitir evento
        this.eventManager.emit('filter:applied', {
            filters: { ...this.currentFilters },
            resultCount: filteredTasks.length,
            totalCount: allTasks.length,
            filteredTasks
        });
        
        return filteredTasks;
    }

    /**
     * Buscar en tareas
     */
    searchInTasks(tasks, query) {
        const lowerQuery = this.searchConfig.caseSensitive ? query : query.toLowerCase();
        
        return tasks.filter(task => {
            const searchableText = this.getSearchableText(task);
            const targetText = this.searchConfig.caseSensitive ? searchableText : searchableText.toLowerCase();
            
            // Búsqueda por palabras
            const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
            return queryWords.every(word => targetText.includes(word));
        });
    }

    /**
     * Obtener texto buscable de una tarea
     */
    getSearchableText(task) {
        const texts = [
            task.title,
            task.description,
            ...task.tags,
            ...task.tasks
        ];
        
        return texts.join(' ');
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
            
            // Resaltar texto de búsqueda si está habilitado
            if (shouldShow && this.searchConfig.highlightResults && this.currentFilters.search) {
                this.highlightSearchTerms(element, this.currentFilters.search);
            } else {
                this.removeHighlights(element);
            }
        });

        // Ocultar secciones vacías
        this.updateSectionVisibility(visibleTasks);
    }

    /**
     * Resaltar términos de búsqueda
     */
    highlightSearchTerms(element, query) {
        this.removeHighlights(element);
        
        if (!query.trim()) return;
        
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        
        textNodes.forEach(textNode => {
            if (regex.test(textNode.textContent)) {
                const highlightedHTML = textNode.textContent.replace(regex, 
                    '<mark class="search-highlight" style="background: yellow; padding: 0 2px;">$1</mark>'
                );
                
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    }

    /**
     * Remover highlights
     */
    removeHighlights(element) {
        const highlights = element.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    /**
     * Escapar regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    updateResultsCounter(filteredCount, totalCount) {
        let counter = document.getElementById('resultsCounter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'resultsCounter';
            counter.className = 'results-counter';
            counter.style.cssText = `
                background: var(--info-color);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 600;
                margin-left: auto;
                white-space: nowrap;
            `;
            
            const filtersGrid = document.querySelector('.filters-grid');
            if (filtersGrid) {
                filtersGrid.appendChild(counter);
            }
        }
        
        if (filteredCount === totalCount) {
            counter.textContent = `${totalCount} tareas`;
            counter.style.background = 'var(--info-color)';
        } else if (filteredCount === 0) {
            counter.textContent = 'Sin resultados';
            counter.style.background = 'var(--danger-color)';
        } else {
            counter.textContent = `${filteredCount} de ${totalCount}`;
            counter.style.background = 'var(--warning-color)';
        }
    }

    /**
     * Mostrar sugerencias de búsqueda
     */
    showSearchSuggestions() {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;

        const query = this.elements.searchBox?.value || '';
        this.updateSearchSuggestions(query);
    }

    /**
     * Actualizar sugerencias de búsqueda
     */
    updateSearchSuggestions(query) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;

        let content = '';
        
        // Mostrar historial si no hay query
        if (!query && this.searchHistory.length > 0) {
            content += `
                <div class="search-section">
                    <div class="search-section-header">Búsquedas recientes</div>
                    ${this.searchHistory.slice(0, 5).map(item => `
                        <div class="search-history-item" data-query="${item}">
                            <span>🕒</span> ${item}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Mostrar sugerencias si hay query
        if (query.length >= 1) {
            const suggestions = TaskDataUtils.getSearchSuggestions(query, 5);
            if (suggestions.length > 0) {
                content += `
                    <div class="search-section">
                        <div class="search-section-header">Sugerencias</div>
                        ${suggestions.map(suggestion => `
                            <div class="search-suggestion-item" data-suggestion="${suggestion}">
                                <span>💡</span> ${this.highlightMatch(suggestion, query)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        dropdown.innerHTML = content;
        
        // Bind eventos del dropdown
        this.bindDropdownEvents(dropdown);
        
        // Mostrar dropdown si hay contenido
        if (content) {
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Resaltar coincidencias en texto
     */
    highlightMatch(text, query) {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    /**
     * Bind eventos del dropdown
     */
    bindDropdownEvents(dropdown) {
        // Historial
        dropdown.querySelectorAll('.search-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.elements.searchBox.value = query;
                this.performSearch(query);
                this.hideSearchSuggestions();
            });
        });
        
        // Sugerencias
        dropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                this.elements.searchBox.value = suggestion;
                this.performSearch(suggestion);
                this.hideSearchSuggestions();
            });
        });
    }

    /**
     * Ocultar sugerencias
     */
    hideSearchSuggestions() {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Navegar sugerencias con teclado
     */
    navigateSearchSuggestions(direction) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown || dropdown.style.display === 'none') return;
        
        const items = dropdown.querySelectorAll('.search-history-item, .search-suggestion-item');
        if (items.length === 0) return;
        
        const current = dropdown.querySelector('.suggestion-active');
        let index = current ? Array.from(items).indexOf(current) : -1;
        
        if (current) {
            current.classList.remove('suggestion-active');
        }
        
        if (direction === 'down') {
            index = (index + 1) % items.length;
        } else {
            index = index <= 0 ? items.length - 1 : index - 1;
        }
        
        items[index].classList.add('suggestion-active');
        items[index].scrollIntoView({ block: 'nearest' });
    }

    /**
     * Agregar al historial de búsqueda
     */
    addToSearchHistory(query) {
        if (!query.trim() || this.searchHistory.includes(query)) return;
        
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, this.maxSearchHistory);
        this.saveSearchHistory();
    }

    /**
     * Guardar historial de búsqueda
     */
    saveSearchHistory() {
        localStorage.setItem('skillAgora_searchHistory', JSON.stringify(this.searchHistory));
    }

    /**
     * Resetear filtros
     */
    resetFilters() {
        this.currentFilters = {
            category: 'all',
            status: 'all',
            time: 'all',
            search: ''
        };
        
        this.updateFiltersUI();
        this.applyAllFilters();
        taskManager.resetFilters();
        
        this.eventManager.emit('filter:reset', {
            filters: { ...this.currentFilters }
        });
        
        console.log('🔄 Filtros restablecidos');
    }

    /**
     * Limpiar búsqueda
     */
    clearSearch() {
        if (this.elements.searchBox) {
            this.elements.searchBox.value = '';
        }
        this.updateFilter('search', '');
        this.hideSearchSuggestions();
    }

    /**
     * Actualizar UI de filtros
     */
    updateFiltersUI() {
        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.value = this.currentFilters.category;
        }
        if (this.elements.statusFilter) {
            this.elements.statusFilter.value = this.currentFilters.status;
        }
        if (this.elements.timeFilter) {
            this.elements.timeFilter.value = this.currentFilters.time;
        }
        if (this.elements.searchBox) {
            this.elements.searchBox.value = this.currentFilters.search;
        }
    }

    /**
     * Aplicar filtros actuales (método público)
     */
    applyCurrentFilters() {
        return this.applyAllFilters();
    }

    /**
     * Manejar cambio de sección
     */
    onSectionChange(sectionId) {
        // Lógica específica cuando cambia la sección
        // Por ejemplo, enfocar automáticamente búsqueda en ciertas secciones
        if (['critical', 'important', 'optional', 'technical', 'fixes'].includes(sectionId)) {
            // Opcional: auto-filtrar por categoría
            // this.updateFilter('category', sectionId);
        }
    }

    /**
     * Obtener estado actual
     */
    getState() {
        return {
            filters: { ...this.currentFilters },
            searchHistory: [...this.searchHistory],
            config: { ...this.searchConfig }
        };
    }

    /**
     * Restaurar estado
     */
    restoreState(state) {
        if (state.filters) {
            this.currentFilters = { ...state.filters };
            this.updateFiltersUI();
            this.applyAllFilters();
        }
        
        if (state.searchHistory) {
            this.searchHistory = [...state.searchHistory];
            this.saveSearchHistory();
        }
        
        if (state.config) {
            this.searchConfig = { ...this.searchConfig, ...state.config };
        }
    }

    /**
     * Obtener información del controlador
     */
    getInfo() {
        return {
            currentFilters: { ...this.currentFilters },
            searchHistory: [...this.searchHistory],
            searchConfig: { ...this.searchConfig },
            hasActiveFilters: this.hasActiveFilters()
        };
    }

    /**
     * Verificar si hay filtros activos
     */
    hasActiveFilters() {
        return this.currentFilters.category !== 'all' ||
               this.currentFilters.status !== 'all' ||
               this.currentFilters.time !== 'all' ||
               this.currentFilters.search.trim() !== '';
    }

    /**
     * Destruir controlador
     */
    async destroy() {
        // Limpiar timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // Guardar historial
        this.saveSearchHistory();
        
        // Remover dropdown si existe
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        // Limpiar highlights
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            this.removeHighlights(highlight.parentElement);
        });
        
        // Limpiar referencias
        this.elements = {};
        this.eventManager = null;
        
        console.log('🧹 FilterController limpiado');
    }
}