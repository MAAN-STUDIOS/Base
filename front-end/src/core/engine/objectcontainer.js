"use strict";
import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";
import { Vector } from "@utils/vector.js";
import { ObjectItem } from "./objectitem.js";

// Nota: Si continúa el error, copia el contenido de objectitem-fixed.js a objectitem.js

export class ObjectContainer extends GameObject {
    constructor(options = {}) {
        super(options);
        
        this.containerType = options.containerType || "crate";
        this.isLocked = options.isLocked || false;
        this.isOpen = false;
        this.wasLooted = false;
        this.contents = options.contents || [];
        this.capacity = options.capacity || 10;
        this.faction = options.faction || "neutral";
        
        this.openSprite = options.openSprite || null; 
        this.closedSprite = options.closedSprite || null;
        this.currentSprite = this.closedSprite;
        
        this.hitbox = new Hitbox(this);
        this.interactionRadius = options.interactionRadius || 50;
    }

    open(player = null) {
        if (this.isLocked) {
            return false;
        }

        if (this.isOpen) {
            return true;
        }

        this.isOpen = true;
        this.currentSprite = this.openSprite;
        return true;
    }

    close() {
        if (!this.isOpen) {
            return true;
        }

        this.isOpen = false;
        this.currentSprite = this.closedSprite;
        return true;
    }

    lock() {
        if (this.isLocked) {
            return true;
        }

        this.isLocked = true;
        
        if (this.isOpen) {
            this.close();
        }
        
        return true;
    }

    unlock(key = null) {
        if (!this.isLocked) {
            return true;
        }

        this.isLocked = false;
        return true;
    }

    addItem(item) {
        if (this.contents.length >= this.capacity) {
            return false;
        }

        this.contents.push(item);
        return true;
    }

    removeItem(item) {
        const index = this.contents.indexOf(item);
        if (index === -1) {
            return null;
        }

        const removedItem = this.contents.splice(index, 1)[0];
        
        if (this.contents.length === 0) {
            this.wasLooted = true;
        }
        
        return removedItem;
    }

    transferItem(item, targetContainer) {
        const removedItem = this.removeItem(item);
        if (!removedItem) {
            return false;
        }

        const success = targetContainer.addItem(removedItem);
        if (!success) {
            this.addItem(removedItem);
            return false;
        }

        return true;
    }

    generateContent() {
        this.contents = [];
        
        const itemCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < itemCount; i++) {
            const itemType = this.getRandomItemType();
            const item = new ObjectItem({
                type: itemType,
                position: new Vector(0, 0),
                width: 20,
                height: 20
            });
            
            this.addItem(item);
        }
    }

    getRandomItemType() {
        const types = ["ammo", "medkit", "weapon", "keycard"];
        
        if (this.faction === "flood") {
            types.push("biomass", "spore");
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }

    draw(ctx) {
        if (this.currentSprite) {
            ctx.drawImage(this.currentSprite, this.position.x, this.position.y, this.width, this.height);
        } else {
            let fillColor;
            switch (this.containerType) {
                case "crate": fillColor = "#8B4513"; break;
                case "locker": fillColor = "#708090"; break;
                case "corpse": fillColor = this.faction === "flood" ? "#8b0000" : "#696969"; break;
                default: fillColor = "#A9A9A9";
            }
            
            ctx.fillStyle = fillColor;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            
            ctx.fillStyle = this.isOpen ? "#00FF00" : "#FF0000";
            ctx.fillRect(this.position.x + 5, this.position.y + 5, 5, 5);
            
            if (this.isLocked) {
                ctx.fillStyle = "#FFD700";
                ctx.beginPath();
                ctx.arc(this.position.x + this.width - 10, this.position.y + 10, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    onInteract(player) {
        if (this.isLocked) {
            this.unlock();
        } else if (!this.isOpen) {
            this.open(player);
        } else {
            this.close();
        }
    }
}

export class FloodContainer extends ObjectContainer {
    constructor(options = {}) {
        options.faction = "flood";
        options.containerType = options.containerType || "organic";
        super(options);
        
        this.biomassAmount = options.biomassAmount || 0;
    }
    
    extractBiomass(player) {
        if (!this.isOpen) {
            this.open(player);
        }
        
        const amount = this.biomassAmount;
        this.biomassAmount = 0;
        this.wasLooted = true;
        
        return amount;
    }
    
    generateContent() {
        super.generateContent();
        this.biomassAmount = Math.floor(Math.random() * 30 + 10);
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        if (this.biomassAmount > 0) {
            ctx.font = "12px monospace";
            ctx.fillStyle = "#8b0000";
            ctx.fillText(
                `Biomass: ${this.biomassAmount}`,
                this.position.x,
                this.position.y - 20
            );
        }
    }
}