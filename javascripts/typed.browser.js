var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/typeCheck.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

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
});

require.define("/typeParser/commentParser.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

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
});

require.define("/typeParser/suffixParser.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

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
    if (separator == '$') separator = '\\' + separator;
    argumentTypeRegex = new RegExp('\\s*[A-Z$][0-9A-Z$]*' + separator + '([0-9A-Z$]*)\\s*', 'i');
};

var argumentTypeRegex;
setTypeSeparator('_');

exports.parseTypes = parseTypes;
exports.setTypeSeparator = setTypeSeparator;
});

require.define("/typeParser/dummyParser.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

exports.parseTypes = function() {
    return [];
};
});

require.define("/typed.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

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
});
require("/typed.js");
