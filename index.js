module.exports = process.env.ABIOGENESIS_COV
  ? require('./lib-cov/abiogenesis')
  : require('./lib/abiogenesis');
