/**
 * Main Application Entry Point - Versión Modular
 * Solo maneja la inicialización principal
 */

import { App } from "./core/App.js";
import { GlobalBridge } from "./core/GlobalBridge.js";
import { ErrorHandler } from "./core/ErrorHandler.js";

// Configuración global de la aplicación
const APP_CONFIG = {
	name: "SkillAgora",
	version: "1.0.0",
	debug: true,
	autoSave: true,
	themes: ["light", "dark"],
};

/**
 * Inicializar aplicación
 */
async function initializeApp() {
	try {
		console.log("🚀 Inicializando SkillAgora Dashboard...");

		// 1. Configurar manejo de errores global
		ErrorHandler.init();

		// 2. Crear puente para funciones globales (HTML compatibility)
		const globalBridge = new GlobalBridge();
		globalBridge.setupGlobalFunctions();

		// 3. Inicializar aplicación principal
		const app = new App(APP_CONFIG);
		await app.init();

		// 4. Conectar puente con la app
		globalBridge.setApp(app);

		// 5. Exponer globalmente para debugging
		if (APP_CONFIG.debug) {
			window.skillAgoraApp = app;
			window.skillAgoraConfig = APP_CONFIG;
			window.skillAgoraBridge = globalBridge;
		}

		console.log("✅ SkillAgora Dashboard inicializado correctamente");
	} catch (error) {
		console.error("❌ Error crítico inicializando aplicación:", error);
		ErrorHandler.handleCriticalError(error);
	}
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeApp);
} else {
	initializeApp();
}

console.log("🎮 SkillAgora Dashboard cargando...");
