var Drip = require('drip')
  , mist = require('../../mist')
  , help = [];

/*!
 * Quick implementation for console coloring.
 *
 * @api private
 */

var colors = {
    'red': '\u001b[31m'
  , 'green': '\u001b[32m'
  , 'yellow': '\u001b[33m'
  , 'blue': '\u001b[34m'
  , 'magenta': '\u001b[35m'
  , 'cyan': '\u001b[36m'
  , 'gray': '\u001b[90m'
  , 'reset': '\u001b[0m'
};

Object.keys(colors).forEach(function (color) {
  Object.defineProperty(String.prototype, color, {
    get: function () { return colors[color] + this + colors['reset']; }
  });
});

/*!
 * Create our event driven CLI
 */

cli = new Drip({ delimeter: ' ' })

/**
 * Helper for registering help topics
 */

cli.register = function (_help) {
  help.push(_help);
};

/**
 * Display the help info
 */

cli.on('help', function (args) {
  function l (s) {
    console.log('  ' + s);
  }

  function pad (str, width) {
    return Array(width - str.length).join(' ') + str;
  }

  function padA (str, width) {
    return str + Array(width - str.length).join(' ');
  }

  l('');
  l('Usage: '.gray
    + 'mist '
    + 'COMMAND '.blue
    + '[--app APP] '.green
    + '[command-specific-arguments]'.gray);
  l('');

  help.forEach(function (c) {
    l(padA(c.name, 12).blue + '# '.gray + c.description);
  });
  l('');
  process.exit();
});

cli.on('--version', function () {
  console.log(mist.version);
});

/**
 * Load our commands
 */

require('./ls');

/*!
 * Main exports
 */

module.exports = function (command, args) {
  // if no command, check for basics
  if (command.length == 0) {
    if (args.v || args.version) command.push('--version');
  }

  if (command.length == 0) console.log('Try `help` option.');
  cli.emit(command, args);
};
