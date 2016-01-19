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
			assert.isArray(fnd('div.testDiv'), 'compound selector');
			assert.isArray(fnd('[data-test]'), 'attr selector');
			assert.isArray(fnd('x-tag'), 'custom tag');
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

	describe('fnd.evt', function () {
		function simulateEvent (el, type) {
			var event = new MouseEvent(type, {
				view: window,
				bubbles: true,
				cancelable: true
			});
			el.dispatchEvent(event);
		}

		describe('fnd.evt.on', function () {
			var on = fnd.evt.on;

			it('is a function', function () {
				assert.isFunction(on, 'got a function');
			});

			it('adds event listener to element', function () {
				var counter = 0;
				var elem = fnd('.testDiv')[0];
				function onClick (event) {
					counter++;
					assert.equal(event.type, 'click', 'Proper event type');
				}

				var off = on(elem, 'click', onClick);

				assert.isFunction(off, 'returns function');

				simulateEvent(elem, 'click');
				assert.equal(counter, 1, 'handler called once');

				off();

				simulateEvent(elem, 'click');
				assert.equal(counter, 1, 'handler was not called after "off"');
			});

			it('properly works with selectors, e.g. ".testDiv span"', function () {
				var counter = 0;
				var elem = fnd('.testDiv')[0];
				var clickTarget = fnd('span', elem)[0];
				function onClick (event) {
					counter++;
					assert.equal(event.target.nodeName.toLowerCase(), 'span');
					assert.equal(event.type, 'click', 'Proper event type');
				}

				var off = on(elem, 'click', onClick, 'span');

				simulateEvent(clickTarget, 'click');
				assert.equal(counter, 1, 'handler called once');

				off();

				simulateEvent(clickTarget, 'click');
				assert.equal(counter, 1, 'handler was not called after "off"');
			});
		});

		it('is a function', function () {
			assert.isFunction(fnd.evt, 'got a function');
		});

		it('binds simple handler map to element', function () {
			var clickCounter = 0;
			var dblClickCounter = 0;
			var context = {
				someUniquePropertyWithDistinctiveName: true,
				someMethod: function (event) {
					clickCounter++;
					assert.equal(event.type, 'click');
					assert.isTrue(this.someUniquePropertyWithDistinctiveName, 'Properly bound context');
				}
			};

			var elem = fnd('.testDiv')[0];
			var dblClickTarget = fnd('span', elem)[0];
			var eventMap = {
				click: 'someMethod',
				'dblclick span': function (event) {
					dblClickCounter++;
					assert.ok(true, 'function literals in map');
					assert.equal(event.type, 'dblclick');
					assert.isTrue(this.someUniquePropertyWithDistinctiveName, 'Properly bound context');
					assert.ok(fnd.is('span')(event.target));
				}
			};
			var off = fnd.evt(elem, eventMap, context);

			assert.isFunction(off);

			simulateEvent(elem, 'click');
			simulateEvent(dblClickTarget, 'dblclick');

			assert.equal(clickCounter, 1, 'bound handler was called once');
			assert.equal(dblClickCounter, 1, 'bound handler was called once');


			off();

			simulateEvent(elem, 'click');
			simulateEvent(dblClickTarget, 'dblclick');

			assert.equal(clickCounter, 1, 'bound handler haven\'t been called after off');
			assert.equal(dblClickCounter, 1, 'bound handler haven\'t been called after off');
		});

		it('throws error if event map is erroneous', function () {
			var eventMap = {
				click: 'absentMethod'
			};
			var elem = fnd('.testDiv')[0];

			assert.throws(
				fnd.evt.bind(null, elem, eventMap, {}),
				/Invalid or missing context for/,
				'properly thrown error'
			);
		});

		it('supports several selectors in one event', function () {
            var clickCounter = 0;
			var eventMap = {
				'click span, strong.cls': function () {
                    clickCounter++;
                }
			};
			var elem = fnd('.testDiv')[0];

			var off = fnd.evt(elem, eventMap);

            simulateEvent(fnd('span', elem)[0], 'click');
            simulateEvent(fnd('.cls', elem)[0], 'click');
            assert.equal(clickCounter, 2, 'handler was called');

            off();

            simulateEvent(fnd('.cls', elem)[0], 'click');
            assert.equal(clickCounter, 2, 'handler wasn\'t called after off');
		});

	});

	mocha.run();
})(mocha, chai.assert, fnd);