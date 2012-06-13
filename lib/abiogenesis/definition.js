var Sol = require('sol');

module.exports = Definition;

/*!
 * abiogenesis - Definition Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ## Definition
 *
 * The basis object for publicly exposed objects.
 * This is primary going to be inherted and modified
 * using chainable helpers.
 *
 * @param {String} name
 * @param {String} type
 * @header Definition
 * @api public
 */

function Definition (name, type) {
  this._name = name;
  this._type = type;
  this._requires = new Sol();
  this._attrs = new Sol();
}

/**
 * ### .requires (definition)
 *
 * Assertion that this constructed defintion
 * has dependancy of another definition prior
 * to running.
 *
 * @param {Object} definition of dependancy
 * @name requires
 * @api public
 */

Definition.prototype.requires = function (def) {
  var key = def._type + '/' + def._name;
  this._requires.set(key, def);
  return this;
};
