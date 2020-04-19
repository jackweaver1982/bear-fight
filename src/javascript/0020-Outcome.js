// standard

s.Outcome = function(func) {
    /*
    Represents one possible result of a player action.

    @param {Function} func - The function to call when the outcome is
    carried out.
    */
    this._userScript = func;
    return this;
}

s.Outcome.prototype.carryOut = function() {
    if (this._userScript == null) {
        return;
    } else {
        return this._userScript();    
    }
}