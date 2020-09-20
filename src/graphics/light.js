import { Vec3 } from "../mathematics/vec3";
import { Object as QDObject } from "./object";

const AmbientLight = function (options) {
    const settings = Object.assign({
        red: 1,
        green: 1,
        blue: 1,
        intensity: 1
    }, options || {});

    this.red = settings.red;
    this.green = settings.green;
    this.blue = settings.blue;
    this.intensity = settings.intensity;
};

AmbientLight.prototype.getIlluminationAt = function (point) {
    return {
        direction: null,
        distance: null,
        intensity: this.intensity
    };
};

const DistantLight = function (options) {
    const settings = Object.assign({
        red: 1,
        green: 1,
        blue: 1,
        intensity: 1,
        direction: Vec3.create(0, 0, 1)
    }, options || {});

    this.red = settings.red;
    this.green = settings.green;
    this.blue = settings.blue;
    this.intensity = settings.intensity;
    this.direction = settings.direction;
};

DistantLight.prototype.getIlluminationAt = function (point) {
    return {
        direction: this.direction,
        distance: Number.MAX_SAFE_INTEGER,
        intensity: this.intensity
    };
};

const PointLight = function (options) {
    const settings = Object.assign({
        red: 1,
        green: 1,
        blue: 1,
        intensity: 1,
        position: Vec3.create(0, 0, 0)
    }, options || {});

    this.red = settings.red;
    this.green = settings.green;
    this.blue = settings.blue;
    this.intensity = settings.intensity;
    this.object = new QDObject();
    this.object.positionAndOrient(options.position);
    this.direction = Vec3.create();
};

PointLight.prototype.getIlluminationAt = function (point) {
    Vec3.subtract(this.object.position, point, this.direction);
    const norm = Vec3.norm(this.direction);
    Vec3.normalised(this.direction);
    return {
        direction: this.direction,
        distance: Math.sqrt(norm),
        intensity: (this.intensity / (4 * Math.PI * norm))
    };
};

export const Light = function () {

};

Light.TYPE = {
    AMBIENT: AmbientLight,
    DISTANT: DistantLight,
    POINT: PointLight
};

Light.of = function (T, options) {
    const light = new T(options);
    light.type = T;
    return light;
};


Light.ambient = function (options) {
    return Light.of(Light.TYPE.AMBIENT, options);
};

Light.distant = function (options) {
    return Light.of(Light.TYPE.DISTANT, options);
};

Light.point = function (options) {
    return Light.of(Light.TYPE.POINT, options);
};
