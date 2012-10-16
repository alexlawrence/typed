'use strict';

var typeCheck = require('../src/typeCheck');

describe('typeCheck', function() {

    describe('hasType', function() {

        describe('when checking if an object has type "Object"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType({}, 'Object')).toBeTruthy();
            });

        });

        describe('when checking if an array has type "Array"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType([], 'Array')).toBeTruthy();
            });

        });

        describe('when checking if a number has type "Number"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType(5, 'Number')).toBeTruthy();
            });

        });

        describe('when checking if a boolean has type "Boolean"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType(true, 'Boolean')).toBeTruthy();
            });

        });

        describe('when checking if a function has type "Function"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType(function() {}, 'Function')).toBeTruthy();
            });

        });

        describe('when checking if a string has type "String"', function() {

            it('should return true', function() {
                expect(typeCheck.hasType('string', 'String')).toBeTruthy();
            });

        });

        describe('when checking if an object of a custom type has type "Object"', function() {

            it('should return false', function() {
                var _ = global.Foo;
                global.Foo = function() {};
                expect(typeCheck.hasType(new Foo(), 'Object')).toBeFalsy();
                global.Foo = _;
            });

        });

        describe('when checking if an object of a custom type has the custom type', function() {

            it('should return true', function() {
                var _ = global.Foo;
                global.Foo = function() {};
                //noinspection JSUnresolvedFunction
                expect(typeCheck.hasType(new Foo(), 'Foo')).toBeTruthy();
                global.Foo = _;
            });

        });

        describe('when checking if an object matches a structure of types', function() {

            var typeStructure = {a: 'Boolean', b: 'String'};

            describe('when providing the correct types', function() {

                it('should return true', function() {
                    expect(typeCheck.hasType({a: true, b: 'text'}, typeStructure)).toBeTruthy();
                });

            });

            describe('when providing partially the correct types', function() {

                it('should return false', function() {
                    expect(typeCheck.hasType({a: true, b: 1}, typeStructure)).toBeFalsy();
                });

            });

            describe('when providing the wrong types', function() {

                it('should return false', function() {
                    expect(typeCheck.hasType({a: 'a', b: 1}, typeStructure)).toBeFalsy();
                });

            });

            describe('when providing the wrong structure', function() {

                it('should return false', function() {
                    expect(typeCheck.hasType({}, typeStructure)).toBeFalsy();
                });

            });

        });

        describe('when only passing a value but no type to check', function() {

            it('should return true', function() {
                expect(typeCheck.hasType({})).toBeTruthy();
            });

        });

    });

});