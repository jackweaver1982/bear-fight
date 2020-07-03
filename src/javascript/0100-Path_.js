/*Uses: standard.

Builds and instantiates the `Path` class.

Attributes:
    st.path (Path): A `Path` instance for use by other classes.

*/

s.Path = function() {
    /*Tracks and manages the history of choices and outcomes.

    There is one instance (`st.path`), built in State.variables, so
    its state can be stored in SugarCube's history. The class must
    therefore be made compatible with SugarCube by having `clone    ()` and
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

s.Path.prototype.length = function() {
    /*Gets the length of the path.

    Returns:
        int: The common length of the array attributes.
    */
    return this._nodeLengths.length;
}

s.Path.prototype.addEdge = function(
        numActions, actionIndex, numOutcomes, outcomeIndex
    ) {
    /*Adds a new "edge" to the path. That is, adds a new element to each
    of the embedded arrays. Called when the player takes an action.

    Args:
        numActions (int): The length of the node from which the player
            selected an action.
        actionIndex (int): The index of the action the player took.
        numOutcomes (int): The length of the action the player took.
        outcomeIndex (int): The index of the outcome that resulted from
            the player's selected action.

    Returns:
        Path: The calling instance.
    */
    this._nodeLengths.push(numActions);
    this._axnChoices.push(actionIndex);
    this._axnLengths.push(numOutcomes);
    this._outcomes.push(outcomeIndex);
    return this;
}

s.Path.prototype.view = function() {
    /*Displays the path in the console.
    */
    var pathStr = '';
    for (var i = 0; i < this._nodeLengths.length; i++) {
        pathStr += (
            'took action ' +
            (this._axnChoices[i]+1) + ' of ' + this._nodeLengths[i] +
            '; got outcome ' +
            (this._outcomes[i]+1) + ' of ' + this._axnLengths[i] + '\n'
        );
    }
    console.log(pathStr);
}

s.Path.prototype.getActionIndex = function(pointer) {
    /*Returns an element from the `_axnChoices` array.

    Args:
        pointer (int): The index of the element to return.

    Returns:
        int: The element of `_axnChoices` at the index, `pointer`.
    */
    return this._axnChoices[pointer];
}

s.Path.prototype.getOutcomeIndex = function(pointer) {
    /*Returns an element from the `_outcomes` array.

    Args:
        pointer (int): The index of the element to return.

    Returns:
        int: The element of `_outcomes` at the index, `pointer`.
    */
    return this._outcomes[pointer];
}

s.Path.prototype.autoPlay =function() {
    /*Restarts the story engine, then initiates an automatic playthrough
    by recreating each choice and outcome of the calling instance. More
    specifically, saves 'autostart', 'path', and 'pointer' objects in
    the metadata. These are used by the `Menu` and `Page` classes to
    carry out the autoplay.

    Raises:
        Error: If the calling instance has length 0.
    */
    if (this.length() === 0) {
        throw new Error(
            'Path.autoPlay():\n' +
            'path is empty'
        );
    }
    memorize('autostart', true);
    memorize('path', this);
    memorize('pointer', 0);
    Engine.restart();
}

st.path = new s.Path();
