import { GameObject } from "./gameobject";
import { Vector } from "../utils/vector.js";
import logger from "@utils/logger.js";


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
        this.real_position = position || Vector.zero();
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
    }

    get world_position() {
        return this.real_position.clone();
    }


    interact(obj) {
        if (obj && typeof obj.onInteract === "function") {
            obj.onInteract(this);
        }
    }

    attack() {
        const weapon = this.attackSlots[this.activeSlot];
        if (weapon && typeof weapon.fire === "function") {
            weapon.fire(this.position, this.direction);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            // TODO: Handle player death
            logger.debug("Player died!");
            this.die();
        }
    }

    die() {
        this.isDead = true;
        logger.debug("Player died! Respawning in 3 seconds...");
    }
}
