export const TextureLoader = function () {

};

TextureLoader.prototype.load = function (src, callback) {
    const image = document.createElement("img");
    image.setAttribute("style", "display: none;");
    document.body.appendChild(image);
    const downloadingImage = new Image();
    downloadingImage.onload = function() {
        image.src = this.src;
        const imageWidth = image.width;
        const imageHeight = image.height;
        const canvas = document.createElement("canvas");
        canvas.setAttribute("style", "display: none;");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
        const bufferedImageData = ctx.getImageData(0, 0, imageWidth, imageHeight).data;
        canvas.remove();
        image.remove();
        callback({
            data: bufferedImageData,
            width: imageWidth,
            height: imageHeight
        });
    };
    downloadingImage.src = src;
};
