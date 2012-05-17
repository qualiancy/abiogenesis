
module.exports = Task;

function Task (name) {
  this.name = name || 'task';
  this.opts = {
      pre: []
    , post: []
    , action: function () {}
  }
}

Task.prototype.pre = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.pre = this.opts.pre.concat(spec);
  return this;
};

Task.prototype.post = function (spec) {
  if (!Array.isArray(spec))
    spec = [ spec ];
  this.opts.post = this.opts.post.concat(spec);
  return this;
};

Task.prototype.action = function (fn) {
  this.opts.action = fn;
  return this;
};
