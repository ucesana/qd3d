export const CanvasRaster = function (options) {
    this.settings = Object.assign({
        canvas: "canvas",
        width: 640,
        height: 480,
        pixelWidth: 1,
        pixelheight: 1
    }, options || {});

    this.canvasElement = document.getElementById(this.settings.canvas);
    this.size(this.settings.width, this.settings.height);
    this.ctx = this.canvasElement.getContext("2d", {
        alpha: false,
        antialias: false,
        depth: false
    });
    this.pixelWidth = this.settings.pixelWidth;
    this.pixelHeight = this.settings.pixelHeight;
};

CanvasRaster.prototype.size = function (width = 640, height = 480) {
    this.width = width;
    this.height = height;
    this.canvasElement.setAttribute("width", this.width);
    this.canvasElement.setAttribute("height", this.height);
};

CanvasRaster.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
};

CanvasRaster.prototype.setPixel = function (x, y, colour, pixelSize) {
    this.ctx.fillStyle = colour;
    const pixelWidth = pixelSize || this.pixelWidth;
    const pixelHeight = pixelSize || this.pixelHeight;
    this.ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
};
