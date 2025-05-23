// import { LineOfSight } from "./lineOfSight.js";

import { Hitbox } from "@utils/hitbox.js";

const STATES = {
    IDLE: 'IDLE',
    PURSUE: 'PURSUE',
    SEARCH: 'SEARCH',
    ATTACK: 'ATTACK',
    RETREAT: 'RETREAT'
};

export class Enemy {
    constructor(config) {
        const {
            position,
            waypoints = [],
            homePoint,
            width = 32,
            height = 32,
            health = 100,
            speed = 200,
            damage = 1,
            chaseRadius = 300,
            attackRadius = 50,
            retreatHealthThreshold = 30,
            retreatDistance = 150
        } = config;

        this.position = position;
        this.prevPosition = position.clone();
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.damage = damage;

        this.state = STATES.IDLE;
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.homePoint = homePoint;
        this.lastKnownPlayerPos = null;
        this.searchTarget = null;
        this.stateTimer = 0;

        this.chaseRadius = chaseRadius;
        this.attackRadius = attackRadius;
        this.retreatHealthThreshold = retreatHealthThreshold;
        this.retreatDistance = retreatDistance;

        this.hitbox = new Hitbox(this);

        // this.lineOfSight = new LineOfSight(tileGrid, obstacles);
    }

    collidesWith(hb) {
        return this.hitbox.collidesWith(hb);
    }

    /**
     *
     * @param dt
     * @param {FloodPlayer} player
     */
    update(dt, player) {
        const playerWorldPos = player.real_position.clone();
        this.prevPosition = this.position.clone();
        
        // if (player.lastPosition && !player.lastPosition.equals(playerWorldPos)) {
        //     this.lineOfSight.updateLosCache(playerWorldPos);
        // }

        const distanceToPlayer = this.position.distanceTo(playerWorldPos);
        // const hasLosToPlayer = this.lineOfSight.hasLineOfSight(this.position, playerWorldPos);
        const hasLosToPlayer = true;

        switch (this.state) {
            case STATES.IDLE:
                this.updateIdle(dt, player, distanceToPlayer, hasLosToPlayer);
                break;
            case STATES.PURSUE:
                this.updatePursue(dt, player, distanceToPlayer, hasLosToPlayer);
                break;
            case STATES.SEARCH:
                this.updateSearch(dt, player, distanceToPlayer, hasLosToPlayer);
                break;
            case STATES.ATTACK:
                this.updateAttack(dt, player, distanceToPlayer, hasLosToPlayer);
                break;
            case STATES.RETREAT:
                this.updateRetreat(dt, player, distanceToPlayer, hasLosToPlayer);
                break;
        }

        this.stateTimer += dt;
    }

    /**
     *
     * @param {number} dt
     * @param {FloodPlayer} player
     * @param {number} distanceToPlayer
     * @param {boolean} hasLosToPlayer
     */
    updateIdle(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (this.waypoints.length > 0) {
            const targetWaypoint = this.waypoints[this.currentWaypointIndex];
            const direction = targetWaypoint.sub(this.position);
            
            if (direction.magnitude() < 5) {
                this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
            } else {
                this.moveTowards(direction, dt);
            }
        }

        if (distanceToPlayer <= this.chaseRadius && hasLosToPlayer) {
            this.transitionTo(STATES.PURSUE);
        } else if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }
    /**
     *
     * @param {number} dt
     * @param {FloodPlayer} player
     * @param {number} distanceToPlayer
     * @param {boolean} hasLosToPlayer
     */
    updatePursue(dt, player, distanceToPlayer, hasLosToPlayer) {
        const playerWorldPos = player.real_position.clone();

        if (hasLosToPlayer) {
            this.lastKnownPlayerPos = playerWorldPos.clone();

            if (distanceToPlayer <= this.attackRadius) {
                this.transitionTo(STATES.ATTACK);
            } else {
                const direction = playerWorldPos.sub(this.position);
                this.moveTowards(direction, dt);
            }
        } else {
            if (this.lastKnownPlayerPos) {
                const direction = this.lastKnownPlayerPos.sub(this.position);
                const distanceToLastKnown = direction.magnitude();

                if (distanceToLastKnown < 10 || this.stateTimer >= 5) {
                    this.transitionTo(STATES.SEARCH);
                } else {
                    this.moveTowards(direction, dt);
                }
            } else {
                this.transitionTo(STATES.SEARCH);
            }
        }

        if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updateSearch(dt, player, distanceToPlayer, hasLosToPlayer) {
        // const playerWorldPos = player.real_position.clone();
      
        // 1) Only resume PURSUE if we both see the player, and they're within chaseRadius
        if (hasLosToPlayer && distanceToPlayer <= this.chaseRadius) {
          this.transitionTo(STATES.PURSUE);
          return;
        }
      
        // 2) If we have no last known spot, go idle
        if (!this.lastKnownPlayerPos) {
          this.transitionTo(STATES.IDLE);
          return;
        }
      
        // 3) Timeout out of SEARCH after 5 seconds
        if (this.stateTimer >= 5) {
          this.lastKnownPlayerPos = null;
          this.searchTarget       = null;
          this.transitionTo(STATES.IDLE);
          return;
        }
      
        // 4) Pick a search tile if needed
        if (!this.searchTarget) {
          // this.searchTarget = this.lineOfSight.findNearestValidTile(
          //   this.position,
          //   this.lastKnownPlayerPos
          // );
        }
      
        // 5) If no tile is ever valid, bail to IDLE
        if (!this.searchTarget) {
          this.transitionTo(STATES.IDLE);
          return;
        }
      
        // 6) Move toward that tile
        const toTarget = this.searchTarget.sub(this.position);
        if (toTarget.magnitude() < 5) {
          this.searchTarget = null;  // reached it, wait for LOS or timeout
        } else {
          this.moveTowards(toTarget, dt);
        }
      
        // 7) Still retreat if health is low
        if (this.health <= this.retreatHealthThreshold) {
          this.transitionTo(STATES.RETREAT);
        }
      }

    // /**
    //  *
    //  * @param {number} dt
    //  * @param {FloodPlayer} player
    //  * @param {number} distanceToPlayer
    //  * @param {boolean} hasLosToPlayer
    //  */
    // updatePursue(dt, player, distanceToPlayer, hasLosToPlayer) {
    //     const playerWorldPos = player.real_position.clone();
    //
    //     // 1) If the player ran outside chaseRange, start SEARCH
    //     if (distanceToPlayer > this.chaseRadius) {
    //       this.transitionTo(STATES.SEARCH);
    //       return;
    //     }
    //
    //     // 2) If we still have LOS, pursue directly
    //     if (hasLosToPlayer) {
    //       this.lastKnownPlayerPos = playerWorldPos.clone();
    //       if (distanceToPlayer <= this.attackRadius) {
    //         this.transitionTo(STATES.ATTACK);
    //       } else {
    //         const direction = playerWorldPos.sub(this.position);
    //         this.moveTowards(direction, dt);
    //       }
    //       return;
    //     }
    //
    //     // 3) No LOS — head to last known spot for up to 5s
    //     if (this.lastKnownPlayerPos) {
    //       const toLast = this.lastKnownPlayerPos.sub(this.position);
    //       const distLast = toLast.magnitude();
    //       if (distLast < 10 || this.stateTimer >= 5) {
    //         this.transitionTo(STATES.SEARCH);
    //       } else {
    //         this.moveTowards(toLast, dt);
    //       }
    //     } else {
    //       // never saw the player? go straight to SEARCH
    //       this.transitionTo(STATES.SEARCH);
    //     }
    //
    //     // 4) Retreat if needed
    //     if (this.health <= this.retreatHealthThreshold) {
    //       this.transitionTo(STATES.RETREAT);
    //     }
    //   }
    //

    updateAttack(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (!hasLosToPlayer) {
            this.transitionTo(STATES.SEARCH);
            return;
        }

        if (distanceToPlayer > this.attackRadius) {
            this.transitionTo(STATES.PURSUE);
            return;
        }

        if (this.stateTimer >= 1) {
            player.takeDamage(this.damage);
            this.stateTimer = 0;
        }

        if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updateRetreat(dt, player, distanceToPlayer) {
        const playerWorldPos = player.real_position.clone();

        if (this.health > this.retreatHealthThreshold && distanceToPlayer > this.retreatDistance) {
            this.transitionTo(STATES.IDLE);
            return;
        }

        const direction = this.position.sub(playerWorldPos);
        this.moveTowards(direction, dt);
    }

    moveTowards(direction, dt) {
        const normalized = direction.normalize();
        this.position = this.position.add(normalized.mul(this.speed * dt));
    }

    transitionTo(newState) {
        this.state = newState;
        this.stateTimer = 0;
        this.searchTarget = null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    draw(ctx) {
        this.drawAtPosition(ctx, this.position.x, this.position.y);
    }

    drawAtPosition(ctx, screenX, screenY) {
        ctx.fillStyle = this.getStateColor();
        ctx.fillRect(screenX - this.width/2, screenY - this.height/2, this.width, this.height);

        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(
            screenX - healthBarWidth/2,
            screenY - this.height/2 - 10,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = 'green';
        ctx.fillRect(
            screenX - healthBarWidth/2,
            screenY - this.height/2 - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        ctx.strokeStyle = this.getStateColor();
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.chaseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    getStateColor() {
        switch (this.state) {
            case STATES.IDLE: return 'blue';
            case STATES.PURSUE: return 'orange';
            case STATES.SEARCH: return 'yellow';
            case STATES.ATTACK: return 'red';
            case STATES.RETREAT: return 'purple';
            default: return 'gray';
        }
    }
}
