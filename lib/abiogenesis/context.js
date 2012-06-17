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
  if (this._runner) this._runner.push(this);
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
        runner.push(this);
      }
    }
});

Context.prototype.push = function (obj) {
  if (this.runner) this.runner.push(obj);

  if (obj instanceof Context) {
    obj._parent = this;
    this._contexts.push(obj);
  } else {
    obj._context = this;
    this._definitions.push(obj);
  }

};
