import { Mat44 } from "../mathematics/mat44";
import { math } from "../mathematics/math";
import { Vec2 } from "../mathematics/vec2";
import { Vec3 } from "../mathematics/vec3";
import { Camera } from "./camera";
import { Colour } from "./colour";
import { Shader } from "./shader";
import { World } from "./world";

export const VectorRenderer = function (options) {
    const self = this;

    this.init = function (settings) {
        this.settings = Object.assign({
            background: Colour.WHITE,
            showWireframe: false,
            wireframeColour: Colour.ORANGE,
            showFaces: true,
            backfaceCulling: true,
            translationSpeed: 10,
            rotationSpeed: 0.5,
            reverseYAxis: true,
            globalRotation: 0,
            globalRotationSpeed: 0,
            backgroundColour: Uint8ClampedArray.of(0, 0, 0, 255),
            world: new World()
        }, settings || {});

        this.backgroundColour = Colour.toRgb(this.settings.backgroundColour);

        this.world = this.settings.world || new World();

        this.globalRotation = this.settings.globalRotation;
        this.globalRotationSpeed = this.settings.globalRotationSpeed;

        this.settings.imageWidth = this.settings.width / this.settings.pixelWidth;
        this.settings.imageHeight = this.settings.height / this.settings.pixelHeight;

        this.canvasElem = document.getElementById(this.settings.canvas);
        this.canvasElem.setAttribute("width", this.settings.width);
        this.canvasElem.setAttribute("height", this.settings.height);
        this.ctx = this.canvasElem.getContext("2d");

        this.camera = new Camera(this.settings);
        const cameraPosition = Vec3.create(0, 0, 5);
        this.camera.lookAt(cameraPosition, Vec3.ORIGIN);

        this.shader = new Shader(this.settings);

        // Cache
        this.p0 = Vec2.create();
        this.p1 = Vec2.create();
        this.p2 = Vec2.create();

        this.faceNormal = Vec3.create();
        this.faceCentre = Vec3.create();
        this.cameraRay = Vec3.create();
        this.v0 = Vec3.create();
        this.v1 = Vec3.create();
        this.v2 = Vec3.create();

        this.face = {
            object: null,
            material: null,
            normal: null
        };
    };

    this.init(options);
};

VectorRenderer.prototype.render = function (elapsedSeconds) {
    const camera = this.camera;
    const objects = this.world.objects;
    const globalRotationDelta = (this.globalRotationSpeed * elapsedSeconds);
    this.globalRotation = this.globalRotation + globalRotationDelta;

    const rasterTriangles = [];

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];

        const mesh = object.mesh;
        const vertices = mesh.vertices;
        const triangles = mesh.faces;
        const faceCount = mesh.faceCount;

        // Set up "World Tranmsform"
        object.rotation[0] += globalRotationDelta * 0.25;
        object.rotation[1] += globalRotationDelta * 0.5;
        object.rotation[2] += globalRotationDelta * 0.75;
        object.update();

        camera.update();

        for (let i = 0; i < faceCount; i++) {
            let v0World = vertices[triangles[i * 3]];
            let v1World = vertices[triangles[i * 3 + 1]];
            let v2World = vertices[triangles[i * 3 + 2]];
            const v0Raster = Vec3.create();
            const v1Raster = Vec3.create();
            const v2Raster = Vec3.create();

            // Apply global transformations on this object's vertices
            v0World = Mat44.multiplyVector(v0World, object.localToWorld, this.v0);
            v1World = Mat44.multiplyVector(v1World, object.localToWorld, this.v1);
            v2World = Mat44.multiplyVector(v2World, object.localToWorld, this.v2);

            const faceNormal = camera.triangleNormal(v0World, v1World, v2World, this.faceNormal);
            const faceCentre = math.triangleCentroid(v0World, v1World, v2World, this.faceCentre);
            const cameraRay = Vec3.createDirection(faceCentre, camera.position, this.cameraRay);
            let drawFace = true;
            if (this.settings.backfaceCulling) {
                const dp = Vec3.dot(faceNormal, cameraRay);
                drawFace = (dp > 0)
            }

            if (drawFace) {
                // Apply Projections and convert to raster space
                camera.applyProjectionAndConvertToNDC(v0World, v0Raster);
                camera.applyProjectionAndConvertToNDC(v1World, v1Raster);
                camera.applyProjectionAndConvertToNDC(v2World, v2Raster);

                if (this.insideScreen(v0Raster)
                    || this.insideScreen(v1Raster)
                    || this.insideScreen(v2Raster)) {

                    const min = this.p0;
                    const max = this.p1;
                    const p = this.p2;
                    math.minMaxTriangle(v0Raster, v1Raster, v2Raster, min, max);

                    const face = this.face;
                    face.object = object;
                    face.material = object.material;
                    face.normal = faceNormal;

                    const pixelColour = this.shader.shade(faceCentre, face);
                    const fillColour = Colour.toRgb(pixelColour);

                    rasterTriangles.push({
                        fillColour: fillColour,
                        v0: v0Raster,
                        v1: v1Raster,
                        v2: v2Raster
                    });
                }
            }
        }
    }

    // Triangle Depth sorting using the *Painter's Algorithm*.
    // The Painter's algorithm is simple to implement and works great if we are using vector graphics
    // to draw triangles. However, it suffers from significant overdraw and  is no good in cases
    // where triangle planes intersect or when three triangles overlap each other).
    //
    // A better solution would be to use a *depth buffer*.
    // Instead of iterating over each triangle, we would iterate over each screen pixel in image space
    // and calculating the z-depth of that pixel projected from world space to image space.
    // Then we would only draw the triangles pixel that is closest to the camera.
    // The depth buffer algorithm would only work if we were manually drawing each pixel
    // at a time to raster space. Since we are relying on vector graphics to draw triangles
    // (and getting viewport clipping for free), we can only do triangle depth sorting at the moment.
    // [See](https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/visibility-problem-depth-buffer-depth-interpolation)
    rasterTriangles.sort(function (t1, t2) {
        const z1 = (t1.v0[2] + t1.v1[2] + t1.v2[2]) / 3.0;
        const z2 = (t2.v0[2] + t2.v1[2] + t2.v2[2]) / 3.0;
        return (z1 - z2);
    });

    // const svg = new Svg();
    this.ctx.fillStyle = this.backgroundColour;
    this.ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);

    for (let i = 0; i < rasterTriangles.length; i++) {
        const rasterTriangle = rasterTriangles[i];
        const fillColour = rasterTriangle.fillColour;
        const v0Raster = rasterTriangle.v0;
        const v1Raster = rasterTriangle.v1;
        const v2Raster = rasterTriangle.v2;

        // Render SVG
        // svg.line(v0Raster[0], v0Raster[1], v1Raster[0], v1Raster[1]);
        // svg.line(v1Raster[0], v1Raster[1], v2Raster[0], v2Raster[1]);
        // svg.line(v2Raster[0], v2Raster[1], v0Raster[0], v0Raster[1]);

        // START: Render Canvas
        Vec3.scaled(v0Raster, this.settings.pixelWidth);
        Vec3.scaled(v1Raster, this.settings.pixelWidth);
        Vec3.scaled(v2Raster, this.settings.pixelWidth);

        this.ctx.beginPath();
        this.ctx.moveTo(v0Raster[0], v0Raster[1]);
        this.ctx.lineTo(v1Raster[0], v1Raster[1]);
        this.ctx.lineTo(v2Raster[0], v2Raster[1]);
        this.ctx.lineTo(v0Raster[0], v0Raster[1]);
        this.ctx.closePath();
        if (this.settings.showWireframe) {
            this.ctx.strokeStyle = this.settings.wireframeColour;
            this.ctx.fillStyle = fillColour;
        } else {
            this.ctx.strokeStyle = fillColour;
            this.ctx.fillStyle = fillColour;
        }

        if (this.settings.showFaces) {
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.stroke();
        }
    }

    // const svgText = svg.width(camera.imageWidth).height(camera.imageHeight).toString();
    // document.querySelector("#svg").innerHTML = svgText;
};

VectorRenderer.prototype.insideScreen = function (v) {
    const x = v[0];
    const y = v[1];
    const z = -v[2];

    const w = this.settings.imageWidth;
    const h = this.settings.imageHeight;
    const n = this.settings.fNear;
    const f = this.settings.fFar;
    return (x >= 0 && x <= w && y >= 0 && y <= h && z >= n && z <= f);
};
