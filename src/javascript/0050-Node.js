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
    'PassageDone', 'PassageFooter', 'PassageHeader', 'PassageReady',
    'StoryAuthor', 'StoryBanner', 'StoryCaption', 'StoryDisplayTitle',
    'StoryInit', 'StoryInterface', 'StoryMenu', 'StorySettings', 'StoryShare',
    'StorySubtitle', 'StoryTitle'
];

s.Node = function(psgTitle, subCount, func) {
    /*
    A `Node` object is like a wrapper around a passage. It contains the
    passage which holds the narrative description of the situation, as
    well as a list of possible actions for the reader to choose from.

    Structurally, a node is a list of actions with a passage for the
    narrative description, and some additional methods. As such, it is
    implemented as a subclass of `List`.

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

    @property passage - The SugarCube `Passage` object whose title is
    `psgTitle`
    */
    s.List.call(this);
    if (!Story.has(psgTitle)) {
        throw new Error(
            'Node():\n' +
            'there is no passage titled "' + psgTitle + '"'
        );
    }
    if (s.specialPsgs.indexOf(psgTitle) >= 0) {
        throw new Error(
            'Node():\n' +
            'cannot assign a special passage other than `Start` to a node'
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
    this._userScript = func || function() {
        return;
    }
    return this;
};

s.Node.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Node.prototype, 'constructor', {
    value: s.Node,
    enumerable: false,
    writable: true
});

s.Node.prototype._verify = function(obj) {
    /*
    @override

    Members of a `Node` must be actions that are registered with the
    factory.
    */
    return (obj instanceof s.Action);
}

s.Node.prototype.getPassage = function() {
    return this._passage;
}

s.Node.prototype.getSubCount = function() {
    return this._subCount;
}

s.Node.prototype.onLoad = function() {
    return this._userScript();
}