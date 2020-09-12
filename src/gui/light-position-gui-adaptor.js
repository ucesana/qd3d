export class LightPositionGuiAdaptor {
    constructor(light, coordinate) {
        this.light = light;
        this.coordinate = coordinate;
    }
    get value() {
        return this.light.object.position[this.coordinate];
    }
    set value(coordinateValue) {
        const position = this.light.object.position;
        position[this.coordinate] = coordinateValue;
        this.light.object.positionAndOrient(position);
    }
};
