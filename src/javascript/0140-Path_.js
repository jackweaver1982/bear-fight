/*Uses: standard.

Builds and instantiates the `Path` class.

Attributes:
    st.path (Path): A `Path` instance for use by other classes.
*/

s.Path = function() {
    /*Keeps track of and manages the path the player has taken through
    the node system (i.e. the history).

    There is one instance (`st.path`), built in State.variables, so
    its state can be stored in SugarCube's history. The class must
    therefore be made compatible with SugarCube by having `clone ()` and
    `toJSON()` methods, and no recursive objects or object sharing. To
    achieve this, we also require it to have a constructor with no
    arguments and to have all its attributes be SC supported types.
    
    Attributes:
        _nodeLengths (arr of int): The lengths of the nodes visited so
            far. Recall that the length of a node is the number of
            actions it contains.
        _axnChoices (arr of int): Lists the index of the action chosen
            at each node.
        _axnLengths (arr of int): The lengths of the actions chosen so
            far. Recall that the length of an action is the number of
            outcomes it contains.
        _outcomes (arr of int): Lists the index of the outcome that
            resulted from each choice.
    */
    this._nodeLengths = [];
    this._axnChoices = [];
    this._axnLengths = [];
    this._outcomes = [];
}

s.Path.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.Path.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Path())._init(this);
};

s.Path.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.Path())._init($ReviveData$)', newPC
    );
};

st.path = new s.Path();