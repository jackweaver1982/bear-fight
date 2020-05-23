/*Uses: Node_.js

Builds the `InfoNode` class and adds a function to
`s.autosave.necessary`, preventing autosave from occurring when loading
an InfoNode.

*/

s.InfoNode = function(psgTitle, checkFunc) {
    /*`InfoNode` is a subclass of `Node`. It is a special kind of node
    which lies outside the narrative context of the game. Visiting an
    info node does not trigger an autosave. An info node has a default
    action with text, 'return to story', that takes the player back to
    the last non-info node by reloading the last autosave.

    @param {String} psgTitle - The title of the associated passage.
    @param {Function|Boolean} checkFunc (optional) - The function to
    call when checking if the `return to story` action should be
    displayed. Should return a boolean. If a boolean is provided, simply
    returns that boolean. Defaults to true.

    Args:
        psgTitle (str): The title of the passage assigned to the
            `_passage` attribute.
        checkFunc (func or bool, optional): The function to call when
            checking if the `return to story` action should be
            displayed. Should return a boolean. If a boolean is
            provided, simply returns that boolean. Defaults to true.

    Attributes:
        _array (arr): The embedded array of `Action` objects.
        _fixedEnd (int): Indicates how many elements at the end of the
            array to keep fixed in place. Defaults to 0.
        _passage (<<SC Passage>>): The passage associated with the node.
        _subCount (int): The number of expected text substitutions in
            the associated passage. Defaults to 0.
        _userScript (func or null): The function to execute upon loading
            the node. It runs immediately before the loading of the
            passage associated with the calling node. Defaults to
            `null`.
        _outOfChar (bool): `true` if the node's content lies outside the
            narrative flow of the story (e.g., help screen or character
            sheet). Defaults to `true`.

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
    return (!(s.getNode(passage()) instanceof s.InfoNode));
});
