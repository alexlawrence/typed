'use strict';

var typed = require('./../src/typed');

typed.parser = typed.noParser;

describe('typed', function() {

    beforeEach(function() {
        typed.active = true;
    });

    describe('when creating a typed function', function() {

        describe('without providing an actual function', function() {

            it('should throw an error', function() {
                expect(function() { typed({})}).toThrow();
                expect(function() { typed()}).toThrow();
                expect(function() { typed('a')}).toThrow();
                expect(function() { typed(1)}).toThrow();
            });

        });

        describe('when providing an actual function', function() {

            it('should return a new function', function() {
                var f = function() {};
                expect(typeof typed(f)).toBe('function');
                expect(typed(f)).not.toBe(f);
            });

            it('should pass the function to the typed.parser.parseTypes function', function() {
                var f = function() {};
                spyOn(typed.parser, 'parseTypes');
                typed(f);
                expect(typed.parser.parseTypes).toHaveBeenCalledWith(f);
            });

            it('should return a new function which provides a types array', function() {
                expect(typed(function() {}).types.length).toBe(0);
            });

        });

    });

    describe('when calling a typed function', function() {

        var sum, scopeSpy;

        beforeEach(function() {
            scopeSpy = jasmine.createSpy('scope spy');
            sum = {
                original: function(a, b) {
                    scopeSpy(this);
                    return a + b;
                }
            };
            spyOn(sum, 'original').andCallThrough();
            sum.typed = typed(sum.original);
        });

        it('should pass the call through to the original function', function() {
            sum.typed();
            expect(sum.original).toHaveBeenCalled();
        });

        it('should apply the correct scope to the original function', function() {
            var scope = {};
            sum.typed.apply(scope);
            expect(scopeSpy).toHaveBeenCalledWith(scope);
        });

        it('should pass the correct arguments to the original function', function() {
            sum.typed(1, 2);
            expect(sum.original).toHaveBeenCalledWith(1, 2);
        });

        it('should return the original return value of the original function', function() {
            expect(sum.typed(1, 2)).toBe(3);
        });

    });

    describe('when calling a typed function with typed arguments', function() {

        describe('when declaring the first argument as number', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Number'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f(1); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f('1'); }).toThrow();
            });

        });

        describe('when declaring the first argument as boolean', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Boolean'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f(true); }).not.toThrow();
            });

            it('should throw an error when not called with a Boolean as this argument', function() {
                expect(function() { f('true'); }).toThrow();
            });

        });

        describe('when declaring the first argument as string', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['String'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f(''); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f(true); }).toThrow();
            });

        });

        describe('when declaring the first argument as array', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Array'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f([]); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f({}); }).toThrow();
            });

        });

        describe('when declaring the first argument as object', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Object'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f({}); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f([]); }).toThrow();
            });

        });

        describe('when declaring the first argument as function', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Function'];
            });

            it('should not throw an error when provided the right type', function() {
                expect(function() { f(function() {}); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f(''); }).toThrow();
            });

        });

        describe('when declaring the first argument as number and the second as string', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = ['Number', 'String'];
            });

            it('should not throw an error when provided the right types', function() {
                expect(function() { f(1, '1'); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type for the first argument', function() {
                expect(function() { f('1', '1'); }).toThrow();
            });

            it('should throw an error when provided a wrong type for the second argument', function() {
                expect(function() { f(1, 1); }).toThrow();
            });

        });

        describe('when declaring the first argument of unknown type and the second as number', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = [undefined, 'Number'];
            });

            it('should not throw an error when provided the right types', function() {
                expect(function() { f(1, 1); }).not.toThrow();
            });

            it('should throw an error when provided a wrong type for the second argument', function() {
                expect(function() { f(1, '1'); }).toThrow();
            });

        });

        describe('when declaring the first argument as typed structure with one property of type boolean', function() {

            var f;

            beforeEach(function() {
                f = typed(function() {});
                f.types = [{a: 'Boolean'}];
            });

            it('should throw an error when provided a wrong type', function() {
                expect(function() { f(1); }).toThrow();
            });

            it('should not throw an error when provided the right structure with the right types', function() {
                expect(function() { f({a: true}); }).not.toThrow();
            });

        });

    });

    describe('when setting typed.active to false', function() {

        describe('when creating a typed function', function() {

            it('should return the original function', function() {

                typed.active = false;
                var f = function() {};
                expect(typed(f)).toBe(f);
                typed.active = true;

            });

        });

    });

});