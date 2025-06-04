/**
 * Navigation Controller
 * Maneja toda la lógica de navegación, sidebar y secciones
 */

import { storageManager } from '../services/storageManager.js';

export class NavigationController {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.currentSection = 'overview';
        this.sidebarCollapsed = false;
        this.mobileMenuOpen = false;
        
        // Configuración de navegación
        this.navigationItems = [
            { id: 'overview', icon: '📊', text: 'Resumen', href: '#overview' },
            { id: 'proposal', icon: '📋', text: 'Propuesta', href: '#proposal' },
            { id: 'presentation', icon: '📖', text: 'Presentación', href: '#presentation' },
            { id: 'critical', icon: '🔴', text: 'Tareas Críticas', href: '#critical' },
            { id: 'important', icon: '🟡', text: 'Importantes', href: '#important' },
            { id: 'optional', icon: '🟢', text: 'Opcionales', href: '#optional' },
            { id: 'technical', icon: '🔧', text: 'Técnicas', href: '#technical' },
            { id: 'fixes', icon: '🔨', text: 'Correcciones', href: '#fixes' },
            { id: 'timeline', icon: '⏱️', text: 'Timeline', href: '#timeline' },
        ];
        
        // Referencias DOM
        this.elements = {
            sidebar: null,
            mainContent: null,
            toggleIcon: null,
            pageTitle: null
        };
    }

    /**
     * Inicializar controlador
     */
    async init() {
        console.log('🧭 Inicializando NavigationController...');
        
        this.cacheElements();
        this.loadSavedState();
        this.bindEvents();
        this.applySavedState();
        
        return this;
    }

    /**
     * Cachear elementos DOM
     */
    cacheElements() {
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.mainContent = document.getElementById('mainContent');
        this.elements.toggleIcon = document.getElementById('toggleIcon');
        this.elements.pageTitle = document.getElementById('pageTitle');
    }

    /**
     * Cargar estado guardado
     */
    loadSavedState() {
        this.sidebarCollapsed = storageManager.getItem('sidebarCollapsed') || false;
        this.currentSection = storageManager.getItem('currentSection') || 'overview';
    }

    /**
     * Aplicar estado guardado
     */
    applySavedState() {
        if (this.sidebarCollapsed) {
            this.setSidebarCollapsed(true, false); // sin guardar
        }
        
        this.showSection(this.currentSection, false); // sin guardar
    }

    /**
     * Bind eventos
     */
    bindEvents() {
        // Toggle sidebar desktop
        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = this.extractSectionFromHref(link.getAttribute('href'));
                this.showSection(sectionId);
            });
        });

        // Mobile toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Click fuera del sidebar en móvil
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && 
                !e.target.closest('.sidebar') && 
                !e.target.closest('.mobile-menu-toggle')) {
                this.closeMobileSidebar();
            }
        });

        // Escape para cerrar mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileSidebar();
            }
        });
    }

    /**
     * Mostrar sección
     */
    async showSection(sectionId, saveState = true) {
        if (this.currentSection === sectionId) {
            return; // Ya estamos en esa sección
        }

        console.log(`📍 Navegando a sección: ${sectionId}`);
        
        const previousSection = this.currentSection;
        this.currentSection = sectionId;
        
        // Actualizar navegación activa
        this.updateActiveNavigation(sectionId);
        
        // Ocultar todas las secciones
        this.hideAllSections();
        
        // Mostrar sección seleccionada
        this.showTargetSection(sectionId);
        
        // Actualizar título de página
        this.updatePageTitle(sectionId);
        
        // Cerrar mobile sidebar
        this.closeMobileSidebar();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Guardar estado
        if (saveState) {
            this.saveState();
        }
        
        // Emitir evento
        this.eventManager.emit('navigation:sectionChanged', {
            previousSection,
            currentSection: sectionId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Actualizar navegación activa
     */
    updateActiveNavigation(sectionId) {
        // Remover active de todos
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Añadir active al seleccionado
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Ocultar todas las secciones
     */
    hideAllSections() {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    /**
     * Mostrar sección objetivo
     */
    showTargetSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Añadir clase para animaciones si es necesario
            targetSection.classList.add('section-active');
            
            // Trigger para componentes que necesiten saber que su sección es visible
            this.eventManager.emit('navigation:sectionVisible', {
                sectionId,
                element: targetSection
            });
        } else {
            console.warn(`Sección no encontrada: ${sectionId}`);
        }
    }

    /**
     * Actualizar título de página
     */
    updatePageTitle(sectionId) {
        const titles = {
            overview: 'Dashboard SkillAgora',
            proposal: 'Propuesta del Proyecto',
            presentation: 'Documentación de la Aplicación',
            critical: 'Tareas Críticas',
            important: 'Tareas Importantes',
            optional: 'Tareas Opcionales',
            technical: 'Tareas Técnicas',
            fixes: 'Correcciones',
            timeline: 'Timeline',
        };
        
        if (this.elements.pageTitle && titles[sectionId]) {
            this.elements.pageTitle.textContent = titles[sectionId];
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.setSidebarCollapsed(!this.sidebarCollapsed);
        return this.sidebarCollapsed;
    }

    /**
     * Establecer estado collapsed del sidebar
     */
    setSidebarCollapsed(collapsed, saveState = true) {
        this.sidebarCollapsed = collapsed;
        
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.toggle('collapsed', collapsed);
        }
        
        if (this.elements.mainContent) {
            this.elements.mainContent.classList.toggle('expanded', collapsed);
        }
        
        if (this.elements.toggleIcon) {
            this.elements.toggleIcon.textContent = collapsed ? '→' : '←';
        }
        
        if (saveState) {
            this.saveState();
        }
        
        // Emitir evento
        this.eventManager.emit('navigation:sidebarToggled', {
            collapsed: this.sidebarCollapsed
        });
    }

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        if (this.mobileMenuOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
        return this.mobileMenuOpen;
    }

    /**
     * Abrir mobile sidebar
     */
    openMobileSidebar() {
        this.mobileMenuOpen = true;
        
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.add('mobile-open');
        }
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        this.eventManager.emit('navigation:mobileMenuOpened');
    }

    /**
     * Cerrar mobile sidebar
     */
    closeMobileSidebar() {
        if (!this.mobileMenuOpen) return;
        
        this.mobileMenuOpen = false;
        
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.remove('mobile-open');
        }
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        this.eventManager.emit('navigation:mobileMenuClosed');
    }

    /**
     * Extraer sección del href
     */
    extractSectionFromHref(href) {
        if (!href) return 'overview';
        return href.replace('#', '');
    }

    /**
     * Obtener sección actual
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Obtener estado del sidebar
     */
    getSidebarState() {
        return {
            collapsed: this.sidebarCollapsed,
            mobileOpen: this.mobileMenuOpen
        };
    }

    /**
     * Navegar a sección por categoría de tarea
     */
    navigateToTaskCategory(category) {
        const sectionMap = {
            critical: 'critical',
            important: 'important',
            optional: 'optional',
            technical: 'technical',
            fixes: 'fixes'
        };
        
        const sectionId = sectionMap[category] || 'overview';
        this.showSection(sectionId);
    }

    /**
     * Navegar hacia atrás
     */
    goBack() {
        // Implementar historial de navegación si es necesario
        this.showSection('overview');
    }

    /**
     * Obtener breadcrumb actual
     */
    getCurrentBreadcrumb() {
        const breadcrumbs = {
            overview: ['Dashboard'],
            proposal: ['Dashboard', 'Propuesta'],
            presentation: ['Dashboard', 'Presentación'],
            critical: ['Dashboard', 'Tareas Críticas'],
            important: ['Dashboard', 'Tareas Importantes'],
            optional: ['Dashboard', 'Tareas Opcionales'],
            technical: ['Dashboard', 'Tareas Técnicas'],
            fixes: ['Dashboard', 'Correcciones'],
            timeline: ['Dashboard', 'Timeline']
        };
        
        return breadcrumbs[this.currentSection] || ['Dashboard'];
    }

    /**
     * Guardar estado
     */
    saveState() {
        storageManager.setItem('sidebarCollapsed', this.sidebarCollapsed);
        storageManager.setItem('currentSection', this.currentSection);
    }

    /**
     * Obtener información del controlador
     */
    getInfo() {
        return {
            currentSection: this.currentSection,
            sidebarCollapsed: this.sidebarCollapsed,
            mobileMenuOpen: this.mobileMenuOpen,
            navigationItems: this.navigationItems,
            breadcrumb: this.getCurrentBreadcrumb()
        };
    }

    /**
     * Limpiar controlador
     */
    async destroy() {
        // Guardar estado final
        this.saveState();
        
        // Cerrar mobile menu si está abierto
        this.closeMobileSidebar();
        
        // Limpiar referencias
        this.elements = {};
        this.eventManager = null;
        
        console.log('🧹 NavigationController limpiado');
    }
}