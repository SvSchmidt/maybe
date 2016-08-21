# Maybe [![Build Status](https://api.travis-ci.org/SvSchmidt/maybe.png)](https://travis-ci.org/SvSchmidt/maybe)

Offering the mysterious _Maybe Monad_ for JavaScript.

* [Why?](#why)
* [Getting Started](#start)
* [Reference](#reference)
* [Usage](#usage-patterns)
* [Contribution](#contribution)

## Why?
Imagine a function returning the user currently logged in along with some details (e.g. the profile picture):
```js
function getUser () {
    return {
        name: 'Jon Doe',
        email: 'jon@example.com',
        getProfilePicture: function () {
            return {
                title: 'fancy cat',
                url: 'jon.jpg',
                extension: '.jpg',
            };
        },
    };
}
```
Now we can access the profile picture as follows, e.g. to display it somewhere on the page:

```js
let avatar = getUser().getProfilePicture().url;
```
In some cases, the user may not have an avatar, such as he just registered.
```js
function getUser () {
    return {
        name: 'Jon Doe',
        email: 'jon@example.com',
        getProfilePicture: function () {
            return null;
        },
    };
}
```
Accessing `url` on null will cause an Error. Hence we would rewrite the example as follows:
```js
let avatar = getUser().getProfilePicture();
let url;
if (avatar !== null) {
    url = avatar.url;
} else {
    url = 'default.jpg';
}
```
But what happens if there is no user logged in, e.g. the user is null? Let's check for that case too:
```js
let user = getUser();
let avatar, url;

if (user !== null) {
    avatar = user.getProfilePicture();

    if (avatar !== null) {
        url = avatar.url;
    } else {
        url = 'default.jpg';
    }
}
```
Doesn't get any better, does it? Instead of a fancy one-liner, we now have twelve. Checking for non-existing properties or null-values in JavaScript is an exhausting part of ones everyday workflow. And we tend to forget edge cases. The _Maybe Monad_ offers a Wrapper for values hence you can skip these checks. The above example would look as follows with `Maybe`:
```js
Maybe.of(getUser())
    .map(x => x.getProfilePicture())
    .get('url')
    .orDefault('default.jpg')
    .value();
```
If any intermediate value is null/undefined, the chain continues using `Maybe.nothing` instead of throwing an error. We're also able to define a default.

## Getting started
There are three ways supported for using Maybe:
##### AMD (e.g. requirejs)
```
require(['Maybe'], function (Maybe) {
    Maybe(...)
});
```
##### Node.js/CommonJS:  
```
const Maybe = require('maybe');
Maybe(...);
```

#### Using the good old `<script>`-tag
```
<script src='maybe.min.js'></script>
```

## Reference

### `Maybe.of(val)`, `Maybe(val)` and `new Maybe(val)`
Works as the factory function of the library. Returns a Maybe as a wrapper for the provided value, which may either be some JavaScript primitive value or even complex, nested objects. If passed a function, Maybe.of will return a MaybeFunction with additional methods.

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
See `maybe.value()`.

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
Same behaviour as `maybe.map(func).join()`.

### `maybe.orDefault(fallback)`
Returns the fallback wrapped in a Maybe if the maybe is nothing, or returns the maybe itself it it's not.

### `maybe.or(fallback)`
See `maybe.orDefault(fallback)`.

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
Please feel free to contribute! Clone the repository and run `npm install` on your machine. If you haven't installed grunt yet, you may want to install it by running
```batch
npm install -g grunt grunt-cli
```
first and call `grunt` afterwards.

See the [issues page](https://github.com/SvSchmidt/maybe/issues) for bugs and project goals. I also invite you to start a discussion.

I would be grateful if every new or changed code includes associated tests and jsdoc notation. Thank you!
