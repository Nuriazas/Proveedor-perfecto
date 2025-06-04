/**
 * Sidebar Component - Versión Simplificada
 */

import { TASK_CATEGORIES } from '../data/taskData.js';

export class Sidebar {
    constructor() {
        this.isCollapsed = false;
        this.isMobileOpen = false;
        this.currentSection = 'overview';
        
        this.navigationItems = [
            { id: 'overview', icon: '📊', text: 'Resumen', href: '#overview' },
            { id: 'proposal', icon: '📋', text: 'Propuesta', href: '#proposal' },
            { id: 'critical', icon: '🔴', text: 'Tareas Críticas', href: '#critical' },
            { id: 'important', icon: '🟡', text: 'Importantes', href: '#important' },
            { id: 'optional', icon: '🟢', text: 'Opcionales', href: '#optional' },
            { id: 'technical', icon: '🔧', text: 'Técnicas', href: '#technical' },
            { id: 'fixes', icon: '🔨', text: 'Correcciones', href: '#fixes' },
            { id: 'timeline', icon: '⏱️', text: 'Timeline', href: '#timeline' },
        ];
        
        this.listeners = {
            sectionChange: [],
            sidebarToggle: [],
        };
    }

    /**
     * Inicializar sidebar
     */
    init() {
        console.log('🔧 Inicializando sidebar...');
        this.createSidebarHTML();
        this.bindEvents();
        this.showSection('overview'); // Forzar mostrar overview
        console.log('✅ Sidebar inicializado');
        return this;
    }

    /**
     * Crear HTML del sidebar
     */
    createSidebarHTML() {
        const sidebarHTML = `
            <nav class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="logo">SkillAgora</div>
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <span id="toggleIcon">←</span>
                    </button>
                </div>
                <ul class="nav-menu" id="navMenu">
                    ${this.navigationItems.map(item => this.createNavItem(item)).join('')}
                </ul>
            </nav>
        `;

        // Insertar sidebar
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
        }

        // Obtener referencias
        this.sidebarElement = document.getElementById('sidebar');
        this.mainContentElement = document.getElementById('mainContent');
        this.toggleIcon = document.getElementById('toggleIcon');
    }

    /**
     * Crear item de navegación
     */
    createNavItem(item) {
        const isActive = item.id === this.currentSection;
        return `
            <li class="nav-item">
                <a href="${item.href}" 
                   class="nav-link ${isActive ? 'active' : ''}" 
                   data-section="${item.id}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-text">${item.text}</span>
                </a>
            </li>
        `;
    }

    /**
     * Bind eventos
     */
    bindEvents() {
        // Toggle sidebar desktop
        const toggleButton = document.getElementById('sidebarToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggle());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.showSection(sectionId);
            });
        });

        // Mobile toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobile());
        }
    }

    /**
     * Mostrar sección
     */
    showSection(sectionId) {
        console.log(`📍 Mostrando sección: ${sectionId}`);
        
        // Actualizar navegación activa
        this.updateActiveNavigation(sectionId);
        
        // Ocultar todas las secciones
        const allSections = document.querySelectorAll('.content-section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Actualizar título de página
        this.updatePageTitle(sectionId);
        
        // Cerrar mobile sidebar
        this.closeMobile();
        
        // Actualizar estado actual
        this.currentSection = sectionId;
        
        // Emitir evento
        this.emit('sectionChange', { 
            sectionId, 
            previousSection: this.currentSection 
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Actualizar navegación activa
     */
    updateActiveNavigation(sectionId) {
        // Remover active de todos
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Añadir active al seleccionado
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Actualizar título de página
     */
    updatePageTitle(sectionId) {
        const titles = {
            overview: 'Dashboard SkillAgora',
            proposal: 'Propuesta del Proyecto',
            critical: 'Tareas Críticas',
            important: 'Tareas Importantes',
            optional: 'Tareas Opcionales',
            technical: 'Tareas Técnicas',
            fixes: 'Correcciones',
            timeline: 'Timeline',
        };
        
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle && titles[sectionId]) {
            pageTitle.textContent = titles[sectionId];
        }
    }

    /**
     * Toggle sidebar desktop
     */
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.sidebarElement) {
            this.sidebarElement.classList.toggle('collapsed', this.isCollapsed);
        }
        
        if (this.mainContentElement) {
            this.mainContentElement.classList.toggle('expanded', this.isCollapsed);
        }
        
        if (this.toggleIcon) {
            this.toggleIcon.textContent = this.isCollapsed ? '→' : '←';
        }
        
        this.emit('sidebarToggle', { collapsed: this.isCollapsed });
        return this.isCollapsed;
    }

    /**
     * Toggle mobile
     */
    toggleMobile() {
        this.isMobileOpen = !this.isMobileOpen;
        
        if (this.sidebarElement) {
            this.sidebarElement.classList.toggle('mobile-open', this.isMobileOpen);
        }
        
        document.body.style.overflow = this.isMobileOpen ? 'hidden' : '';
        return this.isMobileOpen;
    }

    /**
     * Cerrar mobile
     */
    closeMobile() {
        if (this.isMobileOpen) {
            this.isMobileOpen = false;
            if (this.sidebarElement) {
                this.sidebarElement.classList.remove('mobile-open');
            }
            document.body.style.overflow = '';
        }
    }

    /**
     * Obtener estado
     */
    getState() {
        return {
            currentSection: this.currentSection,
            isCollapsed: this.isCollapsed,
            isMobileOpen: this.isMobileOpen,
        };
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
     * Limpiar
     */
    destroy() {
        this.listeners = { sectionChange: [], sidebarToggle: [] };
        this.sidebarElement = null;
        this.mainContentElement = null;
        this.toggleIcon = null;
    }
}