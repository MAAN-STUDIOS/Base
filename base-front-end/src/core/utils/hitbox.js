"use strict";


export class Hitbox {
    /**
     * Constructor de la hitbox
     * @param {GameObject} gameObject - El GameObject al que pertenece esta hitbox
     * @param {number} offsetX - Desplazamiento X de la hitbox con respecto a la posición del GameObject
     * @param {number} offsetY - Desplazamiento Y de la hitbox con respecto a la posición del GameObject
     * @param {number} width - Ancho de la hitbox (si es null, usa el ancho del GameObject)
     * @param {number} height - Alto de la hitbox (si es null, usa el alto del GameObject)
     */

    constructor(gameObject, offsetX = 0, offsetY = 0, width = null, height = null) {

        this.gameObject = gameObject;
        this.offsetX = offsetX;
        this.offsetY = offsetY;


        this._width = width;
        this._height = height;

        this.isPhysical = true;
        this.isLogical = true;
    }


    get x() {
        return this.gameObject.position.x;
    }


    get y() {
        return this.gameObject.position.y;
    }


    get width() {
        return this._width !== null ? this._width : this.gameObject.width;
    }


    set width(value) {
        this._width = value;
    }


    get height() {
        return this._height !== null ? this._height : this.gameObject.height;
    }


    set height(value) {
        this._height = value;
    }

    /**
     * Verifica si esta hitbox intersecta con otra hitbox
     * @param {Hitbox} hitbox - La otra hitbox con la que verificar colisión
     * @returns {boolean} - True si hay colisión, false si no
     */
    intersects(hitbox) {
        const actualX = this.x + this.offsetX;
        const actualY = this.y + this.offsetY;
        const otherActualX = hitbox.x + hitbox.offsetX;
        const otherActualY = hitbox.y + hitbox.offsetY;

        return actualX < otherActualX + hitbox.width &&
            actualX + this.width > otherActualX &&
            actualY < otherActualY + hitbox.height &&
            actualY + this.height > otherActualY;
    }


    collidesWith(hitbox) {
        return this.intersects(hitbox);
    }

    /**
     * Verifica si esta hitbox contiene un punto específico
     * @param {Object} point - Objeto con propiedades x e y
     * @returns {boolean} - True si el punto está dentro de la hitbox, false si no
     */
    contains(point) {
        const actualX = this.x + this.offsetX;
        const actualY = this.y + this.offsetY;

        return point.x >= actualX &&
            point.x < actualX + this.width &&
            point.y >= actualY &&
            point.y < actualY + this.height;
    }

    /**
     * Mueve la hitbox y el GameObject a una nueva posición
     * @param {number} x - Nueva posición X
     * @param {number} y - Nueva posición Y
     */
    moveTo(x, y) {
        // Esto mueve todo el GameObject
        this.gameObject.position.x = x;
        this.gameObject.position.y = y;
    }

    /**
     * Ajusta el offset de la hitbox
     * @param {number} offsetX - Nuevo offset X
     * @param {number} offsetY - Nuevo offset Y
     */
    setOffset(offsetX, offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    /**
     * Dibuja la hitbox en modo debug
     * @param {CanvasRenderingContext2D} ctx - Contexto de canvas
     * @param {string} physicalColor - Color para hitbox física
     * @param {string} logicalColor - Color para hitbox lógica
     */
    drawDebug(ctx, physicalColor = "red", logicalColor = "blue") {
        const actualX = this.x + this.offsetX;
        const actualY = this.y + this.offsetY;

        ctx.save();

        // Dibujar hitbox física
        if (this.isPhysical) {
            ctx.strokeStyle = physicalColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(actualX, actualY, this.width, this.height);
        }

        // Dibujar hitbox lógica (si es diferente de la física)
        if (this.isLogical && this.isLogical !== this.isPhysical) {
            ctx.strokeStyle = logicalColor;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(actualX, actualY, this.width, this.height);
        }

        ctx.restore();
    }

    /**
     * Actualiza el tamaño de la hitbox
     * @param {number} width - Nuevo ancho (o null para usar el del GameObject)
     * @param {number} height - Nuevo alto (o null para usar el del GameObject)
     */
    resize(width, height) {
        this._width = width;
        this._height = height;
    }

    /**
     * Cambia el GameObject al que está asociada la hitbox
     * @param {GameObject} gameObject - Nuevo GameObject
     */
    setGameObject(gameObject) {
        this.gameObject = gameObject;
    }


    
    clear() {

        const gameObjectRef = this.gameObject;

       
        if (gameObjectRef) {
            // Si estamos en un motor con un sistema de eventos
            // podríamos desuscribirnos de eventos aquí
            // gameObjectRef.offAllEvents(this);
        }

        
        this.gameObject = null;
        this._width = 0;
        this._height = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPhysical = false;
        this.isLogical = false;
    }

    /**
     * Clona la hitbox (asociada a un nuevo GameObject si se proporciona)
     * @param {GameObject} newGameObject - Nuevo GameObject (opcional)
     * @returns {Hitbox} - Nueva instancia de Hitbox
     */
    clone(newGameObject = null) {
        const target = newGameObject || this.gameObject;
        const cloned = new Hitbox(target, this.offsetX, this.offsetY, this._width, this._height);
        cloned.isPhysical = this.isPhysical;
        cloned.isLogical = this.isLogical;
        return cloned;
    }

    /**
     * Serializa la hitbox a un objeto plano
     * @returns {Object} - Representación serializada
     */
    serialize() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            isPhysical: this.isPhysical,
            isLogical: this.isLogical
        };
    }
}

/**
 * Función factory para crear hitbox ligada al GameObject
 * @param {GameObject} gameObject - GameObject al que pertenece la hitbox
 * @param {number} offsetX - Offset X (opcional)
 * @param {number} offsetY - Offset Y (opcional)
 * @param {number} width - Ancho personalizado (opcional)
 * @param {number} height - Alto personalizado (opcional)
 * @returns {Hitbox} - Nueva instancia de Hitbox
 */
export function hitbox(gameObject, offsetX = 0, offsetY = 0, width = null, height = null) {
    return new Hitbox(gameObject, offsetX, offsetY, width, height);
}