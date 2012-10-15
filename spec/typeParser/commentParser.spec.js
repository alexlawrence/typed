var commentParser = require('../../src/typeParser/commentParser');

describe('commentParser', function() {

    describe('when using native types for argument type declaration', function() {

        describe('when declaring an argument as Number', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Number*/) { return a; });
                expect(types[0]).toBe('Number');
            });

        });

        describe('when declaring an argument as Boolean', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Boolean*/) { return a; });
                expect(types[0]).toBe('Boolean');
            });

        });

        describe('when declaring an argument as String', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:String*/) { return a; });
                expect(types[0]).toBe('String');
            });

        });

        describe('when declaring an argument as Array', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Array*/) { return a; });
                expect(types[0]).toBe('Array');
            });

        });

        describe('when declaring an argument as array literal', function() {

            it('should interpret the type as "Array"', function() {
                var types = commentParser.parseTypes(function(a /*:[]*/) { return a; });
                expect(types[0]).toBe('Array');
            });

        });

        describe('when declaring an argument as Object', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Object*/) { return a; });
                expect(types[0]).toBe('Object');
            });

        });

        describe('when declaring an argument as Function', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Function*/) { return a; });
                expect(types[0]).toBe('Function');
            });

        });

        describe('when declaring the first argument as Number and the second as String', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a /*:Number*/, b /*:String*/) { return a + b; });
                expect(types[0]).toBe('Number');
                expect(types[1]).toBe('String');
            });

        });

        describe('when declaring the first argument without type and the second as Number', function() {

            it('should parse the correct type information', function() {
                var types = commentParser.parseTypes(function(a, b /*:Number*/) { return a + b; });
                expect(types[0]).toBeUndefined();
                expect(types[1]).toBe('Number');
            });

        });

    });

    describe('when using object literals as argument type declaration', function() {

        describe('when declaring an argument as an empty object literal', function() {

            it('should interpret the type as "Object"', function() {
                var types = commentParser.parseTypes(function(a /*:{}*/) { return a; });
                expect(types[0]).toBe('Object');
            });

        });

        describe('when declaring an argument as a structure with two typed properties', function() {

            var types;

            beforeEach(function() {
                types = commentParser.parseTypes(function(a /*:{a: String, b: Number}*/) { return a; });
            });

            it('should interpret the type as structure', function() {
                expect(typeof types[0]).toBe('object');
            });

            it('should parse the correct type information for the properties in the structure', function() {
                expect(types[0].a).toBe('String');
                expect(types[0].b).toBe('Number');
            });

        });

        describe('when declaring an argument as a structure with two typed properties', function() {

            var types;

            beforeEach(function() {
                types = commentParser.parseTypes(function(a /*:{a: String, b: Number}*/) { return a; });
            });

            it('should interpret the type as structure', function() {
                expect(typeof types[0]).toBe('object');
            });

            it('should parse the correct type information for the properties in the structure', function() {
                expect(types[0].a).toBe('String');
                expect(types[0].b).toBe('Number');
            });

        });

    });

    describe('when using custom types for argument type declaration', function() {

        describe('when declaring an argument as not globally available custom type', function() {

            it('should throw an error', function() {
                expect(function() { commentParser.parseTypes(function(a/*:NotExisting*/) {}); }).toThrow();
            });

        });

        describe('when declaring an argument as global available custom type', function() {

            it('should store the correct type information', function() {
                var _ = global.Foo;
                global.Foo = function() {};
                var types = commentParser.parseTypes(function(a /*:Foo*/) { return a; });
                expect(types[0]).toBe('Foo');
                global.Foo = _;
            });

        });

        describe('when declaring an argument as not something other than a constructor function', function() {

            it('should throw an error', function() {
                var _ = global.Foo;
                global.Foo = {};
                expect(function() { commentParser.parseTypes(function(a/*:Foo*/) {}); }).toThrow();
                global.Foo = _;
            });

        });

    });

    describe('when using different spacings on the typed argument syntax', function() {

        var expectTypeDeclaration = function(typeDeclaration) {
            return {
                toBecomeType: function(expectedType) {
                    it('should store the correct type information', function() {
                        var types = eval('commentParser.parseTypes(function(' + typeDeclaration + ') {});');
                        expect(types[0]).toBe(expectedType);
                    });
                }
            };
        };

        describe('when having no spaces inside the argument and type declaration', function() {
            expectTypeDeclaration('a/*:Number*/').toBecomeType('Number');
        });

        describe('when having some spaces between the argument and the type declaration', function() {
            expectTypeDeclaration('a          /*:Number*/').toBecomeType('Number');
        });

        describe('when having some spaces between the comment start and the colon', function() {
            expectTypeDeclaration('a/*      :Number*/').toBecomeType('Number');
        });

        describe('when having some spaces between the colon and the type name', function() {
            expectTypeDeclaration('a/*:    Number*/').toBecomeType('Number');
        });

        describe('when having some spaces between the type name and the comment end', function() {
            expectTypeDeclaration('a/*:Number    */').toBecomeType('Number');
        });

    });

    describe('when using problematic characters inside comments for a typed function', function() {

        describe('when using an opening bracket in a comment before the actual function brackets', function() {

            it('should still be able to create a correct typed function', function() {

                expect(commentParser.parseTypes(function/*(*/(a/*:Number*/) {})[0]).toBe('Number');

            });

        });

        describe('when using a closing bracket in a comment before the function arguments closing bracket', function() {

            it('should not be able to create a correct typed function', function() {

                expect(commentParser.parseTypes(function(/*)*/a/*:Number*/) {})[0]).toBe(undefined);

            });

        });

    });
});