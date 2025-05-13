import { GameObject } from "./gameobject";

const PLAYER_SPEED = 5;
const MAX_HEALTH = 100;
const WEAPON_DAMAGE = {
    pistola: 10,
    granada: 30
};
const PISTOL_RANGE = 500; // Rango máximo de la pistola

class Player extends GameObject {
    constructor(position, width, height, color) {
        super(position, width, height, color);
        this.health = 100;
        this.attackSlots = ["pistola", "granada"]; // Ejemplo de slots de ataque
        this.hitbox = { // Hitbox representando el área de colisión
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }

    // Mover al jugador en una dirección
    move(dir) {
        const directions = {
            up: new Vector(0, -1),
            down: new Vector(0, 1),
            left: new Vector(-1, 0),
            right: new Vector(1, 0),
            //diagonales
            "up-left": new Vector(-1, -1),
            "up-right": new Vector(1, -1),
            "down-left": new Vector(-1, 1),
            "down-right": new Vector(1, 1)
        }

        let moveVector = directions[dir];

        //Usar la normalizacion para que la velocidad sea constante -> que no sea mayor en diagonales
        moveVector = moveVector.normalize().mul(PLAYER_SPEED);

        this.position = this.position.add(moveVector);

        // Actualizamos el hitbox al mover
        this.hitbox = hitbox(this);
    }

    // Interactuar con un objeto
    interact(obj) {
        console.log(`Interacting with ${obj}`);
    }

    // Atacar 
    attack(target) {
        if (this.attackSlots[0] === "pistola") {
            this.shoot(target);
        } else if (this.attackSlots[0] === "granada") {
            this.throwGrenade(target);
        }
    }

    shoot(target) {
        // Calcular la distancia entre el jugador y el objetivo
        const dx = target.position.x - this.position.x;
        const dy = target.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Solo disparar si el objetivo está dentro del rango
        if (distance <= PISTOL_RANGE) {
            target.takeDamage(WEAPON_DAMAGE.pistola);
        } else {
            console.log("Objetivo fuera de rango");
        }
    }

    throwGrenade(target) {
        // Lógica para lanzar granada
    }

    // Método de colisión con enemigos o estructuras
    checkCollisions(objects) {
        for (let obj of objects) {
            if (this.checkCollision(obj)) {
                console.log("Collision detected with", obj);
                // Lógica de qué hacer en caso de colisión
            }
        }
    }
}

