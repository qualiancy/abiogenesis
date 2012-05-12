var Drip = require('drip')
  , util = require('util');

var TaskRunner = require('./runners/task');

module.exports = Project;

function Project (spec) {
  Drip.call(this, { delimeter: ':' });

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

Project.fromMistfile = function (file) {
  var project = new this();
  delete require.cache[file];
  global.task = addType(project, 'task');
  global.proc = addType(project, 'proc');
  global.cloud = addType(project, 'cloud');
  require(file);
  parseSettings.call(project);
  return project;
};

function addType (project, type) {
  var Meta = require('./elements/' + type);
  return function (name) {
    if (project.has(type, name))
      throw new Error(type + ' named ' + name + ' already defined');
    var spec = new Meta(name);
    project.add(type, spec);
    return spec;
  }
}

Project.prototype.add = function (type, spec) {
  this['_' + type + 's'].push(spec);
  this.emit([ type, 'add' ], spec);
}

Project.prototype.has = function (type, name) {
  var has = false;
  this['_' + type + 's'].forEach(function (spec) {
    if (spec.name === name) has = true;
  });
  return has;
};

Project.prototype.get = function (type, name) {
  var res = null;
  this['_' + type + 's'].forEach(function (spec) {
    if (spec.name === name) res = task;
  });
  return res;
};

function parseSettings () {
  var self = this;

  // populate task runners
  this._tasks.forEach(function (rawTask) {
    var task = new TaskRunner(self, rawTask);
    self.tasks.push(task);
  });
  console.log(this.tasks);
}
