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
    }

    fire(origin, direction, owner = null) {
        ShootingSystem.fire({
            origin: origin.clone(),
            direction: direction.clone(),
            weaponConfig: this.config,
            owner
        });
    }
}
