import { Vec } from "./vec";
import { math } from "./math";


export const Vec2 = {

    /**
     * Create a vector with components ({@param x}, {@param y}).
     *
     * @param {Number?} x
     * @param {Number?} y
     * @return {Vec2}
     */
    create: function (x = 0, y = 0) {
        return Vec.create(x, y);
    },

    /**
     * Copy the {@param v} vector to the {@param out} vector.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} out
     */
    copy: function (v, out = Vec2.create(v[0], v[1])) {
        out[0] = v[0];
        out[1] = v[1];
        return out;
    },

    /**
     * Set the direction of the vector {@code inOut}.
     *
     * @param {Vec2} out
     * @param {Number} x
     * @param {Number} y
     * @return {Vec2} inOut
     */
    set: function (out, x = 0, y = 0) {
        out[0] = x;
        out[1] = y;
        return out;
    },

    /**
     * Equality operator.
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @return {Boolean} true if a is equal to b, otherwise false
     */
    equals: function (v1, v2) {
        if (v1 === v2) {
            return true;
        }
        if (v1 == null || v2 == null) {
            return false;
        }
        if (v1.length !== v2.length) {
            return false;
        }
        const equalish = math.equalish;
        return (equalish(v1[0], v2[0]) && equalish(v1[1], v2[1]));
    },

    /**
     * Zero the vector {@param out}.
     *
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    zeroed: function (out) {
        out[0] = 0;
        out[1] = 0;
        return out;
    },

    /**
     * Negate the vector {@param out}.
     *
     * @param {Vec2} out
     * @return {Vec2} {@param out} the negated vector
     */
    negated: function (out) {
        out[0] = -out[0];
        out[1] = -out[1];
        return out;
    },

    /**
     * Negate the vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} {@param out} the negated vector
     */
    negate: function (v, out = Vec2.create()) {
        out[0] = -v[0];
        out[1] = -v[1];
        return out;
    },

    /**
     * Normalise the vector {@param out}.
     *
     * @param {Vec2} out
     * @param {Number?} length
     * @return {Vec2} {@param out}
     */
    normalised: function (out, length = 1) {
        const x = out[0];
        const y = out[1];
        const magnitude = (length / Math.sqrt((x * x) + (y * y)));
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        return out;
    },

    /**
     * Normalise the vector {@param v}.
     *
     * @param {Vec2} out
     * @param {Vec2} v
     * @param {Number?} length
     * @return {Vec2} {@param out} the negated vector
     */
    normalise: function (v, length = 1, out = Vec2.create()) {
        const x = v[0];
        const y = v[1];
        const magnitude = (length / Math.sqrt((x * x) + (y * y)));
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        return out;
    },

    /**
     * Multiply the vector {@param out} by the {@param scalar}.
     *
     * @param {Vec2} out
     * @param {Number} scalar
     * @return {Vec2} {@param out}
     */
    scaled: function (out, scalar = 1) {
        out[0] *= scalar;
        out[1] *= scalar;
        return out;
    },

    /**
     * Multiply the vector {@param v} by the {@param scalar}.
     *
     * @param {Vec2} v
     * @param {Number} scalar
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    scale: function (v, scalar = 1, out = Vec2.create()) {
        out[0] = v[0] * scalar;
        out[1] = v[1] * scalar;
        return out;
    },

    /**
     * Add the vector {@param v} to {@param out} vector.
     *
     * @param {Vec2} out
     * @param {Number} v
     * @return {Vec2} {@param out}
     */
    added: function (out, v) {
        out[0] += v[0];
        out[1] += v[1];
        return out;
    },

    /**
     * Add vectors {@param v1} and {@param v2}.
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    add: function (v1, v2, out = Vec2.create()) {
        out[0] = v1[0] + v2[0];
        out[1] = v1[1] + v2[1];
        return out;
    },

    /**
     * Subtract the vector {@param v} from {@param out} vector.
     *
     * @param {Vec2} out
     * @param {Number} v
     * @return {Vec2} {@param out}
     */
    subtracted: function (out, v) {
        out[0] -= v[0];
        out[1] -= v[1];
        return out;
    },

    /**
     * Subtract vectors {@param v1} and {@param v2}.
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    subtract: function (v1, v2, out = Vec2.create()) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        return out;
    },

    /**
     * Get the length of the vector {@param v}.
     *
     * @param {Vec2} v
     * @return {Number} length of the vector
     */
    length:function (v) {
        const x = v[0];
        const y = v[1];
        return Math.sqrt((x * x) + (y * y));
    },

    /**
     * Get the norm (length squared) of the vector {@param v}
     *
     * @param v
     * @return {Number}
     */
    norm: function (v) {
        const x = v[0];
        const y = v[1];
        return (x * x) + (y * y);
    },

    /**
     * Get the dot product of vectors {@param v1} and {@param v2}.
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @return {Number} the magnitude of the dot product
     */
    dot: function (v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1];
    },

    /**
     * Get the 2D cross product of vectors {@param v1} and {@param v2}.
     *
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @return {Number} the magnitude of the cross product
     */
    cross: function (v1, v2) {
        return v1[0] * v2[1] - v1[1] * v2[0];
    },

    /**
     * Cross the scalar {@param scalar} with the vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Number} scalar
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    scalarCross: function (v, scalar = 1, out = Vec2.create()) {
        out[0] = scalar * v[1];
        out[1] = -scalar * v[0];
        return out;
    },

    /**
     * Cross the vector {@param v} with the scalar {@param scalar}.
     *
     * @param {Vec2} v
     * @param {Number} scalar
     * @param {Vec2} out
     * @return {Vec2} {@param out}
     */
    crossScalar: function (v, scalar = 1, out = Vec2.create()) {
        out[0] = -scalar * v[1];
        out[1] = scalar * v[0];
        return out;
    },

    /**
     * Project this point out to a distance of {@code length} starting from a point
     * and by the given {@code angle}.
     *
     * @param {Vec2} out
     * @param {Vec2} point
     * @param {Number} angle in degrees
     * @param {Number} length
     * @return {Vec2} out
     */
    project: function (out, point, angle, length) {
        out[0] = (point[0] + math.fasterCos(angle) * length);
        out[1] = (point[1] + math.fasterSin(angle) * length);
        return out;
    },

    /**
     * Get the distance between {@code pointA} and {@code pointB}
     *
     * @param {Vec2} pointA
     * @param {Vec2} pointB
     * @return {Number} distance between {@code pointA} and {@code pointB}
     */
    distance: function (pointA, pointB) {
        var dx = pointB[0] - pointA[0],
            dy = pointB[1] - pointA[1];
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Get the un-normalised anti-clockwise perpendicular on the outer edge of vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} {@param out} the un-normalised counter-clockwise perpendicular
     */
    antiClockwisePerpendicular: function (v, out = Vec2.create()) {
        out[0] = -v[1];
        out[1] = v[0];
        return out;
    },

    /**
     * Get the un-normalised clockwise perpendicular on the inner edge of vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} {@param out} the un-normalised clockwise perpendicular
     */
    clockwisePerpendicular: function (v, out = Vec2.create()) {
        out[0] = v[1];
        out[1] = -v[0];
        return out;
    },

    /**
     * Get the normalised counter-clockwise normal on the outer edge of vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} {@param out} the normalised counter-clockwise normal
     */
    antiClockwiseNormal: function (v, out = Vec2.create()) {
        const x = -v[1];
        const y = v[0];
        const distanceSquared = (x * x) + (y * y);
        const magnitude = 1 / Math.sqrt(distanceSquared);
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        return out;
    },

    /**
     * Get the normalised clockwise normal on the inner edge of vector {@param v}.
     *
     * @param {Vec2} v
     * @param {Vec2} out
     * @return {Vec2} {@param out} the un-normalised clockwise normal
     */
    clockwiseNormal: function (v, out = Vec2.create()) {
        const x = v[0];
        const y = -v[1];
        const distanceSquared = (x * x) + (y * y);
        const magnitude = Math.sqrt(distanceSquared);
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        return out;
    }
};

