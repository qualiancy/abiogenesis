var Drip = require('drip')
  , util = require('util');

var _ = require('../utils');

module.exports = BaseRunner;

function BaseRunner (project, subject) {
  Drip.call(this, { delimeter: ':' });
  this.project = project;
  this.subject = subject;
  this.preQueue = null;
  this.postQueue = null;
  parseTaskDeps.call(this);
}

util.inherits(BaseRunner, Drip);

BaseRunner.prototype.runTaskQueue = function (queue, cb) {
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
    , task = this.project.get('task', name)
    , action = task.opts.action;

  function done (err) {
    if (err) {
      self.emit([ 'task', 'error' ], err, task);
      cb(err);
    } else {
      self.emit([ 'task', 'success' ], task);
      cb(null);
    }
  }

  this.emit([ 'task', 'start' ], task);

  if (!action.length) {
    var err = null;
    try { action(); }
    catch (ex) { err = ex; }
    done(err);
  } else if (action.length == 1) {
    action(done);
  }
}

function parseTaskDeps () {
  var self = this
    , preEdges = []
    , postEdges = []
    , lastPre = null
    , lastPost = null;

  this.subject.opts.pre.forEach(function (t) {
    if (self.project.has('task', t)) {
      preEdges.push([ lastPre, t]);
      lastPre = t;
      getDeps(preEdges, self.project, self.project.get('task', t));
    }
  });

  this.subject.opts.post.forEach(function (t) {
    if (self.project.has('task', t)) {
      postEdges.push([ lastPost, t ]);
      getDeps(postEdges, self.project, self.project.get('task', t));
    }
  });

  this.preQueue = _.tsort(preEdges)
  this.postQueue = _.tsort(postEdges)
}

function getDeps (edges, project, task) {
  depsPre(edges, project, task);
  depsPost(edges, project, task);
}

function depsPre (edges, project, task) {
  task.opts.pre.forEach(function (t) {
    if (project.has('task', t)) {
      edges.push([ t, task.name ]);
      getDeps(edges, project, project.get('task', t));
    }
  });
}

function depsPost (edges, project, task) {
  task.opts.post.forEach(function (t) {
    if (project.has('task', t)) {
      edges.push([ task.name, t ]);
      getDeps(edges, project, project.get('task', t));
    }
  });
}

