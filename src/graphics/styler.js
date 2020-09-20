import { cloneProperties, eachProperty, isUndefinedOrNull, mergeProperties } from "../core/common";
import { Gradient } from "./gradient";
import { Pattern } from "./pattern";

/**
 * Complete list of CanvasRenderingContext2D styles.
 *
 * @type {Object}
 */
export const STYLES = {
    STROKE_COLOUR: {
        NAME: "strokeColour",
        TYPE: String,
        DEFAULT: "black"
    },
    STROKE_GRADIENT: {
        NAME: "strokeGradient",
        TYPE: Gradient,
        DEFAULT: "flat"
    },
    STROKE_PATTERN: {
        NAME: "strokePattern",
        TYPE: Pattern,
        DEFAULT: "flat"
    },
    FILL_COLOUR: {
        NAME: "fillColour",
        TYPE: String,
        DEFAULT: "transparent"
    },
    FILL_GRADIENT: {
        NAME: "fillGradient",
        TYPE: Gradient,
        DEFAULT: "flat"
    },
    FILL_PATTERN: {
        NAME: "fillPattern",
        TYPE: Pattern,
        DEFAULT: "flat"
    },
    FILL_RULE: {
        NAME: "fillRule",
        TYPE: String,
        VALUES: ["nonzero", "evenodd"],
        DEFAULT: "nonzero"
    },
    LINE_WIDTH: {
        NAME: "lineWidth",
        TYPE: Number,
        DEFAULT: 1.0
    },
    LINE_CAP: {
        NAME: "lineCap",
        TYPE: String,
        VALUES: ["butt", "round", "square"],
        DEFAULT: "butt"
    },
    LINE_JOIN: {
        NAME: "lineJoin",
        TYPE: String,
        VALUES: ["round", "bevel", "miter"],
        DEFAULT: "miter"
    },
    LINE_MITER_LIMIT: {
        NAME: "lineMiterLimit",
        TYPE: Number,
        DEFAULT: 10
    },
    LINE_DASH: {
        NAME: "lineDash",
        TYPE: Array,
        DEFAULT: [],
        REGEX: /^(\d)+(, *(\d)+)*$|^(solid)$/
    },
    LINE_DASH_OFFSET: {
        NAME: "lineDashOffset",
        TYPE: Number,
        DEFAULT: 0
    },
    FONT_SIZE: {
        NAME: "fontSize",
        TYPE: String,
        DEFAULT: "10px"
    },
    FONT_FAMILY: {
        NAME: "font",
        TYPE: String,
        DEFAULT: "sans-serif"
    },
    TEXT_ALIGN: {
        NAME: "textAlign",
        TYPE: String,
        VALUES: ["left", "right", "center"],
        DEFAULT: "left"
    },
    TEXT_BASELINE: {
        NAME: "textBaseline",
        TYPE: String,
        VALUES: ["top", "hanging", "middle", "alphabetic", "bottom"],
        DEFAULT: "alphabetic"
    },
    TEXT_DIRECTION: {
        NAME: "textDirection",
        TYPE: String,
        VALUES: ["ltr", "rtl"],
        DEFAULT: "ltr"
    },
    SHADOW_BLUR: {
        NAME: "shadowBlur",
        TYPE: Number,
        DEFAULT: 0
    },
    SHADOW_COLOUR: {
        NAME: "shadowColour",
        TYPE: String,
        DEFAULT: "black"
    },
    SHADOW_OFFSET_X: {
        NAME: "shadowOffsetX",
        TYPE: Number,
        DEFAULT: 0
    },
    SHADOW_OFFSET_Y: {
        NAME: "shadowOffsetY",
        TYPE: Number,
        DEFAULT: 0
    },

    /* Canvas styles */
    ARROW_WIDTH: {
        NAME: "arrowTipWidth",
        TYPE: Number,
        DEFAULT: 9
    },

    ARROW_TIP: {
        NAME: "arrowTip",
        TYPE: String,
        VALUES: ["none", "open", "closed", "invertedOpen", "invertedClosed"],
        DEFAULT: "open"
    },

    ARROW_BASE: {
        NAME: "arrowBase",
        TYPE: String,
        VALUES: ["none", "open", "closed", "invertedOpen", "invertedClosed"],
        DEFAULT: ["none"]
    }
};

export const Styler = function (styles) {
    this.init(styles);
};

/** Static functions **/

Styler.getDefaultStyles = function () {
    const defaultStyles = {};
    eachProperty(STYLES, function (id, style) {
        defaultStyles[style.NAME] = style.DEFAULT;
    });
    return defaultStyles;
};

Styler.emptyStyler = function () {
    return new Styler();
};

Styler.defaultStyler = function (styles) {
    const defaultStyles = Styler.getDefaultStyles();
    return new Styler(
        mergeProperties(
            defaultStyles,
            styles || {}));
};

/** Private Methods */

Styler.prototype.init = function (styles) {
    this._stroke = false;
    this._fill = false;
    this._fillRule = STYLES.FILL_RULE.DEFAULT;
    this._styles = {};
    eachProperty(styles || {}, function (style, value) {
        this._process(style, value);
    }, this);

    return this;
};

Styler.prototype._process = function (style, value) {
    switch (style) {
        case "stroke":
        case "strokeStyle":
        case "strokeColor":
        case "strokeColour":
            if (value === "" || value === "transparent") {
                // No Stroke
                this._stroke = false
            } else {
                this._styles["strokeStyle"] = value;
                this._stroke = true;
            }
            break;

        case "fill":
        case "fillStyle":
        case "fillColor":
        case "fillColour":
            if (value === "" || value === "transparent") {
                // No Fill
                this._fill = false;
            } else {
                this._styles["fillStyle"] = value;
                this._fill = true;
            }
            break;

        case "fillRule":
            this._fillRule = value;
            break;

        case "lineDash":
            let lineDash = null;

            if (isUndefinedOrNull(value)) {
                lineDash = [];
            } else if (typeof value === "string") {
                if (value === "" || value === "solid") {
                    lineDash = [];
                } else if (STYLES.LINE_DASH.REGEX.test(value)) {
                    lineDash = map(value.split(/, */), function (str) {
                        return parseInt(str);
                    });
                }
            } else if (value instanceof Array) {
                lineDash = value;
            }

            if (lineDash != null) {
                this._styles["lineDash"] = lineDash;
            }

            break;
        case "shadowColor":
        case "shadowColour":
            this._styles["shadowColor"] = value;
            break;

        default:
            this._styles[style] = value;
    }
};

/** Public Methods */

Styler.prototype.clone = function () {
    return new Styler(this._styles);
};

Styler.prototype.style = function (styleName, styleValue) {
    const styles = {};
    styles[styleName] = styleValue;
    return this.styles(styles);
};

Styler.prototype.styles = function (styles) {
    return this.init(mergeProperties(this._styles, styles))
};

Styler.prototype.clear = function () {
    return this.init();
};

Styler.prototype.resetDefaults = function () {
    return this.init(Styler.getDefaultStyles());
};

Styler.prototype.get = function (style) {
    return this._styles[style];
};

Styler.prototype.getAll = function () {
    return cloneProperties(this._styles);
};

Styler.prototype.apply = function (ctx) {
    const styles = this._styles;
    const keys = Object.keys(styles);

    ctx.save();

    for (let i = 0; i < keys.length; i += 1) {
        const style = keys[i];
        const value = styles[style];

        switch (style) {
            case "lineDash":
                ctx.setLineDash(value);
                break;
            default:
                ctx[style] = value;
        }
    }

    if (this._fill) {
        if (this._fillRule) {
            ctx.fill(this._fillRule);
        } else {
            ctx.fill();
        }
    }

    if (this._stroke) {
        ctx.stroke();
    }

    ctx.restore();

    return this;
};
