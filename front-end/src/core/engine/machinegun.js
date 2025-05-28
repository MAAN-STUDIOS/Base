import { ShootingSystem } from "@engine/shootingSystem.js";

export class MachineGun {
    /**
     * @param options
     * @param [options.speed] - Velocidad del proyectil
     * @param [options.damage] - Daño por bala
     * @param [options.range] - Rango del proyectil
     * @param [options.cooldown]
     */
    constructor(options = {}) {
        this.config = {
            speed: options.speed || 9,
            damage: options.damage || 6,
            range: options.range || 700,
            projectileType: options.projectileType || "bullet",
            cooldown: options.cooldown || 0.1
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

        ShootingSystem.fire({
            origin: origin.clone(),
            direction: direction.clone(),
            weaponConfig: this.config,
            owner
        });

        this.cooldownTimer = 0;
    }
}
