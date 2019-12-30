import {Vec3} from "../mathematics/vec3";
import {Light} from "./light";


export const Shader = function (options) {
    this.width = options.width;
    this.height = options.height;
    this.world = options.world;

    this.shadowBias = 0.00041;

    // Cache
    this.v0 = Vec3.create();
    this.v1 = Vec3.create();
    this.v2 = Vec3.create();
    this.v3 = Vec3.create();
    this.v4 = Vec3.create();
    this.v5 = Vec3.create();
    this.v6 = Vec3.create();
    this.v7 = Vec3.create();
    this.v8 = Vec3.create();
    this.v9 = Vec3.create();

    this.pixel = Uint8ClampedArray.of(0, 0, 0, 0);
};

Shader.prototype.shade = function (point, face, viewDirection) {
    const world = this.world;

    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;

    const st = face.st;
    const uv = face.uv;

    let normal = face.normal;
    if (uv && face.vn0 && face.vn1 && face.vn2) {
        normal = Vec3.normalised(
            Vec3.add(
                Vec3.add(
                    Vec3.scale(face.vn2, uv[2], this.v2),
                    Vec3.scale(face.vn0, uv[0], this.v0),
                    this.v5
                ),
                Vec3.scale(face.vn1, uv[1], this.v1),
                this.v6
            )
        );
    }

    const material = face.material;

    // Add pattern
    let pattern = 1;
    if (material.pattern && st) {
        pattern = material.pattern(st);
    }

    const lights = world.lights;
    const lightCount = lights.length;

    // Add distant, point, and spot lights
    for (let i = 0; i < lightCount; i++) {
        const light = lights[i];
        const illumination = light.getIlluminationAt(point);
        const intensity = illumination.intensity;
        const lightDirection = illumination.direction;
        const lightDistance = illumination.distance;

        let isLit = false;
        if (false && material.shadow) {
            // Correct for shadow acne
            const displacedPoint = Vec3.add(point, Vec3.scale(normal, this.shadowBias, this.v3), this.v4);
            const intersect = world.trace(displacedPoint, lightDirection, lightDistance);
            isLit = (intersect.hitObject == null);
        } else {
            isLit = true;
        }

        if (isLit) {
            const lightRed = light.red;
            const lightGreen = light.green;
            const lightBlue = light.blue;

            // Diffuse
            let dR = null;
            let dG = null;
            let dB = null;

            if (st && material.texture) {
                const texture = material.texture;
                const texturePixels = texture.pixels;
                const textureWidth = texture.width;
                const textureHeight = texture.height;
                // const x = Math.round(st[0] * textureWidth);
                // const y = Math.round(textureHeight - st[1] * textureHeight);
                const x = (st[0] * textureWidth + 0.5) | 0;
                const y = (textureHeight - st[1] * textureHeight + 0.5) | 0;
                const index = ((x + y * textureWidth) * 4);
                dR = texturePixels[index] / 255;
                dG = texturePixels[index + 1] / 255;
                dB = texturePixels[index + 2] / 255;
            } else {
                const diffuse = material.diffuse;
                dR = diffuse[0];
                dG = diffuse[1];
                dB = diffuse[2];
            }

            const lDotN = Math.max(0, Vec3.dot(lightDirection, normal));
            redSum += (dR * lightRed * lDotN * intensity);
            greenSum += (dG * lightGreen * lDotN * intensity);
            blueSum += (dB * lightBlue * lDotN * intensity);

            // Specular
            if (viewDirection) {
                const reflection = this.reflect(lightDirection, normal);
                const rDotV = Math.max(0, Vec3.dot(reflection, viewDirection));
                const rDotVShiny = Math.pow(rDotV, material.shininess);
                redSum += (material.specular[0] * lightRed * rDotVShiny * intensity);
                greenSum += (material.specular[1] * lightGreen * rDotVShiny * intensity);
                blueSum += (material.specular[2] * lightBlue * rDotVShiny * intensity);
            }
        }
    }

    // Ambient
    const ambientLight = world.ambientLight;
    const ambientIntensity = ambientLight.intensity;
    redSum += material.ambient[0] * ambientLight.red * ambientIntensity;
    greenSum += material.ambient[1] * ambientLight.green * ambientIntensity;
    blueSum += material.ambient[2] * ambientLight.blue * ambientIntensity;

    const pixel = this.pixel;
    pixel[0] = 255 * (redSum / lightCount) * pattern;
    pixel[1] = 255 * (greenSum / lightCount) * pattern;
    pixel[2] = 255 * (blueSum / lightCount) * pattern;
    pixel[3] = 255;
    return pixel;
};

Shader.prototype.reflect = function (lightDirection, surfaceNormal) {
    return Vec3.subtract(
        Vec3.scale(
            surfaceNormal,
            (2 * Vec3.dot(lightDirection, surfaceNormal)),
            this.v7
        ),
        lightDirection,
        this.v8
    );
};
