
0.5.0 / 2012-10-11 
==================

  * add travis badge to readme
  * travis also tests node 0.8.x
  * convert tests to use bootstrap
  * add test bootstrap
  * fix bug when def or ctx was not found on run command
  * add travis.yml
  * Release 0.4.0
  * update readme
  * update tasks example to work
  * update breeze dependancy

0.4.0 / 2012-10-11 
==================

  * update readme
  * update tasks example to work
  * update breeze dependancy

0.3.2 / 2012-07-15 
==================

  * fix concurrency type

0.3.1 / 2012-07-09 
==================

  * update deps

0.3.0 / 2012-06-18 
==================

  * code cleanup
  * Merge branch 'feature/context'
  * comments
  * integration api cleanup
  * refactor runner api for simplicity
  * rename addDefinition to register for runner
  * runContext from runner and tests
  * add context constructor + tests
  * using breeze for dependancy running
  * switching to breeze `dag` dependancy sorting/execution
  * starting context feature
  * expose Context on main export
  * runner tests function with renamed methods
  * defintion now specified type of extension

0.2.1 / 2012-06-15 
==================

  * Merge branch 'feature/array-reqs'
  * add support for def requires as array and multiple params

0.2.0 / 2012-06-15 
==================

  * add basic task runner example
  * Merge branch 'feature/generalize'
  * update tests for runners
  * bug fix for multi event binding to runner
  * definition tests no longer need Sol
  * using super from npm
  * remove runnable tests
  * update definition tests
  * comments like a boss
  * fix package.json type
  * remove sol/breeze dependancies for definition and runner
  * optimize dependacy detection code
  * clean up old constructors
  * tests for runnable and runners
  * using super inherits method
  * add tests for workflow of runner
  * not worrying about browser testing yet
  * expose the new constructors
  * update deps
  * add definition tests
  * add Definition constructor
  * clean up old tests
  * renamed project to runner
  * return project#run
  * parse task dependancies is with the base runner

0.1.1 / 2012-05-24 
==================

  * NODE_ENV default spelling error

0.1.0 / 2012-05-24 
==================

  * Tests for Procrunner
  * ProcRunner is functional
  * empty balancer process
  * project `refreshes` with task runners
  * elements now properly concat pre/post recursive calls
  * Project#runner and more events for base runner
  * not including log
  * finish refactor as Exec
  * adding example of task
  * clean up project filters
  * exec proc as opposed to node proc
  * remove cli
  * test refactor
  * refactor as abiogenesis
  * empty fixtures
  * node runner finish tests
  * test for node process running
  * node type process runner
  * pid test helper
  * balancer is now a proc type
  * creating base runner "class"
  * refactor callback on task runner
  * task tests
  * refactor task runner
  * chai testing deps
  * un-privatize project#refresh to allow for script access dependency management.
  * dry dependancy resolution
  * set / get / has
  * task dependancy resolution
  * touchups on dry
  * clean up tsort list
  * more deps
  * project DRY refactor
  * added topological sorting mechanism for dependency resolution
  * updated cli `ls` command for new Mistfile patters
  * refactor Mistfile as chainable api style
  * mistfile tweaks
  * bin to package
  * starting on cli
  * vim ignore
  * calling it `clouds` not `deploys`
  * bug in project
  * mistfile tests
  * project constructor (from Mistfile)
  * project init
  * initial commit
