var chai = require('chai')
  , chaiSpies = require('chai-spies')
  , should = chai.should();

chai.use(chaiSpies);

var abiogenesis = require('..')
  , Context = abiogenesis.Context
  , Definition = abiogenesis.Definition
  , Runner = abiogenesis.Runner;

describe('Context', function () {

  describe('contruction', function () {

    it('can be constructed', function () {
      var base = new Context('base');
      base.should.have.deep.property('_opts.name', 'base');
      base.should.have.deep.property('_opts.type', 'context');
      base.should.have.property('_runner', null);
      base.should.have.property('_contexts').an('array');
      base.should.have.property('_definitions').an('array');
    });

    it('can be extended', function () {
      var Base = Context.extend('base')
        , base = new Base('extended');
      base.should.have.deep.property('_opts.name', 'extended');
      base.should.have.deep.property('_opts.type', 'base');
      base.should.have.property('_runner', null);
      base.should.have.property('_contexts').an('array');
      base.should.have.property('_definitions').an('array');
    });

    it('has an id', function () {
      var base = new Context('base');
      base.should.have.property('id', '/context/base');
      var Suite = Context.extend('suite')
        , suite = new Suite('base');
      suite.should.have.property('id', '/suite/base');
    });

  });

  describe('without runner', function () {
    integration(false);
  });

  describe('with runner', function () {
    integration(true);

    describe('running', function () {

      describe('single level context', function () {

        it('can run successfully', function (done) {
          var runner = new Runner({ strategy: 'series' })
            , base = new Context('base', { runner: runner })
            , def1 = new Definition('thing 1')
            , def2a = new Definition('thing 2a')
            , def2b = new Definition('thing 2b').requires(def2a);

          var iterator = chai.spy(function (def, next) {
            setTimeout(next, 100);
          });

          runner.register(Definition, iterator);
          runner.push(def2a);
          base.push(def1);
          base.push(def2b);

          runner.runContext('context', 'base', function (err) {
            should.not.exist(err);
            iterator.should.have.been.called.exactly(3);
            done();
          });
        });

        it('can bail on error', function (done) {
          var runner = new Runner({ strategy: 'series' })
            , base = new Context('base', { runner: runner })
            , def1 = new Definition('thing 1')
            , def2a = new Definition('thing 2a')
            , def2b = new Definition('thing 2b').requires(def2a);

          var iterator = chai.spy(function (def, next) {
            setTimeout(function () {
              if (def._opts.name === 'thing 2a') return next('err');
              next();
            }, 100);
          });

          runner.register(Definition, iterator);
          runner.push(def2a);
          base.push(def1);
          base.push(def2b);

          runner.runContext('context', 'base', function (err) {
            should.exist(err);
            err.should.equal('err');
            iterator.should.have.been.called.lt(3);
            done();
          });
        });

      });
    });
  });

});

function integration (useRunner) {

  it('can nest indefinitely', function () {
    Context.should.respondTo('push');
    var runner = useRunner ? new Runner() : null
      , base = new Context('base', { runner: runner })
      , suite = new Context('suite')
      , subsuite = new Context('subsuite')
      , subsuite2 = new Context('subsuite2');

    base.push(suite);
    base._contexts.should.include(suite);
    suite._parent.should.deep.equal(base);

    suite.push(subsuite);
    suite._contexts.should.include(subsuite);
    subsuite._parent.should.deep.equal(suite);

    suite.push(subsuite2);
    suite._contexts.should.include(subsuite2);
    subsuite2._parent.should.deep.equal(suite);

    if (runner) {
      runner._contexts.should.include(base);
      runner._contexts.should.include(suite);
      runner._contexts.should.include(subsuite);
      runner._contexts.should.include(subsuite2);
      subsuite2.runner.should.deep.equal(runner);
    }
  });

  it('can add definitions', function () {
    Context.should.respondTo('push');
    var runner = useRunner ? new Runner() : null
      , definition = new Definition('test')
      , base = new Context('base', { runner: runner });

    if (runner)
      runner.register(Definition, function () {});

    base.push(definition);
    base._definitions.should.include(definition);

    if (runner)
      runner._definitions.should.include(definition);
  });

  if (!useRunner) {
    it('can be pushed to a runner', function () {
      var runner = new Runner()
        , definition = new Definition('test')
        , base = new Context('base')
        , suite = new Context('suite');

      runner.register(Definition, function () {});

      base.push(suite);
      suite.push(definition);

      runner.push(base);
      runner._contexts.should.include(base, suite);
      runner._definitions.should.include(definition);

      var def = new Definition('test 2');
      base.push(def);
      runner._definitions.should.include(def);
    });

    it('can be assigned a runner', function () {
      var runner = new Runner()
        , definition = new Definition('test')
        , base = new Context('base')
        , suite = new Context('suite');

      runner.register(Definition, function () {});

      base.push(suite);
      suite.push(definition);

      base.runner = runner;
      base.runner.should.deep.equal(runner);
      runner._contexts.should.include(base, suite);
      runner._definitions.should.include(definition);

      var def = new Definition('test 2');
      base.push(def);
      runner._definitions.should.include(def);
    });
  }

}
