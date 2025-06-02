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
        this.lastKnownTargetPos = null; // FIXED: Changed from lastKnownPlayerPos
        this.searchTarget = null;
        this.stateTimer = 0;

        this.chaseRadius = chaseRadius;
        this.attackRadius = attackRadius;
        this.retreatHealthThreshold = retreatHealthThreshold;
        this.retreatDistance = retreatDistance;

        this.hitbox = new Hitbox(this);
    }

    collidesWith(hb) {
        return this.hitbox.collidesWith(hb);
    }

    /**
     * @param dt
     * @param {FloodPlayer} player
     * @param {Array<FloodClone>} clones
     */
    update(dt, player, clones = []) {
        this.prevPosition = this.position.clone();
        
        // Find nearest target (player or clone)
        const nearestTarget = this.findNearestTarget(player, clones);
        const currentTarget = nearestTarget ? nearestTarget.target : player;
        const currentTargetPos = nearestTarget ? nearestTarget.position : player.real_position;
        const distanceToTarget = nearestTarget ? nearestTarget.distance : this.position.distanceTo(player.real_position);
        
        const hasLosToTarget = true; 
        
        switch (this.state) {
            case STATES.IDLE:
                this.updateIdle(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos);
                break;
            case STATES.PURSUE:
                this.updatePursue(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos);
                break;
            case STATES.SEARCH:
                this.updateSearch(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos);
                break;
            case STATES.ATTACK:
                this.updateAttack(dt, player, clones);
                break;
            case STATES.RETREAT:
                this.updateRetreat(dt, player, distanceToTarget);
                break;
        }
        
        this.stateTimer += dt;
    }

    /**
     * Find the nearest target (player or clone) within chase radius
     * @param {FloodPlayer} player 
     * @param {FloodClone[]} clones 
     * @returns {Object|null} - {target, position, distance}
     */
    findNearestTarget(player, clones = []) {
        const targets = [
            { target: player, position: player.real_position, type: 'player' }
        ];
        
        // Add clones as potential targets
        clones.forEach(clone => {
            if (clone && !clone.isDead && clone.real_position) {
                targets.push({ 
                    target: clone, 
                    position: clone.real_position, 
                    type: 'clone' 
                });
            }
        });
        
        let nearestTarget = null;
        let nearestDistance = Infinity;
        
        targets.forEach(({ target, position, type }) => {
            const distance = this.position.distanceTo(position);
            if (distance <= this.chaseRadius && distance < nearestDistance) {
                nearestTarget = { target, position, distance, type };
                nearestDistance = distance;
            }
        });
        
        return nearestTarget;
    }

    updateIdle(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos) {
        if (this.waypoints.length > 0) {
            const targetWaypoint = this.waypoints[this.currentWaypointIndex];
            const direction = targetWaypoint.sub(this.position);
            
            if (direction.magnitude() < 5) {
                this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
            } else {
                this.moveTowards(direction, dt);
            }
        }
    
        if (distanceToTarget <= this.chaseRadius && hasLosToTarget) {
            this.lastKnownTargetPos = currentTargetPos.clone();
            this.transitionTo(STATES.PURSUE);
        } else if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updatePursue(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos) {
        if (hasLosToTarget && currentTargetPos) {
            this.lastKnownTargetPos = currentTargetPos.clone();
    
            if (distanceToTarget <= this.attackRadius) {
                this.transitionTo(STATES.ATTACK);
            } else {
                const direction = currentTargetPos.sub(this.position);
                this.moveTowards(direction, dt);
            }
        } else {
            if (this.lastKnownTargetPos) {
                const direction = this.lastKnownTargetPos.sub(this.position);
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

    updateSearch(dt, currentTarget, distanceToTarget, hasLosToTarget, currentTargetPos) {
        // Resume PURSUE if we see any target within chase radius
        if (hasLosToTarget && distanceToTarget <= this.chaseRadius) {
            this.transitionTo(STATES.PURSUE);
            return;
        }

        // If we have no last known spot, go idle
        if (!this.lastKnownTargetPos) {
            this.transitionTo(STATES.IDLE);
            return;
        }

        // Timeout out of SEARCH after 5 seconds
        if (this.stateTimer >= 5) {
            this.lastKnownTargetPos = null;
            this.searchTarget = null;
            this.transitionTo(STATES.IDLE);
            return;
        }

        // Set search target if we don't have one
        if (!this.searchTarget) {
            this.searchTarget = this.lastKnownTargetPos.clone(); // FIXED: Set search target
        }

        const toTarget = this.searchTarget.sub(this.position);
        if (toTarget.magnitude() < 5) {
            this.searchTarget = null;  // reached it, wait for LOS or timeout
        } else {
            this.moveTowards(toTarget, dt);
        }

        if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updateAttack(dt, player, clones = []) {
        // Find all targets within attack range
        const targets = [
            { obj: player, pos: player.real_position }
        ];
        
        // Add clones within attack range
        clones.forEach(clone => {
            if (clone && !clone.isDead && clone.real_position) {
                targets.push({ obj: clone, pos: clone.real_position });
            }
        });

        // Check if any target is within attack range
        const targetsInRange = targets.filter(({ pos }) => 
            this.position.distanceTo(pos) <= this.attackRadius
        );

        if (targetsInRange.length === 0) {
            this.transitionTo(STATES.PURSUE);
            return;
        }

        // Attack all targets in range
        if (this.stateTimer >= 1) {
            targetsInRange.forEach(({ obj, pos }) => {
                obj.takeDamage(this.damage);
                console.log("Enemy hit:", obj.constructor.name, "new health:", obj.health);
            });
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