export const Vec = {

    TYPE: (typeof Float64Array !== 'undefined')
        ? Float64Array
        : ((typeof Float32Array !== 'undefined')
            ? Float32Array
            : Array),

    create: function () {
        const dimension = arguments.length;
        const vec = new Vec.TYPE(dimension);
        for (let i = 0; i < dimension; i++) {
            vec[i] = arguments[i];
        }
        return vec;
    },

    createDimension: function (dimension, initial = 0) {
        const vec = new Vec.TYPE(dimension);
        for (let i = 0; i < dimension; i++) {
            vec[i] = initial;
        }
        return vec;
    },

    copy: function (v, out) {
        if (v == null) {
            return null;
        }
        if (out == null) {
            out = new Vec.TYPE(v.length);
        }
        const length = Math.min(v.length, out.length);
        for (let i = 0; i < length; i = i + 1) {
            out[index] = value;
        }
        return out;
    },

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
        for (let i = 0; i < v1.length; i += 1) {
            if (v1[i] !== v2[i]) {
                return false;
            }
        }
        return true;
    }
};
