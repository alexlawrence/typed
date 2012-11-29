/**
 * @license
 * typed - Type checking for JavaScript - version 0.3.3
 * Copyright 2012, Alex Lawrence
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */

(function(){var global = this;function debug(){return debug};function require(p, parent){ var path = require.resolve(p) , mod = require.modules[path]; if (!mod) throw new Error('failed to require "' + p + '" from ' + parent); if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path), global); } return mod.exports;}require.modules = {};require.resolve = function(path){ var orig = path , reg = path + '.js' , index = path + '/index.js'; return require.modules[reg] && reg || require.modules[index] && index || orig;};require.register = function(path, fn){ require.modules[path] = fn;};require.relative = function(parent) { return function(p){ if ('debug' == p) return debug; if ('.' != p.charAt(0)) return require(p); var path = parent.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/'), parent); };};require.register("typeCheck.js", function(module, exports, require, global){
'use strict';

var hasType = function(object, type) {
    if (type == null) return true;
    if (object == null) return false;
    if (typeof type === 'string') return (getNativeType(object) === type || isCustomType(object, type));
    return matchesTypeStructure(object, type);
};

var getNativeType = function(object) {
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec(object.constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};

var isCustomType = function(object, type) {
    return type !== 'Object' && new Function('a', 'return a instanceof ' + type)(object);
};

var matchesTypeStructure = function(object, typeStructure) {
    for (var property in typeStructure) {
        if (!typeStructure.hasOwnProperty(property)) continue;
        var type = typeStructure[property];
        if (!hasType(object[property], type)) return false;
    }
    return true;
};

var checkIfTypeIsAvailable = function(type) {
    if (!type || typeof type != 'string' || isNativeType(type)) return;
    try{
        if (eval('typeof ' + type + ' != "function"')) throw new Error();
    }
    catch(e) {
        throw new TypeError('Type ' + type + ' is not available');
    }
};

var isNativeType = function(type) {
    for (var i = 0, j = nativeTypes.length; i < j; i++) {
        if (type === nativeTypes[i]) return true;
    }
    return false;
};

var getReadableType = function(type) {
    return typeof type === 'string' ?
        type : JSON.stringify(type).replace(/"/g, '');
};

var nativeTypes = ['Number', 'Boolean', 'String', 'Array', 'Object', 'Function'];

exports.hasType = hasType;
exports.checkIfTypeIsAvailable = checkIfTypeIsAvailable;
exports.getReadableType = getReadableType;
});require.register("typeParser/commentParser.js", function(module, exports, require, global){
'use strict';

var typeCheck = require('../typeCheck');

var parseTypes = function(f) {
    var types = [];
    var functionText = f.toString();
    var argumentsString = functionText.substring(functionText.indexOf('(') + 1, functionText.indexOf(')'));

    if (argumentsString.length === 0) return types;

    var argumentList = splitArguments(argumentsString);
    var i = argumentList.length - 1;
    do {
        var matches = argumentTypeRegex.exec(argumentList[i]);
        if (matches == null) continue;
        var type = getArgumentType(matches[1]);
        typeCheck.checkIfTypeIsAvailable(type);
        types[i] = type;
    } while (i-- > 0);
    return types;
};

var splitArguments = function(input) {
    var argumentsList = [], isInsideStructure = false, currentArgument = '';
    for (var i = 0, j = input.length; i < j; i++) {
        if (!isInsideStructure && input[i] === ',') {
            argumentsList.push(currentArgument);
            currentArgument = '';
            continue;
        }
        currentArgument = currentArgument + input[i];
        if (input[i] === '{') isInsideStructure = true;
        if (input[i] === '}') isInsideStructure = false;
    }
    if (currentArgument !== '') argumentsList.push(currentArgument);
    return argumentsList;
};

var getArgumentType = function(type){
    if (type === '[]') return 'Array';
    if (type === '{}') return 'Object';
    if (isStructureRegex.test(type)) return getStructureTypes(type);
    return type;
};

var getStructureTypes = function(structureTypes) {
    structureTypes = structureTypes.replace(structureTypesRegex, '"$1":"$2"');
    return JSON.parse(structureTypes);
};

var argumentTypeRegex = /\/\*\s*:\s*(\{.*\}||\[\s*\]||[A-Z_$][0-9A-Z_$]*)\s*\*\//i;
var isStructureRegex = /\{.*[^\s].*\}/;
var structureTypesRegex = /([A-Z_$][0-9A-Z_$]*)\s*:\s*([A-Z_$][0-9A-Z_$]*)/gi;


exports.parseTypes = parseTypes;
});require.register("typeParser/noParser.js", function(module, exports, require, global){
'use strict';

exports.parseTypes = function() {
    return [];
};
});require.register("typeParser/suffixParser.js", function(module, exports, require, global){
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
});require.register("typed.js", function(module, exports, require, global){
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
});var exp = require('typed');if ("undefined" != typeof module) module.exports = exp;else typed = exp;
})();