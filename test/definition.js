var should = chai.should();

if (!Sol) var Sol = require('sol');

var Definition = abiogenesis.Definition;

describe('Definition', function () {

  it('can be constructed', function () {
    var def = new Definition('tester', 'test');
    def.should.have.property('_name', 'tester');
    def.should.have.property('_type', 'test');
    def.should.have.property('_requires')
      .an.instanceof(Sol);
    def.should.have.property('_attrs')
      .an.instanceof(Sol);
  });

  it('can define requirements', function () {
    var def = new Definition('tester', 'test')
      , req = new Definition('required', 'test');
    def.should.respondTo('requires');
    def.requires(req);
    should.exist(def._requires.get('test/required'));
    def._requires.get('test/required').should.deep.equal(req);
  });

});
