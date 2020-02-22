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

s.Outcome.prototype._userScript = function() {
    /*
    This code is customizable via the `onCarryOut()` method. It runs
    when the outcome is carried out.
    */
    return;
}

s.Outcome.prototype.onCarryOut = function(func) {
    /*
    Use this method to set the `_userScript` function. Returns the
    calling `Outcome` object.
    */
    this._userScript = func;
    return this;
}

s.Outcome.prototype.carryOut = function() {
    return this._userScript();
}