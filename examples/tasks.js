var abiogenesis = require('..')
  , project = new abiogenesis.Project();


project
  .set('task', 'task::main')
  .pre('task::1')
  .post('task::2')
  .action(function (log, done) {
    setTimeout(function () {
      console.log('task main');
      done();
    }, 3000);
  });


project
  .set('task', 'task::1')
  .action(function (log, done) {
    setTimeout(function () {
      console.log('task 1');
      done();
    }, 3000);
  });

project
  .set('task', 'task::2')
  .action(function (log, done) {
    setTimeout(function () {
      console.log('task 2');
      done();
    }, 3000);
  });

project
  .refresh()
  .run('task', 'task::main', function (err) {
    if (err) throw err;
    console.log('done');
  });
