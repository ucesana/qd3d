import {Vec3} from "../mathematics/vec3";


export const Material = function (options) {
    const settings = Object.assign({
        ambient: Vec3.create(1, 1, 1), // ambient reflection coefficient
        diffuse: Vec3.create(1, 1, 1), // diffuse reflection coefficient
        specular: Vec3.create(1, 1, 1), // specular reflection coefficient
        shininess: 1250, //shininess constant
        alpha: 1, // transparency
        pattern: function (st) {
            // const scale = 4;
             //const checker = (((st[0] * scale) % 1.0) > 0.5) ^ (((st[1] * scale) % 1.0) < 0.5);
             //return 0.2 * (1 - checker) + 0.8 * checker;
            return 1;
        }
    }, options || {});

    this.ambient = settings.ambient;
    this.diffuse = settings.diffuse;
    this.specular = settings.specular;
    this.shininess = settings.shininess;
    this.alpha = settings.alpha;
    this.pattern = settings.pattern;
    this.shadow = true;
    this.texture = settings.texture;
};
