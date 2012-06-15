/*!
 * abiogenesis - Definition Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module Dependancies
 */

var inherits = require('super');

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
 * @param {String} type
 * @param {String} name
 * @header Definition
 * @api public
 */

function Definition (type, name) {
  this._requires = [];
  this._def = {
      name: name
    , type: type
  };
}

/**
 * #### .extend (prototype)
 *
 * Extend the Definition prototype to include your
 * own methods and properties.
 *
 * Note that the only reserved method for a
 * definition is `requires`, and the only reserved
 * properties are `_requires` and `_def`.
 *
 *     var Task = Definition.extend({
 *       action: function (fn) {
 *         this._action = fn;
 *       }
 *     });
 *
 * @param {Object} prototype functions to include
 * @name extend
 * @api public
 */

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
  this._requires.push(dep);
  return this;
};
