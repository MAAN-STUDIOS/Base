import { ShootingSystem } from "@engine/shootingsystem.js";
import { Vector } from "@utils/vector.js";

export class Shotgun {
    /**
     * @param options
     * @param [options.speed] - Velocidad de los proyectiles
     * @param [options.damage] - Daño por proyectil
     * @param [options.range] - Rango del disparo
     * @param [options.projectileCount] - Cuántos proyectiles por disparo
     * @param [options.spread] - Grado de dispersión angular
     * @param [options.cooldown]
     */
    constructor(options = {}) {
        this.config = {
            speed: options.speed || 120,
            damage: options.damage || 10,
            range: options.range || 400,
            projectileType: options.projectileType || "pellet",
            projectileCount: options.projectileCount || 2,
            spread: options.spread || 15, 
            cooldown: options.cooldown || 10
        };
        this.cooldownTimer = this.config.cooldown;
    }

    update(dt) {
        this.cooldownTimer += dt;
    }

    fire(origin, direction, owner = null) {
        if (this.cooldownTimer < this.config.cooldown){
            console.log('En cooldown');
            return;
        }

        const baseAngle = Math.atan2(direction.y, direction.x);
        const spreadInRadians = (this.config.spread * Math.PI) / 180;


        for (let i = 0; i < this.config.projectileCount; i++) {
            const spreadOffset = (Math.random() - 0.5) * spreadInRadians;
            const angle = baseAngle + spreadOffset;

            const dir = new Vector(Math.cos(angle), Math.sin(angle)).normalize();

            ShootingSystem.fire({
                origin: origin.clone(),
                direction: dir,
                weaponConfig: this.config,
                owner
            });
        }
        this.cooldownTimer = 0;
    }
}
