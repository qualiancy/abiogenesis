var util = require('util');

var BaseRunner = require('./base');

module.exports = TaskRunner;

function TaskRunner (project, task) {
  BaseRunner.call(this, project, task);
}

util.inherits(TaskRunner, BaseRunner);

TaskRunner.prototype.run = function (cb) {
  var name = this.subject.name
    , queue = this.preQueue.concat([ name ], this.postQueue);
  this.runTaskQueue(queue, cb);
};
