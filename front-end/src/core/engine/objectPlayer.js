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
        this.real_position = position|| Vector.zero();
    }

    get world_position() {
        return this.real_position.clone();
    }


    interact(obj) {
        if (obj && typeof obj.onInteract === "function") {
            obj.onInteract(this);
        }
    }
}
