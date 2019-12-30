import {Vec2} from "./vec2";

export const BoundingSquare = function (vertices) {
    const min = Vec2.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const max = Vec2.create(-Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER);

    for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        if (v[0] < min[0]) {
            min[0] = v[0];
        }

        if (v[1] < min[1]) {
            min[1] = v[1];
        }

        if (v[0] > max[0]) {
            max[0] = v[0];
        }

        if (v[1] > max[1]) {
            max[1] = v[1];
        }

        this.min = min;
        this.max = max;
    }
};
