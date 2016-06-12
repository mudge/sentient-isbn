(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ISBN = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Sentient = require('sentient-lang'),
    program = require('../target/json/isbn.json'),
    ISBN;

ISBN = function (options) {
    var isbn10, isbn13, i, digit;

    this.result = {};
    this.tenDigit = new Array(10);
    this.thirteenDigit = new Array(13);

    if (options.hasOwnProperty('isbn10')) {
        isbn10 = options.isbn10.replace(/-/g, '');

        for (i = 0; i < 10; i += 1) {
            digit = isbn10.charAt(i);

            if (digit === 'X') {
                this.tenDigit[i] = 10;
            } else if (digit !== '?') {
                this.tenDigit[i] = parseInt(digit, 10);
            }
        }
    }

    if (options.hasOwnProperty('isbn13')) {
        isbn13 = options.isbn13.replace(/-/g, '');

        for (i = 0; i < 13; i += 1) {
            digit = isbn13.charAt(i);

            if (digit !== '?') {
                this.thirteenDigit[i] = parseInt(digit, 10);
            }
        }
    }
};

ISBN.prototype.results = function (n) {
    var n = n === undefined ? 1 : n;

    if (this.result.hasOwnProperty(n)) {
        return this.result[n];
    }

    this.result[n] = Sentient.run(program, {tenDigit: this.tenDigit, thirteenDigit: this.thirteenDigit}, n);

    return this.result[n];
};

ISBN.prototype.isbn10 = function () {
    return this.isbn10s(1)[0];
};

ISBN.prototype.isbn10s = function (n) {
    var isbn10s = [],
        results = this.results(n),
        isbn10;

    for (var i = 0; i < results.length; i += 1) {
        if (results[i].hasOwnProperty('tenDigit')) {
            isbn10 = results[i].tenDigit;

            if (isbn10[9] === 10) {
                isbn10s.push(isbn10.slice(0, 9).join('') + 'X');
            } else {
                isbn10s.push(isbn10.join(''));
            }
        }
    }

    return isbn10s;
};

ISBN.prototype.isbn13 = function () {
    return this.isbn13s(1)[0];
};

ISBN.prototype.isbn13s = function (n) {
    var isbn13s = [],
        results = this.results(n),
        isbn13;

    for (var i = 0; i < results.length; i += 1) {
        if (results[i].hasOwnProperty('thirteenDigit')) {
            isbn13 = results[i].thirteenDigit;

            isbn13s.push(isbn13.join(''));
        }
    }

    return isbn13s;
};

module.exports = ISBN;

},{"../target/json/isbn.json":61,"sentient-lang":6}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
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

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
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
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

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
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":5}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it don't break things.
var cachedSetTimeout = setTimeout;
var cachedClearTimeout = clearTimeout;

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
"use strict";

var Optimiser = require("./sentient/optimiser");
var CLI = require("./sentient/cli");

module.exports = require("./sentient");

module.exports.optimise = function (program) {
  return Optimiser.optimise(program);
};

module.exports.cli = function () {
  return CLI.run();
};

},{"./sentient":7,"./sentient/cli":8,"./sentient/optimiser":46}],7:[function(require,module,exports){
"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");
var Wrapper = require("./sentient/wrapper");
var Logger = require("./sentient/logger");

module.exports.compile = function (program, callback) {
  return Compiler.compile(program, callback);
};

module.exports.run = function (program, assignments, count, callback, adapter) {
  return Runtime.run(program, assignments, count, callback, adapter);
};

module.exports.wrap = function (program, name) {
  return Wrapper.wrap(program, name);
};

module.exports.optimise = function () {
  throw new Error("This feature is not available in a web browser.");
};

module.exports.cli = function () {
  throw new Error("This feature is not available in a web browser.");
};

module.exports.logger = Logger;

module.exports.info = require("../package.json");

module.exports.programs = {};

},{"../package.json":59,"./sentient/compiler":10,"./sentient/logger":41,"./sentient/runtime":49,"./sentient/wrapper":55}],8:[function(require,module,exports){
(function (global){
"use strict";

var commander = require("commander");
var fs = require("fs");
var readline = require("readline");

var Sentient = require("../sentient");
var Explanation = require("./cli/explanation");
var LingelingAdapter = require("./machine/lingelingAdapter");
var RissAdapter = require("./machine/rissAdapter");

var CLI = function (process) {
  var self = this;

  process = process || global.process;

  var info = Sentient.info;
  var command = new commander.Command();

  self.run = function () {
    readCommandLineArguments();

    var stream = parseStream();
    var mode = parseMode();
    var assignments = parseAssignments();
    var number = parseNumberArgument();
    var machine = parseMachineArgument();
    var level = parseLogLevel();

    readInput(stream, function (program) {
      Sentient.logger.level = level;

      if (mode.compile) {
        program = Sentient.compile(program);
      }

      if (mode.optimise) {
        program = Sentient.optimise(program);
      }

      if (mode.run) {
        Sentient.run(program, assignments, number, function (result) {
          console.log(result);
        }, machine);
      } else {
        if (mode.wrap) {
          program = Sentient.wrap(mode.wrap, program);
        }

        console.log(program);
      }
    });
  };

  var readCommandLineArguments = function () {
    command["arguments"]("[file]")
      .description(info.description + ", Version " + info.version)
      .option("-H, --help-verbose", "output usage information with explanation")
      .version(info.version, "-v, --version")
      .option("-c, --compile", "compile a program to machine code")
      .option("-o, --optimise", "optimise a pre-compiled program")
      .option("-r, --run", "run a pre-compiled program")
      .option("-a, --assign '<json>'", "assign some of the exposed variables")
      .option("-A, --assign-file <file>", "read assignments from a file")
      .option("-n, --number <n>", "return the given number of solutions")
      .option("-m, --machine <name>", "use the specified machine adapter")
      .option("-w, --wrap <name>", "wrap the output in JavaScript boilerplate")
      .option("-i, --info", "set the log level to info")
      .option("-d, --debug", "set the log level to debug")
      .action(function (file) { command.fileName = file; })
      .parse(process.argv);

    if (command.helpVerbose) {
      command.outputHelp();
      Explanation.print();
      process.exit(0);
    }
  };

  var parseStream = function () {
    var input;

    if (command.fileName) {
      input = fs.createReadStream(command.fileName);
    } else {
      input = process.stdin;
    }

    return readline.createInterface({ input: input, terminal: false });
  };

  var parseMode = function () {
    var c = command;

    if (!c.compile && !c.optimise && !c.run && !c.wrap) {
      return { compile: true, run: true };
    }

    return {
      compile: c.compile,
      optimise: c.optimise,
      run: c.run,
      wrap: c.wrap
    };
  };

  var parseAssignments = function () {
    var assignments = "{}";

    if (command.assign && command.assignFile) {
      console.error("Error: please use either --assign or --assign-file");
      process.exit(1);
    } else if (command.assign) {
      assignments = command.assign;
    } else if (command.assignFile) {
      assignments = fs.readFileSync(command.assignFile, "utf8");
    }

    // JavaScript is more lenient then JSON with quoted keys.
    // Also, JSON doesn't support undefined, only null.
    /* jshint -W061 */
    eval("assignments = " + assignments);

    return assignments;
  };

  var parseNumberArgument = function () {
    var number = 1;

    if (command.number) {
      number = parseInt(command.number, 10);
    }

    return number;
  };

  var parseMachineArgument = function () {
    switch (command.machine) {
      case "minisat":
        return;
      case "lingeling":
        return LingelingAdapter;
      case "riss":
        return RissAdapter;
      case undefined:
        return;
      default:
        throw new Error("Unknown machine: '" + command.machine + "'");
    }
  };

  var parseLogLevel = function () {
    if (command.info) {
      return "info";
    }

    if (command.debug) {
      return "debug";
    }

    return "silent";
  };

  var readInput = function (stream, callback) {
    var lines = [];

    stream.on("line", function (line) {
      lines.push(line);
    });

    stream.on("close", function () {
      callback(lines.join("\n"));
    });
  };
};

CLI.run = function () {
  return new CLI().run();
};

module.exports = CLI;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../sentient":7,"./cli/explanation":9,"./machine/lingelingAdapter":43,"./machine/rissAdapter":45,"commander":56,"fs":2,"readline":2}],9:[function(require,module,exports){
"use strict";

var Explanation = function () {
  var self = this;

  self.print = function () {
    console.log("  Explanation:");
    console.log();
    console.log("  --compile");
    console.log();
    console.log("  The 'compile' option changes the output to be compiled");
    console.log("  machine code rather than the result of running the");
    console.log("  program. This machine code can then be run later by using");
    console.log("  the 'run' option.");
    console.log();
    console.log("  It is useful to pre-compile a program when you intend to");
    console.log("  repeatedly run it with different sets of assignments. For");
    console.log("  example, you might write a program that solves knapsack,");
    console.log("  then repeatedly run it with different constraints.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --compile");
    console.log();
    console.log("  --optimise");
    console.log();
    console.log("  This 'optimise' option switches on machine code");
    console.log("  optimisation which attempts to minimise the resulting SAT");
    console.log("  problem before it is fed to the machine for solving. In");
    console.log("  order to use optimisation, you will need to have installed");
    console.log("  the 'Riss Coprocessor' executable.");
    console.log();
    console.log("  It is possible to optimise programs independently of their");
    console.log("  compilation. The optimiser reads machine code and writes");
    console.log("  optimised machine code to standard output.");
    console.log();
    console.log("  It is not recommended to use optimisation unless the");
    console.log("  program is intended to be run multiple times or separately");
    console.log("  in a web browser. Often, optimisation can take longer than");
    console.log("  compiling and running a program if it is only run once.");
    console.log();
    console.log("    $ sentient --optimise");
    console.log();
    console.log("  --run");
    console.log();
    console.log("  The 'run' option is used to run a pre-compiled program.");
    console.log("  rather than running the program from source. This is");
    console.log("  the recommended way to run programs as it means that much");
    console.log("  of the work in interpreting and optimising programs has");
    console.log("  already been completed by the compilation stage.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --run");
    console.log();
    console.log("  --assign");
    console.log();
    console.log("  The 'assign' option is used to assign values to variables");
    console.log("  within a Sentient program. Any variable that appears in");
    console.log("  an 'expose' statement will be assignable. Assignments");
    console.log("  impose additional constraints on the program when it runs.");
    console.log();
    console.log("  A set of assignments must be a valid JSON object. Each");
    console.log("  variable to be assigned should appear as a key of this");
    console.log("  object. Values can be booleans, integers or arrays.");
    console.log();
    console.log("  Arrays support additional syntax that allows some of its");
    console.log("  elements to be set, whilst leaving others unset. You can");
    console.log("  either mark elements as 'undefined' or set elements by");
    console.log("  array index. The last two examples below are equivalent.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --assign '{ a: true, b: 123, c: -50 }'");
    console.log("    $ sentient --assign '{ foo: [1, 2, 3] }'");
    console.log("    $ sentient --assign '{ foo: [undefined, 2] }'");
    console.log("    $ sentient --assign '{ foo: { 1: 2 } }'");
    console.log();
    console.log("  --assign-file");
    console.log();
    console.log("  The 'assign-file' option works in the same way as 'assign'");
    console.log("  except it reads its assignments from a file. This is");
    console.log("  useful when assigning on command-line becomes unwieldy.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --assign-file assignments.json");
    console.log();
    console.log("  --number");
    console.log();
    console.log("  The 'number' option specifies how many solutions should be");
    console.log("  returned. By default, this value is 1. If a value of 0 is");
    console.log("  specified, Sentient will continue to search for solutions.");
    console.log();
    console.log("  It is possible that all solutions are found before the");
    console.log("  specified number is reached. In this case, an empty object");
    console.log("  will be returned and Sentient will terminate.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --number 5");
    console.log("    $ sentient --number 0");
    console.log();
    console.log("  --machine");
    console.log();
    console.log("  The 'machine' option specifies which SAT solver is used to");
    console.log("  run programs. Having the ability to swap out the solver");
    console.log("  allows programs to be run on different platforms.");
    console.log();
    console.log("  By default, the 'minisat' adapter is used, which is a");
    console.log("  version of MiniSat that has been compiled into JavaScript");
    console.log("  with Emscripten. Currently, Sentient supports two other");
    console.log("  adapters: 'lingeling' and 'riss'. These are usually faster");
    console.log("  but must be installed before they can be used.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --machine lingeling");
    console.log("    $ sentient --machine riss");
    console.log();
    console.log("  --wrap");
    console.log();
    console.log("  The 'wrap' option changes the output to be JavaScript that");
    console.log("  can be included in a web page with a script tag or");
    console.log("  required in a node application. This option takes a 'name'");
    console.log("  argument that specifes the key for the program string.");
    console.log();
    console.log("  Programs are bound to 'window.Sentient.programs' if the");
    console.log("  global 'window' object is available and 'module.exports'");
    console.log("  if the 'module' object is available. It is possible to");
    console.log("  store many programs in a single file by concatenating them");
    console.log("  together. This reduces the number of web browser requests.");
    console.log();
    console.log("  It is preferrable to wrap compiled/optimised programs");
    console.log("  because this work can be done upfront. However, it is also");
    console.log("  possible to wrap original source programs using this");
    console.log("  option on its own.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --wrap magicSquare");
  };
};

Explanation.print = function () {
  new Explanation().print();
};

module.exports = Explanation;

},{}],10:[function(require,module,exports){
"use strict";

var Level4Compiler = require("./compiler/level4Compiler");
var Level3Compiler = require("./compiler/level3Compiler");
var Level2Compiler = require("./compiler/level2Compiler");
var Level1Compiler = require("./compiler/level1Compiler");
var Logger = require("./logger");

var Compiler = function (program, callback) {
  var self = this;

  self.compile = function () {
    if (typeof callback === "undefined") {
      return compile();
    } else {
      return setTimeout(function () {
        callback(compile());
      }, 0);
    }
  };

  var compile = function () {
    Logger.info("Compiling program...");

    Logger.debug("Program characters: " + program.length);
    program = Level4Compiler.compile(program);

    Logger.debug("Level 3 instructions: " + program.instructions.length);
    program = Level3Compiler.compile(program);

    Logger.debug("Level 2 instructions: " + program.instructions.length);
    program = Level2Compiler.compile(program);

    Logger.debug("Level 1 instructions: " + program.instructions.length);
    program = Level1Compiler.compile(program);

    Logger.debug("Machine code characters: " + program.length);
    Logger.info("Finished compiling");

    return program;
  };
};

Compiler.compile = function (program, callback) {
  return new Compiler(program, callback).compile();
};

module.exports = Compiler;

},{"./compiler/level1Compiler":13,"./compiler/level2Compiler":18,"./compiler/level3Compiler":23,"./compiler/level4Compiler":32,"./logger":41}],11:[function(require,module,exports){
"use strict";

var Stack = function () {
  var self = this;
  var array = [];

  self.push = function (symbol) {
    array.push(symbol);
  };

  self.pop = function () {
    var symbol = array.pop();

    if (typeof symbol === "undefined") {
      throw new Error("Cannot pop from an empty stack");
    }

    return symbol;
  };
};

module.exports = Stack;

},{}],12:[function(require,module,exports){
"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};

  self.set = function (symbol, type, symbols) {
    object[symbol] = { type: type, symbols: symbols };
  };

  self.type = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].type;
  };

  self.symbols = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].symbols;
  };

  self.contains = function (symbol) {
    return typeof object[symbol] !== "undefined";
  };

  var throwIfMissing = function (symbol) {
    if (!self.contains(symbol)) {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }
  };
};

module.exports = SymbolTable;

},{}],13:[function(require,module,exports){
"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./level1Compiler/symbolTable");
var Registry = require("./level1Compiler/registry");
var CodeWriter = require("./level1Compiler/codeWriter");
var InstructionSet = require("./level1Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var stack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var codeWriter = new CodeWriter();

  var instructionSet = new InstructionSet({
    stack: stack,
    symbolTable: symbolTable,
    registry: registry,
    codeWriter: codeWriter
  });

  self.compile = function () {
    if (input.metadata) {
      codeWriter.metadata(input.metadata);
    }

    _.each(input.instructions, function (instruction) {
      instructionSet.call(instruction);
    });

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;

},{"./common/stack":11,"./level1Compiler/codeWriter":14,"./level1Compiler/instructionSet":15,"./level1Compiler/registry":16,"./level1Compiler/symbolTable":17,"underscore":58}],14:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var CodeWriter = function () {
  var self = this;
  var metadata = {};
  var variables = {};
  var clauses = "";
  var maxLiteral = 0;
  var numberOfClauses = 0;

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, literal) {
    variables[symbol] = literal;
  };

  self.clause = function () {
    var clause = [];

    _.each(arguments, function (literal) {
      clause.push(literal);

      var positiveLiteral = Math.abs(literal);

      if (positiveLiteral > maxLiteral) {
        maxLiteral = positiveLiteral;
      }
    });

    clauses += clause.join(" ") + " 0\n";
    numberOfClauses += 1;
  };

  self.write = function () {
    var output = "";

    output += writeHeader();
    output += writeMetadata();
    output += writeProblemSize();
    output += clauses;

    return output;
  };

  var writeHeader = function () {
    return "c Sentient Machine Code, Version 1.0\n";
  };

  var writeMetadata = function () {
    metadata.level1Variables = variables;

    var json = JSON.stringify(metadata, null, 2);
    var lines = json.split("\n");

    var output = "";
    _.each(lines, function (line) {
      output += "c " + line + "\n";
    });

    return output;
  };

  var writeProblemSize = function () {
    return "p cnf " + maxLiteral + " " + numberOfClauses + "\n";
  };
};

module.exports = CodeWriter;

},{"underscore":58}],15:[function(require,module,exports){
"use strict";

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "push":
        self.push(instruction.symbol);
        break;
      case "pop":
        self.pop(instruction.symbol);
        break;
      case "not":
        self.not();
        break;
      case "and":
        self.and();
        break;
      case "or":
        self.or();
        break;
      case "equal":
        self.equal();
        break;
      case "true":
        self._true();
        break;
      case "false":
        self._false();
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      case "duplicate":
        self.duplicate();
        break;
      case "swap":
        self.swap();
        break;
      case "if":
        self._if();
        break;
      case "invariant":
        self.invariant();
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self.push = function (symbol) {
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(literal, -literal);
    }
  };

  self.pop = function (symbol) {
    var stackSymbol = stack.pop();
    var stackLiteral = symbolTable.get(stackSymbol);

    symbolTable.set(symbol, stackLiteral);
  };

  self.not = function () {
    var stackSymbol = stack.pop();
    var stackLiteral = symbolTable.get(stackSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(stackLiteral, literal);
    codeWriter.clause(-stackLiteral, -literal);
  };

  self.and = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(-leftLiteral, -rightLiteral, literal);
    codeWriter.clause(leftLiteral, -literal);
    codeWriter.clause(rightLiteral, -literal);
  };

  self.or = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(leftLiteral, rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, literal);
    codeWriter.clause(-rightLiteral, literal);
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(leftLiteral, rightLiteral, literal);
    codeWriter.clause(leftLiteral, -rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, -rightLiteral, literal);
  };

  self._true = function () {
    var symbol = registry.trueSymbol();
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(literal);
    }
  };

  self._false = function () {
    var symbol = registry.falseSymbol();
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(-literal);
    }
  };

  self.variable = function (symbol) {
    var literal = symbolTable.get(symbol);
    codeWriter.variable(symbol, literal);
  };

  self.duplicate = function () {
    var symbol = stack.pop();

    stack.push(symbol);
    stack.push(symbol);
  };

  self.swap = function () {
    var topSymbol = stack.pop();
    var bottomSymbol = stack.pop();

    stack.push(topSymbol);
    stack.push(bottomSymbol);
  };

  self._if = function () {
    var alternateSymbol = stack.pop();
    var consequentSymbol = stack.pop();
    var conditionSymbol = stack.pop();

    // condition && consequent
    stack.push(conditionSymbol);
    stack.push(consequentSymbol);
    self.and();

    // !condition && alternate
    stack.push(conditionSymbol);
    self.not();
    stack.push(alternateSymbol);
    self.and();

    self.or();
  };

  self.invariant = function () {
    var stackSymbol = stack.pop();
    var stackLiteral = symbolTable.get(stackSymbol);

    codeWriter.clause(stackLiteral);
  };
};

module.exports = InstructionSet;

},{}],16:[function(require,module,exports){
"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L1_";
  var suffix = "_$$$";

  var literalNumber = 0;
  var symbolNumber = 0;

  self.nextLiteral = function () {
    literalNumber += 1;
    return literalNumber;
  };

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.trueSymbol = function () {
    return prefix + "TRUE" + suffix;
  };

  self.falseSymbol = function () {
    return prefix + "FALSE" + suffix;
  };
};

module.exports = Registry;

},{}],17:[function(require,module,exports){
"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};

  self.set = function (symbol, literal) {
    object[symbol] = literal;
  };

  self.get = function (symbol) {
    var literal = object[symbol];

    if (typeof literal === "undefined") {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }

    return literal;
  };

  self.contains = function (symbol) {
    var literal = object[symbol];
    return typeof literal !== "undefined";
  };
};

module.exports = SymbolTable;

},{}],18:[function(require,module,exports){
"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./common/symbolTable");
var Registry = require("./level2Compiler/registry");
var CodeWriter = require("./level2Compiler/codeWriter");
var InstructionSet = require("./level2Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var stack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var codeWriter = new CodeWriter();

  var instructionSet = new InstructionSet({
    stack: stack,
    symbolTable: symbolTable,
    registry: registry,
    codeWriter: codeWriter
  });

  self.compile = function () {
    if (input.metadata) {
      codeWriter.metadata(input.metadata);
    }

    _.each(input.instructions, function (instruction) {
      instructionSet.call(instruction);
    });

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;

},{"./common/stack":11,"./common/symbolTable":12,"./level2Compiler/codeWriter":19,"./level2Compiler/instructionSet":20,"./level2Compiler/registry":21,"underscore":58}],19:[function(require,module,exports){
"use strict";

var CodeWriter = function () {
  var self = this;
  var instructions = [];
  var metadata = {};
  var variables = {};

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, type, symbols) {
    variables[symbol] = { type: type, symbols: symbols };
  };

  self.write = function () {
    var output = {};

    output.instructions = instructions;
    output.metadata = metadata;
    output.metadata.level2Variables = variables;

    return output;
  };
};

module.exports = CodeWriter;

},{}],20:[function(require,module,exports){
"use strict";

var TwosComplement = require("./twosComplement");
var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "boolean":
        self._boolean(instruction.symbol);
        break;
      case "integer":
        self._integer(instruction.symbol, instruction.width);
        break;
      case "push":
        self.push(instruction.symbol);
        break;
      case "pop":
        self.pop(instruction.symbol);
        break;
      case "constant":
        self.constant(instruction.value);
        break;
      case "and":
        self.and();
        break;
      case "or":
        self.or();
        break;
      case "not":
        self.not();
        break;
      case "equal":
        self.equal();
        break;
      case "add":
        self.add();
        break;
      case "negate":
        self.negate();
        break;
      case "absolute":
        self.absolute();
        break;
      case "subtract":
        self.subtract();
        break;
      case "lessthan":
        self.lessthan();
        break;
      case "greaterthan":
        self.greaterthan();
        break;
      case "lessequal":
        self.lessequal();
        break;
      case "greaterequal":
        self.greaterequal();
        break;
      case "multiply":
        self.multiply();
        break;
      case "divmod":
        self.divmod();
        break;
      case "divide":
        self.divide();
        break;
      case "modulo":
        self.modulo();
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      case "duplicate":
        self.duplicate();
        break;
      case "swap":
        self.swap();
        break;
      case "if":
        self._if();
        break;
      case "invariant":
        self.invariant();
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self._boolean = function (symbol) {
    declare(symbol, "boolean", registry.nextBoolean());
  };

  self._integer = function (symbol, width) {
    if (!width) {
      throw new Error("No width provided when declaring integer");
    }

    declare(symbol, "integer", registry.nextInteger(width));
  };

  self.push = function (symbol) {
    if (!symbolTable.contains(symbol)) {
      var message = "'" + symbol + "' must be declared before it can be used";
      throw new Error(message);
    }

    stack.push(symbol);
  };

  self.pop = function (symbol) {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    if (symbolTable.contains(symbol)) {
      var declaredType = symbolTable.type(symbol);

      if (stackType !== declaredType) {
        var message = "unable to assign " + stackType + " to ";
        message += declaredType + " '" + symbol + "'";
        throw new Error(message);
      }
    }

    symbolTable.set(symbol, stackType, stackSymbols);
  };

  self.constant = function (value) {
    var symbol = registry.nextSymbol();
    var type = typeName(value);
    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
      codeWriter.instruction({ type: value.toString() });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else if (type === "integer") {
      var bitArray = TwosComplement.encode(value);
      symbols = registry.nextInteger(bitArray.length);

      _.each(bitArray, function (bit, index) {
        codeWriter.instruction({ type: bit.toString() });
        codeWriter.instruction({ type: "pop", symbol: symbols[index] });
      });
    }

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);
  };

  self.and = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for and: " + leftType + " && " + rightType;
      throw new Error(msg);
    }
  };

  self.or = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "or" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for or: " + leftType + " || " + rightType;
      throw new Error(msg);
    }
  };

  self.not = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (stackType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for not: " + stackType);
    }
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "equal" });
    } else if (rightType === "integer" && leftType === "integer") {
      var padded = TwosComplement.pad(leftSymbols, rightSymbols);

      _.each(padded.rightSymbols, function (r, index) {
        var l = padded.leftSymbols[index];

        codeWriter.instruction({ type: "push", symbol: l });
        codeWriter.instruction({ type: "push", symbol: r });
        codeWriter.instruction({ type: "equal" });
      });

      for (var i = 0; i < padded.rightSymbols.length - 1; i += 1) {
        codeWriter.instruction({ type: "and" });
      }
    } else {
      var msg = "Type mismatch for equals: " + leftType + " == " + rightType;
      throw new Error(msg);
    }

    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.add = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== "integer" || leftType !== "integer") {
      throw new Error("Cannot add a " + rightType + " to a " + leftType);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var padded = TwosComplement.pad(leftSymbols, rightSymbols);
    var width = padded.leftSymbols.length + 1;

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger(width);

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    var carryIn = registry.nextBoolean();
    codeWriter.instruction({ type: "false" });
    codeWriter.instruction({ type: "pop", symbol: carryIn[0] });

    for (var i = width - 2; i >= 0; i -= 1) {
      var r = padded.rightSymbols[i];
      var l = padded.leftSymbols[i];

      // l xor r
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });

      codeWriter.instruction({ type: "duplicate" });

      // sum = (l xor r) xor c_in
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i + 1] });

      // c_in = (l and r) or (c_in and (l xor r))
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "or" });

      carryIn = registry.nextBoolean();
      codeWriter.instruction({ type: "pop", symbol: carryIn[0] });
    }

    // l == r
    codeWriter.instruction({ type: "push", symbol: padded.leftSymbols[0] });
    codeWriter.instruction({ type: "push", symbol: padded.rightSymbols[0] });
    codeWriter.instruction({ type: "equal" });

    codeWriter.instruction({ type: "duplicate" });

    // (l == r) && c_in
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "and" });

    codeWriter.instruction({ type: "swap" });

    // (l != r) && !c_in
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "and" });

    // sign = ((l == r) and c_in) or (l != r) and !c_in)
    codeWriter.instruction({ type: "or" });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.negate = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger(stackSymbols.length);

    symbolTable.set(symbol, "integer", symbols);

    if (stackType !== "integer") {
      throw new Error("Wrong type for negate: " + stackType);
    }

    for (var i = 0; i < stackSymbols.length; i += 1) {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[i] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i] });
    }

    self.push(symbol);
    self.constant(1);
    self.add();
  };

  self.absolute = function () {
    self.duplicate();
    self.constant(0);
    self.greaterequal();
    self.swap();
    self.duplicate();
    self.negate();
    self._if();
  };

  self.subtract = function () {
    self.negate();
    self.add();
  };

  self.lessthan = function () {
    self.subtract();

    var stackSymbol = stack.pop();
    var stackSymbols = symbolTable.symbols(stackSymbol);
    var signSymbol = stackSymbols[0];

    var symbol = registry.nextSymbol();
    stack.push(symbol);
    symbolTable.set(symbol, "boolean", [signSymbol]);
  };

  self.greaterthan = function () {
    self.swap();
    self.lessthan();
  };

  self.lessequal = function () {
    self.greaterthan();
    self.not();
  };

  self.greaterequal = function () {
    self.lessthan();
    self.not();
  };

  self.multiply = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== "integer" || leftType !== "integer") {
      throw new Error("Cannot multiply a " + rightType + " by a " + leftType);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var width = rightSymbols.length + leftSymbols.length;
    var padded = TwosComplement.pad(leftSymbols, rightSymbols, width);

    rightSymbols = padded.rightSymbols;
    leftSymbols = padded.leftSymbols;

    var zero = registry.nextBoolean()[0];
    codeWriter.instruction({ type: "false" });
    codeWriter.instruction({ type: "pop", symbol: zero });

    for (var r = width - 1; r >= 0; r -= 1) {
      var partialSymbol = registry.nextSymbol();
      var partialSymbols = registry.nextInteger(width);

      for (var l = width - r - 1; l < width; l += 1) {
        var index = l + r + 1 - width;

        codeWriter.instruction({ type: "push", symbol: rightSymbols[r] });
        codeWriter.instruction({ type: "push", symbol: leftSymbols[l] });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: partialSymbols[index] });
      }

      for (var i = r + 1; i < width; i += 1) {
        partialSymbols[i] = zero;
      }

      symbolTable.set(partialSymbol, "integer", partialSymbols);
      stack.push(partialSymbol);

      if (r < width - 1) {
        self.add();

        var sumSymbol = stack.pop();
        var sumSymbols = symbolTable.symbols(sumSymbol);

        var tailSymbol = registry.nextSymbol();
        var tailSymbols = sumSymbols.slice(1);

        symbolTable.set(tailSymbol, "integer", tailSymbols);
        stack.push(tailSymbol);
      }
    }
  };

  self.divmod = function () {
    var divisorSymbol = stack.pop();
    var dividendSymbol = stack.pop();

    var divisorType = symbolTable.type(divisorSymbol);
    var dividendType = symbolTable.type(dividendSymbol);

    if (divisorType !== "integer" || dividendType !== "integer") {
      var msg = "Cannot divide a " + dividendType + " by a " + divisorType;
      throw new Error(msg);
    }

    var width = symbolTable.symbols(dividendSymbol).length;

    var quotientSymbol = registry.nextSymbol();
    var remainderSymbol = registry.nextSymbol();

    var quotientSymbols = registry.nextInteger(width);
    var remainderSymbols = registry.nextInteger(width);

    symbolTable.set(quotientSymbol, "integer", quotientSymbols);
    symbolTable.set(remainderSymbol, "integer", remainderSymbols);

    // dividend = divisor * quotient + remainder
    self.push(divisorSymbol);
    self.push(quotientSymbol);
    self.multiply();
    self.push(remainderSymbol);
    self.add();
    self.push(dividendSymbol);
    self.equal();
    self.invariant();

    // remainder >= 0
    self.push(remainderSymbol);
    self.constant(0);
    self.greaterequal();
    self.invariant();

    // remainder < |divisor|
    self.push(remainderSymbol);
    self.push(divisorSymbol);
    self.absolute();
    self.lessthan();
    self.invariant();

    self.push(remainderSymbol);
    self.push(quotientSymbol);
  };

  self.divide = function () {
    self.divmod();
    self.swap();
    stack.pop();
  };

  self.modulo = function () {
    self.divmod();
    stack.pop();
  };

  self.variable = function (symbol) {
    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    _.each(symbols, function (s) {
      codeWriter.instruction({ type: "variable", symbol: s });
    });

    codeWriter.variable(symbol, type, symbols);
  };

  self.duplicate = function () {
    var symbol = stack.pop();

    stack.push(symbol);
    stack.push(symbol);
  };

  self.swap = function () {
    var topSymbol = stack.pop();
    var bottomSymbol = stack.pop();

    stack.push(topSymbol);
    stack.push(bottomSymbol);
  };

  self._if = function () {
    var alternateSymbol = stack.pop();
    var consequentSymbol = stack.pop();
    var conditionSymbol = stack.pop();

    var alternateType = symbolTable.type(alternateSymbol);
    var consequentType = symbolTable.type(consequentSymbol);
    var conditionType = symbolTable.type(conditionSymbol);

    var msg;
    if (conditionType !== "boolean") {
      msg = "The condition type must be a boolean but is " + conditionType;
      throw new Error(msg);
    }

    if (consequentType !== alternateType) {
      msg = "The consequent and alternate types must match: ";
      msg += consequentType + " !== " + alternateType;
      throw new Error(msg);
    }
    var type = consequentType;

    var alternateSymbols = symbolTable.symbols(alternateSymbol);
    var consequentSymbols = symbolTable.symbols(consequentSymbol);
    var conditionSymbols = symbolTable.symbols(conditionSymbol);

    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
    } else if (type === "integer") {
      var padded = TwosComplement.pad(consequentSymbols, alternateSymbols);
      var width = padded.leftSymbols.length;

      consequentSymbols = padded.leftSymbols;
      alternateSymbols = padded.rightSymbols;

      symbols = registry.nextInteger(width);
    }

    var symbol = registry.nextSymbol();

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);

    for (var i = 0; i < symbols.length; i += 1) {
      codeWriter.instruction({ type: "push", symbol: conditionSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: consequentSymbols[i] });
      codeWriter.instruction({ type: "push", symbol: alternateSymbols[i] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i] });
    }
  };

  self.invariant = function () {
    var stackSymbol = stack.pop();

    var type = symbolTable.type(stackSymbol);
    var symbols = symbolTable.symbols(stackSymbol);

    if (type !== "boolean") {
      throw new Error("Wrong type for invariant: " + type);
    }

    codeWriter.instruction({ type: "push", symbol: symbols[0] });
    codeWriter.instruction({ type: "invariant" });
  };

  var declare = function (symbol, type, symbols) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      _.each(symbols, function (s) {
        codeWriter.instruction({ type: "push", symbol: s });
      });

      var clone = symbols.slice(0);
      clone.reverse();

      _.each(clone, function (s) {
        codeWriter.instruction({ type: "pop", symbol: s });
      });

      symbolTable.set(symbol, type, symbols);
    }
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else {
      throw new Error("Constants of type '" + t + "' are not supported");
    }
  };
};

module.exports = InstructionSet;

},{"./twosComplement":22,"underscore":58}],21:[function(require,module,exports){
"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L2_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var booleanNumber = 0;
  var integerNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextBoolean = function () {
    booleanNumber += 1;
    return [prefix + "BOOLEAN" + booleanNumber + suffix];
  };

  self.nextInteger = function (width) {
    if (!width) {
      throw new Error("No width specified");
    }

    integerNumber += 1;

    var symbols = [];
    for (var i = 0; i < width; i += 1) {
      symbols.push(prefix + "INTEGER" + integerNumber + "_BIT" + i + suffix);
    }
    return symbols;
  };
};

module.exports = Registry;

},{}],22:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var TwosComplement = {};

TwosComplement.encode = function (n) {
  var binary, array;

  if (n < 0) {
    binary = Number(Math.abs(n + 1)).toString(2);

    array = _.map(binary, function (bit) {
      return bit === "0";
    });

    if (array[0] !== true) {
      array.unshift(true);
    }
  } else {
    binary = Number(n).toString(2);

    array = _.map(binary, function (bit) {
      return bit === "1";
    });

    if (array[0] !== false) {
      array.unshift(false);
    }
  }

  return array;
};

TwosComplement.decode = function (array) {
  var total = 0;

  _.each(array, function (bit, index) {
    if (bit) {
      total += Math.pow(2, array.length - index - 1);
    }

    if (index === 0) {
      total = -total;
    }
  });

  if (total === -0) {
    total = 0;
  }

  return total;
};

TwosComplement.pad = function (leftSymbols, rightSymbols, width) {
  if (!width) {
    width = Math.max(leftSymbols.length, rightSymbols.length);
  }

  var left = leftSymbols.slice(0);
  var right = rightSymbols.slice(0);

  for (var i = 0; i < width - rightSymbols.length; i += 1) {
    right.unshift(right[0]);
  }

  for (i = 0; i < width - leftSymbols.length; i += 1) {
    left.unshift(left[0]);
  }

  return { leftSymbols: left, rightSymbols: right };
};

module.exports = TwosComplement;

},{"underscore":58}],23:[function(require,module,exports){
"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./level3Compiler/symbolTable");
var Registry = require("./level3Compiler/registry");
var FunctionRegistry = require("./level3Compiler/functionRegistry");
var CodeWriter = require("./level3Compiler/codeWriter");
var CallStack = require("./level3Compiler/callStack");
var InstructionSet = require("./level3Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var stack = new Stack();
  var typedefStack = new Stack();
  var functionStack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var functionRegistry = new FunctionRegistry(registry);
  var codeWriter = new CodeWriter();
  var callStack = new CallStack();

  var instructionSet = new InstructionSet({
    stack: stack,
    typedefStack: typedefStack,
    functionStack: functionStack,
    symbolTable: symbolTable,
    registry: registry,
    functionRegistry: functionRegistry,
    codeWriter: codeWriter,
    callStack: callStack
  });

  self.compile = function () {
    if (input.metadata) {
      codeWriter.metadata(input.metadata);
    }

    _.each(input.instructions, function (instruction) {
      instructionSet.call(instruction);
    });

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;

},{"./common/stack":11,"./level3Compiler/callStack":24,"./level3Compiler/codeWriter":25,"./level3Compiler/functionRegistry":27,"./level3Compiler/instructionSet":29,"./level3Compiler/registry":30,"./level3Compiler/symbolTable":31,"underscore":58}],24:[function(require,module,exports){
"use strict";

var CallStack = function (array) {
  var self = this;
  array = array || [];

  self.add = function (functionId, functionName) {
    throwIfStackIsTooDeep();

    var element = { id: functionId, name: functionName };
    var copy = array.slice(0);

    copy.push(element);

    return new CallStack(copy);
  };

  self.toString = function () {
    var strings = [];

    for (var i = array.length - 1; i >= array.length - 20 && i >= 0; i -= 1) {
      var element = array[i];
      var string = " " + elementToString(element) + " ";

      strings.push(string);
    }

    if (array.length > 20) {
      strings.push(" ... (truncated) ");
    }

    padStrings(strings);

    var horizontalRule = Array(strings[0].length + 3).join("-");

    return "|" + strings.join("|\n|") + "|\n" + horizontalRule;
  };

  var throwIfStackIsTooDeep = function () {
    if (array.length === 1000) {
      var message = "Stack level too deep (> 1000). This is probably the";
      message += " result of a recursive function call:\n\n" + self.toString();

      throw new Error(message);
    }
  };

  var elementToString = function (element) {
    return element.name + " (id=" + element.id + ")";
  };

  var padStrings = function (strings) {
    var maxLength, i, string;

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];

      if (typeof maxLength === "undefined" || string.length > maxLength) {
        maxLength = string.length;
      }
    }

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];
      var remainingLength = maxLength - string.length;

      strings[i] += Array(remainingLength + 1).join(" ");
    }
  };
};

module.exports = CallStack;

},{}],25:[function(require,module,exports){
"use strict";

var CodeWriter = function () {
  var self = this;
  var instructions = [];
  var metadata = {};
  var variables = {};

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, type, symbols, supporting, nilDecider) {
    var existing = variables[symbol];

    if (existing && !existing.supporting) {
      supporting = false;
    }

    variables[symbol] = { type: type, symbols: symbols };

    if (supporting) {
      variables[symbol].supporting = true;
    }

    if (nilDecider) {
      variables[symbol].nilDecider = nilDecider;
    }
  };

  self.write = function () {
    var output = {};

    output.instructions = instructions;
    output.metadata = metadata;
    output.metadata.level3Variables = variables;

    return output;
  };
};

module.exports = CodeWriter;

},{}],26:[function(require,module,exports){
"use strict";

var DynamicScope = function (contextTable, localTable) {
  var self = this;
  self.reassignedArrays = [];
  var cache = {};

  self.set = function (symbol, type, symbols, forceLocal) {
    updateReassignedArrays(symbol, type, forceLocal);
    delete cache[symbol];
    return target(symbol, forceLocal).set(symbol, type, symbols);
  };

  self.type = function (symbol) {
    return target(symbol).type(symbol);
  };

  self.symbols = function (symbol) {
    return target(symbol).symbols(symbol);
  };

  self.contains = function (symbol) {
    return target(symbol).contains(symbol);
  };

  self.setNilConditions = function (symbol, conditions) {
    return target(symbol).setNilConditions(symbol, conditions);
  };

  self.getNilConditions = function (symbol) {
    return target(symbol).getNilConditions(symbol);
  };

  var target = function (symbol, forceLocal) {
    if (typeof cache[symbol] === "undefined") {
      if (forceLocal || localTable.contains(symbol)) {
        cache[symbol] = localTable;
      } else if (contextTable.contains(symbol)) {
        cache[symbol] = contextTable;
      } else {
        cache[symbol] = localTable;
      }
    }

    return cache[symbol];
  };

  var updateReassignedArrays = function (symbol, type, forceLocal) {
    var symbolTable = target(symbol, forceLocal);

    if (symbolTable !== contextTable) {
      return;
    }

    if (self.reassignedArrays.indexOf(symbol) !== -1) {
      return;
    }

    self.reassignedArrays.push(symbol);
  };
};

module.exports = DynamicScope;

},{}],27:[function(require,module,exports){
"use strict";

var FunctionRegistry = function (registry) {
  var self = this;
  var functions = {};

  /* jshint maxparams: 7 */
  self.register = function (name, args, body, dynamic, immutable, returns) {
    throwIfImmutable(name);

    functions[name] = {
      name: name,
      args: args,
      body: body,
      dynamic: dynamic,
      immutable: immutable,
      returns: returns,
      id: registry.nextFunction()
    };
  };

  self.get = function (name) {
    var fn = functions[name];

    if (typeof fn === "undefined") {
      throw new Error("Function '" + name + "' is not defined");
    }

    return fn;
  };

  self.contains = function (name) {
    return typeof functions[name] !== "undefined";
  };

  var throwIfImmutable = function (name) {
    var existingFunction = functions[name];

    if (existingFunction && existingFunction.immutable) {
      throw new Error("Unable to redefine immutable function '" + name + "'");
    }
  };
};

module.exports = FunctionRegistry;

},{}],28:[function(require,module,exports){
"use strict";

var FunctionScope = function (contextRegistry, localRegistry) {
  var self = this;
  var cache = {};

  /* jshint maxparams: 7 */
  self.register = function (name, args, body, dynamic, immutable, returns) {
    throwIfImmutable(name);
    delete cache[name];

    return localRegistry.register(
      name, args, body, dynamic, immutable, returns
    );
  };

  self.get = function (name) {
    return target(name).get(name);
  };

  self.contains = function (name) {
    return target(name).contains(name);
  };

  var target = function (name) {
    if (typeof cache[name] === "undefined") {
      if (localRegistry.contains(name)) {
        cache[name] = localRegistry;
      } else if (contextRegistry.contains(name)) {
        cache[name] = contextRegistry;
      } else {
        cache[name] = localRegistry;
      }
    }

    return cache[name];
  };

  var throwIfImmutable = function (name) {
    if (!self.contains(name)) {
      return;
    }

    var fn = self.get(name);

    if (fn.immutable) {
      throw new Error("Unable to shadow immutable function '" + name + "'");
    }
  };
};

module.exports = FunctionScope;

},{}],29:[function(require,module,exports){
/*jshint -W083 */

"use strict";

var _ = require("underscore");
var Stack = require("../common/stack");
var SymbolTable = require("../level3Compiler/symbolTable");
var DynamicScope = require("./dynamicScope");
var FunctionRegistry = require("./functionRegistry");
var FunctionScope = require("./functionScope");

var InstructionSet = function (params) {
  var self = this;
  var recording;

  var stack = params.stack;
  var typedefStack = params.typedefStack;
  var functionStack = params.functionStack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var functionRegistry = params.functionRegistry;
  var codeWriter = params.codeWriter;
  var callStack = params.callStack;

  self.stack = stack;
  self.typedefStack = typedefStack;
  self.functionStack = functionStack;
  self.symbolTable = symbolTable;
  self.registry = registry;
  self.functionRegistry = functionRegistry;
  self.codeWriter = codeWriter;
  self.callStack = callStack;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    if (record(instruction)) {
      return;
    }

    switch (instruction.type) {
      case "typedef":
        self.typedef(instruction.name, instruction.width);
        break;
      case "array":
        self.array(instruction.symbol, instruction.width);
        break;
      case "collect":
        self.collect(instruction.width);
        break;
      case "get":
        self.get(instruction.checkBounds);
        break;
      case "getIndex":
        self.getIndex(instruction.index, instruction.checkBounds);
        break;
      case "fetch":
        self.fetch(instruction.hasDefault);
        break;
      case "fetchIndex":
        self.fetchIndex(instruction.index, instruction.hasDefault);
        break;
      case "width":
        self.width();
        break;
      case "bounds":
        self.bounds();
        break;
      case "push":
        self.push(instruction.symbol);
        break;
      case "pop":
        self.pop(instruction.symbol);
        break;
      case "not":
        self.not();
        break;
      case "and":
        self.and();
        break;
      case "or":
        self.or();
        break;
      case "equal":
        self.equal();
        break;
      case "constant":
        self.constant(instruction.value);
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      case "boolean":
        self._boolean(instruction.symbol);
        break;
      case "integer":
        self._integer(instruction.symbol, instruction.width);
        break;
      case "add":
        self.add();
        break;
      case "subtract":
        self.subtract();
        break;
      case "multiply":
        self.multiply();
        break;
      case "divmod":
        self.divmod();
        break;
      case "divide":
        self.divide();
        break;
      case "modulo":
        self.modulo();
        break;
      case "negate":
        self.negate();
        break;
      case "lessthan":
        self.lessthan();
        break;
      case "greaterthan":
        self.greaterthan();
        break;
      case "lessequal":
        self.lessequal();
        break;
      case "greaterequal":
        self.greaterequal();
        break;
      case "duplicate":
        self.duplicate();
        break;
      case "swap":
        self.swap();
        break;
      case "if":
        self._if();
        break;
      case "absolute":
        self.absolute();
        break;
      case "invariant":
        self.invariant();
        break;
      case "define":
        self.define(
          instruction.name,
          instruction.args,
          instruction.dynamic,
          instruction.immutable
        );
        break;
      case "return":
        self._return(instruction.width);
        break;
      case "call":
        self._call(instruction.name, instruction.width);
        break;
      case "pointer":
        self.pointer(instruction.name);
        break;
      case "each":
        self.each(instruction.symbol, instruction.name);
        break;
      case "eachPair":
        self.eachPair(instruction.symbol, instruction.name);
        break;
      case "transpose":
        self.transpose();
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self._boolean = function (symbol) {
    declare(symbol, "boolean", registry.nextBoolean());
  };

  self._integer = function (symbol, width) {
    if (!width) {
      throw new Error("No width provided when defining integer type");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

    declare(symbol, "integer", registry.nextInteger(), width);
  };

  self.array = function (symbol, width, typedef) {
    if (!width) {
      throw new Error("No width provided when defining array type");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

    declare(symbol, "array", registry.nextArray(width), undefined, typedef);
  };

  self.push = function (symbol) {
    if (!symbolTable.contains(symbol)) {
      var message = "'" + symbol + "' must be declared before it can be used";
      throw new Error(message);
    }

    stack.push(symbol);
  };

  self.pop = function (symbol) {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);
    var message;

    if (symbolTable.contains(symbol)) {
      var declaredType = symbolTable.type(symbol);

      if (stackType !== declaredType) {
        message = "Unable to re-assign '" + symbol + "' to a "+ stackType;
        message += " because it was previously a " + declaredType;

        throw new Error(message);
      }

      if (stackType === "array") {
        var previousHierarchy = recursivelyExpandTypes(symbol);
        var newHierarchy = recursivelyExpandTypes(stackSymbol);

        previousHierarchy = JSON.stringify(previousHierarchy);
        newHierarchy = JSON.stringify(newHierarchy);

        if (previousHierarchy !== newHierarchy) {
          message = "Unable to re-assign '" + symbol + "' because its";
          message += " type hierarchy has changed from " + previousHierarchy;
          message += " to " + newHierarchy;

          throw new Error(message);
        }
      }
    }

    symbolTable.set(symbol, stackType, stackSymbols);

    var conditions = symbolTable.getNilConditions(stackSymbol);
    symbolTable.setNilConditions(symbol, conditions);
  };

  self.and = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for and: " + leftType + " && " + rightType;
      throw new Error(msg);
    }
  };

  self.or = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "or" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for or: " + leftType + " || " + rightType;
      throw new Error(msg);
    }
  };

  self.not = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (stackType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for not: " + stackType);
    }
  };

  self.add = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "add" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for add: " + leftType + " + " + rightType;
      throw new Error(msg);
    }
  };

  self.subtract = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "subtract" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for subtract: " + leftType + " - " + rightType;
      throw new Error(msg);
    }
  };

  self.multiply = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "multiply" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for multiply: " + leftType + " * " + rightType;
      throw new Error(msg);
    }
  };

  self.divide = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "divide" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for divide: " + leftType + " / " + rightType;
      throw new Error(msg);
    }
  };

  self.modulo = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "modulo" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for modulo: " + leftType + " % " + rightType;
      throw new Error(msg);
    }
  };

  self.divmod = function () {
    var divisorSymbol = stack.pop();
    var dividendSymbol = stack.pop();

    var divisorType = symbolTable.type(divisorSymbol);
    var dividendType = symbolTable.type(dividendSymbol);

    var divisorSymbols = symbolTable.symbols(divisorSymbol);
    var dividendSymbols = symbolTable.symbols(dividendSymbol);

    var quotientSymbol = registry.nextSymbol();
    var remainderSymbol = registry.nextSymbol();

    var quotientSymbols = registry.nextInteger();
    var remainderSymbols = registry.nextInteger();

    stack.push(remainderSymbol);
    stack.push(quotientSymbol);

    symbolTable.set(quotientSymbol, "integer", quotientSymbols);
    symbolTable.set(remainderSymbol, "integer", remainderSymbols);

    if (divisorType === "integer" && dividendType === "integer") {
      codeWriter.instruction({ type: "push", symbol: dividendSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: divisorSymbols[0] });
      codeWriter.instruction({ type: "divmod" });
      codeWriter.instruction({ type: "pop", symbol: quotientSymbols[0] });
      codeWriter.instruction({ type: "pop", symbol: remainderSymbols[0] });
    } else {
      var msg = "Cannot divide a " + dividendType + " by a " + divisorType;
      throw new Error(msg);
    }
  };

  self.negate = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (stackType === "integer") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "negate" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for negate: " + stackType);
    }
  };

  self.absolute = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (stackType === "integer") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "absolute" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for absolute: " + stackType);
    }
  };

  self.lessthan = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "lessthan" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for lessthan: " + leftType + " < " + rightType;
      throw new Error(msg);
    }
  };

  self.greaterthan = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "greaterthan" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for greaterthan: ";
      msg += leftType + " > " + rightType;

      throw new Error(msg);
    }
  };

  self.lessequal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "lessequal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for lessequal: " + leftType + " <= " + rightType;
      throw new Error(msg);
    }
  };

  self.greaterequal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "greaterequal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for greaterequal: ";
      msg += leftType + " >= " + rightType;

      throw new Error(msg);
    }
  };

  self.duplicate = function () {
    var symbol = stack.pop();

    stack.push(symbol);
    stack.push(symbol);
  };

  self.swap = function () {
    var topSymbol = stack.pop();
    var bottomSymbol = stack.pop();

    stack.push(topSymbol);
    stack.push(bottomSymbol);
  };

  self._if = function () {
    var alternateSymbol = stack.pop();
    var consequentSymbol = stack.pop();
    var conditionSymbol = stack.pop();

    var alternateType = symbolTable.type(alternateSymbol);
    var consequentType = symbolTable.type(consequentSymbol);
    var conditionType = symbolTable.type(conditionSymbol);

    var msg;
    if (conditionType !== "boolean") {
      msg = "The condition type must be a boolean but is " + conditionType;
      throw new Error(msg);
    }

    if (consequentType !== alternateType) {
      msg = "The consequent and alternate types must match: ";
      msg += consequentType + " !== " + alternateType;
      throw new Error(msg);
    }
    var type = consequentType;

    var alternateSymbols = symbolTable.symbols(alternateSymbol);
    var consequentSymbols = symbolTable.symbols(consequentSymbol);
    var conditionSymbols = symbolTable.symbols(conditionSymbol);

    var symbol = registry.nextSymbol();
    var symbols;
    var conditionsToSet = [];

    if (type === "array") {
      var maxLength;

      if (conditionSymbols.length > alternateSymbols.length) {
        maxLength = conditionSymbols.length;
      } else {
        maxLength = alternateSymbols.length;
      }

      var firstElement = consequentSymbols[0];
      firstElement = firstElement || alternateSymbols[0];
      var firstElementType = symbolTable.type(firstElement);

      var fallbackSymbol = registry.nextSymbol();
      var fallbackSymbols;

      if (firstElementType === "boolean") {
        fallbackSymbols = registry.nextBoolean();

        codeWriter.instruction({ type: "constant", value: false });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else if (firstElementType === "integer") {
        fallbackSymbols = registry.nextInteger();

        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else {
        fallbackSymbols = [];
      }

      symbolTable.set(fallbackSymbol, firstElementType, fallbackSymbols);

      var conditionIsTrueSymbol = conditionSymbols[0];
      var conditionIsFalseSymbol = registry.nextBoolean()[0];

      codeWriter.instruction({ type: "push", symbol: conditionIsTrueSymbol });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: conditionIsFalseSymbol });

      symbols = [];

      for (var index = 0; index < maxLength; index += 1) {
        var c = consequentSymbols[index];
        var a = alternateSymbols[index];

        stack.push(conditionSymbol);

        if (c) {
          stack.push(c);
        } else {
          stack.push(fallbackSymbol);

          conditionsToSet.push({
            conditionSymbol: conditionIsTrueSymbol,
            nilIndex: index
          });
        }

        if (a) {
          stack.push(a);
        } else {
          stack.push(fallbackSymbol);

          conditionsToSet.push({
            conditionSymbol: conditionIsFalseSymbol,
            nilIndex: index
          });
        }

        self._if();

        symbols.push(stack.pop());
      }

      var consequentConditions = symbolTable.getNilConditions(consequentSymbol);
      _.each(consequentConditions, function (c) {
        var conditionSymbol = registry.nextBoolean()[0];

        codeWriter.instruction({ type: "push", symbol: conditionIsTrueSymbol });
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

        conditionsToSet.push({
          conditionSymbol: conditionSymbol,
          nilIndex: c.nilIndex
        });
      });

      var alternateConditions = symbolTable.getNilConditions(alternateSymbol);
      _.each(alternateConditions, function (c) {
        var conditionSymbol = registry.nextBoolean()[0];

        codeWriter.instruction({ type: "push", symbol: conditionIsFalseSymbol});
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

        conditionsToSet.push({
          conditionSymbol: conditionSymbol,
          nilIndex: c.nilIndex
        });
      });
    } else {
      if (type === "boolean") {
        symbols = registry.nextBoolean();
      } else if (type === "integer") {
        symbols = registry.nextInteger();
      }

      codeWriter.instruction({ type: "push", symbol: conditionSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: consequentSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: alternateSymbols[0] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    }

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);

    if (conditionsToSet.length > 0) {
      symbolTable.setNilConditions(symbol, conditionsToSet);
    }
  };

  self.invariant = function () {
    var stackSymbol = stack.pop();

    var type = symbolTable.type(stackSymbol);
    var symbols = symbolTable.symbols(stackSymbol);

    if (type !== "boolean") {
      throw new Error("Wrong type for invariant: " + type);
    }

    codeWriter.instruction({ type: "push", symbol: symbols[0] });
    codeWriter.instruction({ type: "invariant" });
  };

  self.variable = function (symbol, supporting, nilDecider) {
    supporting = supporting || false;

    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    if (type === "array") {
      _.each(symbols, function (s, index) {
        var outOfBoundsSymbol = checkBoundsForIndex(symbol, index);

        if (outOfBoundsSymbol) {
          self.variable(outOfBoundsSymbol, true);
        }

        self.variable(s, true, outOfBoundsSymbol);
      });
    } else {
      _.each(symbols, function (s) {
        codeWriter.instruction({ type: "variable", symbol: s });
      });
    }

    codeWriter.variable(symbol, type, symbols, supporting, nilDecider);
  };

  self.typedef = function (name, width) {
    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

    switch (name) {
      case "boolean":
        typedefStack.push({ type: name });
        break;
      case "integer":
        if (!width) {
          throw new Error("No width provided when defining integer type");
        }

        typedefStack.push({ type: name, width: width });
        break;
      case "array":
        if (!width) {
          throw new Error("No width provided when defining integer type");
        }

        var elements = typedefStack.pop();
        typedefStack.push({ type: name, width: width, elements: elements });
        break;
      default:
        throw new Error("Unrecognised type: '" + name + "'");
    }
  };

  self.collect = function (width) {
    if (!width) {
      throw new Error("No width provided when collecting elements");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

    var symbols = [];

    for (var i = 0; i < width; i += 1) {
      var symbol = stack.pop();
      symbols.unshift(symbol);
    }

    throwOnTypeMismatch(symbols);

    var arraySymbol = registry.nextSymbol();
    stack.push(arraySymbol);
    symbolTable.set(arraySymbol, "array", symbols);
  };

  self.get = function (checkBounds, keySymbol) {
    keySymbol = keySymbol || stack.pop();
    var arraySymbol = stack.pop();

    var keyType = symbolTable.type(keySymbol);
    var arrayType = symbolTable.type(arraySymbol);

    var keySymbols = symbolTable.symbols(keySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (keyType !== "integer") {
      throw new Error("Attempting to get with a non-integer key");
    }

    if (arrayType !== "array") {
      throw new Error("Attempting to get from a non-array");
    }

    var firstElement = arraySymbols[0];

    if (typeof firstElement === "undefined") {
      throw new Error("Attempting to get from an empty array");
    }

    var elementType = symbolTable.type(firstElement);
    var valueSymbol, valueSymbols, fallbackValue;
    var outOfBoundsSymbol, outOfBoundsSymbols, i;

    if (checkBounds || elementType === "array") {
      stack.push(arraySymbol);
      stack.push(keySymbol);

      self.bounds();
      self.not();

      outOfBoundsSymbol = stack.pop();
      outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);
    }

    if (checkBounds) {
      stack.push(outOfBoundsSymbol);
    }

    if (elementType === "array") {
      var nestedArrays = _.map(arraySymbols, function (symbol) {
        return symbolTable.symbols(symbol);
      });

      var maxWidth = _.max(nestedArrays, "length").length;

      firstElement = _.flatten(nestedArrays)[0];
      var firstElementType = symbolTable.type(firstElement);

      var fallbackSymbol = registry.nextSymbol();
      var fallbackSymbols;

      if (firstElementType === "boolean") {
        fallbackSymbols = registry.nextBoolean();

        codeWriter.instruction({ type: "constant", value: false });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else if (firstElementType === "integer") {
        fallbackSymbols = registry.nextInteger();

        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else {
        fallbackSymbols = [];
      }

      symbolTable.set(fallbackSymbol, firstElementType, fallbackSymbols);

      var conditionsToSet = [];

      for (i = 0; i < maxWidth; i += 1) {
        var transposedSymbol = registry.nextSymbol();
        var transposedSymbols = [];

        _.each(nestedArrays, function (nestedArray, arrayIndex) {
          var nestedSymbol = nestedArray[i];

          if (nestedSymbol) {
            transposedSymbols.push(nestedSymbol);
          } else {
            transposedSymbols.push(fallbackSymbol);

            var conditionSymbol = registry.nextBoolean()[0];

            codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
            codeWriter.instruction({ type: "constant", value: arrayIndex });
            codeWriter.instruction({ type: "equal" });
            codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

            conditionsToSet.push({
              conditionSymbol: conditionSymbol,
              nilIndex: i
            });
          }
        });

        stack.push(transposedSymbol);
        symbolTable.set(transposedSymbol, "array", transposedSymbols);

        self.get(false, keySymbol);
      }

      self.collect(maxWidth);

      valueSymbol = stack.pop();
      valueSymbols = symbolTable.symbols(valueSymbol);

      _.each(arraySymbols, function (arraySymbol, arrayIndex) {
        var existingConditions = symbolTable.getNilConditions(arraySymbol);
        existingConditions = existingConditions || [];

        _.each(existingConditions, function (c) {
          var conditionSymbol = c.conditionSymbol;

          codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
          codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
          codeWriter.instruction({ type: "constant", value: arrayIndex });
          codeWriter.instruction({ type: "equal" });
          codeWriter.instruction({ type: "and" });
          codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

          conditionsToSet.push({
            conditionSymbol: conditionSymbol,
            nilIndex: c.nilIndex
          });
        });
      });

      conditionsToSet.push({ conditionSymbol: outOfBoundsSymbols[0] });
      symbolTable.setNilConditions(valueSymbol, conditionsToSet);
    } else {
      valueSymbol = registry.nextSymbol();

      if (elementType === "boolean") {
        valueSymbols = registry.nextBoolean();
        fallbackValue = false;
      } else if (elementType === "integer") {
        valueSymbols = registry.nextInteger();
        fallbackValue = 0;
      }

      for (i = 0; i < arraySymbols.length; i += 1) {
        var elementSymbol = arraySymbols[i];
        var elementSymbols = symbolTable.symbols(elementSymbol);

        codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
        codeWriter.instruction({ type: "constant", value: i });
        codeWriter.instruction({ type: "equal" });
        codeWriter.instruction({ type: "push", symbol: elementSymbols[0] });
      }

      codeWriter.instruction({ type: "constant", value: fallbackValue });

      for (i = 0; i < arraySymbols.length; i += 1) {
        codeWriter.instruction({ type: "if" });
      }

      codeWriter.instruction({ type: "pop", symbol: valueSymbols[0] });
    }

    stack.push(valueSymbol);
    symbolTable.set(valueSymbol, elementType, valueSymbols);
  };

  self.getIndex = function (index, checkBounds) {
    var arraySymbol = stack.pop();
    var arrayType = symbolTable.type(arraySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (arrayType !== "array") {
      throw new Error("Attempting to getIndex from a non-array");
    }

    var firstElement = arraySymbols[0];

    if (typeof firstElement === "undefined") {
      throw new Error("Attempting to getIndex from an empty array");
    }

    var elementSymbol = arraySymbols[index];

    if (typeof elementSymbol === "undefined") {
      var message = "Index " + index + " is out of bounds for '";
      message += arraySymbol + "'";

      throw new Error(message);
    }

    if (checkBounds) {
      var outOfBoundsSymbol = checkBoundsForIndex(arraySymbol, index);

      if (outOfBoundsSymbol) {
        self.push(outOfBoundsSymbol);
      } else {
        self.constant(false);
      }
    }

    stack.push(elementSymbol);
  };

  self.fetch = function (hasDefault) {
    var defaultSymbol;

    if (hasDefault) {
      defaultSymbol = stack.pop();
    }

    self.get(true);
    self.swap();

    var outOfBoundsSymbol = stack.pop();
    var outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);

    codeWriter.instruction({ type: "push", symbol: outOfBoundsSymbols[0] });

    if (!hasDefault) {
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "invariant" });
    } else {
      var defaultSymbols =  symbolTable.symbols(defaultSymbol);
      var defaultType = symbolTable.type(defaultSymbol);

      var valueSymbol = stack.pop();
      var valueSymbols = symbolTable.symbols(valueSymbol);
      var valueType = symbolTable.type(valueSymbol);

      var message;

      if (valueType === "array") {
        message = "Default values are not supported when fetching";
        message += " from nested arrays";

        throw new Error(message);
      }

      if (defaultType !== valueType) {
        message = "Unable to set a default value with type '" + defaultType;
        message += "' for an array with elements of type '" + valueType + "'";

        throw new Error(message);
      }

      var outputSymbol = registry.nextSymbol();
      var outputSymbols;

      if (valueType === "integer") {
        outputSymbols = registry.nextInteger();
      } else if (valueType === "boolean") {
        outputSymbols = registry.nextBoolean();
      }

      codeWriter.instruction({ type: "push", symbol: defaultSymbols[0] });

      codeWriter.instruction({ type: "push", symbol: valueSymbols[0] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: outputSymbols[0] });

      symbolTable.set(outputSymbol, valueType, outputSymbols);
      stack.push(outputSymbol);
    }
  };

  self.fetchIndex = function (index, hasDefault) {
    var defaultSymbol;

    if (hasDefault) {
      defaultSymbol = stack.pop();
    }

    self.getIndex(index, true);
    self.swap();

    var outOfBoundsSymbol = stack.pop();
    var outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);

    codeWriter.instruction({ type: "push", symbol: outOfBoundsSymbols[0] });

    if (!hasDefault) {
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "invariant" });
    } else {
      var defaultSymbols =  symbolTable.symbols(defaultSymbol);
      var defaultType = symbolTable.type(defaultSymbol);

      var valueSymbol = stack.pop();
      var valueSymbols = symbolTable.symbols(valueSymbol);
      var valueType = symbolTable.type(valueSymbol);

      var message;

      if (valueType === "array") {
        message = "Default values are not supported when fetching";
        message += " from nested arrays";

        throw new Error(message);
      }

      if (defaultType !== valueType) {
        message = "Unable to set a default value with type '" + defaultType;
        message += "' for an array with elements of type '" + valueType + "'";

        throw new Error(message);
      }

      var outputSymbol = registry.nextSymbol();
      var outputSymbols;

      if (valueType === "integer") {
        outputSymbols = registry.nextInteger();
      } else if (valueType === "boolean") {
        outputSymbols = registry.nextBoolean();
      }

      codeWriter.instruction({ type: "push", symbol: defaultSymbols[0] });

      codeWriter.instruction({ type: "push", symbol: valueSymbols[0] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: outputSymbols[0] });

      symbolTable.set(outputSymbol, valueType, outputSymbols);
      stack.push(outputSymbol);
    }
  };

  self.width = function () {
    var arraySymbol = stack.pop();
    var arrayType = symbolTable.type(arraySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (arrayType !== "array") {
      throw new Error("Attempting to check bounds of a non-array");
    }

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    symbolTable.set(symbol, "integer", symbols);
    stack.push(symbol);

    var definiteWidth = 0;
    var uncertainWidth = 0;

    _.each(arraySymbols, function (symbol, index) {
      var outOfBoundsSymbol = checkBoundsForIndex(arraySymbol, index);

      if (outOfBoundsSymbol) {
        var outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);

        codeWriter.instruction({ type: "push", symbol: outOfBoundsSymbols[0] });
        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "constant", value: 1 });
        codeWriter.instruction({ type: "if" });

        uncertainWidth += 1;
      } else {
        definiteWidth += 1;
      }
    });

    codeWriter.instruction({ type: "constant", value: definiteWidth });

    for (var i = 0; i < uncertainWidth; i += 1) {
      codeWriter.instruction({ type: "add" });
    }

    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.bounds = function (skipBoundaries) {
    var keySymbol = stack.pop();
    var arraySymbol = stack.pop();

    var keyType = symbolTable.type(keySymbol);
    var arrayType = symbolTable.type(arraySymbol);

    var keySymbols = symbolTable.symbols(keySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (keyType !== "integer") {
      throw new Error("Attempting to check bounds a with a non-integer key");
    }

    if (arrayType !== "array") {
      throw new Error("Attempting to check bounds of a non-array");
    }

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    symbolTable.set(symbol, "boolean", symbols);
    stack.push(symbol);

    if (!skipBoundaries) {
      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: 0 });
      codeWriter.instruction({ type: "lessthan" });
      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: arraySymbols.length });
      codeWriter.instruction({ type: "greaterequal" });
      codeWriter.instruction({ type: "or" });
    } else {
      codeWriter.instruction({ type: "constant", value: true });
    }

    var conditions = symbolTable.getNilConditions(arraySymbol);
    if (conditions) {
      _.each(conditions, function (c) {
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });

        if (typeof c.nilIndex !== "undefined") {
          codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
          codeWriter.instruction({ type: "constant", value: c.nilIndex });
          codeWriter.instruction({ type: "equal" });
          codeWriter.instruction({ type: "and" });
        }

        codeWriter.instruction({ type: "or" });
      });
    }

    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.constant = function (value) {
    var symbol = registry.nextSymbol();
    var type = typeName(value);

    if (typeof type === "undefined") {
      var message = "Constants are only supported for types";
      message += " 'boolean' and 'integer'";

      throw new Error(message);
    }

    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
    } else if (type === "integer") {
      symbols = registry.nextInteger();
    }

    codeWriter.instruction({ type: "constant", value: value });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== leftType) {
      var msg = "Type mismatch for equals: " + leftType + " == " + rightType;
      throw new Error(msg);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    if (rightType === "array") {
      var maxLength;

      if (rightSymbols.length > leftSymbols.length) {
        maxLength = rightSymbols.length;
      } else {
        maxLength = leftSymbols.length;
      }

      var definitelyNotEqual, rightOutOfBoundsSymbol, leftOutOfBoundsSymbol;
      var r, l, index;

      for (index = 0; index < maxLength; index += 1) {
        leftOutOfBoundsSymbol = checkBoundsForIndex(leftSymbol, index);
        rightOutOfBoundsSymbol = checkBoundsForIndex(rightSymbol, index);

        l = leftSymbols[index];
        r = rightSymbols[index];

        if (!l && !rightOutOfBoundsSymbol) {
          definitelyNotEqual = true;
        }

        if (!r && !leftOutOfBoundsSymbol) {
          definitelyNotEqual = true;
        }
      }

      if (definitelyNotEqual) {
        self.constant(false);
        return;
      }

      for (index = 0; index < maxLength; index += 1) {
        leftOutOfBoundsSymbol = checkBoundsForIndex(leftSymbol, index);
        rightOutOfBoundsSymbol = checkBoundsForIndex(rightSymbol, index);

        l = leftSymbols[index];
        r = rightSymbols[index];

        if (l && r) {
          stack.push(l);
          stack.push(r);
          self.equal();
        } else {
          self.constant(true);
        }

        if (leftOutOfBoundsSymbol && rightOutOfBoundsSymbol) {
          stack.push(leftOutOfBoundsSymbol);
          stack.push(rightOutOfBoundsSymbol);

          self.equal();
        } else if (leftOutOfBoundsSymbol) {
          stack.push(leftOutOfBoundsSymbol);

          if (r) {
            self.not();
          }
        } else if (rightOutOfBoundsSymbol) {
          stack.push(rightOutOfBoundsSymbol);

          if (l) {
            self.not();
          }
        } else {
          self.constant(true);
        }

        self.and();
      }

      for (var i = 0; i < maxLength - 1; i += 1) {
        self.and();
      }
    } else {
      var symbol = registry.nextSymbol();
      var symbols = registry.nextBoolean();

      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "equal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });

      stack.push(symbol);
      symbolTable.set(symbol, "boolean", symbols);
    }
  };

  self.define = function (name, args, dynamic, immutable) {
    if (typeof name === "undefined") {
      throw new Error("Cannot define a function without a name");
    }

    if (typeof args === "undefined") {
      throw new Error("Cannot define a function without an array of args");
    }

    recording = {
      name: name,
      args: args,
      body: [],
      dynamic: dynamic,
      immutable: immutable,
      depth: 1
    };
  };

  self._return = function (width) {
    if (typeof width === "undefined") {
      throw new Error("Must specify the 'width' of arguments for return");
    }

    if (typeof recording === "undefined") {
      throw new Error("No function to return from");
    }

    functionRegistry.register(
      recording.name,
      recording.args,
      recording.body,
      recording.dynamic,
      recording.immutable,
      width
    );

    recording = undefined;
  };

  self._call = function (name, width) {
    if (typeof name === "undefined") {
      throw new Error("Cannot call a function without a name");
    }

    if (typeof width === "undefined") {
      throw new Error("Must specify argument width when calling function");
    }

    var fn = functionRegistry.get(name);
    var message;

    if (width !== fn.args.length) {
      message = name + ": wrong number of arguments";
      message += " (given " + width + ", expected " + fn.args.length + ")";

      throw new Error(message);
    }

    var instructionSet = scopedInstructionSet(fn);

    setupInstructionSet(instructionSet, fn);

    for (var i = 0; i < fn.body.length; i += 1) {
      var instruction = fn.body[i];
      instructionSet.call(instruction);
    }

    teardownInstructionSet(instructionSet, fn);

    return instructionSet;
  };

  self.pointer = function (name) {
    if (typeof name === "undefined") {
      throw new Error("Unable to create a function pointer without a name");
    }

    if (name[0] === "*") {
      functionStack.push(name.substring(1));
    } else {
      functionStack.push(name);
    }
  };

  self.each = function () {
    var arraySymbol = stack.pop();
    var functionName = functionStack.pop();

    var type = symbolTable.type(arraySymbol);
    var symbols = symbolTable.symbols(arraySymbol);
    var message;

    if (type !== "array") {
      message = "Wrong type for each. Called each on '" + arraySymbol;
      message += "' which is a " + type;

      throw new Error(message);
    }

    var fn = functionRegistry.get(functionName);

    if (fn.args.length === 0 || fn.args.length > 3) {
      message = "Tried to call 'each' on '" + arraySymbol + "' with";
      message += " function '" + fn.name + "' that takes " + fn.args.length;
      message += " arguments. 'each' can only be called with functions that";
      message += " take 1, 2 or 3 arguments.";

      throw new Error(message);
    }

    var checkBounds = fn.args.length === 3;
    var yieldIndex = fn.args.length >= 2;

    for (var i = 0; i < symbols.length; i += 1) {
      var elementSymbol = symbols[i];
      self.push(elementSymbol);

      if (yieldIndex) {
        self.constant(i);
      }

      if (checkBounds) {
        var outOfBoundsSymbol = checkBoundsForIndex(arraySymbol, i);

        if (outOfBoundsSymbol) {
          self.push(outOfBoundsSymbol);
          self.not();
        } else {
          self.constant(true);
        }
      }

      self._call(fn.name, fn.args.length);
    }

    self.push(arraySymbol);
  };

  self.eachPair = function () {
    var arraySymbol = stack.pop();
    var functionName = functionStack.pop();

    var type = symbolTable.type(arraySymbol);
    var symbols = symbolTable.symbols(arraySymbol);
    var message;

    if (type !== "array") {
      message = "Wrong type for eachPair. Called each on '" + arraySymbol;
      message += "' which is a " + type;

      throw new Error(message);
    }

    var fn = functionRegistry.get(functionName);

    if (fn.args.length !== 2 && fn.args.length !== 4 && fn.args.length !== 6) {
      message = "Tried to call 'eachPair' on '" + arraySymbol + "' with";
      message += " function '" + fn.name + "' that takes " + fn.args.length;
      message += " arguments. 'eachPair' can only be called with functions";
      message += " that take 2, 4 or 6 arguments.";

      throw new Error(message);
    }

    var checkBounds = fn.args.length === 6;
    var yieldIndex = fn.args.length >= 4;

    for (var i = 0; i < symbols.length; i += 1) {
      var iSymbol = symbols[i];
      var iOutOfBoundsSymbol;

      if (checkBounds) {
        iOutOfBoundsSymbol = checkBoundsForIndex(arraySymbol, i);
      }

      for (var j = i + 1; j < symbols.length; j += 1) {
        var jSymbol = symbols[j];
        var jOutOfBoundsSymbol;

        self.push(iSymbol);
        self.push(jSymbol);

        if (yieldIndex) {
          self.constant(i);
          self.constant(j);
        }

        if (checkBounds) {
          jOutOfBoundsSymbol = checkBoundsForIndex(arraySymbol, j);

          if (iOutOfBoundsSymbol) {
            self.push(iOutOfBoundsSymbol);
            self.not();
          } else {
            self.constant(true);
          }

          if (jOutOfBoundsSymbol) {
            self.push(jOutOfBoundsSymbol);
            self.not();
          } else {
            self.constant(true);
          }
        }

        self._call(fn.name, fn.args.length);
      }
    }

    self.push(arraySymbol);
  };

  self.transpose = function () {
    var arraySymbol = stack.pop();
    var arrayType = symbolTable.type(arraySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);
    var message;

    if (arrayType !== "array") {
      message = "Unable to transpose '" + arraySymbol + "' because it has type";
      message += " '" + arrayType + "' and only arrays are allowed";

      throw new Error(message);
    }

    var elementType = symbolTable.type(arraySymbols[0]);

    if (elementType !== "array") {
      message = "Unable to transpose '" + arraySymbol + "' because";
      message += " it is not an array of arrays";

      throw new Error(message);
    }

    var nestedArrays = _.map(arraySymbols, function (elementSymbol) {
      return symbolTable.symbols(elementSymbol);
    });

    var maxWidth = _.max(nestedArrays, "length").length;

    var firstElement = _.flatten(nestedArrays)[0];
    var firstElementType = symbolTable.type(firstElement);

    var fallbackSymbol = registry.nextSymbol();
    var fallbackSymbols;

    if (firstElementType === "boolean") {
      fallbackSymbols = registry.nextBoolean();

      codeWriter.instruction({ type: "constant", value: false });
      codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
    } else if (firstElementType === "integer") {
      fallbackSymbols = registry.nextInteger();

      codeWriter.instruction({ type: "constant", value: 0 });
      codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
    } else if (firstElementType === "array") {
      fallbackSymbols = [];
    }

    symbolTable.set(fallbackSymbol, firstElementType, fallbackSymbols);

    var trueSymbol = registry.nextBoolean()[0];

    codeWriter.instruction({ type: "constant", value: true });
    codeWriter.instruction({ type: "pop", symbol: trueSymbol });

    for (var i = 0; i < maxWidth; i += 1) {
      var transposedSymbol = registry.nextSymbol();
      var transposedSymbols = [];
      var nilConditions = [];

      _.each(nestedArrays, function (nestedArray, arrayIndex) {
        var nestedSymbol = nestedArray[i];

        if (nestedSymbol) {
          transposedSymbols.push(nestedSymbol);
        } else {
          transposedSymbols.push(fallbackSymbol);

          nilConditions.push({
            nilIndex: arrayIndex,
            conditionSymbol: trueSymbol
          });
        }

        var elementSymbol = arraySymbols[arrayIndex];
        var existingConditions = symbolTable.getNilConditions(elementSymbol);
        existingConditions = existingConditions || [];

        _.each(existingConditions, function (existing) {
          var allCondition = typeof existing.nilIndex === "undefined";

          if (allCondition || existing.nilIndex === i) {
            nilConditions.push({
              nilIndex: arrayIndex,
              conditionSymbol: existing.conditionSymbol
            });
          }
        });
      });

      stack.push(transposedSymbol);

      symbolTable.set(transposedSymbol, "array", transposedSymbols);
      symbolTable.setNilConditions(transposedSymbol, nilConditions);
    }

    self.collect(maxWidth);
  };

  var scopedInstructionSet = function (fn) {
    var scopedSymbolTable;
    var localTable = new SymbolTable();

    if (fn.dynamic) {
      scopedSymbolTable = new DynamicScope(symbolTable, localTable);
    } else {
      scopedSymbolTable = localTable;
    }

    var localRegistry = new FunctionRegistry(registry);
    var scopedFunctionRegistry = new FunctionScope(
      functionRegistry,
      localRegistry
    );

    var instructionSet = new InstructionSet({
      stack: new Stack(),
      typedefStack: new Stack(),
      functionStack: new Stack(),
      symbolTable: scopedSymbolTable,
      registry: params.registry,
      functionRegistry: scopedFunctionRegistry,
      codeWriter: params.codeWriter,
      callStack: callStack.add(fn.id, fn.name)
    });

    return instructionSet;
  };

  var setupInstructionSet = function (instructionSet, fn) {
    for (var i = fn.args.length - 1; i >= 0; i -= 1) {
      var arg = fn.args[i];

      if (isFunctionPointer(arg)) {
        var name = functionStack.pop();
        var newName = arg;

        copyFunction(name, newName, self, instructionSet);
      } else {
        var symbol = stack.pop();
        var newSymbol = arg;

        copySymbol(symbol, newSymbol, self, instructionSet);
      }
    }
  };

  var teardownInstructionSet = function (instructionSet, fn) {
    var symbols = [], i, symbol;

    for (i = 0; i < fn.returns; i += 1) {
      symbols.push(instructionSet.stack.pop());
    }

    var newSymbols = [];

    for (i = 0; i < fn.returns; i += 1) {
      symbol = symbols[i];
      var newSymbol = registry.nextSymbol();

      copySymbol(symbol, newSymbol, instructionSet, self);
      newSymbols.push(newSymbol);
    }

    newSymbols.reverse();

    for (i = 0; i < fn.returns; i += 1) {
      stack.push(newSymbols[i]);
    }

    var reassignedArrays = instructionSet.symbolTable.reassignedArrays;

    if (typeof reassignedArrays === "undefined") {
      return;
    }

    for (i = 0; i < reassignedArrays.length; i += 1) {
      symbol = reassignedArrays[i];
      copySymbol(symbol, symbol, instructionSet, self);
    }
  };

  var copySymbol = function (symbol, newSymbol, from, to) {
    var type = from.symbolTable.type(symbol);
    var symbols = from.symbolTable.symbols(symbol);

    if (type === "array") {
      var newElementSymbols = [];

      for (var i = 0; i < symbols.length; i += 1) {
        var elementSymbol = symbols[i];
        var newElementSymbol = registry.nextSymbol();

        copySymbol(elementSymbol, newElementSymbol, from, to);

        newElementSymbols.push(newElementSymbol);
      }

      symbols = newElementSymbols;
    }

    to.symbolTable.set(newSymbol, type, symbols, true);

    var conditions = from.symbolTable.getNilConditions(symbol);

    if (conditions) {
      to.symbolTable.setNilConditions(newSymbol, conditions);
    }
  };

  var copyFunction = function (name, newName, from, to) {
    newName = newName.substring(1);
    var fn = from.functionRegistry.get(name);

    to.functionRegistry.register(
      newName,
      fn.args,
      fn.body,
      fn.dynamic,
      fn.immutable,
      fn.returns
    );

    var newFn = to.functionRegistry.get(newName);
    newFn.id = fn.id;
  };

  var declare = function (symbol, type, symbols, width, typedef) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      switch (type) {
        case "boolean":
          codeWriter.instruction({
            type: type,
            symbol: symbols[0]
          });
          break;
        case "integer":
          codeWriter.instruction({
            type: type,
            symbol: symbols[0],
            width: width
          });
          break;
        case "array":
          declareElements(symbols, typedef);
          break;
      }

      symbolTable.set(symbol, type, symbols);
    }
  };

  var declareElements = function (symbols, typedef) {
    typedef = typedef || typedefStack.pop();

    _.each(symbols, function (s) {
      switch (typedef.type) {
        case "boolean":
          self._boolean(s);
          break;
        case "integer":
          self._integer(s, typedef.width);
          break;
        case "array":
          self.array(s, typedef.width, typedef.elements);
          break;
      }
    });
  };

  var throwOnTypeMismatch = function (symbols) {
    var types = _.map(symbols, recursivelyExpandTypes);

    var uniqueTypes = _.uniq(types, function (t) {
      return JSON.stringify(t);
    });

    if (uniqueTypes.length !== 1) {
      var message = "Nested arrays must have the same type hierarchy";

      _.each(types, function (t, index) {
        message += "\n" + symbols[index] + ": " + JSON.stringify(t);
      });

      throw new Error(message);
    }
  };

  var recursivelyExpandTypes = function (symbol) {
    var type = symbolTable.type(symbol);

    if (type === "array") {
      var symbols = symbolTable.symbols(symbol);
      var types = _.map(symbols, recursivelyExpandTypes);
      var uniqueTypes = _.uniq(types, function (t) {
        return JSON.stringify(t);
      });

      return uniqueTypes;
    } else {
      return type;
    }
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    }
  };

  var checkBoundsForIndex = function (arraySymbol, index) {
    var conditions = symbolTable.getNilConditions(arraySymbol);
    var outOfBoundsSymbol;

    var conditionsForIndex = _.select(conditions, function (c) {
      return typeof c.nilIndex === "undefined" || c.nilIndex === index;
    });

    _.each(conditionsForIndex, function (c) {
      codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
    });

    for (var i = 0; i < conditionsForIndex.length - 1; i += 1) {
      codeWriter.instruction({ type: "or" });
    }

    if (_.any(conditionsForIndex)) {
      outOfBoundsSymbol = registry.nextSymbol();
      var symbols = registry.nextBoolean();

      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
      symbolTable.set(outOfBoundsSymbol, "boolean", symbols);
    }

    return outOfBoundsSymbol;
  };

  var record = function (instruction) {
    if (typeof recording !== "undefined") {
      if (instruction.type === "define") {
        recording.depth += 1;
      } else if (instruction.type === "return") {
        recording.depth -= 1;

        if (recording.depth === 0) {
          return;
        }
      }

      recording.body.push(instruction);
      return true;
    }
  };

  var isFunctionPointer = function (name) {
    return name[0] === "*";
  };
};

module.exports = InstructionSet;

},{"../common/stack":11,"../level3Compiler/symbolTable":31,"./dynamicScope":26,"./functionRegistry":27,"./functionScope":28,"underscore":58}],30:[function(require,module,exports){
"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L3_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var booleanNumber = 0;
  var integerNumber = 0;
  var arrayNumber = 0;
  var functionNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextBoolean = function () {
    booleanNumber += 1;
    return [prefix + "BOOLEAN" + booleanNumber + suffix];
  };

  self.nextInteger = function () {
    integerNumber += 1;
    return [prefix + "INTEGER" + integerNumber + suffix];
  };

  self.nextArray = function (width) {
    if (!width) {
      throw new Error("No width specified");
    }

    arrayNumber += 1;

    var symbols = [];
    for (var i = 0; i < width; i += 1) {
      symbols.push(prefix + "ARRAY" + arrayNumber + "_ELEMENT" + i + suffix);
    }
    return symbols;
  };

  self.nextFunction = function () {
    functionNumber += 1;
    return functionNumber;
  };
};

module.exports = Registry;

},{}],31:[function(require,module,exports){
"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};
  var nils = {};

  self.set = function (symbol, type, symbols) {
    object[symbol] = { type: type, symbols: symbols };
  };

  self.type = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].type;
  };

  self.symbols = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].symbols;
  };

  self.contains = function (symbol) {
    return typeof object[symbol] !== "undefined";
  };

  self.setNilConditions = function (symbol, conditions) {
    throwIfMissing(symbol);
    nils[symbol] = conditions;
  };

  self.getNilConditions = function (symbol) {
    throwIfMissing(symbol);
    return nils[symbol];
  };

  var throwIfMissing = function (symbol) {
    if (!self.contains(symbol)) {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }
  };
};

module.exports = SymbolTable;

},{}],32:[function(require,module,exports){
"use strict";

var SyntaxParser = require("./level4Compiler/syntaxParser");
var ExpressionParser = require("./level4Compiler/expressionParser");
var CodeWriter = require("./level4Compiler/codeWriter");
var Registry = require("./level4Compiler/registry");
var StandardLibrary = require("./level4Compiler/standardLibrary");
var InstructionSet = require("./level4Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var syntaxParser = SyntaxParser;
  var expressionParser = new ExpressionParser();
  var codeWriter = new CodeWriter();
  var registry = new Registry();

  var instructionSet = new InstructionSet({
    codeWriter: codeWriter,
    expressionParser: expressionParser,
    registry: registry
  });

  var standardLibrary = new StandardLibrary({
    codeWriter: codeWriter,
    syntaxParser: syntaxParser,
    instructionSet: instructionSet
  });

  self.compile = function () {
    standardLibrary.defineFunctions();

    _.each(syntaxParser.parse(input), instructionSet.call);

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;

},{"./level4Compiler/codeWriter":33,"./level4Compiler/expressionParser":34,"./level4Compiler/instructionSet":35,"./level4Compiler/registry":38,"./level4Compiler/standardLibrary":39,"./level4Compiler/syntaxParser":40,"underscore":58}],33:[function(require,module,exports){
"use strict";

var CodeWriter = function () {
  var self = this;
  var instructions = [];

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.write = function () {
    return { instructions: instructions };
  };
};

module.exports = CodeWriter;

},{}],34:[function(require,module,exports){
"use strict";

var Macros = require("./macros");
var _ = require("underscore");

var ExpressionParser = function () {
  var self = this;
  var macros = new Macros(self);

  self.parse = function (expression) {
    expression = self.preprocess(expression);

    switch (typeof expression) {
      case "boolean":
      case "number":
        return [{ type: "constant", value: expression }];
      case "string":
        if (self.isFunctionPointer(expression)) {
          return [{ type: "pointer", name: expression }];
        } else {
          return [{ type: "push", symbol: expression }];
        }
        break;
      case "object":
        return parseFunctionCall(expression);
      default:
        throw new Error("Unexpected expression: " + expression);
    }
  };

  self.preprocess = function (expression) {
    if (expression.length === 2) {
      if (expression[0] === "-@" && self.integerLiteral(expression[1])) {
        expression = -expression[1];
      }

      if (expression[0] === "!@" && self.booleanLiteral(expression[1])) {
        expression = !expression[1];
      }
    }

    return expression;
  };

  /*jshint maxcomplexity:false */
  var parseFunctionCall = function (expression) {
    var functionName = expression.shift();
    var argExpressions = expression;
    var width = argExpressions.length;

    var instructions = [];
    var parseArgs = function () {
      _.each(argExpressions, function (argExpression) {
        instructions = instructions.concat(self.parse(argExpression));
      });
    };

    switch (functionName) {
      case "collect":
        parseArgs();
        instructions.push({ type: "collect", width: width });
      break;
      case "upto":
        macros.upto(argExpressions, instructions);
      break;
      case "downto":
        macros.downto(argExpressions, instructions);
      break;
      case "times":
        macros.times(argExpressions, instructions);
      break;
      case "get":
        macros.get(argExpressions, instructions);
      break;
      case "[]":
        macros.fetch(argExpressions, instructions);
      break;
      default:
        parseArgs();
        instructions.push({ type: "call", name: functionName, width: width });
    }

    return instructions;
  };

  self.isFunctionPointer = function (name) {
    return name[0] === "*";
  };

  self.integerLiteral = function (object) {
    return typeof object === "number" && (object % 1) === 0;
  };

  self.booleanLiteral = function (object) {
    return object === true || object === false;
  };
};

ExpressionParser.parse = function (expression) {
  return new ExpressionParser().parse(expression);
};

module.exports = ExpressionParser;

},{"./macros":36,"underscore":58}],35:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;
  var codeWriter, expressionParser, registry;

  var initialize = function () {
    codeWriter = params.codeWriter;
    expressionParser = withInlineFunctions(params.expressionParser);
    registry = params.registry;
  };

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "declaration":
        self.declaration(instruction.value);
        break;
      case "assignment":
        self.assignment(instruction.value);
        break;
      case "expose":
        self.expose(instruction.value);
        break;
      case "invariant":
        self.invariant(instruction.value);
        break;
      case "function":
        self._function(instruction.value);
        break;
      case "functionExpression":
        self.functionExpression(instruction.value);
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self.declaration = function (value) {
    var typedef = value[0];
    var symbols = value[1];

    var instructions = [];
    var name, width, instruction;

    for (var i = 0; i < typedef.length; i += 2) {
      name = typedef[i];
      width = typedef[i + 1];
      instruction = { type: "typedef" };

      if (name === "bool") {
        instruction.name = "boolean";
      } else if (name === "int") {
        instruction.name = "integer";
        instruction.width = width || 8;
      } else if (name === "array") {
        instruction.name = "array";
        instruction.width = width;
      }

      instructions.push(instruction);
    }

    var firstInstruction = instructions[0];
    firstInstruction.type = firstInstruction.name;
    delete firstInstruction.name;

    instructions.reverse();

    _.each(symbols, function (symbol) {
      var lastInstruction = _.clone(instructions.pop());
      lastInstruction.symbol = symbol;
      instructions.push(lastInstruction);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });
    });
  };

  self.assignment = function (value) {
    var symbols = value[0];
    var expressions = value[1];

    expressions.reverse();

    _.each(expressions, function (expression) {
      var instructions = expressionParser.parse(expression);
      _.each(instructions, codeWriter.instruction);
    });

    var tmpSymbols = [];

    _.each(symbols, function () {
      var tmpSymbol = registry.nextSymbol();
      codeWriter.instruction({ type: "pop", symbol: tmpSymbol });
      tmpSymbols.push(tmpSymbol);
    });

    _.each(symbols, function (symbol, index) {
      var tmpSymbol = tmpSymbols[index];
      codeWriter.instruction({ type: "push", symbol: tmpSymbol });
      codeWriter.instruction({ type: "pop", symbol: symbol });
    });
  };

  self.expose = function (value) {
    _.each(value, function (symbol) {
      codeWriter.instruction({ type: "variable", symbol: symbol });
    });
  };

  self.invariant = function (value) {
    _.each(value, function (expression) {
      var instructions = expressionParser.parse(expression);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });

      codeWriter.instruction({ type: "invariant" });
    });
  };

  self._function = function (value) {
    if (value.name === "_anonymous") {
      value.name += registry.nextAnonymous();
    }

    var define = { type: "define", name: value.name, args: value.args };

    if (value.dynamic) {
      define.dynamic = true;
    }

    if (value.immutable) {
      define.immutable = true;
    }

    codeWriter.instruction(define);

    _.each(value.body, self.call);

    var returnWidth = value.ret.shift();
    value.ret.reverse();

    _.each(value.ret, function (expression) {
      var instructions = expressionParser.parse(expression);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });
    });

    codeWriter.instruction({ type: "return", width: returnWidth });

    return value.name;
  };

  self.functionExpression = function (value) {
    var instructions = expressionParser.parse(value);

    _.each(instructions, function (instruction) {
      codeWriter.instruction(instruction);
    });
  };

  var withInlineFunctions = function (expressionParser) {
    return {
      parse: function (expression) {
        inlineFunctions(expression);
        return expressionParser.parse(expression);
      }
    };
  };

  var inlineFunctions = function (expression) {
    if (typeof expression === "object") {
      for (var i = 1; i < expression.length; i += 1) {
        var arg = expression[i];

        if (typeof arg.name !== "undefined") {
          expression[i] = "*" + self._function(arg);
        } else {
          inlineFunctions(arg);
        }
      }
    }
  };

  initialize();
};

module.exports = InstructionSet;

},{"underscore":58}],36:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var Macros = function (p) {
  var self = this;

  self.upto = function (args, instructions) {
    validateWidth(args, 3, "upto");

    var start = args[0];
    var stop = args[1];
    var pointer = args[2];

    start = p.preprocess(start);
    stop = p.preprocess(stop);

    validateLiteral(start, 0, "upto");
    validateLiteral(stop, 1, "upto");
    validatePointer(pointer, 2, "upto");

    pointer = pointer.substring(1);

    if (start > stop) {
      var message = "Cannot go from " + start + " up to " + stop + ".";
      message += " Use 'downto' instead.";

      throw new Error(message);
    }

    for (var i = start; i <= stop; i += 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  self.downto = function (args, instructions) {
    validateWidth(args, 3, "downto");

    var start = args[0];
    var stop = args[1];
    var pointer = args[2];

    start = p.preprocess(start);
    stop = p.preprocess(stop);

    validateLiteral(start, 0, "downto");
    validateLiteral(stop, 1, "downto");
    validatePointer(pointer, 2, "downto");

    pointer = pointer.substring(1);

    if (start < stop) {
      var message = "Cannot go from " + start + " down to " + stop + ".";
      message += " Use 'upto' instead.";

      throw new Error(message);
    }

    for (var i = start; i >= stop; i -= 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  self.times = function (args, instructions) {
    validateWidth(args, 2, "times");

    var count = args[0];
    var pointer = args[1];

    count = p.preprocess(count);

    validateLiteral(count, 0, "times");
    validatePointer(pointer, 1, "times");

    pointer = pointer.substring(1);

    if (count <= 0) {
      var message = "Cannot call 'times' with " + count + ". Must be a";
      message += " positive integer.";

      throw new Error(message);
    }

    for (var i = 0; i < count; i += 1) {
      instructions.push({ type: "constant", value: i });
      instructions.push({ type: "call", name: pointer, width: 1 });
    }
  };

  self.get = function (args, instructions) {
    validateWidth(args, 2, "get");

    var array = args[0];
    var index = args[1];

    index = p.preprocess(index);

    var arrayInstructions = p.parse(array);

    _.each(arrayInstructions, function (instruction) {
      instructions.push(instruction);
    });

    if (p.integerLiteral(index)) {
      instructions.push({ type: "getIndex", index: index, checkBounds: true });
    } else {
      var indexInstructions = p.parse(index);

      _.each(indexInstructions, function (instruction) {
        instructions.push(instruction);
      });

      instructions.push({ type: "call", name: "get", width: 2 });
    }
  };

  self.fetch = function (args, instructions) {
    validateWidth(args, 2, "[]");

    var array = args[0];
    var index = args[1];

    index = p.preprocess(index);

    var arrayInstructions = p.parse(array);

    _.each(arrayInstructions, function (instruction) {
      instructions.push(instruction);
    });

    if (p.integerLiteral(index)) {
      instructions.push({ type: "fetchIndex", index: index });
    } else {
      var indexInstructions = p.parse(index);

      _.each(indexInstructions, function (instruction) {
        instructions.push(instruction);
      });

      instructions.push({ type: "call", name: "[]", width: 2 });
    }
  };

  var validateLiteral = function (literal, index, name) {
    if (p.integerLiteral(literal)) {
      return;
    }

    var message = "Called '" + name + "' with '" + literal + "' but '" + name;
    message += "' only supports integer literals (arg #" + index + ")";

    throw new Error(message);
  };

  var validatePointer = function (pointer, index, name) {
    if (p.isFunctionPointer(pointer)) {
      return;
    }

    var message = "Called '" + name + "' with '" + pointer + "' but expected";
    message += " a function (arg #" + index + ")";

    throw new Error(message);
  };

  var validateWidth = function (args, expected, name) {
    var width = args.length;

    if (width === expected) {
      return;
    }

    var message = name + ": wrong number of arguments";
    message += " (given " + width + ", expected " + expected + ")";

    throw new Error(message);
  };
};

module.exports = Macros;

},{"underscore":58}],37:[function(require,module,exports){
module.exports = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleIndices = { program: 0 },
        peg$startRuleIndex   = 0,

        peg$consts = [
          ";",
          { type: "literal", value: ";", description: "\";\"" },
          function(lines) {
              return lines;
            },
          function(statement) {
              return statement;
            },
          function(s) {
              return { type: "declaration", value: s };
            },
          function(s) {
              return { type: "assignment", value: s };
            },
          function(s) {
              return { type: "expose", value: s };
            },
          function(s) {
              return { type: "invariant", value: s };
            },
          function(s) {
              return { type: "function", value: s };
            },
          function(s) {
              return { type: "functionExpression", value: s };
            },
          function(type, variableList) {
              return [type, variableList];
            },
          "=",
          { type: "literal", value: "=", description: "\"=\"" },
          function(variableList, exprList) {
              return [variableList, exprList];
            },
          "+",
          { type: "literal", value: "+", description: "\"+\"" },
          "-",
          { type: "literal", value: "-", description: "\"-\"" },
          "*",
          { type: "literal", value: "*", description: "\"*\"" },
          "/",
          { type: "literal", value: "/", description: "\"/\"" },
          "%",
          { type: "literal", value: "%", description: "\"%\"" },
          "&&",
          { type: "literal", value: "&&", description: "\"&&\"" },
          "||",
          { type: "literal", value: "||", description: "\"||\"" },
          function(variable, operator, expr) {
              return [[variable], [[operator, variable, expr]]];
            },
          "expose",
          { type: "literal", value: "expose", description: "\"expose\"" },
          function(variableList) {
              return variableList;
            },
          "invariant",
          { type: "literal", value: "invariant", description: "\"invariant\"" },
          function(expressionList) {
              return expressionList;
            },
          function(signature, body) {
              return {
                name: signature[0],
                dynamic: signature[1],
                immutable: signature[2],
                args: signature[3],
                body: body[0],
                ret: body[1]
              };
            },
          "function",
          { type: "literal", value: "function", description: "\"function\"" },
          "^",
          { type: "literal", value: "^", description: "\"^\"" },
          "&",
          { type: "literal", value: "&", description: "\"&\"" },
          "(",
          { type: "literal", value: "(", description: "\"(\"" },
          ")",
          { type: "literal", value: ")", description: "\")\"" },
          function(dynamic, name, immutable, args) {
              dynamic = dynamic === "^";
              immutable = immutable === "&";
              name = name || "_anonymous";
              return [name, dynamic, immutable, args || []];
            },
          function(head, tail) {
              if (tail) {
                return [head].concat(tail);
              } else {
                return [head];
              }
            },
          ",",
          { type: "literal", value: ",", description: "\",\"" },
          function(tail) {
              return tail;
            },
          "{",
          { type: "literal", value: "{", description: "\"{\"" },
          "}",
          { type: "literal", value: "}", description: "\"}\"" },
          function(body, returnStatement) {
              return [body, returnStatement || [0]];
            },
          "return",
          { type: "literal", value: "return", description: "\"return\"" },
          function(returnList) {
              return returnList || [0];
            },
          function(width, expressionList) {
              var exprWidth = expressionList.length;

              if (width && exprWidth > width) {
                var message = "'return" + width + "' was specified, but the function"
                message += " returns (at least) " + exprWidth + " expressions"
                throw new Error(message);
              }

              width = width || exprWidth;
              expressionList.unshift(width);
              return expressionList;
            },
          /^[a-zA-Z]/,
          { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
          /^[a-zA-Z0-9_]/,
          { type: "class", value: "[a-zA-Z0-9_]", description: "[a-zA-Z0-9_]" },
          function(name) {
              return name;
            },
          "bool",
          { type: "literal", value: "bool", description: "\"bool\"" },
          "int",
          { type: "literal", value: "int", description: "\"int\"" },
          "array",
          { type: "literal", value: "array", description: "\"array\"" },
          "?",
          { type: "literal", value: "?", description: "\"?\"" },
          "!",
          { type: "literal", value: "!", description: "\"!\"" },
          "[]",
          { type: "literal", value: "[]", description: "\"[]\"" },
          "-@",
          { type: "literal", value: "-@", description: "\"-@\"" },
          "!@",
          { type: "literal", value: "!@", description: "\"!@\"" },
          "<=",
          { type: "literal", value: "<=", description: "\"<=\"" },
          ">=",
          { type: "literal", value: ">=", description: "\">=\"" },
          "==",
          { type: "literal", value: "==", description: "\"==\"" },
          "!=",
          { type: "literal", value: "!=", description: "\"!=\"" },
          /^[+\-*\/%<>]/,
          { type: "class", value: "[+\\-*/%<>]", description: "[+\\-*/%<>]" },
          "true",
          { type: "literal", value: "true", description: "\"true\"" },
          function() {
              return true;
            },
          "false",
          { type: "literal", value: "false", description: "\"false\"" },
          function() {
              return false;
            },
          /^[0-9]/,
          { type: "class", value: "[0-9]", description: "[0-9]" },
          function() {
              return parseInt(text(), 10);
            },
          function() {
              return ["bool"];
            },
          function(width) {
              if (width) {
                return ["int", width];
              } else {
                return ["int"];
              }
            },
          /^[1-9]/,
          { type: "class", value: "[1-9]", description: "[1-9]" },
          "<",
          { type: "literal", value: "<", description: "\"<\"" },
          ">",
          { type: "literal", value: ">", description: "\">\"" },
          function(width, subtype) {
              return ["array", width].concat(subtype);
            },
          ":",
          { type: "literal", value: ":", description: "\":\"" },
          function(c, ifTrue, ifFalse) {
              return ["if", c, ifTrue, ifFalse];
            },
          function(head, tail) {
              return leftAssociative(head, tail);
            },
          function(operator, expr) {
              return { expr: [expr], operator: operator };
            },
          function(left, operator, right) {
              return [operator, left, right];
            },
          function(expr) {
              return ["!@", expr];
            },
          ".",
          { type: "literal", value: ".", description: "\".\"" },
          function(methodName, methodArgs) {
              methodArgs = methodArgs || [];
              return { expr: methodArgs, operator: methodName };
            },
          function(callList) {
              return callList;
            },
          function(expr) {
              return ["-@", expr];
            },
          "[",
          { type: "literal", value: "[", description: "\"[\"" },
          "]",
          { type: "literal", value: "]", description: "\"]\"" },
          function(arg) {
              return { expr: [arg], operator: "[]" };
            },
          function(expr) {
              return expr;
            },
          function(exprList) {
              exprList.unshift("collect");
              return exprList;
            },
          function(methodName, callList) {
              callList = callList || [];
              callList.unshift(methodName);
              return callList;
            },
          /^[ \t\r\n]/,
          { type: "class", value: "[ \\t\\r\\n]", description: "[ \\t\\r\\n]" },
          function() {
              return " ";
            },
          "#",
          { type: "literal", value: "#", description: "\"#\"" },
          /^[^\r\n]/,
          { type: "class", value: "[^\\r\\n]", description: "[^\\r\\n]" },
          function() {
              return "";
            }
        ],

        peg$bytecode = [
          peg$decode("%$;X.) &2 \"\"6 7!0/*;X.) &2 \"\"6 7!&/8#$;!0#*;!&/($8\":\"\"! )(\"'#&'#"),
          peg$decode("%;\"/m#;X.\" &\"/_$2 \"\"6 7!/P$$;X.) &2 \"\"6 7!0/*;X.) &2 \"\"6 7!&/($8$:#$!#)($'#(#'#(\"'#&'#"),
          peg$decode("%;#/' 8!:$!! ).\x8F &%;$.# &;%/' 8!:%!! ).w &%;&/' 8!:&!! ).e &%;'/' 8!:'!! ).S &%;(/' 8!:(!! ).A &%;T/' 8!:)!! )./ &%;L/' 8!:)!! )"),
          peg$decode("%;7/;#;X/2$;0/)$8#:*#\"\" )(#'#(\"'#&'#"),
          peg$decode("%;0/]#;X.\" &\"/O$2+\"\"6+7,/@$;X.\" &\"/2$;</)$8%:-%\"$ )(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;2/\xB5#;X.\" &\"/\xA7$2.\"\"6.7/.e &20\"\"6071.Y &22\"\"6273.M &24\"\"6475.A &26\"\"6677.5 &28\"\"6879.) &2:\"\"6:7;/P$2+\"\"6+7,/A$;X.\" &\"/3$;>/*$8&:<&#%# )(&'#(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%2=\"\"6=7>/:#;X/1$;0/($8#:?#! )(#'#(\"'#&'#"),
          peg$decode("%2@\"\"6@7A/:#;X/1$;</($8#:B#! )(#'#(\"'#&'#"),
          peg$decode("%;)/@#;X.\" &\"/2$;-/)$8#:C#\"\" )(#'#(\"'#&'#"),
          peg$decode("%2D\"\"6D7E/\xC0#2F\"\"6F7G.\" &\"/\xAC$;X/\xA3$;4.\" &\"/\x95$2H\"\"6H7I.\" &\"/\x81$;X.\" &\"/s$2J\"\"6J7K/d$;X.\" &\"/V$;*.\" &\"/H$;X.\" &\"/:$2L\"\"6L7M/+$8+:N+$)'&\")(+'#(*'#()'#(('#(''#(&'#(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;,/7#;+.\" &\"/)$8\":O\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/N#2P\"\"6P7Q/?$;X.\" &\"/1$;*/($8$:R$! )($'#(#'#(\"'#&'#"),
          peg$decode(";2.C &%%22\"\"6273/,#;4/#$+\")(\"'#&'#/\"!&,)"),
          peg$decode("%2S\"\"6S7T/O#; /F$;..\" &\"/8$2U\"\"6U7V/)$8$:W$\"\"!)($'#(#'#(\"'#&'#"),
          peg$decode("%2X\"\"6X7Y/{#;/.\" &\"/m$;X.\" &\"/_$2 \"\"6 7!/P$$;X.) &2 \"\"6 7!0/*;X.) &2 \"\"6 7!&/($8%:Z%!#)(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;:.\" &\"/;#;X/2$;</)$8#:[#\"\" )(#'#(\"'#&'#"),
          peg$decode("%;2/7#;1.\" &\"/)$8\":O\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/N#2P\"\"6P7Q/?$;X.\" &\"/1$;0/($8$:R$! )($'#(#'#(\"'#&'#"),
          peg$decode("%%<;3=.##&&!&'#/d#%%4\\\"\"5!7]/?#$4^\"\"5!7_0)*4^\"\"5!7_&/#$+\")(\"'#&'#/\"!&,)/($8\":`\"! )(\"'#&'#"),
          peg$decode(";6.q &2=\"\"6=7>.e &2@\"\"6@7A.Y &2D\"\"6D7E.M &2X\"\"6X7Y.A &2a\"\"6a7b.5 &2c\"\"6c7d.) &2e\"\"6e7f"),
          peg$decode("%%;2/C#2g\"\"6g7h.) &2i\"\"6i7j.\" &\"/#$+\")(\"'#&'#/\"!&,).# &;5"),
          peg$decode("2k\"\"6k7l.\x89 &2m\"\"6m7n.} &2o\"\"6o7p.q &2q\"\"6q7r.e &2s\"\"6s7t.Y &2u\"\"6u7v.M &2w\"\"6w7x.A &28\"\"6879.5 &2:\"\"6:7;.) &4y\"\"5!7z"),
          peg$decode("%2{\"\"6{7|/B#%<4^\"\"5!7_=.##&&!&'#/'$8\":}\" )(\"'#&'#.| &%2~\"\"6~7/B#%<4^\"\"5!7_=.##&&!&'#/'$8\":\x80\" )(\"'#&'#.G &%$4\x81\"\"5!7\x82/,#0)*4\x81\"\"5!7\x82&&&#/& 8!:\x83! )"),
          peg$decode(";8.) &;9.# &;;"),
          peg$decode("%2a\"\"6a7b/& 8!:\x84! )"),
          peg$decode("%2c\"\"6c7d/6#;:.\" &\"/($8\":\x85\"! )(\"'#&'#"),
          peg$decode("%4\x86\"\"5!7\x87/C#$4\x81\"\"5!7\x820)*4\x81\"\"5!7\x82&/'$8\":\x83\" )(\"'#&'#"),
          peg$decode("%2e\"\"6e7f/Y#;:/P$2\x88\"\"6\x887\x89/A$;7/8$2\x8A\"\"6\x8A7\x8B/)$8%:\x8C%\"#!)(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;>/7#;=.\" &\"/)$8\":O\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/N#2P\"\"6P7Q/?$;X.\" &\"/1$;</($8$:R$! )($'#(#'#(\"'#&'#"),
          peg$decode("%;?/\x92#;X.\" &\"/\x84$2g\"\"6g7h/u$;X.\" &\"/g$;>/^$;X.\" &\"/P$2\x8D\"\"6\x8D7\x8E/A$;X.\" &\"/3$;>/*$8):\x8F)#($ )()'#(('#(''#(&'#(%'#($'#(#'#(\"'#&'#.# &;?"),
          peg$decode("%;A/9#$;@0#*;@&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/O#2:\"\"6:7;/@$;X.\" &\"/2$;A/)$8$:\x91$\"\" )($'#(#'#(\"'#&'#"),
          peg$decode("%;C/9#$;B0#*;B&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/O#28\"\"6879/@$;X.\" &\"/2$;C/)$8$:\x91$\"\" )($'#(#'#(\"'#&'#"),
          peg$decode("%;E/9#$;D0#*;D&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/[#2u\"\"6u7v.) &2w\"\"6w7x/@$;X.\" &\"/2$;E/)$8$:\x91$\"\" )($'#(#'#(\"'#&'#"),
          peg$decode("%;F/\x82#;X.\" &\"/t$2q\"\"6q7r.A &2s\"\"6s7t.5 &2\x88\"\"6\x887\x89.) &2\x8A\"\"6\x8A7\x8B/A$;X.\" &\"/3$;F/*$8%:\x92%#$\" )(%'#($'#(#'#(\"'#&'#.# &;F"),
          peg$decode("%;H/9#$;G0#*;G&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/[#2.\"\"6.7/.) &20\"\"6071/@$;X.\" &\"/2$;H/)$8$:\x91$\"\" )($'#(#'#(\"'#&'#"),
          peg$decode("%;J/9#$;I0#*;I&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/g#22\"\"6273.5 &24\"\"6475.) &26\"\"6677/@$;X.\" &\"/2$;J/)$8$:\x91$\"\" )($'#(#'#(\"'#&'#"),
          peg$decode("%2i\"\"6i7j/1#;K/($8\":\x93\"! )(\"'#&'#.# &;K"),
          peg$decode(";L.# &;O"),
          peg$decode("%;O/?#$;M/&#0#*;M&&&#/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%2\x94\"\"6\x947\x95/@#;4/7$;N.\" &\"/)$8#:\x96#\"! )(#'#(\"'#&'#"),
          peg$decode("%2J\"\"6J7K/a#;X.\" &\"/S$;U.\" &\"/E$;X.\" &\"/7$2L\"\"6L7M/($8%:\x97%!\")(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%20\"\"6071/1#;P/($8\":\x98\"! )(\"'#&'#.# &;P"),
          peg$decode("%;R/9#$;Q0#*;Q&/)$8\":\x90\"\"! )(\"'#&'#"),
          peg$decode("%2\x99\"\"6\x997\x9A/\\#;X.\" &\"/N$;>/E$;X.\" &\"/7$2\x9B\"\"6\x9B7\x9C/($8%:\x9D%!\")(%'#($'#(#'#(\"'#&'#"),
          peg$decode(";T.~ &;S.x &;6.r &;2.l &%2J\"\"6J7K/\\#;X.\" &\"/N$;>/E$;X.\" &\"/7$2L\"\"6L7M/($8%:\x9E%!\")(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%2\x99\"\"6\x997\x9A/\\#;X.\" &\"/N$;</E$;X.\" &\"/7$2\x9B\"\"6\x9B7\x9C/($8%:\x9F%!\")(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;4/q#2J\"\"6J7K/b$;X.\" &\"/T$;U.\" &\"/F$;X.\" &\"/8$2L\"\"6L7M/)$8&:\xA0&\"%\")(&'#(%'#($'#(#'#(\"'#&'#"),
          peg$decode("%;W/7#;V.\" &\"/)$8\":O\"\"! )(\"'#&'#"),
          peg$decode("%;X.\" &\"/N#2P\"\"6P7Q/?$;X.\" &\"/1$;U/($8$:R$! )($'#(#'#(\"'#&'#"),
          peg$decode(";(.I &;>.C &%%22\"\"6273/,#;4/#$+\")(\"'#&'#/\"!&,)"),
          peg$decode("%$4\xA1\"\"5!7\xA2.# &;Y/2#0/*4\xA1\"\"5!7\xA2.# &;Y&&&#/& 8!:\xA3! )"),
          peg$decode("%2\xA4\"\"6\xA47\xA5/C#$4\xA6\"\"5!7\xA70)*4\xA6\"\"5!7\xA7&/'$8\":\xA8\" )(\"'#&'#")
        ],

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleIndices)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleIndex = peg$startRuleIndices[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$decode(s) {
      var bc = new Array(s.length), i;

      for (i = 0; i < s.length; i++) {
        bc[i] = s.charCodeAt(i) - 32;
      }

      return bc;
    }

    function peg$parseRule(index) {
      var bc    = peg$bytecode[index],
          ip    = 0,
          ips   = [],
          end   = bc.length,
          ends  = [],
          stack = [],
          params, i;

      while (true) {
        while (ip < end) {
          switch (bc[ip]) {
            case 0:
              stack.push(peg$consts[bc[ip + 1]]);
              ip += 2;
              break;

            case 1:
              stack.push(void 0);
              ip++;
              break;

            case 2:
              stack.push(null);
              ip++;
              break;

            case 3:
              stack.push(peg$FAILED);
              ip++;
              break;

            case 4:
              stack.push([]);
              ip++;
              break;

            case 5:
              stack.push(peg$currPos);
              ip++;
              break;

            case 6:
              stack.pop();
              ip++;
              break;

            case 7:
              peg$currPos = stack.pop();
              ip++;
              break;

            case 8:
              stack.length -= bc[ip + 1];
              ip += 2;
              break;

            case 9:
              stack.splice(-2, 1);
              ip++;
              break;

            case 10:
              stack[stack.length - 2].push(stack.pop());
              ip++;
              break;

            case 11:
              stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));
              ip += 2;
              break;

            case 12:
              stack.push(input.substring(stack.pop(), peg$currPos));
              ip++;
              break;

            case 13:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1]) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 14:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] === peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 15:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] !== peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 16:
              if (stack[stack.length - 1] !== peg$FAILED) {
                ends.push(end);
                ips.push(ip);

                end = ip + 2 + bc[ip + 1];
                ip += 2;
              } else {
                ip += 2 + bc[ip + 1];
              }

              break;

            case 17:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (input.length > peg$currPos) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 18:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 19:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 20:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 21:
              stack.push(input.substr(peg$currPos, bc[ip + 1]));
              peg$currPos += bc[ip + 1];
              ip += 2;
              break;

            case 22:
              stack.push(peg$consts[bc[ip + 1]]);
              peg$currPos += peg$consts[bc[ip + 1]].length;
              ip += 2;
              break;

            case 23:
              stack.push(peg$FAILED);
              if (peg$silentFails === 0) {
                peg$fail(peg$consts[bc[ip + 1]]);
              }
              ip += 2;
              break;

            case 24:
              peg$savedPos = stack[stack.length - 1 - bc[ip + 1]];
              ip += 2;
              break;

            case 25:
              peg$savedPos = peg$currPos;
              ip++;
              break;

            case 26:
              params = bc.slice(ip + 4, ip + 4 + bc[ip + 3]);
              for (i = 0; i < bc[ip + 3]; i++) {
                params[i] = stack[stack.length - 1 - params[i]];
              }

              stack.splice(
                stack.length - bc[ip + 2],
                bc[ip + 2],
                peg$consts[bc[ip + 1]].apply(null, params)
              );

              ip += 4 + bc[ip + 3];
              break;

            case 27:
              stack.push(peg$parseRule(bc[ip + 1]));
              ip += 2;
              break;

            case 28:
              peg$silentFails++;
              ip++;
              break;

            case 29:
              peg$silentFails--;
              ip++;
              break;

            default:
              throw new Error("Invalid opcode: " + bc[ip] + ".");
          }
        }

        if (ends.length > 0) {
          end = ends.pop();
          ip = ips.pop();
        } else {
          break;
        }
      }

      return stack[0];
    }


      var leftAssociative = function (head, tail) {
        return tail.reduce(function (acc, element) {
          return [element.operator, acc].concat(element.expr);
        }, head);
      };


    peg$result = peg$parseRule(peg$startRuleIndex);

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();

},{}],38:[function(require,module,exports){
"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L4_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var anonymousNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextAnonymous = function () {
    anonymousNumber += 1;
    return anonymousNumber;
  };
};

module.exports = Registry;

},{}],39:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var StandardLibrary = function (params) {
  var self = this;

  var codeWriter = params.codeWriter;
  var syntaxParser = params.syntaxParser;
  var instructionSet = params.instructionSet;

  self.defineFunctions = function () {
    defineRaw("[]", ["self", "index"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "index" },
      { type: "fetch" }
    ], 1);

    defineRaw("abs", ["self"], [
      { type: "push", symbol: "self" },
      { type: "absolute" }
    ], 1);

    defineRaw("-@", ["self"], [
      { type: "push", symbol: "self" },
      { type: "negate" }
    ], 1);

    defineRaw("!@", ["self"], [
      { type: "push", symbol: "self" },
      { type: "not" }
    ], 1);

    defineRaw("length", ["self"], [
      { type: "push", symbol: "self" },
      { type: "width" }
    ], 1);

    defineRaw("*", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "multiply" }
    ], 1);

    defineRaw("/", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "divide" }
    ], 1);

    defineRaw("%", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "modulo" }
    ], 1);

    defineRaw("+", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "add" }
    ], 1);

    defineRaw("-", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "subtract" }
    ], 1);

    defineRaw("<", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "lessthan" }
    ], 1);

    defineRaw(">", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "greaterthan" }
    ], 1);

    defineRaw("<=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "lessequal" }
    ], 1);

    defineRaw(">=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "greaterequal" }
    ], 1);

    defineRaw("==", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "equal" }
    ], 1);

    defineRaw("!=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "equal" },
      { type: "not" }
    ], 1);

    defineRaw("&&", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "and" }
    ], 1);

    defineRaw("||", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "or" }
    ], 1);

    defineRaw("if", ["self", "consequent", "alternate"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "consequent" },
      { type: "push", symbol: "alternate" },
      { type: "if" }
    ], 1);

    defineRaw("divmod", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "divmod" }
    ], 2);

    defineRaw("get", ["self", "index"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "index" },
      { type: "get", checkBounds: true }
    ], 2);

    defineRaw("transpose", ["self"], [
      { type: "push", symbol: "self" },
      { type: "transpose" }
    ], 1);

    defineRaw("each", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "each" }
    ], 1, true);

    defineRaw("eachPair", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "eachPair" }
    ], 1, true);

    define("                                                    \n\
      function uniq?& (self) {                                  \n\
        return self.uniqBy?(function (x) {                      \n\
          return x;                                             \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function uniqBy?& (self, *identity) {                     \n\
        unique = true;                                          \n\
                                                                \n\
        self.eachPair(function^ (left, right, i, j, lP, rP) {   \n\
          unique &&= if(                                        \n\
            lP && rP,                                           \n\
            identity(left) != identity(right),                  \n\
            true                                                \n\
          );                                                    \n\
        });                                                     \n\
                                                                \n\
        return unique;                                          \n\
      };                                                        \n\
    ");

    // These are special cases handled by ExpressionParser.
    reserveName("collect");
  };

  var define = function (input) {
    _.each(syntaxParser.parse(input), instructionSet.call);
  };

  var defineRaw = function (name, args, body, returns, dynamic) {
    codeWriter.instruction({
      type: "define",
      name: name,
      args: args,
      immutable: true,
      dynamic: dynamic
    });

    _.each(body, codeWriter.instruction);

    codeWriter.instruction({ type: "return", width: returns });
  };

  var reserveName = function (name) {
    defineRaw(name, [], [], 0, false);
  };
};

module.exports = StandardLibrary;

},{"underscore":58}],40:[function(require,module,exports){
"use strict";

var pegParser = require("./pegParser");

var SyntaxParser = function (input) {
  var self = this;

  self.parse = function () {
    try {
      return pegParser.parse(input);
    } catch (error) {
      var location = error.location.end;

      var lineNumber = location.line;
      var colNumber = location.column - 1;

      var lines = input.split("\n");
      var line = lines[lineNumber - 1];

      var symbol = error.found;

      if (symbol) {
        symbol = "'" + symbol + "'";
      } else {
        symbol = "end-of-input";
        colNumber += 1;
      }

      var message = "syntax error, unexpected " + symbol;
      message += "\n  " + line + "\n  ";

      for (var i = 0; i < colNumber - 1; i += 1) {
        message += " ";
      }

      message += "^";

      throw {
        name: "sentient:" + lineNumber + ":" + colNumber,
        message: message
      };
    }
  };
};

SyntaxParser.parse = function (input) {
  return new SyntaxParser(input).parse();
};

module.exports = SyntaxParser;

},{"./pegParser":37}],41:[function(require,module,exports){
"use strict";

var Logger = function () {
  var self = this;
  var defaultLevel = "silent";

  self.level = defaultLevel;

  self.reset = function () {
    self.level = defaultLevel;
  };

  self.debug = function (message) {
    log(message, "debug");
  };

  self.info = function (message) {
    log(message, "info");
  };

  // We use console.warn here so that node logs to stderr, which does not
  // interfere if stdout is piped elsewhere.
  var log = function (message, level) {
    if (typeof console === "undefined") {
      return;
    }

    if (typeof console.warn === "undefined") {
      return;
    }

    if (numeric(self.level) >= numeric(level)) {
      console.warn(message);
    }
  };

  var numeric = function (level) {
    switch (level) {
      case "silent":
        return -1;
      case "info":
        return 6;
      case "debug":
        return 7;
      default:
        throw new Error("Unrecognised log level: '" + level + "'");
    }
  };
};

module.exports = new Logger();

},{}],42:[function(require,module,exports){
"use strict";

var MinisatAdapter = require("./machine/minisatAdapter");
var MetadataExtractor = require("./runtime/metadataExtractor");
var Logger = require("./logger");
var _ = require("underscore");

var Machine = function (solver) {
  var self = this;
  var literalMap;

  self.run = function (program, assignments, count, callback) {
    if (typeof callback === "undefined") {
      return runSynchronously(program, assignments, count);
    } else {
      return runAsychronously(program, assignments, count, callback);
    }
  };

  var runSynchronously = function (program, assignments, count) {
    var results = [];

    run(program, assignments, count, function (result) {
      results.push(result);
    });

    return results;
  };

  var runAsychronously = function (program, assignments, count, callback) {
    var timer = setTimeout(function () {
      run(program, assignments, count, callback);
    }, 0);

    return timer;
  };

  var run = function (program, assignments, count, callback) {
    var level1Variables = MetadataExtractor.extract(program).level1Variables;
    literalMap = _.invert(level1Variables);

    if (typeof count === "undefined") {
      count = 1;
    }

    program = encodeConstraints(program, assignments);

    var result;

    for (var i = 0; i < count || count === 0; i += 1) {
      if (result) {
        Logger.debug("Excluding result from subsequent solves");
        program = excludeResult(program, result);
      }

      Logger.debug("Solving SAT problem");
      result = solver.solve(program);

      Logger.debug("Decoding SAT result");
      result = decodeResult(result);

      Logger.debug("Passing result to runtime");
      callback(result);

      if (_.isEmpty(result)) {
        break;
      }
    }

    Logger.info("Finished running");
  };

  var encodeConstraints = function (program, assignments) {
    var constraints = generateConstraints(assignments);
    var header = generateHeader(program, assignments);
    var constrainedProgram = program + constraints;

    return replaceHeader(constrainedProgram, header);
  };

  var excludeResult = function (program, result) {
    self.numberOfClauses += 1;

    var header = "p cnf " + self.numberOfLiterals + " " + self.numberOfClauses;
    var clause = "\nc excluded clause\n";

    _.each(result, function (bool, literal) {
      if (bool) {
        clause += "-";
      }

      clause += literal + " ";
    });

    clause += "0\n";

    program = replaceHeader(program, header);
    program += clause;

    return program;
  };

  var decodeResult = function (result) {
    var object = {};

    for (var i = 0; i < result.length; i += 1) {
      var literal = result[i];
      var positive = true;

      if (literal < 0) {
        positive = false;
        literal *= -1;
      }

      if (literalMap[literal]) {
        object[literal] = positive;
      }
    }

    return object;
  };

 var generateConstraints = function (assignments) {
    return _.map(assignments, function (value, key) {
      if (!value) {
        key = -key;
      }

      return "" + key + " 0";
    }).join("\n");
  };

  var generateHeader = function (program, assignments) {
    var lines = program.split("\n");

    var problemSizeLine = _.detect(lines, function (line) {
      return line.match(/p cnf/);
    });

    if (!problemSizeLine) {
      var message = "The line containing the problem size could not be found";
      throw new Error(message);
    }

    problemSizeLine = problemSizeLine.trim();
    var terms = problemSizeLine.split(" ");

    var numberOfLiterals = Number(terms[2]);
    var numberOfClauses = Number(terms[3]);
    var numberOfAssignments = _.size(assignments);

    var totalClauses = numberOfClauses + numberOfAssignments;

    self.numberOfLiterals = numberOfLiterals;
    self.numberOfClauses = totalClauses;

    return "p cnf " + numberOfLiterals + " " + totalClauses;
  };

  var replaceHeader = function (program, header) {
    var lines = program.split("\n");

    var problemSizeLine = _.detect(lines, function (line) {
      return line.match(/p cnf/);
    });

    var index = lines.indexOf(problemSizeLine);

    lines.splice(index, 1);
    lines.unshift(header);

    return lines.join("\n");
  };
};

Machine.run = function (program, assignments, count, callback) {
  return new Machine(MinisatAdapter).run(program, assignments, count, callback);
};

module.exports = Machine;

},{"./logger":41,"./machine/minisatAdapter":44,"./runtime/metadataExtractor":54,"underscore":58}],43:[function(require,module,exports){
"use strict";

var spawnSync = require("child_process").spawnSync;
var _ = require("underscore");

var LingelingAdapter = function (binary, dimacs) {
  var self = this;

  self.solve = function () {
    var lingeling = spawnSync(binary, {
      input: dimacs,
      encoding: "utf-8"
    });

    var output = lingeling.stdout;
    var errors = lingeling.stderr;

    if (!output) {
      var message = "The program 'lingeling' cannot be found in PATH.\n";
      message += "This is perfectly normal. Sentient doesn't ship with ";
      message += "Lingeling.\nYou can try to install it with:\n\n";
      message += installScript();
      message += "\n";

      throw new Error(message);
    }

    if (errors) {
      throw new Error("Lingeling wrote to stderr: " + errors);
    }

    var lines = output.split("\n");

    if (satisfiable(lines)) {
      return parseSolution(lines);
    }
    else {
      return [];
    }
  };

  var satisfiable = function (lines) {
    var satisfiableLine = _.detect(lines, function (line) {
      return line.match(/^s /);
    });

    if (!satisfiableLine) {
      var message = "Lingeling output did not contain satisfiability line";
      throw new Error(message);
    }

    return satisfiableLine === "s SATISFIABLE";
  };

  var parseSolution = function (lines) {
    var solutionLines = _.select(lines, function (line) {
      return line.match(/^v /);
    });

    var literals = [];

    _.each(solutionLines, function (line) {
      line = line.replace(/^v /, "");
      line = line.replace(/ 0$/, "");

      var terms = line.split(" ");
      _.each(terms, function (term) {
        var literal = Number(term);

        if (literal !== 0) {
          literals.push(literal);
        }
      });
    });

    return literals;
  };

  var installScript = function () {
    var lines = [
      "wget http://fmv.jku.at/lingeling/lingeling-bal-2293bef-151109.tar.gz",
      "tar xfz lingeling-bal-2293bef-151109.tar.gz",
      "pushd lingeling-bal-2293bef-151109 && ./configure.sh && make && popd",
      "cp lingeling-bal-2293bef-151109/lingeling /usr/local/bin/",
      "rm -rf lingeling-bal-2293bef-151109*"
    ];

    return lines.join(" &&\n");
  };
};

LingelingAdapter.solve = function (dimacs) {
  return new LingelingAdapter("lingeling", dimacs).solve();
};

module.exports = LingelingAdapter;

},{"child_process":2,"underscore":58}],44:[function(require,module,exports){
"use strict";

var _ = require("underscore");
var Minisat = require("../../../vendor/minisat.js");
var Logger = require("../logger");
var Module;

var MinisatAdapter = function (dimacs) {
  var self = this;
  var errors = [];
  var sixteenMeg =  16777216;
  var eightMeg = 8388608;

  self.setup = function (heapSize, stackSize) {
    Module = new Minisat({
      TOTAL_MEMORY: heapSize,
      TOTAL_STACK: stackSize,
      DEBUG: false
    });

    Module.heapSize = heapSize;
    Module.stackSize = stackSize;
  };

  self.solve = function () {
    return increaseMemoryOnError(function () {
      setMemoryHeuristic();
      captureErrors();
      var result = solve(dimacs);
      return parse(result);
    });
  };

  var captureErrors = function () {
    Module.printErr = function (error) {
      errors.push(error);
    };
  };

  var solve = function (dimacs) {
    var functionName = "solve_string";
    var parameterType = "string";
    var returnType = ["string", "int"];
    var parameters = [dimacs, dimacs.length];

    return Module.ccall(
      functionName,
      parameterType,
      returnType,
      parameters
    );
  };

  var parse = function (result) {
    if (_.any(errors)) {
      throw new Error(errors);
    } else if (result === "UNSAT") {
      return [];
    } else {
      result = result.replace("SAT ", "");
      result = result.split(" ");

      return _.map(result, function (literal) {
        return parseInt(literal, 10);
      });
    }
  };

  var setMemoryHeuristic = function () {
    if (Module) {
      return;
    }

    var numberOfLines = (dimacs.match(/\n/g) || []).length;

    var heapSize = sixteenMeg + numberOfLines * 300;
    var stackSize = eightMeg + numberOfLines * 100;

    heapSize = complyWithAsmSpec(heapSize);

    self.setup(heapSize, stackSize);
  };

  var warnAboutResize = function (heapSize, stackSize) {
    var heap = (heapSize / 1024 / 1024).toFixed(1);
    var stack = (stackSize / 1024 / 1024).toFixed(1);

    var message = "Resizing Minisat memory to ";
    message += heap + "MB heap, " + stack + "MB stack";

    Logger.info(message);
  };

  var increaseMemoryOnError = function (callback) {
    try {
      return callback();
    } catch (error) {
      var message = error.message || "";

      var heapSize = Module.heapSize;
      var stackSize = Module.stackSize;

      if (message.substring(0, 18) === "No heap space left") {
        Logger.debug("Minisat has run out of heap space");
        heapSize += sixteenMeg;
        stackSize += eightMeg;
      } else if (message.substring(0, 19) === "No stack space left") {
        Logger.debug("Minisat has run out of stack space");
        heapSize += sixteenMeg;
        stackSize += eightMeg;
      } else {
        throw error;
      }

      heapSize = complyWithAsmSpec(heapSize);
      warnAboutResize(heapSize, stackSize);

      Module = undefined;
      self.setup(heapSize, stackSize);

      return increaseMemoryOnError(callback);
    }
  };

  var complyWithAsmSpec = function (heapSize) {
    var size = 64 * 1024;

    while (size < heapSize) {
      if (size < 16 * 1024 * 1024) {
        size *= 2;
      } else {
        size += 16 * 1024 * 1024;
      }
    }

    return size;
  };
};

MinisatAdapter.setup = function (heapSize, stackSize) {
  return new MinisatAdapter().setup(heapSize, stackSize);
};

MinisatAdapter.solve = function (dimacs) {
  return new MinisatAdapter(dimacs).solve();
};

module.exports = MinisatAdapter;

},{"../../../vendor/minisat.js":60,"../logger":41,"underscore":58}],45:[function(require,module,exports){
(function (process){
"use strict";

var spawnSync = require("child_process").spawnSync;
var _ = require("underscore");

var RissAdapter = function (binary, dimacs) {
  var self = this;

  self.solve = function () {
    var riss = spawnSync(binary, {
      input: dimacs,
      encoding: "utf-8"
    });

    var output = riss.stdout;
    var errors = riss.stderr;

    if (!output) {
      var message = "The program 'riss' cannot be found in PATH.\n";
      message += "This is perfectly normal. Sentient doesn't ship with ";
      message += "Riss.\nYou can try to install it with:\n\n";
      message += installScript();
      message += "\n";

      throw new Error(message);
    }

    if (errors) {
      throw new Error("Riss wrote to stderr: " + errors);
    }

    var lines = output.split("\n");

    if (satisfiable(lines)) {
      return parseSolution(lines);
    }
    else {
      return [];
    }
  };

  var satisfiable = function (lines) {
    var satisfiableLine = _.detect(lines, function (line) {
      return line.match(/^s /);
    });

    if (!satisfiableLine) {
      var message = "Riss output did not contain satisfiability line";
      throw new Error(message);
    }

    return satisfiableLine === "s SATISFIABLE";
  };

  var parseSolution = function (lines) {
    var solutionLines = _.select(lines, function (line) {
      return line.match(/^v /);
    });

    var literals = [];

    _.each(solutionLines, function (line) {
      line = line.replace(/^v /, "");
      line = line.replace(/ 0$/, "");

      var terms = line.split(" ");
      _.each(terms, function (term) {
        var literal = Number(term);

        if (literal !== 0) {
          literals.push(literal);
        }
      });
    });

    return literals;
  };

  var installScript = function () {
    var lines = [
      "wget http://tools.computational-logic.org/content/riss/Riss.tar.gz",
      "tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427"
    ];

    if (process.platform === "darwin") {
      lines.push("wget https://git.io/vrQxX -O riss-427-mac-os-x.patch");
      lines.push("patch -p1 < riss-427-mac-os-x.patch");
    }

    lines = lines.concat([
      "make && make coprocessorRS && popd",
      "cp riss-427/riss /usr/local/bin/",
      "cp riss-427/coprocessor /usr/local/bin/",
      "rm -rf riss-427 Riss.tar.gz"
    ]);

    return lines.join(" &&\n");
  };
};

RissAdapter.solve = function (dimacs) {
  return new RissAdapter("riss", dimacs).solve();
};

module.exports = RissAdapter;

}).call(this,require('_process'))
},{"_process":5,"child_process":2,"underscore":58}],46:[function(require,module,exports){
"use strict";

var Optimiser = function (machineCode) {
  var self = this;

  var CoprocessorAdapter = require("./optimiser/coprocessorAdapter");

  self.optimise = function () {
    return CoprocessorAdapter.optimise(machineCode);
  };
};

Optimiser.optimise = function (machineCode) {
  return new Optimiser(machineCode).optimise();
};

module.exports = Optimiser;

},{"./optimiser/coprocessorAdapter":47}],47:[function(require,module,exports){
(function (process){
"use strict";

var MappingParser = require("./coprocessorAdapter/mappingParser");
var MetadataExtractor = require("../runtime/metadataExtractor");
var Logger = require("../logger");

var spawnSync = require("child_process").spawnSync;
var fs = require("fs");
var _ = require("underscore");

var CoprocessorAdapter = function (binary, machineCode) {
  var self = this;

  self.optimise = function () {
    var filenames = generateFilenames();

    var metadata = MetadataExtractor.extract(machineCode);
    writeWhitelist(metadata, filenames.whitelist);

    var args = generateArguments(filenames);
    var result;

    try {
      result = runCoprocessor(args, filenames);
    } catch (error) {
      deleteFiles(filenames);

      if (error.message.match(/ENOENT/)) {
        var message = "The program 'riss' cannot be found in PATH.\n";
        message += "This is perfectly normal. Sentient doesn't ship with ";
        message += "Riss.\nYou can try to install it with:\n\n";
        message += installScript();
        message += "\n";

        throw new Error(message);
      } else {
        throw error;
      }
    }

    deleteFiles(filenames);

    if (result.stderr) {
      Logger.info("Riss Coprocessor wrote to stderr: " + result.stderr);
    }

    if (result.stdout) {
      Logger.debug(result.stdout);
    }

    var mappings = MappingParser.parse(result.mappings);

    updateLiterals(metadata, mappings);

    var dimacs = updateDimacs(metadata, mappings, result.dimacs);

    return generateMachineCode(metadata, dimacs);
  };

  var generateFilenames = function () {
    var currentTime = new Date().getTime();

    return {
      dimacs: "/tmp/" + currentTime + ".dimacs",
      undo: "/tmp/" + currentTime + ".undo",
      undoMap: "/tmp/" + currentTime + ".undo.map",
      whitelist: "/tmp/" + currentTime + ".whitelist"
    };
  };

  var writeWhitelist = function (metadata, filename) {
    var level1Variables = metadata.level1Variables;
    var literals = _.values(level1Variables);
    var whitelist =  literals.join("\n") + "\n";

    fs.writeFileSync(filename, whitelist);
  };

  var generateArguments = function (filenames) {
    return [
      "-dimacs=" + filenames.dimacs,
      "-undo=" + filenames.undo,
      "-whiteList=" + filenames.whitelist,
      "-enabled_cp3",
      "-bve",
      "-dense",
      "-ee",
      "-hte",
      "-rate",
      "-subsimp",
      "-unhide",
      "-up"
    ];
  };

  var runCoprocessor = function (args, filenames) {
    var coprocessor = spawnSync(binary, args, {
      input: machineCode,
      encoding: "utf-8"
    });

    var dimacs = fs.readFileSync(filenames.dimacs, "utf8");
    var mappings = fs.readFileSync(filenames.undoMap, "utf8");

    return {
      stdout: coprocessor.stdout,
      stderr: coprocessor.stderr,
      dimacs: dimacs,
      mappings: mappings
    };
  };

  var deleteFiles = function (filenames) {
    try { fs.unlinkSync(filenames.dimacs); } catch (error) { }
    try { fs.unlinkSync(filenames.undo); } catch (error) { }
    try { fs.unlinkSync(filenames.undoMap); } catch (error) { }
    try { fs.unlinkSync(filenames.whitelist); } catch (error) { }
  };

  var updateLiterals = function (metadata, mappings) {
    var level1Variables = metadata.level1Variables;

    _.each(level1Variables, function (literal, name) {
      var mappedLiteral = mappings[literal];

      if (typeof mappedLiteral !== "undefined") {
        level1Variables[name] = mappedLiteral;
      }
    });
  };

  var updateDimacs = function (metadata, mappings, dimacs) {
    var level1Variables = metadata.level1Variables;
    var mappedLiterals = _.uniq(_.values(level1Variables));

    var endOfFirstLine = dimacs.indexOf("\n");
    var problemSize = dimacs.substring(0, endOfFirstLine);

    dimacs = dimacs.slice(endOfFirstLine);

    var addedClauses = 0;

    for (var i = 0; i < mappedLiterals.length; i += 1) {
      var mappedLiteral = mappedLiterals[i];
      var regex = new RegExp("\\b" + mappedLiteral + "\\b");
      var includesLiteral = dimacs.match(regex);

      if (!includesLiteral) {
        dimacs += mappedLiteral + " -" + mappedLiteral + " 0\n";
        addedClauses += 1;
      }
    }

    var terms = problemSize.split(" ");

    var numberOfLiterals = parseInt(terms[2], 10);
    var numberOfClauses = parseInt(terms[3], 10) + addedClauses;

    problemSize = "p cnf " + numberOfLiterals + " " + numberOfClauses;

    return problemSize + dimacs;
  };

  var generateMachineCode = function (metadata, dimacs) {
    var machineCode = "c Sentient Machine Code, Version 1.0\n";

    var json = JSON.stringify(metadata, null, 2);
    var lines = json.split("\n");

    _.each(lines, function (line) {
      machineCode += "c " + line + "\n";
    });

    return machineCode + dimacs;
  };

  var installScript = function () {
    var lines = [
      "wget http://tools.computational-logic.org/content/riss/Riss.tar.gz",
      "tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427"
    ];

    if (process.platform === "darwin") {
      lines.push("wget https://git.io/vrQxX -O riss-427-mac-os-x.patch");
      lines.push("patch -p1 < riss-427-mac-os-x.patch");
    }

    lines = lines.concat([
      "make && make coprocessorRS && popd",
      "cp riss-427/riss /usr/local/bin/",
      "cp riss-427/coprocessor /usr/local/bin/",
      "rm -rf riss-427 Riss.tar.gz"
    ]);

    return lines.join(" &&\n");
  };
};

CoprocessorAdapter.optimise = function (machineCode) {
  return new CoprocessorAdapter("coprocessor", machineCode).optimise();
};

module.exports = CoprocessorAdapter;

}).call(this,require('_process'))
},{"../logger":41,"../runtime/metadataExtractor":54,"./coprocessorAdapter/mappingParser":48,"_process":5,"child_process":2,"fs":2,"underscore":58}],48:[function(require,module,exports){
"use strict";

// This parser reads undo.map files generated by the Riss coprocessor. All of
// the mappings can be derived from the second line in the file. Here is a brief
// explanation of how the mappings work.
//
// To begin with, it is important to note that the number at index N relates to
// literal N-1 in the original (unsimplified) DIMACS file. If the number is '1',
// it means that the literal didn't appear in the original problem. For example,
// the string '2 4 5 1 0' refers to literals 1, 3 and 4, respectively. The '0'
// is simply a terminal symbol, used for parsing.
//
// To figure out the mappings for each literal, you need only count the index of
// the number on that line and add one. For the same example of '2 4 5 1 0',
// here are the mappings:
//
// original => simplified
// ----------------------
//    1     =>     1
//    3     =>     2
//    4     =>     3
//
// In cases where a literal in the original problem maps onto the same literal
// in the simplified problem, those mappings are excluded from the result.

var MappingParser = function (mappings) {
  var self = this;

  self.parse = function () {
    var lines = mappings.split("\n");
    var secondLine = lines[1];

    if (typeof secondLine === "undefined") {
      return {};
    } else {
      secondLine = secondLine.trim();
    }

    var numbers = secondLine.split(" ");
    var lookup = {};

    for (var i = 0; i < numbers.length; i += 1) {
      var n = parseInt(numbers[i], 10);

      if (n <= 1) {
        break;
      }

      var originalLiteral = n - 1;
      var simplifiedLiteral = i + 1;

      if (originalLiteral !== simplifiedLiteral) {
        lookup[originalLiteral] = simplifiedLiteral;
      }
    }

    return lookup;
  };
};

MappingParser.parse = function (mappings) {
  return new MappingParser(mappings).parse();
};

module.exports = MappingParser;

},{}],49:[function(require,module,exports){
"use strict";

var Level4Runtime = require("./runtime/level4Runtime");
var Level3Runtime = require("./runtime/level3Runtime");
var Level2Runtime = require("./runtime/level2Runtime");
var Level1Runtime = require("./runtime/level1Runtime");

var Machine = require("./machine");
var MinisatAdapter = require("./machine/minisatAdapter");
var Logger = require("./logger");

var Runtime = function (program, assignments, count, callback, adapter) {
  var self = this;

  self.run = function () {
    if (typeof callback === "undefined") {
      return run();
    } else {
      return setTimeout(run, 0);
    }
  };

  var run = function () {
    Logger.info("Running program...");

    Logger.debug("Encoding level 4 assignments");
    assignments = Level4Runtime.encode(program, assignments);

    Logger.debug("Encoding level 3 assignments");
    assignments = Level3Runtime.encode(program, assignments);

    Logger.debug("Encoding level 2 assignments");
    assignments = Level2Runtime.encode(program, assignments);

    Logger.debug("Encoding level 1 assignments");
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(adapter || MinisatAdapter);

    if (typeof callback === "undefined") {
      var results = machine.run(program, assignments, count);
      results = decodeResults(results);
      Logger.debug("Finished decoding results");
      return results;
    } else {
      return machine.run(program, assignments, count, function (result) {
        result = decodeResult(result);
        Logger.debug("Passing result to callback");
        callback(result);
      });
    }
  };

  var decodeResults = function (results) {
    var decodedResults = [];

    for (var i = 0; i < results.length; i += 1) {
      decodedResults.push(decodeResult(results[i]));
    }

    return decodedResults;
  };

  var decodeResult = function (result) {
    Logger.debug("Decoding level 1 result");
    result = Level1Runtime.decode(program, result);

    Logger.debug("Decoding level 2 result");
    result = Level2Runtime.decode(program, result);

    Logger.debug("Decoding level 3 result");
    result = Level3Runtime.decode(program, result);

    Logger.debug("Decoding level 4 result");
    result = Level4Runtime.decode(program, result);

    return result;
  };
};

Runtime.run = function (program, assignments, count, callback, adapter) {
  return new Runtime(program, assignments, count, callback, adapter).run();
};

module.exports = Runtime;

},{"./logger":41,"./machine":42,"./machine/minisatAdapter":44,"./runtime/level1Runtime":50,"./runtime/level2Runtime":51,"./runtime/level3Runtime":52,"./runtime/level4Runtime":53}],50:[function(require,module,exports){
"use strict";

var MetadataExtractor = require("./metadataExtractor");
var _ = require("underscore");

var Level1Runtime = function (program) {
  var self = this;
  var metadata = MetadataExtractor.extract(program);
  var variables = metadata.level1Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      if (!_.has(variables, key)) {
        var message = "Could not encode '" + key + "'";
        message += " because it does not appear in the program metadata";

        throw new Error(message);
      }

      key = Number(variables[key]);
      object[key] = value;
    });

    return object;
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    _.each(variables, function (value, key) {
      value = results[value];

      if (value === undefined) {
        var message = "Could not decode '" + key + "'";
        message += " because it does not appear in the solution results";

        throw new Error(message);
      }

      object[key] = value;
    });

    return object;
  };
};

Level1Runtime.encode = function (program, assignments) {
  return new Level1Runtime(program).encode(assignments);
};

Level1Runtime.decode = function (program, results) {
  return new Level1Runtime(program).decode(results);
};

module.exports = Level1Runtime;

},{"./metadataExtractor":54,"underscore":58}],51:[function(require,module,exports){
/*jshint maxcomplexity:7 */

"use strict";

var MetadataExtractor = require("./metadataExtractor");
var TwosComplement = require("../compiler/level2Compiler/twosComplement");
var _ = require("underscore");

var Level2Runtime = function (program) {
  var self = this;
  var metadata = MetadataExtractor.extract(program);
  var variables = metadata.level2Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      if (!_.has(variables, key)) {
        var message = "Could not encode '" + key + "'";
        message += " because it does not appear in the program metadata";

        throw new Error(message);
      }

      var expectedType = variables[key].type;
      var actualType = typeName(value);

      if (expectedType !== actualType) {
        throw new Error("Expected " + expectedType + " for " + key);
      }

      var symbols = variables[key].symbols;

      if (actualType === "boolean") {
        object[symbols[0]] = value;
      } else if (actualType === "integer") {
        var bitArray = TwosComplement.encode(value);
        var max = symbols.length;

        if (bitArray.length > max) {
          var msg = "The value '" + value + "' for '" + key + "'";
          msg += " requires " + bitArray.length + " bits, but the compiled";
          msg += " program only supports a maximum of " + max + " bits";

          throw new Error(msg);
        }

        var padded = TwosComplement.pad(bitArray, symbols);

        for (var i = 0; i < symbols.length; i += 1) {
          object[symbols[i]] = padded.leftSymbols[i];
        }
      }
    });

    return object;
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    _.each(variables, function (variable, key) {
      var type = variable.type;
      var symbols = variable.symbols;

      var values = _.map(symbols, function (s) {
        var value = results[s];

        if (value === undefined) {
          var message = "Could not decode '" + key + "'";
          message += " because it is missing from the result";

          throw new Error(message);
        }

        return value;
      });

      if (type === "boolean") {
        object[key] = values[0];
      } else if (type === "integer") {
        object[key] = TwosComplement.decode(values);
      }
    });

    return object;
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else {
      throw new Error("Unknown type '" + t + "'");
    }
  };
};

Level2Runtime.encode = function (program, assignments) {
  return new Level2Runtime(program).encode(assignments);
};

Level2Runtime.decode = function (program, results) {
  return new Level2Runtime(program).decode(results);
};

module.exports = Level2Runtime;

},{"../compiler/level2Compiler/twosComplement":22,"./metadataExtractor":54,"underscore":58}],52:[function(require,module,exports){
/*jshint maxcomplexity:7 */

"use strict";

var MetadataExtractor = require("./metadataExtractor");
var _ = require("underscore");

var Level3Runtime = function (program) {
  var self = this;
  var metadata = MetadataExtractor.extract(program);
  var variables = metadata.level3Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      encodeOne(key, value, object);
    });

    return object;
  };

  /*jshint maxcomplexity:12 */
  var encodeOne = function (key, value, object, allowSupporting) {
    var message;

    if (!_.has(variables, key)) {
      message = "Could not encode '" + key + "'";
      message += " because it does not appear in the program metadata";

      throw new Error(message);
    }

    var specifiedType = variables[key].type;
    var actualType = typeName(value);
    var nilDecider = variables[key].nilDecider;

    if (!typeIsAllowed(specifiedType, actualType, nilDecider)) {
      message = "Expected an object of type '" + specifiedType;
      message += "' for key '" + key + "' but got '" + actualType + "'";
      throw new Error(message);
    }

    if (variables[key].supporting && !allowSupporting) {
      throw new Error(key + " is a supporting variable");
    }

    var symbols = variables[key].symbols;

    if (nilDecider && actualType === "null") {
      encodeOne(nilDecider, true, object, true);
      return;
    } else if (nilDecider && actualType !== "null") {
      encodeOne(nilDecider, false, object, true);
    }

    if (nilDecider) {
      encodeOne(nilDecider, actualType === "null", object, true);
    }

    if (specifiedType === "boolean" || specifiedType === "integer") {
      assignOnce(symbols[0], value, object);
    } else if (specifiedType === "array") {
      encodeArray(symbols, value, actualType, key, object);
    }
  };

  var encodeArray = function (keys, values, actualType, key, object) {
    values = padWithNulls(keys, values);

    if (actualType === "array" && _.size(keys) !== _.size(values)) {
      var message = "Size mismatch when assinging values to '" + key + "'.";
      message += " Either set trailing elements to 'undefined'";
      message += " or use the object syntax.";

      throw new Error(message);
    }

    _.each(values, function (value, index) {
      if (value !== undefined) {
        var key = keys[index];
        encodeOne(key, value, object, true);
      }
    });
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    decodePrimitives(results, object);
    nullifyValues(object);
    decodeArrays(object);
    removeNullsFromArrays(object);
    removeSupporting(object);

    return object;
  };

  var decodePrimitives = function (results, object) {
    _.each(variables, function (variable, key) {
      if (variable.type === "boolean" || variable.type === "integer") {
        decodePrimitive(key, variable, results, object);
      }
    });
  };

  var decodePrimitive = function (key, variable, results, object) {
    var type = variable.type;
    var symbols = variable.symbols;

    var values = _.map(symbols, function (s) {
      var value = results[s];

      if (value === undefined) {
        var message = "Could not decode '" + key + "'";
        message += " because '" + s + "' is missing from the result";

        throw new Error(message);
      }

      return value;
    });

    if (type === "boolean" || type === "integer") {
      assignOnce(key, values[0], object);
    }
  };

  var decodeArrays = function (object) {
    _.each(variables, function (variable, key) {
      if (variable.type === "array") {
        decodeArray(variable, key, object);
      }
    });
  };

  var decodeArray = function (variable, key, object) {
    var array = _.map(variable.symbols, function (symbol) {
      return decodeElement(symbol, object);
    });

    if (object[key] !== null) {
      assignOnce(key, array, object);
    }
  };

  var decodeElement = function (symbol, object) {
    var variable = variables[symbol];

    if (variable.type === "array") {
      decodeArray(variable, symbol, object);
    }

    return object[symbol];
  };

  var assignOnce = function (key, value, object) {
    var assignedValue = object[key];
    var equalValues = _.isEqual(value, assignedValue);

    if (typeof assignedValue !== "undefined" && !equalValues) {
      var message = "The key '" + key + "' has conflicting assignments.";
      message += " It has been set to '" + assignedValue + "'";
      message += " and is now being set to '" + value + "'";

      throw new Error(message);
    } else {
      object[key] = value;
    }
  };

  var nullifyValues = function (object) {
    _.each(variables, function (variable, key) {
      var nilDecider = variable.nilDecider;

      if (nilDecider) {
        var isNil = object[nilDecider];

        if (typeof isNil === "undefined") {
          var message = "Could not decode '" + key + "' because";
          message += " the nilDecider '" + nilDecider + "' is missing";

          throw new Error(message);
        }

        if (isNil) {
          object[key] = null;
        }
      }
    });
  };

  var removeNullsFromArrays = function (object) {
    _.each(object, function (value, key) {
      if (typeName(value) === "array") {
        object[key] = removeNullsFromArray(value);
      }
    });
  };

  var removeNullsFromArray = function (array) {
    var arrayCopy = _.map(array, function (element) {
      if (typeName(element) === "array") {
        return removeNullsFromArray(element);
      } else {
        return element;
      }
    });

    return _.without(arrayCopy, null);
  };

  var removeSupporting = function (object) {
    _.each(variables, function (variable, key) {
      if (variable.supporting) {
        delete object[key];
      }
    });
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else if (value && value.constructor === Array) {
      return "array";
    } else if (value === null) {
      return "null";
    } else if (t === "object") {
      return "object";
    } else {
      throw new Error("Unknown type '" + t + "'");
    }
  };

  var typeIsAllowed = function (specifiedType, actualType, nilDecider) {
    if (specifiedType === actualType) {
      return true;
    } else if (specifiedType === "array" && actualType === "object") {
      return true;
    } else if (actualType === "null" && nilDecider) {
      return true;
    } else {
      return false;
    }
  };

  var padWithNulls = function (keys, values) {
    var valuesType = typeName(values);
    var valuesToPad;

    if (valuesType === "array") {
      valuesToPad = values.slice(0);
    } else {
      valuesToPad = _.clone(values);
    }

    _.each(keys, function (key, index) {
      var value = values[index];

      if (value) {
        return;
      }

      var variable = variables[key];

      if (variable.nilDecider && valuesType === "array") {
        valuesToPad.push(null);
      } else if (variable.nilDecider && valuesType !== "array") {
        valuesToPad[index] = null;
      }
    });

    return valuesToPad;
  };
};

Level3Runtime.encode = function (program, assignments) {
  return new Level3Runtime(program).encode(assignments);
};

Level3Runtime.decode = function (program, results) {
  return new Level3Runtime(program).decode(results);
};

module.exports = Level3Runtime;

},{"./metadataExtractor":54,"underscore":58}],53:[function(require,module,exports){
"use strict";

module.exports.encode = function (program, assignments) {
  return assignments;
};

module.exports.decode = function (program, results) {
  return results;
};

},{}],54:[function(require,module,exports){
"use strict";

var _ = require("underscore");

var MetadataExtractor = function (program) {
  var self = this;

  self.extract = function () {
    var metadataLines = extractMetadataLines();
    return parseMetadata(metadataLines);
  };

  var extractMetadataLines = function () {
    var lines = program.trim().split("\n");

    var startCapturingMetadata = false;
    var metadataLines = [];

    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i].trim();

      if (startCapturingMetadata) {
        if (line === "c }") {
          startCapturingMetadata = false;
          break;
        }

        metadataLines.push(line);
      }
      else {
        if (line === "c {") {
          startCapturingMetadata = true;
        }
      }
    }

    if (startCapturingMetadata) {
      var message = "Could not find the end of the metadata";
      throw new Error(message);
    }

    return metadataLines;
  };

  var parseMetadata = function (lines) {
    var json = "";

    lines = _.map(lines, function (line) {
      json += line.replace(/^c/, "");
    });

    json = "{" + json + "}";

    return JSON.parse(json);
  };
};

MetadataExtractor.extract = function (program) {
  return new MetadataExtractor(program).extract();
};

module.exports = MetadataExtractor;

},{"underscore":58}],55:[function(require,module,exports){
"use strict";

var Wrapper = function (name, program) {
  var self = this;

  self.wrap = function () {
    program = program.replace(/\n/g, "\\n");

    var wrappedProgram = "(function () {                                     \n\
        'use strict';                                                        \n\
                                                                             \n\
        var name = '" + name + "';                                           \n\
        var program = '" + program + "';                                     \n\
                                                                             \n\
        if (typeof window !== 'undefined') {                                 \n\
          window.Sentient = window.Sentient || {};                           \n\
          window.Sentient.programs = window.Sentient.programs || {};         \n\
          window.Sentient.programs[name] = program;                          \n\
        }                                                                    \n\
                                                                             \n\
        if (typeof module !== 'undefined' && module.exports) {               \n\
          module.exports[name] = program;                                    \n\
        }                                                                    \n\
      })();                                                                  \n\
    ";

    wrappedProgram = wrappedProgram.replace(/      /g, "");
    wrappedProgram = wrappedProgram.replace(/ +$/gm, "");

    return wrappedProgram;
  };
};

Wrapper.wrap = function (name, program) {
  return new Wrapper(name, program).wrap();
};

module.exports = Wrapper;

},{}],56:[function(require,module,exports){
(function (process){
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var spawn = require('child_process').spawn;
var readlink = require('graceful-readlink').readlinkSync;
var path = require('path');
var dirname = path.dirname;
var basename = path.basename;
var fs = require('fs');

/**
 * Expose the root command.
 */

exports = module.exports = new Command();

/**
 * Expose `Command`.
 */

exports.Command = Command;

/**
 * Expose `Option`.
 */

exports.Option = Option;

/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

function Option(flags, description) {
  this.flags = flags;
  this.required = ~flags.indexOf('<');
  this.optional = ~flags.indexOf('[');
  this.bool = !~flags.indexOf('-no-');
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

Option.prototype.name = function() {
  return this.long
    .replace('--', '')
    .replace('no-', '');
};

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

Option.prototype.is = function(arg) {
  return arg == this.short || arg == this.long;
};

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

function Command(name) {
  this.commands = [];
  this.options = [];
  this._execs = {};
  this._allowUnknownOption = false;
  this._args = [];
  this._name = name || '';
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Command.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function() {
 *          console.log('setup');
 *        });
 *
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd) {
 *          console.log('exec "%s"', cmd);
 *        });
 *
 *      program
 *        .command('teardown <dir> [otherDirs...]')
 *        .description('run teardown commands')
 *        .action(function(dir, otherDirs) {
 *          console.log('dir "%s"', dir);
 *          if (otherDirs) {
 *            otherDirs.forEach(function (oDir) {
 *              console.log('dir "%s"', oDir);
 *            });
 *          }
 *        });
 *
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env) {
 *          console.log('deploying "%s"', env);
 *        });
 *
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc] for git-style sub-commands
 * @return {Command} the new command
 * @api public
 */

Command.prototype.command = function(name, desc, opts) {
  opts = opts || {};
  var args = name.split(/ +/);
  var cmd = new Command(args.shift());

  if (desc) {
    cmd.description(desc);
    this.executables = true;
    this._execs[cmd._name] = true;
    if (opts.isDefault) this.defaultExecutable = cmd._name;
  }

  cmd._noHelp = !!opts.noHelp;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;

  if (desc) return this;
  return cmd;
};

/**
 * Define argument syntax for the top-level command.
 *
 * @api public
 */

Command.prototype.arguments = function (desc) {
  return this.parseExpectedArgs(desc.split(/ +/));
};

/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

Command.prototype.addImplicitHelpCommand = function() {
  this.command('help [cmd]', 'display help for [cmd]');
};

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parseExpectedArgs = function(args) {
  if (!args.length) return;
  var self = this;
  args.forEach(function(arg) {
    var argDetails = {
      required: false,
      name: '',
      variadic: false
    };

    switch (arg[0]) {
      case '<':
        argDetails.required = true;
        argDetails.name = arg.slice(1, -1);
        break;
      case '[':
        argDetails.name = arg.slice(1, -1);
        break;
    }

    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
      argDetails.variadic = true;
      argDetails.name = argDetails.name.slice(0, -3);
    }
    if (argDetails.name) {
      self._args.push(argDetails);
    }
  });
  return this;
};

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function() {
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.action = function(fn) {
  var self = this;
  var listener = function(args, unknown) {
    // Parse any so-far unknown options
    args = args || [];
    unknown = unknown || [];

    var parsed = self.parseOptions(unknown);

    // Output help if necessary
    outputHelpIfNecessary(self, parsed.unknown);

    // If there are still any unknown options, then we simply
    // die, unless someone asked for help, in which case we give it
    // to them, and then we die.
    if (parsed.unknown.length > 0) {
      self.unknownOption(parsed.unknown[0]);
    }

    // Leftover arguments need to be pushed back. Fixes issue #56
    if (parsed.args.length) args = parsed.args.concat(args);

    self._args.forEach(function(arg, i) {
      if (arg.required && null == args[i]) {
        self.missingArgument(arg.name);
      } else if (arg.variadic) {
        if (i !== self._args.length - 1) {
          self.variadicArgNotLast(arg.name);
        }

        args[i] = args.splice(i);
      }
    });

    // Always append ourselves to the end of the arguments,
    // to make sure we match the number of arguments the user
    // expects
    if (self._args.length) {
      args[self._args.length] = self;
    } else {
      args.push(self);
    }

    fn.apply(self, args);
  };
  var parent = this.parent || this;
  var name = parent === this ? '*' : this._name;
  parent.on(name, listener);
  if (this._alias) parent.on(this._alias, listener);
  return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`.
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to true
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => false
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|Mixed} fn or default
 * @param {Mixed} defaultValue
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.option = function(flags, description, fn, defaultValue) {
  var self = this
    , option = new Option(flags, description)
    , oname = option.name()
    , name = camelcase(oname);

  // default as 3rd arg
  if (typeof fn != 'function') {
    if (fn instanceof RegExp) {
      var regex = fn;
      fn = function(val, def) {
        var m = regex.exec(val);
        return m ? m[0] : def;
      }
    }
    else {
      defaultValue = fn;
      fn = null;
    }
  }

  // preassign default value only for --no-*, [optional], or <required>
  if (false == option.bool || option.optional || option.required) {
    // when --no-* we make sure default is true
    if (false == option.bool) defaultValue = true;
    // preassign only if we have a default
    if (undefined !== defaultValue) self[name] = defaultValue;
  }

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on(oname, function(val) {
    // coercion
    if (null !== val && fn) val = fn(val, undefined === self[name]
      ? defaultValue
      : self[name]);

    // unassigned or bool
    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
      // if no value, bool true, and we have a default, then use it!
      if (null == val) {
        self[name] = option.bool
          ? defaultValue || true
          : false;
      } else {
        self[name] = val;
      }
    } else if (null !== val) {
      // reassign
      self[name] = val;
    }
  });

  return this;
};

/**
 * Allow unknown options on the command line.
 *
 * @param {Boolean} arg if `true` or omitted, no error will be thrown
 * for unknown options.
 * @api public
 */
Command.prototype.allowUnknownOption = function(arg) {
    this._allowUnknownOption = arguments.length === 0 || arg;
    return this;
};

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parse = function(argv) {
  // implicit help
  if (this.executables) this.addImplicitHelpCommand();

  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name || basename(argv[1], '.js');

  // github-style sub-commands with no sub-command
  if (this.executables && argv.length < 3 && !this.defaultExecutable) {
    // this user needs help
    argv.push('--help');
  }

  // process argv
  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
  var args = this.args = parsed.args;

  var result = this.parseArgs(this.args, parsed.unknown);

  // executable sub-commands
  var name = result.args[0];
  if (this._execs[name] && typeof this._execs[name] != "function") {
    return this.executeSubCommand(argv, args, parsed.unknown);
  } else if (this.defaultExecutable) {
    // use the default subcommand
    args.unshift(name = this.defaultExecutable);
    return this.executeSubCommand(argv, args, parsed.unknown);
  }

  return result;
};

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

Command.prototype.executeSubCommand = function(argv, args, unknown) {
  args = args.concat(unknown);

  if (!args.length) this.help();
  if ('help' == args[0] && 1 == args.length) this.help();

  // <cmd> --help
  if ('help' == args[0]) {
    args[0] = args[1];
    args[1] = '--help';
  }

  // executable
  var f = argv[1];
  // name of the subcommand, link `pm-install`
  var bin = basename(f, '.js') + '-' + args[0];


  // In case of globally installed, get the base dir where executable
  //  subcommand file should be located at
  var baseDir
    , link = readlink(f);

  // when symbolink is relative path
  if (link !== f && link.charAt(0) !== '/') {
    link = path.join(dirname(f), link)
  }
  baseDir = dirname(link);

  // prefer local `./<bin>` to bin in the $PATH
  var localBin = path.join(baseDir, bin);

  // whether bin file is a js script with explicit `.js` extension
  var isExplicitJS = false;
  if (exists(localBin + '.js')) {
    bin = localBin + '.js';
    isExplicitJS = true;
  } else if (exists(localBin)) {
    bin = localBin;
  }

  args = args.slice(1);

  var proc;
  if (process.platform !== 'win32') {
    if (isExplicitJS) {
      args.unshift(localBin);
      // add executable arguments to spawn
      args = (process.execArgv || []).concat(args);

      proc = spawn('node', args, { stdio: 'inherit', customFds: [0, 1, 2] });
    } else {
      proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
    }
  } else {
    args.unshift(localBin);
    proc = spawn(process.execPath, args, { stdio: 'inherit'});
  }

  proc.on('close', process.exit.bind(process));
  proc.on('error', function(err) {
    if (err.code == "ENOENT") {
      console.error('\n  %s(1) does not exist, try --help\n', bin);
    } else if (err.code == "EACCES") {
      console.error('\n  %s(1) not executable. try chmod or run with root\n', bin);
    }
    process.exit(1);
  });

  // Store the reference to the child process
  this.runningCommand = proc;
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

Command.prototype.normalize = function(args) {
  var ret = []
    , arg
    , lastOpt
    , index;

  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    if (i > 0) {
      lastOpt = this.optionFor(args[i-1]);
    }

    if (arg === '--') {
      // Honor option terminator
      ret = ret.concat(args.slice(i));
      break;
    } else if (lastOpt && lastOpt.required) {
      ret.push(arg);
    } else if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
      arg.slice(1).split('').forEach(function(c) {
        ret.push('-' + c);
      });
    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
      ret.push(arg.slice(0, index), arg.slice(index + 1));
    } else {
      ret.push(arg);
    }
  }

  return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

Command.prototype.parseArgs = function(args, unknown) {
  var name;

  if (args.length) {
    name = args[0];
    if (this.listeners(name).length) {
      this.emit(args.shift(), args, unknown);
    } else {
      this.emit('*', args);
    }
  } else {
    outputHelpIfNecessary(this, unknown);

    // If there were no args and we have unknown options,
    // then they are extraneous and we need to error.
    if (unknown.length > 0) {
      this.unknownOption(unknown[0]);
    }
  }

  return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

Command.prototype.optionFor = function(arg) {
  for (var i = 0, len = this.options.length; i < len; ++i) {
    if (this.options[i].is(arg)) {
      return this.options[i];
    }
  }
};

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

Command.prototype.parseOptions = function(argv) {
  var args = []
    , len = argv.length
    , literal
    , option
    , arg;

  var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
    arg = argv[i];

    // literal args after --
    if ('--' == arg) {
      literal = true;
      continue;
    }

    if (literal) {
      args.push(arg);
      continue;
    }

    // find matching Option
    option = this.optionFor(arg);

    // option is defined
    if (option) {
      // requires arg
      if (option.required) {
        arg = argv[++i];
        if (null == arg) return this.optionMissingArgument(option);
        this.emit(option.name(), arg);
      // optional arg
      } else if (option.optional) {
        arg = argv[i+1];
        if (null == arg || ('-' == arg[0] && '-' != arg)) {
          arg = null;
        } else {
          ++i;
        }
        this.emit(option.name(), arg);
      // bool
      } else {
        this.emit(option.name());
      }
      continue;
    }

    // looks like an option
    if (arg.length > 1 && '-' == arg[0]) {
      unknownOptions.push(arg);

      // If the next argument looks like it might be
      // an argument for this option, we pass it on.
      // If it isn't, then it'll simply be ignored
      if (argv[i+1] && '-' != argv[i+1][0]) {
        unknownOptions.push(argv[++i]);
      }
      continue;
    }

    // arg
    args.push(arg);
  }

  return { args: args, unknown: unknownOptions };
};

/**
 * Return an object containing options as key-value pairs
 *
 * @return {Object}
 * @api public
 */
Command.prototype.opts = function() {
  var result = {}
    , len = this.options.length;

  for (var i = 0 ; i < len; i++) {
    var key = camelcase(this.options[i].name());
    result[key] = key === 'version' ? this._version : this[key];
  }
  return result;
};

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.missingArgument = function(name) {
  console.error();
  console.error("  error: missing required argument `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

Command.prototype.optionMissingArgument = function(option, flag) {
  console.error();
  if (flag) {
    console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
  } else {
    console.error("  error: option `%s' argument missing", option.flags);
  }
  console.error();
  process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

Command.prototype.unknownOption = function(flag) {
  if (this._allowUnknownOption) return;
  console.error();
  console.error("  error: unknown option `%s'", flag);
  console.error();
  process.exit(1);
};

/**
 * Variadic argument with `name` is not the last argument as required.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.variadicArgNotLast = function(name) {
  console.error();
  console.error("  error: variadic arguments must be last `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} flags
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.version = function(str, flags) {
  if (0 == arguments.length) return this._version;
  this._version = str;
  flags = flags || '-V, --version';
  this.option(flags, 'output the version number');
  this.on('version', function() {
    process.stdout.write(str + '\n');
    process.exit(0);
  });
  return this;
};

/**
 * Set the description to `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.description = function(str) {
  if (0 === arguments.length) return this._description;
  this._description = str;
  return this;
};

/**
 * Set an alias for the command
 *
 * @param {String} alias
 * @return {String|Command}
 * @api public
 */

Command.prototype.alias = function(alias) {
  if (0 == arguments.length) return this._alias;
  this._alias = alias;
  return this;
};

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.usage = function(str) {
  var args = this._args.map(function(arg) {
    return humanReadableArgName(arg);
  });

  var usage = '[options]'
    + (this.commands.length ? ' [command]' : '')
    + (this._args.length ? ' ' + args.join(' ') : '');

  if (0 == arguments.length) return this._usage || usage;
  this._usage = str;

  return this;
};

/**
 * Get the name of the command
 *
 * @param {String} name
 * @return {String|Command}
 * @api public
 */

Command.prototype.name = function() {
  return this._name;
};

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestOptionLength = function() {
  return this.options.reduce(function(max, option) {
    return Math.max(max, option.flags.length);
  }, 0);
};

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

Command.prototype.optionHelp = function() {
  var width = this.largestOptionLength();

  // Prepend the help information
  return [pad('-h, --help', width) + '  ' + 'output usage information']
      .concat(this.options.map(function(option) {
        return pad(option.flags, width) + '  ' + option.description;
      }))
      .join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.commandHelp = function() {
  if (!this.commands.length) return '';

  var commands = this.commands.filter(function(cmd) {
    return !cmd._noHelp;
  }).map(function(cmd) {
    var args = cmd._args.map(function(arg) {
      return humanReadableArgName(arg);
    }).join(' ');

    return [
      cmd._name
        + (cmd._alias ? '|' + cmd._alias : '')
        + (cmd.options.length ? ' [options]' : '')
        + ' ' + args
      , cmd.description()
    ];
  });

  var width = commands.reduce(function(max, command) {
    return Math.max(max, command[0].length);
  }, 0);

  return [
    ''
    , '  Commands:'
    , ''
    , commands.map(function(cmd) {
      var desc = cmd[1] ? '  ' + cmd[1] : '';
      return pad(cmd[0], width) + desc;
    }).join('\n').replace(/^/gm, '    ')
    , ''
  ].join('\n');
};

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.helpInformation = function() {
  var desc = [];
  if (this._description) {
    desc = [
      '  ' + this._description
      , ''
    ];
  }

  var cmdName = this._name;
  if (this._alias) {
    cmdName = cmdName + '|' + this._alias;
  }
  var usage = [
    ''
    ,'  Usage: ' + cmdName + ' ' + this.usage()
    , ''
  ];

  var cmds = [];
  var commandHelp = this.commandHelp();
  if (commandHelp) cmds = [commandHelp];

  var options = [
    '  Options:'
    , ''
    , '' + this.optionHelp().replace(/^/gm, '    ')
    , ''
    , ''
  ];

  return usage
    .concat(cmds)
    .concat(desc)
    .concat(options)
    .join('\n');
};

/**
 * Output help information for this command
 *
 * @api public
 */

Command.prototype.outputHelp = function(cb) {
  if (!cb) {
    cb = function(passthru) {
      return passthru;
    }
  }
  process.stdout.write(cb(this.helpInformation()));
  this.emit('--help');
};

/**
 * Output help information and exit.
 *
 * @api public
 */

Command.prototype.help = function(cb) {
  this.outputHelp(cb);
  process.exit();
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word) {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function outputHelpIfNecessary(cmd, options) {
  options = options || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i] == '--help' || options[i] == '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

function humanReadableArgName(arg) {
  var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']'
}

// for versions before node v0.8 when there weren't `fs.existsSync`
function exists(file) {
  try {
    if (fs.statSync(file).isFile()) {
      return true;
    }
  } catch (e) {
    return false;
  }
}


}).call(this,require('_process'))
},{"_process":5,"child_process":2,"events":3,"fs":2,"graceful-readlink":57,"path":4}],57:[function(require,module,exports){
var fs = require('fs')
  , lstat = fs.lstatSync;

exports.readlinkSync = function (p) {
  if (lstat(p).isSymbolicLink()) {
    return fs.readlinkSync(p);
  } else {
    return p;
  }
};



},{"fs":2}],58:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],59:[function(require,module,exports){
module.exports={
  "name": "sentient-lang",
  "version": "0.0.0-alpha.27",
  "description": "Sentient Language Compiler and Runtime",
  "homepage": "http://sentient-lang.org",
  "author": {
    "name": "Chris Patuzzo",
    "email": "chris@patuzzo.co.uk"
  },
  "license": "MIT",
  "files": [
    "lib",
    "sentient",
    "vendor"
  ],
  "main": "./lib/main.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/sentient-lang/sentient-lang.git"
  },
  "bin": {
    "sentient": "sentient"
  },
  "devDependencies": {
    "jasmine": "^2.4.1",
    "jshint": "^2.9.2",
    "browserify": "^13.0.1",
    "uglify-js": "^2.6.2",
    "pegjs": "^0.9.0"
  },
  "dependencies": {
    "underscore": "^1.8.3",
    "commander": "^2.9.0"
  },
  "gitHead": "5897d844e946502bb55916bab9452b6b108bb42a",
  "bugs": {
    "url": "https://github.com/sentient-lang/sentient-lang/issues"
  },
  "_id": "sentient-lang@0.0.0-alpha.27",
  "scripts": {},
  "_shasum": "306ade78bdc87a0a2b4a12be071105d7d82229fe",
  "_from": "sentient-lang@0.0.0-alpha.27",
  "_npmVersion": "3.5.3",
  "_nodeVersion": "5.5.0",
  "_npmUser": {
    "name": "cpatuzzo",
    "email": "chris@patuzzo.co.uk"
  },
  "dist": {
    "shasum": "306ade78bdc87a0a2b4a12be071105d7d82229fe",
    "tarball": "https://registry.npmjs.org/sentient-lang/-/sentient-lang-0.0.0-alpha.27.tgz"
  },
  "maintainers": [
    {
      "name": "cpatuzzo",
      "email": "chris@patuzzo.co.uk"
    }
  ],
  "_npmOperationalInternal": {
    "host": "packages-16-east.internal.npmjs.com",
    "tmp": "tmp/sentient-lang-0.0.0-alpha.27.tgz_1465762002426_0.40996361803263426"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/sentient-lang/-/sentient-lang-0.0.0-alpha.27.tgz"
}

},{}],60:[function(require,module,exports){
(function (process,__dirname){
module.exports = function (options) {
if (options.DEBUG) { console.log("INITIALIZING: " + JSON.stringify(options)); }
Module = options;
var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;if(Module["ENVIRONMENT"]){if(Module["ENVIRONMENT"]==="WEB"){ENVIRONMENT_IS_WEB=true}else if(Module["ENVIRONMENT"]==="WORKER"){ENVIRONMENT_IS_WORKER=true}else if(Module["ENVIRONMENT"]==="NODE"){ENVIRONMENT_IS_NODE=true}else if(Module["ENVIRONMENT"]==="SHELL"){ENVIRONMENT_IS_SHELL=true}else{throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.")}}else{ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER}if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=console.log;if(!Module["printErr"])Module["printErr"]=console.warn;var nodeFS;var nodePath;Module["read"]=function read(filename,binary){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename)}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};Module["load"]=function load(f){globalEval(read(f))};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response)}else{onerror()}};xhr.onerror=onerror;xhr.send(null)};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.warn(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;console.log("testing");return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(Module.DEBUG){console.log("HEAP: "+DYNAMICTOP+" / "+TOTAL_MEMORY+" ("+(DYNAMICTOP/TOTAL_MEMORY*100).toPrecision(3)+"%)")};if(DYNAMICTOP>=TOTAL_MEMORY){throw new Error("No heap space left: "+DYNAMICTOP+" >= "+TOTAL_MEMORY);var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack)}));return}Runtime.stackRestore(stack)}return ret};var sourceRegex=/^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource=null;function ensureJSsource(){if(!JSsource){JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){ensureJSsource();funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"=("+convertCode.returnValue+");"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){ensureJSsource();funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:Runtime.staticAlloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){return func}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}}Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");return func}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096}return x}var HEAP;var buffer;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){TOTAL_MEMORY=totalMemory}if(Module["buffer"]){buffer=Module["buffer"]}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}updateGlobalBufferViews();HEAP32[0]=255;if(HEAPU8[0]!==255||HEAPU8[3]!==0)throw"Typed arrays 2 must be run on a little-endian system";Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i]}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var Math_clz32=Math.clz32;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var ASM_CONSTS=[];STATIC_BASE=8;STATICTOP=STATIC_BASE+8752;__ATINIT__.push({func:(function(){__GLOBAL__sub_I_Solver_cc()})},{func:(function(){__GLOBAL__sub_I_SimpSolver_cc()})});allocate([224,2,0,0,64,3,0,0,224,2,0,0,82,3,0,0,8,3,0,0,115,3,0,0,8,0,0,0,0,0,0,0,8,3,0,0,192,3,0,0,8,0,0,0,0,0,0,0,224,2,0,0,52,4,0,0,8,3,0,0,120,4,0,0,8,0,0,0,0,0,0,0,8,3,0,0,177,8,0,0,56,0,0,0,0,0,0,0,224,2,0,0,192,23,0,0,8,3,0,0,158,23,0,0,136,0,0,0,0,0,0,0,8,3,0,0,75,23,0,0,104,0,0,0,0,0,0,0,8,3,0,0,112,23,0,0,152,0,0,0,0,0,0,0,224,2,0,0,145,23,0,0,8,3,0,0,134,24,0,0,96,0,0,0,0,0,0,0,8,3,0,0,198,24,0,0,136,0,0,0,0,0,0,0,8,3,0,0,162,24,0,0,176,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,24,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,40,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,56,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,0,0,0,0,64,0,0,0,1,0,0,0,8,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,80,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,92,1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,27,30,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,1,0,0,212,1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,35,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,2,0,0,0,0,0,0,0,104,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,120,0,0,0,12,0,0,0,16,0,0,0,14,0,0,0,15,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,205,23,0,0,0,0,0,0,160,0,0,0,17,0,0,0,18,0,0,0,2,0,0,0,78,55,77,105,110,105,115,97,116,54,79,112,116,105,111,110,69,0,78,55,77,105,110,105,115,97,116,50,48,79,117,116,79,102,77,101,109,111,114,121,69,120,99,101,112,116,105,111,110,69,0,78,55,77,105,110,105,115,97,116,57,73,110,116,79,112,116,105,111,110,69,0,45,0,32,32,45,37,45,49,50,115,32,61,32,37,45,56,115,32,91,0,105,109,105,110,0,37,52,100,0,32,46,46,32,0,105,109,97,120,0,93,32,40,100,101,102,97,117,108,116,58,32,37,100,41,10,0,78,55,77,105,110,105,115,97,116,49,48,66,111,111,108,79,112,116,105,111,110,69,0,32,32,45,37,115,44,32,45,110,111,45,37,115,0,111,110,0,111,102,102,0,40,100,101,102,97,117,108,116,58,32,37,115,41,10,0,80,65,82,83,69,32,69,82,82,79,82,33,32,85,110,101,120,112,101,99,116,101,100,32,99,104,97,114,58,32,37,99,10,0,2,83,65,84,0,32,37,115,37,100,0,85,78,83,65,84,0,73,78,68,69,84,0,78,55,77,105,110,105,115,97,116,54,83,111,108,118,101,114,69,0,67,79,82,69,0,118,97,114,45,100,101,99,97,121,0,84,104,101,32,118,97,114,105,97,98,108,101,32,97,99,116,105,118,105,116,121,32,100,101,99,97,121,32,102,97,99,116,111,114,0,78,55,77,105,110,105,115,97,116,49,50,68,111,117,98,108,101,79,112,116,105,111,110,69,0,69,82,82,79,82,33,32,118,97,108,117,101,32,60,37,115,62,32,105,115,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,111,112,116,105,111,110,32,34,37,115,34,46,10,0,69,82,82,79,82,33,32,118,97,108,117,101,32,60,37,115,62,32,105,115,32,116,111,111,32,115,109,97,108,108,32,102,111,114,32,111,112,116,105,111,110,32,34,37,115,34,46,10,0,32,32,45,37,45,49,50,115,32,61,32,37,45,56,115,32,37,99,37,52,46,50,103,32,46,46,32,37,52,46,50,103,37,99,32,40,100,101,102,97,117,108,116,58,32,37,103,41,10,0,10,32,32,32,32,32,32,32,32,37,115,10,0,99,108,97,45,100,101,99,97,121,0,84,104,101,32,99,108,97,117,115,101,32,97,99,116,105,118,105,116,121,32,100,101,99,97,121,32,102,97,99,116,111,114,0,114,110,100,45,102,114,101,113,0,84,104,101,32,102,114,101,113,117,101,110,99,121,32,119,105,116,104,32,119,104,105,99,104,32,116,104,101,32,100,101,99,105,115,105,111,110,32,104,101,117,114,105,115,116,105,99,32,116,114,105,101,115,32,116,111,32,99,104,111,111,115,101,32,97,32,114,97,110,100,111,109,32,118,97,114,105,97,98,108,101,0,114,110,100,45,115,101,101,100,0,85,115,101,100,32,98,121,32,116,104,101,32,114,97,110,100,111,109,32,118,97,114,105,97,98,108,101,32,115,101,108,101,99,116,105,111,110,0,99,99,109,105,110,45,109,111,100,101,0,67,111,110,116,114,111,108,115,32,99,111,110,102,108,105,99,116,32,99,108,97,117,115,101,32,109,105,110,105,109,105,122,97,116,105,111,110,32,40,48,61,110,111,110,101,44,32,49,61,98,97,115,105,99,44,32,50,61,100,101,101,112,41,0,112,104,97,115,101,45,115,97,118,105,110,103,0,67,111,110,116,114,111,108,115,32,116,104,101,32,108,101,118,101,108,32,111,102,32,112,104,97,115,101,32,115,97,118,105,110,103,32,40,48,61,110,111,110,101,44,32,49,61,108,105,109,105,116,101,100,44,32,50,61,102,117,108,108,41,0,114,110,100,45,105,110,105,116,0,82,97,110,100,111,109,105,122,101,32,116,104,101,32,105,110,105,116,105,97,108,32,97,99,116,105,118,105,116,121,0,108,117,98,121,0,85,115,101,32,116,104,101,32,76,117,98,121,32,114,101,115,116,97,114,116,32,115,101,113,117,101,110,99,101,0,114,102,105,114,115,116,0,84,104,101,32,98,97,115,101,32,114,101,115,116,97,114,116,32,105,110,116,101,114,118,97,108,0,114,105,110,99,0,82,101,115,116,97,114,116,32,105,110,116,101,114,118,97,108,32,105,110,99,114,101,97,115,101,32,102,97,99,116,111,114,0,103,99,45,102,114,97,99,0,84,104,101,32,102,114,97,99,116,105,111,110,32,111,102,32,119,97,115,116,101,100,32,109,101,109,111,114,121,32,97,108,108,111,119,101,100,32,98,101,102,111,114,101,32,97,32,103,97,114,98,97,103,101,32,99,111,108,108,101,99,116,105,111,110,32,105,115,32,116,114,105,103,103,101,114,101,100,0,109,105,110,45,108,101,97,114,110,116,115,0,77,105,110,105,109,117,109,32,108,101,97,114,110,116,32,99,108,97,117,115,101,32,108,105,109,105,116,0,124,32,37,57,100,32,124,32,37,55,100,32,37,56,100,32,37,56,100,32,124,32,37,56,100,32,37,56,100,32,37,54,46,48,102,32,124,32,37,54,46,51,102,32,37,37,32,124,10,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,91,32,83,101,97,114,99,104,32,83,116,97,116,105,115,116,105,99,115,32,93,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,0,124,32,67,111,110,102,108,105,99,116,115,32,124,32,32,32,32,32,32,32,32,32,32,79,82,73,71,73,78,65,76,32,32,32,32,32,32,32,32,32,124,32,32,32,32,32,32,32,32,32,32,76,69,65,82,78,84,32,32,32,32,32,32,32,32,32,32,124,32,80,114,111,103,114,101,115,115,32,124,0,124,32,32,32,32,32,32,32,32,32,32,32,124,32,32,32,32,86,97,114,115,32,32,67,108,97,117,115,101,115,32,76,105,116,101,114,97,108,115,32,124,32,32,32,32,76,105,109,105,116,32,32,67,108,97,117,115,101,115,32,76,105,116,47,67,108,32,124,32,32,32,32,32,32,32,32,32,32,124,0,78,55,77,105,110,105,115,97,116,49,48,83,105,109,112,83,111,108,118,101,114,69,0,124,32,32,71,97,114,98,97,103,101,32,99,111,108,108,101,99,116,105,111,110,58,32,32,32,37,49,50,100,32,98,121,116,101,115,32,61,62,32,37,49,50,100,32,98,121,116,101,115,32,32,32,32,32,32,32,32,32,32,32,32,32,124,10,0,83,73,77,80,0,97,115,121,109,109,0,83,104,114,105,110,107,32,99,108,97,117,115,101,115,32,98,121,32,97,115,121,109,109,101,116,114,105,99,32,98,114,97,110,99,104,105,110,103,46,0,60,98,111,111,108,62,0,114,99,104,101,99,107,0,67,104,101,99,107,32,105,102,32,97,32,99,108,97,117,115,101,32,105,115,32,97,108,114,101,97,100,121,32,105,109,112,108,105,101,100,46,32,40,99,111,115,116,108,121,41,0,101,108,105,109,0,80,101,114,102,111,114,109,32,118,97,114,105,97,98,108,101,32,101,108,105,109,105,110,97,116,105,111,110,46,0,103,114,111,119,0,65,108,108,111,119,32,97,32,118,97,114,105,97,98,108,101,32,101,108,105,109,105,110,97,116,105,111,110,32,115,116,101,112,32,116,111,32,103,114,111,119,32,98,121,32,97,32,110,117,109,98,101,114,32,111,102,32,99,108,97,117,115,101,115,46,0,60,105,110,116,51,50,62,0,99,108,45,108,105,109,0,86,97,114,105,97,98,108,101,115,32,97,114,101,32,110,111,116,32,101,108,105,109,105,110,97,116,101,100,32,105,102,32,105,116,32,112,114,111,100,117,99,101,115,32,97,32,114,101,115,111,108,118,101,110,116,32,119,105,116,104,32,97,32,108,101,110,103,116,104,32,97,98,111,118,101,32,116,104,105,115,32,108,105,109,105,116,46,32,45,49,32,109,101,97,110,115,32,110,111,32,108,105,109,105,116,0,115,117,98,45,108,105,109,0,68,111,32,110,111,116,32,99,104,101,99,107,32,105,102,32,115,117,98,115,117,109,112,116,105,111,110,32,97,103,97,105,110,115,116,32,97,32,99,108,97,117,115,101,32,108,97,114,103,101,114,32,116,104,97,110,32,116,104,105,115,46,32,45,49,32,109,101,97,110,115,32,110,111,32,108,105,109,105,116,46,0,115,105,109,112,45,103,99,45,102,114,97,99,0,84,104,101,32,102,114,97,99,116,105,111,110,32,111,102,32,119,97,115,116,101,100,32,109,101,109,111,114,121,32,97,108,108,111,119,101,100,32,98,101,102,111,114,101,32,97,32,103,97,114,98,97,103,101,32,99,111,108,108,101,99,116,105,111,110,32,105,115,32,116,114,105,103,103,101,114,101,100,32,100,117,114,105,110,103,32,115,105,109,112,108,105,102,105,99,97,116,105,111,110,46,0,60,100,111,117,98,108,101,62,0,115,117,98,115,117,109,112,116,105,111,110,32,108,101,102,116,58,32,37,49,48,100,32,40,37,49,48,100,32,115,117,98,115,117,109,101,100,44,32,37,49,48,100,32,100,101,108,101,116,101,100,32,108,105,116,101,114,97,108,115,41,13,0,101,108,105,109,105,110,97,116,105,111,110,32,108,101,102,116,58,32,37,49,48,100,13,0,124,32,32,69,108,105,109,105,110,97,116,101,100,32,99,108,97,117,115,101,115,58,32,32,32,32,32,37,49,48,46,50,102,32,77,98,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,10,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,0,17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,78,65,78,0,46,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,4,7,3,6,5,0,105,110,102,105,110,105,116,121,0,110,97,110,0,99,97,110,110,111,116,32,122,101,114,111,32,111,117,116,32,116,104,114,101,97,100,32,118,97,108,117,101,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,116,104,114,101,97,100,32,107,101,121,32,102,111,114,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,40,41,0,112,116,104,114,101,97,100,95,111,110,99,101,32,102,97,105,108,117,114,101,32,105,110,32,95,95,99,120,97,95,103,101,116,95,103,108,111,98,97,108,115,95,102,97,115,116,40,41,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,83,116,57,116,121,112,101,95,105,110,102,111,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,83,116,57,101,120,99,101,112,116,105,111,110,0,117,110,99,97,117,103,104,116,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,58,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,101,120,99,101,112,116,105,111,110,32,111,102,32,116,121,112,101,32,37,115,0,116,101,114,109,105,110,97,116,105,110,103,32,119,105,116,104,32,37,115,32,102,111,114,101,105,103,110,32,101,120,99,101,112,116,105,111,110,0,116,101,114,109,105,110,97,116,105,110,103,0,116,101,114,109,105,110,97,116,101,95,104,97,110,100,108,101,114,32,117,110,101,120,112,101,99,116,101,100,108,121,32,114,101,116,117,114,110,101,100,0,83,116,57,98,97,100,95,97,108,108,111,99,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);var tempDoublePtr=STATICTOP;STATICTOP+=16;function _atexit(func,arg){__ATEXIT__.unshift({func:func,arg:arg})}function ___cxa_atexit(){return _atexit.apply(null,arguments)}Module["_i64Subtract"]=_i64Subtract;function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:return totalMemory/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(ERRNO_CODES.EINVAL);return-1}function __ZSt18uncaught_exceptionv(){return!!__ZSt18uncaught_exceptionv.uncaught_exception}var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:(function(adjusted){if(!adjusted||EXCEPTIONS.infos[adjusted])return adjusted;for(var ptr in EXCEPTIONS.infos){var info=EXCEPTIONS.infos[ptr];if(info.adjusted===adjusted){return ptr}}return adjusted}),addRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount++}),decRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];assert(info.refcount>0);info.refcount--;if(info.refcount===0){if(info.destructor){Runtime.dynCall("vi",info.destructor,[ptr])}delete EXCEPTIONS.infos[ptr];___cxa_free_exception(ptr)}}),clearRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount=0})};function ___resumeException(ptr){if(!EXCEPTIONS.last){EXCEPTIONS.last=ptr}EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr));throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}function ___cxa_find_matching_catch(){var thrown=EXCEPTIONS.last;if(!thrown){return(asm["setTempRet0"](0),0)|0}var info=EXCEPTIONS.infos[thrown];var throwntype=info.type;if(!throwntype){return(asm["setTempRet0"](0),thrown)|0}var typeArray=Array.prototype.slice.call(arguments);var pointer=Module["___cxa_is_pointer_type"](throwntype);if(!___cxa_find_matching_catch.buffer)___cxa_find_matching_catch.buffer=_malloc(4);HEAP32[___cxa_find_matching_catch.buffer>>2]=thrown;thrown=___cxa_find_matching_catch.buffer;for(var i=0;i<typeArray.length;i++){if(typeArray[i]&&Module["___cxa_can_catch"](typeArray[i],throwntype,thrown)){thrown=HEAP32[thrown>>2];info.adjusted=thrown;return(asm["setTempRet0"](typeArray[i]),thrown)|0}}thrown=HEAP32[thrown>>2];return(asm["setTempRet0"](throwntype),thrown)|0}function ___cxa_throw(ptr,type,destructor){EXCEPTIONS.infos[ptr]={ptr:ptr,adjusted:ptr,type:type,destructor:destructor,refcount:0};EXCEPTIONS.last=ptr;if(!("uncaught_exception"in __ZSt18uncaught_exceptionv)){__ZSt18uncaught_exceptionv.uncaught_exception=1}else{__ZSt18uncaught_exceptionv.uncaught_exception++}throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}Module["_memset"]=_memset;Module["_bitshift64Shl"]=_bitshift64Shl;function _abort(){Module["abort"]()}function _pthread_once(ptr,func){if(!_pthread_once.seen)_pthread_once.seen={};if(ptr in _pthread_once.seen)return;Runtime.dynCall("v",func);_pthread_once.seen[ptr]=1}function ___lock(){}function ___unlock(){}var PTHREAD_SPECIFIC={};function _pthread_getspecific(key){return PTHREAD_SPECIFIC[key]||0}var _llvm_fabs_f64=Math_abs;Module["_i64Add"]=_i64Add;var PTHREAD_SPECIFIC_NEXT_KEY=1;function _pthread_key_create(key,destructor){if(key==0){return ERRNO_CODES.EINVAL}HEAP32[key>>2]=PTHREAD_SPECIFIC_NEXT_KEY;PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY]=0;PTHREAD_SPECIFIC_NEXT_KEY++;return 0}function __exit(status){Module["exit"](status)}function _exit(status){__exit(status)}function _pthread_setspecific(key,value){if(!(key in PTHREAD_SPECIFIC)){return ERRNO_CODES.EINVAL}PTHREAD_SPECIFIC[key]=value;return 0}function _malloc(bytes){var ptr=Runtime.dynamicAlloc(bytes+8);return ptr+8&4294967288}Module["_malloc"]=_malloc;function ___cxa_allocate_exception(size){return _malloc(size)}var SYSCALLS={varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}Module["_bitshift64Lshr"]=_bitshift64Lshr;function ___cxa_pure_virtual(){ABORT=true;throw"Pure virtual function called!"}function ___cxa_guard_release(){}function _pthread_cleanup_push(routine,arg){__ATEXIT__.push((function(){Runtime.dynCall("vi",routine,[arg])}));_pthread_cleanup_push.level=__ATEXIT__.length}function ___cxa_guard_acquire(variable){if(!HEAP8[variable>>0]){HEAP8[variable>>0]=1;return 1}return 0}function _pthread_cleanup_pop(){assert(_pthread_cleanup_push.level==__ATEXIT__.length,"cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level=__ATEXIT__.length}function ___cxa_begin_catch(ptr){__ZSt18uncaught_exceptionv.uncaught_exception--;EXCEPTIONS.caught.push(ptr);EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));return ptr}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _llvm_pow_f64=Math_pow;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control")})}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return-1>>>0}return ret}function ___gxx_personality_v0(){}function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret}return ret}function _pthread_self(){return 0}function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;assert(offset_high===0);FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;if(!___syscall146.buffer){___syscall146.buffers=[null,[],[]];___syscall146.printChar=(function(stream,curr){var buffer=___syscall146.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?Module["print"]:Module["printErr"])(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}})}for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){___syscall146.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var ___dso_handle=STATICTOP;STATICTOP+=16;__ATEXIT__.push((function(){var fflush=Module["_fflush"];if(fflush)fflush(0);var printChar=___syscall146.printChar;if(!printChar)return;var buffers=___syscall146.buffers;if(buffers[1].length)printChar(1,10);if(buffers[2].length)printChar(2,10)}));STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiii(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_v(index){try{Module["dynCall_v"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiii(index,a1,a2,a3,a4){try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_iiii":invoke_iiii,"invoke_viiiii":invoke_viiiii,"invoke_vi":invoke_vi,"invoke_vii":invoke_vii,"invoke_ii":invoke_ii,"invoke_v":invoke_v,"invoke_viiiiii":invoke_viiiiii,"invoke_iii":invoke_iii,"invoke_viiii":invoke_viiii,"_pthread_cleanup_pop":_pthread_cleanup_pop,"___cxa_guard_acquire":___cxa_guard_acquire,"_llvm_pow_f64":_llvm_pow_f64,"___syscall54":___syscall54,"_abort":_abort,"_llvm_fabs_f64":_llvm_fabs_f64,"___gxx_personality_v0":___gxx_personality_v0,"___cxa_allocate_exception":___cxa_allocate_exception,"___cxa_find_matching_catch":___cxa_find_matching_catch,"___cxa_guard_release":___cxa_guard_release,"___setErrNo":___setErrNo,"_sbrk":_sbrk,"___cxa_begin_catch":___cxa_begin_catch,"_emscripten_memcpy_big":_emscripten_memcpy_big,"___resumeException":___resumeException,"__ZSt18uncaught_exceptionv":__ZSt18uncaught_exceptionv,"__exit":__exit,"_pthread_getspecific":_pthread_getspecific,"_pthread_self":_pthread_self,"_pthread_once":_pthread_once,"_pthread_key_create":_pthread_key_create,"___unlock":___unlock,"_pthread_setspecific":_pthread_setspecific,"___cxa_atexit":___cxa_atexit,"___cxa_throw":___cxa_throw,"_sysconf":_sysconf,"___lock":___lock,"___syscall6":___syscall6,"_pthread_cleanup_push":_pthread_cleanup_push,"_time":_time,"_atexit":_atexit,"___syscall140":___syscall140,"_exit":_exit,"___cxa_pure_virtual":___cxa_pure_virtual,"___syscall146":___syscall146,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8,"___dso_handle":___dso_handle};var asm=(function(global,env,buffer) {"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.___dso_handle|0;var o=0;var p=0;var q=0;var r=0;var s=global.NaN,t=global.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=global.Math.min;var ba=global.Math.clz32;var ca=env.abort;var da=env.assert;var ea=env.invoke_iiii;var fa=env.invoke_viiiii;var ga=env.invoke_vi;var ha=env.invoke_vii;var ia=env.invoke_ii;var ja=env.invoke_v;var ka=env.invoke_viiiiii;var la=env.invoke_iii;var ma=env.invoke_viiii;var na=env._pthread_cleanup_pop;var oa=env.___cxa_guard_acquire;var pa=env._llvm_pow_f64;var qa=env.___syscall54;var ra=env._abort;var sa=env._llvm_fabs_f64;var ta=env.___gxx_personality_v0;var ua=env.___cxa_allocate_exception;var va=env.___cxa_find_matching_catch;var wa=env.___cxa_guard_release;var xa=env.___setErrNo;var ya=env._sbrk;var za=env.___cxa_begin_catch;var Aa=env._emscripten_memcpy_big;var Ba=env.___resumeException;var Ca=env.__ZSt18uncaught_exceptionv;var Da=env.__exit;var Ea=env._pthread_getspecific;var Fa=env._pthread_self;var Ga=env._pthread_once;var Ha=env._pthread_key_create;var Ia=env.___unlock;var Ja=env._pthread_setspecific;var Ka=env.___cxa_atexit;var La=env.___cxa_throw;var Ma=env._sysconf;var Na=env.___lock;var Oa=env.___syscall6;var Pa=env._pthread_cleanup_push;var Qa=env._time;var Ra=env._atexit;var Sa=env.___syscall140;var Ta=env._exit;var Ua=env.___cxa_pure_virtual;var Va=env.___syscall146;var Wa=0.0;function eb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;STACKTOP=i;if(Module.DEBUG){console.log("STACK: "+STACKTOP+" / "+STACK_MAX+" ("+(STACKTOP/STACK_MAX*100).toPrecision(3)+"%)")};if(STACKTOP>=STACK_MAX){throw new Error("No stack space left: "+STACKTOP+" >= "+STACK_MAX);}return b|0}function fb(){return i|0}function gb(a){a=a|0;i=a}function hb(a,b){a=a|0;b=b|0;i=a;j=b}function ib(a,b){a=a|0;b=b|0;if(!o){o=a;p=b}}function jb(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function kb(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function lb(a){a=a|0;D=a}function mb(){return D|0}function nb(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;c[b>>2]=216;c[b+4>>2]=d;c[b+8>>2]=e;c[b+12>>2]=f;c[b+16>>2]=g;if((a[6376]|0)==0?oa(6376)|0:0){c[1694]=0;c[1695]=0;c[1696]=0;Ka(19,6776,n|0)|0;wa(6376)}e=c[1695]|0;if((e|0)!=(c[1696]|0)){g=e;d=g+1|0;c[1695]=d;d=c[1694]|0;g=d+(g<<2)|0;c[g>>2]=b;return}f=(e>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-e|0)){g=ua(1)|0;La(g|0,16,0)}d=c[1694]|0;g=f+e|0;c[1696]=g;g=Rd(d,g<<2)|0;c[1694]=g;if((g|0)==0?(c[(Rc()|0)>>2]|0)==12:0){g=ua(1)|0;La(g|0,16,0)}g=c[1695]|0;d=g+1|0;c[1695]=d;d=c[1694]|0;g=d+(g<<2)|0;c[g>>2]=b;return}function ob(a){a=a|0;return}function pb(a){a=a|0;ae(a);return}function qb(a){a=a|0;var b=0;b=c[a>>2]|0;if(!b)return;c[a+4>>2]=0;Qd(b);c[a>>2]=0;c[a+8>>2]=0;return}function rb(a){a=a|0;ae(a);return}function sb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;o=i;i=i+32|0;n=o+8|0;m=o;l=o+16|0;if((a[d>>0]|0)!=45){n=0;i=o;return n|0}g=d+1|0;j=b+4|0;h=c[j>>2]|0;e=a[h>>0]|0;a:do if(!(e<<24>>24))d=g;else{d=g;f=0;while(1){f=f+1|0;if((a[d>>0]|0)!=e<<24>>24){d=0;break}e=a[h+f>>0]|0;d=g+f|0;if(!(e<<24>>24))break a}i=o;return d|0}while(0);if((a[d>>0]|0)!=61){n=0;i=o;return n|0}d=d+1|0;e=Id(d,l,10)|0;do if(c[l>>2]|0){if((e|0)>(c[b+24>>2]|0)){l=c[116]|0;h=c[j>>2]|0;c[m>>2]=d;c[m+4>>2]=h;Fd(l,1169,m)|0;Ta(1)}if((e|0)<(c[b+20>>2]|0)){m=c[116]|0;b=c[j>>2]|0;c[n>>2]=d;c[n+4>>2]=b;Fd(m,1218,n)|0;Ta(1)}else{c[b+28>>2]=e;k=1;break}}else k=0;while(0);n=k;i=o;return n|0}function tb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;k=i;i=i+48|0;g=k+32|0;j=k+24|0;h=k+16|0;e=k+8|0;d=k;f=c[116]|0;l=c[a+16>>2]|0;c[d>>2]=c[a+4>>2];c[d+4>>2]=l;Fd(f,906,d)|0;d=c[a+20>>2]|0;if((d|0)==-2147483648)Md(924,4,1,f)|0;else{c[e>>2]=d;Fd(f,929,e)|0}Md(933,4,1,f)|0;d=c[a+24>>2]|0;if((d|0)==2147483647)Md(938,4,1,f)|0;else{c[h>>2]=d;Fd(f,929,h)|0}c[j>>2]=c[a+28>>2];Fd(f,943,j)|0;if(!b){i=k;return}c[g>>2]=c[a+8>>2];Fd(f,1317,g)|0;Kd(10,f)|0;i=k;return}function ub(a){a=a|0;ae(a);return}function vb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;if((a[d>>0]|0)!=45){b=0;return b|0}e=d+1|0;if((a[e>>0]|0)==110?(a[d+2>>0]|0)==111:0){g=(a[d+3>>0]|0)==45;f=g&1^1;e=g?d+4|0:e}else f=1;if(Xc(e,c[b+4>>2]|0)|0){g=0;return g|0}a[b+20>>0]=f;g=1;return g|0}function wb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;k=i;i=i+32|0;j=k+16|0;h=k+8|0;g=k;e=c[116]|0;f=b+4|0;l=c[f>>2]|0;c[g>>2]=l;c[g+4>>2]=l;Fd(e,983,g)|0;g=0;while(1){l=g>>>0<(32-((nd(c[f>>2]|0)|0)<<1)|0)>>>0;Kd(32,e)|0;if(l)g=g+1|0;else break}c[h>>2]=a[b+20>>0]|0?997:1e3;Fd(e,1004,h)|0;if(!d){i=k;return}c[j>>2]=c[b+8>>2];Fd(e,1317,j)|0;Kd(10,e)|0;i=k;return}function xb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;m=a+304|0;h=c[m>>2]|0;l=a+308|0;if(!h)i=c[l>>2]|0;else{c[l>>2]=0;i=0}n=b+4|0;f=c[n>>2]|0;if((i|0)<(f|0)){j=a+312|0;k=c[j>>2]|0;if((k|0)<(f|0)){o=f+1-k&-2;i=(k>>1)+2&-2;i=(o|0)>(i|0)?o:i;if((i|0)>(2147483647-k|0)){o=ua(1)|0;La(o|0,16,0)}o=i+k|0;c[j>>2]=o;h=Rd(h,o<<2)|0;c[m>>2]=h;if((h|0)==0?(c[(Rc()|0)>>2]|0)==12:0){o=ua(1)|0;La(o|0,16,0)}}i=c[l>>2]|0;if((i|0)<(f|0)?(c[h+(i<<2)>>2]=0,g=i+1|0,(g|0)!=(f|0)):0)do{c[(c[m>>2]|0)+(g<<2)>>2]=0;g=g+1|0}while((g|0)!=(f|0));c[l>>2]=f;f=c[n>>2]|0}if((f|0)<=0){o=zc(a,d,e)|0;return o|0}h=c[m>>2]|0;f=c[b>>2]|0;g=0;do{c[h+(g<<2)>>2]=c[f+(g<<2)>>2];g=g+1|0}while((g|0)<(c[n>>2]|0));o=zc(a,d,e)|0;return o|0}function yb(a){a=a|0;za(a|0)|0;oe()}function zb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;w=i;i=i+1008|0;q=w+984|0;u=w+952|0;s=w+944|0;n=w+936|0;l=w+997|0;r=w+972|0;k=w+996|0;m=w+960|0;v=w;uc(v);c[1697]=v;c[m>>2]=b;h=m+4|0;c[h>>2]=0;j=m+8|0;c[j>>2]=e;c[r>>2]=0;o=r+4|0;c[o>>2]=0;p=r+8|0;c[p>>2]=0;a[k>>0]=0;t=v+540|0;b=0;g=e;a:while(1){b:do if((b|0)<(g|0)){e=c[m>>2]|0;while(1){switch(a[e+b>>0]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;default:{f=b;break b}}b=b+1|0;c[h>>2]=b;if((b|0)>=(g|0)){f=b;break b}}}else f=b;while(0);e=(a[k>>0]|0)==0;if((f|0)>=(g|0)|e^1){b=39;break}e=c[m>>2]|0;c:do switch(a[e+f>>0]|0){case 112:{b=f+1|0;c[h>>2]=b;if((b|0)<(g|0)?(a[e+b>>0]|0)==32:0){b=f+2|0;c[h>>2]=b;if((b|0)<(g|0)?(a[e+b>>0]|0)==99:0){b=f+3|0;c[h>>2]=b;if((b|0)<(g|0)?(a[e+b>>0]|0)==110:0){b=f+4|0;c[h>>2]=b;if((b|0)<(g|0)?(a[e+b>>0]|0)==102:0){c[h>>2]=f+5;Ab(m,k)|0;Ab(m,k)|0;break c}}}}if((b|0)<(g|0))b=d[e+b>>0]|0;else b=-1;c[n>>2]=b;Nd(1019,n)|0;a[k>>0]=1;break}case 99:{b=f;do if((b|0)<(g|0)){f=(a[e+b>>0]|0)==10;b=b+1|0;c[h>>2]=b;if(f)break c}else{b=b+1|0;c[h>>2]=b}while((b|0)<(g|0));break}default:{a[l>>0]=0;if(c[r>>2]|0)c[o>>2]=0;e=Ab(m,l)|0;b=(a[l>>0]|0)==0;if((e|0)!=0&b)do{b=(e|0)>-1?e:0-e|0;if((b|0)>(c[t>>2]|0))do{a[q>>0]=a[1053]|0;vc(v,q,1)|0}while((b|0)>(c[t>>2]|0));f=(b<<1)+-2|(e|0)<1;b=c[o>>2]|0;if((b|0)==(c[p>>2]|0)){e=(b>>1)+2&-2;e=(e|0)<2?2:e;if((e|0)>(2147483647-b|0)){b=35;break a}g=c[r>>2]|0;e=e+b|0;c[p>>2]=e;e=Rd(g,e<<2)|0;c[r>>2]=e;if((e|0)==0?(c[(Rc()|0)>>2]|0)==12:0){b=35;break a}b=c[o>>2]|0}else e=c[r>>2]|0;c[o>>2]=b+1;c[e+(b<<2)>>2]=f;e=Ab(m,l)|0;b=(a[l>>0]|0)==0}while((e|0)!=0&b);a[k>>0]=b&1^1;Mc(v,r)|0}}while(0);b=c[h>>2]|0;g=c[j>>2]|0}if((b|0)==35)La(ua(1)|0,16,0);else if((b|0)==39){b=c[r>>2]|0;if(b|0){c[o>>2]=0;Qd(b);c[r>>2]=0;c[p>>2]=0}if(!e){u=7692;oc(v);i=w;return u|0}Ac(v,1)|0;if(!(a[v+492>>0]|0)){u=1064;oc(v);i=w;return u|0}c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;b=xb(v,q,1,0)|0;if(!(b<<24>>24)){j=c[t>>2]|0;if((j|0)>0){k=c[v+4>>2]|0;f=0;b=3;do{e=a[k+f>>0]|0;if(!(e&2)){h=(e<<24>>24==0)<<31>>31;f=f+1|0;e=0;g=f;while(1){e=e+1|0;if((g|0)>9)g=(g|0)/10|0;else break}b=b+2+h+e|0}else f=f+1|0}while((f|0)<(j|0))}else b=3;k=b+1|0;b=ve((b|0)<-1?-1:k)|0;f=Yc(b,k,1054,s)|0;e=c[t>>2]|0;if((e|0)>0){j=v+4|0;h=0;while(1){g=a[(c[j>>2]|0)+h>>0]|0;if(!(g&2)){e=h+1|0;c[u>>2]=g<<24>>24==0?7692:904;c[u+4>>2]=e;f=(Yc(b+f|0,k-f|0,1058,u)|0)+f|0;g=e;e=c[t>>2]|0}else g=h+1|0;if((g|0)<(e|0))h=g;else break}}}else b=b<<24>>24==1?1064:1070;u=b;oc(v);i=w;return u|0}return 0}function Ab(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;n=i;i=i+16|0;k=n;m=b+4|0;f=c[m>>2]|0;l=c[b+8>>2]|0;a:do if((f|0)<(l|0)){g=c[b>>2]|0;while(1){switch(a[g+f>>0]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;default:break a}f=f+1|0;c[m>>2]=f;if((f|0)>=(l|0))break a}}while(0);do if((f|0)<(l|0)){if((a[(c[b>>2]|0)+f>>0]|0)==45){f=f+1|0;c[m>>2]=f;j=1;break}if((a[(c[b>>2]|0)+f>>0]|0)==43){f=f+1|0;c[m>>2]=f;j=0}else j=0}else j=0;while(0);do if((f|0)<(l|0)){h=c[b>>2]|0;g=a[h+f>>0]|0;if((g+-48&255)>9){f=d[(c[b>>2]|0)+f>>0]|0;break}if(a[e>>0]|0){m=0;i=n;return m|0}b:do if((g&255)>47){b=f;f=0;do{if((b|0)<(l|0)){if((g&255)>=58)break b;g=g&255}else g=-1;f=(f*10|0)+-48+g|0;b=b+1|0;c[m>>2]=b;if((b|0)>=(l|0))break b;g=a[h+b>>0]|0}while((g&255)>47)}else f=0;while(0);m=j?0-f|0:f;i=n;return m|0}else f=-1;while(0);m=c[116]|0;c[k>>2]=f;Fd(m,1019,k)|0;a[e>>0]=1;m=0;i=n;return m|0}function Bb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=288;b=a+628|0;d=c[b>>2]|0;if(d|0){c[a+632>>2]=0;Qd(d);c[b>>2]=0;c[a+636>>2]=0}b=a+616|0;d=c[b>>2]|0;if(d|0){c[a+620>>2]=0;Qd(d);c[b>>2]=0;c[a+624>>2]=0}b=a+604|0;d=c[b>>2]|0;if(d|0){c[a+608>>2]=0;Qd(d);c[b>>2]=0;c[a+612>>2]=0}b=a+588|0;d=c[b>>2]|0;if(d|0){c[a+592>>2]=0;Qd(d);c[b>>2]=0;c[a+596>>2]=0}b=a+576|0;d=c[b>>2]|0;if(d|0){c[a+580>>2]=0;Qd(d);c[b>>2]=0;c[a+584>>2]=0}b=a+564|0;d=c[b>>2]|0;if(d|0){c[a+568>>2]=0;Qd(d);c[b>>2]=0;c[a+572>>2]=0}b=c[a+544>>2]|0;if(b|0)Qd(b);b=a+472|0;d=c[b>>2]|0;if(d|0){c[a+476>>2]=0;Qd(d);c[b>>2]=0;c[a+480>>2]=0}b=a+460|0;d=c[b>>2]|0;if(d|0){c[a+464>>2]=0;Qd(d);c[b>>2]=0;c[a+468>>2]=0}i=a+412|0;b=a+444|0;d=c[b>>2]|0;if(d|0){c[a+448>>2]=0;Qd(d);c[b>>2]=0;c[a+452>>2]=0}b=a+428|0;d=c[b>>2]|0;if(d|0){c[a+432>>2]=0;Qd(d);c[b>>2]=0;c[a+436>>2]=0}b=c[i>>2]|0;if(b|0){h=a+416|0;d=c[h>>2]|0;if((d|0)>0){e=0;while(1){f=b+(e*12|0)|0;g=c[f>>2]|0;if(g){c[b+(e*12|0)+4>>2]=0;Qd(g);c[f>>2]=0;c[b+(e*12|0)+8>>2]=0;d=c[h>>2]|0}e=e+1|0;if((e|0)>=(d|0))break;b=c[i>>2]|0}b=c[i>>2]|0}c[h>>2]=0;Qd(b);c[i>>2]=0;c[a+420>>2]=0}b=a+396|0;d=c[b>>2]|0;if(d|0){c[a+400>>2]=0;Qd(d);c[b>>2]=0;c[a+404>>2]=0}b=a+380|0;d=c[b>>2]|0;if(d|0){c[a+384>>2]=0;Qd(d);c[b>>2]=0;c[a+388>>2]=0}b=a+364|0;d=c[b>>2]|0;if(d|0){c[a+368>>2]=0;Qd(d);c[b>>2]=0;c[a+372>>2]=0}b=a+348|0;d=c[b>>2]|0;if(d|0){c[a+352>>2]=0;Qd(d);c[b>>2]=0;c[a+356>>2]=0}b=a+332|0;d=c[b>>2]|0;if(d|0){c[a+336>>2]=0;Qd(d);c[b>>2]=0;c[a+340>>2]=0}b=a+316|0;d=c[b>>2]|0;if(d|0){c[a+320>>2]=0;Qd(d);c[b>>2]=0;c[a+324>>2]=0}b=a+304|0;d=c[b>>2]|0;if(d|0){c[a+308>>2]=0;Qd(d);c[b>>2]=0;c[a+312>>2]=0}b=a+292|0;d=c[b>>2]|0;if(d|0){c[a+296>>2]=0;Qd(d);c[b>>2]=0;c[a+300>>2]=0}b=a+280|0;d=c[b>>2]|0;if(d|0){c[a+284>>2]=0;Qd(d);c[b>>2]=0;c[a+288>>2]=0}b=a+268|0;d=c[b>>2]|0;if(d|0){c[a+272>>2]=0;Qd(d);c[b>>2]=0;c[a+276>>2]=0}b=a+256|0;d=c[b>>2]|0;if(d|0){c[a+260>>2]=0;Qd(d);c[b>>2]=0;c[a+264>>2]=0}b=a+32|0;d=c[b>>2]|0;if(d|0){c[a+36>>2]=0;Qd(d);c[b>>2]=0;c[a+40>>2]=0}b=a+16|0;d=c[b>>2]|0;if(d|0){c[a+20>>2]=0;Qd(d);c[b>>2]=0;c[a+24>>2]=0}b=a+4|0;d=c[b>>2]|0;if(!d)return;c[a+8>>2]=0;Qd(d);c[b>>2]=0;c[a+12>>2]=0;return}function Cb(a){a=a|0;Bb(a);ae(a);return}function Db(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;k=i;i=i+32|0;e=k;j=k+8|0;f=b+544|0;g=b+548|0;h=b+556|0;d=(c[g>>2]|0)-(c[h>>2]|0)|0;c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;Eb(j,d);d=j+16|0;a[d>>0]=0;Fb(b,j);if((c[b+44>>2]|0)>1){l=c[j+4>>2]<<2;c[e>>2]=c[g>>2]<<2;c[e+4>>2]=l;Nd(2248,e)|0}a[b+560>>0]=a[d>>0]|0;d=c[f>>2]|0;if(d|0)Qd(d);c[f>>2]=c[j>>2];c[g>>2]=c[j+4>>2];c[b+552>>2]=c[j+8>>2];c[h>>2]=c[j+12>>2];i=k;return}function Eb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;e=a+8|0;f=c[e>>2]|0;if(f>>>0<b>>>0)d=f;else return;while(1){if(d>>>0>=b>>>0)break;d=((d>>>3)+2+(d>>>1)&-2)+d|0;c[e>>2]=d;if(d>>>0<=f>>>0){g=4;break}}if((g|0)==4)La(ua(1)|0,16,0);d=Rd(c[a>>2]|0,d<<2)|0;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0)La(ua(1)|0,16,0);c[a>>2]=d;return}function Fb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;s=b+412|0;r=b+448|0;g=c[r>>2]|0;o=b+444|0;f=c[o>>2]|0;if((g|0)>0){p=b+428|0;q=b+456|0;n=0;do{m=f+(n<<2)|0;h=c[m>>2]|0;if(a[(c[p>>2]|0)+h>>0]|0){f=c[s>>2]|0;l=f+(h*12|0)+4|0;g=c[l>>2]|0;if((g|0)>0){k=f+(h*12|0)|0;h=0;f=0;do{i=c[k>>2]|0;j=i+(h<<3)|0;if((c[(c[c[q>>2]>>2]|0)+(c[j>>2]<<2)>>2]&3|0)!=1){t=j;j=c[t+4>>2]|0;g=i+(f<<3)|0;c[g>>2]=c[t>>2];c[g+4>>2]=j;g=c[l>>2]|0;f=f+1|0}h=h+1|0}while((h|0)<(g|0))}else{h=0;f=0}f=h-f|0;if((f|0)>0)c[l>>2]=g-f;a[(c[p>>2]|0)+(c[m>>2]|0)>>0]=0;f=c[o>>2]|0;g=c[r>>2]|0}n=n+1|0}while((n|0)<(g|0))}if(f|0)c[r>>2]=0;m=b+540|0;if((c[m>>2]|0)>0){l=b+544|0;n=0;do{k=n<<1;f=c[s>>2]|0;j=f+(k*12|0)+4|0;if((c[j>>2]|0)>0){f=f+(k*12|0)|0;i=0;do{g=(c[f>>2]|0)+(i<<3)|0;h=(c[l>>2]|0)+(c[g>>2]<<2)|0;if(!(c[h>>2]&16)){t=Gb(e,h)|0;c[g>>2]=t;c[h>>2]=c[h>>2]|16;c[h+4>>2]=t}else c[g>>2]=c[h+4>>2];i=i+1|0}while((i|0)<(c[j>>2]|0));f=c[s>>2]|0}g=k|1;j=f+(g*12|0)+4|0;if((c[j>>2]|0)>0){f=f+(g*12|0)|0;i=0;do{g=(c[f>>2]|0)+(i<<3)|0;h=(c[l>>2]|0)+(c[g>>2]<<2)|0;if(!(c[h>>2]&16)){t=Gb(e,h)|0;c[g>>2]=t;c[h>>2]=c[h>>2]|16;c[h+4>>2]=t}else c[g>>2]=c[h+4>>2];i=i+1|0}while((i|0)<(c[j>>2]|0))}n=n+1|0}while((n|0)<(c[m>>2]|0))}l=b+284|0;if((c[l>>2]|0)>0){m=b+280|0;n=b+396|0;o=b+544|0;p=b+332|0;q=0;do{f=c[n>>2]|0;g=f+(c[(c[m>>2]|0)+(q<<2)>>2]>>1<<3)|0;h=c[g>>2]|0;do if((h|0)!=-1){i=(c[o>>2]|0)+(h<<2)|0;j=c[i+4>>2]|0;if(c[i>>2]&16|0){c[g>>2]=j;break}k=j>>1;t=d[(c[p>>2]|0)+k>>0]^j&1;r=a[7693]|0;s=r&255;if((t&255)<<24>>24==r<<24>>24&(s>>>1^1)|s&2&t|0?(t=c[f+(k<<3)>>2]|0,(t|0)!=-1&(t|0)==(h|0)):0){t=Gb(e,i)|0;c[g>>2]=t;c[i>>2]=c[i>>2]|16;c[i+4>>2]=t}}while(0);q=q+1|0}while((q|0)<(c[l>>2]|0))}o=b+272|0;f=c[o>>2]|0;if((f|0)>0){m=b+268|0;n=b+544|0;i=c[m>>2]|0;h=f;g=0;f=0;do{j=i+(g<<2)|0;k=(c[n>>2]|0)+(c[j>>2]<<2)|0;l=c[k>>2]|0;if((l&3|0)!=1){if(!(l&16)){h=Gb(e,k)|0;c[j>>2]=h;c[k>>2]=c[k>>2]|16;c[k+4>>2]=h;h=c[m>>2]|0;i=h;h=c[h+(g<<2)>>2]|0}else{h=c[k+4>>2]|0;c[j>>2]=h}c[i+(f<<2)>>2]=h;h=c[o>>2]|0;f=f+1|0}g=g+1|0}while((g|0)<(h|0))}else{h=f;g=0;f=0}f=g-f|0;if((f|0)>0)c[o>>2]=h-f;o=b+260|0;h=c[o>>2]|0;if((h|0)>0){n=b+256|0;m=b+544|0;i=c[n>>2]|0;g=0;f=0;do{j=i+(g<<2)|0;k=(c[m>>2]|0)+(c[j>>2]<<2)|0;l=c[k>>2]|0;if((l&3|0)!=1){if(!(l&16)){h=Gb(e,k)|0;c[j>>2]=h;c[k>>2]=c[k>>2]|16;c[k+4>>2]=h;h=c[n>>2]|0;i=h;h=c[h+(g<<2)>>2]|0}else{h=c[k+4>>2]|0;c[j>>2]=h}c[i+(f<<2)>>2]=h;h=c[o>>2]|0;f=f+1|0}g=g+1|0}while((g|0)<(h|0))}else{g=0;f=0}f=g-f|0;if((f|0)<=0)return;c[o>>2]=h-f;return}function Gb(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0;f=c[b>>2]|0;e=f>>>2&1|(d[a+16>>0]|0);f=((e+(f>>>5)<<2)+4|0)>>>2;h=a+4|0;Eb(a,f+(c[h>>2]|0)|0);g=c[h>>2]|0;f=f+g|0;c[h>>2]=f;if(f>>>0<g>>>0)La(ua(1)|0,16,0);f=(c[a>>2]|0)+(g<<2)|0;a=c[b>>2]&-9|e<<3;c[f>>2]=a;if((c[b>>2]|0)>>>0>31){a=0;do{c[f+4+(a<<2)>>2]=c[b+4+(a<<2)>>2];a=a+1|0}while((a|0)<((c[b>>2]|0)>>>5|0));a=c[f>>2]|0}if(!(a&8))return g|0;h=a>>>5;c[f+4+(h<<2)>>2]=c[b+4+(h<<2)>>2];return g|0}function Hb(){var b=0;a[7693]=0;a[7694]=1;a[7695]=2;nb(6384,1099,1109,1094,2857);c[1596]=308;h[801]=0.0;h[802]=1.0;a[6424]=0;a[6425]=0;h[804]=.95;nb(6440,1330,1340,1094,2857);c[1610]=308;h[808]=0.0;h[809]=1.0;a[6480]=0;a[6481]=0;h[811]=.999;nb(6496,1373,1382,1094,2857);c[1624]=308;h[815]=0.0;h[816]=1.0;a[6536]=1;a[6537]=1;h[818]=0.0;nb(6552,1464,1473,1094,2857);c[1638]=308;h[822]=0.0;h[823]=t;a[6592]=0;a[6593]=0;h[825]=91648253.0;nb(6792,1511,1522,1094,2531);c[1698]=240;b=6812;c[b>>2]=0;c[b+4>>2]=2;c[1705]=2;nb(6824,1586,1599,1094,2531);c[1706]=240;b=6844;c[b>>2]=0;c[b+4>>2]=2;c[1713]=2;nb(6856,1662,1671,1094,2364);c[1714]=264;a[6876]=0;nb(6880,1702,1707,1094,2364);c[1720]=264;a[6900]=1;nb(6904,1737,1744,1094,2531);c[1726]=240;b=6924;c[b>>2]=1;c[b+4>>2]=2147483647;c[1733]=100;nb(6608,1770,1775,1094,2857);c[1652]=308;h[829]=1.0;h[830]=t;a[6648]=0;a[6649]=0;h[832]=2.0;nb(6664,1808,1816,1094,2857);c[1666]=308;h[836]=0.0;h[837]=t;a[6704]=0;a[6705]=0;h[839]=.2;nb(6936,1895,1907,1094,2531);c[1734]=240;b=6956;c[b>>2]=0;c[b+4>>2]=2147483647;c[1741]=0;return}function Ib(a){a=a|0;ae(a);return}function Jb(b,d){b=b|0;d=d|0;var e=0.0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0;p=i;i=i+32|0;o=p+8|0;n=p;m=p+16|0;if((a[d>>0]|0)!=45){o=0;i=p;return o|0}j=d+1|0;l=b+4|0;k=c[l>>2]|0;f=a[k>>0]|0;a:do if(!(f<<24>>24))d=j;else{d=j;g=0;while(1){g=g+1|0;if((a[d>>0]|0)!=f<<24>>24){d=0;break}f=a[k+g>>0]|0;d=j+g|0;if(!(f<<24>>24))break a}i=p;return d|0}while(0);if((a[d>>0]|0)!=61){o=0;i=p;return o|0}d=d+1|0;e=+Hd(d,m);if(!(c[m>>2]|0))d=0;else{q=+h[b+32>>3];if(e>=q?e!=q|(a[b+41>>0]|0)==0:0){m=c[116]|0;k=c[l>>2]|0;c[n>>2]=d;c[n+4>>2]=k;Fd(m,1169,n)|0;Ta(1)}q=+h[b+24>>3];if(e<=q?e!=q|(a[b+40>>0]|0)==0:0){n=c[116]|0;m=c[l>>2]|0;c[o>>2]=d;c[o+4>>2]=m;Fd(n,1218,o)|0;Ta(1)}h[b+48>>3]=e;d=1}o=d;i=p;return o|0}function Kb(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0,m=0.0,n=0.0,o=0;g=i;i=i+64|0;f=g+48|0;j=g;e=c[116]|0;o=c[a+16>>2]|0;l=b[a+40>>1]|0;n=+h[a+24>>3];m=+h[a+32>>3];k=+h[a+48>>3];c[j>>2]=c[a+4>>2];c[j+4>>2]=o;c[j+8>>2]=(l&255)<<24>>24?91:40;h[j+16>>3]=n;h[j+24>>3]=m;c[j+32>>2]=(l&65535)>255?93:41;h[j+40>>3]=k;Fd(e,1267,j)|0;if(!d){i=g;return}c[f>>2]=c[a+8>>2];Fd(e,1317,f)|0;Kd(10,e)|0;i=g;return}function Lb(b){b=b|0;var d=0,e=0,f=0,g=0;c[b>>2]=288;e=b+4|0;d=b+32|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;h[b+48>>3]=+h[804];h[b+56>>3]=+h[811];h[b+64>>3]=+h[818];h[b+72>>3]=+h[825];a[b+80>>0]=a[6900]|0;c[b+84>>2]=c[1705];c[b+88>>2]=c[1713];a[b+92>>0]=0;a[b+93>>0]=a[6876]|0;h[b+96>>3]=+h[839];c[b+104>>2]=c[1741];c[b+108>>2]=c[1733];h[b+112>>3]=+h[832];h[b+120>>3]=.3333333333333333;h[b+128>>3]=1.1;c[b+136>>2]=100;h[b+144>>3]=1.5;c[b+332>>2]=0;c[b+336>>2]=0;c[b+340>>2]=0;c[b+348>>2]=0;c[b+352>>2]=0;c[b+356>>2]=0;c[b+364>>2]=0;c[b+368>>2]=0;c[b+372>>2]=0;c[b+380>>2]=0;c[b+384>>2]=0;c[b+388>>2]=0;c[b+396>>2]=0;c[b+400>>2]=0;c[b+404>>2]=0;d=b+544|0;c[b+412>>2]=0;c[b+416>>2]=0;c[b+420>>2]=0;c[b+428>>2]=0;c[b+432>>2]=0;c[b+436>>2]=0;c[b+444>>2]=0;c[b+448>>2]=0;c[b+452>>2]=0;Ae(b+152|0,0,176)|0;c[b+456>>2]=d;e=b+460|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[b+488>>2]=b+316;a[b+492>>0]=1;h[b+496>>3]=1.0;h[b+504>>3]=1.0;c[b+512>>2]=0;c[b+516>>2]=-1;e=b+520|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;a[b+536>>0]=1;e=b+540|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;Eb(d,1048576);a[b+560>>0]=0;d=b+604|0;e=b+664|0;f=b+564|0;g=f+36|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=d;g=f+36|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[e>>2]=-1;c[e+4>>2]=-1;c[e+8>>2]=-1;c[e+12>>2]=-1;a[b+680>>0]=0;return}function Mb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0;q=i;i=i+16|0;j=q+4|0;k=q;f=b+580|0;g=c[f>>2]|0;if((g|0)>0){o=g+-1|0;p=c[(c[b+576>>2]|0)+(o<<2)>>2]|0;c[f>>2]=o}else{o=b+540|0;p=c[o>>2]|0;c[o>>2]=p+1}l=b+412|0;o=p<<1;c[j>>2]=o;Nb(l,j);c[k>>2]=o|1;Nb(l,k);k=b+332|0;l=a[7695]|0;o=p+1|0;n=b+336|0;if((c[n>>2]|0)<=(p|0)){f=b+340|0;g=c[f>>2]|0;if((g|0)<=(p|0)){r=p+2-g&-2;j=(g>>1)+2&-2;j=(r|0)>(j|0)?r:j;if((j|0)>(2147483647-g|0)){r=ua(1)|0;La(r|0,16,0)}s=c[k>>2]|0;r=j+g|0;c[f>>2]=r;r=Rd(s,r)|0;c[k>>2]=r;if((r|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}f=c[n>>2]|0;if((f|0)<=(p|0))Ae((c[k>>2]|0)+f|0,0,o-f|0)|0;c[n>>2]=o}a[(c[k>>2]|0)+p>>0]=l;k=b+396|0;l=b+400|0;if((c[l>>2]|0)<=(p|0)){f=b+404|0;g=c[f>>2]|0;if((g|0)<=(p|0)){s=p+2-g&-2;j=(g>>1)+2&-2;j=(s|0)>(j|0)?s:j;if((j|0)>(2147483647-g|0)){s=ua(1)|0;La(s|0,16,0)}r=c[k>>2]|0;s=j+g|0;c[f>>2]=s;s=Rd(r,s<<3)|0;c[k>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}f=c[l>>2]|0;if((f|0)<=(p|0))do{s=(c[k>>2]|0)+(f<<3)|0;c[s>>2]=0;c[s+4>>2]=0;f=f+1|0}while((f|0)!=(o|0));c[l>>2]=o}l=(c[k>>2]|0)+(p<<3)|0;c[l>>2]=-1;c[l+4>>2]=0;l=b+316|0;if(!(a[b+93>>0]|0))m=0.0;else{s=b+72|0;m=+h[s>>3]*1389796.0;m=m-+(~~(m/2147483647.0)|0)*2147483647.0;h[s>>3]=m;m=m/2147483647.0*1.0e-05}k=b+320|0;if((c[k>>2]|0)<=(p|0)){f=b+324|0;g=c[f>>2]|0;if((g|0)<=(p|0)){s=p+2-g&-2;j=(g>>1)+2&-2;j=(s|0)>(j|0)?s:j;if((j|0)>(2147483647-g|0)){s=ua(1)|0;La(s|0,16,0)}r=c[l>>2]|0;s=j+g|0;c[f>>2]=s;s=Rd(r,s<<3)|0;c[l>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}f=c[k>>2]|0;if((f|0)<=(p|0))Ae((c[l>>2]|0)+(f<<3)|0,0,o-f<<3|0)|0;c[k>>2]=o}h[(c[l>>2]|0)+(p<<3)>>3]=m;Ob(b+588|0,p,0);Ob(b+348|0,p,1);n=b+364|0;k=a[d>>0]|0;l=b+368|0;if((c[l>>2]|0)<=(p|0)){f=b+372|0;g=c[f>>2]|0;if((g|0)<=(p|0)){s=p+2-g&-2;j=(g>>1)+2&-2;j=(s|0)>(j|0)?s:j;if((j|0)>(2147483647-g|0)){s=ua(1)|0;La(s|0,16,0)}r=c[n>>2]|0;s=j+g|0;c[f>>2]=s;s=Rd(r,s)|0;c[n>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}f=c[l>>2]|0;if((f|0)<=(p|0))Ae((c[n>>2]|0)+f|0,0,o-f|0)|0;c[l>>2]=o}a[(c[n>>2]|0)+p>>0]=k;k=b+380|0;l=b+384|0;if((c[l>>2]|0)<=(p|0)){f=b+388|0;g=c[f>>2]|0;if((g|0)<=(p|0)){s=p+2-g&-2;j=(g>>1)+2&-2;j=(s|0)>(j|0)?s:j;if((j|0)>(2147483647-g|0)){s=ua(1)|0;La(s|0,16,0)}r=c[k>>2]|0;s=j+g|0;c[f>>2]=s;s=Rd(r,s)|0;c[k>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}f=c[l>>2]|0;if((f|0)<=(p|0))do{a[(c[k>>2]|0)+f>>0]=0;f=f+1|0}while((f|0)!=(o|0));c[l>>2]=o}f=b+280|0;g=b+288|0;j=c[g>>2]|0;if((j|0)<=(p|0)){s=p+2-j&-2;k=(j>>1)+2&-2;k=(s|0)>(k|0)?s:k;if((k|0)>(2147483647-j|0)){s=ua(1)|0;La(s|0,16,0)}r=c[f>>2]|0;s=k+j|0;c[g>>2]=s;s=Rd(r,s<<2)|0;c[f>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}}j=b+380|0;f=(c[j>>2]|0)+p|0;g=(a[f>>0]|0)==0;if(e){if(g){s=b+200|0;r=s;r=Ce(c[r>>2]|0,c[r+4>>2]|0,1,0)|0;c[s>>2]=r;c[s+4>>2]=D}}else if(!g){s=b+200|0;r=s;r=Ce(c[r>>2]|0,c[r+4>>2]|0,-1,-1)|0;c[s>>2]=r;c[s+4>>2]=D}a[f>>0]=e&1;f=b+460|0;if((c[b+476>>2]|0)>(p|0)?(c[(c[b+472>>2]|0)+(p<<2)>>2]|0)>-1:0){i=q;return p|0}if(!(a[(c[j>>2]|0)+p>>0]|0)){i=q;return p|0}Pb(f,p);i=q;return p|0}function Nb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=c[d>>2]|0;i=f+1|0;j=b+4|0;if((c[j>>2]|0)<=(f|0)){g=b+8|0;h=c[g>>2]|0;if((h|0)<=(f|0)){k=f+2-h&-2;e=(h>>1)+2&-2;e=(k|0)>(e|0)?k:e;if((e|0)>(2147483647-h|0)){k=ua(1)|0;La(k|0,16,0)}l=c[b>>2]|0;k=e+h|0;c[g>>2]=k;k=Rd(l,k*12|0)|0;c[b>>2]=k;if((k|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}e=c[j>>2]|0;if((e|0)<=(f|0)){f=c[b>>2]|0;do{c[f+(e*12|0)>>2]=0;c[f+(e*12|0)+4>>2]=0;c[f+(e*12|0)+8>>2]=0;e=e+1|0}while((e|0)!=(i|0))}c[j>>2]=i;f=c[d>>2]|0}e=c[b>>2]|0;if(c[e+(f*12|0)>>2]|0){c[e+(f*12|0)+4>>2]=0;f=c[d>>2]|0}i=b+16|0;j=f+1|0;d=b+20|0;if((c[d>>2]|0)>(f|0))return;e=b+24|0;g=c[e>>2]|0;if((g|0)<=(f|0)){l=f+2-g&-2;h=(g>>1)+2&-2;h=(l|0)>(h|0)?l:h;if((h|0)>(2147483647-g|0)){l=ua(1)|0;La(l|0,16,0)}k=c[i>>2]|0;l=h+g|0;c[e>>2]=l;l=Rd(k,l)|0;c[i>>2]=l;if((l|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}e=c[d>>2]|0;if((e|0)<=(f|0))do{a[(c[i>>2]|0)+e>>0]=0;e=e+1|0}while((e|0)!=(j|0));c[d>>2]=j;return}function Ob(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;i=d+1|0;j=b+4|0;if((c[j>>2]|0)>(d|0)){b=c[b>>2]|0;b=b+d|0;a[b>>0]=e;return}g=b+8|0;h=c[g>>2]|0;if((h|0)<=(d|0)){k=d+2-h&-2;f=(h>>1)+2&-2;f=(k|0)>(f|0)?k:f;if((f|0)>(2147483647-h|0)){k=ua(1)|0;La(k|0,16,0)}l=c[b>>2]|0;k=f+h|0;c[g>>2]=k;k=Rd(l,k)|0;c[b>>2]=k;if((k|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}f=c[j>>2]|0;if((f|0)<=(d|0))do{a[(c[b>>2]|0)+f>>0]=0;f=f+1|0}while((f|0)!=(i|0));c[j>>2]=i;l=c[b>>2]|0;l=l+d|0;a[l>>0]=e;return}function Pb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0;n=i;i=i+16|0;g=n;c[g>>2]=b;j=a+12|0;k=b+1|0;l=a+16|0;if((c[l>>2]|0)<=(b|0)){e=a+20|0;f=c[e>>2]|0;if((f|0)<=(b|0)){m=b+2-f&-2;d=(f>>1)+2&-2;d=(m|0)>(d|0)?m:d;if((d|0)>(2147483647-f|0)){n=ua(1)|0;La(n|0,16,0)}o=c[j>>2]|0;m=d+f|0;c[e>>2]=m;m=Rd(o,m<<2)|0;c[j>>2]=m;if((m|0)==0?(c[(Rc()|0)>>2]|0)==12:0){o=ua(1)|0;La(o|0,16,0)}}d=c[l>>2]|0;if((d|0)<=(b|0))Ae((c[j>>2]|0)+(d<<2)|0,-1,k-d<<2|0)|0;c[l>>2]=k}c[(c[j>>2]|0)+(b<<2)>>2]=c[a+4>>2];Qb(a,g);m=c[j>>2]|0;d=c[m+(b<<2)>>2]|0;k=c[a>>2]|0;l=c[k+(d<<2)>>2]|0;if(!d){a=0;o=k+(a<<2)|0;c[o>>2]=l;o=m+(l<<2)|0;c[o>>2]=a;i=n;return}j=a+28|0;e=d;while(1){d=e;e=e+-1>>1;f=k+(e<<2)|0;g=c[f>>2]|0;o=c[c[j>>2]>>2]|0;if(!(+h[o+(l<<3)>>3]>+h[o+(g<<3)>>3])){e=14;break}c[k+(d<<2)>>2]=g;c[m+(c[f>>2]<<2)>>2]=d;if(!e){d=0;e=14;break}}if((e|0)==14){o=k+(d<<2)|0;c[o>>2]=l;o=m+(l<<2)|0;c[o>>2]=d;i=n;return}}function Qb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;g=a+4|0;d=c[g>>2]|0;e=a+8|0;if((c[e>>2]|0)==(d|0)){f=(d>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-d|0)){b=ua(1)|0;La(b|0,16,0)}h=c[a>>2]|0;d=f+d|0;c[e>>2]=d;d=Rd(h,d<<2)|0;c[a>>2]=d;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0){h=ua(1)|0;La(h|0,16,0)}}else d=c[a>>2]|0;h=c[g>>2]|0;c[g>>2]=h+1;c[d+(h<<2)>>2]=c[b>>2];return}function Rb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;g=a+4|0;d=c[g>>2]|0;e=a+8|0;if((c[e>>2]|0)==(d|0)){f=(d>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-d|0)){b=ua(1)|0;La(b|0,16,0)}h=c[a>>2]|0;d=f+d|0;c[e>>2]=d;d=Rd(h,d<<2)|0;c[a>>2]=d;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0){h=ua(1)|0;La(h|0,16,0)}}else d=c[a>>2]|0;h=c[g>>2]|0;c[g>>2]=h+1;c[d+(h<<2)>>2]=c[b>>2];return}function Sb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;u=i;i=i+16|0;f=u+1|0;t=b+492|0;if(!(a[t>>0]|0)){b=0;i=u;return b|0}q=c[e>>2]|0;s=e+4|0;r=c[s>>2]|0;a[f>>0]=a[u>>0]|0;Tb(q,r,f);f=c[s>>2]|0;a:do if((f|0)>0){r=b+332|0;o=a[7693]|0;q=o&255;p=q&2;q=q>>>1^1;h=0;g=0;n=-2;while(1){k=c[e>>2]|0;j=c[k+(h<<2)>>2]|0;l=d[(c[r>>2]|0)+(j>>1)>>0]|0;v=l^j&1;m=v&255;if((j|0)==(n^1|0)?1:(m<<24>>24==o<<24>>24&q|p&v|0)!=0){f=1;break}w=a[7694]|0;v=w&255;if((j|0)!=(n|0)?((v>>>1^1)&m<<24>>24==w<<24>>24|l&2&v|0)==0:0){c[k+(g<<2)>>2]=j;f=c[s>>2]|0;g=g+1|0}else j=n;h=h+1|0;if((h|0)<(f|0))n=j;else break a}i=u;return f|0}else{h=0;g=0}while(0);g=h-g|0;if((g|0)>0){f=f-g|0;c[s>>2]=f}switch(f|0){case 0:{a[t>>0]=0;w=0;i=u;return w|0}case 1:{v=c[c[e>>2]>>2]|0;e=v>>1;a[(c[b+332>>2]|0)+e>>0]=(v&1^1)&255^1;w=c[b+296>>2]|0;e=(c[b+396>>2]|0)+(e<<3)|0;c[e>>2]=-1;c[e+4>>2]=w;e=b+284|0;w=c[e>>2]|0;c[e>>2]=w+1;c[(c[b+280>>2]|0)+(w<<2)>>2]=v;w=(Ub(b)|0)==-1;a[t>>0]=w&1;i=u;return w|0}default:{j=Vb(b+544|0,e,0)|0;k=b+256|0;l=b+260|0;f=c[l>>2]|0;g=b+264|0;if((f|0)==(c[g>>2]|0)){h=(f>>1)+2&-2;h=(h|0)<2?2:h;if((h|0)>(2147483647-f|0)){w=ua(1)|0;La(w|0,16,0)}v=c[k>>2]|0;w=h+f|0;c[g>>2]=w;w=Rd(v,w<<2)|0;c[k>>2]=w;if((w|0)==0?(c[(Rc()|0)>>2]|0)==12:0){w=ua(1)|0;La(w|0,16,0)}f=c[l>>2]|0}c[l>>2]=f+1;c[(c[k>>2]|0)+(f<<2)>>2]=j;Wb(b,j);w=1;i=u;return w|0}}return 0}function Tb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+16|0;n=q+2|0;o=q+1|0;p=q;if((d|0)<16){if((d|0)<=1){i=q;return}g=d+-1|0;h=0;do{j=h;h=h+1|0;if((h|0)<(d|0)){e=j;f=h;do{e=(c[b+(f<<2)>>2]|0)<(c[b+(e<<2)>>2]|0)?f:e;f=f+1|0}while((f|0)!=(d|0))}else e=j;n=b+(j<<2)|0;o=c[n>>2]|0;p=b+(e<<2)|0;c[n>>2]=c[p>>2];c[p>>2]=o}while((h|0)!=(g|0));i=q;return}m=c[b+(((d|0)/2|0)<<2)>>2]|0;f=-1;g=d;while(1){do{f=f+1|0;h=b+(f<<2)|0;j=c[h>>2]|0}while((j|0)<(m|0));e=h;l=h;do{g=g+-1|0;k=b+(g<<2)|0;h=c[k>>2]|0}while((m|0)<(h|0));if((f|0)>=(g|0))break;c[l>>2]=h;c[k>>2]=j}a[n>>0]=a[o>>0]|0;Tb(b,f,n);a[n>>0]=a[p>>0]|0;Tb(e,d-f|0,n);i=q;return}function Ub(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0;z=b+512|0;e=c[z>>2]|0;C=b+284|0;if((e|0)>=(c[C>>2]|0)){H=0;F=0;I=-1;G=b+184|0;B=G;E=B;E=c[E>>2]|0;B=B+4|0;B=c[B>>2]|0;B=Ce(E|0,B|0,H|0,F|0)|0;E=D;C=G;c[C>>2]=B;G=G+4|0;c[G>>2]=E;b=b+520|0;G=b;E=G;E=c[E>>2]|0;G=G+4|0;G=c[G>>2]|0;F=ze(E|0,G|0,H|0,F|0)|0;H=D;G=b;c[G>>2]=F;b=b+4|0;c[b>>2]=H;return I|0}E=b+280|0;F=b+428|0;y=b+412|0;G=b+332|0;H=b+544|0;I=b+396|0;A=b+296|0;B=b+456|0;g=e;e=-1;f=0;a:while(1){c[z>>2]=g+1;n=c[(c[E>>2]|0)+(g<<2)>>2]|0;if(a[(c[F>>2]|0)+n>>0]|0){g=c[y>>2]|0;m=g+(n*12|0)+4|0;h=c[m>>2]|0;if((h|0)>0){l=g+(n*12|0)|0;i=0;g=0;do{j=c[l>>2]|0;k=j+(i<<3)|0;if((c[(c[c[B>>2]>>2]|0)+(c[k>>2]<<2)>>2]&3|0)!=1){w=k;x=c[w+4>>2]|0;h=j+(g<<3)|0;c[h>>2]=c[w>>2];c[h+4>>2]=x;h=c[m>>2]|0;g=g+1|0}i=i+1|0}while((i|0)<(h|0))}else{i=0;g=0}g=i-g|0;if((g|0)>0)c[m>>2]=h-g;a[(c[F>>2]|0)+n>>0]=0}x=c[y>>2]|0;f=f+1|0;i=c[x+(n*12|0)>>2]|0;x=x+(n*12|0)+4|0;g=c[x>>2]|0;h=i+(g<<3)|0;b:do if(!g){h=i;g=i}else{w=n^1;v=i+-1+(g<<3)|0;u=e;e=i;g=i;while(1){i=g;while(1){g=e;c:while(1){l=c[g+4>>2]|0;t=d[(c[G>>2]|0)+(l>>1)>>0]^l&1;m=a[7693]|0;o=m&255;n=o&2;o=o>>>1^1;if((t&255)<<24>>24==m<<24>>24&o|n&t|0){e=g;k=19;break}e=c[g>>2]|0;s=(c[H>>2]|0)+(e<<2)|0;k=s+4|0;j=c[k>>2]|0;if((j|0)==(w|0)){t=s+8|0;j=c[t>>2]|0;c[k>>2]=j;c[t>>2]=w}t=g;g=g+8|0;if((j|0)!=(l|0)?(r=d[(c[G>>2]|0)+(j>>1)>>0]^j&1,(r&255)<<24>>24==m<<24>>24&o|n&r|0):0){k=27;break}k=c[s>>2]|0;if(k>>>0<=95){l=t;k=37;break}o=c[G>>2]|0;r=a[7694]|0;q=r&255;p=q&2;q=q>>>1^1;m=k>>>5;n=2;while(1){l=s+4+(n<<2)|0;k=c[l>>2]|0;J=d[o+(k>>1)>>0]^k&1;n=n+1|0;if(!((J&255)<<24>>24==r<<24>>24&q|p&J))break;if((n|0)>=(m|0)){p=r;m=g;l=t;k=38;break c}}J=s+8|0;c[J>>2]=k;c[l>>2]=w;l=c[J>>2]^1;J=c[y>>2]|0;n=J+(l*12|0)|0;o=J+(l*12|0)+4|0;k=c[o>>2]|0;l=J+(l*12|0)+8|0;if((k|0)==(c[l>>2]|0)){m=(k>>1)+2&-2;m=(m|0)<2?2:m;if((m|0)>(2147483647-k|0)){k=34;break a}t=c[n>>2]|0;J=m+k|0;c[l>>2]=J;J=Rd(t,J<<3)|0;c[n>>2]=J;if((J|0)==0?(c[(Rc()|0)>>2]|0)==12:0){k=34;break a}k=c[o>>2]|0}c[o>>2]=k+1;J=(c[n>>2]|0)+(k<<3)|0;c[J>>2]=e;c[J+4>>2]=j;if((g|0)==(h|0)){e=u;g=i;break b}}if((k|0)==19){k=0;t=e;J=c[t+4>>2]|0;g=i;c[g>>2]=c[t>>2];c[g+4>>2]=J;e=e+8|0;g=i+8|0}else if((k|0)==27){k=0;J=i;c[J>>2]=e;c[J+4>>2]=j;e=g;g=i+8|0}else if((k|0)==37){p=a[7694]|0;m=g;k=38}if((k|0)==38){g=i+8|0;k=i;c[k>>2]=e;c[k+4>>2]=j;k=j>>1;n=j&1;o=(c[G>>2]|0)+k|0;J=d[o>>0]^n;t=p&255;if((J&255)<<24>>24==p<<24>>24&(t>>>1^1)|t&2&J|0)break;a[o>>0]=(n^1)&255^1;t=c[A>>2]|0;J=(c[I>>2]|0)+(k<<3)|0;c[J>>2]=e;c[J+4>>2]=t;e=c[C>>2]|0;c[C>>2]=e+1;c[(c[E>>2]|0)+(e<<2)>>2]=j;e=m}if((e|0)==(h|0)){e=u;break b}else i=g}c[z>>2]=c[C>>2];if(m>>>0<h>>>0){k=(v+(0-m)|0)>>>3;j=i+16|0;i=m;while(1){t=i;i=i+8|0;u=c[t+4>>2]|0;J=g;c[J>>2]=c[t>>2];c[J+4>>2]=u;if(i>>>0>=h>>>0)break;else g=g+8|0}i=l+16+(k<<3)|0;g=j+(k<<3)|0}else i=m;if((i|0)==(h|0))break;else{u=e;e=i}}}while(0);g=h-g|0;if((g|0)>0)c[x>>2]=(c[x>>2]|0)-(g>>3);g=c[z>>2]|0;if((g|0)>=(c[C>>2]|0)){k=46;break}}if((k|0)==34)La(ua(1)|0,16,0);else if((k|0)==46){I=f;G=((f|0)<0)<<31>>31;J=e;H=b+184|0;C=H;F=C;F=c[F>>2]|0;C=C+4|0;C=c[C>>2]|0;C=Ce(F|0,C|0,I|0,G|0)|0;F=D;E=H;c[E>>2]=C;H=H+4|0;c[H>>2]=F;b=b+520|0;H=b;F=H;F=c[F>>2]|0;H=H+4|0;H=c[H>>2]|0;G=ze(F|0,H|0,I|0,G|0)|0;I=D;H=b;c[H>>2]=G;b=b+4|0;c[b>>2]=I;return J|0}return 0}function Vb(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;e=e&1;f=d[a+16>>0]|0|e;h=b+4|0;i=((f+(c[h>>2]|0)<<2)+4|0)>>>2;k=a+4|0;Eb(a,i+(c[k>>2]|0)|0);j=c[k>>2]|0;i=i+j|0;c[k>>2]=i;if(i>>>0<j>>>0)La(ua(1)|0,16,0);i=(c[a>>2]|0)+(j<<2)|0;e=f<<3|e<<2;c[i>>2]=c[i>>2]&-32|e;e=c[h>>2]<<5|e;c[i>>2]=e;if((c[h>>2]|0)>0){e=c[b>>2]|0;f=0;do{c[i+4+(f<<2)>>2]=c[e+(f<<2)>>2];f=f+1|0}while((f|0)<(c[h>>2]|0));e=c[i>>2]|0}if(!(e&8))return j|0;f=e>>>5;if(e&4|0){g[i+4+(f<<2)>>2]=0.0;return j|0}if(!f){f=0;e=0}else{e=0;a=0;do{e=1<<((c[i+4+(a<<2)>>2]|0)>>>1&31)|e;a=a+1|0}while((a|0)!=(f|0))}c[i+4+(f<<2)>>2]=e;return j|0}function Wb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;m=(c[a+544>>2]|0)+(b<<2)|0;l=m+4|0;e=c[l>>2]^1;i=a+412|0;f=c[i>>2]|0;j=f+(e*12|0)|0;k=m+8|0;g=c[k>>2]|0;h=f+(e*12|0)+4|0;d=c[h>>2]|0;e=f+(e*12|0)+8|0;if((d|0)==(c[e>>2]|0)){f=(d>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-d|0)){a=ua(1)|0;La(a|0,16,0)}n=c[j>>2]|0;f=f+d|0;c[e>>2]=f;f=Rd(n,f<<3)|0;c[j>>2]=f;if((f|0)==0?(c[(Rc()|0)>>2]|0)==12:0){n=ua(1)|0;La(n|0,16,0)}d=c[h>>2]|0}c[h>>2]=d+1;e=(c[j>>2]|0)+(d<<3)|0;c[e>>2]=b;c[e+4>>2]=g;e=c[k>>2]^1;n=c[i>>2]|0;i=n+(e*12|0)|0;g=c[l>>2]|0;h=n+(e*12|0)+4|0;d=c[h>>2]|0;e=n+(e*12|0)+8|0;if((d|0)==(c[e>>2]|0)){f=(d>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-d|0)){n=ua(1)|0;La(n|0,16,0)}l=c[i>>2]|0;n=f+d|0;c[e>>2]=n;n=Rd(l,n<<3)|0;c[i>>2]=n;if((n|0)==0?(c[(Rc()|0)>>2]|0)==12:0){n=ua(1)|0;La(n|0,16,0)}d=c[h>>2]|0}c[h>>2]=d+1;n=(c[i>>2]|0)+(d<<3)|0;c[n>>2]=b;c[n+4>>2]=g;if(!(c[m>>2]&4)){n=a+208|0;b=n;b=Ce(c[b>>2]|0,c[b+4>>2]|0,1,0)|0;c[n>>2]=b;c[n+4>>2]=D;n=a+224|0;a=n;a=Ce((c[m>>2]|0)>>>5|0,0,c[a>>2]|0,c[a+4>>2]|0)|0;c[n>>2]=a;c[n+4>>2]=D;return}else{n=a+216|0;b=n;b=Ce(c[b>>2]|0,c[b+4>>2]|0,1,0)|0;c[n>>2]=b;c[n+4>>2]=D;n=a+232|0;a=n;a=Ce((c[m>>2]|0)>>>5|0,0,c[a>>2]|0,c[a+4>>2]|0)|0;c[n>>2]=a;c[n+4>>2]=D;return}}function Xb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=c[d>>2]|0;d=f>>1;a[(c[b+332>>2]|0)+d>>0]=(f&1^1)&255^1;g=c[b+296>>2]|0;d=(c[b+396>>2]|0)+(d<<3)|0;c[d>>2]=e;c[d+4>>2]=g;e=b+284|0;d=c[e>>2]|0;c[e>>2]=d+1;c[(c[b+280>>2]|0)+(d<<2)>>2]=f;return}function Yb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;o=i;i=i+16|0;h=o+4|0;j=o;n=(c[b+544>>2]|0)+(d<<2)|0;k=c[n+4>>2]^1;if(!e){c[h>>2]=k;g=b+428|0;e=c[g>>2]|0;f=e+k|0;if(!(a[f>>0]|0)){a[f>>0]=1;Rb(b+444|0,h);e=c[g>>2]|0}d=c[n+8>>2]^1;c[j>>2]=d;e=e+d|0;if(!(a[e>>0]|0)){a[e>>0]=1;Rb(b+444|0,j)}}else{l=b+412|0;f=c[l>>2]|0;j=f+(k*12|0)|0;m=n+8|0;k=f+(k*12|0)+4|0;h=c[k>>2]|0;a:do if((h|0)>0){g=c[j>>2]|0;e=0;while(1){if((c[g+(e<<3)>>2]|0)==(d|0)){g=e;break a}e=e+1|0;if((e|0)>=(h|0)){g=e;break}}}else g=0;while(0);e=h+-1|0;if((g|0)<(e|0)){f=g;do{p=c[j>>2]|0;e=f;f=f+1|0;g=p+(f<<3)|0;h=c[g+4>>2]|0;e=p+(e<<3)|0;c[e>>2]=c[g>>2];c[e+4>>2]=h;e=(c[k>>2]|0)+-1|0}while((f|0)<(e|0));f=c[l>>2]|0}c[k>>2]=e;j=c[m>>2]^1;h=f+(j*12|0)|0;j=f+(j*12|0)+4|0;g=c[j>>2]|0;b:do if((g|0)>0){e=c[h>>2]|0;f=0;do{if((c[e+(f<<3)>>2]|0)==(d|0))break b;f=f+1|0}while((f|0)<(g|0))}else f=0;while(0);e=g+-1|0;if((f|0)<(e|0))do{m=c[h>>2]|0;e=f;f=f+1|0;d=m+(f<<3)|0;p=c[d+4>>2]|0;e=m+(e<<3)|0;c[e>>2]=c[d>>2];c[e+4>>2]=p;e=(c[j>>2]|0)+-1|0}while((f|0)<(e|0));c[j>>2]=e}if(!(c[n>>2]&4)){p=b+208|0;d=p;d=Ce(c[d>>2]|0,c[d+4>>2]|0,-1,-1)|0;c[p>>2]=d;c[p+4>>2]=D;p=b+224|0;b=p;b=ze(c[b>>2]|0,c[b+4>>2]|0,(c[n>>2]|0)>>>5|0,0)|0;c[p>>2]=b;c[p+4>>2]=D;i=o;return}else{p=b+216|0;d=p;d=Ce(c[d>>2]|0,c[d+4>>2]|0,-1,-1)|0;c[p>>2]=d;c[p+4>>2]=D;p=b+232|0;b=p;b=ze(c[b>>2]|0,c[b+4>>2]|0,(c[n>>2]|0)>>>5|0,0)|0;c[p>>2]=b;c[p+4>>2]=D;i=o;return}}function Zb(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;f=b+544|0;g=(c[f>>2]|0)+(e<<2)|0;Yb(b,e,0);k=c[g+4>>2]|0;j=k>>1;k=(d[(c[b+332>>2]|0)+j>>0]|0)^k&1;m=a[7693]|0;l=m&255;if(((k&255)<<24>>24==m<<24>>24&(l>>>1^1)|l&2&k|0?(h=(c[b+396>>2]|0)+(j<<3)|0,i=c[h>>2]|0,(i|0)!=-1):0)?((c[f>>2]|0)+(i<<2)|0)==(g|0):0)c[h>>2]=-1;c[g>>2]=c[g>>2]&-4|1;l=c[(c[f>>2]|0)+(e<<2)>>2]|0;m=b+556|0;c[m>>2]=((((l>>>3&1)+(l>>>5)<<2)+4|0)>>>2)+(c[m>>2]|0);return}function _b(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=c[e>>2]|0;if(f>>>0<=31){e=0;return e|0}g=c[b+332>>2]|0;h=a[7693]|0;j=h&255;i=j&2;j=j>>>1^1;b=f>>>5;f=0;while(1){k=c[e+4+(f<<2)>>2]|0;k=(d[g+(k>>1)>>0]|0)^k&1;f=f+1|0;if((k&255)<<24>>24==h<<24>>24&j|i&k|0){b=1;f=5;break}if((f|0)>=(b|0)){b=0;f=5;break}}if((f|0)==5)return b|0;return 0}function $b(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;r=b+296|0;if((c[r>>2]|0)<=(d|0))return;s=b+284|0;g=c[s>>2]|0;p=b+292|0;f=c[p>>2]|0;e=c[f+(d<<2)>>2]|0;if((g|0)>(e|0)){h=b+280|0;i=b+332|0;j=b+88|0;k=b+348|0;l=b+460|0;m=b+476|0;n=b+472|0;o=b+380|0;do{g=g+-1|0;e=c[(c[h>>2]|0)+(g<<2)>>2]>>1;a[(c[i>>2]|0)+e>>0]=a[7695]|0;f=c[j>>2]|0;if((f|0)<=1){if((f|0)==1?(g|0)>(c[(c[p>>2]|0)+((c[r>>2]|0)+-1<<2)>>2]|0):0)q=12}else q=12;if((q|0)==12){q=0;a[(c[k>>2]|0)+e>>0]=c[(c[h>>2]|0)+(g<<2)>>2]&1}if(!((c[m>>2]|0)>(e|0)?(c[(c[n>>2]|0)+(e<<2)>>2]|0)>-1:0))q=16;if((q|0)==16?(q=0,a[(c[o>>2]|0)+e>>0]|0):0)Pb(l,e);f=c[p>>2]|0;e=c[f+(d<<2)>>2]|0}while((g|0)>(e|0));g=c[s>>2]|0}c[b+512>>2]=e;e=c[f+(d<<2)>>2]|0;if((g|0)>(e|0))c[s>>2]=e;if((c[r>>2]|0)<=(d|0))return;c[r>>2]=d;return}function ac(b){b=b|0;var d=0,e=0,f=0,g=0.0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;o=b+72|0;g=+h[o>>3]*1389796.0;g=g-+(~~(g/2147483647.0)|0)*2147483647.0;h[o>>3]=g;m=b+464|0;if(g/2147483647.0<+h[b+64>>3]?(d=c[m>>2]|0,(d|0)!=0):0){g=g*1389796.0;g=g-+(~~(g/2147483647.0)|0)*2147483647.0;h[o>>3]=g;d=c[(c[b+460>>2]|0)+(~~(g/2147483647.0*+(d|0))<<2)>>2]|0;f=a[(c[b+332>>2]|0)+d>>0]|0;e=a[7695]|0;l=e&255;if(((l>>>1^1)&f<<24>>24==e<<24>>24|f&2&l|0)!=0?(a[(c[b+380>>2]|0)+d>>0]|0)!=0:0){l=b+176|0;f=l;f=Ce(c[f>>2]|0,c[f+4>>2]|0,1,0)|0;c[l>>2]=f;c[l+4>>2]=D}}else d=-1;e=b+460|0;f=b+332|0;l=b+380|0;while(1){if(((d|0)!=-1?(p=a[(c[f>>2]|0)+d>>0]|0,k=a[7695]|0,j=k&255,i=j>>>1^1,i&p<<24>>24==k<<24>>24|p&2&j|0):0)?a[(c[l>>2]|0)+d>>0]|0:0)break;if(!(c[m>>2]|0)){d=-2;n=17;break}d=bc(e)|0}if((n|0)==17)return d|0;e=a[(c[b+364>>2]|0)+d>>0]|0;f=e&255;if(!(i&e<<24>>24==k<<24>>24|j&2&f)){b=a[7693]|0;p=b&255;p=((p>>>1^1)&e<<24>>24==b<<24>>24|f&2&p|0)!=0|d<<1;return p|0}if(!(a[b+92>>0]|0)){p=(a[(c[b+348>>2]|0)+d>>0]|0)!=0|d<<1;return p|0}else{g=+h[o>>3]*1389796.0;g=g-+(~~(g/2147483647.0)|0)*2147483647.0;h[o>>3]=g;p=g/2147483647.0<.5|d<<1;return p|0}return 0}function bc(a){a=a|0;var b=0,d=0.0,e=0,f=0,g=0.0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;n=c[a>>2]|0;o=c[n>>2]|0;l=a+4|0;b=c[n+((c[l>>2]|0)+-1<<2)>>2]|0;c[n>>2]=b;q=c[a+12>>2]|0;c[q+(b<<2)>>2]=0;c[q+(o<<2)>>2]=-1;b=(c[l>>2]|0)+-1|0;c[l>>2]=b;if((b|0)<=1)return o|0;p=c[n>>2]|0;k=a+28|0;a=0;j=1;while(1){f=(a<<1)+2|0;if((f|0)<(b|0)){i=c[n+(f<<2)>>2]|0;e=c[n+(j<<2)>>2]|0;b=c[c[k>>2]>>2]|0;g=+h[b+(i<<3)>>3];d=+h[b+(e<<3)>>3];if(g>d){d=g;e=i}else m=6}else{b=c[c[k>>2]>>2]|0;m=c[n+(j<<2)>>2]|0;e=m;d=+h[b+(m<<3)>>3];m=6}if((m|0)==6){m=0;f=j}if(!(d>+h[b+(p<<3)>>3]))break;c[n+(a<<2)>>2]=e;c[q+(e<<2)>>2]=a;j=f<<1|1;b=c[l>>2]|0;if((j|0)>=(b|0)){a=f;break}else a=f}c[n+(a<<2)>>2]=p;c[q+(p<<2)>>2]=a;return o|0}function cc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0.0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0.0,U=0;S=i;i=i+16|0;L=S+4|0;M=S;P=e+4|0;j=c[P>>2]|0;m=e+8|0;if((j|0)==(c[m>>2]|0)){l=(j>>1)+2&-2;l=(l|0)<2?2:l;if((l|0)>(2147483647-j|0)){S=ua(1)|0;La(S|0,16,0)}Q=c[e>>2]|0;R=l+j|0;c[m>>2]=R;R=Rd(Q,R<<2)|0;c[e>>2]=R;if((R|0)==0?(c[(Rc()|0)>>2]|0)==12:0){S=ua(1)|0;La(S|0,16,0)}j=c[P>>2]|0}c[(c[e>>2]|0)+(j<<2)>>2]=0;c[P>>2]=(c[P>>2]|0)+1;Q=b+396|0;O=b+544|0;v=b+280|0;R=b+588|0;w=b+504|0;x=b+316|0;y=b+540|0;z=b+476|0;A=b+472|0;B=b+460|0;C=b+488|0;E=b+296|0;F=b+496|0;G=b+272|0;H=b+268|0;l=d;d=(c[b+284>>2]|0)+-1|0;j=-2;p=0;while(1){u=(c[O>>2]|0)+(l<<2)|0;l=c[u>>2]|0;if((l&4|0)!=0?(K=+h[F>>3],t=u+4+(l>>>5<<2)|0,T=K+ +g[t>>2],g[t>>2]=T,T>1.0e20):0){l=c[G>>2]|0;if((l|0)>0){m=c[H>>2]|0;n=c[O>>2]|0;o=0;do{t=n+(c[m+(o<<2)>>2]<<2)|0;t=t+4+((c[t>>2]|0)>>>5<<2)|0;g[t>>2]=+g[t>>2]*1.0e-20;o=o+1|0}while((o|0)!=(l|0))}h[F>>3]=K*1.0e-20;l=c[u>>2]|0}j=(j|0)!=-2&1;if(j>>>0<l>>>5>>>0){t=j;j=p;while(1){r=c[u+4+(t<<2)>>2]|0;c[L>>2]=r;r=r>>1;s=(c[R>>2]|0)+r|0;do if((a[s>>0]|0)==0?(c[(c[Q>>2]|0)+(r<<3)+4>>2]|0)>0:0){q=(c[x>>2]|0)+(r<<3)|0;T=+h[w>>3]+ +h[q>>3];h[q>>3]=T;if(T>1.e+100){m=c[y>>2]|0;if((m|0)>0){l=c[x>>2]|0;n=0;do{q=l+(n<<3)|0;h[q>>3]=+h[q>>3]*1.0e-100;n=n+1|0}while((n|0)!=(m|0))}h[w>>3]=+h[w>>3]*1.0e-100}if((c[z>>2]|0)>(r|0)?(I=c[A>>2]|0,J=c[I+(r<<2)>>2]|0,(J|0)>-1):0){p=c[B>>2]|0;q=c[p+(J<<2)>>2]|0;a:do if(!J)l=0;else{m=J;while(1){l=m;m=m+-1>>1;n=p+(m<<2)|0;o=c[n>>2]|0;U=c[c[C>>2]>>2]|0;if(!(+h[U+(q<<3)>>3]>+h[U+(o<<3)>>3]))break a;c[p+(l<<2)>>2]=o;c[I+(c[n>>2]<<2)>>2]=l;if(!m){l=0;break}}}while(0);c[p+(l<<2)>>2]=q;c[I+(q<<2)>>2]=l}a[s>>0]=1;if((c[(c[Q>>2]|0)+(r<<3)+4>>2]|0)<(c[E>>2]|0)){Rb(e,L);break}else{j=j+1|0;break}}while(0);t=t+1|0;if((t|0)>=((c[u>>2]|0)>>>5|0)){p=j;break}}}n=c[v>>2]|0;o=c[R>>2]|0;j=d;while(1){d=j+-1|0;j=c[n+(j<<2)>>2]|0;l=j>>1;m=o+l|0;if(!(a[m>>0]|0))j=d;else break}l=c[(c[Q>>2]|0)+(l<<3)>>2]|0;a[m>>0]=0;if((p|0)>1)p=p+-1|0;else break}c[c[e>>2]>>2]=j^1;s=b+616|0;l=c[s>>2]|0;r=b+620|0;if(!l)m=c[r>>2]|0;else{c[r>>2]=0;m=0}j=c[P>>2]|0;if((m|0)<(j|0)){m=b+624|0;d=c[m>>2]|0;if((d|0)<(j|0)){U=j+1-d&-2;n=(d>>1)+2&-2;n=(U|0)>(n|0)?U:n;if((n|0)>(2147483647-d|0)){U=ua(1)|0;La(U|0,16,0)}U=n+d|0;c[m>>2]=U;l=Rd(l,U<<2)|0;c[s>>2]=l;if((l|0)==0?(c[(Rc()|0)>>2]|0)==12:0){U=ua(1)|0;La(U|0,16,0)}}m=c[r>>2]|0;if((m|0)<(j|0)?(c[l+(m<<2)>>2]=0,k=m+1|0,(k|0)!=(j|0)):0)do{c[(c[s>>2]|0)+(k<<2)>>2]=0;k=k+1|0}while((k|0)!=(j|0));c[r>>2]=j;j=c[P>>2]|0}if((j|0)>0){k=c[s>>2]|0;l=c[e>>2]|0;m=0;do{c[k+(m<<2)>>2]=c[l+(m<<2)>>2];m=m+1|0;j=c[P>>2]|0}while((m|0)<(j|0))}switch(c[b+84>>2]|0){case 2:{if((j|0)>1){l=1;j=1;do{k=c[e>>2]|0;m=c[k+(l<<2)>>2]|0;if((c[(c[Q>>2]|0)+(m>>1<<3)>>2]|0)!=-1){c[M>>2]=m;c[L>>2]=c[M>>2];if(!(dc(b,L)|0)){m=c[e>>2]|0;k=m;m=c[m+(l<<2)>>2]|0;N=58}}else N=58;if((N|0)==58){N=0;c[k+(j<<2)>>2]=m;j=j+1|0}l=l+1|0;k=c[P>>2]|0}while((l|0)<(k|0))}else{k=j;l=1;j=1}break}case 1:{if((j|0)>1){l=1;j=1;do{o=c[e>>2]|0;p=c[o+(l<<2)>>2]|0;q=c[Q>>2]|0;k=c[q+(p>>1<<3)>>2]|0;b:do if((k|0)!=-1){d=(c[O>>2]|0)+(k<<2)|0;k=c[d>>2]|0;if(k>>>0>63){n=c[R>>2]|0;k=k>>>5;m=1;while(1){U=c[d+4+(m<<2)>>2]>>1;if((a[n+U>>0]|0)==0?(c[q+(U<<3)+4>>2]|0)>0:0)break;m=m+1|0;if((m|0)>=(k|0))break b}c[o+(j<<2)>>2]=p;j=j+1|0}}else{c[o+(j<<2)>>2]=p;j=j+1|0}while(0);l=l+1|0;k=c[P>>2]|0}while((l|0)<(k|0))}else{k=j;l=1;j=1}break}default:{k=j;l=j}}U=b+240|0;O=U;O=Ce(c[O>>2]|0,c[O+4>>2]|0,k|0,((k|0)<0)<<31>>31|0)|0;c[U>>2]=O;c[U+4>>2]=D;j=l-j|0;if((j|0)>0){j=k-j|0;c[P>>2]=j}else j=k;U=b+248|0;b=U;b=Ce(c[b>>2]|0,c[b+4>>2]|0,j|0,((j|0)<0)<<31>>31|0)|0;c[U>>2]=b;c[U+4>>2]=D;if((j|0)==1)j=0;else{d=c[e>>2]|0;if((j|0)>2){m=c[Q>>2]|0;k=c[P>>2]|0;l=2;j=1;do{j=(c[m+(c[d+(l<<2)>>2]>>1<<3)+4>>2]|0)>(c[m+(c[d+(j<<2)>>2]>>1<<3)+4>>2]|0)?l:j;l=l+1|0}while((l|0)<(k|0))}else j=1;P=d+(j<<2)|0;j=c[P>>2]|0;U=d+4|0;c[P>>2]=c[U>>2];c[U>>2]=j;j=c[(c[Q>>2]|0)+(j>>1<<3)+4>>2]|0}c[f>>2]=j;if((c[r>>2]|0)>0)j=0;else{i=S;return}do{a[(c[R>>2]|0)+(c[(c[s>>2]|0)+(j<<2)>>2]>>1)>>0]=0;j=j+1|0}while((j|0)<(c[r>>2]|0));i=S;return}function dc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=c[d>>2]|0;k=b+396|0;e=c[k>>2]|0;m=b+544|0;g=(c[m>>2]|0)+(c[e+(f>>1<<3)>>2]<<2)|0;r=b+604|0;p=b+608|0;if(c[r>>2]|0)c[p>>2]=0;q=b+588|0;n=b+612|0;o=b+616|0;j=1;while(1){if(j>>>0<(c[g>>2]|0)>>>5>>>0){h=c[g+4+(j<<2)>>2]|0;i=h>>1;if((c[e+(i<<3)+4>>2]|0)!=0?(l=a[(c[q>>2]|0)+i>>0]|0,(l+-1&255)>=2):0){b=c[p>>2]|0;g=(b|0)==(c[n>>2]|0);if(l<<24>>24==3?1:(c[e+(i<<3)>>2]|0)==-1){e=8;break}if(g){e=(b>>1)+2&-2;e=(e|0)<2?2:e;if((e|0)>(2147483647-b|0)){e=22;break}s=c[r>>2]|0;g=e+b|0;c[n>>2]=g;g=Rd(s,g<<3)|0;c[r>>2]=g;if((g|0)==0?(c[(Rc()|0)>>2]|0)==12:0){e=22;break}b=c[p>>2]|0}c[p>>2]=b+1;g=(c[r>>2]|0)+(b<<3)|0;c[g>>2]=j;c[g+4>>2]=f;c[d>>2]=h;g=c[k>>2]|0;e=g;f=h;g=(c[m>>2]|0)+(c[g+(i<<3)>>2]<<2)|0;b=0}else b=j}else{b=(c[q>>2]|0)+(f>>1)|0;if(!(a[b>>0]|0)){a[b>>0]=2;Rb(o,d)}b=c[p>>2]|0;if(!b){b=1;e=30;break}s=b+-1|0;f=c[r>>2]|0;b=c[f+(s<<3)>>2]|0;f=c[f+(s<<3)+4>>2]|0;c[d>>2]=f;e=c[k>>2]|0;g=(c[m>>2]|0)+(c[e+(f>>1<<3)>>2]<<2)|0;c[p>>2]=s}j=b+1|0}if((e|0)==8){if(g){e=(b>>1)+2&-2;e=(e|0)<2?2:e;if((e|0)>(2147483647-b|0)){s=ua(1)|0;La(s|0,16,0)}d=c[r>>2]|0;s=e+b|0;c[n>>2]=s;s=Rd(d,s<<3)|0;c[r>>2]=s;if((s|0)==0?(c[(Rc()|0)>>2]|0)==12:0){s=ua(1)|0;La(s|0,16,0)}b=c[p>>2]|0}c[p>>2]=b+1;b=(c[r>>2]|0)+(b<<3)|0;c[b>>2]=0;c[b+4>>2]=f;b=c[p>>2]|0;if((b|0)>0)f=0;else{s=0;return s|0}do{e=(c[q>>2]|0)+(c[(c[r>>2]|0)+(f<<3)+4>>2]>>1)|0;if(!(a[e>>0]|0)){a[e>>0]=3;Rb(o,(c[r>>2]|0)+(f<<3)+4|0);b=c[p>>2]|0}f=f+1|0}while((f|0)<(b|0));b=0;return b|0}else if((e|0)==22)La(ua(1)|0,16,0);else if((e|0)==30)return b|0;return 0}function ec(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;t=i;i=i+16|0;r=t+8|0;j=t+4|0;s=t;f=e+20|0;g=e+16|0;if((c[f>>2]|0)>0){h=0;do{a[(c[e>>2]|0)+(c[(c[g>>2]|0)+(h<<2)>>2]|0)>>0]=0;h=h+1|0}while((h|0)<(c[f>>2]|0))}if(c[g>>2]|0)c[f>>2]=0;f=c[d>>2]|0;c[j>>2]=f;c[r>>2]=c[j>>2];fc(e,r);if(!(c[b+296>>2]|0)){i=t;return}m=f>>1;n=b+588|0;a[(c[n>>2]|0)+m>>0]=1;g=c[b+284>>2]|0;o=b+292|0;f=c[c[o>>2]>>2]|0;if((g|0)>(f|0)){p=b+280|0;q=b+396|0;l=b+544|0;do{g=g+-1|0;h=c[(c[p>>2]|0)+(g<<2)>>2]|0;k=h>>1;if(a[(c[n>>2]|0)+k>>0]|0){d=c[q>>2]|0;f=c[d+(k<<3)>>2]|0;a:do if((f|0)!=-1){b=(c[l>>2]|0)+(f<<2)|0;f=c[b>>2]|0;if(f>>>0>63){j=1;while(1){h=c[b+4+(j<<2)>>2]>>1;if((c[d+(h<<3)+4>>2]|0)>0){a[(c[n>>2]|0)+h>>0]=1;f=c[b>>2]|0}h=j+1|0;if((h|0)>=(f>>>5|0))break a;d=c[q>>2]|0;j=h}}}else{c[s>>2]=h^1;c[r>>2]=c[s>>2];fc(e,r)}while(0);a[(c[n>>2]|0)+k>>0]=0;f=c[c[o>>2]>>2]|0}}while((g|0)>(f|0))}a[(c[n>>2]|0)+m>>0]=0;i=t;return}function fc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;h=c[d>>2]|0;i=h+1|0;j=b+4|0;if((c[j>>2]|0)<=(h|0)){f=b+8|0;g=c[f>>2]|0;if((g|0)<=(h|0)){k=h+2-g&-2;e=(g>>1)+2&-2;e=(k|0)>(e|0)?k:e;if((e|0)>(2147483647-g|0)){k=ua(1)|0;La(k|0,16,0)}l=c[b>>2]|0;k=e+g|0;c[f>>2]=k;k=Rd(l,k)|0;c[b>>2]=k;if((k|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}e=c[j>>2]|0;if((e|0)<=(h|0))do{a[(c[b>>2]|0)+e>>0]=0;e=e+1|0}while((e|0)!=(i|0));c[j>>2]=i}e=(c[b>>2]|0)+h|0;if(a[e>>0]|0)return;a[e>>0]=1;Rb(b+16|0,d);return}function gc(b){b=b|0;var e=0,f=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;w=i;i=i+16|0;j=w+4|0;o=w;v=b+272|0;q=c[v>>2]|0;r=+h[b+496>>3]/+(q|0);s=b+544|0;t=b+268|0;p=c[t>>2]|0;c[o>>2]=s;c[j>>2]=c[o>>2];hc(p,q,j);j=c[v>>2]|0;if((j|0)>0){p=b+332|0;q=b+396|0;f=0;e=0;do{k=c[t>>2]|0;l=c[k+(f<<2)>>2]|0;m=(c[s>>2]|0)+(l<<2)|0;n=c[m>>2]|0;do if(n>>>0>95){x=c[m+4>>2]|0;o=x>>1;x=(d[(c[p>>2]|0)+o>>0]|0)^x&1;z=a[7693]|0;y=z&255;if((x&255)<<24>>24==z<<24>>24&(y>>>1^1)|y&2&x|0?(z=c[(c[q>>2]|0)+(o<<3)>>2]|0,(z|0)!=-1&(z|0)==(l|0)):0){u=9;break}if((f|0)>=((j|0)/2|0|0)?!(+g[m+4+(n>>>5<<2)>>2]<r):0){u=9;break}Zb(b,l)}else u=9;while(0);if((u|0)==9){u=0;c[k+(e<<2)>>2]=l;e=e+1|0}f=f+1|0;j=c[v>>2]|0}while((f|0)<(j|0))}else{f=0;e=0}e=f-e|0;if((e|0)>0)c[v>>2]=j-e;if(!(+((c[b+556>>2]|0)>>>0)>+h[b+96>>3]*+((c[b+548>>2]|0)>>>0))){i=w;return}Za[c[(c[b>>2]|0)+8>>2]&31](b);i=w;return}function hc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;x=i;i=i+16|0;u=x+8|0;v=x+4|0;w=x;if((b|0)<16){if((b|0)<=1){i=x;return}l=c[d>>2]|0;m=b+-1|0;n=0;do{o=n;n=n+1|0;if((n|0)<(b|0)){j=c[l>>2]|0;e=o;k=n;do{f=j+(c[a+(k<<2)>>2]<<2)|0;w=c[f>>2]|0;h=w>>>5;do if(w>>>0>95){v=j+(c[a+(e<<2)>>2]<<2)|0;w=(c[v>>2]|0)>>>5;if((w|0)!=2?!(+g[f+4+(h<<2)>>2]<+g[v+4+(w<<2)>>2]):0)break;e=k}while(0);k=k+1|0}while((k|0)!=(b|0))}else e=o;u=a+(o<<2)|0;v=c[u>>2]|0;w=a+(e<<2)|0;c[u>>2]=c[w>>2];c[w>>2]=v}while((n|0)!=(m|0));i=x;return}t=c[a+(((b|0)/2|0)<<2)>>2]|0;f=-1;k=b;while(1){f=f+1|0;e=a+(f<<2)|0;m=c[e>>2]|0;h=c[d>>2]|0;s=c[h>>2]|0;l=s+(m<<2)|0;j=c[l>>2]|0;q=s+(t<<2)|0;r=c[q>>2]|0;a:do if(j>>>0>95){o=r>>>5;n=(o|0)==2;o=q+4+(o<<2)|0;do{if(!n?!(+g[l+4+(j>>>5<<2)>>2]<+g[o>>2]):0)break a;f=f+1|0;e=a+(f<<2)|0;m=c[e>>2]|0;l=s+(m<<2)|0;j=c[l>>2]|0}while(j>>>0>95)}while(0);k=k+-1|0;j=a+(k<<2)|0;b:do if(r>>>0>95){p=+g[q+4+(r>>>5<<2)>>2];while(1){q=s+(c[j>>2]<<2)|0;r=(c[q>>2]|0)>>>5;if((r|0)!=2?!(p<+g[q+4+(r<<2)>>2]):0)break b;r=k+-1|0;j=a+(r<<2)|0;k=r}}while(0);if((f|0)>=(k|0))break;c[e>>2]=c[j>>2];c[j>>2]=m}d=h;c[v>>2]=d;c[u>>2]=c[v>>2];hc(a,f,u);c[w>>2]=d;c[u>>2]=c[w>>2];hc(e,b-f|0,u);i=x;return}function ic(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;u=e+4|0;f=c[u>>2]|0;if((f|0)>0){s=b+544|0;t=b+332|0;g=0;f=0;do{i=c[e>>2]|0;h=c[i+(g<<2)>>2]|0;r=(c[s>>2]|0)+(h<<2)|0;p=c[r>>2]|0;do if(p>>>0>31){k=c[t>>2]|0;l=a[7693]|0;n=l&255;m=n&2;n=n>>>1^1;j=p>>>5;o=0;do{v=c[r+4+(o<<2)>>2]|0;v=(d[k+(v>>1)>>0]|0)^v&1;o=o+1|0;if((v&255)<<24>>24==l<<24>>24&n|m&v|0){q=8;break}}while((o|0)<(j|0));if((q|0)==8){q=0;Zb(b,h);break}if(p>>>0>95){i=p;k=2;do{h=r+4+(k<<2)|0;v=c[h>>2]|0;v=(d[(c[t>>2]|0)+(v>>1)>>0]|0)^v&1;p=a[7694]|0;q=p&255;if(!((v&255)<<24>>24==p<<24>>24&(q>>>1^1)|q&2&v))h=k;else{c[h>>2]=c[r+4+(j+-1<<2)>>2];h=c[r>>2]|0;if(h&8){h=h>>>5;c[r+4+(h+-1<<2)>>2]=c[r+4+(h<<2)>>2];h=c[r>>2]|0}i=h+-32|0;c[r>>2]=i;h=k+-1|0}k=h+1|0;j=i>>>5}while((k|0)<(j|0));h=c[e>>2]|0;i=h;h=c[h+(g<<2)>>2]|0;q=10}else q=10}else q=10;while(0);if((q|0)==10){q=0;c[i+(f<<2)>>2]=h;f=f+1|0}g=g+1|0;h=c[u>>2]|0}while((g|0)<(h|0))}else{h=f;g=0;f=0}f=g-f|0;if((f|0)<=0)return;c[u>>2]=h-f;return}function jc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;t=i;i=i+16|0;s=t;c[s>>2]=0;q=s+4|0;c[q>>2]=0;r=s+8|0;c[r>>2]=0;n=b+540|0;e=c[n>>2]|0;a:do if((e|0)>0){o=b+380|0;p=b+332|0;j=0;f=0;g=0;h=0;d=0;l=0;m=0;while(1){if((a[(c[o>>2]|0)+m>>0]|0)!=0?(u=a[(c[p>>2]|0)+m>>0]|0,v=a[7695]|0,k=v&255,((k>>>1^1)&u<<24>>24==v<<24>>24|u&2&k|0)!=0):0){if((f|0)==(g|0)){d=(f>>1)+2&-2;d=(d|0)<2?2:d;if((d|0)>(2147483647-f|0)){e=10;break}f=d+f|0;c[r>>2]=f;e=Rd(h,f<<2)|0;c[s>>2]=e;if(!e)if((c[(Rc()|0)>>2]|0)==12){e=10;break}else{k=e;j=e;d=e;l=e;h=0}else{k=e;j=e;d=e;l=e;h=e}}else k=j;v=g+1|0;c[q>>2]=v;c[j+(g<<2)>>2]=m;e=c[n>>2]|0;g=v}else k=j;m=m+1|0;if((m|0)>=(e|0))break a;else j=k}if((e|0)==10)La(ua(1)|0,16,0)}else d=0;while(0);kc(b+460|0,s);if(!d){i=t;return}c[q>>2]=0;Qd(d);c[s>>2]=0;c[r>>2]=0;i=t;return}function kc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0.0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=a+4|0;f=c[a>>2]|0;if((c[s>>2]|0)<=0){if(f|0)r=4}else{d=c[a+12>>2]|0;e=0;do{c[d+(c[f+(e<<2)>>2]<<2)>>2]=-1;e=e+1|0}while((e|0)<(c[s>>2]|0));r=4}if((r|0)==4)c[s>>2]=0;e=b+4|0;if((c[e>>2]|0)<=0)return;d=a+12|0;f=0;do{q=(c[b>>2]|0)+(f<<2)|0;c[(c[d>>2]|0)+(c[q>>2]<<2)>>2]=f;Qb(a,q);f=f+1|0}while((f|0)<(c[e>>2]|0));d=c[s>>2]|0;if((d|0)<=1)return;p=c[a>>2]|0;q=a+28|0;n=a+12|0;o=c[n>>2]|0;f=d;m=(d|0)/2|0;while(1){l=m+-1|0;k=c[p+(l<<2)>>2]|0;e=l<<1|1;a:do if((e|0)<(f|0)){d=l;while(1){a=(d<<1)+2|0;if((a|0)<(f|0)){j=c[p+(a<<2)>>2]|0;b=c[p+(e<<2)>>2]|0;f=c[c[q>>2]>>2]|0;i=+h[f+(j<<3)>>3];g=+h[f+(b<<3)>>3];if(i>g){g=i;b=j}else r=16}else{f=c[c[q>>2]>>2]|0;r=c[p+(e<<2)>>2]|0;b=r;g=+h[f+(r<<3)>>3];r=16}if((r|0)==16){r=0;a=e}if(!(g>+h[f+(k<<3)>>3]))break a;c[p+(d<<2)>>2]=b;c[(c[n>>2]|0)+(b<<2)>>2]=d;e=a<<1|1;f=c[s>>2]|0;if((e|0)>=(f|0)){d=a;break}else d=a}}else d=l;while(0);c[p+(d<<2)>>2]=k;c[o+(k<<2)>>2]=d;if((m|0)<=1)break;f=c[s>>2]|0;m=l}return}function lc(b){b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=b+492|0;if(a[d>>0]|0?(Ub(b)|0)==-1:0){o=b+284|0;p=b+516|0;if((c[o>>2]|0)==(c[p>>2]|0)){q=1;return q|0}m=b+520|0;n=m;l=c[n+4>>2]|0;if((l|0)>0|(l|0)==0&(c[n>>2]|0)>>>0>0){q=1;return q|0}ic(b,b+268|0);if(a[b+536>>0]|0){ic(b,b+256|0);l=b+564|0;n=b+568|0;if((c[n>>2]|0)>0){d=b+588|0;e=0;do{a[(c[d>>2]|0)+(c[(c[l>>2]|0)+(e<<2)>>2]|0)>>0]=1;e=e+1|0}while((e|0)<(c[n>>2]|0))}d=c[o>>2]|0;if((d|0)>0){i=c[b+280>>2]|0;j=c[b+588>>2]|0;f=0;e=0;do{g=c[i+(f<<2)>>2]|0;if(!(a[j+(g>>1)>>0]|0)){c[i+(e<<2)>>2]=g;d=c[o>>2]|0;e=e+1|0}f=f+1|0}while((f|0)<(d|0))}else{f=0;e=0}e=f-e|0;if((e|0)>0){d=d-e|0;c[o>>2]=d}c[b+512>>2]=d;a:do if((c[n>>2]|0)>0){e=b+588|0;f=0;do{a[(c[e>>2]|0)+(c[(c[l>>2]|0)+(f<<2)>>2]|0)>>0]=0;f=f+1|0;d=c[n>>2]|0}while((f|0)<(d|0));k=b+576|0;if((d|0)>0){g=b+580|0;i=b+584|0;j=0;while(1){e=c[g>>2]|0;if((e|0)==(c[i>>2]|0)){d=(e>>1)+2&-2;d=(d|0)<2?2:d;if((d|0)>(2147483647-e|0)){q=27;break}f=c[k>>2]|0;d=d+e|0;c[i>>2]=d;d=Rd(f,d<<2)|0;c[k>>2]=d;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0){q=27;break}f=d;d=c[g>>2]|0}else{f=c[k>>2]|0;d=e}c[f+(d<<2)>>2]=0;e=c[g>>2]|0;c[g>>2]=e+1;d=c[l>>2]|0;c[f+(e<<2)>>2]=c[d+(j<<2)>>2];j=j+1|0;if((j|0)>=(c[n>>2]|0))break a}if((q|0)==27)La(ua(1)|0,16,0)}else q=20}else q=20;while(0);if((q|0)==20)d=c[l>>2]|0;if(d|0)c[n>>2]=0}if(+((c[b+556>>2]|0)>>>0)>+h[b+96>>3]*+((c[b+548>>2]|0)>>>0))Za[c[(c[b>>2]|0)+8>>2]&31](b);jc(b);c[p>>2]=c[o>>2];q=b+224|0;b=b+232|0;b=Ce(c[b>>2]|0,c[b+4>>2]|0,c[q>>2]|0,c[q+4>>2]|0)|0;q=m;c[q>>2]=b;c[q+4>>2]=D;q=1;return q|0}a[d>>0]=0;q=0;return q|0}function mc(b,e){b=b|0;e=e|0;var f=0,j=0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0;ta=i;i=i+64|0;ka=ta+60|0;ja=ta;ia=ta+52|0;sa=ta+40|0;la=ta+56|0;c[sa>>2]=0;qa=sa+4|0;c[qa>>2]=0;ra=sa+8|0;c[ra>>2]=0;z=b+160|0;A=z;A=Ce(c[A>>2]|0,c[A+4>>2]|0,1,0)|0;c[z>>2]=A;c[z+4>>2]=D;z=(e|0)<0;A=b+680|0;B=b+664|0;C=b+672|0;ma=b+296|0;E=b+272|0;oa=b+284|0;F=b+640|0;G=b+308|0;H=b+168|0;I=b+292|0;J=b+332|0;K=b+396|0;L=b+280|0;M=b+304|0;N=b+184|0;O=b+192|0;P=b+48|0;R=b+504|0;S=b+56|0;T=b+496|0;U=b+656|0;V=b+144|0;W=b+648|0;X=b+128|0;Y=b+44|0;Z=b+200|0;_=b+208|0;$=b+224|0;aa=b+216|0;ba=b+232|0;ca=b+540|0;pa=b+292|0;da=b+544|0;ea=b+268|0;fa=b+276|0;ga=b+268|0;ha=b+544|0;p=0;a:while(1){m=z|(p|0)<(e|0);while(1){f=Ub(b)|0;if((f|0)!=-1)break;if(!m){na=38;break a}if(a[A>>0]|0){na=38;break a}f=B;j=c[f+4>>2]|0;if((j|0)>=0?(y=O,x=c[y+4>>2]|0,!(x>>>0<j>>>0|((x|0)==(j|0)?(c[y>>2]|0)>>>0<(c[f>>2]|0)>>>0:0))):0){na=38;break a}f=C;j=c[f+4>>2]|0;if((j|0)>=0?(y=N,x=c[y+4>>2]|0,!(x>>>0<j>>>0|((x|0)==(j|0)?(c[y>>2]|0)>>>0<(c[f>>2]|0)>>>0:0))):0){na=38;break a}if((c[ma>>2]|0)==0?!(lc(b)|0):0){f=7694;break a}if(+((c[E>>2]|0)-(c[oa>>2]|0)|0)>=+h[F>>3])gc(b);f=c[ma>>2]|0;b:do if((f|0)<(c[G>>2]|0)){while(1){f=c[(c[M>>2]|0)+(f<<2)>>2]|0;l=d[(c[J>>2]|0)+(f>>1)>>0]|0;y=l^f&1;j=y&255;w=a[7693]|0;x=w&255;if(!(j<<24>>24==w<<24>>24&(x>>>1^1)|x&2&y))break;c[ka>>2]=c[oa>>2];Qb(I,ka);f=c[ma>>2]|0;if((f|0)>=(c[G>>2]|0)){na=55;break b}}x=a[7694]|0;y=x&255;if((y>>>1^1)&j<<24>>24==x<<24>>24|l&2&y|0){na=53;break a}if((f|0)==-2)na=55}else na=55;while(0);if((na|0)==55){na=0;y=H;y=Ce(c[y>>2]|0,c[y+4>>2]|0,1,0)|0;f=H;c[f>>2]=y;c[f+4>>2]=D;f=ac(b)|0;if((f|0)==-2){f=7693;break a}}c[ka>>2]=c[oa>>2];Qb(I,ka);y=f>>1;a[(c[J>>2]|0)+y>>0]=(f&1^1)&255^1;x=c[ma>>2]|0;y=(c[K>>2]|0)+(y<<3)|0;c[y>>2]=-1;c[y+4>>2]=x;y=c[oa>>2]|0;c[oa>>2]=y+1;c[(c[L>>2]|0)+(y<<2)>>2]=f}x=O;x=Ce(c[x>>2]|0,c[x+4>>2]|0,1,0)|0;y=O;c[y>>2]=x;c[y+4>>2]=D;y=p+1|0;if(!(c[ma>>2]|0)){f=7694;break}if(c[sa>>2]|0)c[qa>>2]=0;cc(b,f,sa,ia);$b(b,c[ia>>2]|0);if((c[qa>>2]|0)==1){w=c[c[sa>>2]>>2]|0;x=w>>1;a[(c[J>>2]|0)+x>>0]=(w&1^1)&255^1;u=c[ma>>2]|0;x=(c[K>>2]|0)+(x<<3)|0;c[x>>2]=-1;c[x+4>>2]=u;x=c[oa>>2]|0;c[oa>>2]=x+1;c[(c[L>>2]|0)+(x<<2)>>2]=w}else{p=Vb(da,sa,1)|0;f=c[E>>2]|0;if((f|0)==(c[fa>>2]|0)){j=(f>>1)+2&-2;j=(j|0)<2?2:j;if((j|0)>(2147483647-f|0)){na=13;break}w=c[ea>>2]|0;x=j+f|0;c[fa>>2]=x;x=Rd(w,x<<2)|0;c[ea>>2]=x;if((x|0)==0?(c[(Rc()|0)>>2]|0)==12:0){na=13;break}f=c[E>>2]|0}c[E>>2]=f+1;c[(c[ea>>2]|0)+(f<<2)>>2]=p;Wb(b,p);x=(c[da>>2]|0)+(p<<2)|0;k=+h[T>>3];x=x+4+((c[x>>2]|0)>>>5<<2)|0;v=k+ +g[x>>2];g[x>>2]=v;if(v>1.0e20){f=c[E>>2]|0;if((f|0)>0){j=c[ga>>2]|0;l=c[ha>>2]|0;m=0;do{x=l+(c[j+(m<<2)>>2]<<2)|0;x=x+4+((c[x>>2]|0)>>>5<<2)|0;g[x>>2]=+g[x>>2]*1.0e-20;m=m+1|0}while((m|0)!=(f|0))}h[T>>3]=k*1.0e-20}w=c[c[sa>>2]>>2]|0;x=w>>1;a[(c[J>>2]|0)+x>>0]=(w&1^1)&255^1;u=c[ma>>2]|0;x=(c[K>>2]|0)+(x<<3)|0;c[x>>2]=p;c[x+4>>2]=u;x=c[oa>>2]|0;c[oa>>2]=x+1;c[(c[L>>2]|0)+(x<<2)>>2]=w}h[R>>3]=+h[R>>3]*(1.0/+h[P>>3]);h[T>>3]=+h[T>>3]*(1.0/+h[S>>3]);x=(c[U>>2]|0)+-1|0;c[U>>2]=x;if(x|0){p=y;continue}v=+h[V>>3]*+h[W>>3];h[W>>3]=v;c[U>>2]=~~v;v=+h[X>>3]*+h[F>>3];h[F>>3]=v;if((c[Y>>2]|0)<=0){p=y;continue}w=c[O>>2]|0;x=c[Z>>2]|0;m=c[ma>>2]|0;if(!m)f=oa;else f=c[pa>>2]|0;p=c[f>>2]|0;q=c[_>>2]|0;r=c[$>>2]|0;s=c[aa>>2]|0;u=ba;t=c[u>>2]|0;u=c[u+4>>2]|0;o=+(c[ca>>2]|0);n=1.0/o;if((m|0)<0)k=0.0;else{l=0;k=0.0;while(1){if(!l)j=0;else j=c[(c[pa>>2]|0)+(l+-1<<2)>>2]|0;if((l|0)==(m|0))f=oa;else f=(c[pa>>2]|0)+(l<<2)|0;k=k+ +Q(+n,+(+(l|0)))*+((c[f>>2]|0)-j|0);if((l|0)==(m|0))break;else l=l+1|0}}c[ja>>2]=w;c[ja+4>>2]=x-p;c[ja+8>>2]=q;c[ja+12>>2]=r;c[ja+16>>2]=~~v;c[ja+20>>2]=s;h[ja+24>>3]=(+(t>>>0)+4294967296.0*+(u>>>0))/+(s|0);h[ja+32>>3]=k/o*100.0;Nd(1935,ja)|0;p=y}if((na|0)==13)La(ua(1)|0,16,0);else if((na|0)==38){o=+(c[ca>>2]|0);n=1.0/o;l=c[ma>>2]|0;if((l|0)<0)k=0.0;else{m=0;k=0.0;while(1){if(!m)j=0;else j=c[(c[pa>>2]|0)+(m+-1<<2)>>2]|0;if((m|0)==(l|0))f=oa;else f=(c[pa>>2]|0)+(m<<2)|0;k=k+ +Q(+n,+(+(m|0)))*+((c[f>>2]|0)-j|0);if((m|0)==(l|0))break;else m=m+1|0}}h[b+528>>3]=k/o;$b(b,0);f=7695}else if((na|0)==53){c[la>>2]=f^1;c[ka>>2]=c[la>>2];ec(b,ka,b+16|0);f=7694}f=a[f>>0]|0;j=c[sa>>2]|0;if(!j){i=ta;return f|0}c[qa>>2]=0;Qd(j);c[sa>>2]=0;c[ra>>2]=0;i=ta;return f|0}function nc(b){b=b|0;var d=0,e=0.0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0;v=b+4|0;if(c[v>>2]|0)c[b+8>>2]=0;u=b+36|0;d=b+32|0;if((c[u>>2]|0)>0){f=b+16|0;g=0;do{a[(c[f>>2]|0)+(c[(c[d>>2]|0)+(g<<2)>>2]|0)>>0]=0;g=g+1|0}while((g|0)<(c[u>>2]|0))}if(c[d>>2]|0)c[u>>2]=0;t=b+492|0;if(!(a[t>>0]|0)){b=a[7694]|0;return b|0}d=b+152|0;s=d;s=Ce(c[s>>2]|0,c[s+4>>2]|0,1,0)|0;c[d>>2]=s;c[d+4>>2]=D;w=+h[b+120>>3]*+(c[b+208>>2]|0);d=b+640|0;h[d>>3]=w;e=+(c[b+104>>2]|0);if(w<e)h[d>>3]=e;d=c[b+136>>2]|0;h[b+648>>3]=+(d|0);c[b+656>>2]=d;d=a[7695]|0;s=b+44|0;if((c[s>>2]|0)>0){Od(1985)|0;Od(2065)|0;Od(2145)|0;Od(3030)|0;f=a[7695]|0}else f=d;q=b+192|0;r=b+184|0;p=f&255;a:do if(!((p>>>1^1)&d<<24>>24==f<<24>>24|d&2&p))l=d;else{j=b+80|0;k=b+112|0;m=b+108|0;n=b+680|0;o=b+664|0;p=b+672|0;d=0;do{e=+h[k>>3];if(!(a[j>>0]|0))e=+Q(+e,+(+(d|0)));else{if((d|0)<1){f=0;g=0}else{f=0;g=1;do{f=f+1|0;g=g<<1|1}while((g|0)<=(d|0));g=g+-1|0}if((g|0)!=(d|0)){i=d;do{l=g>>1;f=f+-1|0;i=(i|0)%(l|0)|0;g=l+-1|0}while((g|0)!=(i|0))}e=+Q(+e,+(+(f|0)))}l=mc(b,~~(e*+(c[m>>2]|0)))|0;if(a[n>>0]|0)break a;f=o;g=c[f+4>>2]|0;if((g|0)>=0?(i=q,x=c[i+4>>2]|0,!(x>>>0<g>>>0|((x|0)==(g|0)?(c[i>>2]|0)>>>0<(c[f>>2]|0)>>>0:0))):0)break a;f=p;g=c[f+4>>2]|0;if((g|0)>=0){x=r;i=c[x+4>>2]|0;f=i>>>0<g>>>0|((i|0)==(g|0)?(c[x>>2]|0)>>>0<(c[f>>2]|0)>>>0:0);if(f)d=(f&1)+d|0;else break a}else d=d+1|0;i=a[7695]|0;x=i&255}while(((x>>>1^1)&l<<24>>24==i<<24>>24|l&2&x|0)!=0)}while(0);if((c[s>>2]|0)>0)Od(3030)|0;s=a[7693]|0;x=s&255;d=l&2;if(!((x>>>1^1)&l<<24>>24==s<<24>>24|d&x)){v=a[7694]|0;x=v&255;if((x>>>1^1)&l<<24>>24==v<<24>>24|d&x|0?(c[u>>2]|0)==0:0)a[t>>0]=0}else{k=b+540|0;d=c[k>>2]|0;j=b+8|0;if((c[j>>2]|0)<(d|0)){f=b+12|0;g=c[f>>2]|0;if((g|0)<(d|0)){x=d+1-g&-2;i=(g>>1)+2&-2;i=(x|0)>(i|0)?x:i;if((i|0)>(2147483647-g|0)){x=ua(1)|0;La(x|0,16,0)}u=c[v>>2]|0;x=i+g|0;c[f>>2]=x;x=Rd(u,x)|0;c[v>>2]=x;if((x|0)==0?(c[(Rc()|0)>>2]|0)==12:0){x=ua(1)|0;La(x|0,16,0)}}f=c[j>>2]|0;if((d|0)>(f|0))Ae((c[v>>2]|0)+f|0,0,d-f|0)|0;c[j>>2]=d;d=c[k>>2]|0}if((d|0)>0){d=b+332|0;f=0;do{a[(c[v>>2]|0)+f>>0]=a[(c[d>>2]|0)+f>>0]|0;f=f+1|0}while((f|0)<(c[k>>2]|0))}}$b(b,0);x=l;return x|0}function oc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=332;b=a+904|0;d=c[b>>2]|0;if(d|0){c[a+908>>2]=0;Qd(d);c[b>>2]=0;c[a+912>>2]=0}b=a+892|0;d=c[b>>2]|0;if(d|0){c[a+896>>2]=0;Qd(d);c[b>>2]=0;c[a+900>>2]=0}b=a+876|0;d=c[b>>2]|0;if(d|0){c[a+880>>2]=0;Qd(d);c[b>>2]=0;c[a+884>>2]=0}b=a+856|0;d=c[b>>2]|0;if(d|0){c[a+860>>2]=0;Qd(d);c[b>>2]=0;c[a+864>>2]=0}b=a+836|0;d=c[b>>2]|0;if(d|0){c[a+840>>2]=0;Qd(d);c[b>>2]=0;c[a+844>>2]=0}b=a+824|0;d=c[b>>2]|0;if(d|0){c[a+828>>2]=0;Qd(d);c[b>>2]=0;c[a+832>>2]=0}b=a+808|0;d=c[b>>2]|0;if(d|0){c[a+812>>2]=0;Qd(d);c[b>>2]=0;c[a+816>>2]=0}i=a+760|0;b=a+792|0;d=c[b>>2]|0;if(d|0){c[a+796>>2]=0;Qd(d);c[b>>2]=0;c[a+800>>2]=0}b=a+776|0;d=c[b>>2]|0;if(d|0){c[a+780>>2]=0;Qd(d);c[b>>2]=0;c[a+784>>2]=0}b=c[i>>2]|0;if(b|0){h=a+764|0;d=c[h>>2]|0;if((d|0)>0){e=0;while(1){f=b+(e*12|0)|0;g=c[f>>2]|0;if(g){c[b+(e*12|0)+4>>2]=0;Qd(g);c[f>>2]=0;c[b+(e*12|0)+8>>2]=0;d=c[h>>2]|0}e=e+1|0;if((e|0)>=(d|0))break;b=c[i>>2]|0}b=c[i>>2]|0}c[h>>2]=0;Qd(b);c[i>>2]=0;c[a+768>>2]=0}b=a+744|0;d=c[b>>2]|0;if(d|0){c[a+748>>2]=0;Qd(d);c[b>>2]=0;c[a+752>>2]=0}b=a+732|0;d=c[b>>2]|0;if(!d){Bb(a);return}c[a+736>>2]=0;Qd(d);c[b>>2]=0;c[a+740>>2]=0;Bb(a);return}function pc(a){a=a|0;oc(a);ae(a);return}function qc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;l=i;i=i+32|0;f=l;k=l+8|0;g=b+544|0;h=b+548|0;j=b+556|0;d=(c[h>>2]|0)-(c[j>>2]|0)|0;c[k>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;Eb(k,d);d=k+16|0;e=b+560|0;a[d>>0]=a[e>>0]|0;rc(b,k);Fb(b,k);if((c[b+44>>2]|0)>1){m=c[k+4>>2]<<2;c[f>>2]=c[h>>2]<<2;c[f+4>>2]=m;Nd(2248,f)|0}a[e>>0]=a[d>>0]|0;d=c[g>>2]|0;if(d|0)Qd(d);c[g>>2]=c[k>>2];c[h>>2]=c[k+4>>2];c[b+552>>2]=c[k+8>>2];c[j>>2]=c[k+12>>2];i=l;return}function rc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;if(!(a[b+724>>0]|0))return;k=b+540|0;if((c[k>>2]|0)>0){l=b+760|0;m=b+804|0;n=b+776|0;o=b+544|0;p=0;do{e=c[l>>2]|0;j=e+(p*12|0)+4|0;f=c[j>>2]|0;if((f|0)>0){i=c[e+(p*12|0)>>2]|0;g=0;e=0;do{h=c[i+(g<<2)>>2]|0;if((c[(c[c[m>>2]>>2]|0)+(h<<2)>>2]&3|0)!=1){c[i+(e<<2)>>2]=h;f=c[j>>2]|0;e=e+1|0}g=g+1|0}while((g|0)<(f|0))}else{g=0;e=0}e=g-e|0;if((e|0)>0)c[j>>2]=f-e;a[(c[n>>2]|0)+p>>0]=0;e=c[l>>2]|0;i=e+(p*12|0)+4|0;if((c[i>>2]|0)>0){e=e+(p*12|0)|0;h=0;do{f=(c[e>>2]|0)+(h<<2)|0;g=(c[o>>2]|0)+(c[f>>2]<<2)|0;if(!(c[g>>2]&16)){j=Gb(d,g)|0;c[f>>2]=j;c[g>>2]=c[g>>2]|16;c[g+4>>2]=j}else c[f>>2]=c[g+4>>2];h=h+1|0}while((h|0)<(c[i>>2]|0))}p=p+1|0}while((p|0)<(c[k>>2]|0))}j=b+856|0;p=c[b+872>>2]|0;k=b+868|0;f=c[k>>2]|0;e=p-f|0;if((p|0)<(f|0))g=(c[b+860>>2]|0)+e|0;else g=e;a:do if((g|0)>0){i=b+860|0;e=b+544|0;h=g;while(1){g=c[(c[j>>2]|0)+(f<<2)>>2]|0;f=f+1|0;c[k>>2]=(f|0)==(c[i>>2]|0)?0:f;f=(c[e>>2]|0)+(g<<2)|0;g=c[f>>2]|0;if(!(g&3)){if(!(g&16)){p=Gb(d,f)|0;c[f>>2]=c[f>>2]|16;c[f+4>>2]=p;f=p}else f=c[f+4>>2]|0;sc(j,f)}if((h|0)<=1)break a;f=c[k>>2]|0;h=h+-1|0}}else e=b+544|0;while(0);f=b+928|0;e=(c[e>>2]|0)+(c[f>>2]<<2)|0;if(!(c[e>>2]&16)){d=Gb(d,e)|0;c[f>>2]=d;c[e>>2]=c[e>>2]|16;c[e+4>>2]=d;return}else{c[f>>2]=c[e+4>>2];return}}function sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;l=a+16|0;m=c[l>>2]|0;c[l>>2]=m+1;c[(c[a>>2]|0)+(m<<2)>>2]=b;b=c[l>>2]|0;m=a+4|0;d=c[m>>2]|0;if((b|0)==(d|0)){c[l>>2]=0;b=0}k=a+12|0;if((c[k>>2]|0)!=(b|0))return;g=(d*3|0)+1>>1;if((g|0)>0){f=g+1&-2;f=(f|0)>2?f:2;b=Rd(0,f<<2)|0;e=b;if((b|0)==0?(c[(Rc()|0)>>2]|0)==12:0)La(ua(1)|0,16,0);Ae(b|0,0,g<<2|0)|0;b=c[k>>2]|0;d=c[m>>2]|0;j=g}else{e=0;j=0;f=0}if((b|0)<(d|0)){h=c[a>>2]|0;i=e;g=0;while(1){d=g+1|0;c[i+(g<<2)>>2]=c[h+(b<<2)>>2];b=b+1|0;g=c[m>>2]|0;if((b|0)>=(g|0)){b=g;break}else g=d}}else{b=d;d=0}if((c[l>>2]|0)>0){g=c[a>>2]|0;h=e;b=0;while(1){c[h+(d<<2)>>2]=c[g+(b<<2)>>2];b=b+1|0;if((b|0)>=(c[l>>2]|0))break;else d=d+1|0}b=c[m>>2]|0}c[k>>2]=0;c[l>>2]=b;b=c[a>>2]|0;if(!b)b=a+8|0;else{c[m>>2]=0;Qd(b);c[a>>2]=0;b=a+8|0;c[b>>2]=0}c[a>>2]=e;c[m>>2]=j;c[b>>2]=f;return}function tc(){var b=0;a[7696]=0;a[7697]=1;a[7698]=2;nb(6968,2318,2324,2313,2364);c[1742]=264;a[6988]=0;nb(6992,2371,2378,2313,2364);c[1748]=264;a[7012]=0;nb(7016,2425,2430,2313,2364);c[1754]=264;a[7036]=1;nb(7040,2460,2465,2313,2531);c[1760]=240;b=7060;c[b>>2]=-2147483648;c[b+4>>2]=2147483647;c[1767]=0;nb(7072,2539,2546,2313,2531);c[1768]=240;b=7092;c[b>>2]=-1;c[b+4>>2]=2147483647;c[1775]=20;nb(7104,2652,2660,2313,2531);c[1776]=240;b=7124;c[b>>2]=-1;c[b+4>>2]=2147483647;c[1783]=1e3;nb(6720,2742,2755,2313,2857);c[1680]=308;h[843]=0.0;h[844]=t;a[6760]=0;a[6761]=0;h[846]=.5;return}function uc(b){b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0;k=i;i=i+16|0;j=k;Lb(b);c[b>>2]=332;c[b+684>>2]=c[1767];c[b+688>>2]=c[1775];c[b+692>>2]=c[1783];h[b+696>>3]=+h[846];a[b+704>>0]=a[6988]|0;a[b+705>>0]=a[7012]|0;a[b+706>>0]=a[7036]|0;a[b+707>>0]=1;c[b+708>>2]=0;c[b+712>>2]=0;c[b+716>>2]=0;c[b+720>>2]=1;a[b+724>>0]=1;f=b+732|0;g=b+544|0;c[b+760>>2]=0;c[b+764>>2]=0;c[b+768>>2]=0;c[b+776>>2]=0;c[b+780>>2]=0;c[b+784>>2]=0;c[b+792>>2]=0;c[b+796>>2]=0;c[b+800>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[b+804>>2]=g;f=b+808|0;c[f>>2]=0;c[b+812>>2]=0;c[b+816>>2]=0;d=b+824|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;c[b+852>>2]=f;f=b+856|0;c[f>>2]=0;d=b+860|0;c[d>>2]=0;c[b+864>>2]=2;e=Rd(0,8)|0;c[f>>2]=e;if((e|0)==0?(c[(Rc()|0)>>2]|0)==12:0)La(ua(1)|0,16,0);f=c[d>>2]|0;if((f|0)<1)Ae(e+(f<<2)|0,0,1-f<<2|0)|0;c[d>>2]=1;f=b+868|0;e=b+892|0;c[b+920>>2]=0;c[b+924>>2]=0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;e=j+4|0;c[e>>2]=0;f=j+8|0;c[f>>2]=2;d=Rd(0,8)|0;c[j>>2]=d;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0)La(ua(1)|0,16,0);c[d>>2]=-2;c[e>>2]=1;a[b+560>>0]=1;c[b+928>>2]=Vb(g,j,0)|0;a[b+536>>0]=0;d=c[j>>2]|0;if(!d){i=k;return}c[e>>2]=0;Qd(d);c[j>>2]=0;c[f>>2]=0;i=k;return}function vc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;k=i;i=i+32|0;f=k+12|0;j=k+4|0;l=k+16|0;g=k+8|0;h=k;a[l>>0]=a[d>>0]|0;a[f>>0]=a[l>>0]|0;e=Mb(b,f,e)|0;c[j>>2]=e;Ob(b+876|0,e,0);Ob(b+904|0,e,0);if(!(a[b+724>>0]|0)){i=k;return e|0}l=b+808|0;d=e<<1;c[g>>2]=d;c[f>>2]=c[g>>2];wc(l,f,0);c[h>>2]=d|1;c[f>>2]=c[h>>2];wc(l,f,0);xc(b+760|0,j);Ob(b+744|0,e,0);yc(b+824|0,e);i=k;return e|0}function wc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;g=c[b>>2]|0;h=g+1|0;i=a+4|0;if((c[i>>2]|0)>(g|0)){a=c[a>>2]|0;a=a+(g<<2)|0;c[a>>2]=d;return}e=a+8|0;f=c[e>>2]|0;if((f|0)<=(g|0)){j=g+2-f&-2;b=(f>>1)+2&-2;b=(j|0)>(b|0)?j:b;if((b|0)>(2147483647-f|0)){j=ua(1)|0;La(j|0,16,0)}k=c[a>>2]|0;j=b+f|0;c[e>>2]=j;j=Rd(k,j<<2)|0;c[a>>2]=j;if((j|0)==0?(c[(Rc()|0)>>2]|0)==12:0){k=ua(1)|0;La(k|0,16,0)}}b=c[i>>2]|0;if((g|0)>=(b|0))Ae((c[a>>2]|0)+(b<<2)|0,0,h-b<<2|0)|0;c[i>>2]=h;k=c[a>>2]|0;k=k+(g<<2)|0;c[k>>2]=d;return}function xc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=c[d>>2]|0;i=f+1|0;j=b+4|0;if((c[j>>2]|0)<=(f|0)){g=b+8|0;h=c[g>>2]|0;if((h|0)<=(f|0)){k=f+2-h&-2;e=(h>>1)+2&-2;e=(k|0)>(e|0)?k:e;if((e|0)>(2147483647-h|0)){k=ua(1)|0;La(k|0,16,0)}l=c[b>>2]|0;k=e+h|0;c[g>>2]=k;k=Rd(l,k*12|0)|0;c[b>>2]=k;if((k|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}e=c[j>>2]|0;if((e|0)<=(f|0)){f=c[b>>2]|0;do{c[f+(e*12|0)>>2]=0;c[f+(e*12|0)+4>>2]=0;c[f+(e*12|0)+8>>2]=0;e=e+1|0}while((e|0)!=(i|0))}c[j>>2]=i;f=c[d>>2]|0}e=c[b>>2]|0;if(c[e+(f*12|0)>>2]|0){c[e+(f*12|0)+4>>2]=0;f=c[d>>2]|0}i=b+16|0;j=f+1|0;d=b+20|0;if((c[d>>2]|0)>(f|0))return;e=b+24|0;g=c[e>>2]|0;if((g|0)<=(f|0)){l=f+2-g&-2;h=(g>>1)+2&-2;h=(l|0)>(h|0)?l:h;if((h|0)>(2147483647-g|0)){l=ua(1)|0;La(l|0,16,0)}k=c[i>>2]|0;l=h+g|0;c[e>>2]=l;l=Rd(k,l)|0;c[i>>2]=l;if((l|0)==0?(c[(Rc()|0)>>2]|0)==12:0){l=ua(1)|0;La(l|0,16,0)}}e=c[d>>2]|0;if((e|0)<=(f|0))do{a[(c[i>>2]|0)+e>>0]=0;e=e+1|0}while((e|0)!=(j|0));c[d>>2]=j;return}function yc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;n=i;i=i+16|0;g=n;c[g>>2]=b;h=a+12|0;j=b+1|0;k=a+16|0;if((c[k>>2]|0)<=(b|0)){e=a+20|0;f=c[e>>2]|0;if((f|0)<=(b|0)){m=b+2-f&-2;d=(f>>1)+2&-2;d=(m|0)>(d|0)?m:d;if((d|0)>(2147483647-f|0)){n=ua(1)|0;La(n|0,16,0)}l=c[h>>2]|0;m=d+f|0;c[e>>2]=m;m=Rd(l,m<<2)|0;c[h>>2]=m;if((m|0)==0?(c[(Rc()|0)>>2]|0)==12:0){n=ua(1)|0;La(n|0,16,0)}}d=c[k>>2]|0;if((d|0)<=(b|0))Ae((c[h>>2]|0)+(d<<2)|0,-1,j-d<<2|0)|0;c[k>>2]=j}c[(c[h>>2]|0)+(b<<2)>>2]=c[a+4>>2];Qb(a,g);m=c[h>>2]|0;d=c[m+(b<<2)>>2]|0;b=c[a>>2]|0;l=c[b+(d<<2)>>2]|0;if(!d){a=0;b=b+(a<<2)|0;c[b>>2]=l;m=m+(l<<2)|0;c[m>>2]=a;i=n;return}h=a+28|0;j=l<<1;k=j|1;e=d;while(1){d=e;e=e+-1>>1;f=b+(e<<2)|0;g=c[f>>2]|0;r=c[c[h>>2]>>2]|0;o=c[r+(j<<2)>>2]|0;q=c[r+(k<<2)>>2]|0;o=Ke(q|0,((q|0)<0)<<31>>31|0,o|0,((o|0)<0)<<31>>31|0)|0;q=D;p=g<<1;a=c[r+(p<<2)>>2]|0;p=c[r+((p|1)<<2)>>2]|0;a=Ke(p|0,((p|0)<0)<<31>>31|0,a|0,((a|0)<0)<<31>>31|0)|0;p=D;if(!(q>>>0<p>>>0|(q|0)==(p|0)&o>>>0<a>>>0)){e=14;break}c[b+(d<<2)>>2]=g;c[m+(c[f>>2]<<2)>>2]=d;if(!e){d=0;e=14;break}}if((e|0)==14){r=b+(d<<2)|0;c[r>>2]=l;r=m+(l<<2)|0;c[r>>2]=d;i=n;return}}function zc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=a[7696]|0;v=b+724|0;t=(d[v>>0]&(e&1)|0)!=0;if(t){o=b+308|0;e=c[o>>2]|0;a:do if((e|0)>0){m=b+304|0;n=b+876|0;g=0;h=0;k=0;l=0;while(1){j=c[(c[m>>2]|0)+(l<<2)>>2]>>1;i=(c[n>>2]|0)+j|0;if(!(a[i>>0]|0)){a[i>>0]=1;if((k|0)==(h|0)){e=(k>>1)+2&-2;e=(e|0)<2?2:e;if((e|0)>(2147483647-k|0)){u=10;break}e=e+k|0;g=Rd(g,e<<2)|0;if((g|0)==0?(c[(Rc()|0)>>2]|0)==12:0){u=10;break}else i=e}else i=k;c[g+(h<<2)>>2]=j;e=c[o>>2]|0;h=h+1|0}else i=k;l=l+1|0;if((l|0)>=(e|0))break a;else k=i}if((u|0)==10)La(ua(1)|0,16,0)}else{g=0;h=0}while(0);i=(Ac(b,f)|0)&1^1;e=a[7696]|0;s=g;r=h}else{i=g;e=g;s=0;r=0}p=e&255;if(!((p>>>1^1)&i<<24>>24==e<<24>>24|i&2&p)){if((c[b+44>>2]|0)>0)Od(3030)|0}else i=nc(b)|0;f=a[7696]|0;p=f&255;if(((p>>>1^1)&i<<24>>24==f<<24>>24|i&2&p|0?a[b+707>>0]|0:0)?(q=c[b+736>>2]|0,(q|0)>1):0){f=b+732|0;p=b+4|0;g=q+-1|0;do{n=c[f>>2]|0;e=c[n+(g<<2)>>2]|0;g=g+-1|0;h=c[n+(g<<2)>>2]|0;j=h>>1;o=c[p>>2]|0;h=h&1;b:do if((e|0)>1){k=a[7697]|0;m=k&255;l=m&2;m=m>>>1^1;while(1){q=d[o+j>>0]^h;if(!((q&255)<<24>>24==k<<24>>24&m|l&q))break b;e=e+-1|0;g=g+-1|0;h=c[n+(g<<2)>>2]|0;j=h>>1;h=h&1;if((e|0)<=1){u=25;break}}}else u=25;while(0);if((u|0)==25){u=0;a[o+j>>0]=(h^1)&255^1}g=g-e|0}while((g|0)>0)}if(t&(r|0)>0){e=b+876|0;h=0;do{g=c[s+(h<<2)>>2]|0;a[(c[e>>2]|0)+g>>0]=0;if(a[v>>0]|0)Ec(b,g);h=h+1|0}while((h|0)<(r|0))}if(!s)return i|0;Qd(s);return i|0}function Ac(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;H=i;i=i+16|0;G=H+8|0;x=H;if(!(lc(b)|0)){G=0;i=H;return G|0}C=b+724|0;if(!(a[C>>0]|0)){G=1;i=H;return G|0}r=b+924|0;s=b+872|0;t=b+868|0;u=b+860|0;v=b+680|0;w=b+824|0;D=b+828|0;A=b+836|0;j=b+904|0;k=b+332|0;E=b+44|0;l=b+704|0;m=b+706|0;n=b+696|0;y=b+556|0;z=b+548|0;o=b+876|0;p=b+920|0;q=b+284|0;a:while(1){if(((c[r>>2]|0)<=0?(c[p>>2]|0)>=(c[q>>2]|0):0)?(c[D>>2]|0)<=0:0)break;Bc(b);f=c[s>>2]|0;g=c[t>>2]|0;e=f-g|0;if((f|0)<(g|0))e=(c[u>>2]|0)+e|0;if(!((e|0)<=0?(c[p>>2]|0)>=(c[q>>2]|0):0))B=11;if((B|0)==11?(B=0,!(Cc(b,1)|0)):0){B=12;break}e=c[D>>2]|0;if(a[v>>0]|0){B=15;break}if(!e)continue;else g=0;while(1){J=c[w>>2]|0;f=c[J>>2]|0;I=c[J+(e+-1<<2)>>2]|0;c[J>>2]=I;e=c[A>>2]|0;c[e+(I<<2)>>2]=0;c[e+(f<<2)>>2]=-1;e=(c[D>>2]|0)+-1|0;c[D>>2]=e;if((e|0)>1)Fc(w,0);if(a[v>>0]|0)continue a;if((a[(c[j>>2]|0)+f>>0]|0)==0?(I=a[(c[k>>2]|0)+f>>0]|0,e=a[7698]|0,J=e&255,(J>>>1^1)&I<<24>>24==e<<24>>24|I&2&J|0):0){if(((g|0)%100|0|0)==0&(c[E>>2]|0)>1){c[x>>2]=c[D>>2];Nd(2929,x)|0}e=c[l>>2]|0;if(!((e&255)<<24>>24))e=e>>>16&255;else{J=(c[o>>2]|0)+f|0;e=a[J>>0]|0;a[J>>0]=1;if(!(Hc(b,f)|0)){B=30;break a}a[(c[o>>2]|0)+f>>0]=e<<24>>24!=0&1;e=a[m>>0]|0}if(((e<<24>>24?(I=a[(c[k>>2]|0)+f>>0]|0,e=a[7698]|0,J=e&255,(J>>>1^1)&I<<24>>24==e<<24>>24|I&2&J|0):0)?(a[(c[o>>2]|0)+f>>0]|0)==0:0)?!(Jc(b,f)|0):0){B=35;break a}if(+((c[y>>2]|0)>>>0)>+h[n>>3]*+((c[z>>2]|0)>>>0))Za[c[(c[b>>2]|0)+8>>2]&31](b)}e=c[D>>2]|0;if(!e)continue a;else g=g+1|0}}do if((B|0)==12)a[b+492>>0]=0;else if((B|0)==15){g=c[b+824>>2]|0;if((e|0)<=0){if(!g)break}else{e=c[A>>2]|0;f=0;do{c[e+(c[g+(f<<2)>>2]<<2)>>2]=-1;f=f+1|0}while((f|0)<(c[D>>2]|0))}c[D>>2]=0}else if((B|0)==30)a[b+492>>0]=0;else if((B|0)==35)a[b+492>>0]=0;while(0);if(!d){if(+((c[y>>2]|0)>>>0)>+h[b+96>>3]*+((c[z>>2]|0)>>>0))Za[c[(c[b>>2]|0)+8>>2]&31](b)}else{e=b+744|0;f=c[e>>2]|0;if(f|0){c[b+748>>2]=0;Qd(f);c[e>>2]=0;c[b+752>>2]=0}Oc(b+760|0,1);e=b+808|0;f=c[e>>2]|0;if(f|0){c[b+812>>2]=0;Qd(f);c[e>>2]=0;c[b+816>>2]=0}g=b+824|0;j=c[g>>2]|0;if((c[D>>2]|0)<=0){if(j|0)B=47}else{e=c[A>>2]|0;f=0;do{c[e+(c[j+(f<<2)>>2]<<2)>>2]=-1;f=f+1|0}while((f|0)<(c[D>>2]|0));B=47}if((B|0)==47){c[D>>2]=0;Qd(j);c[g>>2]=0;c[b+832>>2]=0}Dc(b+856|0,1);a[C>>0]=0;a[b+536>>0]=1;a[b+560>>0]=0;c[b+728>>2]=c[b+540>>2];jc(b);Za[c[(c[b>>2]|0)+8>>2]&31](b)}if((c[E>>2]|0)>0?(F=c[b+736>>2]|0,(F|0)>0):0){h[G>>3]=+(F<<2>>>0)*9.5367431640625e-07;Nd(2953,G)|0}J=(a[b+492>>0]|0)!=0;i=H;return J|0}function Bc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;p=b+924|0;if(!(c[p>>2]|0))return;q=b+856|0;r=b+872|0;s=b+868|0;t=b+860|0;u=b+544|0;f=0;while(1){o=c[r>>2]|0;e=c[s>>2]|0;d=o-e|0;if((o|0)<(e|0))d=(c[t>>2]|0)+d|0;if((f|0)>=(d|0))break;d=(c[u>>2]|0)+(c[(c[q>>2]|0)+(((e+f|0)%(c[t>>2]|0)|0)<<2)>>2]<<2)|0;e=c[d>>2]|0;if(!(e&3))c[d>>2]=e&-4|2;f=f+1|0}m=b+540|0;d=c[m>>2]|0;if((d|0)>0){n=b+744|0;o=b+776|0;l=b+760|0;k=b+804|0;j=0;do{if(a[(c[n>>2]|0)+j>>0]|0){h=(c[o>>2]|0)+j|0;if(a[h>>0]|0){d=c[l>>2]|0;i=d+(j*12|0)+4|0;e=c[i>>2]|0;if((e|0)>0){g=c[d+(j*12|0)>>2]|0;f=0;d=0;do{b=c[g+(f<<2)>>2]|0;if((c[(c[c[k>>2]>>2]|0)+(b<<2)>>2]&3|0)!=1){c[g+(d<<2)>>2]=b;e=c[i>>2]|0;d=d+1|0}f=f+1|0}while((f|0)<(e|0))}else{f=0;d=0}d=f-d|0;if((d|0)>0)c[i>>2]=e-d;a[h>>0]=0}d=c[l>>2]|0;g=d+(j*12|0)+4|0;e=c[g>>2]|0;if((e|0)>0){b=d+(j*12|0)|0;f=0;do{d=c[(c[b>>2]|0)+(f<<2)>>2]|0;if(!(c[(c[u>>2]|0)+(d<<2)>>2]&3)){sc(q,d);e=(c[u>>2]|0)+(c[(c[b>>2]|0)+(f<<2)>>2]<<2)|0;c[e>>2]=c[e>>2]&-4|2;e=c[g>>2]|0}f=f+1|0}while((f|0)<(e|0))}a[(c[n>>2]|0)+j>>0]=0;d=c[m>>2]|0}j=j+1|0}while((j|0)<(d|0));f=0}else f=0;while(1){o=c[r>>2]|0;e=c[s>>2]|0;d=o-e|0;if((o|0)<(e|0))d=(c[t>>2]|0)+d|0;if((f|0)>=(d|0))break;d=(c[u>>2]|0)+(c[(c[q>>2]|0)+(((e+f|0)%(c[t>>2]|0)|0)<<2)>>2]<<2)|0;e=c[d>>2]|0;if((e&3|0)==2)c[d>>2]=e&-4;f=f+1|0}c[p>>2]=0;return}function Cc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;W=i;i=i+32|0;y=W+16|0;S=W;z=W+12|0;T=b+856|0;L=b+872|0;M=b+868|0;O=b+860|0;P=b+680|0;U=b+920|0;V=b+284|0;Q=b+280|0;R=b+928|0;A=b+544|0;B=b+44|0;C=b+776|0;D=b+692|0;E=b+724|0;H=b+808|0;I=b+792|0;J=b+804|0;K=b+760|0;e=0;t=0;s=0;a:while(1){l=e;while(1){h=c[M>>2]|0;while(1){e=c[L>>2]|0;f=(e|0)<(h|0);e=e-h|0;if(f)g=(c[O>>2]|0)+e|0;else g=e;if((g|0)<=0?(c[U>>2]|0)>=(c[V>>2]|0):0){e=1;f=59;break a}if(a[P>>0]|0){f=9;break a}if(f)e=(c[O>>2]|0)+e|0;if((e|0)==0?(N=c[U>>2]|0,(N|0)<(c[V>>2]|0)):0){c[U>>2]=N+1;c[(c[A>>2]|0)+(c[R>>2]<<2)+4>>2]=c[(c[Q>>2]|0)+(N<<2)>>2];h=(c[A>>2]|0)+(c[R>>2]<<2)|0;f=(c[h>>2]|0)>>>5;if(!f){f=0;e=0}else{e=0;g=0;do{e=1<<((c[h+4+(g<<2)>>2]|0)>>>1&31)|e;g=g+1|0}while((g|0)!=(f|0))}c[h+4+(f<<2)>>2]=e;sc(T,c[R>>2]|0);e=c[M>>2]|0}else e=h;g=c[(c[T>>2]|0)+(e<<2)>>2]|0;e=e+1|0;h=c[O>>2]|0;e=(e|0)==(h|0)?0:e;c[M>>2]=e;j=(c[A>>2]|0)+(g<<2)|0;f=c[j>>2]|0;if(!(f&3)){k=e;break}else h=e}if(d?(c[B>>2]|0)>1:0){e=l+1|0;if(!((l|0)%1e3|0)){f=c[L>>2]|0;c[S>>2]=f-k+((f|0)<(k|0)?h:0);c[S+4>>2]=s;c[S+8>>2]=t;Nd(2866,S)|0;f=c[j>>2]|0}}else e=l;q=j+4|0;h=c[q>>2]>>1;if(f>>>0>63){l=c[K>>2]|0;k=f>>>5;f=h;h=1;do{x=c[j+4+(h<<2)>>2]>>1;f=(c[l+(x*12|0)+4>>2]|0)<(c[l+(f*12|0)+4>>2]|0)?x:f;h=h+1|0}while((h|0)<(k|0))}else f=h;o=(c[C>>2]|0)+f|0;if(a[o>>0]|0){h=c[K>>2]|0;p=h+(f*12|0)+4|0;k=c[p>>2]|0;if((k|0)>0){n=c[h+(f*12|0)>>2]|0;l=0;h=0;do{m=c[n+(l<<2)>>2]|0;if((c[(c[c[J>>2]>>2]|0)+(m<<2)>>2]&3|0)!=1){c[n+(h<<2)>>2]=m;k=c[p>>2]|0;h=h+1|0}l=l+1|0}while((l|0)<(k|0))}else{l=0;h=0}h=l-h|0;if((h|0)>0)c[p>>2]=k-h;a[o>>0]=0}h=c[K>>2]|0;k=h+(f*12|0)+4|0;if((c[k>>2]|0)>0){x=j;w=j;v=q;u=c[h+(f*12|0)>>2]|0;break}else l=e}h=0;while(1){j=c[x>>2]|0;if(j&3|0)continue a;q=c[u+(h<<2)>>2]|0;r=(c[A>>2]|0)+(q<<2)|0;p=c[r>>2]|0;b:do if(((!((q|0)==(g|0)|(p&3|0)!=0)?(o=c[D>>2]|0,F=p>>>5,(o|0)==-1|(F|0)<(o|0)):0)?(G=j>>>5,F>>>0>=G>>>0):0)?(c[w+4+(G<<2)>>2]&~c[r+4+(F<<2)>>2]|0)==0:0){o=r+4|0;c:do if(j>>>0>31){if(p>>>0>31){n=0;m=-2}else{l=t;j=s;break b}while(1){j=c[v+(n<<2)>>2]|0;d:do if((m|0)==-2){m=0;while(1){l=c[o+(m<<2)>>2]|0;if((j|0)==(l|0)){j=-2;break d}m=m+1|0;if((j|0)==(l^1|0))break d;if(m>>>0>=F>>>0){l=t;j=s;break b}}}else{l=0;while(1){if((j|0)==(c[o+(l<<2)>>2]|0)){j=m;break d}l=l+1|0;if(l>>>0>=F>>>0){l=t;j=s;break b}}}while(0);n=n+1|0;if(n>>>0>=G>>>0)break;else m=j}switch(j|0){case -1:{l=t;j=s;break b}case -2:break c;default:{}}c[z>>2]=j^1;c[y>>2]=c[z>>2];if(!(Gc(b,q,y)|0)){e=0;f=59;break a}l=t+1|0;h=(((j>>1|0)==(f|0))<<31>>31)+h|0;j=s;break b}while(0);m=s+1|0;if((a[E>>0]|0)!=0&p>>>0>31){l=0;do{j=r+4+(l<<2)|0;s=(c[H>>2]|0)+(c[j>>2]<<2)|0;c[s>>2]=(c[s>>2]|0)+-1;Ec(b,c[j>>2]>>1);j=c[j>>2]>>1;c[y>>2]=j;j=(c[C>>2]|0)+j|0;if(!(a[j>>0]|0)){a[j>>0]=1;Qb(I,y)}l=l+1|0}while((l|0)<((c[r>>2]|0)>>>5|0))}Zb(b,q);l=t;j=m}else{l=t;j=s}while(0);h=h+1|0;if((h|0)<(c[k>>2]|0)){t=l;s=j}else{t=l;s=j;continue a}}}if((f|0)==9){Dc(T,0);c[U>>2]=c[V>>2];V=1;i=W;return V|0}else if((f|0)==59){i=W;return e|0}return 0}function Dc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a>>2]|0;g=a+4|0;if(d){c[g>>2]=0;if(b){Qd(d);c[a>>2]=0;c[a+8>>2]=0;f=0;b=0}else{f=d;b=d}}else{f=d;b=0}if((c[g>>2]|0)>=1){g=a+16|0;c[g>>2]=0;a=a+12|0;c[a>>2]=0;return}d=a+8|0;e=c[d>>2]|0;if((e|0)<1){h=2-e&-2;b=(e>>1)+2&-2;b=(h|0)>(b|0)?h:b;if((b|0)>(2147483647-e|0)){h=ua(1)|0;La(h|0,16,0)}b=b+e|0;c[d>>2]=b;b=Rd(f,b<<2)|0;c[a>>2]=b;if((b|0)==0?(c[(Rc()|0)>>2]|0)==12:0){h=ua(1)|0;La(h|0,16,0)}}d=c[g>>2]|0;if((d|0)<1)Ae(b+(d<<2)|0,0,1-d<<2|0)|0;c[g>>2]=1;h=a+16|0;c[h>>2]=0;h=a+12|0;c[h>>2]=0;return}function Ec(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=b+824|0;e=(c[b+840>>2]|0)>(d|0);if(e?(c[(c[b+836>>2]|0)+(d<<2)>>2]|0)>-1:0)f=7;else f=3;do if((f|0)==3){if(a[(c[b+876>>2]|0)+d>>0]|0)return;if(a[(c[b+904>>2]|0)+d>>0]|0)return;k=a[(c[b+332>>2]|0)+d>>0]|0;j=a[7698]|0;l=j&255;if((l>>>1^1)&k<<24>>24==j<<24>>24|k&2&l)if(e){f=7;break}else break;else return}while(0);if((f|0)==7?(n=c[b+836>>2]|0,o=n+(d<<2)|0,g=c[o>>2]|0,(g|0)>-1):0){k=c[m>>2]|0;l=c[k+(g<<2)>>2]|0;a:do if(!g)e=0;else{h=b+852|0;i=l<<1;j=i|1;d=g;while(1){e=d;d=d+-1>>1;f=k+(d<<2)|0;b=c[f>>2]|0;s=c[c[h>>2]>>2]|0;p=c[s+(i<<2)>>2]|0;r=c[s+(j<<2)>>2]|0;p=Ke(r|0,((r|0)<0)<<31>>31|0,p|0,((p|0)<0)<<31>>31|0)|0;r=D;q=b<<1;g=c[s+(q<<2)>>2]|0;q=c[s+((q|1)<<2)>>2]|0;g=Ke(q|0,((q|0)<0)<<31>>31|0,g|0,((g|0)<0)<<31>>31|0)|0;q=D;if(!(r>>>0<q>>>0|(r|0)==(q|0)&p>>>0<g>>>0))break a;c[k+(e<<2)>>2]=b;c[n+(c[f>>2]<<2)>>2]=e;if(!d){e=0;break}}}while(0);c[k+(e<<2)>>2]=l;c[n+(l<<2)>>2]=e;Fc(m,c[o>>2]|0);return}yc(m,d);return}function Fc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=c[a>>2]|0;n=c[m+(b<<2)>>2]|0;e=b<<1|1;j=a+4|0;d=c[j>>2]|0;if((e|0)>=(d|0)){l=b;o=a+12|0;m=m+(l<<2)|0;c[m>>2]=n;o=c[o>>2]|0;o=o+(n<<2)|0;c[o>>2]=l;return}k=a+28|0;l=n<<1;i=l|1;a=a+12|0;h=e;while(1){g=(b<<1)+2|0;if((g|0)<(d|0)){f=c[m+(g<<2)>>2]|0;d=c[m+(h<<2)>>2]|0;s=f<<1;e=c[c[k>>2]>>2]|0;q=c[e+(s<<2)>>2]|0;s=c[e+((s|1)<<2)>>2]|0;q=Ke(s|0,((s|0)<0)<<31>>31|0,q|0,((q|0)<0)<<31>>31|0)|0;s=D;r=d<<1;p=c[e+(r<<2)>>2]|0;r=c[e+((r|1)<<2)>>2]|0;p=Ke(r|0,((r|0)<0)<<31>>31|0,p|0,((p|0)<0)<<31>>31|0)|0;r=D;if(s>>>0<r>>>0|(s|0)==(r|0)&q>>>0<p>>>0){d=f;f=g}else o=7}else{d=c[m+(h<<2)>>2]|0;e=c[c[k>>2]>>2]|0;o=7}if((o|0)==7){o=0;f=h}p=d<<1;r=c[e+(p<<2)>>2]|0;p=c[e+((p|1)<<2)>>2]|0;r=Ke(p|0,((p|0)<0)<<31>>31|0,r|0,((r|0)<0)<<31>>31|0)|0;p=D;s=c[e+(l<<2)>>2]|0;q=c[e+(i<<2)>>2]|0;s=Ke(q|0,((q|0)<0)<<31>>31|0,s|0,((s|0)<0)<<31>>31|0)|0;q=D;if(!(p>>>0<q>>>0|(p|0)==(q|0)&r>>>0<s>>>0)){o=10;break}c[m+(b<<2)>>2]=d;c[(c[a>>2]|0)+(d<<2)>>2]=b;h=f<<1|1;d=c[j>>2]|0;if((h|0)>=(d|0)){b=f;o=10;break}else b=f}if((o|0)==10){s=m+(b<<2)|0;c[s>>2]=n;s=c[a>>2]|0;s=s+(n<<2)|0;c[s>>2]=b;return}}function Gc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;q=i;i=i+16|0;o=q+4|0;p=q;g=b+544|0;n=(c[g>>2]|0)+(e<<2)|0;sc(b+856|0,e);if((c[n>>2]&-32|0)==64){l=(c[g>>2]|0)+(e<<2)|0;if(a[b+724>>0]|0?(c[l>>2]|0)>>>0>31:0){g=b+808|0;h=b+776|0;j=b+792|0;m=0;do{k=l+4+(m<<2)|0;r=(c[g>>2]|0)+(c[k>>2]<<2)|0;c[r>>2]=(c[r>>2]|0)+-1;Ec(b,c[k>>2]>>1);k=c[k>>2]>>1;c[o>>2]=k;k=(c[h>>2]|0)+k|0;if(!(a[k>>0]|0)){a[k>>0]=1;Qb(j,o)}m=m+1|0}while((m|0)<((c[l>>2]|0)>>>5|0))}Zb(b,e);h=c[f>>2]|0;g=c[n>>2]|0;a:do if(g>>>0>31){k=g>>>5;j=0;do{if((c[n+4+(j<<2)>>2]|0)==(h|0))break a;j=j+1|0}while((j|0)<(k|0))}else{k=0;j=0}while(0);h=k+-1|0;if((j|0)<(h|0)){do{g=j;j=j+1|0;c[n+4+(g<<2)>>2]=c[n+4+(j<<2)>>2];g=c[n>>2]|0;k=g>>>5;h=k+-1|0}while((j|0)<(h|0));j=k}else j=k;if(g&8){c[n+4+(h<<2)>>2]=c[n+4+(j<<2)>>2];g=c[n>>2]|0}g=g+-32|0;c[n>>2]=g;j=g>>>5;if(!j){j=0;h=0}else{h=0;k=0;do{h=1<<((c[n+4+(k<<2)>>2]|0)>>>1&31)|h;k=k+1|0}while((k|0)!=(j|0))}c[n+4+(j<<2)>>2]=h}else{Yb(b,e,1);f=c[f>>2]|0;g=c[n>>2]|0;b:do if(g>>>0>31){h=g>>>5;j=0;while(1){if((c[n+4+(j<<2)>>2]|0)==(f|0)){k=h;break b}j=j+1|0;if((j|0)>=(h|0)){k=h;break}}}else{k=0;j=0}while(0);h=k+-1|0;if((j|0)<(h|0)){do{g=j;j=j+1|0;c[n+4+(g<<2)>>2]=c[n+4+(j<<2)>>2];g=c[n>>2]|0;k=g>>>5;h=k+-1|0}while((j|0)<(h|0));j=k}else j=k;if(g&8){c[n+4+(h<<2)>>2]=c[n+4+(j<<2)>>2];g=c[n>>2]|0}h=g+-32|0;c[n>>2]=h;h=h>>>5;if(!h){h=0;g=0}else{g=0;j=0;do{g=1<<((c[n+4+(j<<2)>>2]|0)>>>1&31)|g;j=j+1|0}while((j|0)!=(h|0))}c[n+4+(h<<2)>>2]=g;Wb(b,e);l=f>>1;m=c[b+760>>2]|0;k=m+(l*12|0)|0;m=m+(l*12|0)+4|0;j=c[m>>2]|0;c:do if((j|0)>0){g=c[k>>2]|0;h=0;do{if((c[g+(h<<2)>>2]|0)==(e|0))break c;h=h+1|0}while((h|0)<(j|0))}else h=0;while(0);g=j+-1|0;if((h|0)<(g|0)){j=c[k>>2]|0;do{g=h;h=h+1|0;c[j+(g<<2)>>2]=c[j+(h<<2)>>2];g=(c[m>>2]|0)+-1|0}while((h|0)<(g|0))}c[m>>2]=g;g=(c[b+808>>2]|0)+(f<<2)|0;c[g>>2]=(c[g>>2]|0)+-1;Ec(b,l);g=c[n>>2]|0}if((g&-32|0)!=32){r=1;i=q;return r|0}g=c[n+4>>2]|0;h=d[(c[b+332>>2]|0)+(g>>1)>>0]|0;r=h^g&1;j=r&255;e=a[7698]|0;n=e&255;if(!(j<<24>>24==e<<24>>24&(n>>>1^1)|n&2&r)){p=a[7697]|0;r=p&255;if((r>>>1^1)&j<<24>>24==p<<24>>24|h&2&r|0){r=0;i=q;return r|0}}else{c[p>>2]=g;c[o>>2]=c[p>>2];Xb(b,o,-1)}r=(Ub(b)|0)==-1;i=q;return r|0}function Hc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;l=(c[b+776>>2]|0)+d|0;k=b+760|0;if(a[l>>0]|0){e=c[k>>2]|0;m=e+(d*12|0)+4|0;f=c[m>>2]|0;if((f|0)>0){j=b+804|0;i=c[e+(d*12|0)>>2]|0;g=0;e=0;do{h=c[i+(g<<2)>>2]|0;if((c[(c[c[j>>2]>>2]|0)+(h<<2)>>2]&3|0)!=1){c[i+(e<<2)>>2]=h;f=c[m>>2]|0;e=e+1|0}g=g+1|0}while((g|0)<(f|0))}else{g=0;e=0}e=g-e|0;if((e|0)>0)c[m>>2]=f-e;a[l>>0]=0}e=c[k>>2]|0;l=a[(c[b+332>>2]|0)+d>>0]|0;k=a[7698]|0;m=k&255;if(!((m>>>1^1)&l<<24>>24==k<<24>>24|l&2&m)){d=1;return d|0}g=e+(d*12|0)+4|0;f=c[g>>2]|0;if(!f){d=1;return d|0}a:do if((f|0)>0){e=e+(d*12|0)|0;f=0;while(1){if(!(Ic(b,d,c[(c[e>>2]|0)+(f<<2)>>2]|0)|0)){e=0;break}f=f+1|0;if((f|0)>=(c[g>>2]|0))break a}return e|0}while(0);d=Cc(b,0)|0;return d|0}function Ic(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;r=i;i=i+16|0;p=r+12|0;g=r+8|0;n=r+4|0;q=r;o=(c[b+544>>2]|0)+(f<<2)|0;if(c[o>>2]&3|0){b=1;i=r;return b|0}if(_b(b,o)|0){b=1;i=r;return b|0}c[g>>2]=c[b+284>>2];Qb(b+292|0,g);g=c[o>>2]|0;if(g>>>0>31){m=b+332|0;j=g;l=0;k=-2;while(1){g=c[o+4+(l<<2)>>2]|0;h=g>>1;if((h|0)!=(e|0)?(h=(d[(c[m>>2]|0)+h>>0]|0)^g&1,t=a[7697]|0,s=t&255,((h&255)<<24>>24==t<<24>>24&(s>>>1^1)|s&2&h|0)==0):0){c[n>>2]=g^1;c[p>>2]=c[n>>2];Xb(b,p,-1);h=c[o>>2]|0;g=k}else h=j;l=l+1|0;if((l|0)>=(h>>>5|0))break;else{j=h;k=g}}}else g=-2;t=(Ub(b)|0)==-1;$b(b,0);if(!t?(t=b+712|0,c[t>>2]=(c[t>>2]|0)+1,c[q>>2]=g,c[p>>2]=c[q>>2],!(Gc(b,f,p)|0)):0){t=0;i=r;return t|0}t=1;i=r;return t|0}function Jc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0;aa=i;i=i+32|0;N=aa+28|0;M=aa+24|0;$=aa+12|0;_=aa;O=b+776|0;m=(c[O>>2]|0)+d|0;T=b+760|0;if(a[m>>0]|0){f=c[T>>2]|0;n=f+(d*12|0)+4|0;g=c[n>>2]|0;if((g|0)>0){l=b+804|0;k=c[f+(d*12|0)>>2]|0;h=0;f=0;do{j=c[k+(h<<2)>>2]|0;if((c[(c[c[l>>2]>>2]|0)+(j<<2)>>2]&3|0)!=1){c[k+(f<<2)>>2]=j;g=c[n>>2]|0;f=f+1|0}h=h+1|0}while((h|0)<(g|0))}else{h=0;f=0}f=h-f|0;if((f|0)>0)c[n>>2]=g-f;a[m>>0]=0}L=c[T>>2]|0;K=L+(d*12|0)|0;c[$>>2]=0;R=$+4|0;c[R>>2]=0;S=$+8|0;c[S>>2]=0;c[_>>2]=0;P=_+4|0;c[P>>2]=0;Q=_+8|0;c[Q>>2]=0;L=L+(d*12|0)+4|0;a:do if((c[L>>2]|0)>0){k=b+544|0;l=d<<1;m=0;do{j=(c[K>>2]|0)+(m<<2)|0;h=(c[k>>2]|0)+(c[j>>2]<<2)|0;f=c[h>>2]|0;b:do if(f>>>0>31){g=f>>>5;f=0;do{if((c[h+4+(f<<2)>>2]|0)==(l|0))break b;f=f+1|0}while((f|0)<(g|0))}else{g=0;f=0}while(0);Kc((f|0)<(g|0)?$:_,j);m=m+1|0;f=c[L>>2]|0}while((m|0)<(f|0));x=c[R>>2]|0;H=(x|0)>0;if(H){z=c[$>>2]|0;A=b+544|0;I=c[_>>2]|0;B=b+708|0;C=b+684|0;E=b+688|0;y=c[P>>2]|0;F=(y|0)>0;g=0;G=0;while(1){if(F){v=z+(G<<2)|0;u=c[A>>2]|0;w=c[B>>2]|0;t=0;do{q=u+(c[v>>2]<<2)|0;j=u+(c[I+(t<<2)>>2]<<2)|0;w=w+1|0;c[B>>2]=w;r=(c[q>>2]|0)>>>5>>>0<(c[j>>2]|0)>>>5>>>0;k=r?j:q;j=r?q:j;q=k+4|0;r=j+4|0;k=c[k>>2]|0;s=k>>>5;h=s+-1|0;j=c[j>>2]|0;c:do if(j>>>0>31){p=j>>>5;o=k>>>0>31;j=h;n=0;while(1){m=c[r+(n<<2)>>2]|0;d:do if((m>>1|0)!=(d|0)){e:do if(o){l=0;while(1){k=c[q+(l<<2)>>2]|0;l=l+1|0;if((k^m)>>>0<2)break;if((l|0)>=(s|0))break e}if((k|0)==(m^1|0))break c;else break d}while(0);h=j+1|0;j=h}while(0);n=n+1|0;if((n|0)>=(p|0)){J=30;break}}}else J=30;while(0);if((J|0)==30){J=0;if((g|0)>=((c[C>>2]|0)+f|0)){f=1;e=I;J=79;break a}s=c[E>>2]|0;if((s|0)!=-1&(h|0)>(s|0)){f=1;e=I;J=79;break a}else g=g+1|0}t=t+1|0}while((t|0)<(y|0))}G=G+1|0;if((G|0)>=(x|0)){J=34;break}}}else{H=0;J=34}}else{x=0;H=0;J=34}while(0);f:do if((J|0)==34){a[(c[b+904>>2]|0)+d>>0]=1;g=b+380|0;f=(c[g>>2]|0)+d|0;if(a[f>>0]|0){I=b+200|0;G=I;G=Ce(c[G>>2]|0,c[G+4>>2]|0,-1,-1)|0;c[I>>2]=G;c[I+4>>2]=D}a[f>>0]=0;f=b+460|0;if(!((c[b+476>>2]|0)>(d|0)?(c[(c[b+472>>2]|0)+(d<<2)>>2]|0)>-1:0))J=38;if((J|0)==38?a[(c[g>>2]|0)+d>>0]|0:0)Pb(f,d);p=b+716|0;c[p>>2]=(c[p>>2]|0)+1;p=c[P>>2]|0;if((x|0)>(p|0)){if((p|0)>0){j=c[_>>2]|0;k=b+544|0;f=b+732|0;l=b+736|0;o=0;do{m=(c[k>>2]|0)+(c[j+(o<<2)>>2]<<2)|0;n=c[l>>2]|0;if((c[m>>2]|0)>>>0>31){h=0;g=-1;do{J=m+4+(h<<2)|0;c[N>>2]=c[J>>2];Kc(f,N);g=(c[J>>2]>>1|0)==(d|0)?h+n|0:g;h=h+1|0}while((h|0)<((c[m>>2]|0)>>>5|0))}else g=-1;J=c[f>>2]|0;G=J+(g<<2)|0;I=c[G>>2]|0;J=J+(n<<2)|0;c[G>>2]=c[J>>2];c[J>>2]=I;c[M>>2]=(c[m>>2]|0)>>>5;Kc(f,M);o=o+1|0}while((o|0)<(p|0))}else f=b+732|0;c[N>>2]=d<<1;Kc(f,N);c[M>>2]=1;Kc(f,M)}else{if(H){j=c[$>>2]|0;k=b+544|0;f=b+732|0;l=b+736|0;o=0;do{m=(c[k>>2]|0)+(c[j+(o<<2)>>2]<<2)|0;n=c[l>>2]|0;if((c[m>>2]|0)>>>0>31){h=0;g=-1;do{J=m+4+(h<<2)|0;c[N>>2]=c[J>>2];Kc(f,N);g=(c[J>>2]>>1|0)==(d|0)?h+n|0:g;h=h+1|0}while((h|0)<((c[m>>2]|0)>>>5|0))}else g=-1;J=c[f>>2]|0;G=J+(g<<2)|0;I=c[G>>2]|0;J=J+(n<<2)|0;c[G>>2]=c[J>>2];c[J>>2]=I;c[M>>2]=(c[m>>2]|0)>>>5;Kc(f,M);o=o+1|0}while((o|0)<(x|0))}else f=b+732|0;c[N>>2]=d<<1|1;Kc(f,N);c[M>>2]=1;Kc(f,M)}if((c[L>>2]|0)>0){f=b+544|0;g=b+724|0;h=b+808|0;j=b+792|0;o=0;do{k=c[(c[K>>2]|0)+(o<<2)>>2]|0;l=(c[f>>2]|0)+(k<<2)|0;if(a[g>>0]|0?(c[l>>2]|0)>>>0>31:0){n=0;do{m=l+4+(n<<2)|0;M=(c[h>>2]|0)+(c[m>>2]<<2)|0;c[M>>2]=(c[M>>2]|0)+-1;Ec(b,c[m>>2]>>1);m=c[m>>2]>>1;c[N>>2]=m;m=(c[O>>2]|0)+m|0;if(!(a[m>>0]|0)){a[m>>0]=1;Qb(j,N)}n=n+1|0}while((n|0)<((c[l>>2]|0)>>>5|0))}Zb(b,k);o=o+1|0}while((o|0)<(c[L>>2]|0))}j=b+628|0;if(H?(U=c[$>>2]|0,V=b+544|0,e=c[_>>2]|0,(p|0)>0):0){g=0;do{f=U+(g<<2)|0;h=0;do{O=c[V>>2]|0;if(Lc(b,O+(c[f>>2]<<2)|0,O+(c[e+(h<<2)>>2]<<2)|0,d,j)|0?!(Mc(b,j)|0):0){f=0;J=80;break f}h=h+1|0}while((h|0)<(p|0));g=g+1|0}while((g|0)<(x|0))}e=c[T>>2]|0;f=e+(d*12|0)|0;g=c[f>>2]|0;if(g|0){c[e+(d*12|0)+4>>2]=0;Qd(g);c[f>>2]=0;c[e+(d*12|0)+8>>2]=0}h=d<<1;e=b+412|0;g=c[e>>2]|0;f=g+(h*12|0)+4|0;if((c[f>>2]|0)==0?(W=g+(h*12|0)|0,X=c[W>>2]|0,(X|0)!=0):0){c[f>>2]=0;Qd(X);c[W>>2]=0;c[g+(h*12|0)+8>>2]=0;g=c[e>>2]|0}e=h|1;f=g+(e*12|0)+4|0;if((c[f>>2]|0)==0?(Y=g+(e*12|0)|0,Z=c[Y>>2]|0,Z|0):0){c[f>>2]=0;Qd(Z);c[Y>>2]=0;c[g+(e*12|0)+8>>2]=0}f=Cc(b,0)|0;e=c[_>>2]|0;J=79}while(0);if((J|0)==79)if(e)J=80;if((J|0)==80){c[P>>2]=0;Qd(e);c[_>>2]=0;c[Q>>2]=0}e=c[$>>2]|0;if(!e){i=aa;return f|0}c[R>>2]=0;Qd(e);c[$>>2]=0;c[S>>2]=0;i=aa;return f|0}function Kc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;g=a+4|0;d=c[g>>2]|0;e=a+8|0;if((c[e>>2]|0)==(d|0)){f=(d>>1)+2&-2;f=(f|0)<2?2:f;if((f|0)>(2147483647-d|0)){b=ua(1)|0;La(b|0,16,0)}h=c[a>>2]|0;d=f+d|0;c[e>>2]=d;d=Rd(h,d<<2)|0;c[a>>2]=d;if((d|0)==0?(c[(Rc()|0)>>2]|0)==12:0){h=ua(1)|0;La(h|0,16,0)}}else d=c[a>>2]|0;h=c[g>>2]|0;c[g>>2]=h+1;c[d+(h<<2)>>2]=c[b>>2];return}function Lc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;o=i;i=i+16|0;l=o+4|0;n=o;m=a+708|0;c[m>>2]=(c[m>>2]|0)+1;if(c[f>>2]|0)c[f+4>>2]=0;k=(c[b>>2]|0)>>>5>>>0<(c[d>>2]|0)>>>5>>>0;m=k?d:b;k=k?b:d;a=c[k>>2]|0;a:do if(a>>>0>31){j=0;b:while(1){h=c[k+4+(j<<2)>>2]|0;c:do if((h>>1|0)!=(e|0)){b=c[m>>2]|0;d:do if(b>>>0>31){d=b>>>5;g=0;while(1){b=c[m+4+(g<<2)>>2]|0;g=g+1|0;if((h^b)>>>0<2)break;if((g|0)>=(d|0))break d}if((b|0)==(h^1|0)){a=0;break b}else break c}while(0);c[l>>2]=h;Rb(f,l);a=c[k>>2]|0}while(0);j=j+1|0;if((j|0)>=(a>>>5|0))break a}i=o;return a|0}while(0);a=c[m>>2]|0;if(a>>>0<=31){e=1;i=o;return e|0}d=0;do{b=c[m+4+(d<<2)>>2]|0;if((b>>1|0)!=(e|0)){c[n>>2]=b;Rb(f,n);a=c[m>>2]|0}d=d+1|0}while((d|0)<(a>>>5|0));a=1;i=o;return a|0}function Mc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+16|0;p=q;e=b+260|0;f=c[e>>2]|0;if(a[b+705>>0]|0?Nc(b,d)|0:0){p=1;i=q;return p|0}if(!(Sb(b,d)|0)){p=0;i=q;return p|0}if(!(a[b+724>>0]|0)){p=1;i=q;return p|0}e=c[e>>2]|0;if((e|0)!=(f+1|0)){p=1;i=q;return p|0}n=c[(c[b+256>>2]|0)+(e+-1<<2)>>2]|0;c[p>>2]=n;g=(c[b+544>>2]|0)+(n<<2)|0;sc(b+856|0,n);if((c[g>>2]|0)>>>0>31){h=b+760|0;j=b+808|0;k=b+744|0;l=b+924|0;m=b+824|0;n=b+840|0;e=b+836|0;f=0;do{d=g+4+(f<<2)|0;Kc((c[h>>2]|0)+((c[d>>2]>>1)*12|0)|0,p);b=(c[j>>2]|0)+(c[d>>2]<<2)|0;c[b>>2]=(c[b>>2]|0)+1;a[(c[k>>2]|0)+(c[d>>2]>>1)>>0]=1;c[l>>2]=(c[l>>2]|0)+1;d=c[d>>2]>>1;if((c[n>>2]|0)>(d|0)?(o=c[(c[e>>2]|0)+(d<<2)>>2]|0,(o|0)>-1):0)Fc(m,o);f=f+1|0}while((f|0)<((c[g>>2]|0)>>>5|0))}p=1;i=q;return p|0}function Nc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;p=i;i=i+16|0;l=p+8|0;n=p+4|0;m=p;c[n>>2]=c[b+284>>2];Qb(b+292|0,n);n=e+4|0;f=c[n>>2]|0;a:do if((f|0)>0){o=b+332|0;k=0;while(1){g=c[(c[e>>2]|0)+(k<<2)>>2]|0;h=d[(c[o>>2]|0)+(g>>1)>>0]|0;q=h^g&1;j=q&255;s=a[7696]|0;r=s&255;if(j<<24>>24==s<<24>>24&(r>>>1^1)|r&2&q|0)break;r=a[7697]|0;s=r&255;if(!((s>>>1^1)&j<<24>>24==r<<24>>24|h&2&s)){c[m>>2]=g^1;c[l>>2]=c[m>>2];Xb(b,l,-1);f=c[n>>2]|0}k=k+1|0;if((k|0)>=(f|0))break a}$b(b,0);s=1;i=p;return s|0}while(0);s=(Ub(b)|0)!=-1;$b(b,0);i=p;return s|0}function Oc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;e=c[a>>2]|0;if(e|0){i=a+4|0;d=c[i>>2]|0;a:do if((d|0)>0){f=0;while(1){g=e+(f*12|0)|0;h=c[g>>2]|0;if(h){c[e+(f*12|0)+4>>2]=0;Qd(h);c[g>>2]=0;c[e+(f*12|0)+8>>2]=0;d=c[i>>2]|0}f=f+1|0;if((f|0)>=(d|0))break a;e=c[a>>2]|0}}while(0);c[i>>2]=0;if(b){Qd(c[a>>2]|0);c[a>>2]=0;c[a+8>>2]=0}}d=a+16|0;e=c[d>>2]|0;if(e|0?(c[a+20>>2]=0,b):0){Qd(e);c[d>>2]=0;c[a+24>>2]=0}d=a+32|0;e=c[d>>2]|0;if(!e)return;c[a+36>>2]=0;if(!b)return;Qd(e);c[d>>2]=0;c[a+40>>2]=0;return}function Pc(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=c[a+60>>2];a=Qc(Oa(6,d|0)|0)|0;i=b;return a|0}function Qc(a){a=a|0;if(a>>>0>4294963200){c[(Rc()|0)>>2]=0-a;a=-1}return a|0}function Rc(){var a=0;if(!(c[1784]|0))a=7180;else a=c[(Fa()|0)+64>>2]|0;return a|0}function Sc(a){a=a|0;return}function Tc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((Qc(Sa(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;i=f;return a|0}function Uc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+80|0;f=g;c[b+36>>2]=3;if((c[b>>2]&64|0)==0?(c[f>>2]=c[b+60>>2],c[f+4>>2]=21505,c[f+8>>2]=g+12,qa(54,f|0)|0):0)a[b+75>>0]=-1;f=Vc(b,d,e)|0;i=g;return f|0}function Vc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+48|0;n=q+16|0;m=q;e=q+32|0;o=a+28|0;f=c[o>>2]|0;c[e>>2]=f;p=a+20|0;f=(c[p>>2]|0)-f|0;c[e+4>>2]=f;c[e+8>>2]=b;c[e+12>>2]=d;k=a+60|0;l=a+44|0;b=2;f=f+d|0;while(1){if(!(c[1784]|0)){c[n>>2]=c[k>>2];c[n+4>>2]=e;c[n+8>>2]=b;h=Qc(Va(146,n|0)|0)|0}else{Pa(20,a|0);c[m>>2]=c[k>>2];c[m+4>>2]=e;c[m+8>>2]=b;h=Qc(Va(146,m|0)|0)|0;na(0)}if((f|0)==(h|0)){f=6;break}if((h|0)<0){f=8;break}f=f-h|0;g=c[e+4>>2]|0;if(h>>>0<=g>>>0)if((b|0)==2){c[o>>2]=(c[o>>2]|0)+h;j=g;b=2}else j=g;else{j=c[l>>2]|0;c[o>>2]=j;c[p>>2]=j;j=c[e+12>>2]|0;h=h-g|0;e=e+8|0;b=b+-1|0}c[e>>2]=(c[e>>2]|0)+h;c[e+4>>2]=j-h}if((f|0)==6){n=c[l>>2]|0;c[a+16>>2]=n+(c[a+48>>2]|0);a=n;c[o>>2]=a;c[p>>2]=a}else if((f|0)==8){c[a+16>>2]=0;c[o>>2]=0;c[p>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[e+4>>2]|0)|0}i=q;return d|0}function Wc(a){a=a|0;if(!(c[a+68>>2]|0))Sc(a);return}function Xc(b,c){b=b|0;c=c|0;var d=0,e=0;e=a[b>>0]|0;d=a[c>>0]|0;if(e<<24>>24==0?1:e<<24>>24!=d<<24>>24)c=e;else{do{b=b+1|0;c=c+1|0;e=a[b>>0]|0;d=a[c>>0]|0}while(!(e<<24>>24==0?1:e<<24>>24!=d<<24>>24));c=e}return (c&255)-(d&255)|0}function Yc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+16|0;g=f;c[g>>2]=e;e=Zc(a,b,d,g)|0;i=f;return e|0}function Zc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;n=i;i=i+128|0;g=n+112|0;m=n;h=m;j=580;k=h+112|0;do{c[h>>2]=c[j>>2];h=h+4|0;j=j+4|0}while((h|0)<(k|0));if((d+-1|0)>>>0>2147483646)if(!d){d=1;l=4}else{c[(Rc()|0)>>2]=75;d=-1}else{g=b;l=4}if((l|0)==4){l=-2-g|0;l=d>>>0>l>>>0?l:d;c[m+48>>2]=l;b=m+20|0;c[b>>2]=g;c[m+44>>2]=g;d=g+l|0;g=m+16|0;c[g>>2]=d;c[m+28>>2]=d;d=$c(m,e,f)|0;if(l){e=c[b>>2]|0;a[e+(((e|0)==(c[g>>2]|0))<<31>>31)>>0]=0}}i=n;return d|0}function _c(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=a+20|0;f=c[e>>2]|0;a=(c[a+16>>2]|0)-f|0;a=a>>>0>d>>>0?d:a;Ee(f|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+a;return d|0}function $c(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=i;i=i+224|0;o=s+120|0;r=s+80|0;q=s;p=s+136|0;f=r;g=f+40|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[o>>2]=c[e>>2];if((ad(0,d,o,q,r)|0)<0)e=-1;else{if((c[b+76>>2]|0)>-1)m=md(b)|0;else m=0;e=c[b>>2]|0;n=e&32;if((a[b+74>>0]|0)<1)c[b>>2]=e&-33;e=b+48|0;if(!(c[e>>2]|0)){g=b+44|0;h=c[g>>2]|0;c[g>>2]=p;j=b+28|0;c[j>>2]=p;k=b+20|0;c[k>>2]=p;c[e>>2]=80;l=b+16|0;c[l>>2]=p+80;f=ad(b,d,o,q,r)|0;if(h){Xa[c[b+36>>2]&7](b,0,0)|0;f=(c[k>>2]|0)==0?-1:f;c[g>>2]=h;c[e>>2]=0;c[l>>2]=0;c[j>>2]=0;c[k>>2]=0}}else f=ad(b,d,o,q,r)|0;e=c[b>>2]|0;c[b>>2]=e|n;if(m|0)Sc(b);e=(e&32|0)==0?f:-1}i=s;return e|0}function ad(e,f,g,j,l){e=e|0;f=f|0;g=g|0;j=j|0;l=l|0;var m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0;ia=i;i=i+624|0;da=ia+24|0;fa=ia+16|0;ea=ia+588|0;aa=ia+576|0;ca=ia;W=ia+536|0;ha=ia+8|0;ga=ia+528|0;M=(e|0)!=0;N=W+40|0;V=N;W=W+39|0;X=ha+4|0;Y=ea;Z=0-Y|0;_=aa+12|0;aa=aa+11|0;ba=_;O=ba-Y|0;P=-2-Y|0;Q=ba+2|0;R=da+288|0;S=ea+9|0;T=S;U=ea+8|0;m=0;o=0;n=0;y=f;a:while(1){do if((m|0)>-1)if((o|0)>(2147483647-m|0)){c[(Rc()|0)>>2]=75;m=-1;break}else{m=o+m|0;break}while(0);f=a[y>>0]|0;if(!(f<<24>>24)){L=244;break}else o=y;b:while(1){switch(f<<24>>24){case 37:{f=o;L=9;break b}case 0:{f=o;break b}default:{}}K=o+1|0;f=a[K>>0]|0;o=K}c:do if((L|0)==9)while(1){L=0;if((a[f+1>>0]|0)!=37)break c;o=o+1|0;f=f+2|0;if((a[f>>0]|0)==37)L=9;else break}while(0);w=o-y|0;if(M?(c[e>>2]&32|0)==0:0)bd(y,w,e)|0;if((o|0)!=(y|0)){o=w;y=f;continue}r=f+1|0;o=a[r>>0]|0;p=(o<<24>>24)+-48|0;if(p>>>0<10){K=(a[f+2>>0]|0)==36;r=K?f+3|0:r;o=a[r>>0]|0;u=K?p:-1;n=K?1:n}else u=-1;f=o<<24>>24;d:do if((f&-32|0)==32){p=0;while(1){if(!(1<<f+-32&75913)){s=p;break d}p=1<<(o<<24>>24)+-32|p;r=r+1|0;o=a[r>>0]|0;f=o<<24>>24;if((f&-32|0)!=32){s=p;break}}}else s=0;while(0);do if(o<<24>>24==42){o=r+1|0;f=(a[o>>0]|0)+-48|0;if(f>>>0<10?(a[r+2>>0]|0)==36:0){c[l+(f<<2)>>2]=10;n=1;r=r+3|0;f=c[j+((a[o>>0]|0)+-48<<3)>>2]|0}else{if(n|0){m=-1;break a}if(!M){v=s;n=0;r=o;K=0;break}n=(c[g>>2]|0)+(4-1)&~(4-1);f=c[n>>2]|0;c[g>>2]=n+4;n=0;r=o}if((f|0)<0){v=s|8192;K=0-f|0}else{v=s;K=f}}else{p=(o<<24>>24)+-48|0;if(p>>>0<10){f=r;o=0;do{o=(o*10|0)+p|0;f=f+1|0;p=(a[f>>0]|0)+-48|0}while(p>>>0<10);if((o|0)<0){m=-1;break a}else{v=s;r=f;K=o}}else{v=s;K=0}}while(0);e:do if((a[r>>0]|0)==46){f=r+1|0;o=a[f>>0]|0;if(o<<24>>24!=42){p=(o<<24>>24)+-48|0;if(p>>>0<10)o=0;else{s=0;break}while(1){o=(o*10|0)+p|0;f=f+1|0;p=(a[f>>0]|0)+-48|0;if(p>>>0>=10){s=o;break e}}}f=r+2|0;o=(a[f>>0]|0)+-48|0;if(o>>>0<10?(a[r+3>>0]|0)==36:0){c[l+(o<<2)>>2]=10;s=c[j+((a[f>>0]|0)+-48<<3)>>2]|0;f=r+4|0;break}if(n|0){m=-1;break a}if(M){J=(c[g>>2]|0)+(4-1)&~(4-1);s=c[J>>2]|0;c[g>>2]=J+4}else s=0}else{s=-1;f=r}while(0);t=0;while(1){o=(a[f>>0]|0)+-65|0;if(o>>>0>57){m=-1;break a}p=f+1|0;o=a[3110+(t*58|0)+o>>0]|0;r=o&255;if((r+-1|0)>>>0<8){f=p;t=r}else{J=p;break}}if(!(o<<24>>24)){m=-1;break}p=(u|0)>-1;do if(o<<24>>24==19)if(p){m=-1;break a}else L=52;else{if(p){c[l+(u<<2)>>2]=r;H=j+(u<<3)|0;I=c[H+4>>2]|0;L=ca;c[L>>2]=c[H>>2];c[L+4>>2]=I;L=52;break}if(!M){m=0;break a}dd(ca,r,g)}while(0);if((L|0)==52?(L=0,!M):0){o=w;y=J;continue}u=a[f>>0]|0;u=(t|0)!=0&(u&15|0)==3?u&-33:u;p=v&-65537;I=(v&8192|0)==0?v:p;f:do switch(u|0){case 110:switch(t|0){case 0:{c[c[ca>>2]>>2]=m;o=w;y=J;continue a}case 1:{c[c[ca>>2]>>2]=m;o=w;y=J;continue a}case 2:{o=c[ca>>2]|0;c[o>>2]=m;c[o+4>>2]=((m|0)<0)<<31>>31;o=w;y=J;continue a}case 3:{b[c[ca>>2]>>1]=m;o=w;y=J;continue a}case 4:{a[c[ca>>2]>>0]=m;o=w;y=J;continue a}case 6:{c[c[ca>>2]>>2]=m;o=w;y=J;continue a}case 7:{o=c[ca>>2]|0;c[o>>2]=m;c[o+4>>2]=((m|0)<0)<<31>>31;o=w;y=J;continue a}default:{o=w;y=J;continue a}}case 112:{t=I|8;s=s>>>0>8?s:8;u=120;L=64;break}case 88:case 120:{t=I;L=64;break}case 111:{p=ca;o=c[p>>2]|0;p=c[p+4>>2]|0;if((o|0)==0&(p|0)==0)f=N;else{f=N;do{f=f+-1|0;a[f>>0]=o&7|48;o=De(o|0,p|0,3)|0;p=D}while(!((o|0)==0&(p|0)==0))}if(!(I&8)){o=I;t=0;r=3590;L=77}else{t=V-f|0;o=I;s=(s|0)>(t|0)?s:t+1|0;t=0;r=3590;L=77}break}case 105:case 100:{o=ca;f=c[o>>2]|0;o=c[o+4>>2]|0;if((o|0)<0){f=ze(0,0,f|0,o|0)|0;o=D;p=ca;c[p>>2]=f;c[p+4>>2]=o;p=1;r=3590;L=76;break f}if(!(I&2048)){r=I&1;p=r;r=(r|0)==0?3590:3592;L=76}else{p=1;r=3591;L=76}break}case 117:{o=ca;f=c[o>>2]|0;o=c[o+4>>2]|0;p=0;r=3590;L=76;break}case 99:{a[W>>0]=c[ca>>2];f=W;u=1;w=0;v=3590;o=N;break}case 109:{o=fd(c[(Rc()|0)>>2]|0)|0;L=82;break}case 115:{o=c[ca>>2]|0;o=o|0?o:5492;L=82;break}case 67:{c[ha>>2]=c[ca>>2];c[X>>2]=0;c[ca>>2]=ha;f=ha;s=-1;L=86;break}case 83:{f=c[ca>>2]|0;if(!s){hd(e,32,K,0,I);f=0;L=97}else L=86;break}case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:{q=+h[ca>>3];c[fa>>2]=0;h[k>>3]=q;if((c[k+4>>2]|0)>=0)if(!(I&2048)){H=I&1;G=H;H=(H|0)==0?5500:5505}else{G=1;H=5502}else{q=-q;G=1;H=5499}h[k>>3]=q;F=c[k+4>>2]&2146435072;do if(F>>>0<2146435072|(F|0)==2146435072&0<0){x=+kd(q,fa)*2.0;o=x!=0.0;if(o)c[fa>>2]=(c[fa>>2]|0)+-1;C=u|32;if((C|0)==97){v=u&32;y=(v|0)==0?H:H+9|0;w=G|2;f=12-s|0;do if(!(s>>>0>11|(f|0)==0)){q=8.0;do{f=f+-1|0;q=q*16.0}while((f|0)!=0);if((a[y>>0]|0)==45){q=-(q+(-x-q));break}else{q=x+q-q;break}}else q=x;while(0);o=c[fa>>2]|0;f=(o|0)<0?0-o|0:o;f=ed(f,((f|0)<0)<<31>>31,_)|0;if((f|0)==(_|0)){a[aa>>0]=48;f=aa}a[f+-1>>0]=(o>>31&2)+43;t=f+-2|0;a[t>>0]=u+15;r=(s|0)<1;p=(I&8|0)==0;o=ea;while(1){H=~~q;f=o+1|0;a[o>>0]=d[3574+H>>0]|v;q=(q-+(H|0))*16.0;do if((f-Y|0)==1){if(p&(r&q==0.0))break;a[f>>0]=46;f=o+2|0}while(0);if(!(q!=0.0))break;else o=f}p=t;s=(s|0)!=0&(P+f|0)<(s|0)?Q+s-p|0:O-p+f|0;r=s+w|0;hd(e,32,K,r,I);if(!(c[e>>2]&32))bd(y,w,e)|0;hd(e,48,K,r,I^65536);o=f-Y|0;if(!(c[e>>2]&32))bd(ea,o,e)|0;f=ba-p|0;hd(e,48,s-(o+f)|0,0,0);if(!(c[e>>2]&32))bd(t,f,e)|0;hd(e,32,K,r,I^8192);f=(r|0)<(K|0)?K:r;break}f=(s|0)<0?6:s;if(o){o=(c[fa>>2]|0)+-28|0;c[fa>>2]=o;q=x*268435456.0}else{q=x;o=c[fa>>2]|0}F=(o|0)<0?da:R;E=F;o=F;do{B=~~q>>>0;c[o>>2]=B;o=o+4|0;q=(q-+(B>>>0))*1.0e9}while(q!=0.0);p=o;o=c[fa>>2]|0;if((o|0)>0){s=F;while(1){t=(o|0)>29?29:o;r=p+-4|0;do if(r>>>0<s>>>0)r=s;else{o=0;do{B=Be(c[r>>2]|0,0,t|0)|0;B=Ce(B|0,D|0,o|0,0)|0;o=D;A=Me(B|0,o|0,1e9,0)|0;c[r>>2]=A;o=Le(B|0,o|0,1e9,0)|0;r=r+-4|0}while(r>>>0>=s>>>0);if(!o){r=s;break}r=s+-4|0;c[r>>2]=o}while(0);while(1){if(p>>>0<=r>>>0)break;o=p+-4|0;if(!(c[o>>2]|0))p=o;else break}o=(c[fa>>2]|0)-t|0;c[fa>>2]=o;if((o|0)>0)s=r;else break}}else r=F;if((o|0)<0){y=((f+25|0)/9|0)+1|0;z=(C|0)==102;v=r;while(1){w=0-o|0;w=(w|0)>9?9:w;do if(v>>>0<p>>>0){o=(1<<w)+-1|0;s=1e9>>>w;r=0;t=v;do{B=c[t>>2]|0;c[t>>2]=(B>>>w)+r;r=$(B&o,s)|0;t=t+4|0}while(t>>>0<p>>>0);o=(c[v>>2]|0)==0?v+4|0:v;if(!r){r=o;break}c[p>>2]=r;r=o;p=p+4|0}else r=(c[v>>2]|0)==0?v+4|0:v;while(0);o=z?F:r;p=(p-o>>2|0)>(y|0)?o+(y<<2)|0:p;o=(c[fa>>2]|0)+w|0;c[fa>>2]=o;if((o|0)>=0){z=r;break}else v=r}}else z=r;do if(z>>>0<p>>>0){o=(E-z>>2)*9|0;s=c[z>>2]|0;if(s>>>0<10)break;else r=10;do{r=r*10|0;o=o+1|0}while(s>>>0>=r>>>0)}else o=0;while(0);A=(C|0)==103;B=(f|0)!=0;r=f-((C|0)!=102?o:0)+((B&A)<<31>>31)|0;if((r|0)<(((p-E>>2)*9|0)+-9|0)){t=r+9216|0;r=F+4+(((t|0)/9|0)+-1024<<2)|0;t=((t|0)%9|0)+1|0;if((t|0)<9){s=10;do{s=s*10|0;t=t+1|0}while((t|0)!=9)}else s=10;w=c[r>>2]|0;y=(w>>>0)%(s>>>0)|0;t=(r+4|0)==(p|0);do if(t&(y|0)==0)s=z;else{x=(((w>>>0)/(s>>>0)|0)&1|0)==0?9007199254740992.0:9007199254740994.0;v=(s|0)/2|0;if(y>>>0<v>>>0)q=.5;else q=t&(y|0)==(v|0)?1.0:1.5;do if(G){if((a[H>>0]|0)!=45)break;x=-x;q=-q}while(0);t=w-y|0;c[r>>2]=t;if(!(x+q!=x)){s=z;break}C=t+s|0;c[r>>2]=C;if(C>>>0>999999999){o=z;while(1){s=r+-4|0;c[r>>2]=0;if(s>>>0<o>>>0){o=o+-4|0;c[o>>2]=0}C=(c[s>>2]|0)+1|0;c[s>>2]=C;if(C>>>0>999999999)r=s;else{v=o;r=s;break}}}else v=z;o=(E-v>>2)*9|0;t=c[v>>2]|0;if(t>>>0<10){s=v;break}else s=10;do{s=s*10|0;o=o+1|0}while(t>>>0>=s>>>0);s=v}while(0);C=r+4|0;z=s;p=p>>>0>C>>>0?C:p}w=0-o|0;while(1){if(p>>>0<=z>>>0){y=0;C=p;break}r=p+-4|0;if(!(c[r>>2]|0))p=r;else{y=1;C=p;break}}do if(A){f=(B&1^1)+f|0;if((f|0)>(o|0)&(o|0)>-5){u=u+-1|0;f=f+-1-o|0}else{u=u+-2|0;f=f+-1|0}p=I&8;if(p|0)break;do if(y){p=c[C+-4>>2]|0;if(!p){r=9;break}if(!((p>>>0)%10|0)){s=10;r=0}else{r=0;break}do{s=s*10|0;r=r+1|0}while(!((p>>>0)%(s>>>0)|0|0))}else r=9;while(0);p=((C-E>>2)*9|0)+-9|0;if((u|32|0)==102){p=p-r|0;p=(p|0)<0?0:p;f=(f|0)<(p|0)?f:p;p=0;break}else{p=p+o-r|0;p=(p|0)<0?0:p;f=(f|0)<(p|0)?f:p;p=0;break}}else p=I&8;while(0);v=f|p;s=(v|0)!=0&1;t=(u|32|0)==102;if(t){o=(o|0)>0?o:0;u=0}else{r=(o|0)<0?w:o;r=ed(r,((r|0)<0)<<31>>31,_)|0;if((ba-r|0)<2)do{r=r+-1|0;a[r>>0]=48}while((ba-r|0)<2);a[r+-1>>0]=(o>>31&2)+43;E=r+-2|0;a[E>>0]=u;o=ba-E|0;u=E}w=G+1+f+s+o|0;hd(e,32,K,w,I);if(!(c[e>>2]&32))bd(H,G,e)|0;hd(e,48,K,w,I^65536);do if(t){r=z>>>0>F>>>0?F:z;o=r;do{p=ed(c[o>>2]|0,0,S)|0;do if((o|0)==(r|0)){if((p|0)!=(S|0))break;a[U>>0]=48;p=U}else{if(p>>>0<=ea>>>0)break;Ae(ea|0,48,p-Y|0)|0;do p=p+-1|0;while(p>>>0>ea>>>0)}while(0);if(!(c[e>>2]&32))bd(p,T-p|0,e)|0;o=o+4|0}while(o>>>0<=F>>>0);do if(v|0){if(c[e>>2]&32|0)break;bd(5530,1,e)|0}while(0);if((f|0)>0&o>>>0<C>>>0){p=o;while(1){o=ed(c[p>>2]|0,0,S)|0;if(o>>>0>ea>>>0){Ae(ea|0,48,o-Y|0)|0;do o=o+-1|0;while(o>>>0>ea>>>0)}if(!(c[e>>2]&32))bd(o,(f|0)>9?9:f,e)|0;p=p+4|0;o=f+-9|0;if(!((f|0)>9&p>>>0<C>>>0)){f=o;break}else f=o}}hd(e,48,f+9|0,9,0)}else{t=y?C:z+4|0;if((f|0)>-1){s=(p|0)==0;r=z;do{o=ed(c[r>>2]|0,0,S)|0;if((o|0)==(S|0)){a[U>>0]=48;o=U}do if((r|0)==(z|0)){p=o+1|0;if(!(c[e>>2]&32))bd(o,1,e)|0;if(s&(f|0)<1){o=p;break}if(c[e>>2]&32|0){o=p;break}bd(5530,1,e)|0;o=p}else{if(o>>>0<=ea>>>0)break;Ae(ea|0,48,o+Z|0)|0;do o=o+-1|0;while(o>>>0>ea>>>0)}while(0);p=T-o|0;if(!(c[e>>2]&32))bd(o,(f|0)>(p|0)?p:f,e)|0;f=f-p|0;r=r+4|0}while(r>>>0<t>>>0&(f|0)>-1)}hd(e,48,f+18|0,18,0);if(c[e>>2]&32|0)break;bd(u,ba-u|0,e)|0}while(0);hd(e,32,K,w,I^8192);f=(w|0)<(K|0)?K:w}else{t=(u&32|0)!=0;s=q!=q|0.0!=0.0;o=s?0:G;r=o+3|0;hd(e,32,K,r,p);f=c[e>>2]|0;if(!(f&32)){bd(H,o,e)|0;f=c[e>>2]|0}if(!(f&32))bd(s?(t?5807:5526):t?5518:5522,3,e)|0;hd(e,32,K,r,I^8192);f=(r|0)<(K|0)?K:r}while(0);o=f;y=J;continue a}default:{f=y;p=I;u=s;w=0;v=3590;o=N}}while(0);g:do if((L|0)==64){p=ca;o=c[p>>2]|0;p=c[p+4>>2]|0;r=u&32;if(!((o|0)==0&(p|0)==0)){f=N;do{f=f+-1|0;a[f>>0]=d[3574+(o&15)>>0]|r;o=De(o|0,p|0,4)|0;p=D}while(!((o|0)==0&(p|0)==0));L=ca;if((t&8|0)==0|(c[L>>2]|0)==0&(c[L+4>>2]|0)==0){o=t;t=0;r=3590;L=77}else{o=t;t=2;r=3590+(u>>4)|0;L=77}}else{f=N;o=t;t=0;r=3590;L=77}}else if((L|0)==76){f=ed(f,o,N)|0;o=I;t=p;L=77}else if((L|0)==82){L=0;I=gd(o,0,s)|0;H=(I|0)==0;f=o;u=H?s:I-o|0;w=0;v=3590;o=H?o+s|0:I}else if((L|0)==86){L=0;p=0;o=0;t=f;while(1){r=c[t>>2]|0;if(!r)break;o=id(ga,r)|0;if((o|0)<0|o>>>0>(s-p|0)>>>0)break;p=o+p|0;if(s>>>0>p>>>0)t=t+4|0;else break}if((o|0)<0){m=-1;break a}hd(e,32,K,p,I);if(!p){f=0;L=97}else{r=0;while(1){o=c[f>>2]|0;if(!o){f=p;L=97;break g}o=id(ga,o)|0;r=o+r|0;if((r|0)>(p|0)){f=p;L=97;break g}if(!(c[e>>2]&32))bd(ga,o,e)|0;if(r>>>0>=p>>>0){f=p;L=97;break}else f=f+4|0}}}while(0);if((L|0)==97){L=0;hd(e,32,K,f,I^8192);o=(K|0)>(f|0)?K:f;y=J;continue}if((L|0)==77){L=0;p=(s|0)>-1?o&-65537:o;o=ca;o=(c[o>>2]|0)!=0|(c[o+4>>2]|0)!=0;if((s|0)!=0|o){u=(o&1^1)+(V-f)|0;u=(s|0)>(u|0)?s:u;w=t;v=r;o=N}else{f=N;u=0;w=t;v=r;o=N}}t=o-f|0;r=(u|0)<(t|0)?t:u;s=w+r|0;o=(K|0)<(s|0)?s:K;hd(e,32,o,s,p);if(!(c[e>>2]&32))bd(v,w,e)|0;hd(e,48,o,s,p^65536);hd(e,48,r,t,0);if(!(c[e>>2]&32))bd(f,t,e)|0;hd(e,32,o,s,p^8192);y=J}h:do if((L|0)==244)if(!e)if(n){m=1;while(1){n=c[l+(m<<2)>>2]|0;if(!n)break;dd(j+(m<<3)|0,n,g);m=m+1|0;if((m|0)>=10){m=1;break h}}if((m|0)<10)while(1){if(c[l+(m<<2)>>2]|0){m=-1;break h}m=m+1|0;if((m|0)>=10){m=1;break}}else m=1}else m=0;while(0);i=ia;return m|0}function bd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=e+16|0;g=c[f>>2]|0;if(!g)if(!(cd(e)|0)){g=c[f>>2]|0;h=5}else f=0;else h=5;a:do if((h|0)==5){i=e+20|0;f=c[i>>2]|0;h=f;if((g-f|0)>>>0<d>>>0){f=Xa[c[e+36>>2]&7](e,b,d)|0;break}b:do if((a[e+75>>0]|0)>-1){f=d;while(1){if(!f){g=h;f=0;break b}g=f+-1|0;if((a[b+g>>0]|0)==10)break;else f=g}if((Xa[c[e+36>>2]&7](e,b,f)|0)>>>0<f>>>0)break a;d=d-f|0;b=b+f|0;g=c[i>>2]|0}else{g=h;f=0}while(0);Ee(g|0,b|0,d|0)|0;c[i>>2]=(c[i>>2]|0)+d;f=f+d|0}while(0);return f|0}function cd(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=c[b>>2]|0;if(!(d&8)){c[b+8>>2]=0;c[b+4>>2]=0;d=c[b+44>>2]|0;c[b+28>>2]=d;c[b+20>>2]=d;c[b+16>>2]=d+(c[b+48>>2]|0);d=0}else{c[b>>2]=d|32;d=-1}return d|0}function dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0;a:do if(b>>>0<=20)do switch(b|0){case 9:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;c[a>>2]=b;break a}case 10:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=((b|0)<0)<<31>>31;break a}case 11:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=0;break a}case 12:{e=(c[d>>2]|0)+(8-1)&~(8-1);b=e;f=c[b>>2]|0;b=c[b+4>>2]|0;c[d>>2]=e+8;e=a;c[e>>2]=f;c[e+4>>2]=b;break a}case 13:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&65535)<<16>>16;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 14:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&65535;c[f+4>>2]=0;break a}case 15:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&255)<<24>>24;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 16:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&255;c[f+4>>2]=0;break a}case 17:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}case 18:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}default:break a}while(0);while(0);return}function ed(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if(c>>>0>0|(c|0)==0&b>>>0>4294967295)while(1){e=Me(b|0,c|0,10,0)|0;d=d+-1|0;a[d>>0]=e|48;e=Le(b|0,c|0,10,0)|0;if(c>>>0>9|(c|0)==9&b>>>0>4294967295){b=e;c=D}else{b=e;break}}if(b)while(1){d=d+-1|0;a[d>>0]=(b>>>0)%10|0|48;if(b>>>0<10)break;else b=(b>>>0)/10|0}return d|0}function fd(b){b=b|0;var c=0,e=0;c=0;while(1){if((d[3600+c>>0]|0)==(b|0)){e=2;break}c=c+1|0;if((c|0)==87){c=87;b=3688;e=5;break}}if((e|0)==2)if(!c)b=3688;else{b=3688;e=5}if((e|0)==5)while(1){e=b;while(1){b=e+1|0;if(!(a[e>>0]|0))break;else e=b}c=c+-1|0;if(!c)break;else e=5}return b|0}function gd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=d&255;f=(e|0)!=0;a:do if(f&(b&3|0)!=0){g=d&255;while(1){if((a[b>>0]|0)==g<<24>>24){i=6;break a}b=b+1|0;e=e+-1|0;f=(e|0)!=0;if(!(f&(b&3|0)!=0)){i=5;break}}}else i=5;while(0);if((i|0)==5)if(f)i=6;else e=0;b:do if((i|0)==6){g=d&255;if((a[b>>0]|0)!=g<<24>>24){f=$(h,16843009)|0;c:do if(e>>>0>3)while(1){h=c[b>>2]^f;if((h&-2139062144^-2139062144)&h+-16843009|0)break;b=b+4|0;e=e+-4|0;if(e>>>0<=3){i=11;break c}}else i=11;while(0);if((i|0)==11)if(!e){e=0;break}while(1){if((a[b>>0]|0)==g<<24>>24)break b;b=b+1|0;e=e+-1|0;if(!e){e=0;break}}}}while(0);return (e|0?b:0)|0}function hd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;j=i;i=i+256|0;h=j;do if((d|0)>(e|0)&(f&73728|0)==0){f=d-e|0;Ae(h|0,b|0,(f>>>0>256?256:f)|0)|0;b=c[a>>2]|0;g=(b&32|0)==0;if(f>>>0>255){e=d-e|0;do{if(g){bd(h,256,a)|0;b=c[a>>2]|0}f=f+-256|0;g=(b&32|0)==0}while(f>>>0>255);if(g)f=e&255;else break}else if(!g)break;bd(h,f,a)|0}while(0);i=j;return}function id(a,b){a=a|0;b=b|0;if(!a)a=0;else a=jd(a,b,0)|0;return a|0}function jd(b,d,e){b=b|0;d=d|0;e=e|0;do if(b){if(d>>>0<128){a[b>>0]=d;b=1;break}if(d>>>0<2048){a[b>>0]=d>>>6|192;a[b+1>>0]=d&63|128;b=2;break}if(d>>>0<55296|(d&-8192|0)==57344){a[b>>0]=d>>>12|224;a[b+1>>0]=d>>>6&63|128;a[b+2>>0]=d&63|128;b=3;break}if((d+-65536|0)>>>0<1048576){a[b>>0]=d>>>18|240;a[b+1>>0]=d>>>12&63|128;a[b+2>>0]=d>>>6&63|128;a[b+3>>0]=d&63|128;b=4;break}else{c[(Rc()|0)>>2]=84;b=-1;break}}else b=1;while(0);return b|0}function kd(a,b){a=+a;b=b|0;return +(+ld(a,b))}function ld(a,b){a=+a;b=b|0;var d=0,e=0,f=0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;f=De(d|0,e|0,52)|0;f=f&2047;switch(f|0){case 0:{if(a!=0.0){a=+ld(a*18446744073709551616.0,b);d=(c[b>>2]|0)+-64|0}else d=0;c[b>>2]=d;break}case 2047:break;default:{c[b>>2]=f+-1022;c[k>>2]=d;c[k+4>>2]=e&-2146435073|1071644672;a=+h[k>>3]}}return +a}function md(a){a=a|0;return 0}function nd(b){b=b|0;var d=0,e=0,f=0;f=b;a:do if(!(f&3))e=4;else{d=b;b=f;while(1){if(!(a[d>>0]|0))break a;d=d+1|0;b=d;if(!(b&3)){b=d;e=4;break}}}while(0);if((e|0)==4){while(1){d=c[b>>2]|0;if(!((d&-2139062144^-2139062144)&d+-16843009))b=b+4|0;else break}if((d&255)<<24>>24)do b=b+1|0;while((a[b>>0]|0)!=0)}return b-f|0}function od(a){a=a|0;var b=0,e=0;e=i;i=i+16|0;b=e;if((c[a+8>>2]|0)==0?(pd(a)|0)!=0:0)b=-1;else if((Xa[c[a+32>>2]&7](a,b,1)|0)==1)b=d[b>>0]|0;else b=-1;i=e;return b|0}function pd(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=b+20|0;e=b+44|0;if((c[d>>2]|0)>>>0>(c[e>>2]|0)>>>0)Xa[c[b+36>>2]&7](b,0,0)|0;c[b+16>>2]=0;c[b+28>>2]=0;c[d>>2]=0;d=c[b>>2]|0;if(d&20)if(!(d&4))d=-1;else{c[b>>2]=d|32;d=-1}else{d=c[e>>2]|0;c[b+8>>2]=d;c[b+4>>2]=d;d=0}return d|0}function qd(a){a=a|0;return ((a|0)==32|(a+-9|0)>>>0<5)&1|0}function rd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;d=c[a+8>>2]|0;e=c[a+4>>2]|0;f=d-e|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0))c[a+100>>2]=e+b;else c[a+100>>2]=d;return}function sd(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;f=b+104|0;i=c[f>>2]|0;if((i|0)!=0?(c[b+108>>2]|0)>=(i|0):0)j=4;else{e=od(b)|0;if((e|0)>=0){f=c[f>>2]|0;i=c[b+8>>2]|0;if(f){h=c[b+4>>2]|0;f=f-(c[b+108>>2]|0)|0;g=i;if((i-h|0)<(f|0))j=9;else c[b+100>>2]=h+(f+-1)}else{g=i;j=9}if((j|0)==9)c[b+100>>2]=i;f=b+4|0;if(!g)f=c[f>>2]|0;else{f=c[f>>2]|0;b=b+108|0;c[b>>2]=g+1-f+(c[b>>2]|0)}f=f+-1|0;if((d[f>>0]|0|0)!=(e|0))a[f>>0]=e}else j=4}if((j|0)==4){c[b+100>>2]=0;e=-1}return e|0}function td(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a:do if(e>>>0>36){c[(Rc()|0)>>2]=22;h=0;g=0}else{r=b+4|0;q=b+100|0;do{i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0}while((qd(i)|0)!=0);b:do switch(i|0){case 43:case 45:{j=((i|0)==45)<<31>>31;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0;p=j;break b}else{i=sd(b)|0;p=j;break b}}default:p=0}while(0);j=(e|0)==0;do if((e|16|0)==16&(i|0)==48){i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;if((i|32|0)!=120)if(j){e=8;n=46;break}else{n=32;break}e=c[r>>2]|0;if(e>>>0<(c[q>>2]|0)>>>0){c[r>>2]=e+1;i=d[e>>0]|0}else i=sd(b)|0;if((d[5533+i>>0]|0)>15){g=(c[q>>2]|0)==0;if(!g)c[r>>2]=(c[r>>2]|0)+-1;if(!f){rd(b,0);h=0;g=0;break a}if(g){h=0;g=0;break a}c[r>>2]=(c[r>>2]|0)+-1;h=0;g=0;break a}else{e=16;n=46}}else{e=j?10:e;if((d[5533+i>>0]|0)>>>0<e>>>0)n=32;else{if(c[q>>2]|0)c[r>>2]=(c[r>>2]|0)+-1;rd(b,0);c[(Rc()|0)>>2]=22;h=0;g=0;break a}}while(0);if((n|0)==32)if((e|0)==10){e=i+-48|0;if(e>>>0<10){i=0;while(1){j=(i*10|0)+e|0;e=c[r>>2]|0;if(e>>>0<(c[q>>2]|0)>>>0){c[r>>2]=e+1;i=d[e>>0]|0}else i=sd(b)|0;e=i+-48|0;if(!(e>>>0<10&j>>>0<429496729)){e=j;break}else i=j}j=0}else{e=0;j=0}f=i+-48|0;if(f>>>0<10){while(1){k=Ke(e|0,j|0,10,0)|0;l=D;m=((f|0)<0)<<31>>31;o=~m;if(l>>>0>o>>>0|(l|0)==(o|0)&k>>>0>~f>>>0){k=e;break}e=Ce(k|0,l|0,f|0,m|0)|0;j=D;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;f=i+-48|0;if(!(f>>>0<10&(j>>>0<429496729|(j|0)==429496729&e>>>0<2576980378))){k=e;break}}if(f>>>0>9){i=k;e=p}else{e=10;n=72}}else{i=e;e=p}}else n=46;c:do if((n|0)==46){if(!(e+-1&e)){n=a[5789+((e*23|0)>>>5&7)>>0]|0;j=a[5533+i>>0]|0;f=j&255;if(f>>>0<e>>>0){i=0;while(1){k=f|i<<n;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;j=a[5533+i>>0]|0;f=j&255;if(!(k>>>0<134217728&f>>>0<e>>>0))break;else i=k}f=0}else{f=0;k=0}l=De(-1,-1,n|0)|0;m=D;if((j&255)>>>0>=e>>>0|(f>>>0>m>>>0|(f|0)==(m|0)&k>>>0>l>>>0)){j=f;n=72;break}else i=f;while(1){k=Be(k|0,i|0,n|0)|0;f=D;k=j&255|k;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;j=a[5533+i>>0]|0;if((j&255)>>>0>=e>>>0|(f>>>0>m>>>0|(f|0)==(m|0)&k>>>0>l>>>0)){j=f;n=72;break c}else i=f}}j=a[5533+i>>0]|0;f=j&255;if(f>>>0<e>>>0){i=0;while(1){k=f+($(i,e)|0)|0;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;j=a[5533+i>>0]|0;f=j&255;if(!(k>>>0<119304647&f>>>0<e>>>0))break;else i=k}f=0}else{k=0;f=0}if((j&255)>>>0<e>>>0){n=Le(-1,-1,e|0,0)|0;o=D;m=f;while(1){if(m>>>0>o>>>0|(m|0)==(o|0)&k>>>0>n>>>0){j=m;n=72;break c}f=Ke(k|0,m|0,e|0,0)|0;l=D;j=j&255;if(l>>>0>4294967295|(l|0)==-1&f>>>0>~j>>>0){j=m;n=72;break c}k=Ce(j|0,0,f|0,l|0)|0;f=D;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0;j=a[5533+i>>0]|0;if((j&255)>>>0>=e>>>0){j=f;n=72;break}else m=f}}else{j=f;n=72}}while(0);if((n|0)==72)if((d[5533+i>>0]|0)>>>0<e>>>0){do{i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=sd(b)|0}while((d[5533+i>>0]|0)>>>0<e>>>0);c[(Rc()|0)>>2]=34;j=h;i=g;e=(g&1|0)==0&0==0?p:0}else{i=k;e=p}if(c[q>>2]|0)c[r>>2]=(c[r>>2]|0)+-1;if(!(j>>>0<h>>>0|(j|0)==(h|0)&i>>>0<g>>>0)){if(!((g&1|0)!=0|0!=0|(e|0)!=0)){c[(Rc()|0)>>2]=34;g=Ce(g|0,h|0,-1,-1)|0;h=D;break}if(j>>>0>h>>>0|(j|0)==(h|0)&i>>>0>g>>>0){c[(Rc()|0)>>2]=34;break}}g=((e|0)<0)<<31>>31;g=ze(i^e|0,j^g|0,e|0,g|0)|0;h=D}while(0);D=h;return g|0}function ud(b,e,f){b=b|0;e=e|0;f=f|0;var g=0.0,h=0,j=0.0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0.0,r=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0.0;L=i;i=i+512|0;H=L;switch(e|0){case 0:{K=24;J=-149;A=4;break}case 1:{K=53;J=-1074;A=4;break}case 2:{K=53;J=-1074;A=4;break}default:g=0.0}a:do if((A|0)==4){E=b+4|0;C=b+100|0;do{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0}while((qd(e)|0)!=0);b:do switch(e|0){case 43:case 45:{h=1-(((e|0)==45&1)<<1)|0;e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;I=h;break b}else{e=sd(b)|0;I=h;break b}}default:I=1}while(0);h=e;e=0;do{if((h|32|0)!=(a[5798+e>>0]|0))break;do if(e>>>0<7){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0;break}else{h=sd(b)|0;break}}while(0);e=e+1|0}while(e>>>0<8);c:do switch(e|0){case 8:break;case 3:{A=23;break}default:{k=(f|0)!=0;if(k&e>>>0>3)if((e|0)==8)break c;else{A=23;break c}d:do if(!e){e=0;do{if((h|32|0)!=(a[5807+e>>0]|0))break d;do if(e>>>0<2){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0;break}else{h=sd(b)|0;break}}while(0);e=e+1|0}while(e>>>0<3)}while(0);switch(e|0){case 3:{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;if((e|0)==40)e=1;else{if(!(c[C>>2]|0)){g=s;break a}c[E>>2]=(c[E>>2]|0)+-1;g=s;break a}while(1){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0}else h=sd(b)|0;if(!((h+-48|0)>>>0<10|(h+-65|0)>>>0<26)?!((h|0)==95|(h+-97|0)>>>0<26):0)break;e=e+1|0}if((h|0)==41){g=s;break a}h=(c[C>>2]|0)==0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if(!k){c[(Rc()|0)>>2]=22;rd(b,0);g=0.0;break a}if(!e){g=s;break a}while(1){e=e+-1|0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if(!e){g=s;break a}}}case 0:{do if((h|0)==48){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;if((e|32|0)!=120){if(!(c[C>>2]|0)){e=48;break}c[E>>2]=(c[E>>2]|0)+-1;e=48;break}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=0}else{e=sd(b)|0;k=0}e:while(1){switch(e|0){case 46:{A=74;break e}case 48:break;default:{y=0;l=0;x=0;h=0;n=k;o=0;w=0;m=1.0;k=0;g=0.0;break e}}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=1;continue}else{e=sd(b)|0;k=1;continue}}if((A|0)==74){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;if((e|0)==48){k=0;h=0;do{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;k=Ce(k|0,h|0,-1,-1)|0;h=D}while((e|0)==48);y=0;l=0;x=k;n=1;o=1;w=0;m=1.0;k=0;g=0.0}else{y=0;l=0;x=0;h=0;n=k;o=1;w=0;m=1.0;k=0;g=0.0}}while(1){u=e+-48|0;p=e|32;if(u>>>0>=10){v=(e|0)==46;if(!(v|(p+-97|0)>>>0<6)){p=x;u=y;break}if(v)if(!o){v=l;h=y;u=y;o=1;p=w;j=m}else{p=x;u=y;e=46;break}else A=86}else A=86;if((A|0)==86){A=0;e=(e|0)>57?p+-87|0:u;do if(!((y|0)<0|(y|0)==0&l>>>0<8)){if((y|0)<0|(y|0)==0&l>>>0<14){r=m*.0625;p=w;j=r;g=g+r*+(e|0);break}if((w|0)!=0|(e|0)==0){p=w;j=m}else{p=1;j=m;g=g+m*.5}}else{p=w;j=m;k=e+(k<<4)|0}while(0);l=Ce(l|0,y|0,1,0)|0;v=x;u=D;n=1}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;y=u;x=v;e=d[e>>0]|0;w=p;m=j;continue}else{y=u;x=v;e=sd(b)|0;w=p;m=j;continue}}if(!n){e=(c[C>>2]|0)==0;if(!e)c[E>>2]=(c[E>>2]|0)+-1;if(f){if(!e?(z=c[E>>2]|0,c[E>>2]=z+-1,o|0):0)c[E>>2]=z+-2}else rd(b,0);g=+(I|0)*0.0;break a}n=(o|0)==0;o=n?l:p;n=n?u:h;if((u|0)<0|(u|0)==0&l>>>0<8){h=u;do{k=k<<4;l=Ce(l|0,h|0,1,0)|0;h=D}while((h|0)<0|(h|0)==0&l>>>0<8)}if((e|32|0)==112){h=vd(b,f)|0;e=D;if((h|0)==0&(e|0)==-2147483648){if(!f){rd(b,0);g=0.0;break a}if(!(c[C>>2]|0)){h=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;h=0;e=0}}}else if(!(c[C>>2]|0)){h=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;h=0;e=0}H=Be(o|0,n|0,2)|0;H=Ce(H|0,D|0,-32,-1)|0;e=Ce(H|0,D|0,h|0,e|0)|0;h=D;if(!k){g=+(I|0)*0.0;break a}if((h|0)>0|(h|0)==0&e>>>0>(0-J|0)>>>0){c[(Rc()|0)>>2]=34;g=+(I|0)*1797693134862315708145274.0e284*1797693134862315708145274.0e284;break a}H=J+-106|0;G=((H|0)<0)<<31>>31;if((h|0)<(G|0)|(h|0)==(G|0)&e>>>0<H>>>0){c[(Rc()|0)>>2]=34;g=+(I|0)*2.2250738585072014e-308*2.2250738585072014e-308;break a}if((k|0)>-1){do{G=!(g>=.5);H=G&1|k<<1;k=H^1;g=g+(G?g:g+-1.0);e=Ce(e|0,h|0,-1,-1)|0;h=D}while((H|0)>-1);l=e;m=g}else{l=e;m=g}e=ze(32,0,J|0,((J|0)<0)<<31>>31|0)|0;e=Ce(l|0,h|0,e|0,D|0)|0;J=D;if(0>(J|0)|0==(J|0)&K>>>0>e>>>0)if((e|0)<0){e=0;A=127}else A=125;else{e=K;A=125}if((A|0)==125)if((e|0)<53)A=127;else{h=e;j=+(I|0);g=0.0}if((A|0)==127){g=+(I|0);h=e;j=g;g=+xd(+wd(1.0,84-e|0),g)}K=(k&1|0)==0&(m!=0.0&(h|0)<32);g=j*(K?0.0:m)+(g+j*+(((K&1)+k|0)>>>0))-g;if(!(g!=0.0))c[(Rc()|0)>>2]=34;g=+zd(g,l);break a}else e=h;while(0);F=J+K|0;G=0-F|0;k=0;f:while(1){switch(e|0){case 46:{A=138;break f}case 48:break;default:{h=0;p=0;o=0;break f}}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=1;continue}else{e=sd(b)|0;k=1;continue}}if((A|0)==138){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;if((e|0)==48){h=0;e=0;while(1){h=Ce(h|0,e|0,-1,-1)|0;k=D;e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;if((e|0)==48)e=k;else{p=k;k=1;o=1;break}}}else{h=0;p=0;o=1}}c[H>>2]=0;n=e+-48|0;l=(e|0)==46;g:do if(l|n>>>0<10){B=H+496|0;y=0;v=0;w=l;A=p;u=k;z=o;k=0;l=0;o=0;h:while(1){do if(w)if(!z){h=y;p=v;z=1}else{p=A;e=y;n=v;break h}else{w=Ce(y|0,v|0,1,0)|0;v=D;x=(e|0)!=48;if((l|0)>=125){if(!x){p=A;y=w;break}c[B>>2]=c[B>>2]|1;p=A;y=w;break}p=H+(l<<2)|0;if(k)n=e+-48+((c[p>>2]|0)*10|0)|0;c[p>>2]=n;k=k+1|0;n=(k|0)==9;p=A;y=w;u=1;k=n?0:k;l=(n&1)+l|0;o=x?w:o}while(0);e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=sd(b)|0;n=e+-48|0;w=(e|0)==46;if(!(w|n>>>0<10)){n=z;A=161;break g}else A=p}u=(u|0)!=0;A=169}else{y=0;v=0;u=k;n=o;k=0;l=0;o=0;A=161}while(0);do if((A|0)==161){B=(n|0)==0;h=B?y:h;p=B?v:p;u=(u|0)!=0;if(!((e|32|0)==101&u))if((e|0)>-1){e=y;n=v;A=169;break}else{e=y;n=v;A=171;break}n=vd(b,f)|0;e=D;if((n|0)==0&(e|0)==-2147483648){if(!f){rd(b,0);g=0.0;break}if(!(c[C>>2]|0)){n=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;n=0;e=0}}h=Ce(n|0,e|0,h|0,p|0)|0;u=y;p=D;n=v;A=173}while(0);if((A|0)==169)if(c[C>>2]|0){c[E>>2]=(c[E>>2]|0)+-1;if(u){u=e;A=173}else A=172}else A=171;if((A|0)==171)if(u){u=e;A=173}else A=172;do if((A|0)==172){c[(Rc()|0)>>2]=22;rd(b,0);g=0.0}else if((A|0)==173){e=c[H>>2]|0;if(!e){g=+(I|0)*0.0;break}if(((n|0)<0|(n|0)==0&u>>>0<10)&((h|0)==(u|0)&(p|0)==(n|0))?K>>>0>30|(e>>>K|0)==0:0){g=+(I|0)*+(e>>>0);break}b=(J|0)/-2|0;E=((b|0)<0)<<31>>31;if((p|0)>(E|0)|(p|0)==(E|0)&h>>>0>b>>>0){c[(Rc()|0)>>2]=34;g=+(I|0)*1797693134862315708145274.0e284*1797693134862315708145274.0e284;break}b=J+-106|0;E=((b|0)<0)<<31>>31;if((p|0)<(E|0)|(p|0)==(E|0)&h>>>0<b>>>0){c[(Rc()|0)>>2]=34;g=+(I|0)*2.2250738585072014e-308*2.2250738585072014e-308;break}if(k){if((k|0)<9){n=H+(l<<2)|0;e=c[n>>2]|0;do{e=e*10|0;k=k+1|0}while((k|0)!=9);c[n>>2]=e}l=l+1|0}if((o|0)<9?(o|0)<=(h|0)&(h|0)<18:0){if((h|0)==9){g=+(I|0)*+((c[H>>2]|0)>>>0);break}if((h|0)<9){g=+(I|0)*+((c[H>>2]|0)>>>0)/+(c[692+(8-h<<2)>>2]|0);break}b=K+27+($(h,-3)|0)|0;e=c[H>>2]|0;if((b|0)>30|(e>>>b|0)==0){g=+(I|0)*+(e>>>0)*+(c[692+(h+-10<<2)>>2]|0);break}}e=(h|0)%9|0;if(!e){k=0;e=0}else{u=(h|0)>-1?e:e+9|0;n=c[692+(8-u<<2)>>2]|0;if(l){o=1e9/(n|0)|0;k=0;e=0;p=0;do{C=H+(p<<2)|0;E=c[C>>2]|0;b=((E>>>0)/(n>>>0)|0)+e|0;c[C>>2]=b;e=$((E>>>0)%(n>>>0)|0,o)|0;b=(p|0)==(k|0)&(b|0)==0;p=p+1|0;h=b?h+-9|0:h;k=b?p&127:k}while((p|0)!=(l|0));if(e){c[H+(l<<2)>>2]=e;l=l+1|0}}else{k=0;l=0}e=0;h=9-u+h|0}i:while(1){v=(h|0)<18;w=(h|0)==18;x=H+(k<<2)|0;do{if(!v){if(!w){y=l;break i}if((c[x>>2]|0)>>>0>=9007199){h=18;y=l;break i}}n=0;o=l+127|0;while(1){u=o&127;p=H+(u<<2)|0;o=Be(c[p>>2]|0,0,29)|0;o=Ce(o|0,D|0,n|0,0)|0;n=D;if(n>>>0>0|(n|0)==0&o>>>0>1e9){b=Le(o|0,n|0,1e9,0)|0;o=Me(o|0,n|0,1e9,0)|0;n=b}else n=0;c[p>>2]=o;b=(u|0)==(k|0);l=(u|0)!=(l+127&127|0)|b?l:(o|0)==0?u:l;if(b)break;else o=u+-1|0}e=e+-29|0}while((n|0)==0);k=k+127&127;if((k|0)==(l|0)){b=l+127&127;l=H+((l+126&127)<<2)|0;c[l>>2]=c[l>>2]|c[H+(b<<2)>>2];l=b}c[H+(k<<2)>>2]=n;h=h+9|0}j:while(1){l=y+1&127;x=H+((y+127&127)<<2)|0;while(1){v=(h|0)==18;w=(h|0)>27?9:1;u=v^1;while(1){o=k&127;p=(o|0)==(y|0);do if(!p){n=c[H+(o<<2)>>2]|0;if(n>>>0<9007199){A=219;break}if(n>>>0>9007199)break;n=k+1&127;if((n|0)==(y|0)){A=219;break}n=c[H+(n<<2)>>2]|0;if(n>>>0<254740991){A=219;break}if(!(n>>>0>254740991|u)){h=o;l=y;break j}}else A=219;while(0);if((A|0)==219?(A=0,v):0){A=220;break j}e=e+w|0;if((k|0)==(y|0))k=y;else break}u=(1<<w)+-1|0;v=1e9>>>w;o=k;n=0;p=k;while(1){E=H+(p<<2)|0;b=c[E>>2]|0;k=(b>>>w)+n|0;c[E>>2]=k;n=$(b&u,v)|0;k=(p|0)==(o|0)&(k|0)==0;p=p+1&127;h=k?h+-9|0:h;k=k?p:o;if((p|0)==(y|0))break;else o=k}if(!n)continue;if((l|0)!=(k|0))break;c[x>>2]=c[x>>2]|1}c[H+(y<<2)>>2]=n;y=l}if((A|0)==220)if(p){c[H+(l+-1<<2)>>2]=0;h=y}else{h=o;l=y}g=+((c[H+(h<<2)>>2]|0)>>>0);h=k+1&127;if((h|0)==(l|0)){l=k+2&127;c[H+(l+-1<<2)>>2]=0}r=+(I|0);j=r*(g*1.0e9+ +((c[H+(h<<2)>>2]|0)>>>0));v=e+53|0;p=v-J|0;u=(p|0)<(K|0);h=u&1;o=u?((p|0)<0?0:p):K;if((o|0)<53){M=+xd(+wd(1.0,105-o|0),j);m=+Ad(j,+wd(1.0,53-o|0));q=M;g=m;m=M+(j-m)}else{q=0.0;g=0.0;m=j}n=k+2&127;do if((n|0)==(l|0))j=g;else{n=c[H+(n<<2)>>2]|0;do if(n>>>0>=5e8){if(n>>>0>5e8){g=r*.75+g;break}if((k+3&127|0)==(l|0)){g=r*.5+g;break}else{g=r*.75+g;break}}else{if((n|0)==0?(k+3&127|0)==(l|0):0)break;g=r*.25+g}while(0);if((53-o|0)<=1){j=g;break}if(+Ad(g,1.0)!=0.0){j=g;break}j=g+1.0}while(0);g=m+j-q;do if((v&2147483647|0)>(-2-F|0)){if(+O(+g)>=9007199254740992.0){h=u&(o|0)==(p|0)?0:h;e=e+1|0;g=g*.5}if((e+50|0)<=(G|0)?!(j!=0.0&(h|0)!=0):0)break;c[(Rc()|0)>>2]=34}while(0);g=+zd(g,e)}while(0);break a}default:{if(c[C>>2]|0)c[E>>2]=(c[E>>2]|0)+-1;c[(Rc()|0)>>2]=22;rd(b,0);g=0.0;break a}}}}while(0);if((A|0)==23){h=(c[C>>2]|0)==0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if((f|0)!=0&e>>>0>3)do{if(!h)c[E>>2]=(c[E>>2]|0)+-1;e=e+-1|0}while(e>>>0>3)}g=+(I|0)*t}while(0);i=L;return +g}function vd(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;i=a+4|0;e=c[i>>2]|0;j=a+100|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=sd(a)|0;switch(e|0){case 43:case 45:{f=(e|0)==45&1;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=sd(a)|0;if((b|0)!=0&(e+-48|0)>>>0>9?(c[j>>2]|0)!=0:0){c[i>>2]=(c[i>>2]|0)+-1;h=f}else h=f;break}default:h=0}if((e+-48|0)>>>0>9)if(!(c[j>>2]|0)){f=-2147483648;e=0}else{c[i>>2]=(c[i>>2]|0)+-1;f=-2147483648;e=0}else{f=0;do{f=e+-48+(f*10|0)|0;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=sd(a)|0}while((e+-48|0)>>>0<10&(f|0)<214748364);b=((f|0)<0)<<31>>31;if((e+-48|0)>>>0<10){do{b=Ke(f|0,b|0,10,0)|0;f=D;e=Ce(e|0,((e|0)<0)<<31>>31|0,-48,-1)|0;f=Ce(e|0,D|0,b|0,f|0)|0;b=D;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=sd(a)|0}while((e+-48|0)>>>0<10&((b|0)<21474836|(b|0)==21474836&f>>>0<2061584302));g=f}else g=f;if((e+-48|0)>>>0<10)do{e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=sd(a)|0}while((e+-48|0)>>>0<10);if(c[j>>2]|0)c[i>>2]=(c[i>>2]|0)+-1;a=(h|0)!=0;e=ze(0,0,g|0,b|0)|0;f=a?D:b;e=a?e:g}D=f;return e|0}function wd(a,b){a=+a;b=b|0;var d=0;if((b|0)>1023){a=a*8988465674311579538646525.0e283;d=b+-1023|0;if((d|0)>1023){d=b+-2046|0;d=(d|0)>1023?1023:d;a=a*8988465674311579538646525.0e283}}else if((b|0)<-1022){a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)<-1022){d=b+2044|0;d=(d|0)<-1022?-1022:d;a=a*2.2250738585072014e-308}}else d=b;d=Be(d+1023|0,0,52)|0;b=D;c[k>>2]=d;c[k+4>>2]=b;return +(a*+h[k>>3])}function xd(a,b){a=+a;b=+b;return +(+yd(a,b))}function yd(a,b){a=+a;b=+b;var d=0;h[k>>3]=b;d=c[k+4>>2]|0;b=+O(+a);h[k>>3]=b;d=d&-2147483648|c[k+4>>2];c[k>>2]=c[k>>2];c[k+4>>2]=d;return +(+h[k>>3])}function zd(a,b){a=+a;b=b|0;return +(+wd(a,b))}function Ad(a,b){a=+a;b=+b;return +(+Bd(a,b))}function Bd(a,b){a=+a;b=+b;var d=0,e=0,f=0,g=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0;h[k>>3]=a;d=c[k>>2]|0;m=c[k+4>>2]|0;h[k>>3]=b;n=c[k>>2]|0;o=c[k+4>>2]|0;e=De(d|0,m|0,52)|0;e=e&2047;j=De(n|0,o|0,52)|0;j=j&2047;p=m&-2147483648;i=Be(n|0,o|0,1)|0;l=D;a:do if(!((i|0)==0&(l|0)==0)?(r=+O(+b),h[k>>3]=r,g=c[k+4>>2]|0,!(g>>>0>2146435072|(g|0)==2146435072&(c[k>>2]|0)>>>0>0|(e|0)==2047)):0){f=Be(d|0,m|0,1)|0;g=D;if(!(g>>>0>l>>>0|(g|0)==(l|0)&f>>>0>i>>>0))return +((f|0)==(i|0)&(g|0)==(l|0)?a*0.0:a);if(!e){e=Be(d|0,m|0,12)|0;f=D;if((f|0)>-1|(f|0)==-1&e>>>0>4294967295){g=e;e=0;do{e=e+-1|0;g=Be(g|0,f|0,1)|0;f=D}while((f|0)>-1|(f|0)==-1&g>>>0>4294967295)}else e=0;d=Be(d|0,m|0,1-e|0)|0;f=D}else f=m&1048575|1048576;if(!j){g=Be(n|0,o|0,12)|0;i=D;if((i|0)>-1|(i|0)==-1&g>>>0>4294967295){j=0;do{j=j+-1|0;g=Be(g|0,i|0,1)|0;i=D}while((i|0)>-1|(i|0)==-1&g>>>0>4294967295)}else j=0;n=Be(n|0,o|0,1-j|0)|0;m=D}else m=o&1048575|1048576;l=ze(d|0,f|0,n|0,m|0)|0;i=D;g=(i|0)>-1|(i|0)==-1&l>>>0>4294967295;b:do if((e|0)>(j|0)){while(1){if(g)if((d|0)==(n|0)&(f|0)==(m|0))break;else{d=l;f=i}d=Be(d|0,f|0,1)|0;f=D;e=e+-1|0;l=ze(d|0,f|0,n|0,m|0)|0;i=D;g=(i|0)>-1|(i|0)==-1&l>>>0>4294967295;if((e|0)<=(j|0))break b}b=a*0.0;break a}while(0);if(g)if((d|0)==(n|0)&(f|0)==(m|0)){b=a*0.0;break}else{f=i;d=l}if(f>>>0<1048576|(f|0)==1048576&d>>>0<0)do{d=Be(d|0,f|0,1)|0;f=D;e=e+-1|0}while(f>>>0<1048576|(f|0)==1048576&d>>>0<0);if((e|0)>0){o=Ce(d|0,f|0,0,-1048576)|0;d=D;e=Be(e|0,0,52)|0;d=d|D;e=o|e}else{e=De(d|0,f|0,1-e|0)|0;d=D}c[k>>2]=e;c[k+4>>2]=d|p;b=+h[k>>3]}else q=3;while(0);if((q|0)==3){b=a*b;b=b/b}return +b}function Cd(a){a=a|0;var b=0,d=0;do if(a){if((c[a+76>>2]|0)<=-1){b=Dd(a)|0;break}d=(md(a)|0)==0;b=Dd(a)|0;if(!d)Sc(a)}else{if(!(c[115]|0))b=0;else b=Cd(c[115]|0)|0;Na(7164);a=c[1790]|0;if(a)do{if((c[a+76>>2]|0)>-1)d=md(a)|0;else d=0;if((c[a+20>>2]|0)>>>0>(c[a+28>>2]|0)>>>0)b=Dd(a)|0|b;if(d|0)Sc(a);a=c[a+56>>2]|0}while((a|0)!=0);Ia(7164)}while(0);return b|0}function Dd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+20|0;g=a+28|0;if((c[b>>2]|0)>>>0>(c[g>>2]|0)>>>0?(Xa[c[a+36>>2]&7](a,0,0)|0,(c[b>>2]|0)==0):0)b=-1;else{h=a+4|0;d=c[h>>2]|0;e=a+8|0;f=c[e>>2]|0;if(d>>>0<f>>>0)Xa[c[a+40>>2]&7](a,d-f|0,1)|0;c[a+16>>2]=0;c[g>>2]=0;c[b>>2]=0;c[e>>2]=0;c[h>>2]=0;b=0}return b|0}function Ed(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;k=i;i=i+112|0;j=k;c[j>>2]=0;g=j+4|0;c[g>>2]=a;c[j+44>>2]=a;h=j+8|0;c[h>>2]=(a|0)<0?-1:a+2147483647|0;c[j+76>>2]=-1;rd(j,0);e=td(j,d,1,e,f)|0;if(b|0)c[b>>2]=a+((c[g>>2]|0)+(c[j+108>>2]|0)-(c[h>>2]|0));i=k;return e|0}function Fd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;d=$c(a,b,f)|0;i=e;return d|0}function Gd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0,g=0,h=0,j=0;j=i;i=i+112|0;h=j;f=h;g=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));f=h+4|0;c[f>>2]=a;g=h+8|0;c[g>>2]=-1;c[h+44>>2]=a;c[h+76>>2]=-1;rd(h,0);e=+ud(h,d,1);d=(c[f>>2]|0)-(c[g>>2]|0)+(c[h+108>>2]|0)|0;if(b|0)c[b>>2]=d|0?a+d|0:a;i=j;return +e}function Hd(a,b){a=a|0;b=b|0;return +(+Gd(a,b,1))}function Id(a,b,c){a=a|0;b=b|0;c=c|0;a=Ed(a,b,c,-2147483648,0)|0;return a|0}function Jd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;m=i;i=i+16|0;l=m;k=e&255;a[l>>0]=k;g=b+16|0;h=c[g>>2]|0;if(!h)if(!(cd(b)|0)){h=c[g>>2]|0;j=4}else f=-1;else j=4;do if((j|0)==4){g=b+20|0;j=c[g>>2]|0;if(j>>>0<h>>>0?(f=e&255,(f|0)!=(a[b+75>>0]|0)):0){c[g>>2]=j+1;a[j>>0]=k;break}if((Xa[c[b+36>>2]&7](b,l,1)|0)==1)f=d[l>>0]|0;else f=-1}while(0);i=m;return f|0}function Kd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if((c[d+76>>2]|0)>=0?(md(d)|0)!=0:0){if((a[d+75>>0]|0)!=(b|0)?(f=d+20|0,g=c[f>>2]|0,g>>>0<(c[d+16>>2]|0)>>>0):0){c[f>>2]=g+1;a[g>>0]=b;e=b&255}else e=Jd(d,b)|0;Sc(d)}else i=3;do if((i|0)==3){if((a[d+75>>0]|0)!=(b|0)?(h=d+20|0,e=c[h>>2]|0,e>>>0<(c[d+16>>2]|0)>>>0):0){c[h>>2]=e+1;a[e>>0]=b;e=b&255;break}e=Jd(d,b)|0}while(0);return e|0}function Ld(a,b){a=a|0;b=b|0;return (Md(a,nd(a)|0,1,b)|0)+-1|0}function Md(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=$(d,b)|0;if((c[e+76>>2]|0)>-1){g=(md(e)|0)==0;a=bd(a,f,e)|0;if(!g)Sc(e)}else a=bd(a,f,e)|0;if((a|0)!=(f|0))d=(a>>>0)/(b>>>0)|0;return d|0}function Nd(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+16|0;e=d;c[e>>2]=b;b=$c(c[86]|0,a,e)|0;i=d;return b|0}function Od(b){b=b|0;var d=0,e=0,f=0,g=0;f=c[86]|0;if((c[f+76>>2]|0)>-1)g=md(f)|0;else g=0;do if((Ld(b,f)|0)<0)d=1;else{if((a[f+75>>0]|0)!=10?(d=f+20|0,e=c[d>>2]|0,e>>>0<(c[f+16>>2]|0)>>>0):0){c[d>>2]=e+1;a[e>>0]=10;d=0;break}d=(Jd(f,10)|0)<0}while(0);if(g|0)Sc(f);return d<<31>>31|0}function Pd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;do if(a>>>0<245){o=a>>>0<11?16:a+11&-8;a=o>>>3;j=c[1796]|0;b=j>>>a;if(b&3|0){b=(b&1^1)+a|0;d=7224+(b<<1<<2)|0;e=d+8|0;f=c[e>>2]|0;g=f+8|0;h=c[g>>2]|0;do if((d|0)!=(h|0)){if(h>>>0<(c[1800]|0)>>>0)ra();a=h+12|0;if((c[a>>2]|0)==(f|0)){c[a>>2]=d;c[e>>2]=h;break}else ra()}else c[1796]=j&~(1<<b);while(0);L=b<<3;c[f+4>>2]=L|3;L=f+L+4|0;c[L>>2]=c[L>>2]|1;L=g;return L|0}h=c[1798]|0;if(o>>>0>h>>>0){if(b|0){d=2<<a;d=b<<a&(d|0-d);d=(d&0-d)+-1|0;i=d>>>12&16;d=d>>>i;f=d>>>5&8;d=d>>>f;g=d>>>2&4;d=d>>>g;e=d>>>1&2;d=d>>>e;b=d>>>1&1;b=(f|i|g|e|b)+(d>>>b)|0;d=7224+(b<<1<<2)|0;e=d+8|0;g=c[e>>2]|0;i=g+8|0;f=c[i>>2]|0;do if((d|0)!=(f|0)){if(f>>>0<(c[1800]|0)>>>0)ra();a=f+12|0;if((c[a>>2]|0)==(g|0)){c[a>>2]=d;c[e>>2]=f;k=c[1798]|0;break}else ra()}else{c[1796]=j&~(1<<b);k=h}while(0);h=(b<<3)-o|0;c[g+4>>2]=o|3;e=g+o|0;c[e+4>>2]=h|1;c[e+h>>2]=h;if(k|0){f=c[1801]|0;b=k>>>3;d=7224+(b<<1<<2)|0;a=c[1796]|0;b=1<<b;if(a&b){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();else{l=a;m=b}}else{c[1796]=a|b;l=d+8|0;m=d}c[l>>2]=f;c[m+12>>2]=f;c[f+8>>2]=m;c[f+12>>2]=d}c[1798]=h;c[1801]=e;L=i;return L|0}a=c[1797]|0;if(a){d=(a&0-a)+-1|0;K=d>>>12&16;d=d>>>K;J=d>>>5&8;d=d>>>J;L=d>>>2&4;d=d>>>L;b=d>>>1&2;d=d>>>b;e=d>>>1&1;e=c[7488+((J|K|L|b|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-o|0;b=e;while(1){a=c[b+16>>2]|0;if(!a){a=c[b+20>>2]|0;if(!a){j=e;break}}b=(c[a+4>>2]&-8)-o|0;L=b>>>0<d>>>0;d=L?b:d;b=a;e=L?a:e}g=c[1800]|0;if(j>>>0<g>>>0)ra();i=j+o|0;if(j>>>0>=i>>>0)ra();h=c[j+24>>2]|0;e=c[j+12>>2]|0;do if((e|0)==(j|0)){b=j+20|0;a=c[b>>2]|0;if(!a){b=j+16|0;a=c[b>>2]|0;if(!a){n=0;break}}while(1){e=a+20|0;f=c[e>>2]|0;if(f|0){a=f;b=e;continue}e=a+16|0;f=c[e>>2]|0;if(!f)break;else{a=f;b=e}}if(b>>>0<g>>>0)ra();else{c[b>>2]=0;n=a;break}}else{f=c[j+8>>2]|0;if(f>>>0<g>>>0)ra();a=f+12|0;if((c[a>>2]|0)!=(j|0))ra();b=e+8|0;if((c[b>>2]|0)==(j|0)){c[a>>2]=e;c[b>>2]=f;n=e;break}else ra()}while(0);do if(h|0){a=c[j+28>>2]|0;b=7488+(a<<2)|0;if((j|0)==(c[b>>2]|0)){c[b>>2]=n;if(!n){c[1797]=c[1797]&~(1<<a);break}}else{if(h>>>0<(c[1800]|0)>>>0)ra();a=h+16|0;if((c[a>>2]|0)==(j|0))c[a>>2]=n;else c[h+20>>2]=n;if(!n)break}b=c[1800]|0;if(n>>>0<b>>>0)ra();c[n+24>>2]=h;a=c[j+16>>2]|0;do if(a|0)if(a>>>0<b>>>0)ra();else{c[n+16>>2]=a;c[a+24>>2]=n;break}while(0);a=c[j+20>>2]|0;if(a|0)if(a>>>0<(c[1800]|0)>>>0)ra();else{c[n+20>>2]=a;c[a+24>>2]=n;break}}while(0);if(d>>>0<16){L=d+o|0;c[j+4>>2]=L|3;L=j+L+4|0;c[L>>2]=c[L>>2]|1}else{c[j+4>>2]=o|3;c[i+4>>2]=d|1;c[i+d>>2]=d;a=c[1798]|0;if(a|0){f=c[1801]|0;b=a>>>3;e=7224+(b<<1<<2)|0;a=c[1796]|0;b=1<<b;if(a&b){a=e+8|0;b=c[a>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();else{p=a;q=b}}else{c[1796]=a|b;p=e+8|0;q=e}c[p>>2]=f;c[q+12>>2]=f;c[f+8>>2]=q;c[f+12>>2]=e}c[1798]=d;c[1801]=i}L=j+8|0;return L|0}}}else if(a>>>0<=4294967231){a=a+11|0;o=a&-8;j=c[1797]|0;if(j){d=0-o|0;a=a>>>8;if(a)if(o>>>0>16777215)i=31;else{q=(a+1048320|0)>>>16&8;E=a<<q;p=(E+520192|0)>>>16&4;E=E<<p;i=(E+245760|0)>>>16&2;i=14-(p|q|i)+(E<<i>>>15)|0;i=o>>>(i+7|0)&1|i<<1}else i=0;b=c[7488+(i<<2)>>2]|0;a:do if(!b){a=0;b=0;E=86}else{f=d;a=0;g=o<<((i|0)==31?0:25-(i>>>1)|0);h=b;b=0;while(1){e=c[h+4>>2]&-8;d=e-o|0;if(d>>>0<f>>>0)if((e|0)==(o|0)){a=h;b=h;E=90;break a}else b=h;else d=f;e=c[h+20>>2]|0;h=c[h+16+(g>>>31<<2)>>2]|0;a=(e|0)==0|(e|0)==(h|0)?a:e;e=(h|0)==0;if(e){E=86;break}else{f=d;g=g<<(e&1^1)}}}while(0);if((E|0)==86){if((a|0)==0&(b|0)==0){a=2<<i;a=j&(a|0-a);if(!a)break;q=(a&0-a)+-1|0;m=q>>>12&16;q=q>>>m;l=q>>>5&8;q=q>>>l;n=q>>>2&4;q=q>>>n;p=q>>>1&2;q=q>>>p;a=q>>>1&1;a=c[7488+((l|m|n|p|a)+(q>>>a)<<2)>>2]|0}if(!a){i=d;j=b}else E=90}if((E|0)==90)while(1){E=0;q=(c[a+4>>2]&-8)-o|0;e=q>>>0<d>>>0;d=e?q:d;b=e?a:b;e=c[a+16>>2]|0;if(e|0){a=e;E=90;continue}a=c[a+20>>2]|0;if(!a){i=d;j=b;break}else E=90}if((j|0)!=0?i>>>0<((c[1798]|0)-o|0)>>>0:0){f=c[1800]|0;if(j>>>0<f>>>0)ra();h=j+o|0;if(j>>>0>=h>>>0)ra();g=c[j+24>>2]|0;d=c[j+12>>2]|0;do if((d|0)==(j|0)){b=j+20|0;a=c[b>>2]|0;if(!a){b=j+16|0;a=c[b>>2]|0;if(!a){s=0;break}}while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<f>>>0)ra();else{c[b>>2]=0;s=a;break}}else{e=c[j+8>>2]|0;if(e>>>0<f>>>0)ra();a=e+12|0;if((c[a>>2]|0)!=(j|0))ra();b=d+8|0;if((c[b>>2]|0)==(j|0)){c[a>>2]=d;c[b>>2]=e;s=d;break}else ra()}while(0);do if(g|0){a=c[j+28>>2]|0;b=7488+(a<<2)|0;if((j|0)==(c[b>>2]|0)){c[b>>2]=s;if(!s){c[1797]=c[1797]&~(1<<a);break}}else{if(g>>>0<(c[1800]|0)>>>0)ra();a=g+16|0;if((c[a>>2]|0)==(j|0))c[a>>2]=s;else c[g+20>>2]=s;if(!s)break}b=c[1800]|0;if(s>>>0<b>>>0)ra();c[s+24>>2]=g;a=c[j+16>>2]|0;do if(a|0)if(a>>>0<b>>>0)ra();else{c[s+16>>2]=a;c[a+24>>2]=s;break}while(0);a=c[j+20>>2]|0;if(a|0)if(a>>>0<(c[1800]|0)>>>0)ra();else{c[s+20>>2]=a;c[a+24>>2]=s;break}}while(0);do if(i>>>0>=16){c[j+4>>2]=o|3;c[h+4>>2]=i|1;c[h+i>>2]=i;a=i>>>3;if(i>>>0<256){d=7224+(a<<1<<2)|0;b=c[1796]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();else{u=a;v=b}}else{c[1796]=b|a;u=d+8|0;v=d}c[u>>2]=h;c[v+12>>2]=h;c[h+8>>2]=v;c[h+12>>2]=d;break}a=i>>>8;if(a)if(i>>>0>16777215)d=31;else{K=(a+1048320|0)>>>16&8;L=a<<K;J=(L+520192|0)>>>16&4;L=L<<J;d=(L+245760|0)>>>16&2;d=14-(J|K|d)+(L<<d>>>15)|0;d=i>>>(d+7|0)&1|d<<1}else d=0;e=7488+(d<<2)|0;c[h+28>>2]=d;a=h+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[1797]|0;b=1<<d;if(!(a&b)){c[1797]=a|b;c[e>>2]=h;c[h+24>>2]=e;c[h+12>>2]=h;c[h+8>>2]=h;break}f=i<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(i|0)){d=a;E=148;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){E=145;break}else{f=f<<1;a=d}}if((E|0)==145)if(b>>>0<(c[1800]|0)>>>0)ra();else{c[b>>2]=h;c[h+24>>2]=a;c[h+12>>2]=h;c[h+8>>2]=h;break}else if((E|0)==148){a=d+8|0;b=c[a>>2]|0;L=c[1800]|0;if(b>>>0>=L>>>0&d>>>0>=L>>>0){c[b+12>>2]=h;c[a>>2]=h;c[h+8>>2]=b;c[h+12>>2]=d;c[h+24>>2]=0;break}else ra()}}else{L=i+o|0;c[j+4>>2]=L|3;L=j+L+4|0;c[L>>2]=c[L>>2]|1}while(0);L=j+8|0;return L|0}}}else o=-1;while(0);d=c[1798]|0;if(d>>>0>=o>>>0){a=d-o|0;b=c[1801]|0;if(a>>>0>15){L=b+o|0;c[1801]=L;c[1798]=a;c[L+4>>2]=a|1;c[L+a>>2]=a;c[b+4>>2]=o|3}else{c[1798]=0;c[1801]=0;c[b+4>>2]=d|3;L=b+d+4|0;c[L>>2]=c[L>>2]|1}L=b+8|0;return L|0}a=c[1799]|0;if(a>>>0>o>>>0){J=a-o|0;c[1799]=J;L=c[1802]|0;K=L+o|0;c[1802]=K;c[K+4>>2]=J|1;c[L+4>>2]=o|3;L=L+8|0;return L|0}do if(!(c[1914]|0)){a=Ma(30)|0;if(!(a+-1&a)){c[1916]=a;c[1915]=a;c[1917]=-1;c[1918]=-1;c[1919]=0;c[1907]=0;c[1914]=(Qa(0)|0)&-16^1431655768;break}else ra()}while(0);h=o+48|0;g=c[1916]|0;i=o+47|0;f=g+i|0;g=0-g|0;j=f&g;if(j>>>0<=o>>>0){L=0;return L|0}a=c[1906]|0;if(a|0?(u=c[1904]|0,v=u+j|0,v>>>0<=u>>>0|v>>>0>a>>>0):0){L=0;return L|0}b:do if(!(c[1907]&4)){a=c[1802]|0;c:do if(a){d=7632;while(1){b=c[d>>2]|0;if(b>>>0<=a>>>0?(r=d+4|0,(b+(c[r>>2]|0)|0)>>>0>a>>>0):0){e=d;d=r;break}d=c[d+8>>2]|0;if(!d){E=173;break c}}a=f-(c[1799]|0)&g;if(a>>>0<2147483647){b=ya(a|0)|0;if((b|0)==((c[e>>2]|0)+(c[d>>2]|0)|0)){if((b|0)!=(-1|0)){h=b;f=a;E=193;break b}}else E=183}}else E=173;while(0);do if((E|0)==173?(t=ya(0)|0,(t|0)!=(-1|0)):0){a=t;b=c[1915]|0;d=b+-1|0;if(!(d&a))a=j;else a=j-a+(d+a&0-b)|0;b=c[1904]|0;d=b+a|0;if(a>>>0>o>>>0&a>>>0<2147483647){v=c[1906]|0;if(v|0?d>>>0<=b>>>0|d>>>0>v>>>0:0)break;b=ya(a|0)|0;if((b|0)==(t|0)){h=t;f=a;E=193;break b}else E=183}}while(0);d:do if((E|0)==183){d=0-a|0;do if(h>>>0>a>>>0&(a>>>0<2147483647&(b|0)!=(-1|0))?(w=c[1916]|0,w=i-a+w&0-w,w>>>0<2147483647):0)if((ya(w|0)|0)==(-1|0)){ya(d|0)|0;break d}else{a=w+a|0;break}while(0);if((b|0)!=(-1|0)){h=b;f=a;E=193;break b}}while(0);c[1907]=c[1907]|4;E=190}else E=190;while(0);if((((E|0)==190?j>>>0<2147483647:0)?(x=ya(j|0)|0,y=ya(0)|0,x>>>0<y>>>0&((x|0)!=(-1|0)&(y|0)!=(-1|0))):0)?(z=y-x|0,z>>>0>(o+40|0)>>>0):0){h=x;f=z;E=193}if((E|0)==193){a=(c[1904]|0)+f|0;c[1904]=a;if(a>>>0>(c[1905]|0)>>>0)c[1905]=a;i=c[1802]|0;do if(i){e=7632;do{a=c[e>>2]|0;b=e+4|0;d=c[b>>2]|0;if((h|0)==(a+d|0)){A=a;B=b;C=d;D=e;E=203;break}e=c[e+8>>2]|0}while((e|0)!=0);if(((E|0)==203?(c[D+12>>2]&8|0)==0:0)?i>>>0<h>>>0&i>>>0>=A>>>0:0){c[B>>2]=C+f;L=i+8|0;L=(L&7|0)==0?0:0-L&7;K=i+L|0;L=f-L+(c[1799]|0)|0;c[1802]=K;c[1799]=L;c[K+4>>2]=L|1;c[K+L+4>>2]=40;c[1803]=c[1918];break}a=c[1800]|0;if(h>>>0<a>>>0){c[1800]=h;j=h}else j=a;d=h+f|0;a=7632;while(1){if((c[a>>2]|0)==(d|0)){b=a;E=211;break}a=c[a+8>>2]|0;if(!a){b=7632;break}}if((E|0)==211)if(!(c[a+12>>2]&8)){c[b>>2]=h;l=a+4|0;c[l>>2]=(c[l>>2]|0)+f;l=h+8|0;l=h+((l&7|0)==0?0:0-l&7)|0;a=d+8|0;a=d+((a&7|0)==0?0:0-a&7)|0;k=l+o|0;g=a-l-o|0;c[l+4>>2]=o|3;do if((a|0)!=(i|0)){if((a|0)==(c[1801]|0)){L=(c[1798]|0)+g|0;c[1798]=L;c[1801]=k;c[k+4>>2]=L|1;c[k+L>>2]=L;break}b=c[a+4>>2]|0;if((b&3|0)==1){i=b&-8;f=b>>>3;e:do if(b>>>0>=256){h=c[a+24>>2]|0;e=c[a+12>>2]|0;do if((e|0)==(a|0)){d=a+16|0;e=d+4|0;b=c[e>>2]|0;if(!b){b=c[d>>2]|0;if(!b){J=0;break}}else d=e;while(1){e=b+20|0;f=c[e>>2]|0;if(f|0){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<j>>>0)ra();else{c[d>>2]=0;J=b;break}}else{f=c[a+8>>2]|0;if(f>>>0<j>>>0)ra();b=f+12|0;if((c[b>>2]|0)!=(a|0))ra();d=e+8|0;if((c[d>>2]|0)==(a|0)){c[b>>2]=e;c[d>>2]=f;J=e;break}else ra()}while(0);if(!h)break;b=c[a+28>>2]|0;d=7488+(b<<2)|0;do if((a|0)!=(c[d>>2]|0)){if(h>>>0<(c[1800]|0)>>>0)ra();b=h+16|0;if((c[b>>2]|0)==(a|0))c[b>>2]=J;else c[h+20>>2]=J;if(!J)break e}else{c[d>>2]=J;if(J|0)break;c[1797]=c[1797]&~(1<<b);break e}while(0);e=c[1800]|0;if(J>>>0<e>>>0)ra();c[J+24>>2]=h;b=a+16|0;d=c[b>>2]|0;do if(d|0)if(d>>>0<e>>>0)ra();else{c[J+16>>2]=d;c[d+24>>2]=J;break}while(0);b=c[b+4>>2]|0;if(!b)break;if(b>>>0<(c[1800]|0)>>>0)ra();else{c[J+20>>2]=b;c[b+24>>2]=J;break}}else{d=c[a+8>>2]|0;e=c[a+12>>2]|0;b=7224+(f<<1<<2)|0;do if((d|0)!=(b|0)){if(d>>>0<j>>>0)ra();if((c[d+12>>2]|0)==(a|0))break;ra()}while(0);if((e|0)==(d|0)){c[1796]=c[1796]&~(1<<f);break}do if((e|0)==(b|0))G=e+8|0;else{if(e>>>0<j>>>0)ra();b=e+8|0;if((c[b>>2]|0)==(a|0)){G=b;break}ra()}while(0);c[d+12>>2]=e;c[G>>2]=d}while(0);a=a+i|0;g=i+g|0}a=a+4|0;c[a>>2]=c[a>>2]&-2;c[k+4>>2]=g|1;c[k+g>>2]=g;a=g>>>3;if(g>>>0<256){d=7224+(a<<1<<2)|0;b=c[1796]|0;a=1<<a;do if(!(b&a)){c[1796]=b|a;K=d+8|0;L=d}else{a=d+8|0;b=c[a>>2]|0;if(b>>>0>=(c[1800]|0)>>>0){K=a;L=b;break}ra()}while(0);c[K>>2]=k;c[L+12>>2]=k;c[k+8>>2]=L;c[k+12>>2]=d;break}a=g>>>8;do if(!a)d=0;else{if(g>>>0>16777215){d=31;break}K=(a+1048320|0)>>>16&8;L=a<<K;J=(L+520192|0)>>>16&4;L=L<<J;d=(L+245760|0)>>>16&2;d=14-(J|K|d)+(L<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}while(0);e=7488+(d<<2)|0;c[k+28>>2]=d;a=k+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[1797]|0;b=1<<d;if(!(a&b)){c[1797]=a|b;c[e>>2]=k;c[k+24>>2]=e;c[k+12>>2]=k;c[k+8>>2]=k;break}f=g<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(g|0)){d=a;E=281;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){E=278;break}else{f=f<<1;a=d}}if((E|0)==278)if(b>>>0<(c[1800]|0)>>>0)ra();else{c[b>>2]=k;c[k+24>>2]=a;c[k+12>>2]=k;c[k+8>>2]=k;break}else if((E|0)==281){a=d+8|0;b=c[a>>2]|0;L=c[1800]|0;if(b>>>0>=L>>>0&d>>>0>=L>>>0){c[b+12>>2]=k;c[a>>2]=k;c[k+8>>2]=b;c[k+12>>2]=d;c[k+24>>2]=0;break}else ra()}}else{L=(c[1799]|0)+g|0;c[1799]=L;c[1802]=k;c[k+4>>2]=L|1}while(0);L=l+8|0;return L|0}else b=7632;while(1){a=c[b>>2]|0;if(a>>>0<=i>>>0?(F=a+(c[b+4>>2]|0)|0,F>>>0>i>>>0):0){b=F;break}b=c[b+8>>2]|0}g=b+-47|0;d=g+8|0;d=g+((d&7|0)==0?0:0-d&7)|0;g=i+16|0;d=d>>>0<g>>>0?i:d;a=d+8|0;e=h+8|0;e=(e&7|0)==0?0:0-e&7;L=h+e|0;e=f+-40-e|0;c[1802]=L;c[1799]=e;c[L+4>>2]=e|1;c[L+e+4>>2]=40;c[1803]=c[1918];e=d+4|0;c[e>>2]=27;c[a>>2]=c[1908];c[a+4>>2]=c[1909];c[a+8>>2]=c[1910];c[a+12>>2]=c[1911];c[1908]=h;c[1909]=f;c[1911]=0;c[1910]=a;a=d+24|0;do{a=a+4|0;c[a>>2]=7}while((a+4|0)>>>0<b>>>0);if((d|0)!=(i|0)){h=d-i|0;c[e>>2]=c[e>>2]&-2;c[i+4>>2]=h|1;c[d>>2]=h;a=h>>>3;if(h>>>0<256){d=7224+(a<<1<<2)|0;b=c[1796]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();else{H=a;I=b}}else{c[1796]=b|a;H=d+8|0;I=d}c[H>>2]=i;c[I+12>>2]=i;c[i+8>>2]=I;c[i+12>>2]=d;break}a=h>>>8;if(a)if(h>>>0>16777215)d=31;else{K=(a+1048320|0)>>>16&8;L=a<<K;J=(L+520192|0)>>>16&4;L=L<<J;d=(L+245760|0)>>>16&2;d=14-(J|K|d)+(L<<d>>>15)|0;d=h>>>(d+7|0)&1|d<<1}else d=0;f=7488+(d<<2)|0;c[i+28>>2]=d;c[i+20>>2]=0;c[g>>2]=0;a=c[1797]|0;b=1<<d;if(!(a&b)){c[1797]=a|b;c[f>>2]=i;c[i+24>>2]=f;c[i+12>>2]=i;c[i+8>>2]=i;break}e=h<<((d|0)==31?0:25-(d>>>1)|0);a=c[f>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(h|0)){d=a;E=307;break}b=a+16+(e>>>31<<2)|0;d=c[b>>2]|0;if(!d){E=304;break}else{e=e<<1;a=d}}if((E|0)==304)if(b>>>0<(c[1800]|0)>>>0)ra();else{c[b>>2]=i;c[i+24>>2]=a;c[i+12>>2]=i;c[i+8>>2]=i;break}else if((E|0)==307){a=d+8|0;b=c[a>>2]|0;L=c[1800]|0;if(b>>>0>=L>>>0&d>>>0>=L>>>0){c[b+12>>2]=i;c[a>>2]=i;c[i+8>>2]=b;c[i+12>>2]=d;c[i+24>>2]=0;break}else ra()}}}else{L=c[1800]|0;if((L|0)==0|h>>>0<L>>>0)c[1800]=h;c[1908]=h;c[1909]=f;c[1911]=0;c[1805]=c[1914];c[1804]=-1;a=0;do{L=7224+(a<<1<<2)|0;c[L+12>>2]=L;c[L+8>>2]=L;a=a+1|0}while((a|0)!=32);L=h+8|0;L=(L&7|0)==0?0:0-L&7;K=h+L|0;L=f+-40-L|0;c[1802]=K;c[1799]=L;c[K+4>>2]=L|1;c[K+L+4>>2]=40;c[1803]=c[1918]}while(0);a=c[1799]|0;if(a>>>0>o>>>0){J=a-o|0;c[1799]=J;L=c[1802]|0;K=L+o|0;c[1802]=K;c[K+4>>2]=J|1;c[L+4>>2]=o|3;L=L+8|0;return L|0}}c[(Rc()|0)>>2]=12;L=0;return L|0}function Qd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(!a)return;d=a+-8|0;h=c[1800]|0;if(d>>>0<h>>>0)ra();a=c[a+-4>>2]|0;b=a&3;if((b|0)==1)ra();e=a&-8;m=d+e|0;do if(!(a&1)){a=c[d>>2]|0;if(!b)return;k=d+(0-a)|0;j=a+e|0;if(k>>>0<h>>>0)ra();if((k|0)==(c[1801]|0)){a=m+4|0;b=c[a>>2]|0;if((b&3|0)!=3){q=k;g=j;break}c[1798]=j;c[a>>2]=b&-2;c[k+4>>2]=j|1;c[k+j>>2]=j;return}e=a>>>3;if(a>>>0<256){b=c[k+8>>2]|0;d=c[k+12>>2]|0;a=7224+(e<<1<<2)|0;if((b|0)!=(a|0)){if(b>>>0<h>>>0)ra();if((c[b+12>>2]|0)!=(k|0))ra()}if((d|0)==(b|0)){c[1796]=c[1796]&~(1<<e);q=k;g=j;break}if((d|0)!=(a|0)){if(d>>>0<h>>>0)ra();a=d+8|0;if((c[a>>2]|0)==(k|0))f=a;else ra()}else f=d+8|0;c[b+12>>2]=d;c[f>>2]=b;q=k;g=j;break}f=c[k+24>>2]|0;d=c[k+12>>2]|0;do if((d|0)==(k|0)){b=k+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){i=0;break}}else b=d;while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<h>>>0)ra();else{c[b>>2]=0;i=a;break}}else{e=c[k+8>>2]|0;if(e>>>0<h>>>0)ra();a=e+12|0;if((c[a>>2]|0)!=(k|0))ra();b=d+8|0;if((c[b>>2]|0)==(k|0)){c[a>>2]=d;c[b>>2]=e;i=d;break}else ra()}while(0);if(f){a=c[k+28>>2]|0;b=7488+(a<<2)|0;if((k|0)==(c[b>>2]|0)){c[b>>2]=i;if(!i){c[1797]=c[1797]&~(1<<a);q=k;g=j;break}}else{if(f>>>0<(c[1800]|0)>>>0)ra();a=f+16|0;if((c[a>>2]|0)==(k|0))c[a>>2]=i;else c[f+20>>2]=i;if(!i){q=k;g=j;break}}d=c[1800]|0;if(i>>>0<d>>>0)ra();c[i+24>>2]=f;a=k+16|0;b=c[a>>2]|0;do if(b|0)if(b>>>0<d>>>0)ra();else{c[i+16>>2]=b;c[b+24>>2]=i;break}while(0);a=c[a+4>>2]|0;if(a)if(a>>>0<(c[1800]|0)>>>0)ra();else{c[i+20>>2]=a;c[a+24>>2]=i;q=k;g=j;break}else{q=k;g=j}}else{q=k;g=j}}else{q=d;g=e}while(0);if(q>>>0>=m>>>0)ra();a=m+4|0;b=c[a>>2]|0;if(!(b&1))ra();if(!(b&2)){if((m|0)==(c[1802]|0)){p=(c[1799]|0)+g|0;c[1799]=p;c[1802]=q;c[q+4>>2]=p|1;if((q|0)!=(c[1801]|0))return;c[1801]=0;c[1798]=0;return}if((m|0)==(c[1801]|0)){p=(c[1798]|0)+g|0;c[1798]=p;c[1801]=q;c[q+4>>2]=p|1;c[q+p>>2]=p;return}g=(b&-8)+g|0;e=b>>>3;do if(b>>>0>=256){f=c[m+24>>2]|0;a=c[m+12>>2]|0;do if((a|0)==(m|0)){b=m+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){n=0;break}}else b=d;while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}if(b>>>0<(c[1800]|0)>>>0)ra();else{c[b>>2]=0;n=a;break}}else{b=c[m+8>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();d=b+12|0;if((c[d>>2]|0)!=(m|0))ra();e=a+8|0;if((c[e>>2]|0)==(m|0)){c[d>>2]=a;c[e>>2]=b;n=a;break}else ra()}while(0);if(f|0){a=c[m+28>>2]|0;b=7488+(a<<2)|0;if((m|0)==(c[b>>2]|0)){c[b>>2]=n;if(!n){c[1797]=c[1797]&~(1<<a);break}}else{if(f>>>0<(c[1800]|0)>>>0)ra();a=f+16|0;if((c[a>>2]|0)==(m|0))c[a>>2]=n;else c[f+20>>2]=n;if(!n)break}d=c[1800]|0;if(n>>>0<d>>>0)ra();c[n+24>>2]=f;a=m+16|0;b=c[a>>2]|0;do if(b|0)if(b>>>0<d>>>0)ra();else{c[n+16>>2]=b;c[b+24>>2]=n;break}while(0);a=c[a+4>>2]|0;if(a|0)if(a>>>0<(c[1800]|0)>>>0)ra();else{c[n+20>>2]=a;c[a+24>>2]=n;break}}}else{b=c[m+8>>2]|0;d=c[m+12>>2]|0;a=7224+(e<<1<<2)|0;if((b|0)!=(a|0)){if(b>>>0<(c[1800]|0)>>>0)ra();if((c[b+12>>2]|0)!=(m|0))ra()}if((d|0)==(b|0)){c[1796]=c[1796]&~(1<<e);break}if((d|0)!=(a|0)){if(d>>>0<(c[1800]|0)>>>0)ra();a=d+8|0;if((c[a>>2]|0)==(m|0))l=a;else ra()}else l=d+8|0;c[b+12>>2]=d;c[l>>2]=b}while(0);c[q+4>>2]=g|1;c[q+g>>2]=g;if((q|0)==(c[1801]|0)){c[1798]=g;return}}else{c[a>>2]=b&-2;c[q+4>>2]=g|1;c[q+g>>2]=g}a=g>>>3;if(g>>>0<256){d=7224+(a<<1<<2)|0;b=c[1796]|0;a=1<<a;if(b&a){a=d+8|0;b=c[a>>2]|0;if(b>>>0<(c[1800]|0)>>>0)ra();else{o=a;p=b}}else{c[1796]=b|a;o=d+8|0;p=d}c[o>>2]=q;c[p+12>>2]=q;c[q+8>>2]=p;c[q+12>>2]=d;return}a=g>>>8;if(a)if(g>>>0>16777215)d=31;else{o=(a+1048320|0)>>>16&8;p=a<<o;n=(p+520192|0)>>>16&4;p=p<<n;d=(p+245760|0)>>>16&2;d=14-(n|o|d)+(p<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}else d=0;e=7488+(d<<2)|0;c[q+28>>2]=d;c[q+20>>2]=0;c[q+16>>2]=0;a=c[1797]|0;b=1<<d;do if(a&b){f=g<<((d|0)==31?0:25-(d>>>1)|0);a=c[e>>2]|0;while(1){if((c[a+4>>2]&-8|0)==(g|0)){d=a;e=130;break}b=a+16+(f>>>31<<2)|0;d=c[b>>2]|0;if(!d){e=127;break}else{f=f<<1;a=d}}if((e|0)==127)if(b>>>0<(c[1800]|0)>>>0)ra();else{c[b>>2]=q;c[q+24>>2]=a;c[q+12>>2]=q;c[q+8>>2]=q;break}else if((e|0)==130){a=d+8|0;b=c[a>>2]|0;p=c[1800]|0;if(b>>>0>=p>>>0&d>>>0>=p>>>0){c[b+12>>2]=q;c[a>>2]=q;c[q+8>>2]=b;c[q+12>>2]=d;c[q+24>>2]=0;break}else ra()}}else{c[1797]=a|b;c[e>>2]=q;c[q+24>>2]=e;c[q+12>>2]=q;c[q+8>>2]=q}while(0);q=(c[1804]|0)+-1|0;c[1804]=q;if(!q)a=7640;else return;while(1){a=c[a>>2]|0;if(!a)break;else a=a+8|0}c[1804]=-1;return}function Rd(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){a=Pd(b)|0;return a|0}if(b>>>0>4294967231){c[(Rc()|0)>>2]=12;a=0;return a|0}d=Sd(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d|0){a=d+8|0;return a|0}d=Pd(b)|0;if(!d){a=0;return a|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;Ee(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Qd(a);a=d;return a|0}function Sd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;n=a+4|0;o=c[n>>2]|0;d=o&-8;k=a+d|0;i=c[1800]|0;e=o&3;if(!((e|0)!=1&a>>>0>=i>>>0&a>>>0<k>>>0))ra();f=c[k+4>>2]|0;if(!(f&1))ra();if(!e){if(b>>>0<256){a=0;return a|0}if(d>>>0>=(b+4|0)>>>0?(d-b|0)>>>0<=c[1916]<<1>>>0:0)return a|0;a=0;return a|0}if(d>>>0>=b>>>0){d=d-b|0;if(d>>>0<=15)return a|0;m=a+b|0;c[n>>2]=o&1|b|2;c[m+4>>2]=d|3;b=m+d+4|0;c[b>>2]=c[b>>2]|1;Td(m,d);return a|0}if((k|0)==(c[1802]|0)){d=(c[1799]|0)+d|0;if(d>>>0<=b>>>0){a=0;return a|0}m=d-b|0;l=a+b|0;c[n>>2]=o&1|b|2;c[l+4>>2]=m|1;c[1802]=l;c[1799]=m;return a|0}if((k|0)==(c[1801]|0)){e=(c[1798]|0)+d|0;if(e>>>0<b>>>0){a=0;return a|0}d=e-b|0;if(d>>>0>15){e=a+b|0;m=e+d|0;c[n>>2]=o&1|b|2;c[e+4>>2]=d|1;c[m>>2]=d;b=m+4|0;c[b>>2]=c[b>>2]&-2}else{c[n>>2]=o&1|e|2;e=a+e+4|0;c[e>>2]=c[e>>2]|1;e=0;d=0}c[1798]=d;c[1801]=e;return a|0}if(f&2|0){a=0;return a|0}l=(f&-8)+d|0;if(l>>>0<b>>>0){a=0;return a|0}m=l-b|0;g=f>>>3;do if(f>>>0>=256){h=c[k+24>>2]|0;f=c[k+12>>2]|0;do if((f|0)==(k|0)){e=k+16|0;f=e+4|0;d=c[f>>2]|0;if(!d){d=c[e>>2]|0;if(!d){j=0;break}}else e=f;while(1){f=d+20|0;g=c[f>>2]|0;if(g|0){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<i>>>0)ra();else{c[e>>2]=0;j=d;break}}else{g=c[k+8>>2]|0;if(g>>>0<i>>>0)ra();d=g+12|0;if((c[d>>2]|0)!=(k|0))ra();e=f+8|0;if((c[e>>2]|0)==(k|0)){c[d>>2]=f;c[e>>2]=g;j=f;break}else ra()}while(0);if(h|0){d=c[k+28>>2]|0;e=7488+(d<<2)|0;if((k|0)==(c[e>>2]|0)){c[e>>2]=j;if(!j){c[1797]=c[1797]&~(1<<d);break}}else{if(h>>>0<(c[1800]|0)>>>0)ra();d=h+16|0;if((c[d>>2]|0)==(k|0))c[d>>2]=j;else c[h+20>>2]=j;if(!j)break}f=c[1800]|0;if(j>>>0<f>>>0)ra();c[j+24>>2]=h;d=k+16|0;e=c[d>>2]|0;do if(e|0)if(e>>>0<f>>>0)ra();else{c[j+16>>2]=e;c[e+24>>2]=j;break}while(0);d=c[d+4>>2]|0;if(d|0)if(d>>>0<(c[1800]|0)>>>0)ra();else{c[j+20>>2]=d;c[d+24>>2]=j;break}}}else{e=c[k+8>>2]|0;f=c[k+12>>2]|0;d=7224+(g<<1<<2)|0;if((e|0)!=(d|0)){if(e>>>0<i>>>0)ra();if((c[e+12>>2]|0)!=(k|0))ra()}if((f|0)==(e|0)){c[1796]=c[1796]&~(1<<g);break}if((f|0)!=(d|0)){if(f>>>0<i>>>0)ra();d=f+8|0;if((c[d>>2]|0)==(k|0))h=d;else ra()}else h=f+8|0;c[e+12>>2]=f;c[h>>2]=e}while(0);if(m>>>0<16){c[n>>2]=l|o&1|2;b=a+l+4|0;c[b>>2]=c[b>>2]|1;return a|0}else{l=a+b|0;c[n>>2]=o&1|b|2;c[l+4>>2]=m|3;b=l+m+4|0;c[b>>2]=c[b>>2]|1;Td(l,m);return a|0}return 0}function Td(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;o=a+b|0;d=c[a+4>>2]|0;do if(!(d&1)){f=c[a>>2]|0;if(!(d&3))return;l=a+(0-f)|0;k=f+b|0;i=c[1800]|0;if(l>>>0<i>>>0)ra();if((l|0)==(c[1801]|0)){a=o+4|0;d=c[a>>2]|0;if((d&3|0)!=3){r=l;g=k;break}c[1798]=k;c[a>>2]=d&-2;c[l+4>>2]=k|1;c[l+k>>2]=k;return}e=f>>>3;if(f>>>0<256){a=c[l+8>>2]|0;b=c[l+12>>2]|0;d=7224+(e<<1<<2)|0;if((a|0)!=(d|0)){if(a>>>0<i>>>0)ra();if((c[a+12>>2]|0)!=(l|0))ra()}if((b|0)==(a|0)){c[1796]=c[1796]&~(1<<e);r=l;g=k;break}if((b|0)!=(d|0)){if(b>>>0<i>>>0)ra();d=b+8|0;if((c[d>>2]|0)==(l|0))h=d;else ra()}else h=b+8|0;c[a+12>>2]=b;c[h>>2]=a;r=l;g=k;break}f=c[l+24>>2]|0;b=c[l+12>>2]|0;do if((b|0)==(l|0)){a=l+16|0;b=a+4|0;d=c[b>>2]|0;if(!d){d=c[a>>2]|0;if(!d){j=0;break}}else a=b;while(1){b=d+20|0;e=c[b>>2]|0;if(e|0){d=e;a=b;continue}b=d+16|0;e=c[b>>2]|0;if(!e)break;else{d=e;a=b}}if(a>>>0<i>>>0)ra();else{c[a>>2]=0;j=d;break}}else{e=c[l+8>>2]|0;if(e>>>0<i>>>0)ra();d=e+12|0;if((c[d>>2]|0)!=(l|0))ra();a=b+8|0;if((c[a>>2]|0)==(l|0)){c[d>>2]=b;c[a>>2]=e;j=b;break}else ra()}while(0);if(f){d=c[l+28>>2]|0;a=7488+(d<<2)|0;if((l|0)==(c[a>>2]|0)){c[a>>2]=j;if(!j){c[1797]=c[1797]&~(1<<d);r=l;g=k;break}}else{if(f>>>0<(c[1800]|0)>>>0)ra();d=f+16|0;if((c[d>>2]|0)==(l|0))c[d>>2]=j;else c[f+20>>2]=j;if(!j){r=l;g=k;break}}b=c[1800]|0;if(j>>>0<b>>>0)ra();c[j+24>>2]=f;d=l+16|0;a=c[d>>2]|0;do if(a|0)if(a>>>0<b>>>0)ra();else{c[j+16>>2]=a;c[a+24>>2]=j;break}while(0);d=c[d+4>>2]|0;if(d)if(d>>>0<(c[1800]|0)>>>0)ra();else{c[j+20>>2]=d;c[d+24>>2]=j;r=l;g=k;break}else{r=l;g=k}}else{r=l;g=k}}else{r=a;g=b}while(0);h=c[1800]|0;if(o>>>0<h>>>0)ra();d=o+4|0;a=c[d>>2]|0;if(!(a&2)){if((o|0)==(c[1802]|0)){q=(c[1799]|0)+g|0;c[1799]=q;c[1802]=r;c[r+4>>2]=q|1;if((r|0)!=(c[1801]|0))return;c[1801]=0;c[1798]=0;return}if((o|0)==(c[1801]|0)){q=(c[1798]|0)+g|0;c[1798]=q;c[1801]=r;c[r+4>>2]=q|1;c[r+q>>2]=q;return}g=(a&-8)+g|0;e=a>>>3;do if(a>>>0>=256){f=c[o+24>>2]|0;b=c[o+12>>2]|0;do if((b|0)==(o|0)){a=o+16|0;b=a+4|0;d=c[b>>2]|0;if(!d){d=c[a>>2]|0;if(!d){n=0;break}}else a=b;while(1){b=d+20|0;e=c[b>>2]|0;if(e|0){d=e;a=b;continue}b=d+16|0;e=c[b>>2]|0;if(!e)break;else{d=e;a=b}}if(a>>>0<h>>>0)ra();else{c[a>>2]=0;n=d;break}}else{e=c[o+8>>2]|0;if(e>>>0<h>>>0)ra();d=e+12|0;if((c[d>>2]|0)!=(o|0))ra();a=b+8|0;if((c[a>>2]|0)==(o|0)){c[d>>2]=b;c[a>>2]=e;n=b;break}else ra()}while(0);if(f|0){d=c[o+28>>2]|0;a=7488+(d<<2)|0;if((o|0)==(c[a>>2]|0)){c[a>>2]=n;if(!n){c[1797]=c[1797]&~(1<<d);break}}else{if(f>>>0<(c[1800]|0)>>>0)ra();d=f+16|0;if((c[d>>2]|0)==(o|0))c[d>>2]=n;else c[f+20>>2]=n;if(!n)break}b=c[1800]|0;if(n>>>0<b>>>0)ra();c[n+24>>2]=f;d=o+16|0;a=c[d>>2]|0;do if(a|0)if(a>>>0<b>>>0)ra();else{c[n+16>>2]=a;c[a+24>>2]=n;break}while(0);d=c[d+4>>2]|0;if(d|0)if(d>>>0<(c[1800]|0)>>>0)ra();else{c[n+20>>2]=d;c[d+24>>2]=n;break}}}else{a=c[o+8>>2]|0;b=c[o+12>>2]|0;d=7224+(e<<1<<2)|0;if((a|0)!=(d|0)){if(a>>>0<h>>>0)ra();if((c[a+12>>2]|0)!=(o|0))ra()}if((b|0)==(a|0)){c[1796]=c[1796]&~(1<<e);break}if((b|0)!=(d|0)){if(b>>>0<h>>>0)ra();d=b+8|0;if((c[d>>2]|0)==(o|0))m=d;else ra()}else m=b+8|0;c[a+12>>2]=b;c[m>>2]=a}while(0);c[r+4>>2]=g|1;c[r+g>>2]=g;if((r|0)==(c[1801]|0)){c[1798]=g;return}}else{c[d>>2]=a&-2;c[r+4>>2]=g|1;c[r+g>>2]=g}d=g>>>3;if(g>>>0<256){b=7224+(d<<1<<2)|0;a=c[1796]|0;d=1<<d;if(a&d){d=b+8|0;a=c[d>>2]|0;if(a>>>0<(c[1800]|0)>>>0)ra();else{p=d;q=a}}else{c[1796]=a|d;p=b+8|0;q=b}c[p>>2]=r;c[q+12>>2]=r;c[r+8>>2]=q;c[r+12>>2]=b;return}d=g>>>8;if(d)if(g>>>0>16777215)b=31;else{p=(d+1048320|0)>>>16&8;q=d<<p;o=(q+520192|0)>>>16&4;q=q<<o;b=(q+245760|0)>>>16&2;b=14-(o|p|b)+(q<<b>>>15)|0;b=g>>>(b+7|0)&1|b<<1}else b=0;e=7488+(b<<2)|0;c[r+28>>2]=b;c[r+20>>2]=0;c[r+16>>2]=0;d=c[1797]|0;a=1<<b;if(!(d&a)){c[1797]=d|a;c[e>>2]=r;c[r+24>>2]=e;c[r+12>>2]=r;c[r+8>>2]=r;return}f=g<<((b|0)==31?0:25-(b>>>1)|0);d=c[e>>2]|0;while(1){if((c[d+4>>2]&-8|0)==(g|0)){b=d;e=127;break}a=d+16+(f>>>31<<2)|0;b=c[a>>2]|0;if(!b){e=124;break}else{f=f<<1;d=b}}if((e|0)==124){if(a>>>0<(c[1800]|0)>>>0)ra();c[a>>2]=r;c[r+24>>2]=d;c[r+12>>2]=r;c[r+8>>2]=r;return}else if((e|0)==127){d=b+8|0;a=c[d>>2]|0;q=c[1800]|0;if(!(a>>>0>=q>>>0&b>>>0>=q>>>0))ra();c[a+12>>2]=r;c[d>>2]=r;c[r+8>>2]=a;c[r+12>>2]=b;c[r+24>>2]=0;return}}function Ud(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0,j=0;f=i;i=i+48|0;h=f+32|0;d=f+24|0;j=f+16|0;g=f;f=f+36|0;a=Vd()|0;if(a|0?(e=c[a>>2]|0,e|0):0){a=e+48|0;b=c[a>>2]|0;a=c[a+4>>2]|0;if(!((b&-256|0)==1126902528&(a|0)==1129074247)){c[d>>2]=c[202];Yd(6188,d)}if((b|0)==1126902529&(a|0)==1129074247)a=c[e+44>>2]|0;else a=e+80|0;c[f>>2]=a;e=c[e>>2]|0;a=c[e+4>>2]|0;if(Xa[c[(c[24]|0)+16>>2]&7](96,e,f)|0){j=c[f>>2]|0;f=c[202]|0;j=$a[c[(c[j>>2]|0)+8>>2]&3](j)|0;c[g>>2]=f;c[g+4>>2]=a;c[g+8>>2]=j;Yd(6102,g)}else{c[j>>2]=c[202];c[j+4>>2]=a;Yd(6147,j)}}Yd(6226,h)}function Vd(){var a=0,b=0;a=i;i=i+16|0;if(!(Ga(7680,3)|0)){b=Ea(c[1921]|0)|0;i=a;return b|0}else Yd(5914,a);return 0}function Wd(){var a=0;a=i;i=i+16|0;if(!(Ha(7684,21)|0)){i=a;return}else Yd(5864,a)}function Xd(a){a=a|0;var b=0;b=i;i=i+16|0;Qd(a);if(!(Ja(c[1921]|0,0)|0)){i=b;return}else Yd(5811,b)}function Yd(a,b){a=a|0;b=b|0;var d=0;d=i;i=i+16|0;c[d>>2]=b;b=c[116]|0;$c(b,a,d)|0;Kd(10,b)|0;ra()}function Zd(a){a=a|0;return}function _d(a){a=a|0;return}function $d(a){a=a|0;ae(a);return}function ae(a){a=a|0;Qd(a);return}function be(a){a=a|0;return}function ce(a){a=a|0;return}function de(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=i;i=i+64|0;g=h;if((a|0)!=(b|0))if((b|0)!=0?(f=ee(b,136,104,0)|0,(f|0)!=0):0){b=g;e=b+56|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(e|0));c[g>>2]=f;c[g+8>>2]=a;c[g+12>>2]=-1;c[g+48>>2]=1;db[c[(c[f>>2]|0)+28>>2]&3](f,g,c[d>>2]|0,1);if((c[g+24>>2]|0)==1){c[d>>2]=c[g+16>>2];b=1}else b=0}else b=0;else b=1;i=h;return b|0}function ee(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+64|0;q=r;p=c[d>>2]|0;o=d+(c[p+-8>>2]|0)|0;p=c[p+-4>>2]|0;c[q>>2]=f;c[q+4>>2]=d;c[q+8>>2]=e;c[q+12>>2]=g;l=q+16|0;g=q+20|0;d=q+24|0;e=q+28|0;h=q+32|0;j=q+40|0;k=(p|0)==(f|0);m=l;n=m+36|0;do{c[m>>2]=0;m=m+4|0}while((m|0)<(n|0));b[l+36>>1]=0;a[l+38>>0]=0;a:do if(k){c[q+48>>2]=1;bb[c[(c[f>>2]|0)+20>>2]&3](f,q,o,o,1,0);g=(c[d>>2]|0)==1?o:0}else{Ya[c[(c[p>>2]|0)+24>>2]&3](p,q,o,1,0);switch(c[q+36>>2]|0){case 0:{g=(c[j>>2]|0)==1&(c[e>>2]|0)==1&(c[h>>2]|0)==1?c[g>>2]|0:0;break a}case 1:break;default:{g=0;break a}}if((c[d>>2]|0)!=1?!((c[j>>2]|0)==0&(c[e>>2]|0)==1&(c[h>>2]|0)==1):0){g=0;break}g=c[l>>2]|0}while(0);i=r;return g|0}function fe(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((a|0)==(c[b+8>>2]|0))ge(0,b,d,e,f);else{a=c[a+8>>2]|0;bb[c[(c[a>>2]|0)+20>>2]&3](a,b,d,e,f,g)}return}function ge(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;a[d+53>>0]=1;do if((c[d+4>>2]|0)==(f|0)){a[d+52>>0]=1;f=d+16|0;b=c[f>>2]|0;if(!b){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((g|0)==1?(c[d+48>>2]|0)==1:0))break;a[d+54>>0]=1;break}if((b|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;a[d+54>>0]=1;break}b=d+24|0;f=c[b>>2]|0;if((f|0)==2){c[b>>2]=g;f=g}if((f|0)==1?(c[d+48>>2]|0)==1:0)a[d+54>>0]=1}while(0);return}function he(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0;do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(h=d+28|0,(c[h>>2]|0)!=1):0)c[h>>2]=f}else{if((b|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;Ya[c[(c[j>>2]|0)+24>>2]&3](j,d,e,f,g);break}if((c[d+16>>2]|0)!=(e|0)?(j=d+20|0,(c[j>>2]|0)!=(e|0)):0){c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4)break;h=d+52|0;a[h>>0]=0;f=d+53|0;a[f>>0]=0;b=c[b+8>>2]|0;bb[c[(c[b>>2]|0)+20>>2]&3](b,d,e,e,1,g);if(a[f>>0]|0)if(!(a[h>>0]|0)){h=1;f=13}else f=17;else{h=0;f=13}do if((f|0)==13){c[j>>2]=e;e=d+40|0;c[e>>2]=(c[e>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54>>0]=1;if(h){f=17;break}else{h=4;break}}if(h)f=17;else h=4}while(0);if((f|0)==17)h=3;c[i>>2]=h;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function ie(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==(c[b+8>>2]|0))je(0,b,d,e);else{a=c[a+8>>2]|0;db[c[(c[a>>2]|0)+28>>2]&3](a,b,d,e)}return}function je(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;b=d+16|0;g=c[b>>2]|0;do if(g){if((g|0)!=(e|0)){f=d+36|0;c[f>>2]=(c[f>>2]|0)+1;c[d+24>>2]=2;a[d+54>>0]=1;break}b=d+24|0;if((c[b>>2]|0)==2)c[b>>2]=f}else{c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1}while(0);return}function ke(a){a=a|0;ae(a);return}function le(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((a|0)==(c[b+8>>2]|0))ge(0,b,d,e,f);return}function me(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(i=d+28|0,(c[i>>2]|0)!=1):0)c[i>>2]=f}else if((b|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(h=d+20|0,(c[h>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[h>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0)a[d+54>>0]=1;c[d+44>>2]=4;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function ne(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==(c[b+8>>2]|0))je(0,b,d,e);return}function oe(){var a=0,b=0,d=0,e=0;d=i;i=i+16|0;e=d+8|0;a=Vd()|0;if((a|0?(b=c[a>>2]|0,b|0):0)?(a=b+48|0,(c[a>>2]&-256|0)==1126902528?(c[a+4>>2]|0)==1129074247:0):0){ab[c[b+12>>2]&3]();Yd(6238,d)}d=c[181]|0;c[181]=d+0;ab[d&3]();Yd(6238,e)}function pe(a){a=a|0;return}function qe(a){a=a|0;return}function re(a){a=a|0;ae(a);return}function se(a){a=a|0;return 6291}function te(a){a=a|0;var b=0;b=(a|0)==0?1:a;while(1){a=Pd(b)|0;if(a|0){b=6;break}a=ue()|0;if(!a){b=5;break}ab[a&3]()}if((b|0)==5){b=ua(4)|0;c[b>>2]=820;La(b|0,160,17)}else if((b|0)==6)return a|0;return 0}function ue(){var a=0;a=c[1922]|0;c[1922]=a+0;return a|0}function ve(a){a=a|0;return te(a)|0}function we(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=c[d>>2];a=Xa[c[(c[a>>2]|0)+16>>2]&7](a,b,e)|0;if(a)c[d>>2]=c[e>>2];i=f;return a&1|0}function xe(a){a=a|0;if(!a)a=0;else a=(ee(a,136,192,0)|0)!=0;return a&1|0}function ye(){}function ze(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (D=d,a-c>>>0|0)|0}function Ae(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function Be(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}D=a<<c-32;return 0}function Ce(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (D=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function De(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=0;return b>>>c-32|0}function Ee(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Aa(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Fe(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=(b|0)<0?-1:0;return b>>c-32|0}function Ge(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function He(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;e=b&65535;c=$(e,f)|0;d=a>>>16;a=(c>>>16)+($(e,d)|0)|0;e=b>>>16;b=$(e,f)|0;return (D=(a>>>16)+($(e,d)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|c&65535|0)|0}function Ie(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=ze(j^a|0,i^b|0,j|0,i|0)|0;g=D;a=f^j;b=e^i;return ze((Ne(h,g,ze(f^c|0,e^d|0,f|0,e|0)|0,D,0)|0)^a|0,D^b|0,a|0,b|0)|0}function Je(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;j=f|0;h=b>>31|((b|0)<0?-1:0)<<1;g=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;l=e>>31|((e|0)<0?-1:0)<<1;k=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=ze(h^a|0,g^b|0,h|0,g|0)|0;b=D;Ne(a,b,ze(l^d|0,k^e|0,l|0,k|0)|0,D,j)|0;e=ze(c[j>>2]^h|0,c[j+4>>2]^g|0,h|0,g|0)|0;d=D;i=f;return (D=d,e)|0}function Ke(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;c=He(e,f)|0;a=D;return (D=($(b,f)|0)+($(d,e)|0)+a|a&0,c|0|0)|0}function Le(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Ne(a,b,c,d,0)|0}function Me(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+16|0;f=g|0;Ne(a,b,d,e,f)|0;i=g;return (D=c[f+4>>2]|0,c[f>>2]|0)|0}function Ne(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=d;n=e;i=n;if(!k){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(l>>>0)%(h>>>0);c[f+4>>2]=0}n=0;f=(l>>>0)/(h>>>0)>>>0;return (D=n,f)|0}else{if(!g){n=0;f=0;return (D=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;f=0;return (D=n,f)|0}}g=(i|0)==0;do if(h){if(!g){g=(ba(i|0)|0)-(ba(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!f){n=0;f=0;return (D=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;n=0;f=0;return (D=n,f)|0}g=h-1|0;if(g&h|0){i=(ba(h|0)|0)+33-(ba(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(f|0){c[f>>2]=g&l;c[f+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (D=o,p)|0}else{p=Ge(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (D=o,p)|0}}else{if(g){if(f|0){c[f>>2]=(k>>>0)%(h>>>0);c[f+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (D=o,p)|0}if(!l){if(f|0){c[f>>2]=0;c[f+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (D=o,p)|0}g=i-1|0;if(!(g&i)){if(f|0){c[f>>2]=a|0;c[f+4>>2]=g&k|b&0}o=0;p=k>>>((Ge(i|0)|0)>>>0);return (D=o,p)|0}g=(ba(i|0)|0)-(ba(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!f){o=0;p=0;return (D=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return (D=o,p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=d|0|0;l=n|e&0;k=Ce(m|0,l|0,-1,-1)|0;d=D;j=i;i=0;do{e=j;j=g>>>31|j<<1;g=i|g<<1;e=a<<1|e>>>31|0;n=a>>>31|b<<1|0;ze(k|0,d|0,e|0,n|0)|0;p=D;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=ze(e|0,n|0,o&m|0,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l|0)|0;b=D;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(f|0){c[f>>2]=a;c[f+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (D=o,p)|0}function Oe(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Xa[a&7](b|0,c|0,d|0)|0}function Pe(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Ya[a&3](b|0,c|0,d|0,e|0,f|0)}function Qe(a,b){a=a|0;b=b|0;Za[a&31](b|0)}function Re(a,b,c){a=a|0;b=b|0;c=c|0;_a[a&3](b|0,c|0)}function Se(a,b){a=a|0;b=b|0;return $a[a&3](b|0)|0}function Te(a){a=a|0;ab[a&3]()}function Ue(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;bb[a&3](b|0,c|0,d|0,e|0,f|0,g|0)}function Ve(a,b,c){a=a|0;b=b|0;c=c|0;return cb[a&3](b|0,c|0)|0}function We(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;db[a&3](b|0,c|0,d|0,e|0)}function Xe(a,b,c){a=a|0;b=b|0;c=c|0;ca(0);return 0}function Ye(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ca(1)}function Ze(a){a=a|0;ca(2)}function _e(a,b){a=a|0;b=b|0;ca(3)}function $e(a){a=a|0;ca(4);return 0}function af(){ca(5)}function bf(){Ua()}function cf(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ca(6)}function df(a,b){a=a|0;b=b|0;ca(7);return 0}function ef(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(8)}var Xa=[Xe,Uc,Tc,Vc,_c,de,Xe,Xe];var Ya=[Ye,me,he,Ye];var Za=[Ze,ob,pb,rb,ub,Bb,Cb,Db,Ib,oc,pc,qc,Zd,ke,be,ce,$d,pe,re,qb,Wc,Xd,Ze,Ze,Ze,Ze,Ze,Ze,Ze,Ze,Ze,Ze];var _a=[_e,tb,wb,Kb];var $a=[$e,Pc,se,$e];var ab=[af,bf,Ud,Wd];var bb=[cf,le,fe,cf];var cb=[df,sb,vb,Jb];var db=[ef,ne,ie,ef];return{___cxa_can_catch:we,_free:Qd,_solve_string:zb,___cxa_is_pointer_type:xe,_i64Add:Ce,_i64Subtract:ze,_memset:Ae,_malloc:Pd,_memcpy:Ee,_bitshift64Lshr:De,_fflush:Cd,___errno_location:Rc,_bitshift64Shl:Be,__GLOBAL__sub_I_Solver_cc:Hb,__GLOBAL__sub_I_SimpSolver_cc:tc,runPostSets:ye,stackAlloc:eb,stackSave:fb,stackRestore:gb,establishStackSpace:hb,setThrew:ib,setTempRet0:lb,getTempRet0:mb,dynCall_iiii:Oe,dynCall_viiiii:Pe,dynCall_vi:Qe,dynCall_vii:Re,dynCall_ii:Se,dynCall_v:Te,dynCall_viiiiii:Ue,dynCall_iii:Ve,dynCall_viiii:We}})(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var ___cxa_can_catch=Module["___cxa_can_catch"]=asm["___cxa_can_catch"];var _free=Module["_free"]=asm["_free"];var _solve_string=Module["_solve_string"]=asm["_solve_string"];var ___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=asm["___cxa_is_pointer_type"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _memset=Module["_memset"]=asm["_memset"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var __GLOBAL__sub_I_SimpSolver_cc=Module["__GLOBAL__sub_I_SimpSolver_cc"]=asm["__GLOBAL__sub_I_SimpSolver_cc"];var __GLOBAL__sub_I_Solver_cc=Module["__GLOBAL__sub_I_Solver_cc"]=asm["__GLOBAL__sub_I_Solver_cc"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _fflush=Module["_fflush"]=asm["_fflush"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["exit"](status)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()
return Module;
};

}).call(this,require('_process'),"/node_modules/sentient-lang/vendor")
},{"_process":5,"fs":2,"path":4}],61:[function(require,module,exports){
module.exports="c Sentient Machine Code, Version 1.0\nc {\nc   \"level3Variables\": {\nc     \"$$$_L3_TMP155_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER84_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"$$$_L3_TMP156_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER85_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"$$$_L3_TMP157_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER86_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten0\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER1_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten1\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER2_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten2\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER3_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten3\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER4_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten4\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER5_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten5\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER6_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten6\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER7_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten7\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER8_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"ten8\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER9_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"thirteen_check_digit\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER11_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"thirteenDigit\": {\nc \"type\": \"array\",\nc \"symbols\": [\nc   \"$$$_L3_TMP155_$$$\",\nc   \"$$$_L3_TMP156_$$$\",\nc   \"$$$_L3_TMP157_$$$\",\nc   \"ten0\",\nc   \"ten1\",\nc   \"ten2\",\nc   \"ten3\",\nc   \"ten4\",\nc   \"ten5\",\nc   \"ten6\",\nc   \"ten7\",\nc   \"ten8\",\nc   \"thirteen_check_digit\"\nc ]\nc     },\nc     \"ten_check_digit\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L3_INTEGER10_$$$\"\nc ],\nc \"supporting\": true\nc     },\nc     \"tenDigit\": {\nc \"type\": \"array\",\nc \"symbols\": [\nc   \"ten0\",\nc   \"ten1\",\nc   \"ten2\",\nc   \"ten3\",\nc   \"ten4\",\nc   \"ten5\",\nc   \"ten6\",\nc   \"ten7\",\nc   \"ten8\",\nc   \"ten_check_digit\"\nc ]\nc     }\nc   },\nc   \"level2Variables\": {\nc     \"$$$_L3_INTEGER84_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER462_BIT0_$$$\",\nc   \"$$$_L2_INTEGER462_BIT1_$$$\",\nc   \"$$$_L2_INTEGER462_BIT2_$$$\",\nc   \"$$$_L2_INTEGER462_BIT3_$$$\",\nc   \"$$$_L2_INTEGER462_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER85_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER463_BIT0_$$$\",\nc   \"$$$_L2_INTEGER463_BIT1_$$$\",\nc   \"$$$_L2_INTEGER463_BIT2_$$$\",\nc   \"$$$_L2_INTEGER463_BIT3_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER86_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER464_BIT0_$$$\",\nc   \"$$$_L2_INTEGER464_BIT1_$$$\",\nc   \"$$$_L2_INTEGER464_BIT2_$$$\",\nc   \"$$$_L2_INTEGER464_BIT3_$$$\",\nc   \"$$$_L2_INTEGER464_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER1_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER1_BIT0_$$$\",\nc   \"$$$_L2_INTEGER1_BIT1_$$$\",\nc   \"$$$_L2_INTEGER1_BIT2_$$$\",\nc   \"$$$_L2_INTEGER1_BIT3_$$$\",\nc   \"$$$_L2_INTEGER1_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER2_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER2_BIT0_$$$\",\nc   \"$$$_L2_INTEGER2_BIT1_$$$\",\nc   \"$$$_L2_INTEGER2_BIT2_$$$\",\nc   \"$$$_L2_INTEGER2_BIT3_$$$\",\nc   \"$$$_L2_INTEGER2_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER3_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER3_BIT0_$$$\",\nc   \"$$$_L2_INTEGER3_BIT1_$$$\",\nc   \"$$$_L2_INTEGER3_BIT2_$$$\",\nc   \"$$$_L2_INTEGER3_BIT3_$$$\",\nc   \"$$$_L2_INTEGER3_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER4_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER4_BIT0_$$$\",\nc   \"$$$_L2_INTEGER4_BIT1_$$$\",\nc   \"$$$_L2_INTEGER4_BIT2_$$$\",\nc   \"$$$_L2_INTEGER4_BIT3_$$$\",\nc   \"$$$_L2_INTEGER4_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER5_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER5_BIT0_$$$\",\nc   \"$$$_L2_INTEGER5_BIT1_$$$\",\nc   \"$$$_L2_INTEGER5_BIT2_$$$\",\nc   \"$$$_L2_INTEGER5_BIT3_$$$\",\nc   \"$$$_L2_INTEGER5_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER6_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER6_BIT0_$$$\",\nc   \"$$$_L2_INTEGER6_BIT1_$$$\",\nc   \"$$$_L2_INTEGER6_BIT2_$$$\",\nc   \"$$$_L2_INTEGER6_BIT3_$$$\",\nc   \"$$$_L2_INTEGER6_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER7_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER7_BIT0_$$$\",\nc   \"$$$_L2_INTEGER7_BIT1_$$$\",\nc   \"$$$_L2_INTEGER7_BIT2_$$$\",\nc   \"$$$_L2_INTEGER7_BIT3_$$$\",\nc   \"$$$_L2_INTEGER7_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER8_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER8_BIT0_$$$\",\nc   \"$$$_L2_INTEGER8_BIT1_$$$\",\nc   \"$$$_L2_INTEGER8_BIT2_$$$\",\nc   \"$$$_L2_INTEGER8_BIT3_$$$\",\nc   \"$$$_L2_INTEGER8_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER9_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER9_BIT0_$$$\",\nc   \"$$$_L2_INTEGER9_BIT1_$$$\",\nc   \"$$$_L2_INTEGER9_BIT2_$$$\",\nc   \"$$$_L2_INTEGER9_BIT3_$$$\",\nc   \"$$$_L2_INTEGER9_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER11_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER11_BIT0_$$$\",\nc   \"$$$_L2_INTEGER11_BIT1_$$$\",\nc   \"$$$_L2_INTEGER11_BIT2_$$$\",\nc   \"$$$_L2_INTEGER11_BIT3_$$$\",\nc   \"$$$_L2_INTEGER11_BIT4_$$$\"\nc ]\nc     },\nc     \"$$$_L3_INTEGER10_$$$\": {\nc \"type\": \"integer\",\nc \"symbols\": [\nc   \"$$$_L2_INTEGER10_BIT0_$$$\",\nc   \"$$$_L2_INTEGER10_BIT1_$$$\",\nc   \"$$$_L2_INTEGER10_BIT2_$$$\",\nc   \"$$$_L2_INTEGER10_BIT3_$$$\",\nc   \"$$$_L2_INTEGER10_BIT4_$$$\"\nc ]\nc     }\nc   },\nc   \"level1Variables\": {\nc     \"$$$_L2_INTEGER462_BIT0_$$$\": 56,\nc     \"$$$_L2_INTEGER462_BIT1_$$$\": 57,\nc     \"$$$_L2_INTEGER462_BIT2_$$$\": 56,\nc     \"$$$_L2_INTEGER462_BIT3_$$$\": 56,\nc     \"$$$_L2_INTEGER462_BIT4_$$$\": 57,\nc     \"$$$_L2_INTEGER463_BIT0_$$$\": 56,\nc     \"$$$_L2_INTEGER463_BIT1_$$$\": 57,\nc     \"$$$_L2_INTEGER463_BIT2_$$$\": 57,\nc     \"$$$_L2_INTEGER463_BIT3_$$$\": 57,\nc     \"$$$_L2_INTEGER464_BIT0_$$$\": 56,\nc     \"$$$_L2_INTEGER464_BIT1_$$$\": 57,\nc     \"$$$_L2_INTEGER464_BIT2_$$$\": 56,\nc     \"$$$_L2_INTEGER464_BIT3_$$$\": 56,\nc     \"$$$_L2_INTEGER464_BIT4_$$$\": 56,\nc     \"$$$_L2_INTEGER1_BIT0_$$$\": 1,\nc     \"$$$_L2_INTEGER1_BIT1_$$$\": 2,\nc     \"$$$_L2_INTEGER1_BIT2_$$$\": 3,\nc     \"$$$_L2_INTEGER1_BIT3_$$$\": 4,\nc     \"$$$_L2_INTEGER1_BIT4_$$$\": 5,\nc     \"$$$_L2_INTEGER2_BIT0_$$$\": 6,\nc     \"$$$_L2_INTEGER2_BIT1_$$$\": 7,\nc     \"$$$_L2_INTEGER2_BIT2_$$$\": 8,\nc     \"$$$_L2_INTEGER2_BIT3_$$$\": 9,\nc     \"$$$_L2_INTEGER2_BIT4_$$$\": 10,\nc     \"$$$_L2_INTEGER3_BIT0_$$$\": 11,\nc     \"$$$_L2_INTEGER3_BIT1_$$$\": 12,\nc     \"$$$_L2_INTEGER3_BIT2_$$$\": 13,\nc     \"$$$_L2_INTEGER3_BIT3_$$$\": 14,\nc     \"$$$_L2_INTEGER3_BIT4_$$$\": 15,\nc     \"$$$_L2_INTEGER4_BIT0_$$$\": 16,\nc     \"$$$_L2_INTEGER4_BIT1_$$$\": 17,\nc     \"$$$_L2_INTEGER4_BIT2_$$$\": 18,\nc     \"$$$_L2_INTEGER4_BIT3_$$$\": 19,\nc     \"$$$_L2_INTEGER4_BIT4_$$$\": 20,\nc     \"$$$_L2_INTEGER5_BIT0_$$$\": 21,\nc     \"$$$_L2_INTEGER5_BIT1_$$$\": 22,\nc     \"$$$_L2_INTEGER5_BIT2_$$$\": 23,\nc     \"$$$_L2_INTEGER5_BIT3_$$$\": 24,\nc     \"$$$_L2_INTEGER5_BIT4_$$$\": 25,\nc     \"$$$_L2_INTEGER6_BIT0_$$$\": 26,\nc     \"$$$_L2_INTEGER6_BIT1_$$$\": 27,\nc     \"$$$_L2_INTEGER6_BIT2_$$$\": 28,\nc     \"$$$_L2_INTEGER6_BIT3_$$$\": 29,\nc     \"$$$_L2_INTEGER6_BIT4_$$$\": 30,\nc     \"$$$_L2_INTEGER7_BIT0_$$$\": 31,\nc     \"$$$_L2_INTEGER7_BIT1_$$$\": 32,\nc     \"$$$_L2_INTEGER7_BIT2_$$$\": 33,\nc     \"$$$_L2_INTEGER7_BIT3_$$$\": 34,\nc     \"$$$_L2_INTEGER7_BIT4_$$$\": 35,\nc     \"$$$_L2_INTEGER8_BIT0_$$$\": 36,\nc     \"$$$_L2_INTEGER8_BIT1_$$$\": 37,\nc     \"$$$_L2_INTEGER8_BIT2_$$$\": 38,\nc     \"$$$_L2_INTEGER8_BIT3_$$$\": 39,\nc     \"$$$_L2_INTEGER8_BIT4_$$$\": 40,\nc     \"$$$_L2_INTEGER9_BIT0_$$$\": 41,\nc     \"$$$_L2_INTEGER9_BIT1_$$$\": 42,\nc     \"$$$_L2_INTEGER9_BIT2_$$$\": 43,\nc     \"$$$_L2_INTEGER9_BIT3_$$$\": 44,\nc     \"$$$_L2_INTEGER9_BIT4_$$$\": 45,\nc     \"$$$_L2_INTEGER11_BIT0_$$$\": 51,\nc     \"$$$_L2_INTEGER11_BIT1_$$$\": 52,\nc     \"$$$_L2_INTEGER11_BIT2_$$$\": 53,\nc     \"$$$_L2_INTEGER11_BIT3_$$$\": 54,\nc     \"$$$_L2_INTEGER11_BIT4_$$$\": 55,\nc     \"$$$_L2_INTEGER10_BIT0_$$$\": 46,\nc     \"$$$_L2_INTEGER10_BIT1_$$$\": 47,\nc     \"$$$_L2_INTEGER10_BIT2_$$$\": 48,\nc     \"$$$_L2_INTEGER10_BIT3_$$$\": 49,\nc     \"$$$_L2_INTEGER10_BIT4_$$$\": 50\nc   }\nc }\np cnf 728 2503\n-56 0\n57 0\n-1 0\n-6 0\n-11 0\n-16 0\n-21 0\n-26 0\n-31 0\n-36 0\n-41 0\n-46 0\n-51 0\n-4 -58 0\n-5 -58 0\n5 -59 0\n-8 -60 0\n-13 -62 0\n-18 -64 0\n-24 -66 0\n-25 -66 0\n-23 -67 0\n66 -67 0\n-28 -68 0\n-33 -70 0\n-39 -71 0\n-40 -71 0\n40 -72 0\n-44 -73 0\n-45 -73 0\n45 -74 0\n-49 -75 0\n-50 -75 0\n-48 -76 0\n75 -76 0\n-53 -77 0\n4 -10 79 0\n4 10 -79 0\n-4 -10 -79 0\n-4 10 79 0\n-4 -10 80 0\n4 -80 0\n10 -80 0\n3 -9 81 0\n3 9 -81 0\n-3 -9 -81 0\n-3 9 81 0\n-80 81 82 0\n80 81 -82 0\n-80 -81 -82 0\n80 -81 82 0\n2 -8 84 0\n2 8 -84 0\n-2 -8 -84 0\n-2 8 84 0\n-83 84 85 0\n83 84 -85 0\n-83 -84 -85 0\n83 -84 85 0\n7 -86 87 0\n7 86 -87 0\n-7 -86 -87 0\n-7 86 87 0\n-7 -86 88 0\n7 -88 0\n86 -88 0\n14 -15 89 0\n14 15 -89 0\n-14 -15 -89 0\n-14 15 89 0\n-14 -15 90 0\n14 -90 0\n15 -90 0\n13 -14 91 0\n13 14 -91 0\n-13 -14 -91 0\n-13 14 91 0\n-90 91 92 0\n90 91 -92 0\n-90 -91 -92 0\n90 -91 92 0\n12 -13 94 0\n12 13 -94 0\n-12 13 94 0\n-93 94 95 0\n93 94 -95 0\n-93 -94 -95 0\n93 -94 95 0\n12 -96 97 0\n12 96 -97 0\n-12 -96 -97 0\n-12 96 97 0\n-12 -96 98 0\n12 -98 0\n96 -98 0\n5 -15 99 0\n5 15 -99 0\n-5 -15 -99 0\n-5 15 99 0\n-5 -15 100 0\n5 -100 0\n15 -100 0\n79 -89 101 0\n79 89 -101 0\n-79 -89 -101 0\n-79 89 101 0\n-100 101 102 0\n100 101 -102 0\n-100 -101 -102 0\n100 -101 102 0\n82 -92 104 0\n82 92 -104 0\n-82 -92 -104 0\n-82 92 104 0\n-103 104 105 0\n103 104 -105 0\n-103 -104 -105 0\n103 -104 105 0\n85 -95 107 0\n85 95 -107 0\n-85 -95 -107 0\n-85 95 107 0\n-106 107 108 0\n106 107 -108 0\n-106 -107 -108 0\n106 -107 108 0\n87 -97 110 0\n87 97 -110 0\n-87 -97 -110 0\n-87 97 110 0\n-109 110 111 0\n109 110 -111 0\n-109 -110 -111 0\n109 -110 111 0\n88 -98 113 0\n88 98 -113 0\n-88 -98 -113 0\n-88 98 113 0\n-112 113 114 0\n112 113 -114 0\n-112 -113 -114 0\n112 -113 114 0\n-20 105 116 0\n20 105 -116 0\n-20 -105 -116 0\n20 -105 116 0\n-20 -105 117 0\n105 -117 0\n20 -117 0\n-19 108 118 0\n19 108 -118 0\n-19 -108 -118 0\n19 -108 118 0\n-117 118 119 0\n117 118 -119 0\n-117 -118 -119 0\n117 -118 119 0\n-18 111 121 0\n18 111 -121 0\n-18 -111 -121 0\n18 -111 121 0\n-120 121 122 0\n120 121 -122 0\n-120 -121 -122 0\n120 -121 122 0\n-17 114 124 0\n17 114 -124 0\n-17 -114 -124 0\n17 -114 124 0\n-123 124 125 0\n123 124 -125 0\n-123 -124 -125 0\n123 -124 125 0\n115 -126 127 0\n115 126 -127 0\n-115 -126 -127 0\n-115 126 127 0\n-115 -126 128 0\n115 -128 0\n126 -128 0\n23 -25 129 0\n23 25 -129 0\n-23 -25 -129 0\n-23 25 129 0\n-23 -25 130 0\n23 -130 0\n25 -130 0\n22 -24 131 0\n22 24 -131 0\n-22 24 131 0\n-130 131 132 0\n130 131 -132 0\n-130 -131 -132 0\n130 -131 132 0\n23 133 -134 0\n-23 -133 -134 0\n-23 133 134 0\n-23 -133 135 0\n23 -135 0\n133 -135 0\n22 -135 136 0\n22 135 -136 0\n-22 135 136 0\n22 -137 0\n135 -137 0\n-25 99 138 0\n25 99 -138 0\n-25 -99 -138 0\n25 -99 138 0\n-25 -99 139 0\n99 -139 0\n25 -139 0\n-24 102 140 0\n24 102 -140 0\n-24 -102 -140 0\n24 -102 140 0\n-139 140 141 0\n139 140 -141 0\n-139 -140 -141 0\n139 -140 141 0\n116 -129 143 0\n116 129 -143 0\n-116 -129 -143 0\n-116 129 143 0\n-142 143 144 0\n142 143 -144 0\n-142 -143 -144 0\n142 -143 144 0\n119 -132 146 0\n119 132 -146 0\n-119 -132 -146 0\n-119 132 146 0\n-145 146 147 0\n145 146 -147 0\n-145 -146 -147 0\n145 -146 147 0\n122 -134 149 0\n122 134 -149 0\n-122 -134 -149 0\n-122 134 149 0\n-148 149 150 0\n148 149 -150 0\n-148 -149 -150 0\n148 -149 150 0\n125 -136 152 0\n125 136 -152 0\n-125 -136 -152 0\n-125 136 152 0\n-151 152 153 0\n151 152 -153 0\n-151 -152 -153 0\n151 -152 153 0\n127 137 -155 0\n-127 137 155 0\n-154 155 156 0\n154 155 -156 0\n-154 -155 -156 0\n154 -155 156 0\n128 -157 158 0\n128 157 -158 0\n-128 157 158 0\n128 -159 0\n157 -159 0\n29 -30 160 0\n29 30 -160 0\n-29 -30 -160 0\n-29 30 160 0\n-29 -30 161 0\n29 -161 0\n30 -161 0\n28 -29 162 0\n28 29 -162 0\n-28 -29 -162 0\n-28 29 162 0\n-161 162 163 0\n161 162 -163 0\n-161 -162 -163 0\n161 -162 163 0\n27 -28 165 0\n27 28 -165 0\n-27 28 165 0\n-164 165 166 0\n164 165 -166 0\n-164 -165 -166 0\n164 -165 166 0\n27 -167 168 0\n27 167 -168 0\n-27 -167 -168 0\n-27 167 168 0\n-27 -167 169 0\n27 -169 0\n167 -169 0\n-30 141 170 0\n30 141 -170 0\n-30 -141 -170 0\n30 -141 170 0\n-30 -141 171 0\n141 -171 0\n30 -171 0\n144 -160 172 0\n144 160 -172 0\n-144 -160 -172 0\n-144 160 172 0\n-171 172 173 0\n171 172 -173 0\n-171 -172 -173 0\n171 -172 173 0\n147 -163 175 0\n147 163 -175 0\n-147 -163 -175 0\n-147 163 175 0\n-174 175 176 0\n174 175 -176 0\n-174 -175 -176 0\n174 -175 176 0\n150 -166 178 0\n150 166 -178 0\n-150 -166 -178 0\n-150 166 178 0\n-177 178 179 0\n177 178 -179 0\n-177 -178 -179 0\n177 -178 179 0\n153 -168 181 0\n153 168 -181 0\n-153 -168 -181 0\n-153 168 181 0\n-180 181 182 0\n180 181 -182 0\n-180 -181 -182 0\n180 -181 182 0\n156 -169 184 0\n156 169 -184 0\n-156 -169 -184 0\n-156 169 184 0\n-183 184 185 0\n183 184 -185 0\n-183 -184 -185 0\n183 -184 185 0\n158 -186 187 0\n158 186 -187 0\n-158 -186 -187 0\n-158 186 187 0\n-158 -186 188 0\n158 -188 0\n186 -188 0\n159 -188 189 0\n159 188 -189 0\n159 -190 0\n188 -190 0\n34 -35 191 0\n34 35 -191 0\n-34 -35 -191 0\n-34 35 191 0\n-34 -35 192 0\n34 -192 0\n35 -192 0\n33 -34 193 0\n33 34 -193 0\n-33 -34 -193 0\n-33 34 193 0\n-192 193 194 0\n192 193 -194 0\n-192 -193 -194 0\n192 -193 194 0\n32 -33 196 0\n32 33 -196 0\n-32 33 196 0\n-195 196 197 0\n195 196 -197 0\n-195 -196 -197 0\n195 -196 197 0\n32 -198 199 0\n32 198 -199 0\n-32 198 199 0\n-35 194 200 0\n35 194 -200 0\n-35 -194 -200 0\n35 -194 200 0\n-35 -194 201 0\n194 -201 0\n35 -201 0\n-34 197 202 0\n34 197 -202 0\n-34 -197 -202 0\n34 -197 202 0\n-201 202 203 0\n201 202 -203 0\n-201 -202 -203 0\n201 -202 203 0\n-33 199 205 0\n33 199 -205 0\n-33 -199 -205 0\n33 -199 205 0\n-204 205 206 0\n204 205 -206 0\n-204 -205 -206 0\n204 -205 206 0\n32 -208 0\n-207 208 209 0\n207 208 -209 0\n-207 -208 -209 0\n207 -208 209 0\n-210 211 0\n-35 138 212 0\n35 138 -212 0\n-35 -138 -212 0\n35 -138 212 0\n-35 -138 213 0\n138 -213 0\n35 -213 0\n170 -191 214 0\n170 191 -214 0\n-170 -191 -214 0\n-170 191 214 0\n-213 214 215 0\n213 214 -215 0\n-213 -214 -215 0\n213 -214 215 0\n173 -200 217 0\n173 200 -217 0\n-173 -200 -217 0\n-173 200 217 0\n-216 217 218 0\n216 217 -218 0\n-216 -217 -218 0\n216 -217 218 0\n176 -203 220 0\n176 203 -220 0\n-176 -203 -220 0\n-176 203 220 0\n-219 220 221 0\n219 220 -221 0\n-219 -220 -221 0\n219 -220 221 0\n179 -206 223 0\n179 206 -223 0\n-179 -206 -223 0\n-179 206 223 0\n-222 223 224 0\n222 223 -224 0\n-222 -223 -224 0\n222 -223 224 0\n182 -209 226 0\n182 209 -226 0\n-182 -209 -226 0\n-182 209 226 0\n-225 226 227 0\n225 226 -227 0\n-225 -226 -227 0\n225 -226 227 0\n185 -211 229 0\n185 211 -229 0\n-185 -211 -229 0\n-185 211 229 0\n-228 229 230 0\n228 229 -230 0\n-228 -229 -230 0\n228 -229 230 0\n187 -231 232 0\n187 231 -232 0\n-187 -231 -232 0\n-187 231 232 0\n-187 -231 233 0\n187 -233 0\n231 -233 0\n189 -233 234 0\n189 233 -234 0\n-189 -233 -234 0\n-189 233 234 0\n189 -235 0\n233 -235 0\n190 235 -236 0\n190 -237 0\n235 -237 0\n-40 221 238 0\n40 221 -238 0\n-40 -221 -238 0\n40 -221 238 0\n-40 -221 239 0\n221 -239 0\n40 -239 0\n-39 224 240 0\n39 224 -240 0\n-39 -224 -240 0\n39 -224 240 0\n-239 240 241 0\n239 240 -241 0\n-239 -240 -241 0\n239 -240 241 0\n-38 227 243 0\n38 227 -243 0\n-38 -227 -243 0\n38 -227 243 0\n-242 243 244 0\n242 243 -244 0\n-242 -243 -244 0\n242 -243 244 0\n-37 230 246 0\n37 230 -246 0\n-37 -230 -246 0\n37 -230 246 0\n-245 246 247 0\n245 246 -247 0\n-245 -246 -247 0\n245 -246 247 0\n232 -248 249 0\n232 248 -249 0\n-232 -248 -249 0\n-232 248 249 0\n-232 -248 250 0\n232 -250 0\n248 -250 0\n234 -250 251 0\n234 250 -251 0\n-234 -250 -251 0\n-234 250 251 0\n-234 -250 252 0\n234 -252 0\n250 -252 0\n236 -252 253 0\n236 252 -253 0\n-236 -252 -253 0\n236 -254 0\n252 -254 0\n237 254 -255 0\n237 -256 0\n254 -256 0\n42 -45 257 0\n42 45 -257 0\n-42 -45 -257 0\n-42 45 257 0\n-42 -45 258 0\n42 -258 0\n45 -258 0\n44 -258 259 0\n44 258 -259 0\n-44 258 259 0\n44 -260 0\n258 -260 0\n43 260 -261 0\n-43 260 261 0\n42 -262 0\n-45 212 264 0\n45 212 -264 0\n-45 -212 -264 0\n45 -212 264 0\n-45 -212 265 0\n212 -265 0\n45 -265 0\n-44 215 266 0\n44 215 -266 0\n-44 -215 -266 0\n44 -215 266 0\n-265 266 267 0\n265 266 -267 0\n-265 -266 -267 0\n265 -266 267 0\n-43 218 269 0\n43 218 -269 0\n-43 -218 -269 0\n43 -218 269 0\n-268 269 270 0\n268 269 -270 0\n-268 -269 -270 0\n268 -269 270 0\n238 -257 272 0\n238 257 -272 0\n-238 -257 -272 0\n-238 257 272 0\n-271 272 273 0\n271 272 -273 0\n-271 -272 -273 0\n271 -272 273 0\n241 -259 275 0\n241 259 -275 0\n-241 -259 -275 0\n-241 259 275 0\n-274 275 276 0\n274 275 -276 0\n-274 -275 -276 0\n274 -275 276 0\n244 -261 278 0\n244 261 -278 0\n-244 -261 -278 0\n-244 261 278 0\n-277 278 279 0\n277 278 -279 0\n-277 -278 -279 0\n277 -278 279 0\n247 -262 281 0\n247 262 -281 0\n-247 -262 -281 0\n-247 262 281 0\n-280 281 282 0\n280 281 -282 0\n-280 -281 -282 0\n280 -281 282 0\n249 263 -284 0\n-249 263 284 0\n-283 284 285 0\n283 284 -285 0\n-283 -284 -285 0\n283 -284 285 0\n251 -286 287 0\n251 286 -287 0\n-251 -286 -287 0\n-251 286 287 0\n-251 -286 288 0\n251 -288 0\n286 -288 0\n253 -288 289 0\n253 288 -289 0\n-253 -288 -289 0\n-253 288 289 0\n-253 -288 290 0\n253 -290 0\n288 -290 0\n255 -290 291 0\n255 290 -291 0\n-255 -290 -291 0\n255 -292 0\n290 -292 0\n256 292 -293 0\n256 -294 0\n292 -294 0\n48 -50 295 0\n48 50 -295 0\n-48 -50 -295 0\n-48 50 295 0\n-48 -50 296 0\n48 -296 0\n50 -296 0\n47 -49 297 0\n47 49 -297 0\n-47 -49 -297 0\n-47 49 297 0\n-296 297 298 0\n296 297 -298 0\n-296 -297 -298 0\n296 -297 298 0\n48 -299 300 0\n48 299 -300 0\n-48 -299 -300 0\n-48 299 300 0\n-48 -299 301 0\n48 -301 0\n299 -301 0\n47 -301 302 0\n47 301 -302 0\n-47 301 302 0\n47 -303 0\n301 -303 0\n-50 267 304 0\n50 267 -304 0\n-50 -267 -304 0\n50 -267 304 0\n-50 -267 305 0\n267 -305 0\n50 -305 0\n-49 270 306 0\n49 270 -306 0\n-49 -270 -306 0\n49 -270 306 0\n-305 306 307 0\n305 306 -307 0\n-305 -306 -307 0\n305 -306 307 0\n273 -295 309 0\n273 295 -309 0\n-273 -295 -309 0\n-273 295 309 0\n-308 309 310 0\n308 309 -310 0\n-308 -309 -310 0\n308 -309 310 0\n276 -298 312 0\n276 298 -312 0\n-276 -298 -312 0\n-276 298 312 0\n-311 312 313 0\n311 312 -313 0\n-311 -312 -313 0\n311 -312 313 0\n279 -300 315 0\n279 300 -315 0\n-279 -300 -315 0\n-279 300 315 0\n-314 315 316 0\n314 315 -316 0\n-314 -315 -316 0\n314 -315 316 0\n282 -302 318 0\n282 302 -318 0\n-282 -302 -318 0\n-282 302 318 0\n-317 318 319 0\n317 318 -319 0\n-317 -318 -319 0\n317 -318 319 0\n285 303 -321 0\n-285 303 321 0\n-320 321 322 0\n320 321 -322 0\n-320 -321 -322 0\n320 -321 322 0\n287 -323 324 0\n287 323 -324 0\n-287 -323 -324 0\n-287 323 324 0\n-287 -323 325 0\n287 -325 0\n323 -325 0\n289 -325 326 0\n289 325 -326 0\n-289 -325 -326 0\n-289 325 326 0\n-289 -325 327 0\n289 -327 0\n325 -327 0\n291 -327 328 0\n291 327 -328 0\n-291 -327 -328 0\n-291 327 328 0\n-291 -327 329 0\n291 -329 0\n327 -329 0\n293 -329 330 0\n293 329 -330 0\n-293 -329 -330 0\n293 -331 0\n329 -331 0\n294 331 -332 0\n294 -333 0\n331 -333 0\n264 304 -334 0\n264 -304 334 0\n-264 -304 -334 0\n-264 304 334 0\n334 -335 0\n264 -336 0\n334 -337 0\n307 335 -339 0\n-307 335 339 0\n-307 -335 -339 0\n307 -335 339 0\n-335 -339 340 0\n335 -340 0\n339 -340 0\n336 -339 341 0\n336 339 -341 0\n-336 -339 -341 0\n-336 339 341 0\n340 341 -342 0\n-340 -341 -342 0\n340 -341 342 0\n337 -343 344 0\n337 343 -344 0\n-337 -343 -344 0\n-337 343 344 0\n-337 -343 345 0\n337 -345 0\n343 -345 0\n338 -339 346 0\n338 339 -346 0\n-338 -339 -346 0\n-338 339 346 0\n345 346 -347 0\n-345 -346 -347 0\n345 -346 347 0\n310 342 -349 0\n-310 342 349 0\n-310 -342 -349 0\n310 -342 349 0\n-342 -349 350 0\n342 -350 0\n349 -350 0\n344 -349 351 0\n344 349 -351 0\n-344 -349 -351 0\n-344 349 351 0\n-350 351 352 0\n350 351 -352 0\n-350 -351 -352 0\n350 -351 352 0\n347 -353 354 0\n347 353 -354 0\n-347 -353 -354 0\n-347 353 354 0\n-347 -353 355 0\n347 -355 0\n353 -355 0\n348 -349 356 0\n348 349 -356 0\n-348 -349 -356 0\n-348 349 356 0\n-355 356 357 0\n355 356 -357 0\n-355 -356 -357 0\n355 -356 357 0\n313 352 -359 0\n-313 352 359 0\n-313 -352 -359 0\n313 -352 359 0\n-352 -359 360 0\n352 -360 0\n359 -360 0\n354 -359 361 0\n354 359 -361 0\n-354 -359 -361 0\n-354 359 361 0\n-360 361 362 0\n360 361 -362 0\n-360 -361 -362 0\n360 -361 362 0\n357 -363 364 0\n357 363 -364 0\n-357 -363 -364 0\n-357 363 364 0\n-357 -363 365 0\n357 -365 0\n363 -365 0\n358 -359 366 0\n358 359 -366 0\n-358 -359 -366 0\n-358 359 366 0\n-365 366 367 0\n365 366 -367 0\n-365 -366 -367 0\n365 -366 367 0\n316 362 -369 0\n-316 362 369 0\n-316 -362 -369 0\n316 -362 369 0\n-362 -369 370 0\n362 -370 0\n369 -370 0\n364 -369 371 0\n364 369 -371 0\n-364 -369 -371 0\n-364 369 371 0\n-370 371 372 0\n370 371 -372 0\n-370 -371 -372 0\n370 -371 372 0\n367 -373 374 0\n367 373 -374 0\n-367 -373 -374 0\n-367 373 374 0\n-367 -373 375 0\n367 -375 0\n373 -375 0\n368 -369 376 0\n368 369 -376 0\n-368 -369 -376 0\n-368 369 376 0\n-375 376 377 0\n375 376 -377 0\n-375 -376 -377 0\n375 -376 377 0\n319 372 -379 0\n-319 372 379 0\n-319 -372 -379 0\n319 -372 379 0\n-372 -379 380 0\n372 -380 0\n379 -380 0\n374 -379 381 0\n374 379 -381 0\n-374 -379 -381 0\n-374 379 381 0\n-380 381 382 0\n380 381 -382 0\n-380 -381 -382 0\n380 -381 382 0\n377 -383 384 0\n377 383 -384 0\n-377 -383 -384 0\n-377 383 384 0\n-377 -383 385 0\n377 -385 0\n383 -385 0\n378 -379 386 0\n378 379 -386 0\n-378 -379 -386 0\n-378 379 386 0\n-385 386 387 0\n385 386 -387 0\n-385 -386 -387 0\n385 -386 387 0\n322 382 -389 0\n-322 382 389 0\n-322 -382 -389 0\n322 -382 389 0\n-382 -389 390 0\n382 -390 0\n389 -390 0\n384 -389 391 0\n384 389 -391 0\n-384 -389 -391 0\n-384 389 391 0\n-390 391 392 0\n390 391 -392 0\n-390 -391 -392 0\n390 -391 392 0\n387 -393 394 0\n387 393 -394 0\n-387 -393 -394 0\n-387 393 394 0\n-387 -393 395 0\n387 -395 0\n393 -395 0\n388 -389 396 0\n388 389 -396 0\n-388 -389 -396 0\n-388 389 396 0\n-395 396 397 0\n395 396 -397 0\n-395 -396 -397 0\n395 -396 397 0\n324 392 -399 0\n-324 392 399 0\n-324 -392 -399 0\n324 -392 399 0\n-392 -399 400 0\n392 -400 0\n399 -400 0\n394 -399 401 0\n394 399 -401 0\n-394 -399 -401 0\n-394 399 401 0\n-400 401 402 0\n400 401 -402 0\n-400 -401 -402 0\n400 -401 402 0\n397 -403 404 0\n397 403 -404 0\n-397 -403 -404 0\n-397 403 404 0\n-397 -403 405 0\n397 -405 0\n403 -405 0\n398 -399 406 0\n398 399 -406 0\n-398 -399 -406 0\n-398 399 406 0\n-405 406 407 0\n405 406 -407 0\n-405 -406 -407 0\n405 -406 407 0\n326 402 -409 0\n-326 402 409 0\n-326 -402 -409 0\n326 -402 409 0\n-402 -409 410 0\n402 -410 0\n409 -410 0\n404 -409 411 0\n404 409 -411 0\n-404 -409 -411 0\n-404 409 411 0\n-410 411 412 0\n410 411 -412 0\n-410 -411 -412 0\n410 -411 412 0\n407 -413 414 0\n407 413 -414 0\n-407 -413 -414 0\n-407 413 414 0\n-407 -413 415 0\n407 -415 0\n413 -415 0\n408 -409 416 0\n408 409 -416 0\n-408 -409 -416 0\n-408 409 416 0\n-415 416 417 0\n415 416 -417 0\n-415 -416 -417 0\n415 -416 417 0\n328 412 -419 0\n-328 412 419 0\n-328 -412 -419 0\n328 -412 419 0\n-412 -419 420 0\n412 -420 0\n419 -420 0\n414 -419 421 0\n414 419 -421 0\n-414 -419 -421 0\n-414 419 421 0\n-420 421 422 0\n420 421 -422 0\n-420 -421 -422 0\n420 -421 422 0\n417 -423 424 0\n417 423 -424 0\n-417 -423 -424 0\n-417 423 424 0\n-417 -423 425 0\n417 -425 0\n423 -425 0\n418 -419 426 0\n418 419 -426 0\n-418 -419 -426 0\n-418 419 426 0\n-425 426 427 0\n425 426 -427 0\n-425 -426 -427 0\n425 -426 427 0\n330 422 -429 0\n-330 422 429 0\n-330 -422 -429 0\n330 -422 429 0\n-422 -429 430 0\n422 -430 0\n429 -430 0\n424 -429 431 0\n424 429 -431 0\n-424 -429 -431 0\n-424 429 431 0\n-430 431 432 0\n430 431 -432 0\n-430 -431 -432 0\n430 -431 432 0\n427 -433 434 0\n427 433 -434 0\n-427 -433 -434 0\n-427 433 434 0\n-427 -433 435 0\n427 -435 0\n433 -435 0\n428 -429 436 0\n428 429 -436 0\n-428 -429 -436 0\n-428 429 436 0\n-435 436 437 0\n435 436 -437 0\n-435 -436 -437 0\n435 -436 437 0\n332 432 -439 0\n332 -432 439 0\n-432 -439 440 0\n432 -440 0\n439 -440 0\n434 -439 441 0\n434 439 -441 0\n-434 -439 -441 0\n-434 439 441 0\n-440 441 442 0\n440 441 -442 0\n-440 -441 -442 0\n440 -441 442 0\n437 -443 444 0\n437 443 -444 0\n-437 -443 -444 0\n-437 443 444 0\n-437 -443 445 0\n437 -445 0\n443 -445 0\n438 -439 446 0\n438 439 -446 0\n-438 -439 -446 0\n-438 439 446 0\n-445 446 447 0\n445 446 -447 0\n-445 -446 -447 0\n445 -446 447 0\n333 442 -449 0\n333 -442 449 0\n-442 -449 450 0\n442 -450 0\n449 -450 0\n444 -449 451 0\n444 449 -451 0\n-444 -449 -451 0\n-444 449 451 0\n-450 451 452 0\n450 451 -452 0\n-450 -451 -452 0\n450 -451 452 0\n447 -453 454 0\n447 453 -454 0\n-447 -453 -454 0\n-447 453 454 0\n-447 -453 455 0\n447 -455 0\n453 -455 0\n448 -449 456 0\n448 449 -456 0\n-448 -449 -456 0\n-448 449 456 0\n-455 456 457 0\n455 456 -457 0\n455 -456 457 0\n-452 454 459 0\n452 -454 459 0\n-452 -459 -460 0\n452 -459 460 0\n-457 -461 -462 0\n-457 461 462 0\n-457 -461 463 0\n457 -463 0\n461 -463 0\n-452 458 464 0\n452 -458 464 0\n463 -464 465 0\n-460 462 467 0\n460 -462 467 0\n-460 466 469 0\n460 -466 469 0\n9 -10 471 0\n9 10 -471 0\n-9 -10 -471 0\n-9 10 471 0\n-9 -10 472 0\n9 -472 0\n10 -472 0\n8 -472 473 0\n8 472 -473 0\n-8 -472 -473 0\n-8 472 473 0\n-8 -472 474 0\n8 -474 0\n472 -474 0\n7 -474 475 0\n7 474 -475 0\n-7 474 475 0\n7 -476 0\n474 -476 0\n-10 -20 477 0\n-10 20 -477 0\n10 -20 -477 0\n10 20 477 0\n10 -20 478 0\n-10 -478 0\n20 -478 0\n-19 471 479 0\n19 471 -479 0\n-19 -471 -479 0\n19 -471 479 0\n-478 479 480 0\n478 479 -480 0\n-478 -479 -480 0\n478 -479 480 0\n-18 473 482 0\n18 473 -482 0\n-18 -473 -482 0\n18 -473 482 0\n-481 482 483 0\n481 482 -483 0\n-481 -482 -483 0\n481 -482 483 0\n-17 475 485 0\n17 475 -485 0\n-17 -475 -485 0\n17 -475 485 0\n-484 485 486 0\n484 485 -486 0\n-484 -485 -486 0\n484 -485 486 0\n476 -487 -488 0\n476 487 488 0\n-476 489 0\n-30 477 490 0\n30 477 -490 0\n-30 -477 -490 0\n30 -477 490 0\n-30 -477 491 0\n477 -491 0\n30 -491 0\n-29 480 492 0\n29 480 -492 0\n-29 -480 -492 0\n29 -480 492 0\n-491 492 493 0\n491 492 -493 0\n-491 -492 -493 0\n491 -492 493 0\n-28 483 495 0\n28 483 -495 0\n-28 -483 -495 0\n28 -483 495 0\n-494 495 496 0\n494 495 -496 0\n-494 -495 -496 0\n494 -495 496 0\n-27 486 498 0\n27 486 -498 0\n-27 -486 -498 0\n27 -486 498 0\n-497 498 499 0\n497 498 -499 0\n-497 -498 -499 0\n497 -498 499 0\n488 -500 501 0\n488 500 -501 0\n-488 -500 -501 0\n-488 500 501 0\n-488 -500 502 0\n488 -502 0\n500 -502 0\n489 -502 503 0\n489 502 -503 0\n-489 -502 -503 0\n-489 502 503 0\n-40 490 505 0\n40 490 -505 0\n-40 -490 -505 0\n40 -490 505 0\n-40 -490 506 0\n490 -506 0\n40 -506 0\n-39 493 507 0\n39 493 -507 0\n-39 -493 -507 0\n39 -493 507 0\n-506 507 508 0\n506 507 -508 0\n-506 -507 -508 0\n506 -507 508 0\n-38 496 510 0\n38 496 -510 0\n-38 -496 -510 0\n38 -496 510 0\n-509 510 511 0\n509 510 -511 0\n-509 -510 -511 0\n509 -510 511 0\n-37 499 513 0\n37 499 -513 0\n-37 -499 -513 0\n37 -499 513 0\n-512 513 514 0\n512 513 -514 0\n-512 -513 -514 0\n512 -513 514 0\n501 -515 516 0\n501 515 -516 0\n-501 -515 -516 0\n-501 515 516 0\n-501 -515 517 0\n501 -517 0\n515 -517 0\n503 -517 518 0\n503 517 -518 0\n-503 -517 -518 0\n-503 517 518 0\n-503 -517 519 0\n503 -519 0\n517 -519 0\n504 -519 520 0\n504 519 -520 0\n-504 519 520 0\n-55 505 522 0\n55 505 -522 0\n-55 -505 -522 0\n55 -505 522 0\n-55 -505 523 0\n505 -523 0\n55 -523 0\n-54 508 524 0\n54 508 -524 0\n-54 -508 -524 0\n54 -508 524 0\n-523 524 525 0\n523 524 -525 0\n-523 -524 -525 0\n523 -524 525 0\n-53 511 527 0\n53 511 -527 0\n-53 -511 -527 0\n53 -511 527 0\n-526 527 528 0\n526 527 -528 0\n-526 -527 -528 0\n526 -527 528 0\n-52 514 530 0\n52 514 -530 0\n-52 -514 -530 0\n52 -514 530 0\n-529 530 531 0\n529 530 -531 0\n-529 -530 -531 0\n529 -530 531 0\n516 -532 533 0\n516 532 -533 0\n-516 -532 -533 0\n-516 532 533 0\n-516 -532 534 0\n516 -534 0\n532 -534 0\n518 -534 535 0\n518 534 -535 0\n-518 -534 -535 0\n-518 534 535 0\n-518 -534 536 0\n518 -536 0\n534 -536 0\n520 -536 537 0\n520 536 -537 0\n-520 -536 -537 0\n-520 536 537 0\n520 -538 0\n536 -538 0\n521 538 -539 0\n-4 -5 541 0\n-4 5 -541 0\n4 -5 -541 0\n4 5 541 0\n-4 542 0\n-3 -542 543 0\n-3 542 -543 0\n3 -542 -543 0\n3 542 543 0\n-3 544 0\n2 -544 545 0\n2 544 -545 0\n-2 -544 -545 0\n-2 544 545 0\n-2 -544 546 0\n2 -546 0\n544 -546 0\n-5 -15 547 0\n-5 15 -547 0\n5 -15 -547 0\n5 15 547 0\n5 -15 548 0\n-5 -548 0\n15 -548 0\n-14 541 549 0\n14 541 -549 0\n-14 -541 -549 0\n14 -541 549 0\n-548 549 550 0\n548 549 -550 0\n-548 -549 -550 0\n548 -549 550 0\n-13 543 552 0\n13 543 -552 0\n-13 -543 -552 0\n13 -543 552 0\n-551 552 553 0\n551 552 -553 0\n-551 -552 -553 0\n551 -552 553 0\n-12 545 555 0\n12 545 -555 0\n-12 -545 -555 0\n12 -545 555 0\n-554 555 556 0\n554 555 -556 0\n-554 -555 -556 0\n554 -555 556 0\n546 -557 558 0\n546 557 -558 0\n-546 -557 -558 0\n-546 557 558 0\n-546 -557 559 0\n546 -559 0\n557 -559 0\n-25 547 560 0\n25 547 -560 0\n-25 -547 -560 0\n25 -547 560 0\n-25 -547 561 0\n547 -561 0\n25 -561 0\n-24 550 562 0\n24 550 -562 0\n-24 -550 -562 0\n24 -550 562 0\n-561 562 563 0\n561 562 -563 0\n-561 -562 -563 0\n561 -562 563 0\n-23 553 565 0\n23 553 -565 0\n-23 -553 -565 0\n23 -553 565 0\n-564 565 566 0\n564 565 -566 0\n-564 -565 -566 0\n564 -565 566 0\n-22 556 568 0\n22 556 -568 0\n-22 -556 -568 0\n22 -556 568 0\n-567 568 569 0\n567 568 -569 0\n-567 -568 -569 0\n567 -568 569 0\n558 -570 571 0\n558 570 -571 0\n-558 -570 -571 0\n-558 570 571 0\n-558 -570 572 0\n558 -572 0\n570 -572 0\n559 -572 573 0\n559 572 -573 0\n-559 572 573 0\n559 -574 0\n572 -574 0\n-35 560 575 0\n35 560 -575 0\n-35 -560 -575 0\n35 -560 575 0\n-35 -560 576 0\n560 -576 0\n35 -576 0\n-34 563 577 0\n34 563 -577 0\n-34 -563 -577 0\n34 -563 577 0\n-576 577 578 0\n576 577 -578 0\n-576 -577 -578 0\n576 -577 578 0\n-33 566 580 0\n33 566 -580 0\n-33 -566 -580 0\n33 -566 580 0\n-579 580 581 0\n579 580 -581 0\n-579 -580 -581 0\n579 -580 581 0\n-32 569 583 0\n32 569 -583 0\n-32 -569 -583 0\n32 -569 583 0\n-582 583 584 0\n582 583 -584 0\n-582 -583 -584 0\n582 -583 584 0\n571 -585 586 0\n571 585 -586 0\n-571 -585 -586 0\n-571 585 586 0\n-571 -585 587 0\n571 -587 0\n585 -587 0\n573 -587 588 0\n573 587 -588 0\n-573 -587 -588 0\n-573 587 588 0\n-573 -587 589 0\n573 -589 0\n587 -589 0\n574 -589 590 0\n574 589 -590 0\n574 -591 0\n589 -591 0\n-45 522 575 0\n45 -522 575 0\n-45 -522 -575 0\n45 522 -575 0\n-45 -575 592 0\n575 -592 0\n45 -592 0\n-44 578 593 0\n44 578 -593 0\n-44 -578 -593 0\n44 -578 593 0\n-592 593 594 0\n592 593 -594 0\n-592 -593 -594 0\n592 -593 594 0\n-43 581 596 0\n43 581 -596 0\n-43 -581 -596 0\n43 -581 596 0\n-595 596 597 0\n595 596 -597 0\n-595 -596 -597 0\n595 -596 597 0\n-42 584 599 0\n42 584 -599 0\n-42 -584 -599 0\n42 -584 599 0\n-598 599 600 0\n598 599 -600 0\n-598 -599 -600 0\n598 -599 600 0\n586 -601 602 0\n586 601 -602 0\n-586 -601 -602 0\n-586 601 602 0\n-586 -601 603 0\n586 -603 0\n601 -603 0\n588 -603 604 0\n588 603 -604 0\n-588 -603 -604 0\n-588 603 604 0\n-588 -603 605 0\n588 -605 0\n603 -605 0\n590 -605 606 0\n590 605 -606 0\n-590 -605 -606 0\n-590 605 606 0\n590 -607 0\n605 -607 0\n591 607 -608 0\n591 -609 0\n607 -609 0\n-522 594 610 0\n522 594 -610 0\n-522 -594 -610 0\n522 -594 610 0\n-522 -594 611 0\n594 -611 0\n522 -611 0\n-594 597 612 0\n594 597 -612 0\n-594 -597 -612 0\n594 -597 612 0\n-611 612 613 0\n611 612 -613 0\n-611 -612 -613 0\n611 -612 613 0\n-597 600 615 0\n597 600 -615 0\n-597 -600 -615 0\n597 -600 615 0\n-614 615 616 0\n614 615 -616 0\n-614 -615 -616 0\n614 -615 616 0\n-600 602 618 0\n600 602 -618 0\n-600 -602 -618 0\n600 -602 618 0\n-617 618 619 0\n617 618 -619 0\n-617 -618 -619 0\n617 -618 619 0\n-602 604 621 0\n602 604 -621 0\n-602 -604 -621 0\n602 -604 621 0\n-620 621 622 0\n620 621 -622 0\n-620 -621 -622 0\n620 -621 622 0\n-604 606 624 0\n604 606 -624 0\n-604 -606 -624 0\n604 -606 624 0\n-623 624 625 0\n623 624 -625 0\n-623 -624 -625 0\n623 -624 625 0\n-606 608 627 0\n606 608 -627 0\n-606 -608 -627 0\n606 -608 627 0\n-626 627 628 0\n626 627 -628 0\n-626 -627 -628 0\n626 -627 628 0\n-608 609 630 0\n608 609 -630 0\n-629 630 631 0\n629 630 -631 0\n-629 -630 -631 0\n629 -630 631 0\n609 -633 0\n632 -633 0\n525 -610 634 0\n525 610 -634 0\n-525 -610 -634 0\n-525 610 634 0\n-522 634 635 0\n522 634 -635 0\n-522 -634 -635 0\n522 -634 635 0\n528 -613 637 0\n528 613 -637 0\n-528 -613 -637 0\n-528 613 637 0\n-636 637 638 0\n636 637 -638 0\n-636 -637 -638 0\n636 -637 638 0\n531 -616 640 0\n531 616 -640 0\n-531 -616 -640 0\n-531 616 640 0\n-639 640 641 0\n639 640 -641 0\n-639 -640 -641 0\n639 -640 641 0\n533 -619 643 0\n533 619 -643 0\n-533 -619 -643 0\n-533 619 643 0\n-642 643 644 0\n642 643 -644 0\n-642 -643 -644 0\n642 -643 644 0\n535 -622 646 0\n535 622 -646 0\n-535 -622 -646 0\n-535 622 646 0\n-645 646 647 0\n645 646 -647 0\n-645 -646 -647 0\n645 -646 647 0\n537 -625 649 0\n537 625 -649 0\n-537 -625 -649 0\n-537 625 649 0\n-648 649 650 0\n648 649 -650 0\n-648 -649 -650 0\n648 -649 650 0\n539 -628 652 0\n539 628 -652 0\n-539 -628 -652 0\n-651 652 653 0\n651 652 -653 0\n-651 -652 -653 0\n651 -652 653 0\n540 -631 655 0\n540 631 -655 0\n-654 655 656 0\n654 655 -656 0\n-654 -655 -656 0\n654 -655 656 0\n-657 658 659 0\n657 658 -659 0\n-657 -658 -659 0\n633 660 -661 0\n633 -662 0\n660 -662 0\n635 641 -663 0\n635 -641 663 0\n-635 -641 -663 0\n-635 641 663 0\n-635 -663 664 0\n635 -664 0\n663 -664 0\n638 -664 665 0\n638 664 -665 0\n-638 -664 -665 0\n-638 664 665 0\n663 -666 0\n644 665 -668 0\n-644 665 668 0\n-644 -665 -668 0\n644 -665 668 0\n-665 -668 669 0\n665 -669 0\n668 -669 0\n666 -669 670 0\n666 669 -670 0\n-666 -669 -670 0\n-666 669 670 0\n-666 -669 671 0\n666 -671 0\n669 -671 0\n667 -668 672 0\n667 668 -672 0\n-667 -668 -672 0\n-667 668 672 0\n671 672 -673 0\n-671 -672 -673 0\n671 -672 673 0\n647 670 -675 0\n-647 670 675 0\n-647 -670 -675 0\n647 -670 675 0\n-670 -675 676 0\n670 -676 0\n675 -676 0\n673 -676 677 0\n673 676 -677 0\n-673 -676 -677 0\n-673 676 677 0\n-673 -676 678 0\n673 -678 0\n676 -678 0\n674 -675 679 0\n674 675 -679 0\n-674 -675 -679 0\n-674 675 679 0\n-678 679 680 0\n678 679 -680 0\n-678 -679 -680 0\n678 -679 680 0\n650 677 -682 0\n-650 677 682 0\n-650 -677 -682 0\n650 -677 682 0\n-677 -682 683 0\n677 -683 0\n682 -683 0\n680 -683 684 0\n680 683 -684 0\n-680 -683 -684 0\n-680 683 684 0\n-680 -683 685 0\n680 -685 0\n683 -685 0\n681 -682 686 0\n681 682 -686 0\n-681 -682 -686 0\n-681 682 686 0\n-685 686 687 0\n685 686 -687 0\n-685 -686 -687 0\n685 -686 687 0\n653 684 -689 0\n-653 684 689 0\n-653 -684 -689 0\n653 -684 689 0\n-684 -689 690 0\n684 -690 0\n689 -690 0\n687 -690 691 0\n687 690 -691 0\n-687 -690 -691 0\n-687 690 691 0\n-687 -690 692 0\n687 -692 0\n690 -692 0\n688 -689 693 0\n688 689 -693 0\n-688 -689 -693 0\n-688 689 693 0\n-692 693 694 0\n692 693 -694 0\n-692 -693 -694 0\n692 -693 694 0\n656 691 -696 0\n-656 691 696 0\n-656 -691 -696 0\n656 -691 696 0\n-691 -696 697 0\n691 -697 0\n696 -697 0\n694 -697 698 0\n694 697 -698 0\n-694 -697 -698 0\n-694 697 698 0\n-694 -697 699 0\n694 -699 0\n697 -699 0\n695 -696 700 0\n695 696 -700 0\n-695 -696 -700 0\n-695 696 700 0\n-699 700 701 0\n699 700 -701 0\n-699 -700 -701 0\n699 -700 701 0\n659 698 -703 0\n-659 698 703 0\n-659 -698 -703 0\n659 -698 703 0\n-698 -703 704 0\n698 -704 0\n703 -704 0\n701 -704 705 0\n701 704 -705 0\n-701 -704 -705 0\n-701 704 705 0\n-701 -704 706 0\n701 -706 0\n704 -706 0\n702 -703 707 0\n702 703 -707 0\n-702 -703 -707 0\n-702 703 707 0\n-706 707 708 0\n706 707 -708 0\n-706 -707 -708 0\n706 -707 708 0\n661 705 -710 0\n661 -705 710 0\n-705 -710 711 0\n705 -711 0\n710 -711 0\n708 -711 712 0\n708 711 -712 0\n-708 -711 -712 0\n-708 711 712 0\n-708 -711 713 0\n708 -713 0\n711 -713 0\n709 -710 714 0\n709 710 -714 0\n-709 -710 -714 0\n-709 710 714 0\n-713 714 715 0\n713 714 -715 0\n713 -714 715 0\n662 712 -717 0\n662 -712 717 0\n-712 -717 718 0\n712 -718 0\n717 -718 0\n-715 -718 -719 0\n-715 718 719 0\n715 -720 0\n718 -720 0\n716 -717 721 0\n-716 717 721 0\n720 -721 722 0\n-719 722 724 0\n-719 -722 -724 0\n719 -722 724 0\n-719 -722 725 0\n722 -725 0\n719 -725 0\n719 -723 726 0\n-725 726 727 0\n725 -726 727 0\n724 -728 0\n-460 -467 -470 0\n460 -467 470 0\n476 -487 489 0\n476 487 -489 0\n502 -504 0\n489 -504 0\n-489 -502 504 0\n519 -521 0\n504 -521 0\n538 -540 0\n521 -540 0\n-337 -338 0\n-334 337 338 0\n609 632 -658 0\n664 -667 0\n-666 -667 0\n638 -667 0\n-663 666 667 0\n-638 -664 667 0\n260 -263 0\n-262 -263 0\n43 -263 0\n-42 262 263 0\n198 -210 0\n32 -210 0\n-208 -210 0\n-32 -198 210 0\n-32 208 210 0\n468 -469 0\n465 -469 0\n-39 -40 -72 0\n-52 77 78 0\n-44 -45 -74 0\n-4 -5 -59 0\n20 -65 0\n-19 -20 -65 0\n30 -69 0\n-29 -30 -69 0\n-12 62 63 0\n-17 64 65 0\n-7 60 61 0\n-244 -261 280 0\n-29 -68 0\n-30 -68 0\n-28 -30 -69 0\n-27 68 69 0\n-667 -668 674 0\n-22 -556 570 0\n-688 -689 695 0\n-699 -700 702 0\n-122 -134 151 0\n-125 -136 154 0\n-154 -155 157 0\n-116 -129 145 0\n-24 -102 142 0\n-340 -341 343 0\n-537 -625 651 0\n-539 -628 654 0\n-345 -346 348 0\n-273 -295 311 0\n-305 -306 308 0\n-282 -302 320 0\n-279 -300 317 0\n-348 -349 358 0\n-28 -29 164 0\n-19 -108 120 0\n-276 -298 314 0\n-685 -686 688 0\n-380 -381 383 0\n-280 -281 283 0\n-283 -284 286 0\n-350 -351 353 0\n-626 -627 629 0\n-720 -721 723 0\n-535 -622 648 0\n-533 -619 645 0\n-54 -77 0\n-55 -77 0\n-39 -493 509 0\n334 -338 0\n-335 -338 0\n264 -338 0\n-336 -338 0\n-334 335 338 0\n-264 -334 338 0\n-264 336 338 0\n-47 -49 299 0\n-528 -613 639 0\n-192 -193 195 0\n-85 -95 109 0\n-204 -205 207 0\n-548 -549 551 0\n-179 -206 225 0\n-185 -211 231 0\n-434 -439 443 0\n-216 -217 219 0\n-445 -446 448 0\n-370 -371 373 0\n-375 -376 378 0\n-460 -462 468 0\n-93 -94 96 0\n-88 -98 115 0\n-83 -84 86 0\n-525 -610 636 0\n-18 -111 123 0\n-554 -555 557 0\n-44 -578 595 0\n-43 -581 598 0\n-620 -621 623 0\n-617 -618 620 0\n-614 -615 617 0\n-13 -14 93 0\n-384 -389 393 0\n-33 -566 582 0\n-582 -583 585 0\n-34 -563 579 0\n-561 -562 564 0\n-13 -543 554 0\n-38 -496 512 0\n-53 -511 529 0\n-39 -224 242 0\n-491 -492 494 0\n-410 -411 413 0\n-150 -166 180 0\n-180 -181 183 0\n-497 -498 500 0\n-156 -169 186 0\n-17 -475 487 0\n-481 -482 484 0\n-9 -60 0\n-10 -60 0\n-604 -606 626 0\n-395 -396 398 0\n-594 -597 614 0\n-34 -197 204 0\n-82 -92 106 0\n-145 -146 148 0\n-455 -456 458 0\n-358 -359 368 0\n-274 -275 277 0\n-564 -565 567 0\n-531 -616 642 0\n-444 -449 453 0\n-529 -530 532 0\n-463 -464 466 0\n657 -660 0\n658 -660 0\n-265 -266 268 0\n-469 470 0\n-213 -214 216 0\n-176 -203 222 0\n-713 -714 716 0\n-398 -399 408 0\n-706 -707 709 0\n-79 -89 103 0\n-207 -208 211 0\n208 210 -211 0\n207 210 -211 0\n-87 -97 112 0\n-428 -429 438 0\n-130 -131 133 0\n-171 -172 174 0\n-195 -196 198 0\n-425 -426 428 0\n-420 -421 423 0\n-80 -81 83 0\n-19 -64 0\n-20 -64 0\n-18 -20 -65 0\n-28 -483 497 0\n-408 -409 418 0\n-242 -243 245 0\n4 -5 542 0\n4 5 -542 0\n3 -542 544 0\n3 542 -544 0\n-394 -399 403 0\n-598 -599 601 0\n-378 -379 388 0\n-14 -62 0\n-15 -62 0\n-17 -114 126 0\n-320 -321 323 0\n-43 -218 271 0\n-271 -272 274 0\n-360 -361 363 0\n-674 -675 681 0\n-54 -508 526 0\n-34 -70 0\n-35 -70 0\n-182 -209 228 0\n-478 -479 481 0\n-424 -429 433 0\n-512 -513 515 0\n-147 -163 177 0\n-37 -230 248 0\n-277 -278 280 0\n261 278 -280 0\n261 277 -280 0\n244 277 -280 0\n-268 -269 271 0\n43 269 -271 0\n43 268 -271 0\n218 268 -271 0\n-151 -152 154 0\n136 152 -154 0\n136 151 -154 0\n125 151 -154 0\n-551 -552 554 0\n13 552 -554 0\n13 551 -554 0\n543 551 -554 0\n-222 -223 225 0\n206 223 -225 0\n206 222 -225 0\n179 222 -225 0\n-364 -369 373 0\n364 370 -373 0\n369 370 -373 0\n-695 -696 702 0\n695 699 -702 0\n696 699 -702 0\n-440 -441 443 0\n439 440 -443 0\n434 440 -443 0\n-681 -682 688 0\n681 685 -688 0\n682 685 -688 0\n-725 -726 728 0\n723 725 -728 0\n303 320 -323 0\n285 321 -323 0\n-579 -580 582 0\n33 580 -582 0\n33 579 -582 0\n566 579 -582 0\n-651 -652 654 0\n628 652 -654 0\n628 651 -654 0\n539 651 -654 0\n-645 -646 648 0\n622 646 -648 0\n622 645 -648 0\n535 645 -648 0\n-636 -637 639 0\n613 637 -639 0\n613 636 -639 0\n528 636 -639 0\n-602 -604 623 0\n604 620 -623 0\n602 620 -623 0\n604 621 -623 0\n-311 -312 314 0\n298 312 -314 0\n298 311 -314 0\n276 311 -314 0\n-592 -593 595 0\n44 593 -595 0\n44 592 -595 0\n578 592 -595 0\n-692 -693 695 0\n689 692 -695 0\n688 692 -695 0\n-161 -162 164 0\n29 161 -164 0\n28 161 -164 0\n-567 -568 570 0\n22 568 -570 0\n22 567 -570 0\n556 567 -570 0\n-219 -220 222 0\n203 220 -222 0\n203 219 -222 0\n176 219 -222 0\n-355 -356 358 0\n349 355 -358 0\n348 355 -358 0\n-148 -149 151 0\n134 149 -151 0\n134 148 -151 0\n122 148 -151 0\n-344 -349 353 0\n344 350 -353 0\n349 350 -353 0\n-317 -318 320 0\n302 318 -320 0\n302 317 -320 0\n282 317 -320 0\n-14 -541 551 0\n541 548 -551 0\n14 548 -551 0\n541 549 -551 0\n-90 -91 93 0\n14 90 -93 0\n13 90 -93 0\n-109 -110 112 0\n97 110 -112 0\n97 109 -112 0\n87 109 -112 0\n-308 -309 311 0\n295 309 -311 0\n295 308 -311 0\n273 308 -311 0\n-49 -270 308 0\n270 305 -308 0\n49 305 -308 0\n49 306 -308 0\n-245 -246 248 0\n37 246 -248 0\n37 245 -248 0\n230 245 -248 0\n-24 -550 564 0\n550 561 -564 0\n24 561 -564 0\n24 562 -564 0\n-29 -480 494 0\n480 491 -494 0\n29 491 -494 0\n29 492 -494 0\n-506 -507 509 0\n39 507 -509 0\n39 506 -509 0\n493 506 -509 0\n-3 -9 83 0\n3 80 -83 0\n9 80 -83 0\n3 81 -83 0\n-671 -672 674 0\n668 671 -674 0\n667 671 -674 0\n-385 -386 388 0\n379 385 -388 0\n378 385 -388 0\n-247 -262 283 0\n247 280 -283 0\n262 280 -283 0\n262 281 -283 0\n-368 -369 378 0\n368 375 -378 0\n369 375 -378 0\n-18 -473 484 0\n473 481 -484 0\n18 481 -484 0\n18 482 -484 0\n-12 -545 557 0\n545 554 -557 0\n12 554 -557 0\n12 555 -557 0\n609 629 -632 0\n609 630 -632 0\n-405 -406 408 0\n399 405 -408 0\n398 405 -408 0\n-623 -624 626 0\n604 624 -626 0\n604 623 -626 0\n606 623 -626 0\n-597 -600 617 0\n600 614 -617 0\n597 614 -617 0\n600 615 -617 0\n-2 -8 86 0\n2 83 -86 0\n8 83 -86 0\n2 84 -86 0\n-414 -419 423 0\n414 420 -423 0\n419 420 -423 0\n-120 -121 123 0\n18 121 -123 0\n18 120 -123 0\n111 120 -123 0\n32 195 -198 0\n33 195 -198 0\n32 196 -198 0\n-702 -703 709 0\n702 706 -709 0\n703 706 -709 0\n-390 -391 393 0\n389 390 -393 0\n384 390 -393 0\n-228 -229 231 0\n211 229 -231 0\n211 228 -231 0\n185 228 -231 0\n-709 -710 716 0\n709 713 -716 0\n710 713 -716 0\n-600 -602 620 0\n602 617 -620 0\n600 617 -620 0\n602 618 -620 0\n-106 -107 109 0\n95 107 -109 0\n95 106 -109 0\n85 106 -109 0\n-716 -717 723 0\n717 720 -723 0\n-170 -191 216 0\n170 213 -216 0\n191 213 -216 0\n170 214 -216 0\n-173 -200 219 0\n173 216 -219 0\n200 216 -219 0\n200 217 -219 0\n-438 -439 448 0\n438 445 -448 0\n439 445 -448 0\n-338 -339 348 0\n338 345 -348 0\n339 345 -348 0\n-117 -118 120 0\n19 118 -120 0\n19 117 -120 0\n108 117 -120 0\n-8 -10 -61 0\n-9 -10 -61 0\n10 -61 0\n-465 -468 -470 0\n-465 468 470 0\n-142 -143 145 0\n129 143 -145 0\n129 142 -145 0\n116 142 -145 0\n-164 -165 167 0\n28 165 -167 0\n28 164 -167 0\n27 164 -167 0\n-639 -640 642 0\n616 640 -642 0\n616 639 -642 0\n531 639 -642 0\n-648 -649 651 0\n625 649 -651 0\n625 648 -651 0\n537 648 -651 0\n-576 -577 579 0\n34 577 -579 0\n34 576 -579 0\n563 576 -579 0\n-32 -569 585 0\n569 582 -585 0\n32 582 -585 0\n32 583 -585 0\n-201 -202 204 0\n34 201 -204 0\n197 201 -204 0\n263 283 -286 0\n263 284 -286 0\n-522 -634 636 0\n610 634 -636 0\n522 610 -636 0\n522 525 -636 0\n-595 -596 598 0\n43 596 -598 0\n43 595 -598 0\n581 595 -598 0\n-239 -240 242 0\n39 240 -242 0\n39 239 -242 0\n224 239 -242 0\n-296 -297 299 0\n49 297 -299 0\n49 296 -299 0\n47 296 -299 0\n-642 -643 645 0\n619 643 -645 0\n619 642 -645 0\n533 642 -645 0\n-119 -132 148 0\n119 145 -148 0\n132 145 -148 0\n119 146 -148 0\n-526 -527 529 0\n53 527 -529 0\n53 526 -529 0\n511 526 -529 0\n-33 -34 195 0\n33 192 -195 0\n34 192 -195 0\n-177 -178 180 0\n166 178 -180 0\n166 177 -180 0\n150 177 -180 0\n-509 -510 512 0\n38 510 -512 0\n38 509 -512 0\n496 509 -512 0\n-53 -55 -78 0\n-54 -55 -78 0\n55 -78 0\n-153 -168 183 0\n153 180 -183 0\n168 180 -183 0\n168 181 -183 0\n-400 -401 403 0\n399 400 -403 0\n394 400 -403 0\n-144 -160 174 0\n144 171 -174 0\n160 171 -174 0\n160 172 -174 0\n-606 -608 629 0\n608 626 -629 0\n606 626 -629 0\n608 627 -629 0\n-42 -584 601 0\n584 598 -601 0\n42 598 -601 0\n42 599 -601 0\n-374 -379 383 0\n374 380 -383 0\n379 380 -383 0\n12 93 -96 0\n13 93 -96 0\n12 94 -96 0\n22 130 -133 0\n24 130 -133 0\n22 131 -133 0\n-314 -315 317 0\n300 315 -317 0\n300 314 -317 0\n279 314 -317 0\n-13 -15 -63 0\n15 -63 0\n-14 -15 -63 0\n-112 -113 115 0\n98 113 -115 0\n98 112 -115 0\n88 112 -115 0\n-484 -485 487 0\n17 485 -487 0\n17 484 -487 0\n475 484 -487 0\n137 154 -157 0\n127 155 -157 0\n-37 -499 515 0\n499 512 -515 0\n37 512 -515 0\n499 513 -515 0\n-415 -416 418 0\n409 415 -418 0\n408 415 -418 0\n-174 -175 177 0\n163 175 -177 0\n163 174 -177 0\n147 174 -177 0\n-388 -389 398 0\n388 395 -398 0\n389 395 -398 0\n-365 -366 368 0\n359 365 -368 0\n358 365 -368 0\n-452 -458 466 0\n458 463 -466 0\n-44 -215 268 0\n215 265 -268 0\n44 265 -268 0\n215 266 -268 0\n-654 -655 657 0\n631 655 -657 0\n540 654 -657 0\n-238 -257 274 0\n238 271 -274 0\n257 271 -274 0\n238 272 -274 0\n-27 -486 500 0\n486 497 -500 0\n27 497 -500 0\n27 498 -500 0\n-52 -514 532 0\n514 529 -532 0\n52 529 -532 0\n52 530 -532 0\n-354 -359 363 0\n354 360 -363 0\n359 360 -363 0\n-678 -679 681 0\n675 678 -681 0\n674 678 -681 0\n-336 -339 343 0\n336 340 -343 0\n339 340 -343 0\n-523 -524 526 0\n54 524 -526 0\n54 523 -526 0\n508 523 -526 0\n-33 -199 207 0\n199 204 -207 0\n33 204 -207 0\n199 205 -207 0\n-241 -259 277 0\n241 274 -277 0\n259 274 -277 0\n259 275 -277 0\n-139 -140 142 0\n24 140 -142 0\n24 139 -142 0\n102 139 -142 0\n-123 -124 126 0\n17 124 -126 0\n17 123 -126 0\n114 123 -126 0\n-452 -454 461 0\n452 -461 0\n-418 -419 428 0\n418 425 -428 0\n419 425 -428 0\n460 -468 0\n-225 -226 228 0\n209 226 -228 0\n209 225 -228 0\n182 225 -228 0\n449 450 -453 0\n-448 -449 458 0\n448 455 -458 0\n449 455 -458 0\n-103 -104 106 0\n92 104 -106 0\n92 103 -106 0\n82 103 -106 0\n-23 -553 567 0\n553 564 -567 0\n23 564 -567 0\n23 565 -567 0\n-100 -101 103 0\n89 101 -103 0\n89 100 -103 0\n79 100 -103 0\n-611 -612 614 0\n594 611 -614 0\n597 611 -614 0\n-435 -436 438 0\n429 435 -438 0\n428 435 -438 0\n-19 -471 481 0\n471 478 -481 0\n19 478 -481 0\n19 479 -481 0\n-183 -184 186 0\n169 184 -186 0\n169 183 -186 0\n156 183 -186 0\n-404 -409 413 0\n404 410 -413 0\n409 410 -413 0\n-430 -431 433 0\n429 430 -433 0\n424 430 -433 0\n-38 -227 245 0\n227 242 -245 0\n38 242 -245 0\n227 243 -245 0\n-494 -495 497 0\n28 495 -497 0\n28 494 -497 0\n483 494 -497 0\n-724 727 728 0\n-724 -727 -728 0\n-32 -33 -35 70 0\n-32 -34 -35 70 0\n-32 35 70 0\n-22 25 67 0\n-22 -24 -25 67 0\n-47 -48 75 76 0\n-22 -23 66 67 0\n-42 -43 74 0\n-42 73 74 0\n-42 -43 73 0\n-47 -49 -50 76 0\n-47 49 50 76 0\n-37 -38 72 0\n-37 71 72 0\n-37 -38 71 0\n-460 -466 470 0\n460 469 -470 0\n724 -727 728 0\n-724 -727 728 0\n-2 -3 58 0\n-2 -3 59 0\n-2 58 59 0\n"
},{}]},{},[1])(1)
});