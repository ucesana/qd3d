export const Svg = function () {
    const _self = this;
    const _lines = [];

    this._svgTagOpen = function () {
        return "<svg version=\"1.1\" " +
            "xmlns:xlink=\"http://www.w3.org/1999/xlink\" " +
            "xmlns=\"http://www.w3.org/2000/svg\" " +
            "height=\"" + _self._height + "\" " +
            "width=\"" + _self._width + "\">\n";
    };

    this._svgTagClose = function () {
        return "</svg>";
    };

    this._style = function (style) {
        return "style=\"stroke:" + style.stroke + "; stroke-width: " + style.strokeWidth + ";\"";
    };

    this._svgLine = function (line) {
        return "<line x1=\"" + line.x1 + "\" y1=\"" + line.y1
            + "\" x2=\"" + line.x2 + "\" y2=\"" + line.y2 + "\" "
            + this._style(line.style)
            + " />\n";
    };

    this._height = function (height) {
        _self._height = height;
        return _self;
    };

    this._width = function (width) {
        _self._width = width;
        return _self;
    };

    this._line = function (x1, y1, x2, y2, style) {
        _lines.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            style: Object.assign({
                stroke: "rgb(0,0,0)",
                strokeWidth: 1
            }, style || {})
        });
        return _self;
    };

    this._toString = function () {
        return "".concat(
            _self._svgTagOpen(),
            ..._lines.map((line) => _self._svgLine(line)),
            _self._svgTagClose());
    };
};

Svg.prototype = {
    height: function (height) {
        return this._height(height);
    },

    width: function (width) {
        return this._width(width);
    },

    line: function (x1, y1, x2, y2, style) {
        return this._line(x1, y1, x2, y2, style);
    },

    toString: function () {
        return this._toString();
    }
};
