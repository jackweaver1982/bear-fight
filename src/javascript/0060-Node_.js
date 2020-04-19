// ActionList

s.nodes = new Map(); // maps SugarCube `Passage` objects to associated
                     // `Node` objects

s.getNode = function(psgTitle) {
    /*
    Returns the Node object associate with the passage titled,
    `psgTitle`.
    */
    return s.nodes.get(Story.get(psgTitle));
}

s.specialPsgs = [
    'PassageDone', 'PassageFooter', 'PassageHeader', 'PassageReady', 'Start', 
    'StoryAuthor', 'StoryBanner', 'StoryCaption', 'StoryDisplayTitle',
    'StoryInit', 'StoryInterface', 'StoryMenu', 'StorySettings', 'StoryShare',
    'StorySubtitle', 'StoryTitle'
];

s.Node = function(psgTitle, subCount, func, outOfChar) {
    /*
    A `Node` object is like a wrapper around a passage. It contains the
    passage which holds the narrative description of the situation, as
    well as a list of possible actions for the reader to choose from.

    Structurally, a node is a list of actions with a passage for the
    narrative description, and some additional methods. As such, it is
    implemented as a subclass of `ActionList`.

    The associated passage may have slots available for dynamically
    generated text substitutions. The node object has properties and
    methods for managing this. The `subCount` property should match the
    number of available text substitutions. It is there for a redundancy
    check to prevent the error of sending the wrong number of text
    substitutions when loading a node.

    Node objects, and their associated Action and Outcome objects,
    should be built on `s` so they are not stored in the player's local
    storage. As such, they will not be saved from session to session, so
    they should not be changed dynamically during gameplay.

    @param {String} psgTitle - The title of the associated passage.
    @param {Integer} subCount - The number of expected text
    substitutions. Defaults to 0.
    @param {Function} func (optional) - The function to call when the
    node is loaded. It runs immediately before the loading of the
    passage associated with the calling node. By default, it does
    nothing.
    @param {Boolean} outOfChar (optional) - True if the node content
    lies outside the narrative of the story (help screen, character
    stats, etc.) Defaults to false.

    @property passage - The SugarCube `Passage` object whose title is
    `psgTitle`
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
    return this._passage;
}

s.Node.prototype.getSubCount = function() {
    return this._subCount;
}

s.Node.prototype.setSubCount = function(num) {
    /*
    Sets the sub count. Can only change it from its default value of 0
    one time, to prevent unwanted errors. Sub counts are not meant to
    dynamically change.
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
    if (this._userScript == null) {
        return;
    } else {
        return this._userScript();
    }
}