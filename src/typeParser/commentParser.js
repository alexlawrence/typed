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