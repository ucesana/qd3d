import { Vec3 } from "./vec3";

export const BoundingBox = function (vertices) {
    this._init = function (vertices) {
        this.vertices = vertices;

        const infinity = Number.MAX_SAFE_INTEGER;
        const negInfinity = Number.MIN_SAFE_INTEGER;
        const min = Vec3.create(infinity, infinity, infinity);
        const max = Vec3.create(negInfinity, negInfinity, negInfinity);

        for (let i = 0; i < vertices.length; ++i) {
            if (vertices[i][0] < min[0]) {
                min[0] = vertices[i][0];
            }

            if (vertices[i][1] < min[1]) {
                min[1] = vertices[i][1];
            }

            if (vertices[i][2] < min[2]) {
                min[2] = vertices[i][2];
            }

            if (vertices[i][0] > max[0]) {
                max[0] = vertices[i][0];
            }

            if (vertices[i][1] > max[1]) {
                max[1] = vertices[i][1];
            }

            if (vertices[i][2] > max[2]) {
                max[2] = vertices[i][2];
            }
        }

        const minX = min[0];
        const maxX = max[0];
        const minY = min[1];
        const maxY = max[1];
        const minZ = min[2];
        const maxZ = max[2];
        const width = maxX - minX;
        const halfWidth = width * 0.5;
        const height = maxY - minY;
        const halfHeight = height * 0.5;
        const depth = maxZ - minZ;
        const halfDepth = depth * 0.5;
        const centreX = minX + halfWidth;
        const centreY = minY + halfHeight;
        const centreZ = minZ + halfDepth;

        this.min = min;
        this.max = max;
        this.left = minX;
        this.right = maxX;
        this.bottom = minY;
        this.top = maxY;
        this.back = minZ;
        this.front = maxZ;
        this.width = width;
        this.halfWidth = halfWidth;
        this.height = height;
        this.halfHeight = halfHeight;
        this.depth = depth;
        this.halfDepth = halfDepth;
        this.centreLeft = Vec3.create(minX, centreY, centreZ);
        this.centreRight = Vec3.create(maxX, centreY, centreZ);
        this.centreBottom = Vec3.create(centreX, minY, centreZ);
        this.centreTop = Vec3.create(centreX, maxY, centreZ);
        this.centreBack = Vec3.create(centreX, centreY, minZ);
        this.centreFront = Vec3.create(centreX, centreY, maxZ);
        this.centre = Vec3.create(centreX, centreY, centreZ);
    };

    this._init(vertices);
};

BoundingBox.prototype.init = function (vertices) {
    this._init(vertices);
};

BoundingBox.prototype.update = function () {
    this._init(this.vertices);
};

BoundingBox.prototype.toString = function () {
    return JSON.stringify(this, null, 2);
};
