var Tasks = require('./framework')
  , tasks = new Tasks();

var Task1 = tasks
  .define('one')
  .action(function (done) {
    console.log('task one');
    setTimeout(done, 1000);
  });

var Task2 = tasks
  .define('two')
  .requires(Task1)
  .action(function (done) {
    console.log('task two');
    setTimeout(done, 1000);
  });


tasks.runDefinition('task', 'two', function (err) {
  if (err) throw err;
  console.log('done');
});
