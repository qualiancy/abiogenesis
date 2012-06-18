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

/**
 * ## Context
 *
 * A context is a group of definitions and
 * nested contexts that can be invoked in a single
 * run cycle. As with definitions, they can be extended
 * to have types and must be unique with a runner.
 *
 * If a runner is associated to a constructed context
 * all objects `push`ed to that context will also
 * be pushed to the runner. Furthermore, when a runner
 * is attached via set `.runner = runner`, all objects
 * and nested objects will be pushed to the runner.
 *
 * @header Context
 */

function Context (name, opts) {
  /*!
   * @param {String} name
   * @opts {Object} options
   */

  opts = opts || {};
  this._parent = null;
  this._runner = null;
  this._contexts = [];
  this._definitions = [];
  this._opts = {
      name: name
    , type: this.__type || 'context'
  }

  delete this.__type;
  if (opts.runner) this.runner = opts.runner;
}

/**
 * #### .create (parent, name)
 *
 * Context creation factor that handles the
 * follow of creating a different type of
 * context inside another context. Mainly, just
 * for convience.
 *
 * @param {Object} parent context
 * @param {String} name
 * @returns new Context
 * @name create
 * @api public
 */

Context.create = function (parent, name) {
  var context = new this(name);
  parent.push(context);
  return context;
};

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

/**
 * ### .id
 *
 * Property to get the runner unique `id` of the
 * context.
 *
 * @returns {String} unique id
 * @name id
 * @api public
 */

Object.defineProperty(Context.prototype, 'id',
  { get: function () {
      return '/' + this._opts.type
           + '/' + this._opts.name;
    }
});

/**
 * ### .runner
 *
 * Getter or setter for the runner of the current
 * context. When getting, if one does not exist
 * on this context, it will check it's parents. When
 * setting, will automatically push the contents of
 * this context to runner assigned.
 *
 * @accepts {Object} runner
 * @returns {Object} runner or null
 * @name runner
 * @api public
 */

Object.defineProperty(Context.prototype, 'runner',
  { get: function () {
      if (this._runner) return this._runner;
      return this._parent ? this._parent.runner : null
    }
  , set: function (runner) {
      this._runner = runner;
      runner.push(this);
    }
});

/**
 * ### .push (obj)
 *
 * Push a definition or a context into this runner.
 * Automatically sets lineage and ensures of push
 * to a runner if it is attached to this or ancestor
 * context.
 *
 * @param {Object} context or definition
 * @name push
 * @api public
 */

Context.prototype.push = function (obj) {
  if (this.runner) this.runner.push(obj);
  if (obj instanceof Context) {
    obj._parent = this;
    this._contexts.push(obj);
  } else {
    //obj._context = this;
    this._definitions.push(obj);
  }
};

/**
 * ### .filter (indicator, iterator[, deep])
 *
 * A (optionally recursive) filtering mechanism that
 * can be used to get a flattened array of all definitons
 * or contexts that are children of the current context.
 * Useful if you have an id for an object but don't know
 * its current path.
 *
 * Flattens all child contexts or definitions into a single
 * array and applys provided iterator as filter for that
 * array.
 *
 * @param {String} indicator: `contexts` or `definitions`
 * @param {Function} iterator function for array filter
 * @param {Boolean} recursive (defaults to false)
 * @returns {Array} results
 * @name filter
 * @api public
 */

Context.prototype.filter = function (type, iterator, deep) {
  var ctxs = []
    , defs = []
    , res = [];

  function iterateDefs (def) {
    defs.push(def);
  }

  function iterateCtx (ctx) {
    ctxs.push(ctx);
    ctx._definitions.forEach(iterateDefs);
    if (deep) ctx._contexts.forEach(iterateCtx);
  }

  this._definitions.forEach(iterateDefs);
  this._contexts.forEach(iterateCtx);

  if (type === 'contexts')
    return ctxs.filter(iterator);
  else if (type === 'definitions')
    return defs.filter(iterator);
  else
    return [];
};

