// assets/js/components/presentation.js
export class PresentationManager {
    constructor() {
        this.setupGlobalFunctions();
    }

    setupGlobalFunctions() {
        // Hacer las funciones disponibles globalmente
        window.toggleEditMode = this.toggleEditMode.bind(this);
        window.savePresentationContent = this.savePresentationContent.bind(this);
    }

    toggleEditMode() {
        const view = document.getElementById("presentationView");
        const editor = document.getElementById("presentationEditor");
        const editBtn = document.getElementById("editModeText");
        const saveBtn = document.getElementById("saveBtn");

        const isEditing = editor.style.display !== "none";

        if (isEditing) {
            // Cambiar a modo vista
            view.style.display = "block";
            editor.style.display = "none";
            editBtn.textContent = "✏️ Editar";
            saveBtn.style.display = "none";
        } else {
            // Cambiar a modo edición
            this.loadContentToEditor();
            view.style.display = "none";
            editor.style.display = "block";
            editBtn.textContent = "👁️ Vista previa";
            saveBtn.style.display = "inline-block";
        }
    }

    savePresentationContent() {
        const generalDesc = document.getElementById("editGeneralDescription").value;
        const endpoints = document.getElementById("editEndpoints").value;
        const features = document.getElementById("editFeatures").value;
        const tech = document.getElementById("editTech").value;

        // Guardar en localStorage
        const presentationData = {
            generalDescription: generalDesc,
            endpoints: endpoints,
            features: features,
            tech: tech,
            lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(
            "presentationContent",
            JSON.stringify(presentationData)
        );

        // Actualizar la vista
        this.updatePresentationView(presentationData);

        // Cambiar a modo vista
        this.toggleEditMode();

        // Mostrar notificación
        if (window.modals) {
            window.modals.showNotificationModal(
                "Éxito",
                "Documentación guardada correctamente",
                "success"
            );
        }
    }

    loadContentToEditor() {
        const savedData = JSON.parse(
            localStorage.getItem("presentationContent") || "{}"
        );

        document.getElementById("editGeneralDescription").value =
            savedData.generalDescription ||
            "SkillAgora es una plataforma de gestión de tareas y freelancing que permite organizar proyectos, gestionar tareas personalizadas y hacer seguimiento del progreso de desarrollo.";

        document.getElementById("editEndpoints").value =
            savedData.endpoints ||
            "GET /api/tasks - Obtiene todas las tareas del proyecto\nPOST /api/tasks - Crea una nueva tarea personalizada\nPUT /api/tasks/:id - Actualiza una tarea específica\nDELETE /api/tasks/:id - Elimina una tarea específica";

        document.getElementById("editFeatures").value =
            savedData.features ||
            "📊|Dashboard Interactivo|Visualización en tiempo real del progreso de tareas por categorías\n➕|Tareas Personalizadas|Crear, editar y eliminar tareas propias con subtareas y etiquetas\n🔍|Sistema de Filtros|Filtrar tareas por categoría, estado y tiempo estimado\n📈|Estadísticas|Métricas detalladas y estimaciones de finalización";

        document.getElementById("editTech").value =
            savedData.tech ||
            "Frontend: HTML5, CSS3, JavaScript ES6+\nAlmacenamiento: LocalStorage para persistencia de datos\nArquitectura: Módulos ES6, Sistema de componentes reutilizables\nUI/UX: Diseño responsivo, temas claro/oscuro";
    }

    updatePresentationView(data) {
        // Actualizar descripción general
        document.getElementById("generalDescription").textContent =
            data.generalDescription;

        // Actualizar endpoints
        const endpointsContainer = document.getElementById("endpointsContent");
        const endpointLines = data.endpoints
            .split("\n")
            .filter((line) => line.trim());
        endpointsContainer.innerHTML = endpointLines
            .map((line) => {
                const parts = line.split(" - ");
                if (parts.length >= 2) {
                    const methodPath = parts[0].split(" ");
                    const method = methodPath[0]?.toLowerCase() || "get";
                    const path = methodPath.slice(1).join(" ") || "/";
                    const description = parts.slice(1).join(" - ");

                    return `
                        <div class="endpoint-item">
                            <div class="endpoint-method ${method}">${method.toUpperCase()}</div>
                            <div class="endpoint-path">${path}</div>
                            <div class="endpoint-description">${description}</div>
                        </div>
                    `;
                }
                return "";
            })
            .join("");

        // Actualizar funcionalidades
        const featuresContainer = document.getElementById("featuresContent");
        const featureLines = data.features
            .split("\n")
            .filter((line) => line.trim());
        featuresContainer.innerHTML = featureLines
            .map((line) => {
                const parts = line.split("|");
                if (parts.length >= 3) {
                    return `
                        <div class="feature-card">
                            <div class="feature-icon">${parts[0]}</div>
                            <div class="feature-title">${parts[1]}</div>
                            <div class="feature-description">${parts[2]}</div>
                        </div>
                    `;
                }
                return "";
            })
            .join("");

        // Actualizar tecnologías
        const techContainer = document.getElementById("techContent");
        const techLines = data.tech.split("\n").filter((line) => line.trim());
        techContainer.innerHTML = techLines
            .map((line) => {
                const parts = line.split(": ");
                if (parts.length >= 2) {
                    return `
                        <div class="tech-item">
                            <span class="tech-name">${parts[0]}:</span>
                            <span class="tech-description">${parts.slice(1).join(": ")}</span>
                        </div>
                    `;
                }
                return "";
            })
            .join("");
    }

    // Cargar contenido guardado al inicializar
    loadSavedPresentationContent() {
        const savedData = JSON.parse(
            localStorage.getItem("presentationContent") || "{}"
        );
        if (Object.keys(savedData).length > 0) {
            this.updatePresentationView(savedData);
        }
    }
}

// Crear instancia y exportar
export const presentationManager = new PresentationManager();