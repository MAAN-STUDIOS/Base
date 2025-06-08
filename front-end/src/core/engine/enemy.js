import { Hitbox } from "@utils/hitbox.js";
import SpriteSheet from "@/assets/enemy/enemy.png";
import { floodEnemy } from "@engine/playerAnimation.js";
import { humanEnemy } from "@engine/playerAnimation.js";
import { Rect } from "@utils/rectangle.js";
import { Vector } from "@utils/vector.js";

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
            retreatDistance = 150,
        } = config;

        this.enemyType = config.type || 'flood'

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
        this.lastKnownTargetPos = null;
        this.searchTarget = null;
        this.stateTimer = 0;
        this.id = null;

        this.chaseRadius = chaseRadius;
        this.attackRadius = attackRadius;
        this.retreatHealthThreshold = retreatHealthThreshold;
        this.retreatDistance = retreatDistance;

        this.hitbox = new Hitbox(this);

        this.img = new Image();
        this.img.src = SpriteSheet;

        this.spriteRect = new Rect(0, 0, 153, 153);
        this.previousState = STATES.IDLE;
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.repeat = true;
        this.frameDuration = 100;
        this.totalTime = 0;
        this.sheetCols = 6;

        this._idleRandomTimer = 0;
        this._idleRandomInterval = null;
    }

    collidesWith(hb) {
        return this.hitbox.collidesWith(hb);
    }

    setAnimation(minFrame, maxFrame, repeat, duration) {
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
        this.repeat = repeat;
        this.totalTime = 0;
        this.frameDuration = duration * 1000;
    }
    
    updateFrame(deltaTime) {
        this.totalTime += deltaTime;
    
        if (this.totalTime > this.frameDuration) {
            const restartFrame = this.repeat ? this.minFrame : this.frame;
            this.frame = this.frame < this.maxFrame ? this.frame + 1 : restartFrame;
    
            this.spriteRect.x = this.frame % this.sheetCols;
            this.spriteRect.y = Math.floor(this.frame / this.sheetCols);
    
            this.totalTime = 0;
        }
    }

    setMovementAnimation() {
        const stateAnimations = this.enemyType === 'flood'
        ? {
            [STATES.IDLE]: floodEnemy.idle,
            [STATES.PURSUE]: floodEnemy.pursue,
            [STATES.SEARCH]: floodEnemy.search,
            [STATES.ATTACK]: floodEnemy.attack,
            [STATES.RETREAT]: floodEnemy.retreat
        }
        : {
            [STATES.IDLE]: humanEnemy.idle,
            [STATES.PURSUE]: humanEnemy.pursue,
            [STATES.SEARCH]: humanEnemy.search,
            [STATES.ATTACK]: humanEnemy.attack,
            [STATES.RETREAT]: humanEnemy.retreat
        };
        
        const anim = stateAnimations[this.state];
    
        if (this.state !== this.previousState) {
            this.setAnimation(...anim.frames, anim.repeat, anim.duration);
            this.previousState = this.state;
        }
    }
    

    /**
     * @param dt
     * @param {FloodPlayer} player
     * @param {Array<FloodClone>} clones
     */
    update(dt, player, clones = []) {
        this.prevPosition = this.position.clone();
        
        const nearestTarget = this.findNearestTarget(player, clones);
        const currentTarget = nearestTarget ? nearestTarget.target : player;
        const currentTargetPos = nearestTarget ? nearestTarget.position : player.real_position;
        const distanceToTarget = nearestTarget ? nearestTarget.distance : this.position.distanceTo(player.real_position);
        
        const hasLosToTarget = true; // TODO: Update with ling of sight
        
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

        this.setMovementAnimation();
        this.updateFrame(dt * 1000);
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
        // Add randomness to idle movement
        if (!this._idleRandomTimer) this._idleRandomTimer = 0;
        this._idleRandomTimer += dt;
        // Every 2-4 seconds, pick a new random waypoint
        if (this._idleRandomTimer > (this._idleRandomInterval || 2 + Math.random() * 2)) {
            this._idleRandomInterval = 2 + Math.random() * 2;
            this._idleRandomTimer = 0;
            // Pick a random point within 100-250px of homePoint
            const angle = Math.random() * Math.PI * 2;
            const radius = 100 + Math.random() * 150;
            const x = this.homePoint.x + Math.cos(angle) * radius;
            const y = this.homePoint.y + Math.sin(angle) * radius;
            this.waypoints = [new Vector(x, y)];
            this.currentWaypointIndex = 0;
        }
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
            this.searchTarget = this.lastKnownTargetPos.clone();
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
        //ctx.fillStyle = this.getStateColor();
        //ctx.fillRect(screenX - this.width/2, screenY - this.height/2, this.width, this.height);
        ctx.drawImage(
            this.img,
            this.spriteRect.x * this.spriteRect.width,
            this.spriteRect.y * this.spriteRect.height,
            this.spriteRect.width,
            this.spriteRect.height,
            screenX - this.width / 2,
            screenY - this.height / 2,
            this.width,
            this.height
        );

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

        // Remove the chase radius circle
        // ctx.strokeStyle = this.getStateColor();
        // ctx.beginPath();
        // ctx.arc(screenX, screenY, this.chaseRadius, 0, Math.PI * 2);
        // ctx.stroke();
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