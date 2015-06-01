(function (root, factory) {
    'use strict';
    /* global define, module */
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
    /* global NodeList, HTMLCollection */
    var slice = Array.prototype.slice;
    function toArray (arrayLike) {
        return slice.call(arrayLike, 0);
    }

    var isArray = Array.isArray || function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };

    var isQSARe = /(.+[ ,>+~#:\[\.]|[\[:])/;

    function isQSASelector (selector) {
        return isQSARe.test(selector);
    }

    var strategies = {
        '#': function (selector) {
            return document.getElementById(selector.substr(1));
        },
        '.': function (selector, parent) {
            return parent.getElementsByClassName(selector.substr(1));
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

    function seekIn (selector, parent) {
        parent = (parent || document);
        var searcher = getStrategy(selector, parent);
        var result = searcher(selector, parent);

        if (result === null) {
            return null;
        } else {
            if (result instanceof NodeList || result instanceof HTMLCollection) {
                if (result.length) {
                    return toArray(result);
                } else {
                    return null;
                }
            } else {
                return [result];
            }
        }
    }

    function fnd (selector, parent) {
        if (parent === null) {
            throw new Error('Got null instead of element(s) when searching for "' + selector + '"');
        }

        if (!isArray(parent)) {
            return seekIn(selector, parent);
        } else {
            if (parent.length === 1) {
                return seekIn(selector, parent[0]);
            } else {
                var results = [];
                var push = results.push.apply;
                var found;

                for (var i = 0, len = parent.length; i < len; i++) {
                    found = seekIn(selector, parent[i]);
                    if (found !== null) {
                        push(found);
                    }
                }

                if (results.length) {
                    return results;
                } else {
                    return null;
                }
            }
        }
    }

    // determine which matches method is available
    var matchesMethod = '';
    (function () {
        var docEl = document.documentElement;
        var methodNames = ['matches', 'msMatchesSelector', 'mozMatchesSelector', 'webkitMatchesSelector', 'matchesSelector'];

        for (var i = 0, len = methodNames.length; i < len; i++) {
            if (docEl[methodNames[i]]) {
                matchesMethod = methodNames[i];
                break;
            }
        }
    }());


    function isFactory (selector) {
        return function (element) {
            return element[matchesMethod](selector);
        };
    }

    fnd.is = isFactory;

    /* eslint-disable */
    fnd.on = function (element) {
        var attach = element.addEventListener.bind(element);
        return function (eventName, handler, selector) {
            var bound;
            if (!selector) {
                bound = handler;
            } else {
                bound = function (event) {
                    if (isFactory(selector)(event.target)) {
                        handler(event);
                    }
                };
            }

            element.addEventListener(eventName, bound, selector);
        };
    };
    /* eslint-disable */

    return fnd;
}));