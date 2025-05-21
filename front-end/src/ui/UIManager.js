"use strict";

export class UIManager{
    constructor(){
        //Interfaces actualmente visibles -> {Map<string, UIElement>}
        this.activeInterfaces = new Map();

        //Plantillas predefinidas de UI -> {Map<string, UITemplate>}
        this.templates = new Map();

        //Manejo de superposición de elementos (eje z)
        this.zCounter = 0;

        //Idioma
        this.currentLanguage = "es";

        //Contenedor base del UI
        this.root = document.getElementById("ui-root") || this.createUIRoot();

        //Sistema de eventos para interacciones del usuario -> {Map<string, Set<Function>}
        this.listeners = new Map();
    }

    //Mostrar elemento por su id ydata
    showElement(id, data = {}) {
        const template = this.templates.get(id);
        if (!template) {
            console.warn(`UIManager: Template "${id}" no encontrada.`);
            return;
        }

        const element = template.createElement(data, this.currentLanguage);
        //Transición de entrada
        element.classList.add("ui-fade-in");
        element.style.zIndex = this.zCounter++;
        this.root.appendChild(element);

        this.activeInterfaces.set(id, element);
    }

    //Ocultar elemento por su id
    hideElement(id) {
        const element = this.activeInterfaces.get(id);
        if (element) {
            //Transición de salida
            element.classList.add("ui-fade-out");
            setTimeout(() => {
                element.remove();
            }, 300);
            this.activeInterfaces.delete(id);
        }
    }

    //Actualizar elemento por su id 
    updateElement(id, data) {
        const element = this.activeInterfaces.get(id);
        if (element && typeof element.update === "function") {
            element.update(data);
        }
    }

    //Nueva plantilla -> crear interfaces con componentes reutilizables
    registerTemplate(id, template) {
        this.templates.set(id, template);
    }

    //Cambiar idioma
    setLanguage(lang) {
        this.currentLanguage = lang;
    }

    //Contenedor base
    createUIRoot(){
        const root = document.createElement("div");
        root.id = "ui-root";
        document.body.appendChild(root);
        return root;
    }

    //Sistema de interaccion de eventos
    
}