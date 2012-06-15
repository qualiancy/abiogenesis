var Drip = require('drip')
  , inherits = require('super')
  , Sol = require('sol');

var tsort = require('./tsort');

module.exports = Runnable;

function Runnable (runner, subject) {
  Drip.call(this, { delimeter: ':' });
  this.runner = runner;
  this.subject = subject;
  this.requires = new Sol();
}

inherits(Runnable, Drip);

Runnable.prototype.runDependancies = function (queue, cb) {
  var self = this;
  cb = cb || function () {};

  function iterate (i) {
    var task = queue[i];
    if (!task) {
      self.emit('success');
      return cb(null);
    }

    runTask.call(self, task, function (err) {
      if (err) return cb(err);
      iterate(++i);
    });
  }

  iterate(0);
};

function runTask (name, cb) {
  var self = this
    , task = this.project.get('task', name);

  function done (err) {
    if (err) {
      self.emit([ 'dependancy', 'error' ], err, task);
      cb(err);
    } else {
      self.emit([ 'dependancy', 'success' ], task);
      cb(null);
    }
  }

  this.emit([ 'd', 'start' ], task);

  if (!action.length) {
    var err = null;
    try { action(); }
    catch (ex) { err = ex; }
    done(err);
  } else if (action.length == 1) {
    action(done);
  }
}

Runnable.prototype.getDependancies = function () {
  var self = this
    , name = this.subject._type + '/' + this.subject._name
    , edges = []
    , lastDep = null;

  this.subject._requires.each(function (def, key) {
    if (self.runner.has(def._type, def._name)) {
      edges.push([ key, name ]);
      lastDep = key;
      getDeps(edges, self.runner, definition, name);
    }
  });

  var sorted = tsort(edges);
  sorted.forEach(function (key) {
    var dep = self.runner.get(key);
    this.requires.set(key, dep);
  });

  return this.requires;
};


function getDeps (edges, runner, definition, name) {
  definition._requires.each(function (def, key) {
    if (runner.has(def._type, def._name)) {
      edges.push([ key, name ]);
      getDeps(edges, runner, runner.get(def._type, def._name), key);
    }
  });
}

