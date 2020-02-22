s.Action = function() {
    /*
    In a given passage, the reader will choose from a list of actions.
    Each action will be displayed as a link, and when it is selected,
    the story will choose from a list of that action's possible
    outcomes. An `Action` object represents one of these actions.

    Structurally, an action object is a list of outcome ids with a
    display text for the link, and some additional methods available. As
    such, it is implemented as a subclass of `List`.

    Action links will be placed in a div with id `actions`, which should
    be placed at the top of the special passage, `PassageFooter`.

    @property {String} _displayText - The text to appear in the link.
    Defaults to an empty string.
    */
    s.List.call(this);
    this._displayText = '';
    return this;
};

s.Action.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Action.prototype, 'constructor', {
    value: s.Action,
    enumerable: false,
    writable: true
});

s.Action.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Action())._init(this);
};

s.Action.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('(new s.Action())._init($ReviveData$)', newPC);
};

s.Action.prototype._check = function(id) {
    /*
    @override

    Members of an `Action` must be outcomes that are registered with the
    factory.
    */
    return (f.indexOf(id) >= 0 && v[id] instanceof s.Outcome);
}

s.Action.prototype.setText = function(text) {
    /*
    Sets `_displayText` to `text` and returns the calling `Action
    object. Throws an error if `text` is not a nonempty string.
    */
    if (typeof(text) === 'string' && text !== '') {
        this._displayText = text;
    } else {
        throw new Error(
            'Action.setText():\n' +
            'wrong parameter type'
        );
    }
    return this;
}

s.Action.prototype.getText = function() {
    return this._displayText;
}

s.Action.prototype.choose = function() {
    /*
    By default, this method returns the first outcome in the action, or
    null if the action contains no outcome. This method should be
    overwritten by instances and represents instructions for choosing
    an outcome when the player selects this action.

    @return {Outcome}
    */
    if (this.length() > 0) {
        return v[this.get(0)];
    } else {
        return null;
    }
}