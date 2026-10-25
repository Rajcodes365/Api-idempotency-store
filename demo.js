'use strict';

(function () {
  // This file is for Node.js only. Do nothing if loaded in a browser.
  if (typeof require !== 'function') {
    return;
  }

  const idempotency = require('./main.js');
  const run = idempotency.solve;

  const first = run({
    store: {},
    key: 'req-1',
    response: { orderId: 'o1' }
  });

  console.log('First request (sample input):');
  console.log(JSON.stringify(first, null, 2));

  const second = run({
    store: first.store,
    key: 'req-1',
    response: { orderId: 'o2' }
  });

  console.log('\nSame key sent again with a different response:');
  console.log(JSON.stringify(second, null, 2));
})();
