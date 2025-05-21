"use strict";

import { GameObject } from "./gameobject.js";
import { Hitbox } from "@utils/hitbox.js";

/**
 * FR-005: ObjectStructure representa objetos estáticos como paredes o puertas
 * que bloquean el paso del jugador u otras entidades.
 */
export class ObjectStructure extends GameObject {
  constructor(options = {}) {
    super(options);

    // Este objeto debe bloquear movimiento
    this.isBlocking = true;

    // Sobrescribir hitbox con comportamiento físico
    this.hitbox = new Hitbox(this);

    // Propiedades opcionales
    this.destructible = options.destructible || false;
    this.locked = options.locked || false;
    this.animation = options.animation || null;

    this.state = "intact"; // "broken", "opened"
  }

  /**
   * Dibuja la estructura. Usa animación si está disponible.
   */
  draw(ctx) {
    if (this.animation && typeof this.animation.play === "function") {
      this.animation.play(ctx, this.position);
    } else {
      // Default visual
      ctx.fillStyle = this.destructible ? "#555" : "#888";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    if (window.DEBUG_MODE) {
      this.hitbox.drawDebug(ctx);
    }
  }

  /**
   * Actualiza animación si existe
   */
  update(dt) {
    if (this.animation && typeof this.animation.update === "function") {
      this.animation.update(dt);
    }
  }

  /**
   * Rompe la estructura si es destructible
   */
  destroy() {
    if (this.destructible && this.state !== "broken") {
      this.state = "broken";
      this.isBlocking = false;
      // TODO:Lógica visual podría ir aquí
    }
  }

  /**
   * Desbloquea la estructura si es una puerta cerrada
   */
  unlock() {
    if (this.locked) {
      this.locked = false;
      // TODO: Trigger de animación de puerta abierta
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      isBlocking: this.isBlocking,
      destructible: this.destructible,
      locked: this.locked,
      state: this.state
    };
  }
}
