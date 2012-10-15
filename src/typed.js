'use strict';

var typeCheck = require('./typeCheck');

var typed = function(f) {
    if (!typed.active) return f;
    if (typeof f !== 'function') errorReporting.throwError(f + ' is not a function');
    var decorated = function() {
        var i = arguments.length, types = decorated.types;
        while (i--) {
            if (!typeCheck.hasType(arguments[i], types[i])) {
                throw new Error('typed: argument ' + i + ' is not of type ' + types[i]);
            }
        }
        return f.apply(this, arguments);
    };

    decorated.types = typed.parser.parseTypes(f);

    return decorated;
};

typed.commentParser = require('./typeParser/commentParser');
typed.suffixParser = require('./typeParser/suffixParser');
typed.dummyParser = require('./typeParser/dummyParser');

typed.parser = typed.commentParser;

typed.active = true;

module.exports = typed;