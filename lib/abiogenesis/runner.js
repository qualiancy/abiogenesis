/*!
 * abiogenesis - Runner Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var Drip = require('drip')
  , inherits = require('super');

/*!
 * Internal Dependancies
 */

var tsort = require('./tsort');

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
 * This is a base pattern is meant to be extended.
 *
 * @header Runner
 */

function Runner () {
  /*!
   * @api public
   */

  Drip.call(this, { delimeter: '::' });
  this._types = {};
  this._definitions = {};
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
 *           console.log('starting added: ' + def._def.name);
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
 * ### .use (type, definition, action)
 *
 * Specify a named key and its accociated definition
 * file and action to implement upon its execution
 *
 * @param {String} type key
 * @param {Definition} definition constructor
 * @param {Function} action to execute for definitions of type
 * @returns `this` for chaining
 * @name use
 * @api public
 */

Runner.prototype.use = function (type, def, action) {
  this._types[type] = { definition: def, action: action };
  return this;
};

/**
 * ### .define (type, id)
 *
 * Define a new thing for the runner to possibly execute.
 * The type/id combination must be unique and the definition
 * constructor must have been provided via `use`, or an
 * error will be thrown. Retruns the contructed defintion,
 * possibly for chaining or further modification.
 *
 * @param {String} type key
 * @param {String} unique identifier per type
 * @returns constructed definition of type
 * @name define
 * @api public
 */

Runner.prototype.define = function (type, name) {
  var key = getKey(type, name);
  if (!this._types[type])
    throw new Error('no definition for type `' + type + '`');
  if (this._definitions[key])
    throw new Error(type + ' named `' + name + '` already defined');
  var Definition = this._types[type].definition
    , definition = new Definition(type, name)
  this._definitions[key] = definition;
  this.emit([ type, 'add' ], type, definition);
  return definition;
};

/**
 * ### .run (type, name[, done])
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

Runner.prototype.run = function (type, name, cb) {
  cb = cb || function () {};
  var self = this
    , deps;

  // prevent uncaught expections of dependancy traversal
  try { deps = getRequires.call(this, type, name); }
  catch (ex) {
    this.emit('error', ex);
    return cb(ex);
  }

  function iterate () {
    var key = deps.shift()
    if (!key) return cb();
    var def = self._definitions[key]
      , ns = def._def.type
      , action = self._types[ns].action;
    self.emit([ ns, 'pre' ], def);
    action(def, function done (err) {
      if (err) {
        self.emit([ ns, 'error' ], err, def);
        cb(err);
      } else {
        self.emit([ ns, 'post' ], def);
        iterate();
      }
    });
  }

  iterate();
};

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
    , requires = this._definitions[key]._requires
    , edges = [ [ null, key ] ];
  requires.forEach(depEach(this, edges, key));
  return tsort(edges);
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
    if (runner._definitions[key]) {
      edges.push([ key, name ]);
      getDeps(runner, edges, name, dep);
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

/*!
 * makeKey (definition)
 *
 * Construct a string used as a lookup for a thing
 *
 * @param {Definition}
 * @returns {String} key
 * @api private
 */

function makeKey (definition) {
  return '/'
    + definition._def.type + '/'
    + definition._def.name;
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

