var Context = abiogenesis.Context
  , Definition = abiogenesis.Definition
  , Runner = abiogenesis.Runner;

describe('Runner', function () {

  describe('construction', function () {

    it('can be constructed independantly', function () {
      var runner = new Runner();
      runner.should.have.property('_types').an('object');
      runner.should.have.property('_definitions').an('array');
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
    var runner
      , def
      , Task
      , task;

    before(function () {
      runner = new Runner();
      def = new Definition('def 1')
      Task = Definition.extend('task')
      task = new Task('task 1');
    });

    it('can register a constructor of definition / runnable pair', function () {
      var spy = chai.spy();
      runner.register(Definition, spy);
      runner._types.should.have.property('definition')
        .to.deep.equal({ definition: Definition, action: spy });
    });

    it('can be pushed a definition', function () {
      runner.should.respondTo('push');
      runner.push(def);
      runner.register(Task, chai.spy());
      runner.push(task);
    });

    it('can be pushed a context', function () {
      runner.should.respondTo('push');
      var ctx = new Context();
      runner.push(ctx);
    });

    it('cannot push an already existing definition', function () {
      (function () {
        var defErr = runner.push(def);
      }).should.throw('definition named `def 1` already defined');
    });

    it('cannot push a definition for a non-existent pair', function () {
      var NonTask = Definition.extend('nontask')
        , nontask = new NonTask('nontask');
      (function () {
        var defErr = runner.push(nontask);
      }).should.throw('Absent register for definition of type `nontask`');
    });

  });

  describe('execution flow', function () {

    it('can run a suite of dependant things', function (done) {
      var runner = new Runner()
        , Thing1 = Definition.extend('thing1')
        , Thing2 = Definition.extend('thing2')
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

      runner.register(Thing1, iterator1);
      runner.register(Thing2, iterator2);

      var thing1a = new Thing1('a')
        , thing1b = new Thing1('b').requires(thing1a)
        , thing2a = new Thing2('a').requires(thing1b)
        , thing2b = new Thing2('b').requires(thing2a);

      runner.push(thing1a)
      runner.push(thing1b)
      runner.push(thing2a)
      runner.push(thing2b);

      runner.runDefinition('thing2', 'b', function (err) {
        should.not.exist(err);
        iterator1.should.have.been.called.twice;
        iterator2.should.have.been.called.twice;
        done();
      });

    });

    it('will bail of an error occurs', function (done) {
      var runner = new Runner()
        , Thing1 = Definition.extend('thing1')
        , Thing2 = Definition.extend('thing2')
        , iterator1 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing1);
            def.should.not.be.instanceof(Thing2);
            next.should.be.a('function');
            setTimeout(function () {
              if (def._opts.name == 'b') return next('err');
              next();
            }, 10);
          })
        , iterator2 = chai.spy(function (def, next) {
            def.should.be.instanceof(Thing2);
            def.should.not.be.instanceof(Thing1);
            next.should.be.a('function');
            setTimeout(next, 10);
          });

      runner.register(Thing1, iterator1);
      runner.register(Thing2, iterator2);

      var thing1a = new Thing1('a')
        , thing1b = new Thing1('b')
        , thing2a = new Thing2('a')
        , thing2b = new Thing2('b');

      thing2b.requires(thing2a);
      thing2a.requires(thing1b);
      thing1b.requires(thing1a);

      runner.push(thing1a)
      runner.push(thing1b)
      runner.push(thing2a)
      runner.push(thing2b);

      runner.runDefinition('thing2', 'b', function (err) {
        should.exist(err);
        err.should.equal('err');
        iterator1.should.have.been.called.twice;
        iterator2.should.have.not.been.called();
        done();
      });

    });

    it('will gracefully error if definition does not exist', function (done) {
      var runner = new Runner()
        , Thing1 = Definition.extend('thing1');

      runner.register(Thing1, function (def, next) {
        next();
      });

      var thing1a = new Thing1('a');
      runner.push(thing1a);

      runner.runDefinition('thing1', 'b', function (err) {
        should.exist(err);
        err.should.be.instanceof(Error)
          .and.have.property('message', "Definition `b` of type `thing1` does not exist.");
        done();
      });

    });

  });

});
