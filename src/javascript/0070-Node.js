s.Node = function() {
    /*
    A `Node` object is like a wrapper around a passage. It contains the
    title of the passage which contains a narrative description of the
    situation, as well as a list of possible actions for the reader to
    choose from.

    Structurally, a node is a list of action ids with a passage title
    for the narrative description, and some additional methods
    available. As such, it is implemented as a subclass of `List`.

    The associated passage may have slots available for dynamically
    generated text substitutions. The node object has properties and
    methods for managing this. The `subCount` property should match the
    length of the `textSubs` array. It is there for a redundancy check
    to prevent the error of sending the wrong number of text
    substitutions when loading a node. Text substitutions are stored in
    an array. The string in the i-th index of this array will be
    substituted into an HTML element with id ('sub' + i.toString()).

    @property {String} _passage - The title of the associated passage.
    Defaults to ''.
    @property {Integer} _subCount - The number of expected text
    substitutions. Defaults to 0.
    @property {String array} _textSubs - The array of text
    substitutions. Defaults to an empty array.
    */
    s.List.call(this);
    this._passage = '';
    this._subCount = 0;
    this._textSubs = [];
    return this;
};

s.Node.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Node.prototype, 'constructor', {
    value: s.Node,
    enumerable: false,
    writable: true
});

s.Node.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Node())._init(this);
};

s.Node.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('(new s.Node())._init($ReviveData$)', newPC);
};

s.Node.prototype._check = function(id) {
    /*
    @override

    Members of a `Node` must be actions that are registered with the
    factory.
    */
    return (f.indexOf(id) >= 0 && v[id] instanceof s.Action);
}

s.Node.prototype.setPassage = function(passage) {
    /*
    Sets `_passage` to `passage` and returns the calling `Node` object.
    Throws an error is `passage` is not a nonempty string.
    */
    if (typeof(passage) === 'string' && passage !== '') {
        this._passage = passage;
    } else {
        throw new Error(
            'Node.setPassage():\n' +
            'Title must be a nonempty string'
        );
    }
    return this;
}

s.Node.prototype.getPassage = function() {
    return this._passage;
}

s.Node.prototype.setSubCount = function(num) {
    /*
    Sets `_subCount` to `num` and initializes `_textSubs` to an array of
    length `num` filled with empty strings. Throws an error if `num` is
    not a positive integer. Also throws an error if `_subCount` is
    already positive. (To prevent unwanted errors, the sub count of a
    node cannot be changed once it is set.) Returns the calling `Node`
    object.

    @param {Integer} num - Must be a positive integer.

    @return {Node}
    */
    if (this._subCount > 0) {
        throw new Error(
            'Node.setSubCount():\n' +
            'Cannot overwrite sub count once it is set'
        );
        return;
    }

    var parsed = parseInt(num, 10);
    if (isNaN(parsed) || parsed <= 0) {
        throw new Error(
            'Node.setSubCount():\n' +
            'Wrong parameter type'
        );
        return;
    }

    this._subCount = parsed;
    var array = [];
    for (var i = 0; i < parsed; i++) {
        array.push('');
    }
    this._textSubs = array;
    return this;
}

s.Node.prototype.getSubCount = function() {
    return this._subCount;
}

s.Node.prototype.setTextSubs = function(array) {
    /*
    Sets `_textSubs` to `array`. Throws an error is the elements in
    `array` are not all strings. Also throws an error if the length of
    `array` does not match `_subCounts`. Returns the calling `Node`
    object.
    */
    if (array.length !== this._subCount) {
        throw new Error(
            'Node.setSubCount():\n' +
            'Wrong number of text substitutions'
        );
    }
    if (!array.every(function(element) {
        return (typeof(element) === `string`);
    })) {
        throw new Error(
            'Node.setSubCount():\n' +
            'Wrong parameter type'
        );
    }
    this._textSubs = array;
    return this;
}

s.Node.prototype.getTextSub = function(index) {
    return this._textSubs[index];
}

s.Node.prototype.addLink = function() {
    /*
    Defined at the end of the definition of the `DirectedOutcome` class.
    */
    return;
}

s.Node.prototype._userScript = function() {
    /*
    This code is customizable via the `onLoad()` method. It runs when
    the node is loaded. By default, it loads the passage associated with
    the calling node.
    */
    Engine.play(this._passage);
    return;
}

s.Node.prototype.onLoad = function(func) {
    /*
    Use this method to set the `_userScript` function. Returns the
    calling `Node` object.
    */
    this._userScript = func;
    return this;
}

s.Node.prototype.load = function() {
    return this._userScript();
}

s.getNode = function(passage) {
    /*
    Uses the factory instance to return a node given a passage title.
    Throws an error if no such node exists.

    @param {String} passage - The title of the given passage.

    @return {Node}
    */
    if (typeof(passage) !== 'string' || passage === '') {
        throw new Error(
            'getNode():\n' +
            '`passage` must be a nonempty string'
        );
    }
    for (var i = 0; i < f.length(); i++) {
        var obj = v[f.get(i)];
        if ((obj instanceof s.Node) && obj.getPassage() === passage) {
            return obj;
        }
    }
    throw new Error(
        'getNode():\n' +
        'No node corresponds to passage, "' + passage + '"'
    );
}

s.makeNode = function(id, passage) {
    /*
    Uses the factory to build a node with the given `id`, and sets the
    passage to `passage`. If the `passage` parameter is omitted, sets
    the passage to `id`. Returns the new node object. (There is no need
    to assign the new node object. Recall that the factory automatically
    assigns it to v[id].)
    */
    var node = f.build(id, 'Node');
    passage = passage || id;
    node.setPassage(passage);
    return node;
}