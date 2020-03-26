/*
A `Page` object represents the content which is displayed on the screen.
Traditionally in SugarCube, this is just a passage. But with the node
system, multiple passages can be displayed at a time, in order. The
first passage is the main one and the one which SugarCube regards as
being displayed. The other passages are displayed inside the first
passage.

There is one instance (`v.page`, see Global.js), built on
State.variables, so its state can be stored in SugarCube's history.
(This allows SugarCube to rebuild the page upon a browser refresh or
upon loading a save file.) The class must therefore be made compatible
with SugarCube by having `clone()` and `toJSON()` methods, and no
recursive objects or object sharing. To achieve this, we also require it
to have a constructor with no arguments and to have all its properties
be SC supported types.
*/

s.Page = function() {
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

s.Page.prototype.scrollToLast = function() {
    /*
    Scrolls to put the innermost passage at the top.
    */
    $('html, body').animate({
        scrollTop: $('#' + this.innerPsg().domId + '-body').position().top
    }, 0);
    return this;
}

s.Page.prototype.insertPsg = function(psg, shellPsg, nobreak) {
    /*
    Inserts the given passage into the given shell passage, preceded by
    a scene break ("****"). The scene break is omitted is `nobreak` is
    true.

    @param {<<SC Passage object>>} psg - The passage to embed.
    @param {<<SC Passage object>>} shellPsg - The passage into which to
    embed.
    */
    var sceneBreak = nobreak ? '' : '<p style="text-align:center">****</p>';
    $('#' + shellPsg.domId + '-next').wiki(
        sceneBreak +
        v.parser.procAllMarkup(psg.title, psg.text)
    );
    return this;
}

s.Page.prototype.embedPsg = function(node, nobreak) {
    /*
    Removes the current actions from the page, inserts the given node
    and its actions into the bottom of the page, scrolls to put the new
    content at the top, appends the page's list of embedded passages,
    and adds a new moment to SC's history. The embedded passage is
    preceded by a scene break ("****") unless `nobreak` is true.
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
    this.insertPsg(nodePsg, latestPsg, nobreak);
    this.insertActions(nodePsg);
    this.scrollToLast();
    this._embeddedPsgs.push(nodePsg.title);
    this._noBreakFlags.push(nobreak);
    State.create(State.passage);
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
    */
    if (embed === undefined) {
        embed = this._continuous;
    }
    node.onLoad();
    var nodePsg = node.getPassage();
    if (embed) {
        this.embedPsg(node, nobreak);
        return this;
    } else {
        this._embeddedPsgs = [];
        this._noBreakFlags = [];
        Engine.play(nodePsg.title);
        return this;
    }
}

s.Page.prototype.reEmbedPsgs = function(psg) {
    /*
    Re-embeds embedded passages when the given main containing passage
    object renders.
    */
    var currentPsg = psg;
    var nextPsg;
    for (var i = 0; i < this._embeddedPsgs.length; i++) {
        nextPsg = Story.get(this._embeddedPsgs[i]);
        this.insertPsg(nextPsg, currentPsg, this._noBreakFlags[i]);
        currentPsg = nextPsg;
    }
    return this;
}

s.Page.prototype.rebuildPage = function(psg) {
    /*
    To be run after the given main containing passage object renders.
    Re-embeds embedded passages.  Inserts action links into last
    embedded passage, then scrolls so that the last embedded passage is
    the first thing visible.

    @param {SC Passage object} psg
    */
    var currentPsg = this.innerPsg();
    this.reEmbedPsgs(psg);
    this.insertActions(currentPsg);
    this.scrollToLast();
    return this;
}