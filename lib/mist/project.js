var Drip = require('drip')
  , util = require('util');

var Task = require('./elements/task')
  , Proc = require('./elements/proc')
  , Cloud = require('./elements/cloud');

module.exports = Project;

function Project (spec) {
  Drip.call(this, { delimeter: ':' });

  // storage for settings
  this._procs = [];
  this._tasks = [];
  this._clouds = [];
}

util.inherits(Project, Drip);

Project.fromMistfile = function (file) {
  var project = new this();
  delete require.cache[file];
  global.proc = project.addProc.bind(project);
  global.task = project.addTask.bind(project);
  global.cloud = project.addCloud.bind(project);
  require(file);
  confirmSane(project);
  return project;
};


Project.prototype.addTask = function (name) {
  var task = new Task(name);
  this._tasks.push(task);
  this.emit([ 'task', 'add' ], task);
  return task;
};

Project.prototype.addProc = function (name) {
  var proc = new Proc(name);
  this._procs.push(proc);
  this.emit([ 'process', 'add' ], proc);
  return proc;
};

Project.prototype.addCloud = function (name) {
  var cloud = new Cloud(name);
  this._clouds.push(cloud);
  this.emit([ 'cloud', 'add' ], cloud);
  return cloud;
};

Project.prototype.startProc = function (name, cb) {
  var proc = this._procs[name];
  if (!proc) return cb(new Error('Proc not defined'));
};

function confirmSane (project) {
  var tasks = [];
  for (var tname in project._tasks)
    tasks.push(tname);

  for (var pname in project._procs) {
    var proc = project._procs[pname];
    if (Array.isArray(proc.tasks)) {
      proc.tasks.forEach(function (task) {
        if (!~tasks.indexOf(task)) {
          throw new Error('Proc `' + pname + '` referencing undefined task');
        }
      });
    }
  }

  for (var cname in project._clouds) {
    var cloud = project._clouds[cname];
    if (Array.isArray(proc.tasks)) {
      cloud.tasks.forEach(function (task) {
        if (!~tasks.indexOf(task)) {
          throw new Error('Cloud `' + cname + '` referencing undefined task');
        }
      });
    }
  }
};
