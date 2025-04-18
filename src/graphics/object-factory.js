import { math } from "../mathematics/math"
import { Vec3 } from "../mathematics/vec3"
import { Material } from "./material";
import { MeshFactory } from "./mesh-factory"
import { MeshLoader } from "./mesh-loader"
import {Object as QDObject, Object} from "./object"

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

ObjectFactory.prototype.terrain = function (options) {
    function generateTerrainOBJ(width, height, baseScale) {
        const noise = new Noise(Math.random());
        const vertices = [];
        const faces = [];

        function fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
            let total = 0;
            let frequency = 1;
            let amplitude = 1;
            let maxValue = 0;

            for (let i = 0; i < octaves; i++) {
                total += noise.perlin2(x * frequency, y * frequency) * amplitude;
                maxValue += amplitude;

                amplitude *= persistence;
                frequency *= lacunarity;
            }
            return total / maxValue;
        }

        // Generate vertices
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = x / width;
                const ny = y / height;
                const elevation = fbm(nx * baseScale, ny * baseScale);
                const z = (elevation * 20).toFixed(2); // exaggerate elevation
                vertices.push([x, z, y]);
            }
        }

        // Generate faces
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                const i = y * width + x + 1;
                const iRight = i + 1;
                const iDown = i + width;
                const iDownRight = i + width + 1;

                faces.push([i, iDown, iRight]);
                faces.push([iRight, iDown, iDownRight]);
            }
        }

        // Convert to OBJ
        let obj = '';
        for (const v of vertices) {
            obj += `v ${v[0]} ${v[1]} ${v[2]}\n`;
        }
        for (const f of faces) {
            obj += `f ${f[0]} ${f[1]} ${f[2]}\n`;
        }

        return obj;
    }

    return generateTerrainOBJ(100, 100, 4);
};

ObjectFactory.prototype.perlinSphere = function () {
    function generateSphereTerrainOBJ(latBands, lonBands, radius) {
        const noise = new Noise(Math.random());
        const vertices = [];
        const faces = [];

        function fbm3(x, y, z, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
            let total = 0;
            let frequency = 1;
            let amplitude = 1;
            let maxValue = 0;

            for (let i = 0; i < octaves; i++) {
                total += noise.perlin3(x * frequency, y * frequency, z * frequency) * amplitude;
                maxValue += amplitude;
                amplitude *= persistence;
                frequency *= lacunarity;
            }
            return total / maxValue;
        }

        // Generate sphere vertices
        for (let lat = 0; lat <= latBands; lat++) {
            const theta = lat * Math.PI / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonBands; lon++) {
                const phi = lon * 2 * Math.PI / lonBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                // Unit vector for sphere
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                // Sample FBM noise
                const noiseValue = fbm3(x, y, z);
                const displacement = 1 + noiseValue * 0.3; // tweak 0.3 for terrain roughness
                const finalX = x * radius * displacement;
                const finalY = y * radius * displacement;
                const finalZ = z * radius * displacement;

                vertices.push([finalX.toFixed(3), finalY.toFixed(3), finalZ.toFixed(3)]);
            }
        }

        // Generate faces
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                const first = (lat * (lonBands + 1)) + lon + 1;
                const second = first + lonBands + 1;

                faces.push([first, second, first + 1]);
                faces.push([first + 1, second, second + 1]);
            }
        }

        // Build OBJ
        let obj = '';
        for (const v of vertices) {
            obj += `v ${v[0]} ${v[1]} ${v[2]}\n`;
        }
        for (const f of faces) {
            obj += `f ${f[0]} ${f[1]} ${f[2]}\n`;
        }

        return obj;
    }

    const lat = 128;
    const lon = lat * 2;
    return generateSphereTerrainOBJ(lat, lon, 10); // lat, lon, radius
};

ObjectFactory.prototype.perlinIcosphere = function (displacement = 60, radius = 50, subdivisions = 6) {
    class Vec3 {
        constructor(x, y, z) {
            this.x = x; this.y = y; this.z = z;
        }
        add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
        sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
        mul(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
        normalize() {
            const len = Math.hypot(this.x, this.y, this.z);
            return new Vec3(this.x / len, this.y / len, this.z / len);
        }
        key() { return `${this.x.toFixed(5)}_${this.y.toFixed(5)}_${this.z.toFixed(5)}`; }
    }

    function generateIcosphere(subdiv) {
        const t = (1 + Math.sqrt(5)) / 2;
        let vertices = [
            new Vec3(-1,  t, 0), new Vec3( 1,  t, 0), new Vec3(-1, -t, 0), new Vec3( 1, -t, 0),
            new Vec3(0, -1,  t), new Vec3(0,  1,  t), new Vec3(0, -1, -t), new Vec3(0,  1, -t),
            new Vec3( t, 0, -1), new Vec3( t, 0,  1), new Vec3(-t, 0, -1), new Vec3(-t, 0,  1)
        ].map(v => v.normalize());

        let faces = [
            [0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11],
            [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8],
            [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9],
            [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]
        ];

        const midCache = new Map();
        function getMidpoint(v1, v2) {
            const key = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;
            if (midCache.has(key)) return midCache.get(key);
            const mid = vertices[v1].add(vertices[v2]).mul(0.5).normalize();
            const idx = vertices.length;
            vertices.push(mid);
            midCache.set(key, idx);
            return idx;
        }

        for (let i = 0; i < subdiv; i++) {
            const newFaces = [];
            for (const [a,b,c] of faces) {
                const ab = getMidpoint(a,b);
                const bc = getMidpoint(b,c);
                const ca = getMidpoint(c,a);
                newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
            }
            faces = newFaces;
        }

        return { vertices, faces };
    }

    function fbm(noise, x, y, z, octaves = 4) {
        let total = 0, amplitude = 1, frequency = 1, max = 0;
        for (let i = 0; i < octaves; i++) {
            total += noise.perlin3(x * frequency, y * frequency, z * frequency) * amplitude;
            max += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }
        return total / max;
    }

    function generate() {
        const { vertices, faces } = generateIcosphere(subdivisions);
        const noise = new Noise(Math.random());

        const displaced = vertices.map(v => {
            const h = fbm(noise, v.x, v.y, v.z) * 0.5 + 0.5;
            const r = radius + h * displacement;
            return v.normalize().mul(r);
        });

        let obj = '';
        displaced.forEach(v => obj += `v ${v.x.toFixed(5)} ${v.y.toFixed(5)} ${v.z.toFixed(5)}\n`);
        faces.forEach(([a,b,c]) => obj += `f ${a+1} ${b+1} ${c+1}\n`);

        return obj;
    }

    return generate();
};