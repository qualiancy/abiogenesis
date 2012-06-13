var Drip = require('drip')
  , inherits = require('super')
  , Sol = require('sol')

module.exports = Runner;

function Runner () {
  Drip.call(this, { delimeter: '::' });
  this._types = new Sol();
  this._definitions = new Sol();
  this._runnables = new Sol();
}

inherits(Runner, Drip);

Runner.prototype.use = function (type, definition, runnable) {
  this._types.set(type, {
      definition: definition
    , runnable: runnable
  });
  return this;
};

Runner.prototype.define = function (type, name) {
  var key = type + '/' + name;

  if (!this._types.has(type))
    throw new Error('no definition for type `' + type + '`');

  if (this.has(type, name))
    throw new Error(type + ' named `' + name + '` already defined');

  var Definition = this._types.get(type).definition
    , definition = new Definition(name, type);
  this._definitions.set(key, definition);
  this.emit([ 'definition', 'add' ], type, definition);

  var Runnable = this._types.get(type).runnable
    , runnable = new Runnable(this, definition);
  this._runnables.set(key, runnable);
  this.emit([ 'runnable', 'add' ], type, runnable);

  return definition;
};

Runner.prototype.has = function (type, name) {
  var key = type + '/' + name;
  return this._definitions.has(key);
};

Runner.prototype.get = function (type, name) {
  var key = type + '/' + name;
  return this._definitions.get(key);
};

Runner.prototype.getRunnable = function (type, name) {
  var key = type + '/' + name;
  return this._runnables.get(key);
};

Runner.prototype.run = function (type, name, cb) {
  var self = this
    , runnables = this.getRunnable(type, name);
  if (!runnable) return cb(new Error(type + ' named `' + name + '` not found'));

  this.emit([ 'runnable', 'pre' ], runnable);
  runnable.run(function (err) {
    self.emit([ 'runnable', 'post' ], err, runnable);
    cb(err);
  });
};
