
module.exports = Cloud;

function Cloud (name) {
  this.name = name;
  this.opts = {
      host: null
    , node: {}
    , pre: []
    , post: []
  }
}

Cloud.prototype.host = function (host) {
  this.opts.host = host;
  return this;
};

Cloud.prototype.node = function (key, value) {
  var keys = [ 'env', 'version' ];
  if (!~keys.indexOf(key))
    throw new Error('Clode node config ' + key + ' not permitted for ' + this.name);

  this.opts.node[key] = value;
  return this;
};

Cloud.prototype.pre = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.pre.concat(spec);
  return this;
};

Cloud.prototype.post = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.post.concat(spec);
  return this;
};
