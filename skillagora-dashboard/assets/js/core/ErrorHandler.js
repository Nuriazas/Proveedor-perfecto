/**
 * Error Handler
 * Manejo centralizado de errores y recuperación de la aplicación
 */

export class ErrorHandler {
    static instance = null;
    
    constructor() {
        if (ErrorHandler.instance) {
            return ErrorHandler.instance;
        }
        
        this.errorLog = [];
        this.maxLogSize = 50;
        this.isInitialized = false;
        this.debugMode = true;
        
        // Configuración de errores
        this.config = {
            showUserNotifications: true,
            logToConsole: true,
            logToStorage: true,
            enableRetry: true,
            maxRetries: 3
        };
        
        ErrorHandler.instance = this;
    }

    /**
     * Inicializar manejo de errores
     */
    static init() {
        const handler = new ErrorHandler();
        if (!handler.isInitialized) {
            handler.setupGlobalHandlers();
            handler.isInitialized = true;
            console.log('🛡️ ErrorHandler inicializado');
        }
        return handler;
    }

    /**
     * Configurar manejadores globales
     */
    setupGlobalHandlers() {
        // Errores JavaScript no capturados
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });

        // Promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection({
                reason: event.reason,
                promise: event.promise,
                type: 'promise'
            });
        });

        // Errores de recursos (imágenes, scripts, etc.)
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError({
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    type: 'resource'
                });
            }
        }, true);
    }

    /**
     * Manejar error JavaScript
     */
    handleJavaScriptError(errorInfo) {
        const error = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: 'javascript',
            severity: 'error',
            message: errorInfo.message,
            filename: errorInfo.filename,
            line: errorInfo.lineno,
            column: errorInfo.colno,
            stack: errorInfo.error?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logError(error);
        this.handleError(error);
    }

    /**
     * Manejar promesa rechazada
     */
    handlePromiseRejection(rejectionInfo) {
        const error = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: 'promise',
            severity: 'error',
            message: rejectionInfo.reason?.message || 'Promise rejected',
            reason: rejectionInfo.reason,
            stack: rejectionInfo.reason?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logError(error);
        this.handleError(error);
    }

    /**
     * Manejar error de recursos
     */
    handleResourceError(resourceInfo) {
        const error = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: 'resource',
            severity: 'warning',
            message: `Failed to load ${resourceInfo.element}`,
            source: resourceInfo.source,
            element: resourceInfo.element,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.logError(error);
        
        // Los errores de recursos generalmente no necesitan notificación al usuario
        if (this.config.logToConsole) {
            console.warn('❌ Resource error:', error);
        }
    }

    /**
     * Manejar error específico de la aplicación
     */
    handleAppError(error, context = {}) {
        const appError = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: 'application',
            severity: context.severity || 'error',
            message: error.message || 'Unknown application error',
            stack: error.stack,
            context: context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            component: context.component,
            action: context.action
        };

        this.logError(appError);
        this.handleError(appError);
        
        return appError;
    }

    /**
     * Manejar error crítico
     */
    static handleCriticalError(error) {
        console.error('💥 Error crítico:', error);
        
        // Mostrar mensaje de error al usuario
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(220, 53, 69, 0.95);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        `;
        
        errorDiv.innerHTML = `
            <h1 style="font-size: 3em; margin-bottom: 20px;">💥</h1>
            <h2 style="margin-bottom: 20px;">Error Crítico</h2>
            <p style="margin-bottom: 30px; max-width: 600px;">
                Ha ocurrido un error inesperado. La aplicación no puede continuar.
            </p>
            <p style="margin-bottom: 30px; font-family: monospace; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 6px;">
                ${error.message}
            </p>
            <button onclick="location.reload()" style="
                background: white;
                color: #dc3545;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                font-weight: 600;
            ">🔄 Recargar Aplicación</button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Procesar error
     */
    handleError(error) {
        if (this.config.logToConsole) {
            this.logToConsole(error);
        }
        
        if (this.config.logToStorage) {
            this.logToStorage(error);
        }
        
        if (this.config.showUserNotifications && error.severity === 'error') {
            this.showUserNotification(error);
        }
        
        // Intentar recuperación automática si está habilitada
        if (this.config.enableRetry && this.shouldRetry(error)) {
            this.attemptRecovery(error);
        }
    }

    /**
     * Registrar error en log interno
     */
    logError(error) {
        this.errorLog.unshift(error);
        
        // Mantener tamaño máximo del log
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
    }

    /**
     * Log a consola
     */
    logToConsole(error) {
        const style = error.severity === 'error' ? 'error' : 'warn';
        console[style](`❌ [${error.type.toUpperCase()}] ${error.message}`, error);
    }

    /**
     * Log a storage
     */
    logToStorage(error) {
        try {
            const errorLog = JSON.parse(localStorage.getItem('skillAgora_errorLog') || '[]');
            errorLog.unshift({
                id: error.id,
                timestamp: error.timestamp,
                type: error.type,
                severity: error.severity,
                message: error.message,
                url: error.url
            });
            
            // Mantener solo los últimos 20 errores en storage
            const trimmedLog = errorLog.slice(0, 20);
            localStorage.setItem('skillAgora_errorLog', JSON.stringify(trimmedLog));
        } catch (e) {
            console.warn('No se pudo guardar error en localStorage:', e);
        }
    }

    /**
     * Mostrar notificación al usuario
     */
    showUserNotification(error) {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 18px;">⚠️</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 5px;">Error en la aplicación</div>
                    <div style="font-size: 14px; opacity: 0.9;">${this.getUserFriendlyMessage(error)}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0;
                    margin-left: 10px;
                ">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove después de 8 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 8000);
    }

    /**
     * Obtener mensaje amigable para el usuario
     */
    getUserFriendlyMessage(error) {
        const friendlyMessages = {
            'javascript': 'Ha ocurrido un error inesperado en la aplicación.',
            'promise': 'Error procesando una operación asíncrona.',
            'resource': 'No se pudo cargar un recurso necesario.',
            'application': error.message || 'Error en la aplicación.',
            'network': 'Error de conexión. Verifica tu conexión a internet.',
            'storage': 'Error accediendo al almacenamiento local.'
        };
        
        return friendlyMessages[error.type] || 'Ha ocurrido un error inesperado.';
    }

    /**
     * Verificar si se debe intentar recuperación
     */
    shouldRetry(error) {
        // No reintentar errores de sintaxis o críticos
        const noRetryTypes = ['javascript', 'syntax'];
        if (noRetryTypes.includes(error.type)) {
            return false;
        }
        
        // No reintentar si ya se reintentó demasiadas veces
        const retryCount = error.retryCount || 0;
        return retryCount < this.config.maxRetries;
    }

    /**
     * Intentar recuperación automática
     */
    attemptRecovery(error) {
        const retryCount = (error.retryCount || 0) + 1;
        error.retryCount = retryCount;
        
        console.log(`🔄 Intentando recuperación automática (${retryCount}/${this.config.maxRetries})`);
        
        setTimeout(() => {
            try {
                switch (error.type) {
                    case 'network':
                        this.retryNetworkOperation(error);
                        break;
                    case 'storage':
                        this.retryStorageOperation(error);
                        break;
                    case 'resource':
                        this.retryResourceLoad(error);
                        break;
                    default:
                        this.genericRecovery(error);
                }
            } catch (recoveryError) {
                console.error('❌ Error durante recuperación:', recoveryError);
            }
        }, 1000 * retryCount); // Incrementar delay con cada intento
    }

    /**
     * Reintentar operación de red
     */
    retryNetworkOperation(error) {
        // Implementar lógica específica para reintentar operaciones de red
        console.log('🌐 Reintentando operación de red...');
    }

    /**
     * Reintentar operación de storage
     */
    retryStorageOperation(error) {
        // Implementar lógica para reintentar operaciones de storage
        console.log('💾 Reintentando operación de storage...');
    }

    /**
     * Reintentar carga de recurso
     */
    retryResourceLoad(error) {
        // Intentar recargar el recurso
        console.log('📁 Reintentando carga de recurso...');
    }

    /**
     * Recuperación genérica
     */
    genericRecovery(error) {
        console.log('🔧 Aplicando recuperación genérica...');
        // Implementar estrategias genéricas de recuperación
    }

    /**
     * Wrap función con manejo de errores
     */
    static wrapFunction(fn, context = {}) {
        return function(...args) {
            try {
                const result = fn.apply(this, args);
                
                // Si retorna una promesa, manejar rechazos
                if (result && typeof result.catch === 'function') {
                    return result.catch(error => {
                        ErrorHandler.getInstance().handleAppError(error, {
                            ...context,
                            function: fn.name,
                            args: args.length
                        });
                        throw error; // Re-throw para mantener el comportamiento esperado
                    });
                }
                
                return result;
            } catch (error) {
                ErrorHandler.getInstance().handleAppError(error, {
                    ...context,
                    function: fn.name,
                    args: args.length
                });
                throw error; // Re-throw para mantener el comportamiento esperado
            }
        };
    }

    /**
     * Wrap promesa con manejo de errores
     */
    static wrapPromise(promise, context = {}) {
        return promise.catch(error => {
            ErrorHandler.getInstance().handleAppError(error, context);
            throw error; // Re-throw para mantener el comportamiento esperado
        });
    }

    /**
     * Obtener instancia singleton
     */
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.init();
        }
        return ErrorHandler.instance;
    }

    /**
     * Generar ID único para error
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtener log de errores
     */
    getErrorLog(filter = null) {
        if (!filter) {
            return [...this.errorLog];
        }
        
        if (typeof filter === 'string') {
            return this.errorLog.filter(error => error.type === filter);
        }
        
        if (typeof filter === 'function') {
            return this.errorLog.filter(filter);
        }
        
        return [];
    }

    /**
     * Limpiar log de errores
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('skillAgora_errorLog');
    }

    /**
     * Obtener estadísticas de errores
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: 0, // Últimas 24 horas
            trends: {}
        };
        
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        this.errorLog.forEach(error => {
            // Por tipo
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // Por severidad
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
            
            // Recientes
            if (new Date(error.timestamp) > dayAgo) {
                stats.recent++;
            }
        });
        
        return stats;
    }

    /**
     * Exportar log de errores
     */
    exportErrorLog() {
        const exportData = {
            errors: this.errorLog,
            stats: this.getErrorStats(),
            config: this.config,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillagora-errors-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return exportData;
    }

    /**
     * Configurar ErrorHandler
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this;
    }

    /**
     * Habilitar/deshabilitar debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.config.logToConsole = enabled;
        return this;
    }

    /**
     * Crear boundary de error para componentes React-like
     */
    createErrorBoundary(componentName) {
        return {
            componentName,
            hasError: false,
            error: null,
            
            componentDidCatch: (error, errorInfo) => {
                this.handleAppError(error, {
                    component: componentName,
                    errorInfo,
                    severity: 'error'
                });
                
                this.hasError = true;
                this.error = error;
            },
            
            render: function(children, fallbackUI) {
                if (this.hasError) {
                    return fallbackUI || this.getDefaultFallbackUI();
                }
                
                try {
                    return children();
                } catch (error) {
                    this.componentDidCatch(error, { component: componentName });
                    return fallbackUI || this.getDefaultFallbackUI();
                }
            },
            
            getDefaultFallbackUI: () => {
                return `
                    <div style="
                        padding: 20px;
                        border: 1px solid #dc3545;
                        border-radius: 8px;
                        background: #f8d7da;
                        color: #721c24;
                        text-align: center;
                    ">
                        <h3>⚠️ Error en ${componentName}</h3>
                        <p>Ha ocurrido un error en este componente.</p>
                        <button onclick="location.reload()">🔄 Recargar página</button>
                    </div>
                `;
            },
            
            reset: function() {
                this.hasError = false;
                this.error = null;
            }
        };
    }

    /**
     * Monitorear performance y detectar posibles problemas
     */
    monitorPerformance() {
        // Monitor de memoria (si está disponible)
        if (performance.memory) {
            const memUsage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
            if (memUsage > 0.9) {
                this.handleAppError(new Error('High memory usage detected'), {
                    type: 'performance',
                    severity: 'warning',
                    memoryUsage: memUsage
                });
            }
        }
        
        // Monitor de elementos DOM
        const domElements = document.querySelectorAll('*').length;
        if (domElements > 5000) {
            this.handleAppError(new Error('High DOM element count'), {
                type: 'performance',
                severity: 'warning',
                domElements
            });
        }
    }

    /**
     * Iniciar monitoreo continuo
     */
    startMonitoring() {
        // Monitorear cada 30 segundos
        setInterval(() => {
            this.monitorPerformance();
        }, 30000);
        
        console.log('📊 Monitoreo de errores iniciado');
    }

    /**
     * Destruir ErrorHandler
     */
    destroy() {
        this.clearErrorLog();
        this.isInitialized = false;
        ErrorHandler.instance = null;
        console.log('💥 ErrorHandler destruido');
    }
}