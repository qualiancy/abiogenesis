var spawn = require('child_process').spawn
  , util = require('util');

var BaseRunner = require('./base')
  , Type = {
        balancer: require('./process/balancer')
      , server: require('./process/server')
      , exec: require('./process/exec')
    };

var events = [
    'start'
  , 'restart'
  , 'exit'
  , 'error'
  , 'stdout'
  , 'stdin'
];

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
  var type = this.subject.opts.type;
  this._process = new Type[type](this.subject);
  events.forEach(proxyListeners.bind(this));
}

util.inherits(ProcRunner, BaseRunner);

ProcRunner.prototype.run = function (cb) {
  var self = this
    , queue = this.preQueue.slice(0);

  cb = cb || function () {};

  this.runTaskQueue(queue, function (err) {
    if (err) return cb(err);
    self._process.start();
    cb(null);
  });
};

ProcRunner.prototype.stop = function (cb) {
  var self = this
    , queue = this.postQueue.slice(0);

  cb = cb || function () {};

  // TODO: should be in callback of process stop
  this._process.once('exit', function () {
    self.runTaskQueue(queue, function (err) {
      if (err) return cb(err);
      cb(null)
    });
  });

  this._process.stop();
};

function proxyListeners (ev) {
  var self = this;
  this._process.on(ev, function () {
    var args = Array.prototype.slice.call(arguments, 0)
      , res = [ [ 'process', ev ] ].concat(args);
    self.emit.apply(self, res);
  });
}
