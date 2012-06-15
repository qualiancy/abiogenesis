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

function Runner () {
  Drip.call(this, { delimeter: '::' });
  this._types = {};
  this._definitions = {};
  if (this.events) bindEvents.call(this, this.events);
  this.initialize.apply(this, arguments);
}

inherits(Runner, Drip);

Runner.extend = inherits.extend;

Runner.prototype.initialize = function () {};

Runner.prototype.use = function (type, def, action) {
  this._types[type] = { definition: def, action: action };
  return this;
};

Runner.prototype.define = function (type, name) {
  var key = getKey(type, name);
  if (!this._types[type])
    throw new Error('no definition for type `' + type + '`');
  if (this._definitions[key])
    throw new Error(type + ' named `' + name + '` already defined');
  var Definition = this._types[type].definition
    , definition = new Definition(type, name)
  this._definitions[key] = definition;
  this.emit([ 'definition', 'add' ], type, definition);
  return definition;
};

Runner.prototype.getRequires = function (type, name) {
  var key = getKey(type, name)
    , requires = this._definitions[key]._requires
    , edges = [ [ null, key ] ];
  requires.forEach(depEach(this, edges, key));
  return tsort(edges);
};

Runner.prototype.run = function (type, name, cb) {
  var self = this
    , deps = this.getRequires(type, name);

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

function bindEvents (evs) {
  var self = this
    , keys = Object.keys(evs);
  keys.forEach(function (key) {
    var handle = evs[key]
    self.on(key, function () {
      self[handle].apply(self, arguments);
    });
  });
}

function depEach (runner, edges, name) {
  return function (dep) {
    var key = makeKey(dep);
    if (runner._definitions[key]) {
      edges.push([ key, name ]);
      getDeps(runner, edges, name, dep);
    }
  }
}

function getDeps (runner, edges, name, def) {
  def._requires.forEach(depEach(runner, edges, name));
}

function makeKey (definition) {
  return '/'
    + definition._def.type + '/'
    + definition._def.name;
}

function getKey (type, name) {
  if (!name) return type;
  return '/' + type + '/' + name;
}

