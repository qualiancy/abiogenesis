var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , chaiTimers = require('chai-timers')
  , chaiPid = require('./helpers/pid')
  , should = chai.should()

chai.use(chaiSpies);
chai.use(chaiTimers);
chai.use(chaiPid);

var Proc = require('../lib/abiogenesis/elements/proc')
  , ExecProcess = require('../lib/abiogenesis/runners/process/exec');

describe('Node Process', function () {
  var proc_raw = new Proc('test')
    , proc = new ExecProcess(proc_raw);

  proc_raw
    .file('./fixtures/execProc.js')
    .cwd(__dirname);

  function checkAlive (ev, done) {
    var timer = new chai.Timer()
      , spy = chai.spy(function () {
          timer.start();
          proc.prog.pid.should.be.alive;
          proc.state.should.equal(1);
        });

    proc.once(ev, spy);
    proc.once('stdout', function (data) {
      timer.stop();
      timer.elapsed.should.be.above(90);
      spy.should.have.been.called.once;
      data.toString().should.equal('hello universe\n');
      proc.state.should.equal(1);
      done();
    });
  }

  it('can start', function (done) {
    checkAlive('start', done);
    proc.state.should.equal(0);
    proc.start();
  });

  it('can restart', function (done) {
    var pid = proc.prog.pid
    pid.should.be.alive;
    checkAlive('restart', done);
    process.kill(proc.prog.pid, 'SIGHUP');
    setTimeout(function () {
      pid.should.not.be.alive;
    }, 30);
  });

  it('can stop', function (done) {
    var pid = proc.prog.pid;
    pid.should.be.alive;
    proc.once('exit', function (code) {
      should.not.exist(proc.prog);
      pid.should.be.not.be.alive;
      done();
    });
    proc.stop();
  });
});
