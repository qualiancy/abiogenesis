var chai = require('chai')
  , should = chai.should();

var _ = require('../lib/mist/utils');

describe('utils', function () {

  describe('topological sorting', function () {

    it('can successfully sort a dependancy list', function () {
      // for x, y :: x must complete before y can start
      var edges = [
          [ 'one', 'three' ]
        , [ 'two', 'four' ]
        , [ 'one', 'two' ]
        , [ 'three', 'four' ]
      ];

      _.tsort(edges).should.eql([ 'one', 'two', 'three', 'four' ]);
    });

    it('will throw error for cycled dependancy list', function () {
      var edges = [
          [ 'one', 'three' ]
        , [ 'two', 'four' ]
        , [ 'one', 'two' ]
        , [ 'four', 'one' ]
      ];

      (function () {
        _.tsort(edges);
      }).should.throw(/^four can not come before one$/);
    });

  });

});
