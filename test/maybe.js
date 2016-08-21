const expect = require('chai').expect;
let Maybe = require('../');

if (process.env.MAYBE_COV) {
    describe('Test coverage', function () {
        it('should generate instrumentation', function (done) {
              require('child_process').exec('$(npm root)/.bin/jscoverage dist dist-cov', done);
        });

        it('should load module', function () {
            Maybe = require('../dist-cov/maybe');
        });
    });
}

describe('Maybe', function() {
   describe ('construction', function () {
       it ('new Maybe(), Maybe.of() and Maybe() should behave the same', function () {
          const user = {
              name: 'sven',
              address: {
                  street: 'foo',
                  zip: 12345,
              }
          };

          expect(new Maybe(user).get('address').get('street').orDefault('no street').join()).to.be.equal('foo');
          expect(Maybe(user).get('address').get('street').orDefault('no street').join()).to.be.equal('foo');
          expect(Maybe.of(user).get('address').get('street').orDefault('no street').join()).to.be.equal('foo');

          expect(new Maybe({}).get('address').get('street').orDefault('no street').join()).to.be.equal('no street');
          expect(Maybe({}).get('address').get('street').orDefault('no street').join()).to.be.equal('no street');
          expect(Maybe.of({}).get('address').get('street').orDefault('no street').join()).to.be.equal('no street');
       });
       it ('Maybe.of(function) should return MaybeFunction instead of Maybe', function () {
          expect(Maybe.of(function () { }).toString()).to.be.equal('[object MaybeFunction]');
       });
       it('Maybe.of(Maybe) should return original Maybe (not nested ones)', function () {
          expect(Maybe.of(Maybe.of(1))).to.be.deep.equal(Maybe.of(1));
          expect(Maybe.of(Maybe.of(Maybe.of(1)))).to.be.deep.equal(Maybe.of(1));
          expect(Maybe.of(Maybe.of(Maybe.of(Maybe.of(1))))).to.be.deep.equal(Maybe.of(1));
       });
   });

   describe ('isNull, isUndefined and isNaN', function () {
       it ('should be exclusive', function () {
          const nullMaybe = Maybe.of(null);
          const undefinedMaybe = Maybe.of(undefined);
          const nanMaybe = Maybe.of(NaN);

          expect(nullMaybe.isNull() && nullMaybe.isUndefined() && nullMaybe.isNaN()).to.be.equal(false);
          expect(undefinedMaybe.isNull() && undefinedMaybe.isUndefined() && undefinedMaybe.isNaN()).to.be.equal(false);
          expect(nanMaybe.isNull() && nanMaybe.isUndefined() && nanMaybe.isNaN()).to.be.equal(false);
       });
   });

   describe ('isNothing', function () {
      it ('should be true for undefined', function () {
          expect(Maybe.of(undefined).isNothing()).to.be.equal(true);
      });

      it ('should be true for null', function () {
          expect(Maybe.of(null).isNothing()).to.be.equal(true);
      });

      it ('should be true for NaN', function () {
          expect(Maybe.of(NaN).isNothing()).to.be.equal(true);
      });

      it ('should be false for 0', function () {
          expect(Maybe.of(0).isNothing()).to.be.equal(false);
      });

      it ('should be false for empty string', function () {
          expect(Maybe.of("").isNothing()).to.be.equal(false);
      });

      it ('should be false for false', function () {
          expect(Maybe.of(false).isNothing()).to.be.equal(false);
      });
   });

   describe('join', function () {
      it('should return Maybe.of(null) for null/undefined/NaN', function () {
         const nothing = Maybe.nothing;

         expect(Maybe.of(undefined).join()).to.be.deep.equal(nothing);
         expect(Maybe.of(null).join()).to.be.deep.equal(nothing);
         expect(Maybe.of(NaN).join()).to.be.deep.equal(nothing);
      });

      it('should return real value for truthy values', function () {
         expect(Maybe.of(0).join()).to.be.equal(0);
         expect(Maybe.of("").join()).to.be.equal("");
         expect(Maybe.of("hallo welt").join()).to.be.equal("hallo welt");
      });
   });

   describe('get', function () {
       const user = {
           name: 'sven',
           address: {
               street: 'bahnhofstr.',
               zip: '12456',
           }
       };
       const user2 = {
           name: 'sven',
           accountDetails: {
               email: 'foo@example.com',
               address: {
                   street: 'bahnhofstr.',
                   zip: '12456',
               },
           },
       };

      it ('should return value of object property if available', function () {
          expect(Maybe.of(user).get('name').join()).to.be.equal('sven');
          expect(Maybe.of(user).get('address').join()).to.be.deep.equal(user.address);
          expect(Maybe.of(user).get('address').get('zip').join()).to.be.equal('12456');
      });

      it ('should return Maybe.nothing if prop is not available', function () {
         expect(Maybe.of(user).get('foo')).to.be.deep.equal(Maybe.nothing);
         expect(Maybe.of(1).get('foo')).to.be.deep.equal(Maybe.nothing);
      });

      it ('should be possible to chain accesses for not existing properties and always return Maybe.nothing', function () {
         expect(Maybe.of(user).get('foo').get('bar').get('baz')).to.be.deep.equal(Maybe.nothing);
         expect(Maybe.of(1).get('foo').get('bar').get('baz')).to.be.deep.equal(Maybe.nothing);
      });

      it ('should be able to handle an array of properties in correct order', function () {
         expect(Maybe.of(user2).get(['accountDetails', 'address']).join()).to.be.deep.equal(user2.accountDetails.address);
         expect(Maybe.of(user2).get(['accountDetails', 'address', 'zip']).join()).to.be.equal('12456');
         expect(Maybe.of(user2).get(['accountDetails', 'foo']).join()).to.be.deep.equal(Maybe.nothing);
      });
   });

   describe('orDefault', function () {
       it('Maybe.of(...).orDefault(default).join() must be default if isNothing()', function () {
          expect(Maybe.of(null).orDefault(1).join()).to.be.equal(1);
       });
   })

   describe('chain', function () {
       it ('should do the same than calling map and then join', function () {
            expect(Maybe.of(1).chain(x => 2 * x)).to.be.deep.equal(Maybe.of(1).map(x => 2 * x).join());
       });
   });

   describe('MaybeFunction', function () {
       it('should become executed by .value() if it does not take arguments or number of arguments does not match, else return the wrapped function itself', function () {
           expect(Maybe.of(() => 4).join()).to.be.equal(4);
           expect(typeof Maybe.of(x => 4).join()).to.be.equal('function');
       });

       describe('apply', function () {
         it('should always return a new Maybe', function () {
            expect(Maybe.of(x => 2 * x).apply(Maybe.of(2))).to.be.deep.equal(Maybe.of(4));
            expect(Maybe.of(x => 2 * x).apply(Maybe.of(undefined))).to.be.deep.equal(Maybe.of(NaN));
         });

         it('should accept more than one argument', function () {
            expect(Maybe.of((x, y) => x + y).apply(Maybe.of(2), Maybe.of(2))).to.be.deep.equal(Maybe.of(4));
            expect(Maybe.of((x, y, z) => x + y + z).apply(Maybe.of(2), Maybe.of(2), Maybe.of(3))).to.be.deep.equal(Maybe.of(6));
         });

         it('should accept Maybe and non-Maybe arguments', function () {
            expect(Maybe.of(x => 2 * x).apply(2)).to.be.deep.equal(Maybe.of(4));
            expect(Maybe.of((x, y) => x + y).apply(2, Maybe.of(4))).to.be.deep.equal(Maybe.of(6));
         });
      });
   });
});
