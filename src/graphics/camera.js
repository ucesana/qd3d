import { Mat44 } from "../mathematics/mat44";
import { Transform } from "../mathematics/transform";
import { Vec2 } from "../mathematics/vec2";
import { Vec3 } from "../mathematics/vec3";

export const Camera = function (options) {
    this.init = function (settings) {
        this.settings = Object.assign({
            canvasWidth: 1, // film/camera aperture width in mm; DO NOT CHANGE: Assumes vertical and horizontal fov are the same.
            canvasHeight: 1, // film/camera aperture height in mm; DO NOT CHANGE: Assumes vertical and horizontal fov are the same.
            imageWidth: 512, // device width in pixels
            imageHeight: 512, // device height in pixelss
            fNear: 1, // distance of near clipping plane from eye position
            fFar: 10, // distance of far clipping plane from eye position
            fov: 90   // horizontal angle of view/field of view in degrees
        }, settings || {});

        this.cameraToWorld = Mat44.create();
        this.worldToCamera = Mat44.inverse(this.cameraToWorld);
        this.transformNormals = Mat44.transpose(this.worldToCamera);
        this.canvasWidth = this.settings.canvasWidth;
        this.canvasHeight = this.settings.canvasHeight;
        this.imageWidth = this.settings.imageWidth;
        this.imageHeight = this.settings.imageHeight;
        this.aspectRatio = this.imageHeight / this.imageWidth;
        this.fNear = this.settings.fNear;
        this.fFar = this.settings.fFar;
        this.fov = this.settings.fov * (Math.PI / 180);

        this.projectionTransform = this.createPerspectiveTransform(this.fNear, this.fFar, this.fov);

        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;

        // Cache
        this.p0 = Vec2.create();

        this.vCamera = Vec3.create();
        this.v1 = Vec3.create();
        this.v2 = Vec3.create();
        this.v3 = Vec3.create();
        this.v4 = Vec3.create();
        this.v5 = Vec3.create();
        this.v6 = Vec3.create();
        this.v7 = Vec3.create();
        this.v8 = Vec3.create();
        this.v9 = Vec3.create();
        this.v10 = Vec3.create();
        this.v12 = Vec3.create();
        this.v13 = Vec3.create();
        this.v14 = Vec3.create();
        this.v15 = Vec3.create();
        this.v16 = Vec3.create();
        this.v17 = Vec3.create();

        this.m0 = Mat44.create();
        this.m1 = Mat44.create();
        this.m2 = Mat44.create();
        this.m3 = Mat44.create();
    };

    Camera.prototype.createPerspectiveTransform = function (fNear, fFar, fov) {
        const s = 1 / (Math.tan(fov * 0.5));
        const frustumDepth = (fFar - fNear);
        const k = fFar / frustumDepth;
        const o = -1 * (fFar * fNear) / frustumDepth;

        return Mat44.create(
            s, 0, 0, 0,
            0, s, 0, 0,
            0, 0, k, -1,
            0, 0, o, 0);
    };

    Camera.prototype.createOrthographicTransform = function (left, right, top, bottom, fNear, fFar) {
        const m00 = (2 / (right - left));
        const m11 = (2 / (top - bottom));
        const m23 = -(2 / (fFar - fNear));
        const m30 = -((right + left) / (right - left));
        const m31 = -((top + bottom) / (top - bottom));
        const m32 = -((fFar + fNear) / (fFar - fNear));
        return Mat44.create(
            m00, 0, 0, 0,
            0, m11, 0, 0,
            0, 0, m23, 0,
            m30, m31, m32, 1);
    };

    Camera.prototype.applyProjectionAndConvertToNDC = function (pWorld, pRaster) {
        // Transform camera's world coordinates to camera coordinates
        const pCamera = Mat44.multiplyVector(pWorld, this.worldToCamera, this.v0);

        // Transform local camera coordinates to canonical viewing volume (unit box)
        const pScreen = Mat44.multiplyVector(pCamera, this.projectionTransform, this.v1);

        // Transform image-plane/screen coordinates to NDC coordinates
        const pNDC = this.p0;

        pNDC[0] = (pScreen[0] + (this.canvasWidth * 0.5)) / this.canvasWidth;
        pNDC[1] = (pScreen[1] / this.aspectRatio + (this.canvasHeight * 0.5)) / this.canvasHeight;

        //https://www.html5rocks.com/en/tutorials/canvas/performance/
        pRaster[0] = (0.5 + (pNDC[0] * this.imageWidth)) | 0;
        pRaster[1] = (0.5 + ((1 - pNDC[1]) * this.imageHeight)) | 0;
        pRaster[2] = pCamera[2];
    }

    // Converts the vertex in world space to the camera's space
    Camera.prototype.toCameraSpace = function (vWorld, vCamera) {
        return Mat44.multiplyVector(vWorld, this.worldToCamera, vCamera);
    };

    // Project vertices in camera space to image space
    Camera.prototype.applyProjection = function (vCamera, vScreen) {
        return Mat44.multiplyHomogeneousVector(vCamera, this.projectionTransform, vScreen);
    };

    // Convert vertices in image space to NDC space
    Camera.prototype.toNdc = function (vScreen, vNDC) {
        const canvasWidth = this.canvasWidth;
        const canvasHeight = this.canvasHeight;
        vNDC[0] = (vScreen[0] + (canvasWidth * 0.5)) / canvasWidth;
        vNDC[1] = (vScreen[1] / this.aspectRatio + (canvasHeight * 0.5)) / canvasHeight;
        return vNDC;
    };

    Camera.prototype.toRaster = function (vNDC, vRaster) {
        //https://www.html5rocks.com/en/tutorials/canvas/performance/
        vRaster[0] = (vNDC[0] * this.imageWidth) | 0;
        vRaster[1] = ((1 - vNDC[1]) * this.imageHeight) | 0;
        return vRaster;
    };

    Camera.prototype.update = function () {
        const rotateX = Transform.rotateX(this.pitch, this.m1);
        const rotateY = Transform.rotateY(this.yaw, this.m2);
        const rotateZ = Transform.rotateZ(this.roll, this.m3);

        const rotationXY = Mat44.multiply(rotateX, rotateY, this.m0);
        const target = Vec3.set(this.v8, 0, 0, -1);
        const lookDir = Mat44.multiplyVector(target, rotationXY, this.v2);

        Vec3.add(this.position, lookDir, target);
        this.lookAt(this.position, target);

        // Avoid creating new matrices by swapping cameraToWorld and worldToCamera
        const matrixSwap = this.cameraToWorld;
        this.cameraToWorld = Mat44.multiply(rotateZ, matrixSwap, this.worldToCamera);
        this.worldToCamera = Mat44.inverse(this.cameraToWorld, matrixSwap);
    };

    /**
     * The method is very simple and works generally well. Though it has an Achilles heels (a weakness).
     * When the camera is vertical looking straight down or straight up, the forward axis gets very close to
     * the arbitrary axis used to compute the right axis. The extreme case is of course when the froward axis
     * and this arbitrary axis are perfectly parallel e.g. when the forward vector is either (0,1,0) or (0,-1,0).
     * Unfortunately in this particular case, the cross product fails producing a result for the right vector.
     * There is actually no real solution to this problem. You can either detect this case, and choose to set
     * the vectors by hand (since you know what the configuration of the vectors should be anyway).
     * A more elegant solution can be developed using quaternion interpolation.
     */
    Camera.prototype.lookAt = function (position, target) {
        const forward = Vec3.normalised(Vec3.subtract(position, target, this.v6));
        const right = Vec3.set(this.v9, 0, 1, 0);
        if (Vec3.equals(forward, right)) {
            Vec3.set(right, 0, 0, -1);
        } else {
            Vec3.cross(Vec3.normalised(Vec3.set(this.v10, 0, 1, 0)), forward, right);
        }

        const up = Vec3.cross(forward, right, this.v2Raster);

        const cameraToWorld = Mat44.create();
        cameraToWorld[0][0] = right[0];
        cameraToWorld[0][1] = right[1];
        cameraToWorld[0][2] = right[2];
        cameraToWorld[1][0] = up[0];
        cameraToWorld[1][1] = up[1];
        cameraToWorld[1][2] = up[2];
        cameraToWorld[2][0] = forward[0];
        cameraToWorld[2][1] = forward[1];
        cameraToWorld[2][2] = forward[2];
        cameraToWorld[3][0] = position[0];
        cameraToWorld[3][1] = position[1];
        cameraToWorld[3][2] = position[2];

        this.position = Vec3.copy(position);
        this.forward = forward;
        this.right = right;
        this.up = up;
        this.cameraToWorld = cameraToWorld;
        Mat44.inverse(this.cameraToWorld, this.worldToCamera);
        Mat44.transpose(this.worldToCamera, this.transformNormals);
    };

    Camera.prototype.triangleNormal = function (v0, v1, v2) {
        const edge1 = Vec3.subtract(v1, v0, this.v3);
        const edge2 = Vec3.subtract(v2, v0, this.v4);
        const normal = Vec3.normalised(Vec3.cross(edge1, edge2, this.v5));
        return normal;
    };

    Camera.prototype.direction = function (initial, final) {
        return Vec3.normalised(Vec3.subtract(final, initial, this.v7));
    };

    Camera.prototype.moveForward = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.forward, -ds, this.v12));
    };

    Camera.prototype.moveBackward = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.forward, ds, this.v13));
    };

    Camera.prototype.moveRight = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.right, ds, this.v14));
    };

    Camera.prototype.moveLeft = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.right, -ds, this.v15));
    };

    Camera.prototype.moveUp = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.up, -ds, this.v16));
    };

    Camera.prototype.moveDown = function (ds) {
        Vec3.added(this.position, Vec3.normalise(this.up, ds, this.v17));
    };

    Camera.prototype.yawRight = function (dTheta) {
        this.yaw -= dTheta;
    };

    Camera.prototype.yawLeft = function (dTheta) {
        this.yaw += dTheta;
    };

    Camera.prototype.pitchUp = function (dTheta) {
        this.pitch += dTheta;
    };

    Camera.prototype.pitchDown = function (dTheta) {
        this.pitch -= dTheta;
    };

    Camera.prototype.rollClockwise = function (dTheta) {
        this.roll -= dTheta;
    };

    Camera.prototype.rollCounterClockwise = function (dTheta) {
        this.roll += dTheta;
    };

    this.init(options);
};
