var Drip = require('drip')
  , util = require('util');

module.exports = BalancerProcess;

function BalancerProcess (proc) {
  Drip.call(this);
}

util.inherits(BalancerProcess, Drip);

BalancerProcess.prototype.start = function () {

};

BalancerProcess.prototype.stop = function () {

};

BalancerProcess.prototype.restart = function () {

};
