// @weapons/flamethrower.js
import { ShootingSystem } from "@engine/shootingsystem.js";
import { Vector } from "@utils/vector.js";

export class Flamethrower {
    constructor(options = {}) {
        this.config = {
            speed: options.speed || 5,
            damage: options.damage || 3,
            range: options.range || 200,
            projectileType: options.projectileType || "flame",
            projectileCount: options.projectileCount || 4,
            spread: options.spread || 0.4,
            cooldown: options.cooldown || 5
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

        for (let i = 0; i < this.config.projectileCount; i++) {
            const offset = (Math.random() - 0.5) * this.config.spread;
            const angle = baseAngle + offset;
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
