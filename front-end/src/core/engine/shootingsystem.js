import { Projectile } from "./projectile.js";

export const ShootingSystem = {
    projectiles: [],

    fire({ origin, direction, weaponConfig, owner }) {
        const proj = new Projectile({
            position: origin.clone(),
            direction: direction.clone(),
            speed: weaponConfig.speed || 700,
            damage: weaponConfig.damage || 10,
            range: weaponConfig.range || 500,
            type: weaponConfig.projectileType || "bullet",
            owner
        });

        this.projectiles.push(proj);
    },

    updateAll(delta) {
        this.projectiles = this.projectiles.filter(p => p.alive);
        for (const p of this.projectiles) {
            p.update(delta);
        }
    },

    drawAll(ctx) {
        for (const p of this.projectiles) {
            p.draw(ctx);
        }
    }
};
