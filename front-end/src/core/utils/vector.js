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
        return (
            Math.abs(this.x - other.x) <= epsilon &&
            Math.abs(this.y - other.y) <= epsilon
        );
    }

    /**
     * Adds another vector to this one, returning a new vector.
     * Creates a new vector that is the sum of this vector and another vector.
     *
     * @param {Vector} other - The vector to add
     * @returns {Vector} A new vector representing the sum
     * @see addEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a new sum vector without modifying the originals
     * const sumVector = vectorA.add(vectorB);
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Adds another vector to this one in-place.
     * Modifies this vector by adding the components of another vector.
     *
     * @param {Vector} other - The vector to add
     * @returns {Vector} This vector instance (for method chaining)
     * @see add - For non-mutating version that returns a new vector
     *
     * @example
     * // Modify the current vector by adding another (like +=)
     * myVector.addEqual(otherVector);
     */
    addEqual(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Subtracts another vector from this one, returning a new vector.
     * Creates a new vector that is the difference between this vector and another vector.
     *
     * @param {Vector} other - The vector to subtract
     * @returns {Vector} A new vector representing the difference
     * @see subEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a new difference vector without modifying the originals
     * const diffVector = vectorA.sub(vectorB);
     */
    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * Subtracts another vector from this one in-place.
     * Modifies this vector by subtracting the components of another vector.
     *
     * @param {Vector} other - The vector to subtract
     * @returns {Vector} This vector instance (for method chaining)
     * @see sub - For non-mutating version that returns a new vector
     *
     * @example
     * // Modify the current vector by subtracting another (like -=)
     * myVector.subEqual(otherVector);
     */
    subEqual(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Multiplies this vector by a scalar value, returning a new vector.
     * Creates a new vector with each component multiplied by the scalar.
     *
     * @param {number} scalar - The scalar value to multiply by
     * @returns {Vector} A new vector representing the product
     * @see mulEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a new doubled vector without modifying the original
     * const doubledVector = myVector.mul(2);
     */
    mul(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Multiplies this vector by a scalar value in-place.
     * Modifies this vector by multiplying each component by the scalar.
     *
     * @param {number} scalar - The scalar value to multiply by
     * @returns {Vector} This vector instance (for method chaining)
     * @see mul - For non-mutating version that returns a new vector
     *
     * @example
     * // Modify the current vector by doubling it (like *=)
     * myVector.mulEqual(2);
     */
    mulEqual(scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    /**
     * Scales this vector by multiplying its components by the given scalar, returning a new vector.
     * Creates a new vector with each component multiplied by the scalar.
     *
     * @param {number} scalar - The scalar value to multiply by.
     * @returns {Vector} A new vector representing the scaled result.
     * @see scaleEqual - For in-place version that modifies this vector.
     *
     * @example
     * // Create a new scaled vector without modifying the original
     * const doubledVector = myVector.scale(2);
     */
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * Scales this vector by multiplying its components by the given scalar in-place.
     * Modifies this vector directly by multiplying each component by the scalar.
     *
     * @param {number} scalar - The scalar value to multiply by.
     * @returns {Vector} This vector instance (for method chaining).
     * @see scale - For non-mutating version that returns a new vector.
     *
     * @example
     * // Modify the current vector by doubling it
     * myVector.scaleEqual(2);
     */
    scaleEqual(scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    /**
     * Divides this vector by a scalar value, returning a new vector.
     * Creates a new vector with each component divided by the scalar.
     *
     * @param {number} scalar - The scalar value to divide by
     * @returns {Vector|null} A new vector representing the result, or null if division by zero
     * @see divEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a vector half the size without modifying the original
     * const halfVector = myVector.div(2);
     */
    div(scalar) {
        if (scalar === 0) {
            logger.error("Attempted division by zero in Vector.div()");
            return null;
        }

        return new Vector(this.x / scalar, this.y / scalar);
    }

    /**
     * Divides this vector by a scalar value in-place.
     * Modifies this vector by dividing each component by the scalar.
     *
     * @param {number} scalar - The scalar value to divide by
     * @returns {Vector|null} This vector instance for chaining, or null if division by zero
     * @see div - For non-mutating version that returns a new vector
     *
     * @example
     * // Modify the current vector by halving it (like /=)
     * myVector.divEqual(2);
     */
    divEqual(scalar) {
        if (scalar === 0) {
            logger.error("Attempted division by zero in Vector.div()");
            return null;
        }

        this.x /= scalar;
        this.y /= scalar;

        return this;
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
     * Creates a new vector with the same direction but magnitude of 1.
     *
     * @returns {Vector} A new normalized vector, or zero vector if magnitude was zero
     * @see normalizeEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a normalized direction vector without modifying the original
     * const direction = myVector.normalize();
     */
    normalize() {
        const len = this.magnitude();

        if (len === 0) {
            logger.warn("Attempted to normalize a zero-length vector");
        }

        return len === 0 ? new Vector(0, 0) : this.div(len);
    }

    /**
     * Normalizes this vector to unit length in-place.
     * Modifies this vector to have the same direction but magnitude of 1.
     *
     * @returns {Vector} This vector instance (for method chaining), normalized to unit length
     * @see normalize - For non-mutating version that returns a new vector
     *
     * @example
     * // Convert the current vector to a unit vector in-place
     * myVector.normalizeEqual();
     */
    normalizeEqual() {
        const len = this.magnitude();

        if (len !== 0) {
            this.divEqual(len);
        } else {
            logger.warn("Attempted to normalize a zero-length vector");
        }

        return this;
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
        return Math.cos(cos);
    }

    /**
     * Rotates the vector by a given angle in radians, returning a new vector.
     * Creates a new vector that is this vector rotated around the origin.
     *
     * @param {number} theta - Angle in radians (positive is counterclockwise)
     * @returns {Vector} A new vector representing the rotated vector
     * @see rotateEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a new vector rotated 90 degrees without modifying the original
     * const rotatedVector = myVector.rotate(Math.PI/2);
     */
    rotate(theta) {
        const c = Math.cos(theta), s = Math.sin(theta);

        return new Vector(
            this.x * c - this.y * s,
            this.x * s + this.y * c
        );
    }

    /**
     * Rotates this vector by a given angle in radians in-place.
     * Modifies this vector by rotating it around the origin.
     *
     * @param {number} theta - Angle in radians (positive is counterclockwise)
     * @returns {Vector} This vector instance (for method chaining)
     * @see rotate - For non-mutating version that returns a new vector
     *
     * @example
     * // Rotate the current vector by 45 degrees in-place
     * myVector.rotateEqual(Math.PI/4);
     */
    rotateEqual(theta) {
        const c = Math.cos(theta), s = Math.sin(theta);
        const newX = this.x * c - this.y * s;
        const newY = this.x * s + this.y * c;

        this.x = newX;
        this.y = newY;

        return this;
    }

    /**
     * Linearly interpolates between this vector and another, returning a new vector.
     * Creates a new vector positioned along the line between the two vectors based on the factor.
     *
     * @param {Vector} other - The target vector to interpolate toward
     * @param {number} [factor=0.5] - Interpolation factor between 0 and 1:
     *   - 0: Returns a copy of this vector
     *   - 1: Returns a copy of the target vector
     *   - Between 0-1: Returns vector at proportional position between the two
     *   - Out-of-range values are automatically clamped to [0,1]
     * @returns {Vector} A new interpolated vector
     * @see lerpEqual - For in-place version that modifies this vector
     *
     * @example
     * // Create a new vector halfway between current and target
     * const midpoint = myVector.lerp(targetVector, 0.5);
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
     * Linearly interpolates between this vector and another vector in-place.
     * Modifies this vector by moving it toward the target vector by the specified factor.
     *
     * @param {Vector} other - The target vector to interpolate toward
     * @param {number} [factor=0.5] - Interpolation factor between 0 and 1:
     *   - 0: Original vector remains unchanged
     *   - 1: Vector becomes equal to the target
     *   - Between 0-1: Linear interpolation between vectors
     *   - Out-of-range values are automatically clamped to [0,1]
     * @returns {Vector} This vector instance (for method chaining)
     * @see lerp - For non-mutating version that returns a new vector
     *
     * @example
     * // Move the current vector 30% of the way toward target
     * myVector.lerpEqual(targetVector, 0.3);
     */
    lerpEqual(other, factor = 0.5) {
        if (factor > 1 || factor < 0) {
            logger.warn(`Out of bounds factor for linear interpolation, factor = ${factor}. Clamping factor to (0, 1)`);
            factor = Math.max(0, Math.min(factor, 1));
        }

        this.x += (other.x - this.x) * factor;
        this.y += (other.y - this.y) * factor;

        return this;
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

    clear() {
        this.x = 0;
        this.y = 0;
    }
}
