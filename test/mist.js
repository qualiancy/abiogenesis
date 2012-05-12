var chai = require('chai')
  , should = chai.should();

var mist = require('..');

describe('Project', function () {

  it('can create a project from a mistfile', function () {
    var file = __dirname + '/fixtures/Mistfile'
      , project = mist.Project.fromMistfile(file);
    project.should.be.instanceof(mist.Project);
    project.should.have.property('_tasks')
      .and.be.an('array').with.length(3);
    project.should.have.property('_procs')
      .and.be.an('array').with.length(2);
    project.should.have.property('_clouds')
      .and.be.an('array').with.length(1);
  });

});
