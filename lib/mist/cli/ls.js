
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

  var display = [ 'procs', 'tasks', 'clouds' ];
  if (args._.length == 2) {
    if (~display.indexOf(args._[1])) {
      display = [ args._[1] ];
    } else {
      log.warn('Invalid `ls` filter');
      log.warn('Mist:not ok');
      process.exit(1);
    }
  }

  var file = args.cwd + '/Mistfile'
    , project = Project.fromMistfile(file);

  display.forEach(function (name) {
    log.info(name.toUpperCase());
    for (var n in project['_' + name]) {
      log.info('  ' + n);
    }
    log.info('');
  });

  log.info('Mist:ok');
}
