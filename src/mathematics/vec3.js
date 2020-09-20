import { math } from "./math";
import { Vec } from "./vec";

export const Vec3 = {

    /**
     * Create a vector with components {@code (x, y, z)}.
     *
     * @param {Number?} x
     * @param {Number?} y
     * @param {Number?} z
     */
    create: function (x = 0, y = 0, z = 0) {
        return Vec.create(x, y, z);
    },

    createDirection: function (origin, point, out = Vec3.create()) {
        return Vec3.normalised(Vec3.subtract(point, origin, out));
    },

    /**
     * Copy the vector {@param v}.
     *
     * @param {Vec3} v
     * @param {Vec3} out
     * @return {Vec3} {@param out}
     */
    copy: function (v, out = Vec3.create(v[0], v[1], v[2])) {
        out[0] = v[0];
        out[1] = v[1];
        out[2] = v[2];
        return out;
    },

    /**
     * Set the coordinates of the {@param out}.
     *
     * @param {Vec3} out
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @returns {Vec3} {@param out}
     */
    set: function (out, x, y, z) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    },

    equals: function (out, v1, v2) {
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
        return (equalish(v1[0], v2[0])
            && equalish(v1[1], v2[1])
            && equalish(v1[2], v2[2]));
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
        out[2] = 0;
        return out;
    },

    /**
     * Negate the vector.
     *
     * @param {Vec3} out
     * @return {Vec3} {@param out} the negated vector
     */
    negated: function (out) {
        out[0] = -out[0];
        out[1] = -out[1];
        out[2] = -out[2];
        return out;
    },

    /**
     * Negate the vector.
     *
     * @param {Vec3} out
     * @return {Vec3} {@param out} the negated vector
     */
    negate: function (v, out = Vec3.create()) {
        out[0] = -v[0];
        out[1] = -v[1];
        out[2] = -v[2];
        return out;
    },

    /**
     * Normalise the vector {@param out}.
     *
     * @param {Vec3} out
     * @param {Number?} {@param length}
     * @return {Vec3} {@param out}
     */
    normalised: function (out, length = 1) {
        const x = out[0];
        const y = out[1];
        const z = out[2];
        const magnitude = (length / Math.sqrt((x * x) + (y * y) + (z * z)));
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        out[2] = (z * magnitude);
        return out;
    },

    /**
     * Normalise the vector {@param v}.
     *
     * @param {Vec3} v
     * @param {Number?} {@param length}
     * @return {Vec3?} {@param out}
     */
    normalise: function (v, length = 1, out = Vec3.create()) {
        const x = v[0];
        const y = v[1];
        const z = v[2];
        const magnitude = (length / Math.sqrt((x * x) + (y * y) + (z * z)));
        out[0] = (x * magnitude);
        out[1] = (y * magnitude);
        out[2] = (z * magnitude);
        return out;
    },

    /**
     * Add vector {@param v} to {@param out} vector.
     *
     * @param {Vec3?} out
     * @param {Vec3} v
     * @returns {Vec3} {@param out}
     */
    added: function (out, v) {
        out[0] += v[0];
        out[1] += v[1];
        out[2] += v[2];
        return out;
    },

    /**
     * Add the vectors {@param v1} and {@param v2}.
     *
     * @param {Vec3} v1
     * @param {Vec3} v2
     * @param {Vec3?} out
     * @return {Vec3} {@param out}
     */
    add: function (v1, v2, out = Vec3.create()) {
        out[0] = v1[0] + v2[0];
        out[1] = v1[1] + v2[1];
        out[2] = v1[2] + v2[2];
        return out;
    },

    /**
     * Subtract vector {@param v} from {@param out} vector.
     *
     * @param {Vec3} out
     * @param {Vec3} v
     * @returns {Vec3} {@param out}
     */
    subtracted: function (out, v) {
        out[0] -= v[0];
        out[1] -= v[1];
        out[2] -= v[2];
        return out;
    },

    /**
     * Subtract the vectors {@param v1} and {@param v2}
     *
     * @param {Vec3} v1
     * @param {Vec3} v2
     * @param {Vec3?} out
     * @return {Vec3} {@param out}
     */
    subtract: function (v1, v2, out = Vec3.create()) {
        out[0] = v1[0] - v2[0];
        out[1] = v1[1] - v2[1];
        out[2] = v1[2] - v2[2];
        return out;
    },

    /**
     * Multiply the {@param out} vector by the scalar {@param scalar}.
     *
     * @param {Vec3} out
     * @param {Number} scalar
     * @returns {Vec3} {@param out}
     */
    scaled: function (out, scalar) {
        out[0] *= scalar;
        out[1] *= scalar;
        out[2] *= scalar;
        return out;
    },

    /**
     * Multiply the vector {@param v} by the {@param scalar}.
     *
     * @param {Vec3} v
     * @param {Number} scalar
     * @param {Vec3?} out
     * @return {Vec3} {@param out}
     */
    scale: function (v, scalar = 1, out = Vec3.create()) {
        out[0] = v[0] * scalar;
        out[1] = v[1] * scalar;
        out[2] = v[2] * scalar;
        return out;
    },

    /**
     * Get the dot product of vectors {@param v1} and {@param v2}
     *
     * @param {Vec3} v1
     * @param {Vec3} v2
     * @return {Number} the magnitude of the dot product
     */
    dot: function (v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    },

    /**
     * Cross product of vectors {@param v1} and {@param v2}.
     *
     * @param {Vec3} v1
     * @param {Vec3} v2
     * @param {Vec3?} out
     * @return {Vec3} {@param out}
     */
    cross: function (v1, v2, out = Vec3.create()) {
        const ax = v1[0];
        const ay = v1[1];
        const az = v1[2];
        const bx = v2[0];
        const by = v2[1];
        const bz = v2[2];
        out[0] = -az * by + ay * bz;
        out[1] = az * bx - ax * bz;
        out[2] = -ay * bx + ax * by;
        return out;
    },

    /**
     * Get the length of the vector {@param v}.
     *
     * @param {Vec3} v
     * @return {Number}
     */
    length: function (v) {
        const x = v[0];
        const y = v[1];
        const z = v[2];
        return Math.sqrt((x * x) + (y * y) + (z * z));
    },

    /**
     * Get the norm (length squared) of the vector {@param v}.
     *
     * @param {Vec3} v
     * @return {Number}
     */
    norm: function (v) {
        const x = v[0];
        const y = v[1];
        const z = v[2];
        return ((x * x) + (y * y) + (z * z));
    }
};

Vec3.ORIGIN = Vec3.create(0, 0, 0);
Vec3.X_AXIS = Vec3.create(1, 0, 0);
Vec3.Y_AXIS = Vec3.create(0, 1, 0);
Vec3.Z_AXIS = Vec3.create(0, 0, 1);
