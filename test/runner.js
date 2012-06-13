var chai = require('chai')
  , abiogenesis = require('..')
  , Sol = require('sol');

var should = chai.should();

var Definition = abiogenesis.Definition
  , Runnable = abiogenesis.Runnable
  , Runner = abiogenesis.Runner;

describe('Runner', function () {

  it('can be constructed', function () {
    var runner = new Runner();
    runner.should.have.property('_types')
      .an.instanceof(Sol);
    runner.should.have.property('_definitions')
      .an.instanceof(Sol);
    runner.should.have.property('_runnables')
      .an.instanceof(Sol);
  });

  describe('workflow', function () {
    var runner;

    before(function () {
      runner = new Runner();
    });

    it('can use a protoype of definition / runnable pair', function () {
      runner.use('pair', Definition, Runnable);
      runner._types.get('pair').should.be.an('object')
        .to.deep.equal({ definition: Definition, runnable: Runnable });
    });

    it('can create a definition', function () {
      var def1 = runner.define('pair', 'def 1');
      def1.should.be.instanceof(Definition);
      runner._definitions.has('pair/def 1').should.be.true;
    });

    it('can determine if a definition already exists', function () {
      runner.should.respondTo('has');
      runner.has('pair', 'def 1').should.be.true;
      runner.has('pair', 'def 2').should.be.false;
      runner.has('nonpair', 'def 1').should.be.false;
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

    it('can get an existing definition', function () {
      runner.should.respondTo('get');
      runner.get('pair', 'def 1').should.be.instanceof(Definition);
      should.not.exist(runner.get('pair', 'def 2'));
    });

  });

});
