/**
 * Theme Controller
 * Maneja los temas (claro/oscuro) y personalización visual
 */

import { storageManager } from '../services/storageManager.js';

export class ThemeController {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.currentTheme = 'light';
        this.availableThemes = ['light', 'dark'];
        this.autoDetect = false;
        this.transitionDuration = 300;
        
        // Elementos DOM
        this.elements = {
            themeToggle: null,
            root: document.documentElement
        };
        
        // Configuración de temas
        this.themeConfig = {
            light: {
                name: 'Claro',
                icon: '🌙',
                description: 'Tema claro para uso diurno'
            },
            dark: {
                name: 'Oscuro',
                icon: '☀️',
                description: 'Tema oscuro para uso nocturno'
            }
        };
    }

    /**
     * Inicializar controlador de temas
     */
    async init() {
        console.log('🎨 Inicializando ThemeController...');
        
        this.cacheElements();
        this.loadSavedTheme();
        this.detectSystemPreference();
        this.bindEvents();
        this.applyTheme(this.currentTheme, false);
        
        return this;
    }

    /**
     * Cachear elementos DOM
     */
    cacheElements() {
        this.elements.themeToggle = document.getElementById('themeToggle');
    }

    /**
     * Cargar tema guardado
     */
    loadSavedTheme() {
        const savedTheme = storageManager.getItem('theme');
        const savedAutoDetect = storageManager.getItem('themeAutoDetect');
        
        if (savedTheme && this.availableThemes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }
        
        if (typeof savedAutoDetect === 'boolean') {
            this.autoDetect = savedAutoDetect;
        }
    }

    /**
     * Detectar preferencia del sistema
     */
    detectSystemPreference() {
        if (!this.autoDetect) return;
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
        } else {
            this.currentTheme = 'light';
        }
    }

    /**
     * Bind eventos
     */
    bindEvents() {
        // Botón de toggle tema
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Detectar cambios en preferencia del sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.autoDetect) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.setTheme(newTheme);
                }
            });
        }

        // Escuchar eventos de la app
        this.eventManager.on('app:initialized', () => {
            this.updateThemeToggleButton();
        });
    }

    /**
     * Aplicar tema
     */
    applyTheme(themeName, withTransition = true) {
        if (!this.availableThemes.includes(themeName)) {
            console.warn(`Tema no válido: ${themeName}`);
            return false;
        }

        // Añadir transición si es necesario
        if (withTransition) {
            this.addTransition();
        }

        // Aplicar tema al DOM
        this.elements.root.setAttribute('data-theme', themeName);
        
        // Actualizar clase del body para compatibilidad
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim();
        document.body.classList.add(`theme-${themeName}`);

        // Actualizar meta theme-color para móviles
        this.updateMetaThemeColor(themeName);

        // Actualizar botón de toggle
        this.updateThemeToggleButton();

        // Remover transición después de aplicar
        if (withTransition) {
            setTimeout(() => {
                this.removeTransition();
            }, this.transitionDuration);
        }

        return true;
    }

    /**
     * Establecer tema
     */
    setTheme(themeName, save = true) {
        if (this.currentTheme === themeName) {
            return false; // Ya estamos en ese tema
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = themeName;

        // Aplicar tema
        const success = this.applyTheme(themeName, true);
        
        if (success) {
            // Guardar en storage
            if (save) {
                this.saveTheme();
            }

            // Emitir evento
            this.eventManager.emit('theme:changed', {
                previousTheme,
                currentTheme: themeName,
                timestamp: new Date().toISOString()
            });

            console.log(`🎨 Tema cambiado a: ${themeName}`);
        }

        return success;
    }

    /**
     * Toggle entre temas
     */
    toggleTheme() {
        const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        return this.setTheme(nextTheme);
    }

    /**
     * Obtener tema actual
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Obtener todos los temas disponibles
     */
    getAvailableThemes() {
        return this.availableThemes.map(theme => ({
            id: theme,
            ...this.themeConfig[theme]
        }));
    }

    /**
     * Habilitar/deshabilitar detección automática
     */
    setAutoDetect(enabled) {
        this.autoDetect = enabled;
        
        if (enabled) {
            this.detectSystemPreference();
            this.applyTheme(this.currentTheme, true);
        }
        
        storageManager.setItem('themeAutoDetect', enabled);
        
        this.eventManager.emit('theme:autoDetectChanged', {
            enabled,
            currentTheme: this.currentTheme
        });
    }

    /**
     * Actualizar botón de toggle
     */
    updateThemeToggleButton() {
        if (!this.elements.themeToggle) return;

        const config = this.themeConfig[this.currentTheme];
        if (config) {
            this.elements.themeToggle.textContent = config.icon;
            this.elements.themeToggle.title = `Cambiar a tema ${
                this.currentTheme === 'light' ? 'oscuro' : 'claro'
            }`;
        }
    }

    /**
     * Actualizar meta theme-color
     */
    updateMetaThemeColor(themeName) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        // Colores por tema
        const themeColors = {
            light: '#ffffff',
            dark: '#1a1a1a'
        };

        metaThemeColor.content = themeColors[themeName] || themeColors.light;
    }

    /**
     * Añadir transición CSS
     */
    addTransition() {
        const style = document.createElement('style');
        style.id = 'theme-transition';
        style.textContent = `
            *,
            *::before,
            *::after {
                transition: 
                    background-color ${this.transitionDuration}ms ease,
                    border-color ${this.transitionDuration}ms ease,
                    color ${this.transitionDuration}ms ease,
                    fill ${this.transitionDuration}ms ease,
                    stroke ${this.transitionDuration}ms ease,
                    opacity ${this.transitionDuration}ms ease,
                    box-shadow ${this.transitionDuration}ms ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Remover transición CSS
     */
    removeTransition() {
        const transitionStyle = document.getElementById('theme-transition');
        if (transitionStyle) {
            transitionStyle.remove();
        }
    }

    /**
     * Guardar tema actual
     */
    saveTheme() {
        storageManager.setItem('theme', this.currentTheme);
    }

    /**
     * Crear selector de tema personalizado
     */
    createThemeSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const selectorHTML = `
            <div class="theme-selector">
                <h3>Seleccionar Tema</h3>
                <div class="theme-options">
                    ${this.availableThemes.map(theme => `
                        <label class="theme-option ${theme === this.currentTheme ? 'active' : ''}">
                            <input type="radio" name="theme" value="${theme}" 
                                   ${theme === this.currentTheme ? 'checked' : ''}>
                            <div class="theme-preview ${theme}">
                                <span class="theme-icon">${this.themeConfig[theme].icon}</span>
                                <span class="theme-name">${this.themeConfig[theme].name}</span>
                            </div>
                        </label>
                    `).join('')}
                </div>
                
                <div class="theme-auto-detect">
                    <label>
                        <input type="checkbox" ${this.autoDetect ? 'checked' : ''} id="autoDetectTheme">
                        Detectar automáticamente según sistema
                    </label>
                </div>
            </div>
        `;

        container.innerHTML = selectorHTML;

        // Bind eventos
        const radioButtons = container.querySelectorAll('input[name="theme"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setTheme(e.target.value);
                    this.updateSelectorUI(container);
                }
            });
        });

        const autoDetectCheckbox = container.querySelector('#autoDetectTheme');
        if (autoDetectCheckbox) {
            autoDetectCheckbox.addEventListener('change', (e) => {
                this.setAutoDetect(e.target.checked);
            });
        }
    }

    /**
     * Actualizar UI del selector
     */
    updateSelectorUI(container) {
        const options = container.querySelectorAll('.theme-option');
        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            option.classList.toggle('active', radio.checked);
        });
    }

    /**
     * Obtener configuración CSS custom properties
     */
    getCSSCustomProperties() {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        const cssVars = {};
        const varNames = [
            '--primary-color',
            '--secondary-color',
            '--background-color',
            '--text-color',
            '--border-color',
            '--card-bg',
            '--hover-bg'
        ];

        varNames.forEach(varName => {
            cssVars[varName] = computedStyle.getPropertyValue(varName).trim();
        });

        return cssVars;
    }

    /**
     * Aplicar colores personalizados
     */
    applyCustomColors(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([property, value]) => {
            if (property.startsWith('--')) {
                root.style.setProperty(property, value);
            }
        });

        this.eventManager.emit('theme:customColorsApplied', { colors });
    }

    /**
     * Resetear colores a valores por defecto
     */
    resetCustomColors() {
        const root = document.documentElement;
        const style = root.style;
        
        // Remover propiedades custom
        const properties = Array.from(style);
        properties.forEach(property => {
            if (property.startsWith('--')) {
                style.removeProperty(property);
            }
        });

        this.eventManager.emit('theme:customColorsReset');
    }

    /**
     * Obtener información del controlador
     */
    getInfo() {
        return {
            currentTheme: this.currentTheme,
            availableThemes: this.availableThemes,
            autoDetect: this.autoDetect,
            systemPreference: window.matchMedia && 
                window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            customProperties: this.getCSSCustomProperties()
        };
    }

    /**
     * Exportar configuración
     */
    exportConfig() {
        return {
            currentTheme: this.currentTheme,
            autoDetect: this.autoDetect,
            customProperties: this.getCSSCustomProperties(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Importar configuración
     */
    importConfig(config) {
        if (config.currentTheme) {
            this.setTheme(config.currentTheme, false);
        }
        
        if (typeof config.autoDetect === 'boolean') {
            this.setAutoDetect(config.autoDetect);
        }
        
        if (config.customProperties) {
            this.applyCustomColors(config.customProperties);
        }
    }

    /**
     * Destruir controlador
     */
    async destroy() {
        // Guardar estado final
        this.saveTheme();
        
        // Remover transiciones si existen
        this.removeTransition();
        
        // Limpiar referencias
        this.elements = {};
        this.eventManager = null;
        
        console.log('🧹 ThemeController limpiado');
    }
}