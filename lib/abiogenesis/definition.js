/*!
 * abiogenesis - Definition Constructor
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var inherits = require('super');

/*!
 * Module Export
 */

module.exports = Definition;

/**
 * ## Definition
 *
 * The basis object for publicly exposed objects.
 * This is primary going to be inherted and modified
 * using chainable helpers.
 *
 * @param {String} type
 * @param {String} name
 * @header Definition
 * @api public
 */

function Definition (name) {
  this._requires = [];
  this._opts = {
      name: name
    , type: this.__type || 'definition'
  };

  delete this.__type;
}

/**
 * #### .extend (proto)
 *
 * Extend the Definition prototype to include your
 * own methods and properties.
 *
 * Note that the only reserved method for a
 * definition is `requires`, and the only reserved
 * properties are `_requires` and `_def`.
 *
 *     var Task = Definition.extend('task', {
 *       action: function (fn) {
 *         this._action = fn;
 *       }
 *     });
 *
 * @param {String} type
 * @param {Object} prototype functions to include
 * @name extend
 * @api public
 */

Definition.extend = function (type, proto) {
  var self = this
    , child = function () { self.apply(this, arguments); };
  inherits.merge([ child, this ]);
  inherits.inherits(child, this);
  if (proto) inherits.merge([ child.prototype, proto ]);
  child.extend = this.extend;
  child.prototype.__type = type;
  return child;
};

Object.defineProperty(Definition.prototype, 'id',
  { get: function () {
      return '/' + this._opts.type
           + '/' + this._opts.name;
    }
});

/**
 * ### .requires (definition)
 *
 * Assertion that this constructed defintion
 * has dependancy of another definition prior
 * to running.
 *
 * @param {Object} definition of dependancy
 * @name requires
 * @api public
 */

Definition.prototype.requires = function () {
  var requires = this._requires
    , args = Array.prototype.slice.call(arguments, 0);

  args.forEach(function (deps) {
    if (!Array.isArray(deps)) deps = [ deps ];
    deps.forEach(function (dep) {
      requires.push(dep);
    });
  });

  return this;
};
