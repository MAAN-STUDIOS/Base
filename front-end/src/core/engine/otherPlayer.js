import { Vector } from "@utils/vector.js";
import { Hitbox } from "@utils/hitbox.js";
import logger from "@utils/logger.js";
import { Rect } from "@utils/rectangle.js";
import { floodMovement, playerMovement } from "@engine/playerAnimation.js";

/** @type {string}*/
import HumanSpriteSheet from "@assets/human/final.png";
import FloodSpriteSheet from "@/assets/Flood/flood-sprites1.png";


export class OtherPlayer {
    /**
     * Creates a new human-controlled player.
     * @param position
     * @param type
     * @param id
     */
    constructor(position, type = "human", id) {
        this.width = 150;
        this.height = 150;

        /** @type {Vector} */
        this.position = position.clone();

        this.target = Vector.zero();
        this.id = id;

        this.health = 100;
        this.maxHealth = 100;

        this.spriteRect = type === 'human' ? new Rect(0, 0, 153, 153) : new Rect(0, 0, 78, 70);
        this.previousDirection = "down";
        this.currentDirection = "down";
        this.frame = 0;
        this.minFrame = 0;
        this.maxFrame = 0;
        this.repeat = true;
        this.frameDuration = 100;
        this.totalTime = 0;
        this.sheetCols = 6;
        this.moveDirection = Vector.zero();
        this.activeSlot = 0;
        this.representation = new Image();
        this.representation.src = type === 'human' ? HumanSpriteSheet : FloodSpriteSheet;
        this.amazing = false;
        this.type = type;

        this.framesMovement = type === 'human' ? playerMovement : floodMovement;
        this.setMovement = type === 'human' ? this.setHumanMovementAnimation.bind(this) : this.setFloodMovementAnimation.bind(this);
        /** @type {Hitbox} - Collision detection box for the player. */
        this.hitbox = new Hitbox(this);
        this.onDamage = () => {};
    }

    get real_position() {
        return this.position.clone();
    }

    setAnimation(minFrame, maxFrame, repeat, duration) {
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
        this.repeat = repeat;
        this.totalTime = 0;
        this.frameDuration = duration * 1000;
    }

    setHumanMovementAnimation() {
        if (Math.abs(this.moveDirection.y) > Math.abs(this.moveDirection.x)) {
            if (this.moveDirection.y > 0) {
                this.currentDirection = "down";
            } else if (this.moveDirection.y < 0) {
                this.currentDirection = "up";
            } else {
                this.currentDirection = "idle";
            }
        } else if (this.moveDirection.x !== 0 && this.moveDirection.y !== 0) {
            if (this.moveDirection.x < 0 && this.moveDirection.y < 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "pistol_diagonal_left_up";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "machinegun_diagonal_left_up";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shotgun_diagonal_left_up";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "flamethrower_diagonal_left_up";
                }
            } else if (this.moveDirection.x > 0 && this.moveDirection.y < 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "pistol_diagonal_right_up";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "machinegun_diagonal_right_up";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shotgun_diagonal_right_up";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "flamethrower_diagonal_right_up";
                }
            } else if (this.moveDirection.x < 0 && this.moveDirection.y > 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "pistol_diagonal_left_down";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "machinegun_diagonal_left_down";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shotgun_diagonal_left_down";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "flamethrower_diagonal_left_down";
                }
            } else if (this.moveDirection.x > 0 && this.moveDirection.y > 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "pistol_diagonal_right_down";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "machinegun_diagonal_right_down";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shotgun_diagonal_right_down";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "flamethrower_diagonal_right_down";
                }
            }
        } else {
            if (this.moveDirection.x > 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "shoot_pistol_right";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "shoot_machinegun_right";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shoot_shotgun_right";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "shoot_flamethrower_right";
                } else {
                    this.currentDirection = "right";
                }
            } else if (this.moveDirection.x < 0) {
                if (this.activeSlot === 0) {
                    this.currentDirection = "shoot_pistol_left";
                } else if (this.activeSlot === 1) {
                    this.currentDirection = "shoot_machinegun_left";
                } else if (this.activeSlot === 2) {
                    this.currentDirection = "shoot_shotgun_left";
                } else if (this.activeSlot === 3) {
                    this.currentDirection = "shoot_flamethrower_left";
                } else {
                    this.currentDirection = "left";
                }
            } else {
                this.currentDirection = "idle";
            }
        }
    }

    setFloodMovementAnimation() {
        if (Math.abs(this.moveDirection.y) > Math.abs(this.moveDirection.x)) {

            if (this.moveDirection.y > 0) {
                if (true) {
                    this.currentDirection = "downRun";
                } else {
                    this.currentDirection = "down";
                }
            } else if (this.moveDirection.y < 0) {
                this.currentDirection = "up";
                if (true) {
                    this.currentDirection = "upRun";
                }
            } else {
                this.currentDirection = "idle";
            }
        } else {
            if (this.moveDirection.x > 0) {
                if (true) {
                    this.currentDirection = "rightRun";
                } else {
                    this.currentDirection = "right";
                }
            } else if (this.moveDirection.x < 0) {
                if (true) {
                    this.currentDirection = "leftRun";
                } else {
                    this.currentDirection = "left";
                }
            } else {
                this.currentDirection = "idle";
            }
        }

        // if (this.keys.consume) {
        //     this.currentDirection = "eat";
        // } else if (this.isDead) {
        //     this.currentDirection = "death";
        // }
        //
        // if (this.isAttacking) {
        //     this.currentDirection = "attack";
        // }
        //
        // if (this.keys.attack) {
        //     this.currentDirection = "attack";
        //
        // }
    }

    setMovementAnimation() {
        this.setMovement();

        if (this.currentDirection !== this.previousDirection) {
            const anim = this.framesMovement[this.currentDirection];
            this.setAnimation(...anim.frames, anim.repeat, anim.duration);
        }

        this.previousDirection = this.currentDirection;
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

    /**
     * Updates the player's state and position based on current key inputs.
     * Handles movement direction, speed (walk/run), and normalization for diagonal movement.
     * @param {number} dt - Delta time in seconds since the last update.
     * @override
     */
    update(dt) {
        this.position.lerpEqual(this.target, 1);

        this.setMovementAnimation();
        this.updateFrame(dt * 1000);
    }

    /**
     * Renders the player on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param p
     * @param w
     * @param h
     * @override
     */
    draw(ctx, p, w, h) {
        const screenX = this.position.x - p.x + w / 2;
        const screenY = this.position.y - p.y + h / 2;

        ctx.drawImage(
            this.representation,
            this.spriteRect.x * this.spriteRect.width,
            this.spriteRect.y * this.spriteRect.height,
            this.spriteRect.width,
            this.spriteRect.height,
            screenX - this.width / 2,
            screenY - this.height / 2, this.width,
            this.width,
            this.height
        );

        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;

        ctx.fillStyle = 'red';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            screenY - this.height / 2 - 10,
            healthBarWidth,
            healthBarHeight
        );

        ctx.fillStyle = 'green';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            screenY - this.height / 2 - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 300, 0, Math.PI * 2);
        ctx.stroke();
    }

    takeDamage(dmg) {
        this.health -= dmg;

        if (this.health <= 0) {
            this.die();
        }

        this.onDamage(this.health)
    }

    die() {

    }

    collidesWith(hb) {
        return this.hitbox.collidesWith(hb);
    }
}
