/*Uses: standard.

Builds the `Outcome` class.
*/

s.Outcome = function(func) {
    /*Represents one possible result of a player action.

    Args:
        func (func, optional): Assigned to the `_userScript`
            attribute. Defaults to a function that does nothing.

    Attributes:
        _userScript (func): The function to call when the outcome is
            carried out. Should take no parameters.
    */
    this._userScript = func;
    return this;
}

s.Outcome.prototype.carryOut = function() {
    /*Does nothing if `this._userScript` is `null` or `undefined`,
    otherwise executes `this._userScript`.

    Returns:
        Returns the same value as `this._userScript`.
    */
    if (this._userScript == null) {
        return;
    } else {
        return this._userScript();    
    }
}
