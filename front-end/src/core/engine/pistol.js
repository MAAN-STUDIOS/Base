import { ShootingSystem } from "@engine/shootingSystem.js";


export class Pistol {
    /**
     *
     * @param options
     * @param [options.speed]
     * @param [options.damage]
     * @param [options.range]
     * @param [options.projectileType]
     * @param [options.cooldown]
     */
    constructor(options = {}) {
        this.config = {
            speed: options.speed || 7,
            damage: options.damage || 15,
            range: options.range || 600,
            projectileType: options.projectileType || "bullet",
            cooldown: options.cooldown || 0.3
        };
    }

    fire(origin, direction, owner = null) {
        ShootingSystem.fire({
            origin,
            direction,
            weaponConfig: this.config,
            owner
        });
    }
}
