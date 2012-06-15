var chai = require('chai')
  , abiogenesis = require('..')
  , Sol = require('sol');

var should = chai.should();

var Definition = abiogenesis.Definition
  , Runnable = abiogenesis.Runnable
  , Runner = abiogenesis.Runner;

describe('Runnable', function () {
  var runner
    , subject;

  before(function () {
    runner = new Runner();
    subject = new Definition('test', 'hello universe');
  });

  it('can be constructed', function () {
    var runnable = new Runnable(runner, subject);
  });

});
