var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , chaiTimers = require('chai-timers')
  , should = chai.should();

chai.use(chaiTimers);
chai.use(chaiSpies);

var mist = require('..')
  , Task = require('../lib/mist/elements/task')
  , TaskRunner = require('../lib/mist/runners/task');

describe('Tasks', function () {
  var project = new mist.Project()
    , task
    , timerTesting = new chai.Timer('testing')
    , timerTestingDep = new chai.Timer('testing::2')
    , runTesting = chai.spy(function (log, done) {
        timerTesting.start();
        setTimeout(function () {
          timerTesting.stop();
          done();
        }, 30);
      })
    , runTestingDep = chai.spy(function (log, done) {
        timerTestingDep.start();
        setTimeout(function () {
          timerTestingDep.stop();
          done();
        }, 30);
      });

  it('can be added to a project', function () {
    task = project.set('task', 'testing');
    task.should.be.instanceof(Task);
    task.name.should.equal('testing');
  });

  it('can modify a tasks specs', function () {
    task.should.respondTo('pre');
    task.should.respondTo('post');
    task.should.respondTo('action');
    task.action(runTesting);

    var task2 = project.set('task', 'testing::2');
    task.pre('testing::2');
    task2.action(runTestingDep);
  });

  it('can be asserted as existing in a project', function () {
    project.has('task', 'testing').should.be.true;
    project.has('task', 'testing::2').should.be.true;
    project.has('task', 'testing::3').should.be.false;
  });

  it('can be retrieved from a project', function () {
    var taskTesting = project.get('task', 'testing');
    taskTesting.should.eql(task);
    taskTesting.opts.action.should.be.a('function');
  });

  it('can be be refreshed into a runner', function () {
    project.tasks.should.be.an('array');
    project.tasks.should.have.length(0);
    project.refresh();
    project.tasks.should.have.length(2);
    project.tasks[0].should.be.instanceof(TaskRunner);
    runTesting.should.have.not.been.called();
    runTestingDep.should.have.not.been.called();
  });

  describe('Task Runner', function () {
    var runner;

    before(function () {
      runner = project.tasks.filter(function (t) {
        return t.subject.name == 'testing' ? true : false;
      })[0];
    });

    it('can parse dependancies', function () {
      runner.should.be.instanceof(TaskRunner);
      runner.preQueue.should.be.an('array')
        .with.length(1);
      runner.preQueue[0].should.be.a('string')
        .equal('testing::2');
    });

    it('can run a task queue', function (done) {
      runner.run(function (err) {
        should.not.exist(err);
        runTesting.should.have.been.called.once;
        runTestingDep.should.have.been.called.once;
        timerTesting.elapsed.should.be.above(25);
        timerTestingDep.elapsed.should.be.above(25);
        timerTesting.should.have.started.after(timerTestingDep);
        done();
      });
    });

  });
});
