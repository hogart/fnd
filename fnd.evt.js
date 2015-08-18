(function (root, factory) {
    'use strict';
    /* global define, module, require */
    if (typeof define === 'function' && define.amd) { // AMD
        define(['fnd'], factory);
    } else if (typeof exports === 'object') { // Node, browserify and alike
        module.exports = factory(require('fnd'));
    } else {
        // Browser globals (root is window)
        root.fnd.evt = factory(root.fnd);
  }
}(this, function (fnd) {
	'use strict';

    function on (element, eventName, handler, selector) {
        var boundHandler;
        var useCapture;
        if (selector) {
            boundHandler = function (event) {
                if (fnd.is(selector)(event.target)) {
                    handler(event);
                }
            };
            useCapture = true;
        } else {
            boundHandler = handler;
            useCapture = false;
        }

        element.addEventListener(eventName, boundHandler, useCapture);

        return function () {
            element.removeEventListener(eventName, boundHandler, useCapture);
        };
    }

    function extractHandler (events, key, context) {
        var handler = events[key];
        if (handler instanceof Function) {
            return handler;
        } else if (typeof handler === 'string') {
            if (context[handler]) {
                return context[handler];
            } else {
                throw new Error('Invalid or missing context for "' + handler + '"');
            }
        }
    }

    function parseEvent (eventKey) {
        return eventKey.split(/\s+/);
    }

    function callableList () {
        var list = [];
        var result = function () {
            for (var i = 0; i < list.length; i++) {
                list[i]();
            }
        };

        result.push = list.push.bind(list);

        return result;
    }

    function evt (element, events, context) {
        var unbinders = callableList();

        Object.keys(events).forEach(function (eventKey) {
            var parts = parseEvent(eventKey);

            unbinders.push(on(
                element,
                parts[0],
                extractHandler(events, eventKey, context).bind(context),
                parts[1]
            ));
        });

        return unbinders;
    }

    evt.on = on;

    return evt;
}));