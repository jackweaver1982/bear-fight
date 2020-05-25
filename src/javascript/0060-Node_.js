/*Uses: ActionList.

Builds the `Node` class and defines some associated global variables.
Creates an instance of `Node` (`s.root`) to serve as the root of the
node system. The root node is associated with the passage whose title is
is `Root`. Such a passage must exist and it is the first passage visited
after the `Start` passage.

Attributes:
    s.nodes (map of <<SC Passage>> to Node): Maps SugarCube `Passage`
        objects to associated `Node` objects. Used to keep a record of
        nodes created and to facilitate looking up nodes by passage
        titles.
    s.specialPsgs (arr of str): List of titles of SC special passages to
        be excluded from use as nodes.
    s.root (Node): A node associated with the required "Root" passage.
        It is the first node loaded in the game.

*/

s.nodes = new Map();

s.specialPsgs = [
    'PassageDone', 'PassageFooter', 'PassageHeader', 'PassageReady', 'Start', 
    'StoryAuthor', 'StoryBanner', 'StoryCaption', 'StoryDisplayTitle',
    'StoryInit', 'StoryInterface', 'StoryMenu', 'StorySettings', 'StoryShare',
    'StorySubtitle', 'StoryTitle'
];

s.getNode = function(psgTitle) {
    /*Returns the Node object associate with the given passage title.

    Args:
        psgTitle (str): The passage title to look for.

    Returns:
        node: The node associated with the given passage title.
    */
    return s.nodes.get(Story.get(psgTitle));
}

s.Node = function(psgTitle, subCount, func, outOfChar) {
    /*A wrapper around a passage containing a list of `Action` objects.

    Structurally, a node is a list of actions with a passage for the
    narrative description, and some additional methods. As such, it is
    implemented as a subclass of `ActionList`.

    The associated passage may have slots available for dynamically
    generated text substitutions. The `subCount` property should match
    the number of available text substitutions. It is there for a
    redundancy check to prevent the error of sending the wrong number of
    text substitutions when loading a node.

    Node objects, and their associated Action and Outcome objects,
    should be built on `s` so they are not stored in the player's local
    storage. As such, they will not be saved from session to session, so
    they should not be changed dynamically during gameplay.

    Args:
        psgTitle (str): The title of the passage to assign to the
            `_passage` attribute.
        subCount (int, optional): Assigned to `_subCount`. Defaults to
            0.
        func (func or null, optional): Assigned to `_userScript`.
            Defaults to null.
        outOfChar (bool, optional): Assigned to `_outOfChar`. Defaults
            to `false`.

    Raises:
        Error: If the given passage title does not exist, is a special
            passage, or has already been assigned to a node.

    Attributes:
        _array (arr): The embedded array of `Action` objects.
        _fixedEnd (int): Indicates how many elements at the end of the
            array to keep fixed in place. Defaults to 0.
        _passage (<<SC Passage>>): The passage associated with the node.
        _excerpt (str): Give an excerpt of the associated passage, much
            like SugarCube's `Passage._excerpt`.
        _subCount (int): The number of expected text substitutions in
            the associated passage.
        _userScript (func or null): The function to execute upon loading
            the node. It runs immediately before the loading of the
            passage.
        _outOfChar (bool): `true` if the node's content lies outside the
            narrative flow of the story (e.g., help screen or character
            sheet).

    */

    s.ActionList.call(this);
    if (!Story.has(psgTitle)) {
        throw new Error(
            'Node():\n' +
            'there is no passage titled "' + psgTitle + '"'
        );
    }
    if (s.specialPsgs.indexOf(psgTitle) >= 0) {
        throw new Error(
            'Node():\n' +
            'cannot assign a special passage to a node'
        );
    }
    var psg = Story.get(psgTitle);
    if (s.nodes.has(psg)) {
        throw new Error(
            'Node():\n' +
            'the passage "' + psgTitle + '" already belongs to a node'
        );
    }
    this._passage = psg;
    this._excerpt = null;
    s.nodes.set(psg, this);
    this._subCount = subCount || 0;
    this._userScript = func;
    this._outOfChar = (outOfChar === undefined) ? false : outOfChar;
    return this;
};

s.Node.prototype = Object.create(s.ActionList.prototype);

Object.defineProperty(s.Node.prototype, 'constructor', {
    value: s.Node,
    enumerable: false,
    writable: true
});

s.Node.prototype.getPassage = function() {
    /*Fetches the `_passage` attribute.

    Returns:
        <<SC Passage>>: The `_passage` attribute of the calling
            instance.
    */
    return this._passage;
}

s.Node.prototype.getExcerpt = function() {
    /*Fetches the excerpt of the associated passage.

    Returns:
        str: The `_excerpt` property, if it is non-null; otherwise, the
            `_excerpt` property of the associated passage.
    */
    var excerpt = this._excerpt;
    if (excerpt === null) {
        excerpt = this._passage._excerpt;
    }
    return excerpt;
}

s.Node.prototype.getSubCount = function() {
    /*Fetches the `_subCount` attribute.

    Returns:
        int: The `_subCount` attribute of the calling instance.
    */
    return this._subCount;
}

s.Node.prototype.setSubCount = function(num) {
    /*Sets the `_subCount` attribute. Can only change it from its
    default value of 0 one time, to prevent unwanted errors. Sub counts
    are not meant to dynamically change.

    Args:
        num (int): Assigned to the `_subCount` attribute of the calling
            instance.

    Returns:
        Action: The calling instance.

    Raises:
        Error: If used when `_subCount` is not 0.
    */
    if (this._subCount !== 0) {
        throw new Error(
            'Node.setSubCount():\n' +
            'can only set sub count once'
        );
    }
    this._subCount = num;
    return this;
}

s.Node.prototype.onLoad = function() {
    /*Does nothing if `this._userScript` is `null` or `undefined`,
    otherwise executes `this._userScript`.

    Returns:
        Returns the same value as `this._userScript`.
    */
    if (this._userScript == null) {
        return;
    } else {
        return this._userScript();
    }
}

s.root = new s.Node('Root');
