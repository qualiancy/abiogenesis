/*!
 * abiogenesis - Context Constructor
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

module.exports = Context;

function Context (name, opts) {
  opts = opts || {};
  this._parent = null;
  this._runner = opts.runner || null;
  this._contexts = [];
  this._definitions = [];
  this._opts = {
      name: name
    , type: this.__type || 'context'
    , strategy: opts.strategy || 'series'
  }
  delete this.__type;
  if (this._runner) this._runner.addContext(this);
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

Context.extend = function (type, proto) {
  var self = this
    , child = function () { self.apply(this, arguments); };
  inherits.merge([ child, this ]);
  inherits.inherits(child, this);
  if (proto) inherits.merge([ child.prototype, proto ]);
  child.extend = this.extend;
  child.prototype.__type = type;
  return child;
};

Object.defineProperty(Context.prototype, 'id',
  { get: function () {
      return '/' + this._opts.type
           + '/' + this._opts.name;
    }
});

Object.defineProperty(Context.prototype, 'runner',
  { get: function () {
      if (this._runner) return this._runner;
      return this._parent ? this._parent.runner : null
    }
  , set: function (runner) {
      if (this._parent) this._parent.runner = runner;
      else {
        this._runner = runner;
        runner.pushContext(this);
      }
    }
});

Context.prototype.addContext = function (context) {
  context._parent = this;
  if (this.runner) this.runner.addContext(context);
  this._contexts.push(context);
  return this;
};

Context.prototype.addDefinition = function (definition) {
  definition._context = this;
  if (this.runner) this.runner.addDefinition(definition);
  this._definitions.push(definition);
  return this;
};
