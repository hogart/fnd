(function (root, factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define([], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.fnd = factory();
  }
}(this, function () {
    'use strict';

    var slice = Array.prototype.slice;
    function toArray (arrayLike) {
        return slice.call(arrayLike, 0);
    }

    function isQSASelector (selector) {
        return selector.indexOf(' ') > -1 && selector.indexOf(',') > -1 && selector.indexOf('>') > -1 && selector.indexOf('+') > -1 && selector.indexOf('~')&& selector.indexOf('[');
    }

    var strategies = {
        '#': function (selector, parent) {
            return document.getElementById(selector.substr(1));
        },
        '.': function (selector, parent) {
            return parent.getElementsByClassName(selector.substr(1))
        },
        'tagName': function (selector, parent) {
            return parent.getElementsByTagName(selector);
        },
        'qSA': function (selector, parent) {
            return parent.querySelectorAll(selector);
        }
    };

    function getStrategy (selector, parent) {
        var firstChar = selector.substr(0, 1);
        if (isQSASelector(selector) || (firstChar === '#' && parent !== document)) { // searching by id in some context falls back to qSA
            return strategies.qSA;
        } else {
            return strategies[firstChar] || strategies.tagName;
        }
    }

    function fnd (selector, parent) {
        var searcher = getStrategy(selector, parent);
        var result = searcher(selector, parent);

        if (!result || !result.length) {
            return null;
        } else {
            if (result instanceof NodeList) {
                return toArray(result);
            } else {
                return [result];
            }
        }
    }

    return fnd;
}));