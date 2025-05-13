/**
 * Implemented by Angel Montemayor Davila on 5-May-2025
 * ID: A01785840
 * FR: 007
 */
import logger from "@utils/logger.js";


/**
 * Represents a 2D vector with x and y components.
 * @class
 */
export class Vector {
    /**
     * Creates a new Vector instance.
     * @param {number} [x=0] - The x component.
     * @param {number} [y=0] - The y component.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;

        logger.debug(`Vector constructed with x: ${x}, y: ${y}`);
        if (x === undefined || y === undefined) {
            logger.warn("Vector constructed with undefined x | y");
        }
    }

    /**
     * Returns a new vector with both components set to 0.
     * @returns {Vector}
     */
    static zero() {
        return new Vector(0, 0);
    }

    /**
     * Returns a new vector with both components set to 1.
     * @returns {Vector}
     */
    static one() {
        return new Vector(1, 1);
    }

    /**
     * Creates a vector from an angle in radians and a given length.
     * The angle is measured from the positive X-axis.
     *
     * @param {number} theta - Angle in radians from the +X direction.
     * @param {number} [length=1] - Magnitude (length) of the resulting vector.
     * @returns {Vector} A new vector with the given angle and length.
     */
    static fromAngle(theta, length = 1) {
        return new Vector(Math.cos(theta) * length, Math.sin(theta) * length);
    }

    /**
     * Creates a copy of the current vector.
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y);
    }

    /**
     * Converts the vector to an array format.
     * @returns {number[]} [x, y]
     */
    toArray() {
        return [this.x, this.y];
    }

    /**
     * Converts the vector to a string with fixed precision.
     * @param {number} [precision=3] - Decimal precision.
     * @returns {string}
     */
    toString(precision = 3) {
        return `(${this.x.toFixed(precision)}, ${this.y.toFixed(precision)})`;
    }

    /**
     * Compares this vector with another for approximate equality.
     * @param {Vector} other - The vector to compare with.
     * @param {number} [epsilon=1e-6] - Allowed numerical error.
     * @returns {boolean}
     */
    equals(other, epsilon = 1e-6) {
        logger.debug(`Comparing vectors: this ${this} vs other ${other}`);

        return (
            Math.abs(this.x - other.x) <= epsilon &&
            Math.abs(this.y - other.y) <= epsilon
        );
    }

    /**
     * Adds another vector to this one.
     * @param {Vector} other - The vector to add.
     * @returns {Vector}
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector} other - The vector to subtract.
     * @returns {Vector}
     */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} scalar - The scalar value.
     * @returns {Vector}
     */
    mul(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Divides this vector by a scalar.
     * @param {number} scalar - The scalar value.
     * @returns {Vector|null} A new vector or null if division by zero.
     */
    div(scalar) {
        if (scalar === 0) {
            logger.error("Attempted division by zero in Vector.div()");
            return null;
        }

        return new Vector(this.x / scalar, this.y / scalar);
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector} other - The other vector.
     * @returns {number}
     */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Calculates the 2D cross product (returns scalar).
     * @param {Vector} other - The other vector.
     * @returns {number}
     */
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    /**
     * Calculates the magnitude of the vector.
     * @returns {number}
     */
    magnitude() {
        return Math.hypot(this.x, this.y);
    }

    /**
     * Returns a normalized (unit length) version of this vector.
     * @returns {Vector}
     */
    normalize() {
        const len = this.magnitude();

        if (len === 0) {
            logger.warn("Attempted to normalize a zero-length vector");
        }

        return len === 0 ? new Vector(0, 0) : this.div(len);
    }

    /**
     * Calculates the distance to another vector.
     * @param {Vector} other - The other vector.
     * @returns {number}
     */
    distanceTo(other) {
        return this.sub(other).magnitude();
    }

    /**
     * Returns the angle in radians of this vector from the positive X-axis.
     * @returns {number} Angle in radians / degrees.
     */
    angleToX() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Returns the angle in radians between this vector and another.
     * @param {Vector} other - The other vector.
     * @returns {number} Angle in radians.
     * @throws {Error} If either vector has zero length.
     */
    angleTo(other) {
        const denominator = this.magnitude() * other.magnitude();

        if (denominator === 0) {
            logger.error("Cannot calculate angle between zero-length vectors");
            throw new Error("Cannot angle with zero-length vector");
        }

        let cos = this.dot(other) / denominator;
        cos = Math.min(1, Math.max(-1, cos)); // Clamp due to the arcCos domain
        return  Math.cos(cos);
    }

    /**
     * Rotates the vector by a given angle in radians.
     * @param {number} theta - Angle in radians.
     * @returns {Vector}
     */
    rotate(theta) {
        const c = Math.cos(theta), s = Math.sin(theta);

        return new Vector(
            this.x * c - this.y * s,
            this.x * s + this.y * c
        );
    }

    /**
     * Linearly interpolates between from this vector to another at t factor.
     * NOTE: Useful for smooth transitions.
     * @param {Vector} other - The other vector.
     * @param {number} [factor=0.5] - Interpolation factor (0 to 1).
     * @returns {Vector}
     */
    lerp(other, factor = 0.5) {
        if (factor > 1 || factor < 0) {
            logger.warn(`Out of bounds factor for linear interpolation, factor = ${factor} 
                              Clamping factor to (0, 1)`);
            factor = Math.max(0, Math.min(factor, 1));
        }

        return new Vector(
            this.x + (other.x - this.x) * factor,
            this.y + (other.y - this.y) * factor
        );
    }

    /**
     * Reflects this vector around a given normal.
     * Assumes the normal is already normalized.
     * @param {Vector} normal - The reflection normal.
     * @returns {Vector}
     */
    reflect(normal) {
        if (Math.abs(normal.magnitude() - 1) > 1e6) {
            logger.warn(`Reflection on a not normalize vector.
                               Normalizing it automatically.`);

            normal = normal.normalize();
        }

        const dot_product = 2 * this.dot(normal);
        return this.sub(normal.mul(dot_product));
    }
}

