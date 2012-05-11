var chai = require('chai')
  , should = chai.should();

var mist = require('..');

describe('Project', function () {

  it('can create a project from a mistfile', function () {
    var file = __dirname + '/fixtures/Mistfile'
      , project = mist.Project.fromMistfile(file);
    project.should.be.instanceof(mist.Project);
    project.should.have.property('_procs')
      .with.keys('web', 'queue::urgent');
    project.should.have.property('_tasks')
      .with.keys('build::assets', 'build::clean', 'sync');
    project.should.have.property('_deploys')
      .with.keys('staging::integration');
  });

});
