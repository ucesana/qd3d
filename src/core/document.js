import  { includes, remove } from "./common";

export const download = function (filename, dataUrl, mimeType) {
    var link = document.createElement('a');

    link.download = filename;
    link.href = dataUrl;
    link.dataset.downloadurl = [mimeType, link.download, link.href].join(':');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const onTimeout = function (callback, delay) {
    var id;
    return function () {
        clearTimeout(id);
        id = setTimeout(callback, delay);
    };
};

/* HTML Element Operations */

export const getElementById = function (id) {
    return window.document.getElementById(id);
};

export const getElementsByTagName = function (tag) {
    return window.document.getElementsByTagName(tag);
};

export const getElementsByClassName = function (className) {
    return window.document.getElementsByClassName(className);
};

export const getElements = function (selector) {
    return window.document.querySelectorAll(selector);
};

export const hasClass = function (element, className) {
    var hasClass = false,
        classNames = element.className;

    if (classNames.search(/\s/)) {
        hasClass = includes(classNames.split(" "), className);
    } else {
        hasClass = (classNames === className);
    }

    return hasClass;
};

export const addClass = function (element, className) {
    element.classList.add(className);
    return element;
};

export const removeClass = function (element, className) {
    element.classList.remove(className);
    return element;
};

export const measureElement = function (element) {
    return {
        width:element.offsetWidth,
        height:element.offsetHeight
    };
};

export const measureClientWindow = function () {
    return {
        width:window.innerWidth || document.body.clientWidth,
        height:window.innerHeight || document.body.clientHeight
    };
};

/**
 * Add {@object export const EventTrigger} to an object.
 *
 * @constructor
 */
export const EventTrigger = function () {
    this.init();
};

EventTrigger.prototype.init = function () {
    this.listeners = [];
};

/**
 * The {@code EventTrigger} fires the event to all listeners listening to the event.
 */
EventTrigger.prototype.fire = function () {
    var i,
        listener;

    for (i = 0; i < this.listeners.length; i += 1) {
        listener = this.listeners[i];
        listener.handler.apply(listener.context, arguments);
    }
};

/**
 * Observers register with this {@code Subject} to receive notifications
 * via the {@code notifier} callback function.
 *
 * The {@code notifier) callback function will be called with same context as the
     * {@code observer}.
 *
 * @param context
 * @param handler
 */
EventTrigger.prototype.bind = function (namespace, handler, context) {
    this.listeners.push({ namespace:namespace, handler:handler, context:context });
};

EventTrigger.prototype.unbind = function (namespace, handler, context) {
    remove(this.listeners, function (listener) {
        return (listener.namespace === namespace
            && listener.handler === handler
            && listener.context === context);
    });
};

EventTrigger.prototype.destroy = function () {
    this.listeners = undefined;
};

export const toggleFullScreen = function () {
    if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
};

export const polyFillRequestAnimationFrame = function () {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            });
    }

    if (!window.cancelRequestAnimationFrame) {
        //noinspection JSUnresolvedVariable
        window.cancelRequestAnimationFrame = (window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.clearTimeout);
    }
};
