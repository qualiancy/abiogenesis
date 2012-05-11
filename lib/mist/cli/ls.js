
cli.register({
    name: 'ls'
  , description: 'list mistfile resources'
  , options: {
      '-f, --f [Mistfile]': 'Specify a custom Mistfile.'
    }
});


cli.on('ls', display);

function display (args) {
  var Project = require('../project')
    , quantum = require('quantum')
    , log = quantum('mist-ls');

  log
    .use(quantum.console())
    .start();

  log.info('Welcome to Mist');
  log.info('Success if it ends with Mist:ok');
  log.info('');

  var file = args.cwd + '/Mistfile'
    , display = [ 'procs', 'tasks', 'clouds' ]
    , project = Project.fromMistfile(file);

  display.forEach(function (name) {
    log.info(name + ':');
    project['_' + name].forEach(function (spec) {
      log.info('  ' + spec.name);
    });
    log.info('');
  });

  log.info('Mist:ok');
}
