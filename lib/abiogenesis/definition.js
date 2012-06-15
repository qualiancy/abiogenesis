/*!
 * abiogenesis - Definition Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var inherits = require('super')
  , Sol = require('sol');

/*!
 * Module Export
 */

module.exports = Definition;

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
  this._requires = new Sol();
  this._def = {
      name: name
    , type: type
  };
}

Definition.extend = inherits.extend;

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

Definition.prototype.requires = function (dep) {
  var key = '/' + dep._def.type + '/' + dep._def.name;
  this._requires.set(key, dep);
  return this;
};
