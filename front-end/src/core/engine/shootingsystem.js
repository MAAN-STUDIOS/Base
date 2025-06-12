import { Projectile } from "@engine/projectile.js";

class ShootingSystemObj {
  constructor() {
    this.projectiles = [];
    this.ids = 0;
    this.onFire = () => {};
  }

  fire({ origin, direction, weaponConfig, owner, call = true }) {
    const proj = new Projectile({
      id: ++this.ids,
      position: origin.clone(),
      direction: direction.clone(),
      speed: weaponConfig.speed || 700,
      damage: weaponConfig.damage || 10,
      range: weaponConfig.range || 500,
      type: weaponConfig.projectileType || "bullet",
      owner,
    });

    this.projectiles.push(proj);
    if (call) this.onFire?.(proj);
  }

  updateAll(delta) {
    this.projectiles = this.projectiles.filter((p) => p && p.alive);

    for (const projectile of this.projectiles) {
      projectile?.update(delta);
    }
  }

  drawAll(ctx, pl) {
    for (const p of this.projectiles) {
      p.draw(ctx, pl);
    }
  }
}

const instance = globalThis.__shootingSystemInstance ?? new ShootingSystemObj();
globalThis.__shootingSystemInstance = instance;

export { instance as ShootingSystem };