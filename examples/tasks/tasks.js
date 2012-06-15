var Tasks = require('./framework')
  , tasks = new Tasks();

var Task1 = tasks
  .define('task', 'one')
  .action(function (done) {
    console.log('task one');
    setTimeout(done, 1000);
  });

tasks
  .define('task', 'two')
  .requires(Task1)
  .action(function (done) {
    console.log('task two');
    setTimeout(done, 1000);
  });


tasks.run('task', 'two', function (err) {
  if (err) throw err;
  console.log('done');
});
