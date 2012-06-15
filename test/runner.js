var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , chaiTimers = require('chai-timers')
  , abiogenesis = require('..');

chai.use(chaiSpies);
chai.use(chaiTimers);

var should = chai.should();

var Definition = abiogenesis.Definition
  , Runner = abiogenesis.Runner;

describe('Runner', function () {

  describe('construction', function () {

    it('can be constructed independantly', function () {
      var runner = new Runner();
      runner.should.have.property('_types').an('object');
      runner.should.have.property('_definitions').an('object');
    });

    it('can be extended', function () {
      var Task = Runner.extend({
        isTask: function () {
          return true;
        }
      });

      var task = new Task();
      task.should.be.instanceof(Task);
      task.should.be.instanceof(Runner);
    });

    it('will call initialize on construction', function () {
      var Task = Runner.extend({
        initialize: function (val) {
          this._init = val;
        }
      });

      var task = new Task(true);
      task.should.have.property('_init', true);
    });

    it('can autobind events', function () {
      var Tasks = Runner.extend({
          events: {
              'test::single': 'singleTest'
            , 'test::multi': [ 'multiTest1', 'multiTest2' ]
          }
        , initialize: function () {
            this._single = 0;
            this._multi = 0;
          }
        , singleTest: function () {
            this._single++;
          }
        , multiTest1: function () {
            this._multi++;
          }
        , multiTest2: function () {
            this._multi++;
          }
      });

      var tasks = new Tasks();
      tasks.should.have.property('_single', 0);
      tasks.should.have.property('_multi', 0);
      tasks.emit([ 'test', 'single' ]);
      tasks.should.have.property('_single', 1);
      tasks.emit([ 'test', 'multi' ]);
      tasks.should.have.property('_multi', 2);
    });

  });

  describe('define flow', function () {
    var runner;

    before(function () {
      runner = new Runner();
    });

    it('can use a protoype of definition / runnable pair', function () {
      var spy = chai.spy();
      runner.use('pair', Definition, spy);
      runner._types.should.have.property('pair')
        .to.deep.equal({ definition: Definition, action: spy });
    });

    it('can create a definition', function () {
      var defspy = chai.spy();
      runner.on([ 'pair', 'add' ], defspy);
      var def1 = runner.define('pair', 'def 1');
      def1.should.be.instanceof(Definition);
      runner._definitions.should.have.property('/pair/def 1')
        .deep.equal(def1);
      defspy.should.have.been.called.once;
    });

    it('cannot recreate an already existing definition', function () {
      (function () {
        var defErr = runner.define('pair', 'def 1');
      }).should.throw('pair named `def 1` already defined');
    });

    it('cannot create a definition for a non-existent pair', function () {
      (function () {
        var defErr = runner.define('not here', 'def 1');
      }).should.throw('no definition for type `not here`');
    });

  });

  describe('execution flow', function () {

    it('can run a suite of dependant things', function (done) {
      var runner = new Runner()
        , Thing1 = Definition.extend()
        , Thing2 = Definition.extend()
        , iterator1 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing1);
            def.should.not.be.instanceof(Thing2);
            next.should.be.a('function');
            setTimeout(next, 10);
          })
        , iterator2 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing2);
            def.should.not.be.instanceof(Thing1);
            next.should.be.a('function');
            setTimeout(next, 10);
          });

      runner.use('thing1', Thing1, iterator1);
      runner.use('thing2', Thing2, iterator2);

      var thing1a = runner.define('thing1', 'a')
        , thing1b = runner.define('thing1', 'b')
            .requires(thing1a)
        , thing2a = runner.define('thing2', 'a')
            .requires(thing1b)
        , thing2b = runner.define('thing2', 'b')
            .requires(thing2a);

      runner.run('thing2', 'b', function (err) {
        should.not.exist(err);
        iterator1.should.have.been.called.twice;
        iterator2.should.have.been.called.twice;
        done();
      });

    });

    it('will bail of an error occurs', function (done) {
      var runner = new Runner()
        , Thing1 = Definition.extend()
        , Thing2 = Definition.extend()
        , iterator1 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing1);
            def.should.not.be.instanceof(Thing2);
            next.should.be.a('function');
            setTimeout(function () {
              if (def._def.name == 'b') return next('err');
              next();
            }, 10);
          })
        , iterator2 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing2);
            def.should.not.be.instanceof(Thing1);
            next.should.be.a('function');
            setTimeout(next, 10);
          });

      runner.use('thing1', Thing1, iterator1);
      runner.use('thing2', Thing2, iterator2);

      var thing1a = runner.define('thing1', 'a')
        , thing1b = runner.define('thing1', 'b')
            .requires(thing1a)
        , thing2a = runner.define('thing2', 'a')
            .requires(thing1b)
        , thing2b = runner.define('thing2', 'b')
            .requires(thing2a);

      runner.run('thing2', 'b', function (err) {
        should.exist(err);
        err.should.equal('err');
        iterator1.should.have.been.called.twice;
        iterator2.should.have.not.been.called();
        done();
      });

    });

  });

});
