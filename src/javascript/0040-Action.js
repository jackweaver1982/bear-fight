/*Uses: List.

Builds the `Action` class.
*/

s.Action = function(text, checkFunc, chooseFunc) {
    /*A `List` of `Outcome`s representing an action the user may take.

    In a given passage, the reader will choose from a list of actions.
    Each action can be displayed as a link, and when it is selected,
    the story will choose from a list of that action's possible
    outcomes. An `Action` object represents one of these actions.

    Structurally, an action object is a list of outcomes with a display
    text for the link, and some additional methods available. As such,
    it is implemented as a subclass of `List`.

    Args:
        text (str): Assigned to the `_displayText` attribute.
        checkFunc (func or bool, optional): Assigned to the
            `_userScriptCheck` attribute. Defaults to `true`.
        chooseFunc (func, optional): Assigned to the `_userScriptChoose`
            attribute. Defaults to a function that returns the first
            outcome in the list.

    Attributes:
        _array (arr): The embedded array of `Outcome` objects.
        _fixedEnd (bool): If `true`, the `push` method will keep the
            last element in the embedded array in the last position. Set
            to false by the constructor.
        _displayTest (str): The text to appear in the link.
        _userScriptCheck (func or bool): The function to call when
            checking if the action should be displayed. Should take no
            parameters and return a boolean. If it is a boolean, simply
            returns that boolean.
        _userScriptChoose (func): The function to call when choosing an
            outcome. Should take no parameters and return an outcome
            from the action.
        _align (str): The CSS text-align value for the link associated
            with this action. Defaults to 'left'.
    */
    s.List.call(this);
    this._displayText = text;

    if (checkFunc == null)  {
        this._userScriptCheck = true;
    } else {
        this._userScriptCheck = checkFunc;
    }

    this._userScriptChoose = chooseFunc || function() {
        return this._array[0];
    }
    this._align = 'left';
    return this;
};

s.Action.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Action.prototype, 'constructor', {
    value: s.Action,
    enumerable: false,
    writable: true
});

s.Action.prototype._verify = function(obj) {
    /*(override) Members of an `Action` must be `Outcome` objects.

    Args:
        obj (obj): The object to test.

    Returns:
        bool: `true` if the object is an `Outcome`, `false` otherwise.
    */
    return (obj instanceof s.Outcome);
}

s.Action.prototype.getText = function() {
    /*Fetches the `_displayText` attribute.

    Returns:
        str: The `_displayText` attribute of the calling instance.
    */
    return this._displayText;
}

s.Action.prototype.getAlign = function() {
    /*Fetches the `_align` attribute.

    Returns:
        str: The `_align` attribute of the calling instance.
    */
    return this._align;
}

s.Action.prototype.setAlign = function(align) {
    /*Sets the `_align` attribute.

    Args:
        align (str): Assigned to the `_align` attribute of the calling
            instance.

    Returns:
        Action: The calling instance.
    */
    this._align = align;
    return this;
}

s.Action.prototype.check = function() {
    /*Uses the `_userScriptCheck` attribute to check whether the
    action's link should be displayed.

    Returns:
        bool: The value of the attribute `_userScriptCheck`, if it is a
            boolean, or the return value of `_userScriptCheck`, if it is
            a function.
    */
    if (typeof(this._userScriptCheck) === 'boolean') {
        return this._userScriptCheck;
    } else {
        return this._userScriptCheck();
    }
}

s.Action.prototype.choose = function() {
    /*Uses the `_userScriptChoose` attribute to choose an outcome from
    the action.

    Returns:
        Outcome: `null`, if the action is empty, otherwise the return
            value of `_userScriptCheck`.
    */
    if (this.length() === 0) {
        return null;
    } else {
        return this._userScriptChoose();
    }
}