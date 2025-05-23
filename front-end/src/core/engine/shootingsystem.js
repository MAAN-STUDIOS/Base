import { Projectile } from "@engine/projectile.js";


class ShootingSystemObj {
    constructor() {
        this.projectiles = [];
    }

    fire({ origin, direction, weaponConfig, owner }) {
        const proj = new Projectile({
            position: origin.clone(), //del jugador
            direction: direction.clone(),
            speed: weaponConfig.speed || 700,
            damage: weaponConfig.damage || 10,
            range: weaponConfig.range || 500,
            type: weaponConfig.projectileType || "bullet",
            owner
        });

        this.projectiles.push(proj);
    }

    updateAll(delta) {
        this.projectiles = this.projectiles.filter(p => p && p.alive);

        for (const projectile of this.projectiles) {
            projectile?.update(delta);
        }

    }

    drawAll(ctx) {
        for (const p of this.projectiles) {
            p.draw(ctx);
        }
    }
}

const instance = globalThis.__shootingSystemInstance ?? new ShootingSystemObj();
globalThis.__shootingSystemInstance = instance;

export { instance as ShootingSystem };