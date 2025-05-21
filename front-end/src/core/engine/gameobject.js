"use strict";
import { Vector } from "@utils/vector.js";
import { hitbox } from "@utils/hitbox.js";
import { Player } from "@engine/objectplayer.js";


export class GameObject {
    constructor(options = {}) {
        this.position = options.position || new Vector(0, 0);
        this.width = options.width || 0;
        this.height = options.height || 0;
        this.hitbox = options.hitbox || hitbox(this);
        this.destroyImage = options.destroyImage || null;
        this.spriteImage = null;
        this.color = options.color || "red"; // para el test
    }

    //METHODS
    draw(ctx) {
        if (this.spriteImage) {
            ctx.drawImage(this.spriteImage, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        if (window.DEBUG_MODE) {
            this.drawBoundingBox(ctx);
            this.hitbox.drawDebug(ctx);
        }
    }
    collidesWith(other) {
        if (this.hitbox.collidesWith(other.hitbox)) {
            return true;
        }
        return false;
    }
    // For debugging purposes
    drawBoundingBox(ctx) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
    
    onDestroy(ctx) {
       
        if (this.destroyImage) {
            ctx.drawImage(this.destroyImage, this.position.x, this.position.y, this.width, this.height);
        }
        
        
        ctx.clearRect(this.position.x, this.position.y, this.width, this.height);
        
        if (this.hitbox) {
            this.hitbox.clear();
        }
        
        this.spriteImage = null;
        this.position = null;
        this.width = null;
        this.height = null;
        this.hitbox = null;
        this.destroyImage = null;
        
        // Opcional: Facilitar la recolección de basura
        // Eliminar referencias circulares y listeners
        // this.removeAllEventListeners(); //  EJ
    }
    isVisible(viewport){
        if (this.position.x + this.width < viewport.x || this.position.x > viewport.x + viewport.width ||
            this.position.y + this.height < viewport.y || this.position.y > viewport.y + viewport.height) {
            return false;
        }
        return true;
    }
    setSprite(imagePath, rect) {
        this.spriteImage = new Image();
        this.spriteImage.src = imagePath;
        if (rect) {
            this.spriteRect = rect;
        }
    }

    serialize() {
        return {
            position: this.position,
            width: this.width,
            height: this.height,
            hitbox: this.hitbox,
            sprite: this.spriteImage,
            destroyImage: this.destroyImage
        };
    }
    update(delta) {
        // TODO:Method to be implemented
       
    }
}
