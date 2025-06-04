/**
 * Task Manager Module
 * Maneja toda la lógica relacionada con las tareas
 */

import { TASK_DATA, TASK_CATEGORIES, TaskDataUtils } from '../data/taskData.js';
import { storage } from './storageManager.js';

export class TaskManager {
    constructor() {
        this.tasks = TASK_DATA;
        this.categories = TASK_CATEGORIES;
        this.state = this.loadState();
        this.filters = this.loadFilters();
        
        // Event listeners
        this.listeners = {
            taskToggle: [],
            subtaskToggle: [],
            progressUpdate: [],
            stateChange: [],
        };
    }

    /**
     * Cargar estado de las tareas desde storage
     */
    loadState() {
        return storage.getTaskStates();
    }

    /**
     * Cargar filtros desde storage
     */
    loadFilters() {
        return storage.getFilters();
    }

    /**
     * Guardar estado de las tareas
     */
    saveState() {
        storage.saveTaskStates(this.state);
        this.emit('stateChange', this.state);
    }

    /**
     * Guardar filtros
     */
    saveFilters() {
        storage.saveFilters(this.filters);
    }

    /**
     * Toggle estado de una tarea principal
     */
    toggleTask(taskId) {
        if (!this.state[taskId]) {
            this.state[taskId] = { completed: false, subtasks: {} };
        }
        
        const wasCompleted = this.state[taskId].completed;
        this.state[taskId].completed = !wasCompleted;
        
        // Si se marca como completada, marcar todas las subtareas
        if (this.state[taskId].completed) {
            const task = this.getTaskById(taskId);
            if (task) {
                task.tasks.forEach((_, index) => {
                    this.state[taskId].subtasks[index] = true;
                });
            }
        }
        
        this.saveState();
        this.emit('taskToggle', { taskId, completed: this.state[taskId].completed });
        this.emit('progressUpdate', this.getProgress());
        
        return this.state[taskId].completed;
    }

    /**
     * Toggle estado de una subtarea
     */
    toggleSubtask(taskId, subtaskIndex) {
        if (!this.state[taskId]) {
            this.state[taskId] = { completed: false, subtasks: {} };
        }
        if (!this.state[taskId].subtasks) {
            this.state[taskId].subtasks = {};
        }
        
        const wasCompleted = this.state[taskId].subtasks[subtaskIndex];
        this.state[taskId].subtasks[subtaskIndex] = !wasCompleted;
        
        // Auto-completar tarea principal si todas las subtareas están completas
        const task = this.getTaskById(taskId);
        if (task) {
            const completedSubtasks = task.tasks.filter((_, index) => 
                this.isSubtaskCompleted(taskId, index)
            ).length;
            
            if (completedSubtasks === task.tasks.length && !wasCompleted) {
                this.state[taskId].completed = true;
            } else if (wasCompleted && this.state[taskId].completed) {
                // Si se desmarca una subtarea y la tarea estaba completa, desmarcar la tarea
                this.state[taskId].completed = false;
            }
        }
        
        this.saveState();
        this.emit('subtaskToggle', { 
            taskId, 
            subtaskIndex, 
            completed: this.state[taskId].subtasks[subtaskIndex] 
        });
        this.emit('progressUpdate', this.getProgress());
        
        return this.state[taskId].subtasks[subtaskIndex];
    }

    /**
     * Verificar si una tarea está completada
     */
    isTaskCompleted(taskId) {
        return this.state[taskId] && this.state[taskId].completed;
    }

    /**
     * Verificar si una subtarea está completada
     */
    isSubtaskCompleted(taskId, subtaskIndex) {
        return this.state[taskId] && 
               this.state[taskId].subtasks && 
               this.state[taskId].subtasks[subtaskIndex];
    }

    /**
     * Obtener una tarea por ID
     */
    getTaskById(taskId) {
        return TaskDataUtils.getTaskById(taskId);
    }

    /**
     * Obtener tareas por categoría
     */
    getTasksByCategory(category) {
        return TaskDataUtils.getTasksByCategory(category);
    }

    /**
     * Obtener todas las tareas
     */
    getAllTasks() {
        return TaskDataUtils.getAllTasks();
    }

    /**
     * Buscar tareas
     */
    searchTasks(query) {
        return TaskDataUtils.searchTasks(query);
    }

    /**
     * Filtrar tareas
     */
    filterTasks(criteria = null) {
        const filterCriteria = criteria || this.filters;
        let tasks = this.getAllTasks();

        // Filtro por categoría
        if (filterCriteria.category && filterCriteria.category !== 'all') {
            tasks = this.getTasksByCategory(filterCriteria.category);
        }

        // Filtro por estado
        if (filterCriteria.status && filterCriteria.status !== 'all') {
            tasks = tasks.filter(task => {
                const isCompleted = this.isTaskCompleted(task.id);
                return filterCriteria.status === 'completed' ? isCompleted : !isCompleted;
            });
        }

        // Filtro por tiempo
        if (filterCriteria.time && filterCriteria.time !== 'all') {
            const timeLimit = parseInt(filterCriteria.time);
            tasks = tasks.filter(task => task.time <= timeLimit);
        }

        return tasks;
    }

    /**
     * Aplicar filtros
     */
    applyFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.saveFilters();
        return this.filterTasks();
    }

    /**
     * Resetear filtros
     */
    resetFilters() {
        this.filters = { category: 'all', status: 'all', time: 'all' };
        this.saveFilters();
        return this.filterTasks();
    }

    /**
     * Obtener progreso general
     */
    getProgress() {
        const allTasks = this.getAllTasks();
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(task => this.isTaskCompleted(task.id)).length;
        const totalTime = allTasks.reduce((sum, task) => sum + task.time, 0);
        const completedTime = allTasks
            .filter(task => this.isTaskCompleted(task.id))
            .reduce((sum, task) => sum + task.time, 0);

        return {
            totalTasks,
            completedTasks,
            totalTime,
            completedTime,
            remainingTime: totalTime - completedTime,
            percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        };
    }

    /**
     * Obtener progreso por categoría
     */
    getProgressByCategory() {
        const progress = {};
        
        Object.keys(this.categories).forEach(category => {
            const tasks = this.getTasksByCategory(category);
            const completedTasks = tasks.filter(task => this.isTaskCompleted(task.id)).length;
            const totalTime = tasks.reduce((sum, task) => sum + task.time, 0);
            const completedTime = tasks
                .filter(task => this.isTaskCompleted(task.id))
                .reduce((sum, task) => sum + task.time, 0);

            progress[category] = {
                totalTasks: tasks.length,
                completedTasks,
                totalTime,
                completedTime,
                percentage: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
            };
        });

        return progress;
    }

    /**
     * Obtener estadísticas detalladas
     */
    getDetailedStats() {
        const allTasks = this.getAllTasks();
        const progress = this.getProgress();
        const categoryProgress = this.getProgressByCategory();
        
        // Calcular subtareas
        let totalSubtasks = 0;
        let completedSubtasks = 0;
        
        allTasks.forEach(task => {
            totalSubtasks += task.tasks.length;
            task.tasks.forEach((_, index) => {
                if (this.isSubtaskCompleted(task.id, index)) {
                    completedSubtasks++;
                }
            });
        });

        // Tareas por prioridad/tiempo
        const tasksByTime = {
            quick: allTasks.filter(task => task.time <= 2).length,
            medium: allTasks.filter(task => task.time > 2 && task.time <= 4).length,
            long: allTasks.filter(task => task.time > 4).length,
        };

        return {
            ...progress,
            totalSubtasks,
            completedSubtasks,
            subtaskPercentage: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
            categoryProgress,
            tasksByTime,
            estimatedCompletionDate: this.calculateEstimatedCompletion(),
        };
    }

    /**
     * Calcular fecha estimada de finalización
     */
    calculateEstimatedCompletion() {
        const progress = this.getProgress();
        const remainingDays = progress.remainingTime;
        
        if (remainingDays <= 0) {
            return new Date(); // Ya está completo
        }
        
        // Asumiendo 5 días laborales por semana
        const workDaysPerWeek = 5;
        const totalWeeks = Math.ceil(remainingDays / workDaysPerWeek);
        
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + (totalWeeks * 7));
        
        return estimatedDate;
    }

    /**
     * Obtener tareas críticas pendientes
     */
    getCriticalPendingTasks() {
        const criticalTasks = this.getTasksByCategory('critical');
        return criticalTasks.filter(task => !this.isTaskCompleted(task.id));
    }

    /**
     * Obtener próximas tareas recomendadas
     */
    getRecommendedNextTasks(limit = 5) {
        const pendingTasks = this.getAllTasks().filter(task => !this.isTaskCompleted(task.id));
        
        // Priorizar por: críticas > importantes > tiempo corto
        return pendingTasks
            .sort((a, b) => {
                const categoryPriority = { critical: 0, important: 1, fixes: 2, technical: 3, optional: 4 };
                const aCat = TaskDataUtils.getCategoryByTaskId(a.id);
                const bCat = TaskDataUtils.getCategoryByTaskId(b.id);
                
                const aPriority = categoryPriority[aCat] || 5;
                const bPriority = categoryPriority[bCat] || 5;
                
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }
                
                // Si son de la misma categoría, priorizar por tiempo
                return a.time - b.time;
            })
            .slice(0, limit);
    }

    /**
     * Exportar progreso
     */
    exportProgress() {
        const stats = this.getDetailedStats();
        
        return {
            taskStates: this.state,
            filters: this.filters,
            statistics: stats,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    }

    /**
     * Importar progreso
     */
    importProgress(data) {
        try {
            if (data.taskStates) {
                this.state = data.taskStates;
                this.saveState();
            }
            
            if (data.filters) {
                this.filters = data.filters;
                this.saveFilters();
            }
            
            this.emit('progressUpdate', this.getProgress());
            this.emit('stateChange', this.state);
            
            return { success: true, message: 'Progreso importado exitosamente' };
        } catch (error) {
            return { success: false, message: `Error al importar: ${error.message}` };
        }
    }

    /**
     * Resetear todo el progreso
     */
    resetProgress() {
        this.state = {};
        this.saveState();
        this.emit('progressUpdate', this.getProgress());
        this.emit('stateChange', this.state);
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
}

// Instancia singleton
export const taskManager = new TaskManager();