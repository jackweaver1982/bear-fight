s.Action = function(text, checkFunc, chooseFunc) {
    /*
    In a given passage, the reader will choose from a list of actions.
    Each action can be displayed as a link, and when it is selected,
    the story will choose from a list of that action's possible
    outcomes. An `Action` object represents one of these actions.

    Structurally, an action object is a list of outcomes with a display
    text for the link, and some additional methods available. As such,
    it is implemented as a subclass of `List`.

    @param {String} text - The text to appear in the link.
    @param {Function|Boolean} checkFunc (optional) - The function to
    call when checking if the action should be displayed. Should return
    a boolean. If a boolean is provided, simply returns that boolean.
    Defaults to true.
    @param {Function} chooseFunc (optional) - The function to call when
    choosing an outcome. Should return an outcome from the action. If
    not provided, the first outcome in the list will be chosen.
    @param {String} align (optional) - The CSS text-align value for the
    link associated with this action. Defaults to 'left'.
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
    /*
    @override

    Members of an `Action` must be Outcome objects.
    */
    return (obj instanceof s.Outcome);
}

s.Action.prototype.getText = function() {
    return this._displayText;
}

s.Action.prototype.getAlign = function() {
    return this._align;
}

s.Action.prototype.setAlign = function(align) {
    this._align = align;
    return this;
}

s.Action.prototype.check = function() {
    if (typeof(this._userScriptCheck) === 'boolean') {
        return this._userScriptCheck;
    } else {
        return this._userScriptCheck();
    }
}

s.Action.prototype.choose = function() {
    if (this.length() === 0) {
        return null;
    } else {
        return this._userScriptChoose();
    }
}