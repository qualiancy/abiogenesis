var abiogenesis = require('../..')
  , Runner = abiogenesis.Runner
  , Runnable = abiogenesis.Runnable
  , Definition = abiogenesis.Definition;

var Task = Definition.extend('task', {

    action: function (fn) {
      this._action = fn;
      return this;
    }

});

var TaskRunner = Runner.extend({

    events: {
        'task::pre': 'taskPre'
      , 'task::post': 'taskPost'
      , 'task::error': 'taskError'
    }

  , initialize: function () {
      this.register(Task, this.taskRun.bind(this));
    }

  , define: function (name) {
      var task = new Task(name);
      this.push(task);
      return task;
    }

  , taskRun: function (def, done) {
      def._action(done);
    }

  , taskPre: function (def) {
      var name = def._opts.name;
      console.log('pre hook: %s', name);
    }

  , taskPost: function (def) {
      var name = def._opts.name;
      console.log('post hook: %s', name);
    }

  , taskError: function (err, def) {
      var name = def._opts.name;
      console.log('err hook: %s', name);
    }

});

module.exports = TaskRunner;
