/*!
 * abiogenesis - Runner Constructor
 * Copyright(c) 2012 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var breeze= require('breeze')
  , Drip = require('drip')
  , inherits = require('super');

/*!
 * Internal Dependancies
 */

var Context = require('./context')
  , Definition = require('./definition');

/*!
 * Statics
 */

var noop = function () {};

/*!
 * Module Export
 */

module.exports = Runner;

/**
 * ## Runner
 *
 * A general purpose runner of things. Namely anything
 * this is asyncronous in nature, but it is particularly
 * good at handly things that have dependancies of other
 * things.
 *
 * By specifying different types of things, one can
 * use a singualar runner to manage seperate patterns of
 * execution. For example, one can have a build tool that
 * allows both subprocesses and asyncronous functions, with
 * dependancies between the two.
 *
 * This is a base pattern meant to be extended.
 *
 * ##### Options
 *
 * - `strategy` _{String}_ run strategy: `parallel`* or `series`
 * - `concurrenty` _{Number}_ number of parallel threads when
 * executing with `parallel` strategy.
 *
 * @header Runner
 */

function Runner (opts) {
  /*!
   * @param {Object} options
   * @api public
   */

  Drip.call(this, { delimeter: '::' });
  opts = opts || {};
  this._types = {};
  this._definitions = [];
  this._contexts = [];
  this._opts = {
      strategy: opts.strategy || 'parallel'
    , concurrency: opts.concurrency || 10
  }

  if (this.events) bindEvents.call(this, this.events);
  this.initialize.apply(this, arguments);
}

/*!
 * Inherits event emitting capability from Drip
 */

inherits(Runner, Drip);

/**
 * #### .extend (proto)
 *
 * Extend the Runner prototype to include your
 * own methods and properties.
 *
 *     var TaskRunner = Runner.extend({
 *         events: {
 *           'task::add': 'taskAdd'
 *         }
 *       , initialize: function (fn) {
 *           this.use('task', TaskDefinition, this.runTask.bind(this));
 *         }
 *       , runTask: function (def, next) {
 *           def._action(next);
 *         }
 *       , preAdd: function (def) {
 *           console.log('starting added: ' + def._opts.name);
 *         }
 *     });
 *
 * In the above scenario, the `initialize` function will
 * be called on construction of the TaskRunner instance.
 * Events can also be automatically bound using the
 * `events` object.
 *
 * ##### Events
 *
 * - `[type]::add` (definition) upon adding of a
 * constructed definition
 * - `[type]::pre` (definition) immediately prior
 * to running a defintion
 * - `[type]::post` (definition) immediately following
 * a run of a definition if no error occured
 * - `[type]::error` (error, definition) immediately
 * a run of a definition that failed.
 *
 * @param {Object} prototype functions to include
 * @name extend
 * @api public
 */

Runner.extend = inherits.extend;

/*!
 * noop for initialize
 */

Runner.prototype.initialize = function () {};

/**
 * ### .register (Defintion, action)
 *
 * Register a definition constructor and an associated action
 * for each of the constructed definitions of that type.
 *
 * @param {Definition} definition constructor
 * @param {Function} action to execute for definitions of type
 * @returns `this` for chaining
 * @name register
 * @api public
 */

Runner.prototype.register = function (def, action) {
  var type = def.prototype.__type || 'definition';
  this._types[type] = { definition: def, action: action };
  return this;
};

/**
 * ### .push (obj)
 *
 * Push either a context or a definition into the runner.
 * Runner will check to see a thing with the same type/name
 * pair already exist in the runner and could throw error
 * if scenario is true.
 *
 * @param {String} type key
 * @param {String} unique identifier per type
 * @returns constructed definition of type
 * @name push
 * @api public
 */

Runner.prototype.push = function () {
  var self = this
    , args = Array.prototype.slice.call(arguments, 0);

  args.forEach(function (objs) {
    if (!Array.isArray(objs)) objs = [ objs ];
    objs.forEach(function (obj) {
      if (obj instanceof Context) pushContext.call(self, obj);
      else pushDefinition.call(self, obj);
    });
  });

  return this;
};

/*!
 * pushDefinition (definition)
 *
 * Handles the push of a definition into the runner.
 * Check validity and emits events.
 *
 * @param {Object} definition
 * @api private
 */

function pushDefinition (definition) {
  var self = this
    , type = definition._opts.type
    , name = definition._opts.name;

  checkValid.call(this, 'definition', type, name);
  this._definitions.push(definition);
  this.emit([ 'definition', 'add', type ], type, definition);
};

/*!
 * pushContext (context)
 *
 * Handles the push of a context into the runner.
 * Includes checking validity, recursing, and event
 * emitting.
 *
 * @param {Object} context
 * @api private
 */

function pushContext (context) {
  var self = this
    , push = function (obj) { self.push(obj); };

  function iterate (ctx) {
    var type = ctx._opts.type
      , name = ctx._opts.name;
    checkValid.call(self, 'context', type, name);
    self._contexts.push(ctx);
    self.emit([ 'context', 'add', type ], ctx);
    ctx._definitions.forEach(push);
    ctx._contexts.forEach(iterate);
  }

  iterate(context);
  context._runner = this;
}

/*!
 * checkValid (ns, type, name)
 *
 * Checks validatity of namespace or context. Specifically
 * if it already exists in the runner.
 *
 * @param {String} namespace (definition or context)
 * @param {String} type
 * @param {String} name
 * @api private
 */

function checkValid (ns, type, name) {
  var key = getKey(type, name);
  if (ns === 'definition' && !this._types[type])
    throw new Error('Absent register for definition of type `' + type + '`');
  if (getSpec(this['_' + ns + 's'],  key))
    throw new Error(type + ' named `' + name + '` already defined');
}

/**
 * ### .runDefinition (type, name[, done])
 *
 * Parse the dependancies for a thing, run the dependancies,
 * then run the thing. A callback can be called upon
 * completion of the run cycle, with a possible parameter
 * of an error that occured. The error could be due to the
 * parsing of dependancies, or passed from any of the running
 * things. The run cycle will bail should any of the things
 * fail.
 *
 * @param {String} type key
 * @param {String} unique indentifier for type
 * @param {Function} callback on completion or error
 * @cb {Error|null} if error
 * @name run
 * @api public
 */

Runner.prototype.runDefinition = function (type, name, cb) {
  cb = cb || function () {};
  var self = this
    , edges = getRequires.call(this, type, name)
    , opts = this._opts;

  function iterator (key, next) {
    var def = getSpec(self._definitions, key)
      , ns = def._opts.type
      , action = self._types[ns].action;
    self.emit([ ns, 'pre' ], def);
    action(def, function done (err) {
      if (err) self.emit([ ns, 'error' ], err, def);
      else self.emit([ ns, 'post' ], def);
      next(err);
    });
  }

  if (opts.strategy === 'parallel')
    breeze.dag(edges, opts.conccurency, iterator, cb);
  else
    breeze.dagSeries(edges, iterator, cb);
};

/**
 * ### .runContext (type, name[, done])
 *
 * Parse the dependancies for a context of things by
 * recursively checking all definitions in context
 * and subcontexts. then run the thing. A callback can be called upon
 * completion of the run cycle, with a possible parameter
 * of an error that occured. The error could be due to the
 * parsing of dependancies, or passed from any of the running
 * things. The run cycle will bail should any of the things
 * fail.
 *
 * @param {String} type key
 * @param {String} unique indentifier for type
 * @param {Function} callback on completion or error
 * @cb {Error|null} if error
 * @name run
 * @api public
 */

Runner.prototype.runContext = function (type, name, cb) {
  cb = cb || function () {};
  var self = this
    , opts = this._opts
    , base = getSpec(this._contexts, type, name)
    , defs = []
    , edges = [];

  function locateDefs (ctx) {
    ctx._definitions.forEach(function (def) { defs.push(def); });
    ctx._contexts.forEach(function (ctx) { locateDefs(ctx); });
  }

  function iterator (key, done) {
    var definition = getSpec(self._definitions, key)
      , type = definition._opts.type
      , action = self._types[type].action;
    // TODO: events
    action(definition, function next (err) {
      // TODO: events
      done(err);
    });
  }

  locateDefs(base);

  defs.forEach(function (def) {
    var es = getRequires.call(self, def.id);
    edges = edges.concat(es);
  });

  if (opts.strategy == 'parallel')
    breeze.dag(edges, opts.concurrency, iterator, cb);
  else
    breeze.dagSeries(edges, iterator, cb);
};

/*!
 * bindEvents (events)
 *
 * Bind a set of keys to to a single or set of
 * functions. Expected to be called with the
 * context of the event emitter to bind to.
 *
 *     bindEvents.call(runner, {
 *         'task::error': 'taskError'
 *       , 'task::pre': [ 'taskPre1', 'taskPre2' ]
 *     });
 *
 * @param {Object} key:value sets of events:targetfns to bind
 * @api private
 */

function bindEvents (evs) {
  var self = this
    , keys = Object.keys(evs);
  keys.forEach(function (ev) {
    var targets = evs[ev];
    if (!Array.isArray(targets)) targets = [ targets ];
    targets.forEach(function (key) {
      self.on(ev, function () {
        self[key].apply(self, arguments);
      });
    });
  });
}

/*!
 * getRequires (type, name)
 *
 * Get all of the required things for a particular
 * defined thing. This function could throw an error
 * if the dependancy tree is invalid.
 *
 * @param {String} type key
 * @param {String} unique identifier per type
 * @ctx Runner
 * @returns {Array} suggest order of execution
 * @api private
 */

function getRequires (type, name) {
  var key = getKey(type, name)
    , spec = getSpec(this._definitions, key)
    , requires = spec._requires
    , edges = [ [ null, key ] ];
  requires.forEach(depEach(this, edges, key));
  return edges;
};


/*!
 * depEach (runner, edges, name)
 *
 * Returns a context aware function to be used
 * to recursively get all dependancies for a specific
 * thing.
 *
 * @param {Runner} runner to check for definition
 * @param {Array} edges array to push new edges to
 * @param {String} key of definition thing is should run before
 * @returns {Function} for use with forEach
 * @api private
 */

function depEach (runner, edges, name) {
  return function (dep) {
    var key = makeKey(dep);
    if (getSpec(runner._definitions, key)) {
      edges.push([ key, name ]);
      getDeps(runner, edges, key, dep);
    }
  }
}

/*!
 * getDeps (runner, edges, name, definition)
 *
 * Recursively get all dependant things for a particular
 * thing.
 *
 * @param {Runner} runner to check for definition
 * @param {Array} edges array to push new edges to
 * @param {String} key of definition thing is should run before
 * @param {Definition} definition to search for dependant things on
 * @api private
 */

function getDeps (runner, edges, name, def) {
  def._requires.forEach(depEach(runner, edges, name));
}

function getSpec (specs, type, name) {
  var key = getKey(type, name);
  return specs.filter(function (spec) {
    return spec.id === key;
  })[0] || null;
}

/*!
 * makeKey (definition)
 *
 * Construct a string used as a lookup for a thing
 *
 * @param {Definition}
 * @returns {String} key
 * @api private
 */

function makeKey (spec) {
  return '/'
    + spec._opts.type + '/'
    + spec._opts.name;
}

/*!
 * getKey (type, name)
 *
 * Given a type and name, construct a key as it would
 * be constructed using `makeKey`.
 *
 * @param {String} type key
 * @param {String} unique identifier per type
 * @returns {String} key
 * @api private
 */

function getKey (type, name) {
  if (!name) return type;
  return '/' + type + '/' + name;
}
