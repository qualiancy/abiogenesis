var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , chaiTimers = require('chai-timers')
  , chaiPid = require('./helpers/pid')
  , should = chai.should();

chai.use(chaiTimers);
chai.use(chaiSpies);
chai.use(chaiPid);

var abiogenesis = require('..')
  , Proc = require('../lib/abiogenesis/elements/proc')
  , ProcRunner = require('../lib/abiogenesis/runners/proc');

describe('Processes', function () {
  var project
    , proc;

  before(function () {
    project = new abiogenesis.Project();
  });

  it('can be added to a project', function () {
    proc = project.set('proc', 'testing');
    proc.should.be.instanceof(Proc);
    proc.name.should.equal('testing');
  });

  it('can modify a procs specs', function () {
    var rts = [
        'type'
      , 'file'
      , 'cmd'
      , 'host'
      , 'workers'
      , 'env'
      , 'args'
      , 'cwd'
      , 'pre'
      , 'post'
      , 'waitFor'
    ];

    rts.forEach(function (rt) {
      proc.should.respondTo(rt);
    });
  });

  it('can be asserted as existing in the project', function () {
    project.has('proc', 'testing').should.be.true;
    project.has('proc', 'testing::2').should.be.false;
  });

  it('can be retrieved from a project', function () {
    var procTesting = project.get('proc', 'testing');
    procTesting.should.deep.equal(proc);
  });

  it('can be refreshed into a runner', function () {
    project.procs.should.be.an('array');
    project.procs.should.have.length(0);
    project.refresh();
    project.procs.should.have.length(1);
    project.procs[0].should.be.instanceof(ProcRunner);
  });

  describe('Proc Runner', function () {
    var runner1
      , runner2
      , taskTimer
      , taskAction;

    function checkAlive (runner, ev, done) {
      var timer = new chai.Timer()
        , spy = chai.spy(function () {
            timer.start();
            runner._process.prog.pid.should.be.alive;
            runner._process.state.should.equal(1);
          });

      runner.once([ 'process', ev ], spy);
      runner.once([ 'process', 'stdout' ], function (data) {
        timer.stop();
        timer.elapsed.should.be.above(90);
        spy.should.have.been.called.once;
        data.toString().should.equal('hello universe\n');
        runner._process.state.should.equal(1);
        done();
      });
    }

    before(function () {
      taskTimer = new chai.Timer('task');
      taskAction = chai.spy(function (done) {
        taskTimer.start();
        setTimeout(function () {
          taskTimer.stop();
          setTimeout(done, 1);
        }, 30);
      });

      project
        .set('task', 'task::1')
        .action(taskAction);

      proc
        .pre('task::1')
        .cwd(__dirname)
        .file('./fixtures/execProc.js');

      project
        .set('proc', 'testing::2')
        .cwd(__dirname)
        .file('./fixtures/execProc.js')
        .waitFor('testing');

      project.refresh();
      runner1 = project.runner('proc', 'testing');
      runner2 = project.runner('proc', 'testing::2');
    });

    after(function (done) {
      // runner1.stop(done);
      //runner2.stop();
      done();
    });

    it('can parse dependancies', function () {
      runner1.should.be.instanceof(ProcRunner);
      runner1.preQueue.should.be.an('array')
        .with.length(1);
      runner1.preQueue[0].should.be.a('string')
        .equal('task::1');
      runner2.should.be.instanceof(ProcRunner);
    });

    it('can run a single proc with task queue', function (done) {
      var rt1 = new chai.Timer('runner :: 1')
        , rt2 = new chai.Timer('runner :: 2')
        , r1Start = chai.spy(function () {
            rt1.start();
            rt1.should.have.started.after(taskTimer, 'stopped');
          });

      runner1.once([ 'process', 'start' ], r1Start);

      checkAlive(runner1, 'start', function () {
        rt1.stop();
        rt1.elapsed.should.be.above('90');
        r1Start.should.have.been.called.once;
        taskAction.should.have.been.called.once;
        runner1.stop();
        done();
      });

      runner1.run();
    });
  });
});
