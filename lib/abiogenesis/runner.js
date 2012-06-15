/*!
 * abiogenesis - Runner Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var Drip = require('drip')
  , inherits = require('super')
  , Sol = require('sol')

/*!
 * Internal Dependancies
 */

var Runnable = require('./runnable');

/*!
 * Module Export
 */

module.exports = Runner;

function Runner () {
  Drip.call(this, { delimeter: '::' });
  this._types = new Sol();
  this._definitions = new Sol();
  this._runnables = new Sol();
  if (this.events) bindEvents.call(this, this.events);
  this.initialize.apply(this, arguments);
}

inherits(Runner, Drip);

Runner.extend = inherits.extend;

Runner.prototype.initialize = function () {};

Runner.prototype.use = function (type, definition, action) {
  this._types.set(type, {
      definition: definition
    , action: action
  });
  return this;
};

Runner.prototype.define = function (type, name) {
  var key = getKey(type, name);

  if (!this._types.has(type))
    throw new Error('no definition for type `' + type + '`');

  if (this.has(type, name))
    throw new Error(type + ' named `' + name + '` already defined');

  var Definition = this._types.get(type).definition
    , definition = new Definition(name, type)
    , runnable = new Runnable(this, definition);
  this._definitions.set(key, definition);
  this._runnables.set(key, runnable);
  this.emit([ 'definition', 'add' ], type, definition);
  return definition;
};

Runner.prototype.has = function (type, name) {
  var key = getKey(type, name);
  return this._definitions.has(key);
};

Runner.prototype.get = function (type, name) {
  var key = getKey(type, name);
  return this._definitions.get(key);
};

Runner.prototype.run = function (type, name, cb) {
  var key = getKey(type, name)
    , runnable = this._runnables.get(key)

  if (!runnable) return cb(new Error(type + ' named `' + name + '` not found'));

  runnable.run(cb);
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

function getKey (type, name) {
  if (!name) return type;
  return '/' + type + '/' + name;
}

