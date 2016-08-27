(function (Maybe) {
    // Support three ways to load the module
    // [1] AMD modules
    // [2] CommonJS/Node.js
    // [3] good old <script>-tag (fallback)
    try {
        if (typeof define === 'function' && define.amd) {
            // AMD asynchronous module definition (e.g. requirejs)
            define(['require', 'exports'], function () { return Maybe; });
        } else if (exports && module && module.exports) {
            // CommonJS/Node.js where module.exports is for nodejs
            exports = module.exports = Maybe;
        }
    } catch (err) {
        // no module loader (simple <script>-tag) -> assign Maybe directly to the global object
        // -> (0, eval)('this') is a robust way for getting a reference to the global object
        (this || (0, eval)('this')).Maybe = Maybe; // jshint ignore:line
    }
}((function () {
        // use Symbol for saving the value in a private way or fallback to string
        const __value = typeof Symbol === 'function' ? Symbol('value') : '__value';

        function __assign (target, origin) {
            Object.keys(origin).forEach(key => {
                const descriptor = Object.getOwnPropertyDescriptor(origin, key);
                if (descriptor !== undefined && descriptor.enumerable) {
                    Object.defineProperty(Object(target), key, descriptor);
                }
            });

            return target;
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
              * or - Returns this or a Maybe of the provided fallback in case this.isNothing()
              *
              * @param  {any} fallback Value to fall back to in case this.isNothing()
              * @return {Maybe}          this or new Maybe of the fallback
              */
            function or (fallback) {
                if (this.isNothing()) {
                    return Maybe.of(fallback);
                }

                return this;
            }

            /**
             * orDefault
             *
             * @see {@link or}
             * @see or
             */
            function orDefault (fallback) {
                return this.or(fallback);
            }

            /**
             * get - Try to get the value associated with the property propOrProps or the array of
             *       properties in appropriate order or return Maybe.nothing if not available
             *
             * @param  {string} prop Name of the property to get
             * @return {Maybe}      new Maybe of the value associated with prop or Maybe.nothing
             */
            function get (propOrProps) {
                if (this.isNothing()) {
                    return this;
                }

                // [].concat() is a nifty way to make sure we're handling an actual array while still accepting non-array arguments
                propOrProps = [].concat(propOrProps).reverse();

                let maybeResult = this;

                for (let result = this[__value];
                    !maybeResult.isNothing() && propOrProps.length > 0;
                    result = result[propOrProps.pop()],
                    maybeResult = Maybe.of(result)) {}

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
                if (this.isNothing()) {
                    return 'Maybe(nothing)';
                }

                return `Maybe(${Object(this[__value]).toString()})`;
            }

            return {
                isNull, isNaN, isUndefined, isNothing, map, orDefault, or, get, join, value, chain, toString,
            };
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
                return `MaybeFunction(${this[__value].toString()})`;
            }

            return {
                apply, toString, join
            };
        }());
        // inherit from Maybe prototype
        MaybeFunction.prototype = __assign(__assign({}, Maybe.prototype) /* copy object by assigning its properties to an empty object */,
                                            MaybeFunction.prototype);

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
        };

        // Helper method to determine if a value represents a Maybe
        result.isMaybe = Maybe.isMaybe = function (value) {
            return /(^Maybe\(|^MaybeFunction\()/.test(Object(value).toString());
        };

        // Shorthand for Maybe.of(null) for not needing to create it multiple times
        result.nothing = Maybe.nothing = Maybe.of(null);

        return result;
    }())
));
