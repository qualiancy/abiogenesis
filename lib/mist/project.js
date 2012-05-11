var Drip = require('drip')
  , util = require('util');

module.exports = Project;

function Project (spec) {
  Drip.call(this, { delimeter: ':' });
  this._procs = {};
  this._tasks = {};
  this._deploys = {};
}

util.inherits(Project, Drip);

Project.fromMistfile = function (file) {
  var project = new this();
  delete require.cache[file];
  global.proc = project.addProc.bind(project);
  global.task = project.addTask.bind(project);
  global.deploy = project.addDeploy.bind(project);
  require(file);
  confirmSane(project);
  return project;
};

Project.prototype.addProc = function (name, spec) {
  this._procs[name] = spec;
  this.emit([ 'process', 'add' ], name, spec);
};

Project.prototype.addTask = function (name, cb) {
  this._tasks[name] = cb;
  this.emit([ 'task', 'add' ], name, cb);
};

Project.prototype.addDeploy = function (name, spec) {
  this._deploys[name] = spec;
  this.emit([ 'deploy', 'add' ], name, spec);
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

  for (var dname in project._deploys) {
    var deploy = project._deploys[dname];
    if (Array.isArray(proc.tasks)) {
      deploy.tasks.forEach(function (task) {
        if (!~tasks.indexOf(task)) {
          throw new Error('Deploy `' + dname + '` referencing undefined task');
        }
      });
    }
  }
};
