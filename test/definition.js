var chai = require('chai')
  , abiogenesis = require('..');

var should = chai.should();

var Definition = abiogenesis.Definition;

describe('Definition', function () {

  it('can be constructed', function () {
    var def = new Definition('test');
    def.should.have.deep.property('_opts.name', 'test');
    def.should.have.deep.property('_opts.type', 'definition');
    def.should.have.property('_requires').an('array');
    def.should.have.property('_context', null);
  });

  it('can be extended', function () {
    var Task = Definition.extend('task', {
        action: function () {
          this.__action = true;
        }
    });

    console.log(Task.prototype);
    var def = new Task('build');
    def.should.have.deep.property('_opts.name', 'build');
    def.should.have.deep.property('_opts.type', 'task');
    def.should.have.property('_requires').an('array');
    def.should.have.property('_context', null);
    def.should.respondTo('action');
    def.action();
    def.should.have.property('__action', true);
  });

  describe('requirements', function () {

    it('can be defined singularly', function () {
      var def = new Definition('test 1')
        , req = new Definition('test 2');
      def.should.respondTo('requires');
      def.requires(req);
      def._requires.should.include(req);
    });

    it('can be defined as an array', function () {
      var def = new Definition('one')
        , req1 = new Definition('req1')
        , req2 = new Definition('req2');
      def.should.respondTo('requires');
      def.requires([ req1, req2 ]);
      def._requires.should.include(req1, req2);
    });

    it('can be defined as arguments', function () {
      var def = new Definition('one')
        , req1 = new Definition('req1')
        , req2 = new Definition('req2');
      def.should.respondTo('requires');
      def.requires(req1, req2);
      def._requires.should.include(req1, req2);
    });

  });

});
