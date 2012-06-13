var Drip = require('drip')
  , Sol = require('sol')
  , util = require('util');

module.exports = Runner;

function Runner () {
  Drip.call(this, { delimeter: '::' });
  this._types = new Sol();
  this._definitions = new Sol();
  this._runnables = new Sol();
}

util.inherits(Runner, Drip);

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

Runner.prototype.run = function (type, name, cb) {
  var res = this[type + 's']
    .filter(runnerFilter(name));
  if (!res.length) {
    var err = new Error(type + ' named ' + name + ' not found');
    err.code = 'ENOTFOUND';
    return cb(err);
  }
  res[0].run(cb);
};

Runner.prototype.runner = function (type, name) {
  var key = type + '/' + name;
  return this._runnables.get(key);
};

Runner.prototype.refresh = function () {
  var self = this;

  // clean up
  delete this.tasks;
  delete this.procs;
  delete this.clouds;

  // storage for parsed settings
  this.tasks = [];
  this.procs = [];
  this.clouds = [];

  // populate task runners
  this._tasks.forEach(function (rawTask) {
    var task = new TaskRunner(self, rawTask);
    self.tasks.push(task);
  });

  this._procs.forEach(function (rawProc) {
    var proc = new ProcRunner(self, rawProc);
    self.procs.push(proc);
  });

  return this;
};

function addType (project, type) {
  return function add (name) {
    return project.set(type, name);;
  }
}

function elementFilter (name) {
  return function filter (spec) {
    return spec.name === name;
  }
}

function runnerFilter (name) {
  return function filter (spec) {
    return spec.subject.name === name;
  }
}
