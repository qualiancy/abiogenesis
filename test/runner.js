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

  it('can use a definition / runnable pair', function () {
    var runner = new Runner();
    runner.use('pair', Definition, Runnable);
    runner._types.get('pair').should.be.an('object')
      .to.deep.equal({ definition: Definition, runnable: Runnable });
  });

});
