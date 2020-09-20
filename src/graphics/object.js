import { Mat44 } from "../mathematics/mat44";
import { Transform } from "../mathematics/transform";
import { Vec3 } from "../mathematics/vec3";
import { Material } from "./material";

export const Object = function () {
    this.position = Vec3.create();
    this.rotation = Vec3.create();
    this.localToWorld = Mat44.create();
    this.worldToLocal = Mat44.inverse(this.localToWorld);
    this.transformNormals = Mat44.transpose(this.worldToLocal);

    this.material = new Material();

    // Cache
    this.v0 = Vec3.create();
    this.v1 = Vec3.create();
    this.v2 = Vec3.create();
    this.v3 = Vec3.create();

    this.m0 = Mat44.create();
    this.m1 = Mat44.create();
    this.m2 = Mat44.create();
    this.m3 = Mat44.create();
    this.m4 = Mat44.create();
    this.m5 = Mat44.create();
    this.m6 = Mat44.create();
};

Object.prototype.positionAndOrient = function (position, orientation = Vec3.create(0, 0, -1)) {
    const forward = Vec3.normalise(orientation, 1, this.v0);
    const right = Vec3.set(this.v1, 0, 1, 0);
    if (Vec3.equals(forward, right)) {
        Vec3.set(right, 0, 0, -1);
    } else {
        Vec3.cross(Vec3.normalised(Vec3.set(this.v2, 0, 1, 0)), forward, right);
    }

    const up = Vec3.cross(forward, right, this.v3);

    const localToWorld = Mat44.create();
    localToWorld[0][0] = right[0];
    localToWorld[0][1] = right[1];
    localToWorld[0][2] = right[2];
    localToWorld[1][0] = up[0];
    localToWorld[1][1] = up[1];
    localToWorld[1][2] = up[2];
    localToWorld[2][0] = forward[0];
    localToWorld[2][1] = forward[1];
    localToWorld[2][2] = forward[2];
    localToWorld[3][0] = position[0];
    localToWorld[3][1] = position[1];
    localToWorld[3][2] = position[2];

    this.position = Vec3.copy(position);
    this.forward = forward;
    this.right = right;
    this.up = up;
    this.localToWorld = localToWorld;
    Mat44.inverse(this.localToWorld, this.worldToLocal);
    Mat44.transpose(this.worldToLocal, this.transformNormals);
};

Object.prototype.update = function () {
    const matRotX = Transform.rotateX(this.rotation[0], this.m0);
    const matRotY = Transform.rotateY(this.rotation[1], this.m1);
    const matRotZ = Transform.rotateZ(this.rotation[2], this.m2);
    const matTrans = Transform.translate(this.position, this.m3);
    const identity = Mat44.set(this.localToWorld);
    Mat44.multiply(identity, matRotZ, this.m4);
    Mat44.multiply(this.m4, matRotY, this.m5);
    Mat44.multiply(this.m5, matRotX, this.m6);
    Mat44.multiply(this.m6, matTrans, this.localToWorld);
    Mat44.inverse(this.localToWorld, this.worldToLocal);
    Mat44.transpose(this.worldToLocal, this.transformNormals);
};

Object.prototype.intersect = function () {
    return null;
};
