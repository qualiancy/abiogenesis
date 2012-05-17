var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , chaiTimers = require('chai-timers')
  , chaiPid = require('./helpers/pid')
  , should = chai.should()

chai.use(chaiSpies);
chai.use(chaiTimers);
chai.use(chaiPid);

var Proc = require('../lib/mist/elements/proc')
  , NodeProcess = require('../lib/mist/runners/process/node');

describe('Node Process', function () {
  var proc_raw = new Proc('test');
  proc_raw
    .file('./fixtures/nodeProc.js')
    .cwd(__dirname);

  it('can start', function (done) {
    var proc = new NodeProcess(proc_raw)
      , timer = new chai.Timer()
      , spy = chai.spy(function () {
          timer.start();
          proc.prog.pid.should.be.alive;
          proc.state.should.equal(1);
        });


    proc.on('start', spy);
    proc.on('stdout', function (data) {
      timer.stop();
      timer.elapsed.should.be.above(90);
      spy.should.have.been.called.once;
      data.toString().should.equal('hello universe\n');
      proc.state.should.equal(1);
      done();
    });

    proc.state.should.equal(0);
    proc.start();
  });

  it('can stop');
  it('can restart');
});
