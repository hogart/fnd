# fnd.js

fnd.js is performance-oriented DOM selector micro-library intended to use in modern browsers. It uses `querySelectorAll` but falls back to (still) more performant `getElementsByTagName`, `getElementsByClass`, and `getElementById` when possible.

It is not jQuery-like and will never be. When it can't find elements, it returns `null`, so you can detect errors in your selectors early. Early errors are good, empty arrays are misleading.
Found elements are wrapped in plain array (not some obscure NodeList), which you can work with using `Array#map`, `Array#reduce` and other cool FP things.

## Installation

`npm install hogart/fnd --save`
or
`bower install hogart/fnd`

`fnd` supports CommonJS and AMD module loaders and bad old browser globals.


## Browser support

This is tricky, as different parts of `fnd` have different requirements. Basically minimum is IE9+, but if you're not using `fnd.is`/`fnd.evt` and stick to one-word selectors by tag name or ID, you should be fine even in IE6. If you're not using `fnd.is`, but want more complex selectors, then IE8 it is.
`fnd.is` requires some kind of support of `.matches` method, which means IE9+. Same goes for `fnd.evt`.

Since `fnd` relies on browser selector engine, it supports only what browser supports. Experience shows that `tagName.className .someChildren` covers about 95% of your selecting abilities, and this works even in IE8.

## API

```js
var elements = fnd('.some[selector]'); // equivalent to fnd('.some[selector]', document);
fnd.is('.some')(elements[0]); // true
var isSomeOther = fnd.is('.some-other'); // result of fnd.is is a function
elements.filter(isSomeOther);

var list = fnd('ul.someList');

// this is optimized and internally just shortcut for fnd('li', list[0])
var items = fnd('li', list);

// This is not optimized. It would walk every node in `items` and search for `a` inside that node.
var hrefs = fnd('a', items).map(function (link) { return link.href; }); // array of urls in order of appearance in document
```

Also refer to tests for examples.

## fnd.evt

fnd.evt provides adding event listeners via Backbone-like event maps. Example:

```js
var widget = {
    title: 'I am some widget',
    onSubmit: function (event) { // either describe your methods in some object/class...
        console.log(this.title); // 'I am some widget'
        event.preventDefault(); // event is vanilla DOM event
    }
}

var eventMap = {
    'submit form': 'onSumbit', // method name from context
    'reset form': function (event) { // ...or use function literals in event map, or mix and match
        console.log(this.title); // again, 'I am some widget'
    }
}

var off = fnd.evt(fnd('.some-element')[0], eventMap, widget); // off is a function which, when called, removes event listeners
```

`fnd.evt` relies on `fnd.evt.on`, which is wrapper for EventTarget.addEventListener with event delegation support:

```js
// it accepts 3 or 4 arguments and returns a function
var off = fnd.evt.on(
    fnd('.some-element')[0], // DOM node
    'submit', // event name
    function onSubmit (event) {}, // event handler
    'form' //selector, optional
);
```

Returns a function which, when called, removes event listener.

## Benchmark & tests

http://jsperf.com/fnd-js

```
npm run unit && npm run lint
```

Contributions are welcome, especially so if you make sure that your changes passes lint and unit-tests.