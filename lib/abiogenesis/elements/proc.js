
module.exports = Proc;

function Proc (name) {
  this.name = name || 'proc';
  this.opts = {
      type: 'node'
    , file: null
    , host: null
    , workers: 1
    , env: {}
    , cwd: null
    , args: []
    , pre: []
    , post: []
    , waitFor: []
  }
}

Proc.prototype.type = function (type) {
  var types = [ 'balancer', 'server', 'node' ];
  if (!~types.indexOf(type))
    throw new Error('Proc type ' + type + ' not permitted for ' + this.name);

  this.opts.type = type;
  return this;
};

Proc.prototype.file = function (file) {
  this.opts.file = file;
  return this;
};

Proc.prototype.host = function (host) {
  this.opts.host = host;
  return this;
};

Proc.prototype.workers = function (n) {
  this.opts.workers = n;
  return this;
};

Proc.prototype.env = function (key, val) {
  this.opts.env[key] = val;
  return this;
};

Proc.prototype.args = function (spec) {
  if (!Array.isArray(spec))
    spec = spec.split(' ');
  this.opts.args.concat(spec);
  return this;
};

Proc.prototype.cwd = function (spec) {
  this.opts.cwd = spec;
  return this;
};

Proc.prototype.pre = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.pre.concat(spec);
  return this;
};

Proc.prototype.post = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.post.concat(spec);
  return this;
};

Proc.prototype.waitFor = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.waitFor.concat(spec);
  return this;
};

