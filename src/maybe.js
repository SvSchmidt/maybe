(function (Maybe) {
    // (0, eval)('this') is a robust way for getting a reference to the global object
    const global = this || (0, eval)('this');

    // Support three ways to load the module
    // [1] AMD modules
    // [2] CommonJS/Node.js
    // [3] good old <script>-tag
    if (typeof define === 'function' && define['amd']) {
        // AMD asynchronous module definition (e.g. requirejs)
        define('Maybe', function () { return Maybe; });
    } else if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js where module.exports is for nodejs
        exports = module.exports = Maybe;
    } else {
        // no module loader (simple <script>-tag) -> assign Maybe directly to the global object
        global['Maybe'] = Maybe;
    }
}((function () {
        // use Symbol for saving the value in a private way
        const __value = Symbol('value');

        function __assign (target, origin) {
            target = Object(target);

            Object.keys(origin).forEach(k => {
                let desc = Object.getOwnPropertyDescriptor(origin, k);
                if (desc !== undefined && desc.enumerable) {
                    Object.defineProperty(target, k, desc);
                }
            });

            return target;
        }

        function __copy (obj) {
            return __assign({}, obj);
        }

        /**
         * Maybe - Constructor function
         *
         * @param  {any} value value to create a Maybe of
         * @return {boolean}       void
         */
        function Maybe (value) {
            this[__value] = value;
        }

        Maybe.prototype = (function () {
            /**
             * isNull - Check if the value of this Maybe is null
             *
             * @return {boolaen}
             */
            function isNull () {
                return this[__value] === null;
            }

            /**
             * isNaN - Check if the value of this Maybbe is Not a Number (NaN)
             *
             * @return {boolean}
             */
            function isNaN () {
                const v = this[__value];

                // NaN is the only object which fails non-equality check with itself
                return v !== v;
            }

            /**
             * isUndefined - Check if the value of this Maybe is undefined
             *
             * @return {boolean}
             */
            function isUndefined () {
                return this[__value] === undefined;
            }

            /**
             * isNothing - Check if the value of this Maybe is null, undefined or Not a Number (NaN)
             *
             * @return {boolean}
             */
            function isNothing () {
              return this.isNull() || this.isUndefined() || this.isNaN();
            }

            /**
             * map - Applies the function func to the value of this Maybe or returns Maybe.nothing if this.isNothing()
             *
             * @param  {Function} func function to apply to the value of this Maybe
             * @return {Maybe}      new Maybe of the return value of the function
             */
            function map (func) {
              if (this.isNothing()) {
                return Maybe.nothing;
              }

              return Maybe.of(func(this[__value]));
            }

            /**
             * orDefault - Returns this or a Maybe of the provided fallback in case this.isNothing()
             *
             * @param  {any} fallback Value to fall back to in case this.isNothing()
             * @return {Maybe}          this or new Maybe of the fallback
             */
            function orDefault (fallback) {
                if (this.isNothing()) {
                    return Maybe.of(fallback);
                }

                return this;
            }

            /**
             * or
             *
             * @see {@link orDefault}
             * @see orDefault
             */
            function or (fallback) {
                return this.orDefault(fallback);
            }

            /**
             * get - Try to get the value associated with the property propOrProps or the array of properties in appropriate order or return Maybe.nothing if not available
             *
             * @param  {string} prop Name of the property to get
             * @return {Maybe}      new Maybe of the value associated with prop or Maybe.nothing
             */
            function get (propOrProps) {
                if (this.isNothing()) {
                    return this;
                }

                propOrProps = [].concat(propOrProps).reverse();

                let maybeResult = this;
                for (let result = this[__value];
                    !maybeResult.isNothing() && propOrProps.length > 0;
                    result = result[propOrProps.pop()],
                    maybeResult = Maybe.of(result)) {}

                if (maybeResult.isNothing()) {
                    return Maybe.nothing;
                }

                return maybeResult;
            }

            /**
             * join - Returns the value of the Maybe or Maybe.nothing if this.isNothing()
             *
             * @return {any/Maybe}
             */
            function join () {
                if (this.isNothing()) {
                    return Maybe.nothing;
                }

                return this[__value];
            }

            /**
             * value
             *
             * @see {@link join}
             * @see join
             */
            function value () {
                return this.join();
            }

            /**
             * chain - Combination of map and join
             *
             * @param  {Function} func function to call map with
             * @return {any/Maybe}      Maybe.nothing if return value of map is Maybe.nothing or the value of the Maybe
             */
            function chain (func) {
                return this.map(func).join();
            }

            /**
             * toString - toString method
             *
             * @override
             */
            function toString () {
                return '[object Maybe]';
            }

            return {
                isNull, isNaN, isUndefined, isNothing, map, orDefault, or, get, join, value, chain, toString,
            }
        }());

        /**
         * MaybeFunction - Constructor function for MaybeFunction (a special Maybe representing a function)
         *
         * @see {@link Maybe}
         */
        function MaybeFunction (value) {
            Maybe.call(this, value);
        }

        MaybeFunction.prototype = (function () {
            /**
             * apply - Calls the function associated with this Maybe with the given parameters
             *
             * @param  {any[]} ...args any values to call the function with, may be Maybes or regular values
             * @return {Maybe}         new Maybe of the return value of the operation
             */
            function apply (...args) {
                return Maybe.of(this[__value].apply(this[__value],
                    args.map(x => Maybe.of(x).join())));
            }

            /**
             * join
             *
             * @override
             * @see Maybe#join
             */
            function join () {
                if (this.isNothing()) {
                    return Maybe.nothing;
                }

                const v = this[__value];

                if (v.length === 0 /* does not accept arguments */) {
                    return v();
                } else {
                    return v;
                }
            }

            /**
             * toString - toString method
             *
             * @override
             */
            function toString () {
                return '[object MaybeFunction]';
            }

            return {
                apply, toString, join
            }
        }());
        MaybeFunction.prototype = __assign(__copy(Maybe.prototype), MaybeFunction.prototype);

        // Return kind of a proxy to allow three ways to create Maybes:
        // [1] Maybe(value)
        // [2] Maybe.of(value)
        // [3] new Maybe(value)
        const result = function (value) {
          return Maybe.of(value);
        };

        // Preferred fabric method to create a Maybe
        result.of = Maybe.of = function (value) {
            // return MaybeFunction if value is a function
            if (typeof value === 'function') {
                return new MaybeFunction(value);
            }

            // If value already is a Maybe, just return it since nesting Maybes does not make any sense
            if (Maybe.isMaybe(value)) {
                return value;
            }

            return new Maybe(value);
        }

        // Helper method to determine if a value represents a Maybe
        result.isMaybe = Maybe.isMaybe = function (value) {
            return /maybe/i.test(Object(value).toString());
        }

        // Shorthand for Maybe.of(null) for not needing to create it multiple times
        result.nothing = Maybe.nothing = Maybe.of(null);

        return result;
    }())
));
