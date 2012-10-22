'use strict';

var typeCheck = require('./typeCheck');

var typed = function(f) {
    if (!typed.active) return f;
    if (typeof f !== 'function') errorReporting.throwError(f + ' is not a function');
    var decorated = function() {
        var types = decorated.types;
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (!typeCheck.hasType(arguments[i], types[i])) {
                var readableType = typeCheck.getReadableType(types[i]);
                throw new TypeError(
                    'Supplied argument ' + (i + 1) + ' is not of type ' + readableType);
            }
        }
        return f.apply(this, arguments);
    };

    decorated.types = typed.parser.parseTypes(f) || [];

    return decorated;
};

typed.commentParser = require('./typeParser/commentParser');
typed.suffixParser = require('./typeParser/suffixParser');
typed.noParser = require('./typeParser/noParser');

typed.parser = typed.commentParser;

typed.active = true;

module.exports = typed;