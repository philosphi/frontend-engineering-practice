# Frontend Engineering Practice

TypeScript implementations of core JavaScript/browser APIs from scratch — no libraries, no native delegation. Each exercise ships with its own `package.json`, `tsconfig.json`, and a test file driven by Node's built-in `assert` module.

## Structure

```
frontend-utilities/
├── array-methods/
│   ├── array-map/
│   ├── array-filter/
│   ├── array-reduce/
├── function-utilities/
│   ├── call/
│   ├── apply/
│   ├── bind/
│   ├── deep-clone/
│   └── deep-equal/
├── async-coordination/
│   ├── promise-all/
│   ├── promise-any/
│   ├── promise-allsettled/
│   ├── debounce/
│   └── throttle/
└── dom-utilities/
    ├── classnames/
    ├── event-delegation/
    └── json-stringify/
```

## Running Tests

Each exercise is a self-contained Node project. From any exercise folder:

```bash
npm install
npm test
```

## Exercises

### Array Methods

Re-implementations of `Array.prototype` iteration methods that correctly handle sparse arrays, optional `thisArg` binding, and non-function callback errors.

| Exercise       | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `array-map`    | Transform every element, preserving sparse holes              |
| `array-filter` | Return elements passing a predicate, skipping sparse holes    |
| `array-reduce` | Fold an array into a single value with optional initial value |

### Function Utilities

Low-level function mechanics — explicit context binding and structural value comparison.

| Exercise     | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `call`       | Invoke a function with an explicit `this` and argument list   |
| `apply`      | Invoke a function with an explicit `this` and arguments array |
| `bind`       | Return a new function permanently bound to a `this` context   |
| `deep-clone` | Recursively copy an object graph with no shared references    |
| `deep-equal` | Recursively compare two values for structural equality        |

### Async Coordination

Promise combinators and rate-limiting utilities built on raw `Promise` and timer APIs.

| Exercise             | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `promise-all`        | Resolve when all promises settle, reject on first rejection |
| `promise-any`        | Resolve on first fulfillment, reject if all reject          |
| `promise-allsettled` | Wait for every promise regardless of outcome                |
| `debounce`           | Delay execution until after a quiet period                  |
| `throttle`           | Limit execution to at most once per interval                |

### DOM Utilities

Browser-facing utilities covering CSS class manipulation, event handling, and serialization.

| Exercise           | Description                                  |
| ------------------ | -------------------------------------------- |
| `classnames`       | Conditionally join class name strings        |
| `event-delegation` | Handle events via a shared ancestor listener |
| `json-stringify`   | Serialize a value to a JSON string           |
