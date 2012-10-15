var suffixParser = require('../../src/typeParser/suffixParser');

describe('suffixParser (using "$" as separator)', function() {

    beforeEach(function() {
        suffixParser.setTypeSeparator('$');
    });

    describe('when using native types for argument type declaration', function() {

        describe('when declaring an argument as Number', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Number) { return a$Number; });
                expect(types[0]).toBe('Number');
            });

        });

        describe('when declaring an argument as Boolean', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Boolean) { return a$Boolean; });
                expect(types[0]).toBe('Boolean');
            });

        });

        describe('when declaring an argument as String', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$String) { return a$String; });
                expect(types[0]).toBe('String');
            });

        });

        describe('when declaring an argument as Array', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Array) { return a$Array; });
                expect(types[0]).toBe('Array');
            });

        });

        describe('when declaring an argument as Object', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Object) { return a$Object; });
                expect(types[0]).toBe('Object');
            });

        });

        describe('when declaring an argument as Function', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Function) { return a$Function; });
                expect(types[0]).toBe('Function');
            });

        });

        describe('when declaring the first argument as Number and the second as String', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a$Number, b$String) { return a$Number + b$String; });
                expect(types[0]).toBe('Number');
                expect(types[1]).toBe('String');
            });

        });

        describe('when declaring the first argument without type and the second as Number', function() {

            it('should parse the correct type information', function() {
                var types = suffixParser.parseTypes(function(a, b$Number) { return a + b$Number; });
                expect(types[0]).toBeUndefined();
                expect(types[1]).toBe('Number');
            });

        });

    });

    describe('when using custom types for argument type declaration', function() {

        describe('when declaring an argument as not globally available custom type', function() {

            it('should throw an error', function() {
                expect(function() { suffixParser.parseTypes(function(a$NotExisting) {}); }).toThrow();
            });

        });

        describe('when declaring an argument as global available custom type', function() {

            it('should store the correct type information', function() {
                var _ = global.Foo;
                global.Foo = function() {};
                var types = suffixParser.parseTypes(function(a$Foo) { return a$Foo; });
                expect(types[0]).toBe('Foo');
                global.Foo = _;
            });

        });

        describe('when declaring an argument as not something other than a constructor function', function() {

            it('should throw an error', function() {
                var _ = global.Foo;
                global.Foo = {};
                expect(function() { suffixParser.parseTypes(function(a$Foo) {}); }).toThrow();
                global.Foo = _;
            });

        });

    });

    describe('when using problematic comments inside the arguments list', function() {

        var expectTypeDeclaration = function(typeDeclaration) {
            return {
                toBecomeType: function(expectedType) {
                    it('should store the correct type information', function() {
                        var types = eval('suffixParser.parseTypes(function(' + typeDeclaration + ') {});');
                        expect(types[0]).toBe(expectedType);
                    });
                }
            };
        };

        describe('when having a comment with another type declaration after the actual one', function() {
            expectTypeDeclaration('a$Number/*$String*/').toBecomeType('Number');
        });

        describe('when having a comment with another type declaration before the actual one', function() {
            expectTypeDeclaration('/*$String*/a$Number').toBecomeType('Number');
        });

    });

    describe('when using the argument type separator multiple times in one argument', function() {

        it('should interpret the last occurrence', function() {

            expect(suffixParser.parseTypes(function(a$foobar$Number) {})[0]).toBe('Number');

        });

    });
});