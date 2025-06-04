/**
 * Storage Manager Module
 * Maneja el almacenamiento de datos con fallback para entornos sandbox
 */

export class StorageManager {
    constructor() {
        // Fallback storage para entornos sandboxed
        this.memoryStorage = {};
        this.isAvailable = this.checkAvailability();
        
        // Configuración
        this.config = {
            prefix: 'skillAgora_',
            compression: false,
            encryption: false,
        };
    }

    /**
     * Detectar si localStorage está disponible
     */
    checkAvailability() {
        try {
            const test = "__storage_test__";
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn("LocalStorage no disponible, usando memoria temporal");
            return false;
        }
    }

    /**
     * Obtener clave con prefijo
     */
    getKey(key) {
        return `${this.config.prefix}${key}`;
    }

    /**
     * Guardar datos
     */
    setItem(key, value) {
        const fullKey = this.getKey(key);
        const serializedValue = this.serialize(value);
        
        if (this.isAvailable) {
            try {
                localStorage.setItem(fullKey, serializedValue);
                return true;
            } catch (e) {
                console.warn("Error guardando en localStorage:", e);
                this.isAvailable = false;
            }
        }
        
        // Fallback a memoria
        this.memoryStorage[fullKey] = serializedValue;
        return false;
    }

    /**
     * Obtener datos
     */
    getItem(key) {
        const fullKey = this.getKey(key);
        let value = null;
        
        if (this.isAvailable) {
            try {
                value = localStorage.getItem(fullKey);
            } catch (e) {
                console.warn("Error leyendo localStorage:", e);
                this.isAvailable = false;
            }
        }
        
        // Fallback a memoria si localStorage no funcionó
        if (value === null) {
            value = this.memoryStorage[fullKey] || null;
        }
        
        return this.deserialize(value);
    }

    /**
     * Eliminar datos
     */
    removeItem(key) {
        const fullKey = this.getKey(key);
        
        if (this.isAvailable) {
            try {
                localStorage.removeItem(fullKey);
                return;
            } catch (e) {
                console.warn("Error eliminando de localStorage:", e);
                this.isAvailable = false;
            }
        }
        
        // Fallback a memoria
        delete this.memoryStorage[fullKey];
    }

    /**
     * Limpiar todos los datos del proyecto
     */
    clear() {
        if (this.isAvailable) {
            try {
                // Solo eliminar claves que empiecen con nuestro prefijo
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.config.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } catch (e) {
                console.warn("Error limpiando localStorage:", e);
            }
        }
        
        // Limpiar memoria
        Object.keys(this.memoryStorage).forEach(key => {
            if (key.startsWith(this.config.prefix)) {
                delete this.memoryStorage[key];
            }
        });
    }

    /**
     * Obtener todas las claves del proyecto
     */
    getKeys() {
        const keys = new Set();
        
        if (this.isAvailable) {
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.config.prefix)) {
                        keys.add(key.replace(this.config.prefix, ''));
                    }
                });
            } catch (e) {
                console.warn("Error obteniendo claves de localStorage:", e);
            }
        }
        
        // Añadir claves de memoria
        Object.keys(this.memoryStorage).forEach(key => {
            if (key.startsWith(this.config.prefix)) {
                keys.add(key.replace(this.config.prefix, ''));
            }
        });
        
        return Array.from(keys);
    }

    /**
     * Verificar si una clave existe
     */
    hasItem(key) {
        return this.getItem(key) !== null;
    }

    /**
     * Obtener el tamaño de almacenamiento usado
     */
    getStorageSize() {
        let size = 0;
        
        if (this.isAvailable) {
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.config.prefix)) {
                        size += localStorage.getItem(key).length;
                    }
                });
            } catch (e) {
                console.warn("Error calculando tamaño de localStorage:", e);
            }
        }
        
        // Añadir tamaño de memoria
        Object.keys(this.memoryStorage).forEach(key => {
            if (key.startsWith(this.config.prefix)) {
                size += this.memoryStorage[key].length;
            }
        });
        
        return size;
    }

    /**
     * Exportar todos los datos
     */
    exportData() {
        const data = {};
        const keys = this.getKeys();
        
        keys.forEach(key => {
            data[key] = this.getItem(key);
        });
        
        return {
            data,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            source: 'SkillAgora Dashboard'
        };
    }

    /**
     * Importar datos
     */
    importData(exportedData) {
        try {
            if (!exportedData.data) {
                throw new Error("Formato de datos inválido");
            }
            
            Object.entries(exportedData.data).forEach(([key, value]) => {
                this.setItem(key, value);
            });
            
            return {
                success: true,
                message: "Datos importados exitosamente",
                importedKeys: Object.keys(exportedData.data)
            };
        } catch (error) {
            return {
                success: false,
                message: `Error al importar: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * Serializar datos para almacenamiento
     */
    serialize(value) {
        if (value === null || value === undefined) {
            return null;
        }
        
        try {
            return JSON.stringify(value);
        } catch (e) {
            console.warn("Error serializando datos:", e);
            return null;
        }
    }

    /**
     * Deserializar datos del almacenamiento
     */
    deserialize(value) {
        if (value === null || value === undefined) {
            return null;
        }
        
        try {
            return JSON.parse(value);
        } catch (e) {
            // Si no se puede parsear, devolver el valor original
            return value;
        }
    }

    /**
     * Configurar opciones del storage
     */
    configure(options) {
        this.config = { ...this.config, ...options };
        return this;
    }

    /**
     * Obtener información del storage
     */
    getInfo() {
        return {
            isLocalStorageAvailable: this.isAvailable,
            storageType: this.isAvailable ? 'localStorage' : 'memory',
            usedSize: this.getStorageSize(),
            keyCount: this.getKeys().length,
            config: this.config,
        };
    }

    /**
     * Método de backup automático
     */
    createBackup() {
        const backup = this.exportData();
        const backupKey = `backup_${Date.now()}`;
        
        try {
            this.setItem(backupKey, backup);
            return { success: true, backupKey };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Restaurar desde backup
     */
    restoreFromBackup(backupKey) {
        try {
            const backup = this.getItem(backupKey);
            if (!backup) {
                throw new Error("Backup no encontrado");
            }
            
            return this.importData(backup);
        } catch (error) {
            return {
                success: false,
                message: `Error restaurando backup: ${error.message}`,
                error: error
            };
        }
    }

    /**
     * Limpiar backups antiguos (mantener solo los últimos N)
     */
    cleanOldBackups(keepCount = 5) {
        const keys = this.getKeys();
        const backupKeys = keys
            .filter(key => key.startsWith('backup_'))
            .sort()
            .reverse(); // Más recientes primero
        
        if (backupKeys.length > keepCount) {
            const toDelete = backupKeys.slice(keepCount);
            toDelete.forEach(key => this.removeItem(key));
            return toDelete.length;
        }
        
        return 0;
    }
}

// Instancia singleton
export const storageManager = new StorageManager();

// Configuraciones predefinidas
export const STORAGE_KEYS = {
    TASK_STATES: 'taskStates',
    THEME: 'theme',
    FILTERS: 'filters',
    USER_PREFERENCES: 'userPreferences',
    LAST_VISIT: 'lastVisit',
    SIDEBAR_STATE: 'sidebarState',
};

// Funciones helper para uso común
export const storage = {
    // Task states
    saveTaskStates: (states) => storageManager.setItem(STORAGE_KEYS.TASK_STATES, states),
    getTaskStates: () => storageManager.getItem(STORAGE_KEYS.TASK_STATES) || {},
    
    // Theme
    saveTheme: (theme) => storageManager.setItem(STORAGE_KEYS.THEME, theme),
    getTheme: () => storageManager.getItem(STORAGE_KEYS.THEME) || 'light',
    
    // Filters
    saveFilters: (filters) => storageManager.setItem(STORAGE_KEYS.FILTERS, filters),
    getFilters: () => storageManager.getItem(STORAGE_KEYS.FILTERS) || { category: 'all', status: 'all', time: 'all' },
    
    // User preferences
    saveUserPreferences: (prefs) => storageManager.setItem(STORAGE_KEYS.USER_PREFERENCES, prefs),
    getUserPreferences: () => storageManager.getItem(STORAGE_KEYS.USER_PREFERENCES) || {},
    
    // Sidebar state
    saveSidebarState: (collapsed) => storageManager.setItem(STORAGE_KEYS.SIDEBAR_STATE, collapsed),
    getSidebarState: () => storageManager.getItem(STORAGE_KEYS.SIDEBAR_STATE) || false,
    
    // Last visit
    updateLastVisit: () => storageManager.setItem(STORAGE_KEYS.LAST_VISIT, new Date().toISOString()),
    getLastVisit: () => storageManager.getItem(STORAGE_KEYS.LAST_VISIT),
};