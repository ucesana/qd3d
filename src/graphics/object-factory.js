import { math } from "../mathematics/math"
import { Vec3 } from "../mathematics/vec3"
import { Material } from "./material";
import { MeshFactory } from "./mesh-factory"
import { MeshLoader } from "./mesh-loader"
import { Object } from "./object"

export const OBJECT_TYPE = {
    MESH: "mesh",
    GEOMETRIC: "geometric",
    ANALYTIC: "analytic"
};

export const ObjectFactory = function () {
    this.meshFactory = new MeshFactory();
    this.meshLoader = new MeshLoader();

    // Cache
    this.v0 = Vec3.create();
    this.v1 = Vec3.create();
};

ObjectFactory.prototype.meshObject = function (options) {
    return {
        type: OBJECT_TYPE.MESH,
        mesh: options.mesh,
        position: options.position || Vec3.create(),
        rotation: options.rotation || Vec3.create()
    };
};

ObjectFactory.prototype.wavefrontObject = function (options) {
    return {
        type: OBJECT_TYPE.MESH,
        mesh: this.meshLoader.load(options.data),
        position: options.position || Vec3.create(),
        rotation: options.rotation || Vec3.create()
    };
};

ObjectFactory.prototype.disk = function (options) {
    const disk = new Object();
    disk.normal = options.normal || Vec3.create();
    disk.position = options.position || Vec3.create();
    disk.radius = options.radius || 1;
    disk.radiusSquared = options.radius * options.radius || 1;
    disk.rotation = options.rotation || Vec3.create();
    disk.material = options.material || new Material();
    switch (options.type) {
        case OBJECT_TYPE.GEOMETRIC:
            disk.type = OBJECT_TYPE.GEOMETRIC;
            disk.intersect = function (origin, direction) {
                return math.intersectRayAndDisk(origin, direction, disk.position, disk.normal, disk.radiusSquared);
            };
            disk.getSurfaceAt = function (pHit) {
                const nHit = Vec3.normalised(Vec3.subtract(pHit, disk.position, this.v0));
                const texX = (1 + Math.atan2(nHit[2], nHit[0]) / Math.PI) * 0.5;
                const texY = Math.acos(nHit[1]) / Math.PI;
                const tex = Vec3.set(this.v1, texX, texY, 0);

                return {
                    object: disk,
                    material: disk.material,
                    normal: nHit,
                    st: tex
                }
            };
            break;
        case OBJECT_TYPE.MESH:
        default:
            disk.type = OBJECT_TYPE.MESH;
    }
    return disk;
};

ObjectFactory.prototype.plane = function (options) {
    const plane = new Object();
    plane.normal = options.normal || Vec3.create();
    plane.position = options.position || Vec3.create();
    plane.rotation = options.rotation || Vec3.create();
    plane.material = options.material || new Material();
    switch (options.type) {
        case OBJECT_TYPE.GEOMETRIC:
            plane.type = OBJECT_TYPE.GEOMETRIC;
            plane.intersect = function (origin, direction, separation) {
                return math.intersectRayAndPlane(origin, direction, plane.position, plane.normal);
            };
            plane.getSurfaceAt = function (point) {
                const nHit = plane.normal;
                const tex = Vec3.copy(point, this.v1);
                return {
                    object: plane,
                    material: plane.material,
                    normal: nHit,
                    st: tex
                }
            };
            break;
        case OBJECT_TYPE.MESH:
        default:
            plane.type = OBJECT_TYPE.MESH;
    }
    return plane;
};

ObjectFactory.prototype.sphere = function (options) {
    const sphere = new Object();
    sphere.radius = options.radius || 1;
    sphere.radiusSquared = sphere.radius * sphere.radius;
    sphere.position = options.position || Vec3.create();
    sphere.rotation = options.rotation || Vec3.create();
    sphere.material = options.material || new Material();
    sphere.positionAndOrient(sphere.position);
    switch (options.type) {
        case OBJECT_TYPE.GEOMETRIC:
            sphere.type = OBJECT_TYPE.GEOMETRIC;
            sphere.intersect = function (origin, direction, separation) {
                return math.intersectRayAndSphere(origin, direction, sphere.position, sphere.radiusSquared, separation);
            };
            sphere.getSurfaceAt = function (pHit) {
                const normal = Vec3.normalised(Vec3.subtract(pHit, sphere.position, this.v0));
                const texX = (1 + Math.atan2(normal[2], normal[0]) / Math.PI) * 0.5;
                const texY = Math.acos(normal[1]) / Math.PI;
                const texture = Vec3.set(this.v1, texX, texY, 0);

                return {
                    object: sphere,
                    material: sphere.material,
                    normal: normal,
                    st: texture
                }
            };
            break;
        case OBJECT_TYPE.MESH:
        default:
            sphere.type = OBJECT_TYPE.MESH;
    }
    return sphere;
};

ObjectFactory.prototype.cube = function (options) {
    const cube = new Object();
    cube.position = options.position || Vec3.create();
    cube.rotation = options.rotation || Vec3.create();
    cube.material = options.material || new Material();
    cube.positionAndOrient(cube.position);
    cube.min = options.min;
    cube.max = options.max;
    switch (options.type) {
        case OBJECT_TYPE.GEOMETRIC:
            cube.type = OBJECT_TYPE.GEOMETRIC;
            break;
        case OBJECT_TYPE.MESH:
        default:
            cube.type = OBJECT_TYPE.MESH;
            cube.mesh = this.meshFactory.get("cube", options);
    }
    return cube;
};
