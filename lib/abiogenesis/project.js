var Drip = require('drip')
  , util = require('util');

var Meta = {
    task: require('./elements/task')
  , proc: require('./elements/proc')
  , cloud: require('./elements/cloud')
}

var TaskRunner = require('./runners/task')
  , ProcRunner = require('./runners/proc');

module.exports = Project;

function Project (spec) {
  Drip.call(this, { delimeter: ':' });

  this.opts = {};

  // storage for raw settings
  this._tasks = [];
  this._procs = [];
  this._clouds = [];

  // storage for parsed settings
  this.tasks = [];
  this.procs = [];
  this.clouds = [];
}

util.inherits(Project, Drip);

Project.fromFile = function (file) {
  var project = new this();
  delete require.cache[file];
  global.task = addType(project, 'task');
  global.proc = addType(project, 'proc');
  global.cloud = addType(project, 'cloud');
  require(file);
  project.opts.file = file;
  project.refresh();
  return project;
};

Project.prototype.set = function (type, name) {
  if (this.has(type, name))
    throw new Error(type + ' named ' + name + ' already defined');
  var spec = new Meta[type](name);
  this['_' + type + 's'].push(spec);
  this.emit([ type, 'add' ], spec);
  return spec;
};

Project.prototype.has = function (type, name) {
  var res = this['_' + type + 's']
    .filter(elementFilter(name));

  return res.length
    ? true
    : false;
};

Project.prototype.get = function (type, name) {
  var res = this['_' + type + 's']
    .filter(elementFilter(name));

  return res.length
    ? res[0]
    : null;
};

Project.prototype.runner = function (type, name) {
  var res = this[type + 's']
    .filter(runnerFilter(name))

  return res.length
    ? res[0]
    : null;
};

Project.prototype.refresh = function () {
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
