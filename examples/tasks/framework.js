var abiogenesis = require('../..')
  , Runner = abiogenesis.Runner
  , Runnable = abiogenesis.Runnable
  , Definition = abiogenesis.Definition;

var TaskDefinition = Definition.extend({

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
      this.use('task', TaskDefinition, this.taskRun.bind(this));
    }

  , taskRun: function (def, done) {
      console.log('task run');
      def._action(done);
    }

  , taskPre: function (def) {
      console.log('task pre');
    }

  , taskPost: function (def) {
      console.log('task post');
    }

  , taskError: function (err, def) {
      console.log('task err');
    }

});

module.exports = TaskRunner;

