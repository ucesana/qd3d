export const ResourceLoader = function () {
};

ResourceLoader.prototype.loadText = function (file, callback) {
    const reader = new FileReader();
    reader.onload = function () {
        callback(reader.result);
    };
    reader.readAsText(file);
};

ResourceLoader.prototype.loadImage = function (file, callback) {
    const self = this;
    const reader = new FileReader();
    reader.onload = function () {
        const imageElement = document.createElement("img");
        imageElement.setAttribute("style", "display: none;");
        document.body.appendChild(imageElement);
        const image = new Image();
        image.onload = function () {
            imageElement.src = this.src;
            const width = imageElement.width;
            const height = imageElement.height;
            const canvas = document.createElement("canvas");
            canvas.setAttribute("style", "display: none;");
            canvas.width = width;
            canvas.height = height;
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageElement, 0, 0, width, height);
            const data = ctx.getImageData(0, 0, width, height).data;
            canvas.remove();
            imageElement.remove();
            callback({
                data: data,
                width: width,
                height: height
            });
        };
        image.src = reader.result;
    };
    reader.readAsDataURL(file);
};
