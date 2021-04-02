export const isNull = function (instance) {
    return (instance === null);
};

export const isNotNull = function (instance) {
    return (instance !== null);
};

export const isUndefined = function (instance) {
    return (instance === undefined);
};

export const isDefined = function (instance) {
    return (instance !== undefined);
};

export const isDefinedAndNotNull = function (instance) {
    return (instance !== undefined && instance !== null);
};

export const isUndefinedOrNull = function (instance) {
    return (instance === undefined || instance === null);
};

export const isTruthy = function (bool) {
    return isDefinedAndNotNull(bool) && (bool === true || bool > 0
        || (typeof bool === "string" && bool.toLowerCase() === "true"));
};

export const isFalsey = function (bool) {
    return (isTruthy(bool) === false);
};

export const isEqualTo = function (value, number) {
    return (value != null && value == number);
};

export const isLessOrEqualTo = function (value, number) {
    return (value != null && value <= number);
};

export const isLessThan = function (value, number) {
    return (value != null && value < number);
};

export const isGreaterThan = function (value, number) {
    return (value != null && value > number);
};

export const isGreaterOrEqual = function (value, number) {
    return (value != null && value >= number);
};

export const isLengthEqualTo = function (array, value) {
    return (array != null && array.length == value);
};

export const isLengthLessOrEqualTo = function (array, value) {
    return (array != null && array.length <= value);
};

export const isLengthLessThan = function (array, value) {
    return (array != null && array.length < value);
};

export const isLengthGreaterThan = function (array, value) {
    return (array != null && array.length > value);
};

export const isLengthGreaterOrEqualTo = function (array, value) {
    return (array != null && array.length >= value);
};

export const isNotEmpty = function (array) {
    return (array != null && array.length > 0);
};

export const isEmpty = function (array) {
    return (array != null && array.length == 0);
};

/** Collections */

export const mergeProperties = function (properties, options) {
    let i,
        key,
        keys = Object.keys(options),
        option;

    for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        if (options.hasOwnProperty(key)) {
            option = options[key];
            if (isDefined(option)) {
                properties[key] = option;
            }
        }
    }

    return properties;
};

/**
 * Robust {@code each} function that will iterate over most collections.
 *
 * The {@code collection} can be of type Array, String, or Object, or an object that implements
 * {@code iterator()} function.
 *
 * Use this function if the type of the collection is unknown, otherwise use the iteration
 * function specific to the collection type.
 *
 *
 * @param collection
 * @param callback
 * @param context
 * @return the original {@code collection}
 */
export const each = function (collection, callback, context) {
    let iterator = null;

    if (collection instanceof Array || typeof collection === "string") {
        forEach(collection, callback, context);
    } else if (isDefinedAndNotNull(collection.iterator)) {
        iterator = collection.iterator();

        if (iterator instanceof Iterator) {
            iterator.iterate(callback, context);
        }
    } else if (collection instanceof Number) {
        loop(collection, callback, context);
    } else {
        eachProperty(collection, callback, context);
    }

    return collection;
};

export const forEach = function (array, callback, context) {
    const ctx = context || this;

    for (let i = 0; i < array.length; i += 1) {
        callback.call(ctx, array[i], i);
    }

    return array;
};

export const eachProperty = function (properties, callback, context) {
    const keys = Object.keys(properties);
    const ctx = context || this;

    for (let index = 0; index < keys.length; index += 1) {
        let key = keys[index];
        callback.call(ctx, key, properties[key], index);
    }

    return properties;
};

export const loop = function (times, callback, context) {
    const ctx = context || this;

    for (let i = 0; i < times; i = i + 1) {
        callback.call(ctx, i);
    }
};

export const whileLoop = function (condition, callback, context) {
    const ctx = context || this;

    let i = 0;

    while (condition) {
        callback.call(ctx, i);
        i += 1;
    }
};

export const untilLoop = function (condition, callback, context) {
    const ctx = context || this;

    let i = 0;

    do {
        callback.call(ctx, i);
        i += 1;
    } while (condition);
};

export const forLoop = function (array, start, end, callback, context) {
    const ctx = context || this;

    let i;

    for (i = start; i < end; i = i + 1) {
        callback.call(ctx, i);
    }
};

/**
 * Iterator for linked-list where each node is singly linked to the next node.
 *
 * @param node - must have data and next members
 * @constructor
 */
export const Iterator = function (node) {
    this._node = node;

    this.hasNext = function () {
        return (this._node !== null);
    };

    this.next = function () {
        let data = null;

        if (node) {
            data = this._node.data;
            this._node = this._node.next;
        } else {
            return undefined;
        }

        return data;
    };

    this.iterate = function (callback, context) {
        let index = 0;

        while (this.hasNext()) {
            callback.call((context || this), this.next(), index);
            index = index + 1;
        }
    };
};

export const iterate = function (iterable, callback, context) {
    iterable.iterator().iterate(callback, context);
};

export const min = function (array, comparator) {
    let minElement = array[0];
    let value = null;

    for (let i = 0; i < array.length; i = i + 1) {
        value = array[i];

        if (comparator(value, minElement) < 0) {
            minElement = value;
        }
    }

    return minElement;
};

export const max = function (array, comparator) {
    let maxElement = array[0];
    let value = null;

    for (let i = 0; i < array.length; i = i + 1) {
        value = array[i];

        if (comparator(value, maxElement) > 0) {
            maxElement = value;
        }
    }

    return maxElement;
};

export const findIndex = function (array, finder) {
    let foundIndex = -1;

    for (let i = 0; i < array.length; i += 1) {
        if (finder(array[i])) {
            foundIndex = i;
            break;
        }
    }

    return foundIndex;
};

/**
 * Find an element in the array that matches the finder predicate.
 *
 * @param {Array} array
 * @param {Function} finder predicate that matches the element in the array to find
 * @return {*} the found element, otherwise returns undefined
 */
export const find = function (array, finder) {
    let found = undefined;
    let element;

    for (let i = 0; i < array.length; i += 1) {
        element = array[i];

        if (finder(element)) {
            found = element;
            break;
        }
    }

    return found;
};

export const findAll = function (array, finder) {
    const  found = [];

    let element = null;

    for (let i = 0; i < array.length; i += 1) {
        element = array[i];

        if (finder(element)) {
            found.push(element);
        }
    }

    return found;
};

export const includes = function (array, element, matcher) {
    const predicate = matcher ||
        function (object) {
            return object === element;
        };

    return (findIndex(array, predicate) > -1);
};

export const every = function (array, matcher) {
    for (let i = 0; i < array.length; i += 1) {
        if (!matcher(array[i])) {
            return false;
        }
    }

    return true;
};

export const collect = function (array, collector) {
    const collection = [];

    let element = null;

    for (let i = 0; i < array.length; i += 1) {
        element = array[i];
        if (collector(element)) {
            collection.push(element);
        }
    }

    return collection;
};

export const filter = function (array, filter) {
    const filtered = [];

    let element = null;

    for (let i = 0; i < array.length; i += 1) {
        element = array[i];

        if (!filter(element)) {
            filtered.push(element);
        }
    }

    return filtered;
};

export const remove = function (array, matcher) {
    var index = findIndex(array, matcher);

    if (index > -1) {
        array.splice(index, 1);
    }

    return array;
};

export const removeAll = function (array, matcher) {
    const oldArray = array.splice(0);

    let element = null;

    array.length = 0;

    for (let i = 0; i < oldArray.length; i += 1) {
        element = oldArray[i];

        if (!matcher(element)) {
            array.push(element);
        }
    }

    return array;
};

export const map = function (array, mapper) {
    const mappedArray = [];

    for (let i = 0; i < array.length; i += 1) {
        mappedArray.push(mapper(array[i]));
    }

    return mappedArray;
};

export const flatten = function (array) {
    const flattenedArray = [];

    let tempFlattenedArray = null;

    for (let i = 0; i < array.length; i += 1) {
        if (!(array[i] instanceof Array)) {
            flattenedArray.push(array[i]);
        } else {
            tempFlattenedArray = this.flatten(array[i]);

            for (let j = 0; j < tempFlattenedArray.length; j += 1) {
                flattenedArray.push(tempFlattenedArray[j]);
            }
        }
    }

    return flattenedArray;
};

export const swap = function (array, indexA, indexB) {
    let swapItem = null;

    if (indexA < array.length && indexB < array.length) {
        swapItem = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = swapItem;
    }

    return array;
};

export const pushAll = function (array, elements) {
    for (let i = 0; i < elements.length; i += 1) {
        array.push(elements[i]);
    }

    return array;
};

export const popEach = function (array, callback, context) {
    const ctx = context || this;

    while (array.length > 0) {
        callback.apply(ctx, array.pop());
    }

    return array;
};

export const array = function () {
    const array = [];

    for (let i = 0; i < arguments.length; i = i + 1) {
        array.push(arguments[i]);
    }

    return array;
};

export const next = function (array, index) {
    const incIndex = index + 1;
    const nextIndex = (incIndex === array.length) ? 0 : incIndex;

    return array[nextIndex];
};

export const previous = function (array, index) {
    const decIndex = index - 1;
    const previousIndex = (decIndex < 0) ? (array.length - 1) : decIndex;

    return array[previousIndex];
};

/* Properties Operations */

export const cloneProperties = function (properties) {
    return copyProperties({}, properties);
};

export const copyProperties = function (out, properties) {
    eachProperty(properties, function (key, value) {
        out[key] = value;
    });

    return out;
};

export const contains = function (properties, key) {
    return isDefined(properties[key]);
};

export const size = function (properties) {
    let size = 0;

    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            size += 1;
        }
    }

    return size;
};

export const keys = function (properties) {
    const keys = [];

    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    return keys;
};

export const values = function (properties) {
    const values = [];

    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            values.push(properties[key]);
        }
    }

    return values;
};

export const propertiesToArray = function (properties) {
    const propArray = [];

    let property = null;

    eachProperty(properties, function (key, value) {
        property[key] = value;
        propArray.push(property);
    });

    return propArray;
};

export const addProperty = function (properties, property, value) {
    properties[property] = value;
    return properties;
};

export const defaultValue = function (value, defaultVal) {
    if (isDefinedAndNotNull(value)) {
        return value;
    }

    return defaultVal;
};

export const Args = function (args) {
    this._robustIsSameType = function (type0, type1) {
        return (type0.constructor === type1 || type0 instanceof type1);
    };

    this.init(args);
};

Args.prototype.init = function (args) {
    this._args = args;

    return this;
};

Args.prototype.empty = function () {
    return this._args.length === 0;
};

Args.prototype.size = function () {
    return this._args.length;
};

Args.prototype.get = function (index) {
    let arg = null;

    if (!this.empty()) {
        arg = this._args[index];
    }

    return arg;
};

Args.prototype.matches = function () {
    const types = arguments;

    let matches = true;

    if (types.length !== this._args.length) {
        matches = false;
    } else {
        for (let i = 0; i < types.length; i = i + 1) {
            if (!(this._robustIsSameType(this._args[i], types[i]))) {
                matches = false;
            }
        }
    }

    return matches;
};

Args.prototype.match = function (index, type) {
    const arg = this.get(index);

    let matches = false;

    if (arg) {
        matches = this._robustIsSameType(arg.constructor, type);
    }

    return matches;
};

Args.prototype.matchAll = function (type) {
    let matches = true;

    for (let i = 0; i < this._args.length; i += 1) {
        if (!(this._robustIsSameType(this._args[i], type))) {
            matches = false;
        }
    }

    return matches
};

Args.prototype.toArray = function () {
    return Array.prototype.slice.call(this._args);
};

Args.prototype.clone = function () {
    return new Args(this._args);
};

export const Id = function () {
    let id = 0;

    this.next = function () {
        id = id + 1;
        return id;
    };
};

export const callbackWithContext = function (callback, context) {
    return function () {
        return callback.apply(context, arguments);
    };
};

export const clamp = function (min, max, value) {
    let clampedValue = null;

    if (value > 0) {
        clampedValue = max;
    } else {
        clampedValue = min;
    }

    return clampedValue;
};

export const Interval = function (min, max) {
    this.init(min, max);
};

Interval.clamp = function (value, min, max) {
    let clampedValue = null;

    if (value <= max && value >= min) {
        clampedValue = value;
    } else if (max < value) {
        clampedValue = max;
    } else {
        clampedValue = min;
    }

    return clampedValue;
};

Interval.prototype.init = function (min, max) {
    this.min = min;
    this.max = max;
};

Interval.prototype.overlaps = function (interval) {
    return !(this.min > interval.max || interval.min > this.max);
};

Interval.prototype.overlap = function (interval) {
    if (this.overlaps(interval)) {
        return Math.min(this.max, interval.max) - Math.max(this.min, interval.min);
    }

    return 0;
};

Interval.prototype.contains = function (interval) {
    return interval.min > this.min && interval.max < this.max;
};

Interval.prototype.clamp = function (value) {

    return Interval.clamp(value, this.min, this.max);
};
