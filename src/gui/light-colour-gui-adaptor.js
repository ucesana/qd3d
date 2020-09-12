export class LightColourGuiAdaptor {
    constructor(light) {
        this.light = light;
    }
    get value() {
        return [this.light.red * 255, this.light.green * 255, this.light.blue * 255];
    }
    set value(rgb) {
        console.log(rgb);
        this.light.red = rgb[0] / 255;
        this.light.green = rgb[1] / 255;
        this.light.blue = rgb[2] / 255;
    }
};
