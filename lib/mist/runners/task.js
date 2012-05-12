var Drip = require('drip')
  , util = require('util');

var _ = require('../utils');

module.exports = TaskRunner;

function TaskRunner (project, task) {
  this.project = project;
  this.task = task;
  this.preQueue = null;
  this.postQueue = null;
  parseDeps.call(this);
}

util.inherits(TaskRunner, Drip);

TaskRunner.prototype.run = function (cb) {

};

function parseDeps () {
  var self = this
    , preEdges = []
    , postEdges = []
    , lastPre = null
    , lastPost = null;

  this.task.opts.pre.forEach(function (t) {
    if (self.project.has('task', t)) {
      preEdges.push([ lastPre, t]);
      lastPre = t;
      getDeps(preEdges, self.project, self.project.get('task', t));
    }
  });

  this.task.opts.post.forEach(function (t) {
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
