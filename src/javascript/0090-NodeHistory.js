s.NodeHistory = function() {
    /*
    `NodeHistory` keeps track of the player's choices and their
    consequences. There is one predefined instance, `nodeHistory`. (See
    below.) Other classes will use this instance, so there should not be
    any other instances created.

    @property {String array} _textHistory - An array of the displayed
    text of nodes the player has visited, without action links.
    */
    this._narrativeHistory = [];
    return this;    
};

s.NodeHistory.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.NodeHistory.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.NodeHistory())._init(this);
};

s.NodeHistory.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.NodeHistory())._init($ReviveData$)', newPC
    );
};

s.NodeHistory.prototype.pushNarrative = function(text) {
    this._narrativeHistory.push(text);
    return this;
}

f.build('nodeHistory', 'NodeHistory');

/*
Established `h` as a shorthand alias for `v.nodeHistory`.
*/
Object.defineProperty(window, "h", {
    get: function() {
        return v.nodeHistory;
    }
});