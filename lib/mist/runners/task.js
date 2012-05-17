var Drip = require('drip')
  , util = require('util');

var _ = require('../utils');

module.exports = TaskRunner;

function TaskRunner (project, task) {
  this.project = project;
  this.subject = task;
  this.preQueue = null;
  this.postQueue = null;
  _.parseTaskDeps.call(this);
}

util.inherits(TaskRunner, Drip);

TaskRunner.prototype.run = function (cb) {
  var self = this
    , name = this.subject.name
    , queue = this.preQueue.concat([ name ], this.postQueue);

  function iterate (i) {
    var task = queue[i];
    if (!task) return cb(null);
    runTask.call(self, task, function (err) {
      if (err) return cb(err);
      iterate(++i);
    });
  }

  iterate(0);
};


function runTask (name, cb) {
  var task = this.project.get('task', name)
    , action = task.opts.action;
  this.emit([ 'task', 'start' ], task);
  if (action.length < 2) {
    var err = null;
    try { action(null); }
    catch (ex) { err = ex; }
    if (err) return cb(err);
    cb(null);
  } else if (action.length == 2) {
    action(null, function done (err) {
      cb(err);
    });
  }
}
