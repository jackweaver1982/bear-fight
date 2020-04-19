// Node_

s.InfoNode = function(psgTitle, checkFunc) {
    /*
    `InfoNode` is a subclass of `Node`. It is a special kind of node
    which lies outside the narrative context of the game. Visiting an
    info node does not trigger an autosave. An info node has a default
    action with text, 'return to story', that takes the player back to
    the last non-info node by reloading the last autosave.

    @param {String} psgTitle - The title of the associated passage.
    @param {Function|Boolean} checkFunc (optional) - The function to
    call when checking if the `return to story` action should be
    displayed. Should return a boolean. If a boolean is provided, simply
    returns that boolean. Defaults to true.
    */
    s.Node.call(this, psgTitle);

    this._outOfChar = true;
    this.addAction('return to story', Save.autosave.load, checkFunc);

    return this;
};

s.InfoNode.prototype = Object.create(s.Node.prototype);

Object.defineProperty(s.InfoNode.prototype, 'constructor', {
    value: s.InfoNode,
    enumerable: false,
    writable: true
});

s.autosave.necessary.push(function() {
    // do not autosave when visiting an info node
    return (!(s.getNode(passage()) instanceof s.InfoNode));
});