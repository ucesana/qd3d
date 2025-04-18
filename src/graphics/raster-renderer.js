import { Mat44 } from "../mathematics/mat44";
import { math } from "../mathematics/math";
import { Vec } from "../mathematics/vec";
import { Vec2 } from "../mathematics/vec2";
import { Vec3 } from "../mathematics/vec3";
import { Camera } from "./camera";
import { CanvasBuffer } from "./canvas-buffer";
import { Colour } from "./colour";
import { Shader } from "./shader";
import { World } from "./world";

export const RasterRenderer = function (options) {
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
            backgroundColour: Colour.of(0, 0, 0, 1)
        }, settings || {});

        this.backgroundColour = this.settings.backgroundColour;
        this.backgroundColour[0] = (this.backgroundColour[0] * 255);
        this.backgroundColour[1] = (this.backgroundColour[1] * 255);
        this.backgroundColour[2] = (this.backgroundColour[2] * 255);
        this.backgroundColour[3] = (this.backgroundColour[3] * 255);

        this.world = this.settings.world || new World();

        this.globalRotation = this.settings.globalRotation;
        this.globalRotationSpeed = this.settings.globalRotationSpeed;

        this.settings.imageWidth = this.settings.width / Math.round(this.settings.pixelWidth);
        this.settings.imageHeight = this.settings.height / Math.round(this.settings.pixelHeight);

        this.canvasRaster = new CanvasBuffer(this.settings);

        this.camera = new Camera(this.settings);
        const cameraPosition = Vec3.create(0, 0, 50);
        this.camera.lookAt(cameraPosition, Vec3.ORIGIN);

        this.shader = new Shader(this.settings);

        this.depthBuffer = [];
        for (let row = 0; row < this.settings.imageHeight; row++) {
            const colVec = [];
            for (let col = 0; col < this.settings.imageWidth; col++) {
                colVec.push(Number.MAX_SAFE_INTEGER);
            }
            this.depthBuffer.push(colVec);
        }

        this.frameBuffer = [];
        for (let row = 0; row < this.settings.imageHeight; row++) {
            const colVec = [];
            for (let col = 0; col < this.settings.imageWidth; col++) {
                colVec.push(Colour.copy(this.backgroundColour, Colour.of(0, 0, 0, 1)));
            }
            this.frameBuffer.push(colVec);
        }

        // Cache
        this.p0 = Vec2.create();
        this.p1 = Vec2.create();
        this.p2 = Vec2.create();

        this.v0World = Vec3.create();
        this.v1World = Vec3.create();
        this.v2World = Vec3.create();
        this.v0Camera = Vec3.create();
        this.v1Camera = Vec3.create();
        this.v2Camera = Vec3.create();
        this.v0Screen = Vec.create(0, 0, 0, 1);
        this.v1Screen = Vec.create(0, 0, 0, 1);
        this.v2Screen = Vec.create(0, 0, 0, 1);
        this.vp0Screen = Vec3.create();
        this.vp1Screen = Vec3.create();
        this.vp2Screen = Vec3.create();
        this.v0NDC = Vec2.create();
        this.v1NDC = Vec2.create();
        this.v2NDC = Vec2.create();
        this.v0Raster = Vec2.create();
        this.v1Raster = Vec2.create();
        this.v2Raster = Vec2.create();

        this.faceNormal = Vec3.create();
        this.faceCentre = Vec3.create();
        this.cameraRay = Vec3.create();
        this.st0 = Vec3.create();
        this.st1 = Vec3.create();
        this.st2 = Vec3.create();
        this.v15 = Vec3.create();
        this.v16 = Vec3.create();
        this.v17 = Vec3.create();
        this.v18 = Vec3.create();
        this.v19 = Vec3.create();
        this.vn0 = Vec3.create();
        this.vn1 = Vec3.create();
        this.vn2 = Vec3.create();
        this.v23 = Vec3.create();
        this.v24 = Vec3.create();
        this.v25 = Vec3.create();
        this.v26 = Vec3.create();
        this.v27 = Vec3.create();
        this.v28 = Vec3.create();
        this.v29 = Vec3.create();

        this.face = {
            object: null,
            material: null,
            st: null,
            uv: null,
            normal: null,
            vn0: null,
            vn1: null,
            vn2: null
        };
    };

    this.init(options);
};

RasterRenderer.prototype.render = function (elapsedSeconds) {
    const camera = this.camera;
    const objects = this.world.objects;
    const globalRotationDelta = (this.globalRotationSpeed * elapsedSeconds);
    this.globalRotation = this.globalRotation + globalRotationDelta;

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const mesh = object.mesh;
        const vertices = mesh.vertices;
        const triangles = mesh.faces;
        const faceCount = mesh.faceCount;
        const textureVertices = mesh.textureVertices;
        const textures = mesh.textures;
        const vertexNormals = mesh.vertexNormals;
        const normals = mesh.normals;

        object.rotation[0] += globalRotationDelta * 0.25;
        object.rotation[1] += globalRotationDelta * 0.5;
        object.rotation[2] += globalRotationDelta * 0.75;
        object.update();

        camera.update();

        for (let i = 0; i < faceCount; i++) {
            // Extract the face's vertices in the object's local space
            const vertex0 = i * 3;
            const vertex1 = vertex0 + 1;
            const vertex2 = vertex0 + 2;
            const v0Local = vertices[triangles[vertex0]];
            const v1Local = vertices[triangles[vertex1]];
            const v2Local = vertices[triangles[vertex2]];

            // Convert the vertices to world space
            const v0World = Mat44.multiplyVector(v0Local, object.localToWorld, this.v0World);
            const v1World = Mat44.multiplyVector(v1Local, object.localToWorld, this.v1World);
            const v2World = Mat44.multiplyVector(v2Local, object.localToWorld, this.v2World);

            // Do not draw faces whose normals point away from camera
            const faceNormal = math.triangleNormal(v0World, v1World, v2World, this.faceNormal);
            const faceCentre = math.triangleCentroid(v0World, v1World, v2World, this.faceCentre);
            const cameraRay = Vec3.createDirection(faceCentre, camera.position, this.cameraRay);
            let drawFace = true;
            if (this.settings.backfaceCulling) {
                drawFace = (Vec3.dot(faceNormal, cameraRay) >= 0);
            }

            if (drawFace) {
                const v0Camera = camera.toCameraSpace(v0World, this.v0Camera);
                const v1Camera = camera.toCameraSpace(v1World, this.v1Camera);
                const v2Camera = camera.toCameraSpace(v2World, this.v2Camera);

                const v0Screen = camera.applyProjection(v0Camera, this.v0Screen);
                const v1Screen = camera.applyProjection(v1Camera, this.v1Screen);
                const v2Screen = camera.applyProjection(v2Camera, this.v2Screen);

                if (this.withinNearAndFar(v0Screen, v1Screen, v2Screen)) {

                    const vp0Screen = this.perspectiveDivide(v0Screen, this.vp0Screen);
                    const vp1Screen = this.perspectiveDivide(v1Screen, this.vp1Screen);
                    const vp2Screen = this.perspectiveDivide(v2Screen, this.vp2Screen);

                    const v0NDC = camera.toNdc(vp0Screen, this.v0NDC);
                    const v1NDC = camera.toNdc(vp1Screen, this.v1NDC);
                    const v2NDC = camera.toNdc(vp2Screen, this.v2NDC);

                    const v0Raster = camera.toRaster(v0NDC, this.v0Raster);
                    const v1Raster = camera.toRaster(v1NDC, this.v1Raster);
                    const v2Raster = camera.toRaster(v2NDC, this.v2Raster);

                    if (this.withinViewport(v0Raster, v1Raster, v2Raster)) {
                        const area = math.edgeFunction(v0Raster, v1Raster, v2Raster);
                        if (area > 0) {
                            const oneOnArea = 1 / area;

                            let st0 = null;
                            let st1 = null;
                            let st2 = null;
                            if (textureVertices && textureVertices.length > 0) {
                                st0 = Vec2.scale(textureVertices[textures[vertex0]], v0Screen[2], this.st0);
                                st1 = Vec2.scale(textureVertices[textures[vertex1]], v1Screen[2], this.st1);
                                st2 = Vec2.scale(textureVertices[textures[vertex2]], v2Screen[2], this.st2);
                            }

                            let vn0 = null;
                            let vn1 = null;
                            let vn2 = null;
                            if (vertexNormals && vertexNormals.length > 0) {
                                vn0 = vertexNormals[normals[vertex0]];
                                vn1 = vertexNormals[normals[vertex1]];
                                vn2 = vertexNormals[normals[vertex2]];

                                vn0 = Vec3.normalised(Mat44.multiplyDirection(vn0, object.transformNormals, this.vn0));
                                vn1 = Vec3.normalised(Mat44.multiplyDirection(vn1, object.transformNormals, this.vn1));
                                vn2 = Vec3.normalised(Mat44.multiplyDirection(vn2, object.transformNormals, this.vn2));
                            }

                            const min = this.p0;
                            const max = this.p1;
                            const pixelSample = this.p2;
                            math.minMaxTriangle(v0Raster, v1Raster, v2Raster, min, max);

                            for (let y = min[1]; y < max[1]; y++) {
                                for (let x = min[0]; x < max[0]; x++) {
                                    Vec2.set(pixelSample, x + 0.5, y + 0.5);
                                    if (this.insideScreen(pixelSample)) {
                                        let w0 = math.edgeFunction(v1Raster, v2Raster, pixelSample);
                                        let w1 = math.edgeFunction(v2Raster, v0Raster, pixelSample);
                                        let w2 = math.edgeFunction(v0Raster, v1Raster, pixelSample);
                                        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
                                            // Perspective correct depth
                                            const w0z = w0 * oneOnArea;
                                            const w1z = w1 * oneOnArea;
                                            const w2z = w2 * oneOnArea;

                                            const v0z = v0Screen[2];
                                            const v1z = v1Screen[2];
                                            const v2z = v2Screen[2];

                                            const zDivisor = (w0z * v0z + w1z * v1z + w2z * v2z);
                                            if (zDivisor < 0) {
                                                let z = 1 / zDivisor;

                                                if (z < this.depthBuffer[y][x]) {
                                                    this.depthBuffer[y][x] = z;

                                                    let st = Vec2.set(this.v19, 0, 0);
                                                    if (textureVertices && textureVertices.length > 0) {
                                                        st = Vec2.add(
                                                            Vec2.add(
                                                                Vec2.scale(st0, w0z, this.v15),
                                                                Vec2.scale(st1, w1z, this.v16),
                                                                this.v17
                                                            ),
                                                            Vec2.scale(st2, w2z, this.v18),
                                                            this.v19
                                                        );
                                                        Vec2.scaled(st, z);
                                                    }

                                                    const point = Vec3.add(
                                                        Vec3.add(
                                                            Vec3.scale(v0World, w0z, this.v23),
                                                            Vec3.scale(v1World, w1z, this.v24),
                                                            this.v25
                                                        ),
                                                        Vec3.scale(v2World, w2z, this.v26),
                                                        this.v27
                                                    );
                                                    const viewDirection = Vec3.createDirection(point, camera.position, this.v28);

                                                    const face = this.face;
                                                    face.object = object;
                                                    face.material = object.material;
                                                    face.st = st;
                                                    face.uv = Vec3.set(this.v29, w0z, w1z, w2z);
                                                    face.normal = faceNormal;
                                                    face.vn0 = vn0;
                                                    face.vn1 = vn1;
                                                    face.vn2 = vn2;

                                                    const pixelColour = this.shader.shade(point, face, viewDirection);
                                                    Colour.copy(pixelColour, this.frameBuffer[y][x]);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    for (let y = 0; y < this.settings.imageHeight; y++) {
        for (let x = 0; x < this.settings.imageWidth; x++) {
            const pixelColour = this.frameBuffer[y][x];
            this.canvasRaster.setPixel(x, y, pixelColour);

            // Reset buffers
            this.depthBuffer[y][x] = Number.MAX_SAFE_INTEGER;
            Colour.copy(this.backgroundColour, this.frameBuffer[y][x]);
        }
    }

    this.canvasRaster.update();
};

RasterRenderer.prototype.clip = function (v) {
    const x = v[0];
    const y = v[1];
    const z = v[2];
    const w = v[3];
    const nw = -w;

    return ((x >= nw && x <= w) && (y >= nw && y <= w) && (z >= nw && z <= w) && (Math.abs(w) > 0));
};

RasterRenderer.prototype.withinNearAndFar = function (v0, v1, v2) {
    const z0 = -v0[2];
    const z1 = -v1[2];
    const z2 = -v2[2];

    const settings = this.settings;
    const n = settings.fNear;
    const f = settings.fFar;

    return ((z0 > n && z0 < f)
        || (z1 > n && z1 < f)
        || (z2 > n && z2 < f));
};

RasterRenderer.prototype.perspectiveDivide = function (vScreen, vpScreen) {
    const w = vScreen[3];
    vpScreen[0] = vScreen[0] / w;
    vpScreen[1] = vScreen[1] / w;
    vpScreen[2] = vScreen[2] / w;
    return vpScreen;
};

RasterRenderer.prototype.withinViewport = function (v0, v1, v2) {
    const x0 = v0[0];
    const y0 = v0[1];
    const z0 = -v0[2];

    const x1 = v1[0];
    const y1 = v1[1];
    const z1 = -v1[2];

    const x2 = v2[0];
    const y2 = v2[1];
    const z2 = -v2[2];

    const settings = this.settings;
    const w = settings.imageWidth;
    const h = settings.imageHeight;
    const n = settings.fNear;
    const f = settings.fFar;

    // return ((x0 >= 0 && x0 < w && y0 >= 0 && y0 < h && z0 > n && z0 < f)
    //     || (x1 >= 0 && x1 < w && y1 >= 0 && y1 < h && z1 > n && z1 < f)
    //     || (x2 >= 0 && x2 < w && y2 >= 0 && y2 < h && z2 > n && z2 < f));

    return ((x0 >= 0 && x0 < w && y0 >= 0 && y0 < h)
        || (x1 >= 0 && x1 < w && y1 >= 0 && y1 < h)
        || (x2 >= 0 && x2 < w && y2 >= 0 && y2 < h));
};

RasterRenderer.prototype.insideScreen = function (p) {
    const x = p[0];
    const y = p[1];
    const w = this.settings.imageWidth;
    const h = this.settings.imageHeight;
    return (x >= 0 && x < w && y >= 0 && y < h);
};
