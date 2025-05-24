import { GameObject } from "./gameobject";
import { Vector } from "../utils/vector.js";


export class Player extends GameObject {
    constructor({
                    position,
                    width,
                    height,
                    controlType = "player",
                    attackSlots = [null, null],
                    direction = new Vector(1, 0),
                } = {}) {
        super({ position, width, height });

        this.controlType = controlType;   // "player" o "ai"
        this.attackSlots = attackSlots;   // Dos ranuras de arma
        this.activeSlot = 0;              // Índice 0 o 1
        this.direction = direction;       // Dirección de ataque/mirada
    }

    interact(obj) {
        if (obj && typeof obj.onInteract === "function") {
            obj.onInteract(this);
        }
    }

    attack() {
        const weapon = this.attackSlots[this.activeSlot];
        if (!weapon || typeof weapon.fire !== "function") return;

        let direction = this.direction.clone();
        if (direction.x === 0 && direction.y === 0 && this.lastDirection) {
            direction = this.lastDirection.clone();
        }
        if (direction.x === 0 && direction.y === 0) {
            console.warn("No direction to fire");
            return;
        }
        
        direction.normalize(); 
        weapon.fire(this.real_position.clone(), direction, this);
    }
}
