var chai = require('chai')
  , abiogenesis = require('..');

var should = chai.should();

var Definition = abiogenesis.Definition;

describe('Definition', function () {

  it('can be constructed', function () {
    var def = new Definition('test', 'tester');
    def.should.have.deep.property('_def.name', 'tester');
    def.should.have.deep.property('_def.type', 'test');
    def.should.have.property('_requires').an('array');
  });

  describe('requirements', function () {

    it('can be defined singularly', function () {
      var def = new Definition('test', 'tester')
        , req = new Definition('test', 'required');
      def.should.respondTo('requires');
      def.requires(req);
      def._requires.should.include(req);
    });

    it('can be defined as an array', function () {
      var def = new Definition('test', 'one')
        , req1 = new Definition('test', 'req1')
        , req2 = new Definition('test', 'req2');
      def.should.respondTo('requires');
      def.requires([ req1, req2 ]);
      def._requires.should.include(req1, req2);
    });

    it('can be defined as arguments', function () {
      var def = new Definition('test', 'one')
        , req1 = new Definition('test', 'req1')
        , req2 = new Definition('test', 'req2');
      def.should.respondTo('requires');
      def.requires(req1, req2);
      def._requires.should.include(req1, req2);
    });

  });

});
