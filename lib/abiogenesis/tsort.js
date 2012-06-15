/*!
 * tsort
 *
 * dependancy resolution sorting
 *
 * @param {Array} edges
 * @api private
 */

module.exports = function (edges) {
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

