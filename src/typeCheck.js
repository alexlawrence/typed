'use strict';

var hasType = function(object, type) {
    if (type == null) return true;
    if (typeof type === 'string') {
        return  getNativeType(object) === type || isCustomType(object, type);
    }
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
    if (!type || typeof type != 'string' || nativeTypes.indexOf(type) > -1) return;
    try{
        if (eval('typeof ' + type + ' != "function"')) errorReporting.throwError('invalid type');
    }
    catch(e) {
        throw new Error('typed: Invalid type declaration given');
    }
};

var nativeTypes = ['Number', 'Boolean', 'String', 'Array', 'Object', 'Function'];

exports.hasType = hasType;
exports.checkIfTypeIsAvailable = checkIfTypeIsAvailable;