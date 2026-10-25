'use strict';

// Everything lives inside an IIFE so no top-level name such as `solve`
// can ever collide with another script in a shared browser scope.
(function (root) {
  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // Deep copy so we never share references with the caller's data.
  function clone(value) {
    const text = JSON.stringify(value);
    if (text === undefined) {
      throw new TypeError('Values must be JSON-compatible.');
    }
    return JSON.parse(text);
  }

  function solve(input) {
    if (!isPlainObject(input)) {
      throw new TypeError('Input must be an object with store, key and response.');
    }

    const store = input.store;
    const key = input.key;
    const response = input.response;

    if (!isPlainObject(store)) {
      throw new TypeError('"store" must be a plain object.');
    }
    if (typeof key !== 'string') {
      throw new TypeError('"key" must be a string.');
    }
    if (key.trim() === '') {
      throw new Error('Idempotency key must not be empty or whitespace-only.');
    }
    if (key === '__proto__') {
      throw new Error('Idempotency key "__proto__" is reserved and not allowed.');
    }
    if (response === undefined) {
      throw new TypeError('"response" is required.');
    }

    // Work on a copy: the original input store is never mutated.
    const newStore = clone(store);

    if (Object.prototype.hasOwnProperty.call(newStore, key)) {
      // Repeated request: return the ORIGINAL saved response.
      return {
        replayed: true,
        response: clone(newStore[key]),
        store: newStore
      };
    }

    // First-seen request: record the response.
    newStore[key] = clone(response);
    return {
      replayed: false,
      response: clone(response),
      store: newStore
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    // Node.js (CommonJS). Supports both import styles:
    //   const solve = require('./main');
    //   const { solve } = require('./main');
    module.exports = solve;
    module.exports.solve = solve;
  } else if (root && !root.IdempotencyStore) {
    // Browser: one namespaced global, defined only once.
    root.IdempotencyStore = { solve: solve };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
