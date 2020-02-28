s.DirectedOutcome = function() {
    /*
    `DirectedOutcome` is a subclass of `Outcome`. A directed outcome is
    an outcome with a target node that is automatically loaded after the
    outcome is carried out.
    */
    s.Outcome.call(this);
    this._targetNodeId = ''
    return this;
};

s.DirectedOutcome.prototype = Object.create(s.Outcome.prototype);

Object.defineProperty(s.DirectedOutcome.prototype, 'constructor', {
    value: s.DirectedOutcome,
    enumerable: false,
    writable: true
});

s.DirectedOutcome.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.DirectedOutcome())._init(this);
};

s.DirectedOutcome.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.DirectedOutcome())._init($ReviveData$)', newPC
    );
};

s.DirectedOutcome.prototype.setTarget = function(id) {
    /*
    Sets `_targetNodeId` to `id`. Throws an error if `id` doesn't match
    an id in the factory. Returns the calling directed outcome.

    @param {String} id - The id of the target node.
    */
    if (f.indexOf(id) == -1) {
        throw new Error(
            'DirectedOutcome.setTargetNodeId():\n' +
            '"' + id + '" is not a valid node id'
        );
    }
    this._targetNodeId = id;
    return this;
}

s.DirectedOutcome.prototype.getTarget = function() {
    return this._targetNodeId;
}

s.DirectedOutcome.prototype.carryOut = function() {
    this._userScript();
    if (this._targetNodeId === '') {
        return;
    } else {
        return v[this._targetNodeId].load();
    }
}

s.Node.prototype.addLink = function(text, targetNodeId, func) {
    /*
    A link is an action that has only one outcome which is a directed
    outcome.

    Creates a directed outcome with the given targetNodeId and sets its
    user script to `func`. Then creates an action with the given text
    for its display text. Pushes the outcome into the action, and the
    action into the calling node. Returns the calling node.

    @param {String} text - The text to be displayed on the link.
    @param {String} targetNodeId - After executing `func`, loads the
    node with this id. If no such node exists, the method will create
    one with `makeNode`.
    @param {Function} func - (Optional) Executes this function when
    clicking the link. Defaults to a function that returns undefined.
    */
    if (func === undefined) {
        func = function() {
            return;
        }
    }
    if (typeof(func) !== 'function') {
        throw new Error(
            'Node.addLink():\n' +
            'third parameter must be a function'
        );
    }
    if (f.indexOf(targetNodeId) === -1) {
        s.makeNode(targetNodeId);
    }

    var actionId = this._id + 'Action' + this.length();
    var outcomeId = actionId + 'Outcome';

    f.build(actionId, 'Action');
    v[actionId].setText(text);
    this.push(actionId);

    f.build(outcomeId, 'DirectedOutcome');
    v[outcomeId].setTarget(targetNodeId);
    v[outcomeId].onCarryOut(func);
    v[actionId].push(outcomeId);

    return this;
}