import { isDefinedAndNotNull } from "../core/common";
import { Vec } from "./vec";
import { Vec2 } from "./vec2";
import { Vec3 } from "./vec3";

export const math = {
    EPSILON: 0.000001,
    TAU: 2 * Math.PI,
    THREE_QUARTER_TAU: 3 * Math.PI / 2,
    HALF_TAU: Math.PI,
    THIRD_TAU: 2 * Math.PI / 3,
    QUARTER_TAU: Math.PI / 2,
    SIXTH_TAU: 2 * Math.PI / 6,
    CIRCLE: 360,
    THREE_QUARTER_CIRCLE: 270,
    HALF_CIRCLE: 180,
    THIRD_CIRCLE: 120,
    QUARTER_CIRCLE: 90,
    SIXTH_CIRCLE: 60,
    TO_DEGREES: 180 / Math.PI,
    TO_RADIANS: Math.PI / 180,

    square: function (value) {
        return value * value;
    },

    cube: function (value) {
        return value * value * value;
    },

    generateTable: function (start, end, inc, equation) {
        var i,
            table = new Vec.TYPE((end - start) / inc);

        for (i = start; i < end; i += inc) {
            table[i] = (equation(i));
        }

        return table;
    },

    /**
     * Get the x position of a point that has been rotating an arm of {@code length}
     * around a pivot with an x position of {@code pivotX} by the {@code angle}.
     *
     * @param {Number} pivotX
     * @param {Number} angle in radians
     * @param {Number} length
     * @return {Number}
     */
    rotateXPosition: function (pivotX, angle, length) {
        return (pivotX + Math.cos(angle) * length);
    },

    /**
     * Get the y position of a point that has been rotating an arm of {@code length}
     * around the pivot with a y position of {@code pivotY} by the {@code angle}.
     *
     * @param {Number} pivotY
     * @param {Number} angle in radians
     * @param {Number} length
     * @return {Number}
     */
    rotateYPosition: function (pivotY, angle, length) {
        return (pivotY + Math.sin(angle) * length);
    },

    /**
     * Get the angle of the line that connects the points
     * (x0, y0) and (x1, y1).
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Number}
     */
    angleOf: function (x0, y0, x1, y1) {
        var dx = x1 - x0,
            dy = y1 - y0;
        return Math.atan2(dy, dx);
    },

    equalish: function (a, b, epsilon) {
        return Math.abs(a - b) <= (epsilon || this.EPSILON) * Math.max(1.0, Math.abs(a), Math.abs(b));
    },

    random: function (range) {
        return Math.random() * (range || 0);
    },

    randomIntBetween: function (a, b) {
        return Math.floor((b - a) * Math.random()) + a;
    },

    randomInt: function (range) {
        return Math.floor(range * Math.random());
    },

    randomElement: function (array) {
        return array[randomInt(array.length) - 1];
    },

    scatter: function (centre, radius) {
        var rndRadius = this.random(radius),
            rndAngle = this.random(this.TAU),
            sin = Math.sin(rndAngle),
            cos = Math.cos(rndAngle),
            scatterPnt = Vec2.translate(
                Vec2.copy(centre),
                cos * rndRadius,
                sin * rndRadius);

        return scatterPnt;
    },

    /**
     * Get the distance between the points (x0, y0) and (x1, y1).
     *
     * @param {Number} x0
     * @param {Number} y0
     * @param {Number} x1
     * @param {Number} y1
     * @return {Number}
     */
    distance: function (x0, y0, x1, y1) {
        var dx = x1 - x0,
            dy = y1 - y0;
        return Math.sqrt(dx * dx + dy * dy);
    },

    pythagoreanSolve: function (x, y) {
        return Math.sqrt(x * x + y * y);
    },

    /**
     * Get the intersection point between lines {@code lineA} and {@code lineB}.
     * Returns {@code null} if the two lines do not intersect.
     *
     * @param {Vec2} out
     * @param {math.Line} lineA
     * @param {math.Line} lineB
     * @return {Vec2} the point of intersection between lines {@code lineA} and {@code lineB}
     */
    intersectLines: function (out, lineA, lineB) {
        var dPx = lineA.pointB[0] - lineA.pointA[0],
            dPy = lineA.pointB[1] - lineA.pointA[1],
            dRx = lineB.pointB[0] - lineB.pointA[0],
            dRy = lineB.pointB[1] - lineB.pointA[1],
            denom = dRx * dPy - dRy * dPx,
            numer1 = dRx * (lineB.pointA[1] - lineA.pointA[1]) - dRy * (lineB.pointA[0] - lineA.pointA[0]),
            numer2 = dPx * (lineB.pointA[1] - lineA.pointA[1]) - dPy * (lineB.pointA[0] - lineA.pointA[0]),
            lambda1 = -1,
            lambda2 = -1;

        if (denom > 0.0) {
            lambda1 = numer1 / denom;
            lambda2 = numer2 / denom;

            if (lambda1 < 0.0 || lambda1 > 1.0 ||
                lambda2 < 0.0 || lambda2 > 1.0) {
                return null;
            }

            Vec2.position(out,
                lineA.pointA[0] + dPx * lambda1,
                lineA.pointA[1] + dPy * lambda1
            );
        }

        return out;
    },

    intersectRayAndSphere: function (orig, dir, center, radius2, separation = Vec3.create()) {
        const l = Vec3.subtract(center, orig, separation);
        const tca = Vec3.dot(l, dir);

        if (tca < 0) {
            return null;
        }

        const d2 = Vec3.dot(l, l) - (tca * tca);

        if (d2 > radius2) {
            return null;
        }

        const thc = Math.sqrt(radius2 - d2);

        let t0 = tca - thc;
        let t1 = tca + thc;

        if (t0 > t1) {
            const tmp = t0;
            t0 = t1;
            t1 = tmp;
        }

        if (t0 < 0) {
            t0 = t1;
            if (t0 < 0) {
                return null;
            }
        }

        return t0;
    },

    intersectRayAndPlane: function (origin, direction, position, normal) {
        const denom = Vec3.dot(normal, direction);
        if (denom > 0.000001) {
            const p0l0 = Vec3.subtract(position, origin);
            const t = Vec3.dot(p0l0, normal) / denom;
            return t;
        }

        return null;
    },

    intersectRayAndDisk: function (origin, direction, position, normal, radiusSquared) {
        let t = math.intersectRayAndPlane(origin, direction, position, normal);
        if (t != null) {
            const p = Vec3.add(origin, Vec3.scale(direction, t));
            const v = Vec3.subtract(p, position);
            const d2 = Vec3.dot(v, v);
            return (d2 <= radiusSquared);
        }

        return null;
    },

    intersectRayAndBox: function (orig, dir, min, max) {
        let tmin = (min[0] - orig[0]) / dir[0];
        let tmax = (max[0] - orig[0]) / dir[0];

        let swap = null;

        if (tmin > tmax) {
            swap = tmin;
            tmin = tmax;
            tmax = swap;
        }

        let tymin = (min[1] - orig[1]) / dir[1];
        let tymax = (max[1] - orig[1]) / dir[1];

        if (tymin > tymax) {
            swap = tymin;
            tymin = tymax;
            tymax = swap;
        }

        if ((tmin > tymax) || (tymin > tmax)) {
            return null;
        }

        if (tymin > tmin) {
            tmin = tymin;
        }

        if (tymax < tmax) {
            tmax = tymax;
        }

        let tzmin = (min[2] - orig[2]) / dir[2];
        let tzmax = (max[2] - orig[2]) / dir[2];

        if (tzmin > tzmax) {
            swap = tzmin;
            tzmin = tzmax;
            tzmax = swap;
        }

        if ((tmin > tzmax) || (tzmin > tmax)) {
            return null;
        }

        if (tzmin > tmin) {
            tmin = tzmin;
        }

        if (tzmax < tmax) {
            tmax = tzmax;
        }

        return {
            tmin: tmin,
            tmax: tmax
        };
    },

    /**
     * Linear interpolation between value {@code a} and {@code b}.
     *
     * @param {Number} a
     * @param {Number} b
     * @param {Number} lambda with range [0, 1]
     * @return {Number}
     */
    lerp: function (a, b, lambda) {
        return (1 - lambda) * a + lambda * b;
    },

    /**
     * Linear interpolation point between points {@code pointA} and {@code pointB}.
     *
     * If {@code lambda} is undefined, then it is assumed to be 0.5 (i.e. half way along
     * the linear interpolant).
     *
     * @param {Vec2} out
     * @param {Vec2} pointA
     * @param {Vec2} pointB
     * @param {Number} lambda with range [0, 1]
     * @return {Vec2} linear interpolation point
     */
    lerpPoint2D: function (out, pointA, pointB, lambda) {
        var lerp = math.lerp;

        out[0] = lerp(pointA[0], pointB[0], lambda);
        out[1] = lerp(pointA[1], pointB[1], lambda);

        return out;
    },

    /**
     * Linear interpolation point a distance of {@code distance} along the
     * the line between {@code pointA} and {@code pointB}.
     *
     * @param {Vec2} out
     * @param {Vec2} pointA (x0, y0)
     * @param {Vec2} pointB (x1, y1)
     * @param {Number} distance with range [0, sqrt((x1 - x0)^2 + (y1 - y0)^2)]
     * @return {Vec2} linear interpolation point
     */
    lerpVec2ByDistance: function (out, pointA, pointB, distance) {
        var lambda = distance / Vec2.distance(pointA, pointB);

        return math.lerpPoint2D(out, pointA, pointB, lambda);
    },

    /**
     * Returns the point S such that the line has
     * length distance and is turned anticlockwise by 90 degrees from the
     * given {@code line}.
     *
     * @param {Vec2} out
     * @param {Line} line
     * @param {Number} distance
     * @return {Vec2} out
     */
    perpendicularByDistance: function (out, pointA, pointB, distance) {
        var deltaX,
            deltaY,
            r;

        deltaX = pointB[0] - pointA[0];
        deltaY = pointB[1] - pointA[1];
        r = Vec2.create(pointB[0] - deltaY, pointB[1] + deltaX);

        return math.lerpVec2ByDistance(out, pointB, r, distance);
    },

    /**
     * Returns a point S on the given {@code line} such that the line through
     * S and the {@code offLine} point is perpendicular to the given {@code line}.
     *
     * @param {Vec2} out
     * @param {math.Line} line
     * @param {Vec2} offLine
     * @return {Vec2}
     */
    perpendicularBasePoint: function (out, line, offLine) {
        var deltaX, deltaY, f, d, lambda;

        deltaX = line.pointB[0] - line.pointA[0];
        deltaY = line.pointB[1] - line.pointA[1];
        f = deltaX * (offLine[0] - line.pointA[0]) + deltaY * (offLine[1] - line.pointA[1]);
        d = deltaX * deltaX + deltaY * deltaY;
        lambda = f / d;

        return math.lerpPoint2D(out, line.pointA(), line.pointB(), lambda);
    },

    /**
     * Returns a point that when connected with the the {@code offLine}
     * point makes a line that is parallel to the given {@code line}.
     *
     * @param {math.Line} line
     * @param {Vec2} offLine
     * @return {Vec2}
     */
    parallelPoint: function (line, offLine) {
        var deltaX, deltaY;

        deltaX = line.pointB[0] - line.pointA[0];
        deltaY = line.pointB[1] - line.pointA[1];

        return new Vec2(offLine[0] + deltaX, offLine[1] + deltaY);
    },

    round: function (number, sigFigs) {
        return Math.round(number * sigFigs) / sigFigs;
    },

    fastFloor: function (value) {
        return (0.5 + value) | 0;
    },

    centroid: function (centroid, points) {
        var centroid = centroid || Vec2.create(0, 0);

        if (points.length > 3) {
            return this.polygonCentroid(centroid, points);
        } else if (points.length === 3) {
            return this.triangleCentroid(points[0], points[1], points[2], centroid);
        } else if (points.length === 2) {
            return this.lerpPoint2D(centroid, points[0], points[1], 0.5);
        } else if (points.length === 1) {
            return Vec2.copy(centroid, points[0]);
        }

        return centroid;
    },

    triangleCentroid: function (a, b, c, centroid = Vec3.create()) {
        centroid[0] = (a[0] + b[0] + c[0]) / 3;
        centroid[1] = (a[1] + b[1] + c[1]) / 3;
        return centroid;
    },

    triangleNormal: function (v0, v1, v2, normal = Vec3.create()) {
        const edge1X = v1[0] - v0[0];
        const edge1Y = v1[1] - v0[1];
        const edge1Z = v1[2] - v0[2];

        const edge2X = v2[0] - v0[0];
        const edge2Y = v2[1] - v0[1];
        const edge2Z = v2[2] - v0[2];

        const x = -edge1Z * edge2Y + edge1Y * edge2Z;
        const y = edge1Z * edge2X - edge1X * edge2Z;
        const z = -edge1Y * edge2X + edge1X * edge2Y;

        const magnitude = (1 / Math.sqrt((x * x) + (y * y) + (z * z)));
        normal[0] = (x * magnitude);
        normal[1] = (y * magnitude);
        normal[2] = (z * magnitude);

        return normal;
    },

    /**
     * The centroid of a non-self-intersecting closed polygon defined by n vertices
     *
     * https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
     * https://stackoverflow.com/questions/2792443/finding-the-centroid-of-a-polygon
     *
     * @param {Vec2} centroid the receiving point
     * @param {Array} points
     * @return {Vec2} centroid
     */
    polygonCentroid: function (centroid, points) {
        var pointsCount = points.length,
            signedArea = 0.0,
            sixSignedArea,
            currentPointX = 0.0,
            currentPointY = 0.0,
            nextPointX = 0.0,
            nextPointY = 0.0,
            partialSignedArea = 0.0,
            point = null,
            i;

        for (i = 0; i < pointsCount; i = i + 1) {
            point = points[i];
            currentPointX = point[0];
            currentPointY = point[1];

            point = points[(i+1) % pointsCount];
            nextPointX = point[0];
            nextPointY = point[1];

            partialSignedArea = currentPointX * nextPointY - nextPointX * currentPointY;
            signedArea += partialSignedArea;
            centroid[0] += (currentPointX + nextPointX) * partialSignedArea;
            centroid[1] += (currentPointY + nextPointY) * partialSignedArea;
        }

        signedArea *= 0.5;
        sixSignedArea = 6.0 * signedArea;
        centroid[0] /= sixSignedArea;
        centroid[1] /= sixSignedArea;

        return centroid;
    },

    isPolygonConvex: function (points) {
        // Convex if all interior angles are less than 180 degrees
        //
    },

    /**
     * Calculates the winding sum for a closed polygon.
     *
     * For a right-handed cartesian coordinate system:
     *   - A positive winding sum indicates a clockwise winding.
     *   - A negative winding sum indicates an counter-clockwise winding.
     *
     * In a right-handed canvas coordinate system (reversed y-axis):
     *   - A positive winding sum indicates an counter-clockwise winding.
     *   - A negative winding sum indicates a clockwise winding.
     *
     * @param {Array} points
     * @return {Number} winding sum
     */
    polygonWindingSum: function (points) {
        var windingSum = 0,
            pointsCount = points.length,
            currentIndex,
            nextIndex,
            current,
            next;

        for (currentIndex = 0; currentIndex < pointsCount; currentIndex += 1) {
            nextIndex = (currentIndex + 1) % pointsCount;

            current = points[currentIndex];
            next = points[nextIndex];

            // Sum( (x[(i+1) mod N] - x[i]) * (y[i] + y[(i+1) mod N]) )
            windingSum += (next[0] - current[0]) * (current[1] + next[1]);
        }

        return windingSum;
    },

    edgeFunction: function (v0, v1, p) {
        return ((p[0] - v0[0]) * (v1[1] - v0[1]) - (p[1] - v0[1]) * (v1[0] - v0[0]));
    },

    isPointInsidePolygon: function (p, vertices) {
        const length = vertices.length;
        for (let i = 0; i < length; i++) {
            if (math.edgeFunction(vertices[i], vertices[(i + 1) % length], p) < 0) {
                return false;
            }
        }
        return true;
    },

    isPointOutsidePolygon: function (p, vertices) {
        const length = vertices.length;
        for (let i = 0; i < length; i++) {
            if (math.edgeFunction(vertices[i], vertices[(i + 1) % length], p) >= 0) {
                return false;
            }
        }
        return true;
    },

    isPointInsideTriangle: function (v0, v1, v2, p) {
        const w0 = math.edgeFunction(v1, v2, p);
        const w1 = math.edgeFunction(v2, v0, p);
        const w2 = math.edgeFunction(v0, v1, p);
        return (w0 >= 0 && w1 >= 0 && w2 >= 0)
    },

    minMaxTriangle: function (v0, v1, v2, minOut, maxOut) {
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = -Number.MAX_SAFE_INTEGER;
        let maxY = -Number.MAX_SAFE_INTEGER;

        const v0x = v0[0];
        const v0y = v0[1];

        const v1x = v1[0];
        const v1y = v1[1];

        const v2x = v2[0];
        const v2y = v2[1];

        // vCamera
        if (v0x < minX) minX = v0x;
        if (v0y < minY) minY = v0y;
        if (v0x > maxX) maxX = v0x;
        if (v0y > maxY) maxY = v0y;

        // v1
        if (v1x < minX) minX = v1x;
        if (v1y < minY) minY = v1y;
        if (v1x > maxX) maxX = v1x;
        if (v1y > maxY) maxY = v1y;

        // v2
        if (v2x < minX) minX = v2x;
        if (v2y < minY) minY = v2y;
        if (v2x > maxX) maxX = v2x;
        if (v2y > maxY) maxY = v2y;

        minOut[0] = minX;
        minOut[1] = minY;
        maxOut[0] = maxX;
        maxOut[1] = maxY;
    },

    pointToBarycentricCoordinates: function (v0, v1, v2, p) {
        const area = math.edgeFunction(v0, v1, v2); // area of the triangle multiplied by 2

        const w0 = math.edgeFunction(v1, v2, p); // signed area of the triangle v1v2p multiplied by 2
        const w1 = math.edgeFunction(v2, v0, p); // signed area of the triangle v2v0p multiplied by 2
        // const w2 = math.edgeFunction(vCamera, v1, p); // signed area of the triangle v0v1p multiplied by 2
        // optimisation: since lambdas (w0 + w1 + w2 = 1)
        const w2 = 1 - w0 - w1;

        // barycentric coordinates are the areas of the sub-triangles divided by the area of the main triangle
        // Notice that the 2 cancels in the division
        return Vec3.create(w0 / area, w1 / area, w2 / area);
    },

    circleTopPoint: function (centre, radius) {
        return Vec2.create(centre[0], (centre[1] - radius));
    },

    circleBottomPoint: function (centre, radius) {
        return Vec2.create(centre[0], (centre[1] + radius));
    },

    circleLeftPoint: function (centre, radius) {
        return Vec2.create((centre[0] - radius), centre[1]);
    },

    circleRightPoint: function (centre, radius) {
        return Vec2.create((centre[0] + radius), centre[1]);
    },

    /**
     * InterpolationFunction
     *
     * @param {Array} points
     * @constructor
     */
    InterpolationFunction: function (points) {
        var _rangeComparator = function (pointA, pointB) {
            return pointA[0] - pointB[0];
        };

        this.points = points;
        this.rangeMin = min(points, _rangeComparator);
        this.rangeMax = max(points, _rangeComparator);

        this.point = function (lambda) {
            var x = math.lerp(this.rangeMin[0], this.rangeMax[0], lambda),
                xIndex,
                point,
                prevPoint,
                xDistance,
                nodeDistance,
                y,
                lambdaY;

            // For each node
            for (xIndex = 0; xIndex < this.points.length; xIndex += 1) {
                point = this.points[xIndex];

                if (x === point[0]) {
                    return point;
                } else if (x > point[0]) {
                    // Do nothing. Go to the next node.
                    prevPoint = this.points[xIndex];
                } else {
                    // Otherwise this x is lower than the current node
                    // and it is greater than the previous node

                    // Calculate the proportion dx from the previous node to the
                    // current node.
                    // Formula: dX = distance between x and previous node
                    //                  / distance between nodes
                    xDistance = x - prevPoint[0];
                    nodeDistance = point[0] - prevPoint[0];
                    lambdaY = xDistance / nodeDistance;

                    y = math.lerp(prevPoint[1], point[1], lambdaY);

                    return Vec2.create(x, y);
                }
            }

            return undefined;
        }
    },

    Radians: function (radians) {
        var _radians = radians;

        this.rotateRadians = function (radians) {
            _radians = math.addRadians(_radians, radians);
        };

        this.rotateDegrees = function (degrees) {
            _radians = math.addRadians(_radians, math.toRadians(degrees));
        };

        this.radians = function () {
            return _radians;
        };

        this.degrees = function () {
            return math.toDegrees(_radians);
        };

        this.toDegrees = function () {
            return new math.Degrees(math.toDegrees(_radians));
        }
    },

    Degrees: function (degrees) {
        var _degrees = degrees;

        this.rotateRadians = function (radians) {
            _degrees = math.addDegrees(_degrees, math.toDegrees(radians));
        };

        this.rotateDegrees = function (degrees) {
            _degrees = math.addDegrees(_degrees, degrees);
        };

        this.radians = function () {
            return math.toRadians(_degrees);
        };

        this.degrees = function () {
            return _degrees;
        };

        this.toRadians = function () {
            return new math.Radians(math.toRadians(_degrees));
        }
    },

    toDegrees: function (radians) {
        return radians * math.TO_DEGREES;
    },

    toRadians: function (degrees) {
        return degrees * math.TO_RADIANS;
    },

    radians: function (r) {
        var angle = r,
            TAU = this.TAU;

        if (r > TAU) {
            angle = r % TAU;
        } else if (r < 0) {
            angle = (r % TAU) + TAU;
        }


        return angle;
    },

    degrees: function (r) {
        var angle = r,
            CIRCLE = this.CIRCLE;

        if (r > CIRCLE) {
            angle = r % CIRCLE;
        } else if (r < 0) {
            angle = (r % CIRCLE) + CIRCLE;
        }

        return angle;
    },

    addRadians: function (r, dr) {
        return math.radians(r + dr);
    },

    addDegrees: function (r, dr) {
        return math.degrees(r + dr);
    },

    biasGreaterThan: function (a, b) {
        var kBiasRelative = 0.95,
            kBiasAbsolute = 0.01;

        return a >= b * kBiasRelative + a * kBiasAbsolute;
    },

    biasLessThan: function (a, b) {
        var kBiasRelative = 0.95,
            kBiasAbsolute = 0.01;

        return a <= b * kBiasRelative + a * kBiasAbsolute;
    }

};

math.sinTable = math.generateTable(0, 360, 1, function (degrees) {
    return Math.sin(math.toRadians(degrees));
});

math.fastSin = function (x) {
    var y,
        degrees = math.degrees(x),
        shift = Number(degrees);

    if ((shift | 0) === degrees) {
        y = math.sinTable[degrees];
    } else {
        y = Math.sin(x);
    }

    return y;
};

math.fasterSin = function (x) {
    var degrees = math.fastFloor(x);

    return math.sinTable[degrees];
};

math.cosTable = math.generateTable(0, 360, 1, function (degrees) {
    return Math.cos(math.toRadians(degrees));
});

math.fastCos = function (x) {
    var y,
        degrees = math.degrees(x),
        shift = new Number(degrees);

    if ((shift | 0) === degrees) {
        y = math.cosTable[degrees];
    } else {
        y = Math.cos(x);
    }

    return y;
};

math.fasterCos = function (x) {
    var degrees = math.fastFloor(x);
    return math.cosTable[degrees];
};

math.clamp = function (lo, hi, v) {
    return Math.max(lo, Math.min(hi, v));
};

math.Line = function () {
    var args = new Args(arguments);

    this._pointA = null;
    this._pointB = null;

    if (args.matches(Number, Number, Number, Number)) {
        this._pointA = Vec2.create(args.get(0), args.get(1));
        this._pointB = Vec2.create(args.get(2), args.get(3));
    } else if (args.matches(Vec2, Vec2)) {
        this._pointA = args.get(0);
        this._pointB = args.get(1);
    } else if (args.matches(math.Line)) {
        this._pointA = args.get(0).pointA();
        this._pointB = args.get(0).pointA();
    }
};

math.Line.prototype.pointA = function (pointA) {
    if (isDefinedAndNotNull(pointA)) {
        this._pointA = pointA;
        return this;
    }

    return this._pointA;
};

math.Line.prototype.pointB = function (pointB) {
    if (isDefinedAndNotNull(pointB)) {
        this._pointB = pointB;
        return this;
    }

    return this._pointB;
};

math.Line.prototype.dx = function () {
    return this._pointB.x - this._pointA.x;
};

math.Line.prototype.dy = function () {
    return this._pointB.y - this._pointA.y;
};

math.Line.prototype.gradient = function () {
    return this.dy() / this.dx();
};

math.Line.prototype.lineLength = function () {
    return Vec2.distance(this._pointA, this._pointB);
};

math.Line.prototype.angle = function () {
    return Math.atan2(this.dy(), this.dx());
};

math.Line.prototype.copy = function () {
    return new math.Line(this._pointA, this._pointB);
};

/**
 * Circle shape.
 */
math.Circle = function (centre, radius) {
    this.centre = centre;
    this.radius = radius;
};

math.Circle.prototype.clone = function () {
    return new math.Circle(this.centre, this.radius);
};

math.Circle.prototype.copy = function (circle) {
    this.centre = circle.centre;
    this.radius = circle.radius;
    return this;
};

math.Circle.prototype.diameter = function () {
    return this.radius * 2;
};

math.Circle.prototype.perimeter = function () {
    return math.TAU * this.radius;
};

math.Circle.prototype.area = function () {
    return math.HALF_TAU * this.radius * this.radius;
};

math.Circle.prototype.pointAt = function (angle) {
    var x = math.rotateXPosition(0, angle, this.radius),
        y = math.rotateYPosition(0, angle, this.radius);

    return new Vec2.create(x, y);
};

/**
 *
 * @param pointA
 * @param pointB
 * @constructor
 */
math.Rectangle = function (pointA, pointB) {
    this.min;
    this.max;
    this.width;
    this.height;

    this.init(pointA, pointB);
};

math.Rectangle.prototype.init = function (pointA, pointB) {
    var width = pointB[0] - pointA[0],
        height = pointB[1] - pointA[1];

    if (width < 0 && height < 0) {
        this.min = pointB;
        this.max = pointA;
        this.width = -width;
        this.height = -height;
    } else if (width < 0 && height > 0) {
        this.min = Vec2.create(pointB[0], pointA[1]);
        this.max = Vec2.create(pointA[0], pointB[1]);
        this.width = -width;
        this.height = height;
    } else if(width > 0 && height < 0) {
        this.min = Vec2.create(pointA[0], pointB[1]);
        this.max = Vec2.create(pointB[0], pointA[1]);
        this.width = width;
        this.height = -height;
    } else {
        this.min = pointA;
        this.max = pointB;
        this.width = width;
        this.height = height;
    }
};

math.Rectangle.prototype.area = function () {
    return this.width * this.height;
};
