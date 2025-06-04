/**
 * Event Manager
 * Sistema centralizado de eventos para comunicación entre módulos
 */

export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
        this.debugMode = false;
    }

    /**
     * Inicializar event manager
     */
    init() {
        this.setupGlobalErrorHandling();
        console.log('📡 EventManager inicializado');
        return this;
    }

    /**
     * Configurar manejo global de errores en eventos
     */
    setupGlobalErrorHandling() {
        // Capturar errores no manejados en listeners
        window.addEventListener('error', (e) => {
            this.emit('system:error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            this.emit('system:unhandledRejection', {
                reason: e.reason,
                promise: e.promise
            });
        });
    }

    /**
     * Registrar listener para un evento
     */
    on(eventName, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback debe ser una función');
        }

        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }

        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: options.id || this.generateListenerId(),
            context: options.context || null
        };

        const listeners = this.listeners.get(eventName);
        listeners.push(listener);

        // Ordenar por prioridad (mayor prioridad primero)
        listeners.sort((a, b) => b.priority - a.priority);

        if (this.debugMode) {
            console.log(`📡 Listener registrado: ${eventName}`, listener);
        }

        return listener.id;
    }

    /**
     * Registrar listener que se ejecuta solo una vez
     */
    once(eventName, callback, options = {}) {
        return this.on(eventName, callback, { ...options, once: true });
    }

    /**
     * Eliminar listener
     */
    off(eventName, callbackOrId) {
        if (!this.listeners.has(eventName)) {
            return false;
        }

        const listeners = this.listeners.get(eventName);
        let index = -1;

        if (typeof callbackOrId === 'function') {
            index = listeners.findIndex(l => l.callback === callbackOrId);
        } else if (typeof callbackOrId === 'string') {
            index = listeners.findIndex(l => l.id === callbackOrId);
        }

        if (index > -1) {
            const removed = listeners.splice(index, 1)[0];
            
            if (listeners.length === 0) {
                this.listeners.delete(eventName);
            }

            if (this.debugMode) {
                console.log(`📡 Listener eliminado: ${eventName}`, removed);
            }

            return true;
        }

        return false;
    }

    /**
     * Emitir evento
     */
    emit(eventName, data = null) {
        const event = {
            name: eventName,
            data,
            timestamp: new Date().toISOString(),
            id: this.generateEventId()
        };

        // Agregar a historial
        this.addToHistory(event);

        if (this.debugMode) {
            console.log(`📡 Evento emitido: ${eventName}`, event);
        }

        if (!this.listeners.has(eventName)) {
            return event;
        }

        const listeners = this.listeners.get(eventName);
        const listenersToRemove = [];

        // Ejecutar listeners
        for (const listener of listeners) {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data, event);
                } else {
                    listener.callback(data, event);
                }

                // Marcar para eliminar si es 'once'
                if (listener.once) {
                    listenersToRemove.push(listener);
                }

            } catch (error) {
                console.error(`❌ Error en listener para ${eventName}:`, error);
                
                // Emitir evento de error interno
                this.emitInternal('system:listenerError', {
                    eventName,
                    listenerId: listener.id,
                    error: error.message,
                    originalEvent: event
                });
            }
        }

        // Eliminar listeners 'once'
        listenersToRemove.forEach(listener => {
            this.off(eventName, listener.id);
        });

        return event;
    }

    /**
     * Emitir evento interno (sin historial para evitar loops)
     */
    emitInternal(eventName, data) {
        if (!this.listeners.has(eventName)) {
            return;
        }

        const listeners = this.listeners.get(eventName);
        
        for (const listener of listeners) {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }
            } catch (error) {
                console.error(`❌ Error en listener interno para ${eventName}:`, error);
            }
        }
    }

    /**
     * Emitir evento de forma asíncrona
     */
    async emitAsync(eventName, data = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const event = this.emit(eventName, data);
                resolve(event);
            }, 0);
        });
    }

    /**
     * Verificar si hay listeners para un evento
     */
    hasListeners(eventName) {
        return this.listeners.has(eventName) && this.listeners.get(eventName).length > 0;
    }

    /**
     * Obtener número de listeners para un evento
     */
    getListenerCount(eventName) {
        if (!this.listeners.has(eventName)) {
            return 0;
        }
        return this.listeners.get(eventName).length;
    }

    /**
     * Obtener todos los nombres de eventos registrados
     */
    getEventNames() {
        return Array.from(this.listeners.keys());
    }

    /**
     * Esperar a que se emita un evento específico
     */
    waitFor(eventName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let timeoutId;

            const listenerId = this.once(eventName, (data, event) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve({ data, event });
            });

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    this.off(eventName, listenerId);
                    reject(new Error(`Timeout esperando evento: ${eventName}`));
                }, timeout);
            }
        });
    }

    /**
     * Crear namespace para eventos
     */
    namespace(prefix) {
        return {
            on: (eventName, callback, options) => 
                this.on(`${prefix}:${eventName}`, callback, options),
            
            once: (eventName, callback, options) => 
                this.once(`${prefix}:${eventName}`, callback, options),
            
            off: (eventName, callbackOrId) => 
                this.off(`${prefix}:${eventName}`, callbackOrId),
            
            emit: (eventName, data) => 
                this.emit(`${prefix}:${eventName}`, data),
            
            emitAsync: (eventName, data) => 
                this.emitAsync(`${prefix}:${eventName}`, data)
        };
    }

    /**
     * Agregar evento al historial
     */
    addToHistory(event) {
        this.eventHistory.unshift(event);
        
        // Mantener tamaño máximo del historial
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Obtener historial de eventos
     */
    getHistory(filter = null) {
        if (!filter) {
            return [...this.eventHistory];
        }

        if (typeof filter === 'string') {
            return this.eventHistory.filter(event => event.name === filter);
        }

        if (typeof filter === 'function') {
            return this.eventHistory.filter(filter);
        }

        return [];
    }

    /**
     * Limpiar historial
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Obtener estadísticas
     */
    getStats() {
        const eventCounts = {};
        const listenerCounts = {};

        // Contar eventos en historial
        this.eventHistory.forEach(event => {
            eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
        });

        // Contar listeners
        this.listeners.forEach((listeners, eventName) => {
            listenerCounts[eventName] = listeners.length;
        });

        return {
            totalEvents: this.eventHistory.length,
            totalListeners: Array.from(this.listeners.values())
                .reduce((sum, listeners) => sum + listeners.length, 0),
            uniqueEventTypes: this.listeners.size,
            eventCounts,
            listenerCounts,
            historySize: this.eventHistory.length,
            maxHistorySize: this.maxHistorySize
        };
    }

    /**
     * Habilitar/deshabilitar debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        
        if (enabled) {
            console.log('🐛 EventManager debug mode activado');
        }
    }

    /**
     * Generar ID único para listener
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generar ID único para evento
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Exportar configuración
     */
    exportConfig() {
        return {
            listeners: Array.from(this.listeners.entries()).map(([eventName, listeners]) => ({
                eventName,
                listenerCount: listeners.length,
                listeners: listeners.map(l => ({
                    id: l.id,
                    once: l.once,
                    priority: l.priority
                }))
            })),
            history: this.eventHistory.slice(0, 10), // Solo últimos 10 eventos
            stats: this.getStats(),
            debugMode: this.debugMode
        };
    }

    /**
     * Eliminar todos los listeners
     */
    removeAllListeners(eventName = null) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Crear middleware para eventos
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware debe ser una función');
        }

        const originalEmit = this.emit.bind(this);
        
        this.emit = (eventName, data) => {
            try {
                const result = middleware(eventName, data);
                
                // Si el middleware retorna false, cancelar el evento
                if (result === false) {
                    return null;
                }
                
                // Si retorna un objeto, usar como nueva data
                const finalData = (result && typeof result === 'object') ? result : data;
                
                return originalEmit(eventName, finalData);
            } catch (error) {
                console.error('❌ Error en middleware:', error);
                return originalEmit(eventName, data);
            }
        };
    }

    /**
     * Destruir event manager
     */
    destroy() {
        // Emitir evento de destrucción
        this.emit('system:eventManagerDestroying');
        
        // Limpiar todos los listeners
        this.listeners.clear();
        
        // Limpiar historial
        this.eventHistory = [];
        
        console.log('💥 EventManager destruido');
    }
}