# fnd.js

fnd.js is performance-oriented DOM selector micro-library intended to use in modern browsers. It uses `querySelectorAll` but falls back to (still) more performant `getElementsByTagName`, `getElementsByClass`, and `getElementById`.

It is not jQuery-like and will never be. When it can't find elements, it returns `null`, so you can detect errors in your selectors early. Found elements are wrapped in plain array (not some obscure NodeList), which you can work with using `Array#map`, `Array#reduce` and other cool FP things.

## API

```js
var elements = fnd('.some[selector]'); // equivalent to fnd('.some[selector]', document);
fnd.is('.some')(elements[0]); // true
var isSomeOther = fnd.is('.some-other'); // result of fnd.is is a function
elements.filter(isSomeOther)
```

## Benchmark & tests

http://jsperf.com/fnd-js

```
npm run unit && npm run lint
```

Contributions are welcome, especially so if you make sure that your changes passes lint and unit-tests.