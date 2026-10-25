# API Idempotency Store

An offline backend portfolio project that returns a saved response when the
same idempotency key is seen again, and records the result the first time a
key is seen. It is a focused product slice, not a hosted production service.

## How idempotency works

A client attaches a unique **idempotency key** to a request. The first time the
server sees the key, it does the work and saves the response under that key.
If the same key arrives again (for example, a network retry), the server
returns the **original saved response** instead of repeating the work or
overwriting the result. This prevents duplicate side effects such as double
orders.

## Features

- First-seen keys are recorded in the store.
- Repeated keys return the original response (never overwritten).
- Existing store entries are preserved when a new key is added.
- Input is validated: bad input, bad store, empty or whitespace-only keys and
  missing responses are rejected with clear errors.
- The original input store is never mutated.
- Works in Node.js (CommonJS) and has a standalone browser workbench.

## File structure

```text
API-Idempotency-Store/
├── main.js      # solve(input): the domain logic
├── demo.js      # prints sample output
├── test.js      # behavioral tests (node:assert/strict)
├── index.html   # standalone JSON workbench (own copy of the rules)
└── README.md
```

## Example

Input:

```json
{"store":{},"key":"req-1","response":{"orderId":"o1"}}
```

Output:

```json
{"replayed":false,"response":{"orderId":"o1"},"store":{"req-1":{"orderId":"o1"}}}
```

Sending `req-1` again with a different response returns `replayed: true` and
the original `o1` response.

## How to run

```bash
node demo.js   # prints the sample output
node test.js   # runs the test suite
```

To use the workbench, open `index.html` in a browser, edit the JSON and click
**Run Example**. **Reset Input** restores the sample.

## Limitations

- This is an offline, **in-memory** demonstration. Nothing is persisted.
- It is **not** a production payment service or a persistent backend.
- There is no concurrency control, key expiry, request fingerprinting or
  database.
- `index.html` contains its own copy of the rules (`solveBrowser`) so it stays
  standalone; keep it in sync with `main.js` if you change either.
- The key `"__proto__"` is rejected for safety.
