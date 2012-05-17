var Drip = require('drip')
  , util = require('util');

var _ = require('../utils');

module.exports = BaseRunner;

function BaseRunner (project, subject) {
  Drip.call(this, { delimeter: ':' });
  this.project = project;
  this.subject = subject;
  this.preQueue = null;
  this.postQueue = null;
  _.parseTaskDeps.call(this);
}

util.inherits(BaseRunner, Drip);

BaseRunner.prototype.runTaskQueue = function (queue, cb) {
  var self = this;

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
  var self = this
    , task = this.project.get('task', name)
    , action = task.opts.action;

  function done (err) {
    if (err) {
      self.emit([ 'task', 'error' ], err, task);
      cb(err);
    } else {
      self.emit([ 'task', 'success' ], task);
      cb(null);
    }
  }

  this.emit([ 'task', 'start' ], task);

  if (action.length < 2) {
    var err = null;
    try { action(null); }
    catch (ex) { err = ex; }
    finish(err);
  } else if (action.length == 2) {
    action(null, done);
  }
}
