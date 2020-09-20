import { Mat44 } from "./mat44";

export const Transform = {
    translate: function (t, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        transform[0][0] = 1;
        transform[0][1] = 0;
        transform[0][2] = 0;
        transform[0][3] = 0;
        transform[1][0] = 0;
        transform[1][1] = 1;
        transform[1][2] = 0;
        transform[1][3] = 0;
        transform[2][0] = 0;
        transform[2][1] = 0;
        transform[2][2] = 1;
        transform[2][3] = 0;
        transform[3][0] = t[0];
        transform[3][1] = t[1];
        transform[3][2] = t[2];
        transform[3][3] = 1;
        return out;
    },

    scale: function (s, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        transform[0][0] = s[0];
        transform[0][1] = 0;
        transform[0][2] = 0;
        transform[0][3] = 0;
        transform[1][0] = 0;
        transform[1][1] = s[1];
        transform[1][2] = 0;
        transform[1][3] = 0;
        transform[2][0] = 0;
        transform[2][1] = 0;
        transform[2][2] = s[2];
        transform[2][3] = 0;
        transform[3][0] = 0;
        transform[3][1] = 0;
        transform[3][2] = 0;
        transform[3][3] = 1;

        return transform;
    },

    shear: function (k, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        transform[0][0] = 1;
        transform[0][1] = 0;
        transform[0][2] = 0;
        transform[0][3] = 0;
        transform[1][0] = 0;
        transform[1][1] = 1;
        transform[1][2] = 0;
        transform[1][3] = 0;
        transform[2][0] = 0;
        transform[2][1] = 0;
        transform[2][2] = 1;
        transform[2][3] = 0;
        transform[3][0] = 0;
        transform[3][1] = 0;
        transform[3][2] = 0;
        transform[3][3] = 1;
        // TODO:
        return transform;
    },

    rotateX: function (theta, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        transform[0][0] = 1;
        transform[0][1] = 0;
        transform[0][2] = 0;
        transform[0][3] = 0;
        transform[1][0] = 0;
        transform[1][1] = cosTheta;
        transform[1][2] = sinTheta;
        transform[1][3] = 0;
        transform[2][0] = 0;
        transform[2][1] = -sinTheta;
        transform[2][2] = cosTheta;
        transform[2][3] = 0;
        transform[3][0] = 0;
        transform[3][1] = 0;
        transform[3][2] = 0;
        transform[3][3] = 1;

        return transform;
    },

    rotateY: function (theta, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        transform[0][0] = cosTheta;
        transform[0][1] = 0;
        transform[0][2] = -sinTheta;
        transform[0][3] = 0;
        transform[1][0] = 0;
        transform[1][1] = 1;
        transform[1][2] = 0;
        transform[1][3] = 0;
        transform[2][0] = sinTheta;
        transform[2][1] = 0;
        transform[2][2] = cosTheta;
        transform[2][3] = 0;
        transform[3][0] = 0;
        transform[3][1] = 0;
        transform[3][2] = 0;
        transform[3][3] = 1;

        return transform;
    },

    rotateZ: function (theta, out) {
        let transform = null;
        if (!out) {
            transform = Mat44.identity();
        } else {
            transform = out;
        }

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        transform[0][0] = cosTheta;
        transform[0][1] = sinTheta;
        transform[0][2] = 0;
        transform[0][3] = 0;
        transform[1][0] = -sinTheta;
        transform[1][1] = cosTheta;
        transform[1][2] = 0;
        transform[1][3] = 0;
        transform[2][0] = 0;
        transform[2][1] = 0;
        transform[2][2] = 1;
        transform[2][3] = 0;
        transform[3][0] = 0;
        transform[3][1] = 0;
        transform[3][2] = 0;
        transform[3][3] = 1;

        return transform;
    }
};
