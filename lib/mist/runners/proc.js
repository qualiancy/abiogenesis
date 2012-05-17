var spawn = require('child_process').spawn
  , util = require('util');

var BaseRunner = require('./base')
  , Type = {
        balancer: require('./process/balancer')
      , server: require('./process/server')
      , node: require('./process/node')
    };

module.exports = ProcRunner;

/**
 * # ProcRunner
 *
 * @param {Object} mist constructed project
 * @param {Object} mist process definition
 * @extends BaseRunner
 * @api private
 */

function ProcRunner (project, proc) {
  BaseRunner.call(this, project, proc);
}

util.inherits(ProcRunner, BaseRunner);

ProcRunner.prototype.run = function (cb) {
  var self = this
    , queue = this.preQueue.slice(0);
  this.runTaskQueue(queue, function (err) {
    if (err) return cb(err);
    self.startProcess();
  });
};

ProcRunner.prototype.startProcess = function () {
  this.state = 2;
  startProcess.call(this);
};
