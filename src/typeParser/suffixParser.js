'use strict';

var typeCheck = require('../typeCheck');

var parseTypes = function(f) {
    var types = [];
    var functionText = f.toString();
    var argumentsString = functionText.substring(functionText.indexOf('(') + 1, functionText.indexOf(')'));

    if (argumentsString.length === 0) return types;

    var argumentList = argumentsString.split(',');
    var i = argumentList.length - 1;
    do {
        var matches = argumentTypeRegex.exec(argumentList[i]);
        if (matches == null) continue;
        var type = matches[1];
        typeCheck.checkIfTypeIsAvailable(type);
        types[i] = type;
    } while (i-- > 0);
    return types;
};

var setTypeSeparator = function(separator) {
    if (separator == '$') separator = '\\$';
    argumentTypeRegex = new RegExp('\\s*[A-Z$][0-9A-Z$]*' + separator + '([0-9A-Z$]*)\\s*', 'i');
};

var argumentTypeRegex;
setTypeSeparator('_');

exports.parseTypes = parseTypes;
exports.setTypeSeparator = setTypeSeparator;