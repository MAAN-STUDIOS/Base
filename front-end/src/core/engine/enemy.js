import { Vector } from "@utils/vector.js";
import { LineOfSight } from "./lineOfSight.js";
import logger from "@utils/logger.js";

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
            tileGrid,
            obstacles = [],
            width = 32,
            height = 32,
            health = 100,
            speed = 200,
            damage = 10,
            chaseRadius = 300,
            attackRadius = 50,
            retreatHealthThreshold = 30,
            retreatDistance = 150
        } = config;

        // Basic properties
        this.position = position;
        this.width = width;
        this.height = height;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.damage = damage;

        // State machine properties
        this.state = STATES.IDLE;
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.homePoint = homePoint;
        this.lastKnownPlayerPos = null;
        this.searchTarget = null;
        this.stateTimer = 0;

        // Combat properties
        this.chaseRadius = chaseRadius;
        this.attackRadius = attackRadius;
        this.retreatHealthThreshold = retreatHealthThreshold;
        this.retreatDistance = retreatDistance;

        // Line of sight system
        this.lineOfSight = new LineOfSight(tileGrid, obstacles);
        this.tileGrid = tileGrid;
    }

    update(dt, player) {
        // Update line of sight cache if player moved
        if (player.lastPosition && !player.lastPosition.equals(player.position)) {
            this.lineOfSight.updateLosCache(player.position);
        }

        const distanceToPlayer = this.position.distanceTo(player.position);
        const hasLosToPlayer = this.lineOfSight.hasLineOfSight(this.position, player.position);

        // State machine logic
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

        // Update state timer
        this.stateTimer += dt;
    }

    updateIdle(dt, player, distanceToPlayer, hasLosToPlayer) {
        // Patrol between waypoints
        if (this.waypoints.length > 0) {
            const targetWaypoint = this.waypoints[this.currentWaypointIndex];
            const direction = targetWaypoint.sub(this.position);
            
            if (direction.magnitude() < 5) {
                this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
            } else {
                this.moveTowards(direction, dt);
            }
        }

        // Check for state transitions
        if (distanceToPlayer <= this.chaseRadius && hasLosToPlayer) {
            this.transitionTo(STATES.PURSUE);
        } else if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updatePursue(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (hasLosToPlayer) {
            this.lastKnownPlayerPos = player.position.clone();
            
            if (distanceToPlayer <= this.attackRadius) {
                this.transitionTo(STATES.ATTACK);
            } else {
                const direction = player.position.sub(this.position);
                this.moveTowards(direction, dt);
            }
        } else {
            this.transitionTo(STATES.SEARCH);
        }

        if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updateSearch(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (hasLosToPlayer) {
            this.transitionTo(STATES.PURSUE);
            return;
        }

        if (!this.searchTarget) {
            this.searchTarget = this.lineOfSight.findNearestValidTile(
                this.position,
                this.lastKnownPlayerPos || player.position
            );
        }

        if (this.searchTarget) {
            const direction = this.searchTarget.sub(this.position);
            if (direction.magnitude() < 5) {
                this.searchTarget = null;
            } else {
                this.moveTowards(direction, dt);
            }
        }

        // Give up searching after 5 seconds
        if (this.stateTimer > 5) {
            this.transitionTo(STATES.IDLE);
        }
    }

    updateAttack(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (!hasLosToPlayer) {
            this.transitionTo(STATES.SEARCH);
            return;
        }

        if (distanceToPlayer > this.attackRadius) {
            this.transitionTo(STATES.PURSUE);
            return;
        }

        // Attack logic here
        if (this.stateTimer >= 1) { // Attack every second
            player.takeDamage(this.damage);
            this.stateTimer = 0;
        }

        if (this.health <= this.retreatHealthThreshold) {
            this.transitionTo(STATES.RETREAT);
        }
    }

    updateRetreat(dt, player, distanceToPlayer, hasLosToPlayer) {
        if (this.health > this.retreatHealthThreshold && distanceToPlayer > this.retreatDistance) {
            this.transitionTo(STATES.IDLE);
            return;
        }

        const direction = this.position.subtract(player.position);
        this.moveTowards(direction, dt);
    }

    moveTowards(direction, dt) {
        const normalized = direction.normalize();
        this.position = this.position.add(normalized.mul(this.speed * dt));
    }

    transitionTo(newState) {
        logger.debug(`Enemy transitioning from ${this.state} to ${newState}`);
        this.state = newState;
        this.stateTimer = 0;
        this.searchTarget = null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        logger.debug(`Enemy took ${amount} damage. Health: ${this.health}`);
    }

    draw(ctx) {
        // Draw enemy body
        ctx.fillStyle = this.getStateColor();
        ctx.fillRect(this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height);

        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.position.x - healthBarWidth/2,
            this.position.y - this.height/2 - 10,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = 'green';
        ctx.fillRect(
            this.position.x - healthBarWidth/2,
            this.position.y - this.height/2 - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        // Draw debug info
        if (this.searchTarget) {
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.searchTarget.x, this.searchTarget.y);
            ctx.stroke();
        }

        // Draw state radius
        ctx.strokeStyle = this.getStateColor();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.chaseRadius, 0, Math.PI * 2);
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