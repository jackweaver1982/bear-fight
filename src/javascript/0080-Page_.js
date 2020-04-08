st.parser = new s.Parser();

s.Page = function() {
    /*
    A `Page` object represents the content which is displayed on the
    screen. Traditionally in SugarCube, this is just a passage. But with
    the node system, multiple passages can be displayed at a time, in
    order. The first passage is the main one and the one which SugarCube
    regards as being displayed. The other passages are displayed inside
    the first passage.

    There is one instance (`st.page`, see Global.js), built on
    State.variables, so its state can be stored in SugarCube's history.
    (This allows SugarCube to rebuild the page upon a browser refresh or
    upon loading a save file.) The class must therefore be made
    compatible with SugarCube by having `clone()` and `toJSON()`
    methods, and no recursive objects or object sharing. To achieve
    this, we also require it to have a constructor with no arguments and
    to have all its properties be SC supported types.
    */
    this._embeddedPsgs = [];  // list of embedded passage titles; does
                              // not include the first (main) passage
    this._noBreakFlags = [];  // list of nobreak flags (true if passage
                              // was embedded without a scene break)
    this._continuous = false; // set true to have passages embed by
                              // default
    return this;    
};

s.Page.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.Page.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Page())._init(this);
};

s.Page.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.Page())._init($ReviveData$)', newPC
    );
};

s.Page.prototype.length = function() {
    return this._embeddedPsgs.length;
}

s.Page.prototype.getPsg = function(index) {
    return this._embeddedPsgs[index];
}

s.Page.prototype.getFlag = function(index) {
    return this._noBreakFlags[index];
}

s.Page.prototype.isContinuous = function() {
    return this._continuous;
}

s.Page.prototype.setContinuous = function(val) {
    this._continuous = val;
    return this;
}

s.Page.prototype.insertActions = function(psg) {
    /*
    For each action in the node corresponding to the given SC passage
    object, this function checks if the action should be displayed. If
    it passes the check, it adds a link for the corresponding action.
    Does nothing if the incoming passage does not correspond to a node.
    */
    var node = s.nodes.get(psg);
    if (node === undefined) {
        return;
    }

    var psgTitle = psg.title;
    var psgId = psg.domId;
    var action;
    for (var i = 0; i < node.length(); i++) {
        action = node.get(i);
        if (action.check()) {
            $('#' + psgId + '-actions').wiki(
                '<p style="text-align:' + action.getAlign() + '">' +
                    '<<link "' + action.getText() + '">>'+
                        '<<run s.nodes.get(Story.get("' + psgTitle + '"))' +
                        '.get(' + i + ').choose().carryOut()>>' +
                    '<</link>>' +
                '</p>'
            );
        }
    }
    return this;
}

s.Page.prototype.innerPsg = function() {
    /*
    Returns the innermost passage on the page as a SC Passage object.
    */
    var psg;
    if (this._embeddedPsgs.length === 0) {
        psg = Story.get(passage());
    } else {
        var title = this._embeddedPsgs[this._embeddedPsgs.length - 1];
        psg = Story.get(title);
    }
    return psg;
}

s.Page.prototype.refreshActions = function() {
    /*
    Deletes the actions on the page and reinserts them. Can be used
    after dynamically changing variables on which action check functions
    depend.
    */
    var latestPsg = this.innerPsg();
    $('#' + latestPsg.domId + '-actions').empty();
    this.insertActions(latestPsg);
    return this;
}

s.Page.prototype.scrollToLast = function() {
    /*
    Scrolls to put the innermost passage at the top.
    */
    $('html, body').animate({
        scrollTop: $('#' + this.innerPsg().domId + '-body').position().top
    }, 0);
    return this;
}

s.Page.prototype.insertPsgText = function(psg, shellPsg, time, nobreak) {
    /*
    Inserts the given passage into the given shell passage, preceded by
    a scene break ("****"). The scene break is omitted is `nobreak` is
    true.

    The optional `time` parameter is used to set the moment in SC's
    history from which to draw the values of variables. It allows for
    the use of variables in passage content. It should be a nonpositive
    integer. A value of 0 denotes the current moment. Defaults to zero.

    @param {<<SC Passage object>>} psg - The passage to embed.
    @param {<<SC Passage object>>} shellPsg - The passage into which to
    embed.
    @param {Integer} time - (optional) A nonpositive integer that
    defaults to zero. Sets the moment in history to use when parsing.
    @param {Boolean} nobreak - (optional) Defaults to false. Set to true
    to omit the scene break marker.
    */
    time = time || 0;
    if (time < 0) {
        s.loadVars(time);
    }

    var sceneBreak = nobreak ? '' : '<p style="text-align:center">****</p>';
    $('#' + shellPsg.domId + '-next').wiki(
        sceneBreak +
        st.parser.procAllMarkup(psg.title, psg.text)
    );

    if (time < 0) {
        s.loadVars(0);
    }

    return this;
}

s.Page.prototype.embedPsg = function(node, time, nobreak) {
    /*
    Removes the current actions from the page, inserts the given node
    and its actions into the bottom of the page, scrolls to put the new
    content at the top, appends the page's list of embedded passages,
    and adds a new moment to SC's history. The embedded passage is
    preceded by a scene break ("****") unless `nobreak` is true.

    The time parameter is a nonpositive integer that defaults to zero
    and sets the moment in history to use when parsing. See
    `Page.insertPsgText` for details.
    */
    var nodePsg = node.getPassage();
    if (nodePsg.title === passage() ||
        this._embeddedPsgs.indexOf(nodePsg.title) >= 0) {
        throw new Error(
            'Page.load():\n' +
            'cannot embed a passage in itself'
        );
    }

    var latestPsg = this.innerPsg();
    $('#' + latestPsg.domId + '-actions').empty();
    this.insertPsgText(nodePsg, latestPsg, time, nobreak);
    this.insertActions(nodePsg);
    this._embeddedPsgs.push(nodePsg.title);
    this._noBreakFlags.push(nobreak);
    this.scrollToLast();
    State.create(State.passage);
    Save.autosave.save();
    return this;
}

s.Page.prototype.load = function(node, embed, nobreak) {
    /*
    Runs the given node's `onLoad` function, then renders the node's
    passage. If the optional parameter `embed` is true, then rather than
    rendering the passage, the passage's contents are appended to the
    end of the last embedded passage, the page is scrolled to put the
    new passage content at the top, and a new moment is added to SC's
    history. The appended content is preceded by a scene break ("****"),
    unless the optional `nobreak` parameter is true.

    If node is an info node, `embed` and `nobreak` have no effect.
    Instead, the associated passage is loaded without adding to the SC
    history.
    */
    if (embed === undefined) {
        embed = this._continuous;
    }
    if (node instanceof s.InfoNode) {
        embed = false;
    }

    node.onLoad();
    var nodePsg = node.getPassage();
    if (embed) {
        this.embedPsg(node, 0, nobreak);
        return this;
    } else {
        this._embeddedPsgs = [];
        this._noBreakFlags = [];
        Engine.play(nodePsg.title);
        return this;
    }
}