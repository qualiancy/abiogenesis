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

TaskRunner.prototype.fullRun = function (cb) {

};

TaskRunner.prototype.run = function (cb) {

};

function runTask (name, cb) {
  var task = this.project.get('task')
    , action = task.opts.action;
  if (action.length < 2) {
    action(null);
    cb();
  } else if (action.length == 2) {
    action(null, function done () {
      cb();
    });
  }
}
