// InfoNode, Parser_, DebugController_

s.Page = function() {
    /*
    A `Page` object represents the content which is displayed on the
    screen. Traditionally in SugarCube, this is just a passage. But with
    the node system, multiple passages can be displayed at a time, in
    order. The first passage is the main one and the one which SugarCube
    regards as being displayed. The other passages are displayed inside
    the first passage.

    There is one instance (`st.page`), built on State.variables, so its
    state can be stored in SugarCube's history. (This allows SugarCube
    to rebuild the page upon a browser refresh or upon loading a save
    file.) The class must therefore be made compatible with SugarCube by
    having `clone()` and `toJSON()` methods, and no recursive objects or
    object sharing. To achieve this, we also require it to have a
    constructor with no arguments and to have all its properties be SC
    supported types.
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
    if (s.getNode(passage()) == undefined) {
        throw new Error(
            'Page.embedPsg():\n' +
            'shell passage not associated with a node'
        );
    }

    var nodePsg = node.getPassage();
    if (nodePsg.title === passage() ||
        this._embeddedPsgs.indexOf(nodePsg.title) >= 0) {
        throw new Error(
            'Page.embedPsg():\n' +
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
    Checks the debug controller's cheat code and toggles debug mode if
    necessary.

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
    var code = s.debCon.getCheat();
    var L = code.length;
    if (
        code[L - 1] === node.getPassage().title &&
        State.length >= L &&
        code.slice(0, L - 1).every(function(psgTitle, i) {
            return code[i] === State.peek(L - 2 - i).title;
        })
    ) {
        s.debCon.toggle();
    }

    if (embed === undefined) {
        embed = this._continuous;
    }
    if (passage() === 'Start' || node instanceof s.InfoNode) {
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

st.page = new s.Page();

s.preProcText = []; // an array of size-2 arrays; preProcText[i][0] is
                    // the title of a passage, preProcText[i][1] is a
                    // function to apply to that passage's text before
                    // SC's text processing.

Config.passages.onProcess = function(p) {
    /*
    Prepends passage text with an HTML linebreak if the passage is the
    header passage or if the passage is tagged with `no-header`. Does
    nothing further if the current passage is not associated with a
    node.

    Rewinds variables to a previous moment to account for embedded
    passages. Variables will be restored on `:passagedisplay`. Then
    processes the node markup.
    */
    var text = p.text;
    for (var i = 0; i < s.preProcText.length; i++) {
        if (p.title === s.preProcText[i][0]) {
            text = s.preProcText[i][1](text);
        }
    }

    if (s.getNode(p.title) === undefined) {
        return text;
    }

    s.loadVars(-st.page.length());
    var processedText = st.parser.procAllMarkup(p.title, text);
    return processedText;
};

$(window).bind('beforeunload pagehide', function(){
    /*
    Restart upon browser refresh. Otherwise, upon browser refresh,
    `Page.scrollToLast()` will not fire. (It fires too early, before the
    reloaded page is ready, and we cannot bind to any event that
    triggers after the page is fully reloaded.) This ad hoc solution
    requires that the 'Start' passage offer a way to reload the
    autosave.
    */
    Engine.restart();
});

$(document).one(':enginerestart', function (ev) {
    /*
    To perform a 'hard restart' (i.e. to delete the autosave before
    restarting), set 'hardRestart' to true in the metadata before
    restarting.
    */
    if (recall('hardRestart', false)) {
        Save.autosave.delete();
        forget('hardRestart');
    }
});

$('#menu-item-restart').remove() // remove default Restart button

s.restart = function() {
    /*
    In general, this custom restart function is preferred over
    `Engine.restart()` and is what should be triggered by any 'restart'
    menu items. In particular, the default 'Restart' button in the UI
    bar should be removed.

    In general, this function performs a hard restart. If it was called
    from the 'Start' passage, sets 'autoBegin' to true in the metadata.
    The start passage can use this metadata to immediately move to the
    next passage in the story rather than simply refresh itself.
    */
    memorize('hardRestart', true);
    if (passage() === 'Start' && st.page.length() === 0) {
        memorize('autoBegin', true);
    }
    Engine.restart();
}

s.preProcText.push(['Start', function(text) {
    return (
        '<<timed 0s>>' +
            '<<if recall("autoBegin", false)>>' +
                '<<run forget("autoBegin")>>' +
                '<<run s.loadNode("intro")>>' +
            '<</if>>' +
        '<</timed>>' +
        text
    );
}])

s.onPsgDisplay = function(ev) {
    /*
    Triggered by the `:passagedisplay` event. Rebuilds the current page.
    Does nothing if the current passage is not associated with a node.
    */
    if (s.getNode(ev.passage.title) === undefined) {
        return;
    }

    s.loadVars(0); // resets variables to current time

    var currentPsg = ev.passage;
    var nextPsg, time;
    for (var i = 0; i < st.page.length(); i++) {
        /*
        Re-inserts embedded passage text one at a time.
        */
        nextPsg = Story.get(st.page.getPsg(i));
        time = i - (st.page.length() - 1)
        st.page.insertPsgText(
            nextPsg, currentPsg, time, st.page.getFlag(i)
        );
        currentPsg = nextPsg;
    }

    st.page.insertActions(st.page.innerPsg());
    st.page.scrollToLast();
    return;
}

$(document).on(':passagedisplay', s.onPsgDisplay);