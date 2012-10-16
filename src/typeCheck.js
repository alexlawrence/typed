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