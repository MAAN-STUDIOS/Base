import { ShootingSystem } from "./shootingSystem.js";

export class Pistol {
    constructor() {
        this.config = {
            speed: 700,
            damage: 15,
            range: 600,
            projectileType: "bullet"
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
