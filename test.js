'use strict';

(function () {
  // This file is for Node.js only. Do nothing if loaded in a browser.
  if (typeof require !== 'function') {
    return;
  }

  const assert = require('node:assert/strict');
  const solve = require('./main.js').solve;

  const tests = [
    {
      name: 'first-seen request records the response',
      run: function () {
        const result = solve({
          store: {},
          key: 'req-1',
          response: { orderId: 'o1' }
        });
        assert.deepEqual(result, {
          replayed: false,
          response: { orderId: 'o1' },
          store: { 'req-1': { orderId: 'o1' } }
        });
      }
    },
    {
      name: 'repeated request returns the original response (not o2)',
      run: function () {
        const result = solve({
          store: { 'req-1': { orderId: 'o1' } },
          key: 'req-1',
          response: { orderId: 'o2' }
        });
        assert.deepEqual(result, {
          replayed: true,
          response: { orderId: 'o1' },
          store: { 'req-1': { orderId: 'o1' } }
        });
      }
    },
    {
      name: 'new key preserves existing store entries',
      run: function () {
        const result = solve({
          store: { old: { ok: true } },
          key: 'new',
          response: { ok: false }
        });
        assert.deepEqual(result, {
          replayed: false,
          response: { ok: false },
          store: { old: { ok: true }, new: { ok: false } }
        });
      }
    },
    {
      name: 'rejects empty and whitespace-only keys',
      run: function () {
        assert.throws(
          function () { solve({ store: {}, key: '', response: { a: 1 } }); },
          /must not be empty/
        );
        assert.throws(
          function () { solve({ store: {}, key: '   ', response: { a: 1 } }); },
          /must not be empty/
        );
      }
    },
    {
      name: 'rejects invalid input, store, key and response types',
      run: function () {
        assert.throws(function () { solve(null); }, TypeError);
        assert.throws(function () { solve({ store: [], key: 'a', response: {} }); }, /"store"/);
        assert.throws(function () { solve({ store: null, key: 'a', response: {} }); }, /"store"/);
        assert.throws(function () { solve({ store: {}, key: 42, response: {} }); }, /"key"/);
        assert.throws(function () { solve({ store: {}, key: 'a' }); }, /"response"/);
      }
    },
    {
      name: 'does not mutate the original input store',
      run: function () {
        const input = {
          store: { old: { ok: true } },
          key: 'new',
          response: { ok: false }
        };
        const snapshot = JSON.parse(JSON.stringify(input));
        const result = solve(input);
        assert.deepEqual(input, snapshot);
        assert.notEqual(result.store, input.store);
      }
    },
    {
      name: 'rejects the reserved "__proto__" key',
      run: function () {
        assert.throws(
          function () { solve({ store: {}, key: '__proto__', response: {} }); },
          /reserved/
        );
      }
    }
  ];

  let passed = 0;
  tests.forEach(function (test) {
    try {
      test.run();
      passed += 1;
      console.log('PASS: ' + test.name);
    } catch (error) {
      console.log('FAIL: ' + test.name);
      console.log('      ' + error.message);
    }
  });

  console.log('\n' + passed + '/' + tests.length + ' tests passed');
  if (passed !== tests.length) {
    process.exitCode = 1;
  }
})();
