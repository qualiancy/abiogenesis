var Drip = require('drip')
  , spawn = require('child_process').spawn
  , util = require('util');

module.exports = NodeProcess;

/**
 * States
 *
 * - `0` - stopped
 * - `1` - started
 * - `2` - starting
 * - `3` - restarting
 */

function NodeProcess (proc) {
  Drip.call(this);
  this.proc = proc; // settings
  this.prog = null; // spawned process
  this.retryOpts = {
      tries: 10
    , attempts: 0
    , thresh: 1000 * 30
    , delay: 100
    , timer: null
  };
  this.state = 0;
}

util.inherits(NodeProcess, Drip);

NodeProcess.prototype.start = function () {
  this.state = 2;
  startProcess.call(this);
};

function startProcess () {
  var self = this
    , firstTry = (this.state === 2)
      ? true
      : false
    , opts = this.proc.opts
    , args = (opts.file + opts.args.join(' ')).split(' ')
    , spawnOpts = {
          cwd: opts.cwd
        , env: {}
      };

  // set up args
  for (var e in process.env)
    spawnOpts.env[e] = process.env[e];
  for (var e in opts.env)
    spawnOpts.env[e] = opts.env[e];
  if (!spawnOpts.env.NODE_ENV)
    spawnOpts.env.NODE_ENV = 'developement';

  // start the process
  this.prog = spawn(opts.cmd, args, spawnOpts);
  this.prog.stdout.on('data', stdoutHandler.bind(this));
  this.prog.stderr.on('data', stderrHandler.bind(this));
  this.prog.on('exit', exitHandler.bind(this));

  this.state = 1;
  this.emit(firstTry ? 'start' : 'restart');
}

function stdoutHandler (data) {
  this.emit('stdout', data);
}

function stderrHandler (data) {
  this.emit('stdout', data);
}

function exitHandler (code) {
  var self = this
    , opts = this.retryOpts
    , retry = (this.state !== 0)
      ? ((opts.attempts < opts.tries)
        ? true
        : false)
      : false;

  delete this.prog;
  if (retry) {
    this.state = 3;
    if (!opts.timer) {
      opts.timer = setTimeout(function () {
        delete opts.timer;
        opts.attempts = 0;
      }, opts.thresh);
    }
    setTimeout(function () {
      opts.attempts++;
      startProcess.call(self);
    }, opts.delay);
  } else {
    this.state = 0;
    if (opts.timer) {
      clearTimeout(opts.timer);
      delete opts.timer;
      this.emit('error', new Error('Max retries exceeded'));
    } else {
      this.emit('exit', code);
    }
  }
}

NodeProcess.prototype.stop = function (sig) {
  if (!this.prog || this.state === 0)
    throw new Error('Can\'t stop a non-running process.');
  sig = sig || 'SIGHUP'
  this.state = 0;
  clearTimeout(this.retryOpts.timer);
  delete this.retryOpts.timer;
  this.prog.kill(sig);
};
