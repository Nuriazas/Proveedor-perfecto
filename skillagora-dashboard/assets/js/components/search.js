/**
 * Search Component
 * Maneja la funcionalidad de búsqueda avanzada
 */

import { TaskDataUtils } from '../data/taskData.js';
import { taskManager } from '../services/taskManager.js';

export class Search {
    constructor() {
        this.searchQuery = '';
        this.searchHistory = [];
        this.maxHistoryItems = 10;
        this.debounceTimeout = null;
        this.searchResults = [];
        
        // Configuración de búsqueda
        this.config = {
            minQueryLength: 2,
            debounceDelay: 300,
            highlightResults: true,
            caseSensitive: false,
            exactMatch: false,
        };
        
        // Event listeners
        this.listeners = {
            search: [],
            resultsUpdate: [],
            historyUpdate: [],
        };
    }

    /**
     * Inicializar búsqueda
     */
    init() {
        this.loadSearchHistory();
        this.createSearchInterface();
        this.bindEvents();
        return this;
    }

    /**
     * Crear interfaz de búsqueda
     */
    createSearchInterface() {
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) return;

        // Envolver en contenedor si no existe
        if (!searchBox.parentElement.classList.contains('search-container')) {
            const container = document.createElement('div');
            container.className = 'search-container';
            container.style.position = 'relative';
            
            searchBox.parentNode.insertBefore(container, searchBox);
            container.appendChild(searchBox);
        }

        // Añadir atributos y estilos
        searchBox.setAttribute('placeholder', 'Buscar tareas, tags, descripciones...');
        searchBox.setAttribute('autocomplete', 'off');
        
        // Crear elementos adicionales
        this.createSearchControls();
        this.createSearchDropdown();
    }

    /**
     * Crear controles de búsqueda
     */
    createSearchControls() {
        const container = document.querySelector('.search-container');
        if (!container) return;

        const controlsHTML = `
            <div class="search-controls" style="
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                gap: 4px;
                z-index: 10;
            ">
                <button type="button" class="search-clear" id="searchClear" title="Limpiar búsqueda" style="
                    background: none;
                    border: none;
                    color: var(--secondary-color);
                    cursor: pointer;
                    padding: 2px;
                    border-radius: 2px;
                    font-size: 14px;
                    display: none;
                ">✕</button>
                
                <button type="button" class="search-options" id="searchOptions" title="Opciones de búsqueda" style="
                    background: none;
                    border: none;
                    color: var(--secondary-color);
                    cursor: pointer;
                    padding: 2px;
                    border-radius: 2px;
                    font-size: 12px;
                ">⚙️</button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', controlsHTML);
    }

    /**
     * Crear dropdown de búsqueda
     */
    createSearchDropdown() {
        const container = document.querySelector('.search-container');
        if (!container) return;

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
     * Bind eventos
     */
    bindEvents() {
        const searchBox = document.getElementById('searchBox');
        const clearButton = document.getElementById('searchClear');
        const optionsButton = document.getElementById('searchOptions');
        
        if (searchBox) {
            // Búsqueda con debounce
            searchBox.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Navegación con teclado
            searchBox.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });

            // Focus y blur
            searchBox.addEventListener('focus', () => {
                this.showSearchDropdown();
            });

            searchBox.addEventListener('blur', () => {
                setTimeout(() => this.hideSearchDropdown(), 200);
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        if (optionsButton) {
            optionsButton.addEventListener('click', () => {
                this.showSearchOptions();
            });
        }

        // Click fuera para cerrar dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchDropdown();
            }
        });

        // Shortcuts de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para enfocar búsqueda
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape para limpiar
            if (e.key === 'Escape' && document.activeElement === searchBox) {
                this.clearSearch();
            }
        });
    }

    /**
     * Manejar input de búsqueda
     */
    handleSearchInput(query) {
        // Limpiar timeout anterior
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Mostrar/ocultar botón de limpiar
        this.toggleClearButton(query.length > 0);

        // Aplicar debounce
        this.debounceTimeout = setTimeout(() => {
            this.performSearch(query);
        }, this.config.debounceDelay);
    }

    /**
     * Realizar búsqueda
     */
    performSearch(query) {
        this.searchQuery = query.trim();
        
        if (this.searchQuery.length < this.config.minQueryLength) {
            this.clearResults();
            return;
        }

        // Ejecutar búsqueda
        const results = this.executeSearch(this.searchQuery);
        this.searchResults = results;

        // Actualizar UI
        this.updateSearchResults(results);
        this.updateSearchDropdown(results);
        
        // Guardar en historial
        this.addToHistory(this.searchQuery);

        // Emitir evento
        this.emit('search', {
            query: this.searchQuery,
            results: results,
            resultCount: results.length
        });
    }

    /**
     * Ejecutar búsqueda
     */
    executeSearch(query) {
        const allTasks = TaskDataUtils.getAllTasks();
        const lowerQuery = this.config.caseSensitive ? query : query.toLowerCase();
        
        const results = allTasks.filter(task => {
            const searchableText = this.getSearchableText(task);
            const targetText = this.config.caseSensitive ? searchableText : searchableText.toLowerCase();
            
            if (this.config.exactMatch) {
                return targetText.includes(lowerQuery);
            } else {
                // Búsqueda difusa - permite coincidencias parciales
                return this.fuzzyMatch(targetText, lowerQuery);
            }
        });

        // Ordenar resultados por relevancia
        return this.sortResultsByRelevance(results, query);
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
     * Búsqueda difusa
     */
    fuzzyMatch(text, query) {
        // Dividir query en palabras
        const queryWords = query.split(/\s+/).filter(word => word.length > 0);
        
        // Verificar que todas las palabras coincidan
        return queryWords.every(word => text.includes(word));
    }

    /**
     * Ordenar resultados por relevancia
     */
    sortResultsByRelevance(results, query) {
        const lowerQuery = query.toLowerCase();
        
        return results.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, lowerQuery);
            const scoreB = this.calculateRelevanceScore(b, lowerQuery);
            return scoreB - scoreA;
        });
    }

    /**
     * Calcular score de relevancia
     */
    calculateRelevanceScore(task, query) {
        let score = 0;
        const lowerTitle = task.title.toLowerCase();
        const lowerDescription = task.description.toLowerCase();
        
        // Coincidencia exacta en título = máximo score
        if (lowerTitle === query) score += 100;
        
        // Coincidencia parcial en título
        if (lowerTitle.includes(query)) score += 50;
        
        // Coincidencia al inicio del título
        if (lowerTitle.startsWith(query)) score += 25;
        
        // Coincidencia en descripción
        if (lowerDescription.includes(query)) score += 20;
        
        // Coincidencia en tags
        task.tags.forEach(tag => {
            if (tag.toLowerCase().includes(query)) score += 15;
        });
        
        // Coincidencia en subtareas
        task.tasks.forEach(subtask => {
            if (subtask.toLowerCase().includes(query)) score += 10;
        });
        
        // Priorizar tareas no completadas
        if (!taskManager.isTaskCompleted(task.id)) score += 5;
        
        return score;
    }

    /**
     * Actualizar resultados en UI
     */
    updateSearchResults(results) {
        const taskElements = document.querySelectorAll('.task-item');
        const resultIds = new Set(results.map(task => task.id));
        
        taskElements.forEach(element => {
            const taskId = element.dataset.taskId;
            const shouldShow = resultIds.has(taskId);
            
            element.style.display = shouldShow ? 'block' : 'none';
            
            // Resaltar texto de búsqueda si está habilitado
            if (shouldShow && this.config.highlightResults) {
                this.highlightSearchTerms(element, this.searchQuery);
            }
        });

        // Ocultar secciones vacías
        this.updateSectionVisibility(results);
        
        // Emitir evento de actualización
        this.emit('resultsUpdate', {
            results: results,
            query: this.searchQuery
        });
    }

    /**
     * Resaltar términos de búsqueda
     */
    highlightSearchTerms(element, query) {
        // Remover highlights anteriores
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
     * Actualizar dropdown de búsqueda
     */
    updateSearchDropdown(results) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;

        let content = '';
        
        // Mostrar resultados
        if (results.length > 0) {
            content += `
                <div class="search-section">
                    <div class="search-section-header">Resultados (${results.length})</div>
                    ${results.slice(0, 5).map(task => `
                        <div class="search-result-item" data-task-id="${task.id}">
                            <div class="search-result-title">${this.highlightText(task.title, this.searchQuery)}</div>
                            <div class="search-result-category">${TaskDataUtils.getCategoryByTaskId(task.id)}</div>
                        </div>
                    `).join('')}
                    ${results.length > 5 ? `<div class="search-more">+${results.length - 5} más resultados</div>` : ''}
                </div>
            `;
        }
        
        // Mostrar historial si no hay query
        if (!this.searchQuery && this.searchHistory.length > 0) {
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
        
        // Mostrar sugerencias
        if (this.searchQuery.length >= 1) {
            const suggestions = TaskDataUtils.getSearchSuggestions(this.searchQuery, 3);
            if (suggestions.length > 0) {
                content += `
                    <div class="search-section">
                        <div class="search-section-header">Sugerencias</div>
                        ${suggestions.map(suggestion => `
                            <div class="search-suggestion-item" data-suggestion="${suggestion}">
                                <span>💡</span> ${this.highlightText(suggestion, this.searchQuery)}
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
            this.showSearchDropdown();
        } else {
            this.hideSearchDropdown();
        }
    }

    /**
     * Resaltar texto
     */
    highlightText(text, query) {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    /**
     * Bind eventos del dropdown
     */
    bindDropdownEvents(dropdown) {
        // Resultados
        dropdown.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const taskId = item.dataset.taskId;
                this.navigateToTask(taskId);
                this.hideSearchDropdown();
            });
        });
        
        // Historial
        dropdown.querySelectorAll('.search-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                document.getElementById('searchBox').value = query;
                this.performSearch(query);
            });
        });
        
        // Sugerencias
        dropdown.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                document.getElementById('searchBox').value = suggestion;
                this.performSearch(suggestion);
            });
        });
    }

    /**
     * Navegar a tarea
     */
    navigateToTask(taskId) {
        const category = TaskDataUtils.getCategoryByTaskId(taskId);
        if (category) {
            // Dispatch evento de navegación
            const event = new CustomEvent('navigate', {
                detail: { section: category, taskId: taskId }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Mostrar dropdown
     */
    showSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown && dropdown.innerHTML.trim()) {
            dropdown.style.display = 'block';
        }
    }

    /**
     * Ocultar dropdown
     */
    hideSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    /**
     * Limpiar búsqueda
     */
    clearSearch() {
        this.searchQuery = '';
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.value = '';
        }
        
        this.clearResults();
        this.toggleClearButton(false);
        this.hideSearchDropdown();
        
        // Emitir evento
        this.emit('search', {
            query: '',
            results: [],
            resultCount: 0
        });
    }

    /**
     * Limpiar resultados
     */
    clearResults() {
        // Mostrar todas las tareas
        const taskElements = document.querySelectorAll('.task-item');
        taskElements.forEach(element => {
            element.style.display = 'block';
            this.removeHighlights(element);
        });
        
        // Mostrar todas las secciones
        const sections = document.querySelectorAll('.task-section');
        sections.forEach(section => {
            section.classList.remove('hidden');
        });
        
        this.searchResults = [];
    }

    /**
     * Toggle botón de limpiar
     */
    toggleClearButton(show) {
        const clearButton = document.getElementById('searchClear');
        if (clearButton) {
            clearButton.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Enfocar búsqueda
     */
    focusSearch() {
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.focus();
            searchBox.select();
        }
    }

    /**
     * Manejar teclas
     */
    handleKeydown(e) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown || dropdown.style.display === 'none') return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDropdown('down');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateDropdown('up');
                break;
            case 'Enter':
                e.preventDefault();
                this.selectDropdownItem();
                break;
            case 'Escape':
                this.hideSearchDropdown();
                break;
        }
    }

    /**
     * Navegar dropdown con teclado
     */
    navigateDropdown(direction) {
        const items = document.querySelectorAll('.search-result-item, .search-history-item, .search-suggestion-item');
        if (items.length === 0) return;
        
        const current = document.querySelector('.dropdown-item-active');
        let index = current ? Array.from(items).indexOf(current) : -1;
        
        if (current) {
            current.classList.remove('dropdown-item-active');
        }
        
        if (direction === 'down') {
            index = (index + 1) % items.length;
        } else {
            index = index <= 0 ? items.length - 1 : index - 1;
        }
        
        items[index].classList.add('dropdown-item-active');
        items[index].scrollIntoView({ block: 'nearest' });
    }

    /**
     * Seleccionar item del dropdown
     */
    selectDropdownItem() {
        const activeItem = document.querySelector('.dropdown-item-active');
        if (activeItem) {
            activeItem.click();
        }
    }

    /**
     * Gestión de historial
     */
    addToHistory(query) {
        if (!query.trim() || this.searchHistory.includes(query)) return;
        
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        this.saveSearchHistory();
        
        this.emit('historyUpdate', this.searchHistory);
    }

    /**
     * Cargar historial
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
     * Guardar historial
     */
    saveSearchHistory() {
        localStorage.setItem('skillAgora_searchHistory', JSON.stringify(this.searchHistory));
    }

    /**
     * Limpiar historial
     */
    clearHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.emit('historyUpdate', this.searchHistory);
    }

    /**
     * Actualizar visibilidad de secciones
     */
    updateSectionVisibility(results) {
        const categories = ['critical', 'important', 'optional', 'technical', 'fixes'];
        
        categories.forEach(category => {
            const section = document.getElementById(`section-${category}`);
            const hasResults = results.some(task => 
                TaskDataUtils.getCategoryByTaskId(task.id) === category
            );
            
            if (section) {
                section.classList.toggle('hidden', !hasResults);
            }
        });
    }

    /**
     * Mostrar opciones de búsqueda
     */
    showSearchOptions() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Opciones de Búsqueda</h3>
                
                <div style="margin: 20px 0;">
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <input type="checkbox" ${this.config.caseSensitive ? 'checked' : ''} id="caseSensitive">
                        Distinguir mayúsculas y minúsculas
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <input type="checkbox" ${this.config.exactMatch ? 'checked' : ''} id="exactMatch">
                        Coincidencia exacta
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <input type="checkbox" ${this.config.highlightResults ? 'checked' : ''} id="highlightResults">
                        Resaltar resultados
                    </label>
                </div>
                
                <div style="margin: 20px 0;">
                    <label>Retraso de búsqueda (ms):</label>
                    <input type="range" min="100" max="1000" step="100" value="${this.config.debounceDelay}" id="debounceDelay">
                    <span id="debounceValue">${this.config.debounceDelay}ms</span>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">Cancelar</button>
                    <button id="saveSearchOptions" class="btn-primary">Guardar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Bind eventos
        const saveButton = modal.querySelector('#saveSearchOptions');
        const debounceSlider = modal.querySelector('#debounceDelay');
        const debounceValue = modal.querySelector('#debounceValue');
        
        debounceSlider.addEventListener('input', (e) => {
            debounceValue.textContent = e.target.value + 'ms';
        });
        
        saveButton.addEventListener('click', () => {
            this.config.caseSensitive = modal.querySelector('#caseSensitive').checked;
            this.config.exactMatch = modal.querySelector('#exactMatch').checked;
            this.config.highlightResults = modal.querySelector('#highlightResults').checked;
            this.config.debounceDelay = parseInt(modal.querySelector('#debounceDelay').value);
            
            this.saveConfig();
            modal.remove();
        });
    }

    /**
     * Guardar configuración
     */
    saveConfig() {
        localStorage.setItem('skillAgora_searchConfig', JSON.stringify(this.config));
    }

    /**
     * Cargar configuración
     */
    loadConfig() {
        const saved = localStorage.getItem('skillAgora_searchConfig');
        if (saved) {
            try {
                this.config = { ...this.config, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Error cargando configuración de búsqueda');
            }
        }
    }

    /**
     * Obtener estado
     */
    getState() {
        return {
            query: this.searchQuery,
            results: this.searchResults,
            history: this.searchHistory,
            config: this.config
        };
    }

    /**
     * Restaurar estado
     */
    restoreState(state) {
        if (state.query) {
            const searchBox = document.getElementById('searchBox');
            if (searchBox) {
                searchBox.value = state.query;
                this.performSearch(state.query);
            }
        }
        
        if (state.history) {
            this.searchHistory = state.history;
        }
        
        if (state.config) {
            this.config = { ...this.config, ...state.config };
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
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.listeners = {
            search: [],
            resultsUpdate: [],
            historyUpdate: []
        };
        
        // Limpiar dropdown
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        // Limpiar highlights
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            this.removeHighlights(highlight.parentElement);
        });
    }
}

// Instancia singleton
export const search = new Search();