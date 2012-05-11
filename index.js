module.exports = process.env.MIST_COV
  ? require('./lib-cov/mist')
  : require('./lib/mist');
