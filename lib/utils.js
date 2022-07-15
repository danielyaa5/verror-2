module.exports.objectToString = (o) => {
  return Object.prototype.toString.call(o);
}

const types = {
  bool(arg) {
    return typeof (arg) === 'boolean';
  },
  func(arg) {
    return typeof (arg) === 'function';
  },
  string(arg) {
    return typeof (arg) === 'string';
  },
  object(arg) {
    return typeof (arg) === 'object' && arg !== null;
  },
  number(arg) {
    return typeof (arg) === 'number' && !isNaN(arg);
  },
  finite(arg) {
    return typeof (arg) === 'number' && !isNaN(arg) && isFinite(arg);
  },
  buffer(arg) {
    return Buffer.isBuffer(arg);
  },
  array(arg) {
    return Array.isArray(arg);
  },
  arrayOfObject(arg) {
    if (!types.array(arg)) {
      return false;
    }
    for (let i = 0; i < arg.length; i++) {
      if (!types.object(arg[i])) {
        return false;
      }
    }
    return true
  },
  date(arg) {
    return arg instanceof Date;
  },
  regexp(arg) {
    return arg instanceof RegExp;
  },
  error(arg) {
    return (module.exports.objectToString(arg) === '[object Error]' || arg instanceof Error);
  }
};

function AssertionError(message = "") {
  this.name = "AssertionError";
  this.message = message;
}
AssertionError.prototype = Error.prototype;

module.exports.assert = {
  ok(arg, msg) {
    if (!arg) {
      throw new AssertionError(msg);
    }
  }
}
for (const key in types) {
  module.exports.assert[key] = function (arg, name) {
    if (!types[key](arg)) {
      throw new TypeError(`${name} (${key}) is required`);
    }
  }
}

module.exports.isError = types.error;
