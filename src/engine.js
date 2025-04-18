import { polyFillRequestAnimationFrame, toggleFullScreen } from "./core/document";
import { RasterRenderer } from "./graphics/raster-renderer";
import { RaytraceRenderer } from "./graphics/raytrace-renderer";
import { ResourceLoader } from "./core/resource-loader";
import { VectorRenderer } from "./graphics/vector-renderer";

export const Engine = function (options) {
    const self = this;

    this.resourceLoader = new ResourceLoader();

    switch (options.renderer) {
        case "vector":
            this.renderer = new VectorRenderer(options);
            break;
        case "raytrace":
            this.renderer = new RaytraceRenderer(options);
            break;
        case "raster":
        default:
            this.renderer = new RasterRenderer(options);
    }

    this.world = options.world;

    const dropZone = document.getElementById(options.canvas);
    dropZone.addEventListener('dragover', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }, false);
    const createFileDropHandler = function () {
        return (function handleFileSelect(event) {
            event.stopPropagation();
            event.preventDefault();

            const files = event.dataTransfer.files;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileType = file.name.split(".")[1].toLowerCase();
                switch (fileType) {
                    case "obj":
                        self.resourceLoader.loadText(file, function (result) {
                            self.world.import(result, "mesh");
                        });
                        break;
                    case "jpg":
                    case "jpeg":
                    case "png":
                        self.resourceLoader.loadImage(file, function (result) {
                            self.world.import(result, "texture");
                        });
                        break;
                }
            }
        });
    };
    dropZone.addEventListener('drop', createFileDropHandler(), false);

    this.keyPressed = {};

    window.addEventListener("keydown", function (event) {
        if (event.key) {
            const key = event.key.toUpperCase();
            self.keyPressed[key] = true;
        }
    });

    window.addEventListener("keyup", function (event) {
        if (event.key) {
            const key = event.key.toUpperCase();
            self.keyPressed[key] = false;
        }
    });

    window.addEventListener("keyup", function (event) {
        if (event.key) {
            const key = event.key.toUpperCase();
            self.handleKeyUp(key);
        }
    });
};

Engine.prototype.handleKeyUp = function (key) {
    switch (key) {
        case "F":
            toggleFullScreen();
            break;
        default:
            break;
    }
};

Engine.prototype.handleKeyPress = function (elapsedSeconds) {
    const settings = this.renderer.settings;
    const ds = settings.translationSpeed * elapsedSeconds;
    const dTheta = settings.rotationSpeed * elapsedSeconds;
    const pitchDirection = ((settings.reverseYAxis) ? -1 : 1);
    const camera = this.renderer.camera;

    if (this.keyPressed["W"]) {
        camera.moveForward(ds)
    }
    if (this.keyPressed["A"]) {
        camera.moveLeft(ds);
    }
    if (this.keyPressed["S"]) {
        camera.moveBackward(ds);
    }
    if (this.keyPressed["D"]) {
        camera.moveRight(ds)
    }
    if (this.keyPressed["O"]) {
        camera.moveUp(ds);
    }
    if (this.keyPressed["U"]) {
        camera.moveDown(ds);
    }
    if (this.keyPressed["J"]) {
        camera.yawLeft(dTheta);
    }
    if (this.keyPressed["L"]) {
        camera.yawRight(dTheta);
    }
    if (this.keyPressed["I"]) {
        camera.pitchUp(dTheta * pitchDirection);
    }
    if (this.keyPressed["K"]) {
        camera.pitchDown(dTheta * pitchDirection);
    }
    if (this.keyPressed["Q"]) {
        camera.rollCounterClockwise(dTheta);
    }
    if (this.keyPressed["E"]) {
        camera.rollClockwise(dTheta);
    }
};

Engine.prototype.run = function () {
    const self = this;
    let fps = 24;
    let now;
    let then = Date.now();
    let interval = 1000 / fps;
    let delta;

    function draw() {

        requestAnimationFrame(draw);

        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

            self.handleKeyPress(delta);
            self.renderer.render(delta);
        }
    }

    draw();
};
