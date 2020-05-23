/*Uses: Page_.

Builds the `DirectedOutcome` class.

*/

s.DirectedOutcome = function(node, func, embed, nobreak) {
    /*An outcome with a node that is loaded at the end.

    Args:
        node (Node): Assigned to the `_targetNode` attribute.
        func (func, optional): Assigned to the `_userScript`
            attribute. Defaults to a function that does nothing.
        embed (bool or null, optional): Assigned to the `_embed`
            attribute. Defaults to null.
        nobreak (bool or null, optional): Assigned to the `_nobreak`
            attribute. Defaults to null.

    Attributes:
        _userScript (func): The function to call when the outcome is
            carried out. Should take no parameters.
        _targetNode (Node): The node to load after carrying out the
            outcome.
        _embed (bool or null): Passed as a parameter to `Page.load()`
            when loading the target node.
        _nobreak (bool or null): Passed as a parameter to `Page.load()`
            when loading the target node.

    */

    s.Outcome.call(this, func);
    this._targetNode = node;
    if (embed === undefined) {
        this._embed = null;
    } else {
        this._embed = embed;
    }
    if (nobreak === undefined) {
        this._nobreak = null;
    } else {
        this._nobreak = embed;
    }
    return this;
};

s.DirectedOutcome.prototype = Object.create(s.Outcome.prototype);

Object.defineProperty(s.DirectedOutcome.prototype, 'constructor', {
    value: s.DirectedOutcome,
    enumerable: false,
    writable: true
});

s.DirectedOutcome.prototype.carryOut = function() {
    /*(override) Carries out `_userScript` if it is not `null`, then
    loads `_targetNode` with the `_embed` and `_nobreak` options.
    */
    if (this._userScript != null) {
        this._userScript();
    }
    st.page.load(this._targetNode, this._embed, this._nobreak);
}
