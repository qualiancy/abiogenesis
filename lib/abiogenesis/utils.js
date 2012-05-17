// slightly modified of:
// https://gist.github.com/1232505/f16308bc14966c8d003c2686b1c258ec41303c1f

exports.tsort = function (edges) {
  var nodes = {}
    , sorted = []
    , visited = {};

  // node constructor
  function N (id) {
    this.id = id;
    this.afters = [];
  }

  // parse edges into nodes
  edges.forEach(function (v) {
    var from = v[0]
      , to = v[1];
    if (!nodes[from])
      nodes[from] = new N(from);
    if (!nodes[to])
      nodes[to] = new N(to);
    nodes[from].afters.push(to);
  });

  // recursively visit nodes
  function doVisit (idstr, ancestors) {
    var node = nodes[idstr]
      , id = node.id;

    if (visited[idstr]) return;
    if (!Array.isArray(ancestors))
      ancestors = [];

    ancestors.push(id);
    visited[idstr] = true;

    // deep recursive checking
    node.afters.forEach(function (afterId) {
      if (ancestors.indexOf(afterId) >= 0)
        throw new Error(id + ' can not come before ' + afterId);
      var aid = afterId.toString()
        , anc = ancestors.map(function (v) { return v });
      doVisit(aid, anc);
    });

    sorted.unshift(id);
  }

  // actually do our recursion
  Object.keys(nodes).forEach(doVisit);
  return sorted.filter(function (s) {
    return null !== s && 'undefined' !== typeof s;
  });
};

// must be called with the context of a runner.
exports.parseTaskDeps = function () {
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

  this.preQueue = exports.tsort(preEdges)
  this.postQueue = exports.tsort(postEdges)
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

