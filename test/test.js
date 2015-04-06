/* eslint-env mocha */
/* global mocha, chai, fnd */
(function (mocha, assert, fnd) {
	'use strict';

	mocha.setup('bdd');

	describe('fnd', function () {
		it('should exists and be a function', function () {
			assert.ok(fnd, 'exists');
			assert.isFunction(fnd, 'is function');
		});

		it('should have `is` method', function () {
			assert.property(fnd, 'is', '`is` exists');
			assert.isFunction(fnd.is, '`is` being a function');
		});
	});

	describe('fnd results', function () {
		it('should throw error when passed null as second argument', function () {
			assert.throws(
				fnd.bind(null, 'body', null),
				'Got null instead of element\(s\) when searching for "body"',
				'Threw Error instance with expected message'
			);
		});

		it('should return array, when elements exist', function () {
			assert.isArray(fnd('body'), 'simple selector');
			assert.isArray(fnd('.testDiv'), 'by class name');
			assert.isArray(fnd('div'), 'by tag name');
			assert.isArray(fnd('#mocha'), 'by id');
			assert.isArray(fnd('div.testDiv'), 'complex selector');
		});

		it('array elements should be instances of `HTMLElement`', function () {
			assert.instanceOf(fnd('body')[0], HTMLElement, 'first element is `HTMLElement`');
		});

		it('should return null when no elements found', function () {
			assert.isNull(fnd('#non.existent[element]'), 'non-existent element not found');
		});

		it('should respect context', function () {
			var head = fnd('head')[0];
			var body = fnd('body')[0];

			assert.isArray(fnd('#mocha', body), 'div#mocha in body');
			assert.isNull(fnd('#mocha', head), 'but not in head');

			assert.isArray(fnd('meta', head), 'meta tags present in head');
			assert.isNull(fnd('meta', body), 'but not in body');
		});

		it('should accept array of elements as second argument', function () {
			var body = fnd('body');
			var head = fnd('head');
			var headAndBody = fnd('head, body');

			var div = fnd('.testDiv', body);
			var divAndTitle = fnd('title, .testDiv');

			assert.isArray(div, 'div found in a body which was found by fnd');
			assert.isArray(divAndTitle, 'something found in a headAndBody');
			assert.lengthOf(divAndTitle, 2, '2 elements found in a headAndBody');
			assert.equal(divAndTitle[0].tagName.toLowerCase(), 'title', 'first element is title');
			assert.equal(divAndTitle[1].tagName.toLowerCase(), 'div', 'second element is div');
		});
	});

	describe('fnd.is', function () {
		var isScript = fnd.is('script');
		it('should return a function', function () {
			assert.isFunction(isScript, 'got a function');
		});

		it('that function should accept elements that suit given selector', function () {
			assert.isBoolean(isScript(fnd('script')[0]), 'result is boolean');
			assert.ok(isScript(document.createElement('script')), 'result is positive');
			assert.ok(isScript(fnd('script')[0]), 'result is positive');
		});

		it('that function should reject elements that don\'t suit given selector', function () {
			assert.isBoolean(isScript(fnd('meta')[0]), 'result is boolean');
			assert.notOk(isScript(document.createElement('div')), 'result is negative');
			assert.notOk(isScript(fnd('meta')[0]), 'result is negative');
		});
	});

	mocha.run();
})(mocha, chai.assert, fnd);