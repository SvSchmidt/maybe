# Maybe [![Build Status](https://api.travis-ci.org/SvSchmidt/maybe.png)](https://travis-ci.org/SvSchmidt/maybe)

Offering the mysterious _Maybe Monad_ for JavaScript.

* [Why?](#why)
* [Getting Started](#start)
* [Reference](#reference)
* [Usage](#usage-patterns)
* [Contribution](#contribution)

## Why?
Coming soon

## Getting started
There are three ways supported for using Maybe:
##### AMD (e.g. requirejs)
```
import Maybe = require('maybe');
```
##### Node.js/CommonJS:  
```
const Maybe = require('maybe');
```

#### Using the good old `<script>`-tag
```
<script src='maybe.min.js'></script>
```

## Reference

### `Maybe.of(val)`
Works as the factory function of the library. Returns a Maybe as a wrapper for the provided value, which may either be some JavaScript primitive value or complex objects. If passed a function, Maybe.of will return a MaybeFunction with additional methods.

### `Maybe(val)`
Alternative to `Maybe.of`.

### `new Maybe(val)`
Alternative to `Maybe.of`.

```js
const Maybe = require('maybe');

// The following are equivalent
new Maybe(...);
Maybe.of(...);
Maybe(...);
```

### `maybe.value()`
Returns the value wrapped by the Maybe if it is present or `Maybe.nothing` if it is not.

### `maybe.join()`
Same as `maybe.value()`.

### `maybe.isNull()`
Returns true if the Maybe's value is null.

### `maybe.isNaN()`
Returns true if the Maybe's value is Not a Number (NaN).

### `maybe.isUndefined()`
Returns true if the Maybe's value is undefined.

### `maybe.isNothing()`
```js
maybe.isNull() || maybe.isNaN() || maybe.isUndefined()
```

### `maybe.map(func)`
Runs func against the wrapped value and returns the value returned by the function wrapped in a new Maybe or Maybe.nothing if either the Maybe already was nothing or the returned value is null/NaN/undefined.

### `maybe.chain(func)`
Same as `maybe.map(func).join()`.

### `maybe.orDefault(fallback)`
Returns the fallback wrapped in a Maybe if the maybe is nothing, or returns the maybe itself it it's not.

### `maybe.or(fallback)`
Same as `maybe.orDefault(fallback)`.

### `maybe.get(propOrProps)`
If the wrapped value represents an object, you may access its properties using `maybe.get` by passing a property or an array of properties. The method will return a new Maybe wrapping the properties value or Maybe.nothing if any of the properties was not defined.

### `maybeFunction.apply(...args)`
If the wrapped value is a function, the apply method exists on the prototype. It allows calling the wrapped function with arbitrary amount of arguments (which may be Maybes or any other values). The result is a new Maybe representing the return value of the function.



### `Maybe.nothing`
A simple monadic type as a shorthand for `Maybe.of(null)`.

### `Maybe.isMaybe(obj)`
Returns true if obj is a Maybe or MaybeFunction, false if not.

## Usage Patterns
Coming soon

## Contribution

Coming soon
