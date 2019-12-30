import {Camera} from "./camera";
import {Vec3} from "../mathematics/vec3";
import {Mat44} from "../mathematics/mat44";
import {Colour} from "./colour";
import {World} from "./world";
import {ObjectFactory} from "./object-factory";
import {OBJECT_TYPE} from "./object-factory";
import {Shader} from "./shader";
import {math} from "../mathematics/math";
import {CanvasRaster} from "./canvas-raster";
import {CanvasBuffer} from "./canvas-buffer";
import {Light} from "./light";

export const RaytraceRenderer = function (options) {
    const self = this;

    this.init = function (settings) {
        this.settings = Object.assign({
            background: Colour.WHITE,
            showWireframe: false,
            wireframeColour: Colour.ORANGE,
            showFaces: true,
            backfaceCulling: true,
            ambientLight: 0.5,
            translationSpeed: 100,
            rotationSpeed: 0.5,
            reverseYAxis: true,
            globalRotation: 0,
            globalRotationSpeed: 0,
            backgroundColour: Colour.of(255, 255, 255, 255),
            world: new World()
        }, settings || {});

        this.backgroundColour = this.settings.backgroundColour;

        this.world = this.settings.world;

        this.globalRotation = this.settings.globalRotation;
        this.globalRotationSpeed = this.settings.globalRotationSpeed;

        const objectFactory = new ObjectFactory();

        const numSpheres = 12;
        for (let i = 0; i < numSpheres; i++) {
            const randPos = Vec3.create((0.5 - Math.random()) * 250, (0.5 - Math.random()) * 250, (0.5 + Math.random() * 250));
            const randRadius = (0.5 + Math.random() * 64);
            const bob =  Math.PI * (Math.random() * 90) / 180;
            const amp = Math.random() * 5;
            const sphere = objectFactory.sphere({
                type: OBJECT_TYPE.GEOMETRIC,
                position: randPos,
                radius: randRadius
            });
            sphere.positionAndOrient(sphere.position);
            sphere.bob = bob;
            sphere.amp = amp;
            this.world.objects.push(sphere);
        }

        this.settings.imageWidth = this.settings.width / Math.round(this.settings.pixelWidth);
        this.settings.imageHeight = this.settings.height / Math.round(this.settings.pixelHeight);

        // this.canvasRaster = new CanvasRaster(this.settings);
        this.canvasRaster = new CanvasBuffer(this.settings);

        this.camera = new Camera(this.settings);
        const cameraPosition = Vec3.create(0, 0, 450);
        this.camera.lookAt(cameraPosition, Vec3.ORIGIN);

        this.shader = new Shader(this.settings);

        // Cache
        this.v1 = Vec3.create();
        this.v2 = Vec3.create();
        this.v9 = Vec3.create();
        this.v10 = Vec3.create();
        this.v11 = Vec3.create();
        this.v12 = Vec3.create();
        this.v13 = Vec3.create();
    };

    this.init(options);
};

RaytraceRenderer.prototype.render = function (elapsedSeconds) {
    const camera = this.camera;
    this.globalRotationDelta = (this.globalRotationSpeed * elapsedSeconds);
    this.globalRotation = this.globalRotation + this.globalRotationDelta;

    const scale = Math.tan(math.toRadians(this.settings.fov * 0.5));
    const imageAspectRatio = this.settings.imageWidth / this.settings.imageHeight;

    for (let i = 0; i < this.world.objects.length; i++) {
        const object = this.world.objects[i];
        object.bob += 0.08;
        const delta = object.amp * Math.sin(object.bob);
        Vec3.added(object.position, Vec3.normalise(object.forward, delta));
        Vec3.added(object.position, Vec3.normalise(object.up, delta));
        Vec3.added(object.position, Vec3.normalise(object.right, delta));
        object.update();
    }

    camera.update();

    this.world.update(elapsedSeconds);

    for (let j = 0; j < this.settings.imageHeight; j++) {
        for (let i = 0; i < this.settings.imageWidth; i++) {
            const x = (2 * (i + 0.5) / this.settings.imageWidth - 1) * scale;
            const y = (1 - 2 * (j + 0.5) / this.settings.imageHeight) * scale * 1 / imageAspectRatio;

            const dir = this.v9;
            const screen = Vec3.set(this.v10, x, y, -1);
            Mat44.multiplyDirection(screen, camera.cameraToWorld, dir);
            Vec3.normalised(dir);

            const pixelColour = this.castRay(camera, dir);
            this.canvasRaster.setPixel(i, j, pixelColour);
        }
    }

    this.canvasRaster.update();
};

RaytraceRenderer.prototype.castRay = function (camera, direction) {
    let pixelColour = this.backgroundColour;

    const origin = camera.position;

    const intersect = this.world.trace(origin, direction);

    if (intersect.hitObject != null) {
        const object = intersect.hitObject;
        const t = intersect.t;
        const point = Vec3.add(origin, Vec3.scale(direction, t, this.v11), this.v12);
        const surface = object.getSurfaceAt(point);
        const viewDirection = Vec3.createDirection(point, camera.position, this.v13);
        pixelColour = this.shader.shade(point, surface, viewDirection);
    }

    return pixelColour;
};
