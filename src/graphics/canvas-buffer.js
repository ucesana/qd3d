export const CanvasBuffer = function (options) {
    this.settings = Object.assign({
        canvas: "canvas",
        width: 640,
        height: 480,
        pixelWidth: 1,
        pixelheight: 1,
        alpha: true,
        antialias: false,
        depth: true
    }, options || {});

    this.canvasElement = document.getElementById(this.settings.canvas);
    this.size(this.settings.width, this.settings.height);
    this.ctx = this.canvasElement.getContext("2d", {
        alpha: this.settings.alpha,
        antialias: this.settings.antialias,
        depth: this.settings.depth
    });
    this.pixelWidth = Math.round(this.settings.pixelWidth);
    this.pixelHeight = Math.round(this.settings.pixelHeight);
    this.imageData = this.ctx.getImageData(0, 0, this.settings.width, this.settings.height);
    this.imageDataData = this.imageData.data;
    this.buffer = new ArrayBuffer(this.imageData.data.length);
    this.buffer8 = new Uint8ClampedArray(this.buffer);
    this.buffer32 = new Uint32Array(this.buffer);
};

CanvasBuffer.prototype.size = function (width = 640, height = 480) {
    this.width = width;
    this.height = height;
    this.canvasElement.setAttribute("width", this.width);
    this.canvasElement.setAttribute("height", this.height);
};

CanvasBuffer.prototype.clear = function () {
    for (let y = 0; y < this.height; y++) {
        const yw = y * this.width;
        for (let x = 0; x < this.width; x++) {
            this.buffer32[yw + x] = 0;
        }
    }
    this.update();
};

CanvasBuffer.prototype.setPixel = function (x, y, colour) {
    const width = this.width;
    const pixelWidth = this.pixelWidth;
    const pixelHeight = this.pixelHeight;
    const pixel =
        (colour[3] << 24) |
        (colour[2] << 16) |
        (colour[1] << 8) |
        colour[0];
    for (let pj = 0; pj < pixelHeight; pj++) {
        for (let pi = 0; pi < pixelWidth; pi++) {
            const index = (x * pixelWidth + pi) + (y * pixelHeight + pj) * width;
            this.buffer32[index] = pixel;
        }
    }
};

CanvasBuffer.prototype.update = function () {
    this.imageDataData.set(this.buffer8);
    this.ctx.putImageData(this.imageData, 0, 0);
};
