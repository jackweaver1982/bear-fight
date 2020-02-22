s.Outcome = function() {
    /*
    Represents one possible result of a player action.
    */
    return this;
}

s.Outcome.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.Outcome.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Outcome())._init(this);
};

s.Outcome.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newObj = {};
    Object.keys(this).forEach(function (pn) {
        newObj[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('(new s.Outcome())._init($ReviveData$)', newObj);
};

s.Outcome.prototype.carryOut = function() {
    /*
    By default this method does nothing and returns `undefined`. It
    should be overwritten by instances and represents instructions for
    carrying out the outcome.
    */
    return;
}