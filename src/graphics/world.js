import {Vec3} from "../mathematics/vec3";
import {MeshLoader} from "./mesh-loader";
import {Object as QDObject} from "./object";
import {Texture} from "./texture";
import {Light} from "./light";
import {Shader} from "./shader";


export const World = function () {
    this.objects = [];
    this.textures = [];
    this.lights = [];
    this.ambientLight = Light.ambient();

    // Cache
    this.separation = Vec3.create();
};

World.prototype.update = function (elapsedSeconds) {
    for (let i = 0; i < this.objects.length; i++) {
        const object = this.objects[i];
        object.update(elapsedSeconds);
    }
};

World.prototype.trace = function (origin, direction, maxDistance = Number.MAX_SAFE_INTEGER) {
    let hitObject = null;
    let tNear = maxDistance;

    for (let i = 0; i < this.objects.length; i++) {
        const object = this.objects[i];

        const t = object.intersect(origin, direction, this.separation);
        if (t != null && t < tNear) {
            hitObject = object;
            tNear = t;
        }
    }

    return {
        hitObject: hitObject,
        t: tNear
    };
};

World.prototype.import = function (data, type) {
    switch (type) {
        case "mesh":
            const meshLoader = new MeshLoader();
            const mesh = meshLoader.load(data);
            const object = new QDObject();
            object.mesh = mesh;
            this.objects.push(object);
            break;
        case "texture":
            const texture = new Texture();
            texture.pixels = data.bufferedImageData;
            texture.width = data.width;
            texture.height = data.height;
            this.textures.push(texture);
            // TODO: Apply to all objects for now
            for (let i = 0; i < this.objects.length; i++) {
                const object = this.objects[i];
                object.material.texture = texture;
            }
            break;
    }
};

World.prototype.light = function (light) {
    switch (light.type) {
        case Light.TYPE.AMBIENT:
            this.ambientLight = light;
            break;
        default:
            this.lights.push(light);
    }
    return this;
};
