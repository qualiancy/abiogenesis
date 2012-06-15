/*!
 * abiogenesis - Runnable Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var breeze = require('breeze')
  , Drip = require('drip')
  , inherits = require('super')
  , Sol = require('sol');

/*!
 * Internal Dependancies
 */

var tsort = require('./tsort');

/*!
 * Module Export
 */

module.exports = Runnable;

function Runnable (runner, definition) {
  Drip.call(this, { delimeter: ':' });
  this.requires = new Sol();
  this.definition = definition;
  this.runner = runner;
}

inherits(Runnable, Drip);

Runnable.prototype.getDependancies = function () {
  var self = this
    , edges = []
    , name = makeKey(this.definition)
    , requires = this.definition._requires
    , runner = this.runner;

  function resetRequires (key) {
    var dep = runner.get(key);
    self.requires.set(key, dep);
  }

  edges.push([ null, name ]);
  requires.each(depEach(runner, edges, name));
  this.requires.flush();
  tsort(edges).forEach(resetRequires);
  return this.requires.clone();
};

Runnable.prototype.run = function (cb) {
  var self = this
    , runner = this.runner
    , keys = this.getDependancies().keys;
  breeze.forEachSeries(keys, function (key, next) {
    var def = runner.get(key)
      , type = def._def.type
      , action = runner._types.get(type).action;
    runner.emit([ type, 'pre' ], def);
    action(def, function done (err) {
      if (err) {
        runner.emit([ type, 'error' ], err, def);
        next(err);
      } else {
        runner.emit([ type, 'post' ], def);
        next();
      }
    });
  }, cb);
};

function depEach (runner, edges, name) {
  return function (dep, key) {
    if (runner.has(key)) {
      edges.push([ key, name ]);
      getDeps(runner, edges, name, dep);
    }
  }
}

function getDeps (runner, edges, name, def) {
  def._requires.each(depEach(runner, edges, name));
}

function makeKey (definition) {
  return '/'
    + definition._def.type + '/'
    + definition._def.name;
}
