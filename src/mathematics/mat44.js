import { Vec } from "./vec";
import { Vec3 } from "./vec3";

export const Mat44 = {

    create: function (a = 1, b = 0, c = 0, d = 0,
                      e = 0, f = 1, g = 0, h = 0,
                      i = 0, j = 0, k = 1, l = 0,
                      m = 0, n = 0, o = 0, p = 1) {

        return [
            Vec.create(a, b, c, d),
            Vec.create(e, f, g, h),
            Vec.create(i, j, k, l),
            Vec.create(m, n, o, p)
        ];
    },

    identity: function () {
        return [
            Vec.create(1, 0, 0, 0),
            Vec.create(0, 1, 0, 0),
            Vec.create(0, 0, 1, 0),
            Vec.create(0, 0, 0, 1)
        ];
    },

    set: function (out,
                   a = 1, b = 0, c = 0, d = 0,
                   e = 0, f = 1, g = 0, h = 0,
                   i = 0, j = 0, k = 1, l = 0,
                   m = 0, n = 0, o = 0, p = 1) {
        out[0][0] = a;
        out[0][1] = b;
        out[0][2] = c;
        out[0][3] = d;
        out[1][0] = e;
        out[1][1] = f;
        out[1][2] = g;
        out[1][3] = h;
        out[2][0] = i;
        out[2][1] = j;
        out[2][2] = k;
        out[2][3] = l;
        out[3][0] = m;
        out[3][1] = n;
        out[3][2] = o;
        out[3][3] = p;

        return out;
    },

    copy: function (m) {
        return Mat44.create(
            m[0][0], m[0][1], m[0][2], m[0][3],
            m[1][0], m[1][1], m[1][2], m[1][3],
            m[2][0], m[2][1], m[2][2], m[2][3],
            m[3][0], m[3][1], m[3][2], m[3][3]);
    },

    row: function (m, row) {
        const mRow = m[row];
        return [mRow[0], mRow[1], mRow[2], mRow[3]];
    },

    column: function (m, col) {
        return [
            m[0][col],
            m[1][col],
            m[2][col],
            m[3][col]
        ];
    },

    multiply: function (a, b, out = Mat44.create()) {
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                out[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] +
                    a[i][2] * b[2][j] + a[i][3] * b[3][j];
            }
        }
        return out;
    },

    transpose: function (m, out = Mat44.create()) {
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                out[i][j] = m[j][i];
            }
        }
        return out;
    },

    // {@param v} is implicitly converted from cartesian coordinates to homogeneous coordinates
    // Assumes matrix is in row-major form (multiply vector with matrix from left-to-right: out = v X m)
    multiplyVector: function (v, m, out = Vec3.create()) {
        const a = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0];
        const b = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1];
        const c = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2];
        const w = v[0] * m[0][3] + v[1] * m[1][3] + v[2] * m[2][3] + m[3][3];
        if (w != 1) {
            // m is a projection matrix, which does not preserve distances:
            // convert from homogeneous coordinates to cartesian coordinates
            out[0] = a / w;
            out[1] = b / w;
            out[2] = c / w;
        } else {
            // m is an affine transformation matrix:
            // w = 1 and no need to waste cycles performing divisions
            out[0] = a;
            out[1] = b;
            out[2] = c;
        }
        return out;
    },

    multiplyDirection: function (v, m, out = Vec3.create()) {
        out[0] = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0];
        out[1] = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1];
        out[2] = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2];
        return out;
    },

    /**
     * Multiply the matrix with the homogeneous vector without performing the w-coordinate divide.
     */
    multiplyHomogeneousVector: function (v, m, out = Vec.create(0, 0, 0, 1)) {
        const a = v[0] * m[0][0] + v[1] * m[1][0] + v[2] * m[2][0] + m[3][0];
        const b = v[0] * m[0][1] + v[1] * m[1][1] + v[2] * m[2][1] + m[3][1];
        const c = v[0] * m[0][2] + v[1] * m[1][2] + v[2] * m[2][2] + m[3][2];
        const w = v[0] * m[0][3] + v[1] * m[1][3] + v[2] * m[2][3] + m[3][3];
        out[0] = a;
        out[1] = b;
        out[2] = c;
        out[3] = w;
        return out;
    },

    inverse: function (m, out) {
        let i, j, k;
        const t = Mat44.copy(m);

        let mi = null;

        // Initialise out to identity matrix
        if (!out) {
            mi = Mat44.identity();
        } else {
            mi = Mat44.set(out);
        }

        // Forward elimination
        for (i = 0; i < 3; i++) {
            let pivot = i;

            let pivotSize = t[i][i];

            if (pivotSize < 0)
                pivotSize = (-1 * pivotSize);

            for (j = i + 1; j < 4; j++) {
                let tmp = t[j][i];

                if (tmp < 0)
                    tmp = -1 * tmp;

                if (tmp > pivotSize) {
                    pivot = j;
                    pivotSize = tmp;
                }
            }

            if (pivotSize == 0) {
                // Cannot invert singular matrix
                return Mat44.create();
            }

            if (pivot != i) {
                for (j = 0; j < 4; j++) {
                    let tmp;

                    tmp = t[i][j];
                    t[i][j] = t[pivot][j];
                    t[pivot][j] = tmp;

                    tmp = mi[i][j];
                    mi[i][j] = mi[pivot][j];
                    mi[pivot][j] = tmp;
                }
            }

            for (j = i + 1; j < 4; j++) {
                let f = t[j][i] / t[i][i];

                for (k = 0; k < 4; k++) {
                    t[j][k] = t[j][k] - (f * t[i][k]);
                    mi[j][k] = mi[j][k] - (f * mi[i][k]);
                }
            }
        }

        // Backward substitution
        for (i = 3; i >= 0; --i) {
            let f = t[i][i];

            if (f == 0) {
                // Cannot invert singular matrix
                return Mat44.create();
            }

            for (j = 0; j < 4; j++) {
                t[i][j] = t[i][j] / f;
                mi[i][j] = mi[i][j] / f;
            }

            for (j = 0; j < i; j++) {
                f = t[j][i];

                for (k = 0; k < 4; k++) {
                    t[j][k] = t[j][k] - (f * t[i][k]);
                    mi[j][k] = mi[j][k] - (f * mi[i][k]);
                }
            }
        }

        return mi;
    }
};
