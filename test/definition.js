var chai = require('chai')
  , abiogenesis = require('..')
  , Sol = require('sol');

var should = chai.should();

var Definition = abiogenesis.Definition;

describe('Definition', function () {

  it('can be constructed', function () {
    var def = new Definition('test', 'tester');
    def.should.have.deep.property('_def.name', 'tester');
    def.should.have.deep.property('_def.type', 'test');
    def.should.have.property('_requires').an('array');
  });

  it('can define requirements', function () {
    var def = new Definition('test', 'tester')
      , req = new Definition('test', 'required');
    def.should.respondTo('requires');
    def.requires(req);
    def._requires.should.include(req);
  });

});
