module.exports = function (chai, _) {
  chai.Assertion.addProperty('alive', function () {
    new chai.Assertion(this._obj).to.be.a('number');
    var alive = true;

    try {
      process.kill(this._obj, 0);
    } catch (ex) {
      if (ex.code == 'ESRCH') alive = false;
      else throw ex;
    }

    this.assert(
        alive === true
      , 'expected pid #{this} to be alive'
      , 'expected pid #{this} to not be alive' );
  });

};
