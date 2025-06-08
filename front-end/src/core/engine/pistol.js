import { ShootingSystem } from "@engine/shootingsystem.js";


export class Pistol {
    /**
     *
     * @param options
     * @param [options.speed]
     * @param [options.damage]
     * @param [options.range]
     * @param [options.projectileType]
     * @param [options.cooldown] tiempo que debe pasar entre disparos
     */
    constructor(options = {}) {
        this.config = {
            speed: options.speed || 130,
            damage: options.damage || 15,
            range: options.range || 600,
            projectileType: options.projectileType || "bullet",
            cooldown: options.cooldown || 5
        };
        this.cooldownTimer = this.config.cooldown;
    }

    update(dt) {
        this.cooldownTimer += dt; //contador que acumula el tiempo transcurrido
      }

    fire(origin, direction, owner = null) {
        console.log(this.cooldownTimer);
        if (this.cooldownTimer < this.config.cooldown){
            console.log('En cooldown');
            return;
        }

        ShootingSystem.fire({
            origin,
            direction,
            weaponConfig: this.config,
            owner
        });

        this.cooldownTimer = 0;
    }
}
