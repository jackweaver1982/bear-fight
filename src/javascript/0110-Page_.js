/*Uses: InfoNode_, Parser_, DebugController_, Path_.

Builds the `Page` class, instantiates it, and creates functions for
managing SC's display of incoming passages.

Attributes:
    st.page (Page): A `Page` instance for use by other classes.
    s.preProcText (arr of arr(str, func)): Each element of this array is
        a size-2 array, the first element of which is the title of a
        passage, and the second element of which is a function to apply
        to that passage's text before SC's text processing. The function
        should take a string as an argument and return a string.
    s.history (InfoNode): The `InfoNode` instance associated with the
        'History' passage.

*/

s.Page = function() {
    /*Manages the content of the current viewable area in the browser.

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

    Attributes:
        _embeddedPsgs (arr of str): Array of embedded passage titles;
            does not include the first (main) passage.
        _noBreakFlags (arr of bool): Array of nobreak flags (true if
            passage was embedded without a scene break, i.e. a visual
            separator between embedded passages)
        _continuous (bool): Defaults to `false`. Set to `true` to make
            the passages embed by default.
        _history (arr of arr of arr of str): A 3-dim array of
            strings. The first index corresponds to the pages in the
            history. The second index corresponds to a scene of the page
            (separated by scene breaks). The third index corresponds to
            paragraphs within that scene. The strings themselves are raw
            text, obtained by `innerText`, and containing no HTML
            markup. Text corresponding to nodes whose `_outOfChar`
            attribute is `true` are not included.

    */
    
    this._embeddedPsgs = [];
    this._noBreakFlags = [];
    this._continuous = false;
    this._history = [];
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

s.Page.prototype.ready = function(safe) {
    /*Throws an error if current passage is not associated with a node.

    Args:
        safe (bool, optional): If `true`, does not throw an error but
            returns `false` instead.

    Returns:
        bool: `true` if current passage is a node, `false` otherwise.

    Raises:
        Error: If current passage is not a node.

    */
    if (s.getNode(passage()) === undefined) {
        if (safe) {
            return false;
        }
        throw new Error(
            'Page.ready()\n' +
            'Passage is not associated to a node.'
        );
    }
    return true;
}

s.Page.prototype.length = function() {
    /*Fetches the number of embedded passages.

    Returns:
        int: The length of the `_embeddedPsgs` attribute.

    */
    return this._embeddedPsgs.length;
}

s.Page.prototype.getPsg = function(index) {
    /*Fetches the title of the embedded passage at the given index.

    Args:
        index (int): The index from which to retrieve the passage.

    Returns:
        str: The passage title at that index.

    */
    return this._embeddedPsgs[index];
}

s.Page.prototype.getFlag = function(index) {
    /*Fetches the no-break flag embedded passage at the given index.

    Args:
        index (int): The index from which to retrieve the no-break flag.

    Returns:
        str: The no-break flag at that index.

    */
    return this._noBreakFlags[index];
}

s.Page.prototype.isContinuous = function() {
    /*Used to check if passage-embedding is the default behavior.

    Returns:
        bool: The value of the `_continuous` attribute.

    */
    return this._continuous;
}

s.Page.prototype.setContinuous = function(val) {
    /*Sets the passage-embedding default behavior.

    Args:
        val (bool): The value assigned to the `_continuous` attribute.

    Returns:
        Page: The calling `Page` instance.

    */
    this._continuous = val;
    return this;
}

s.Page.prototype.getScenes = function(psg) {
    /*Looks at the node associated with the given passage and all nodes
    embedded within it, ignoring nodes whose `_outOfChar` attribute is
    true, and extracts all textual content except scene breaks. Returns
    that textual content as a 2-dimensional array, with the first index
    indicating the scene (separated on the page by scene breaks) and the
    second index indicating the paragraph.

    Args:
        psg (<<SC Passage>>): The passage associated to the node from
            which textual content will be extracted.

    Returns:
        arr of arr of str: A 2-dimensional array, with the first index
            indicating the scene (separated on the page by scene breaks)
            and the second index indicating the paragraph.

    */
    var pars = [];
    $('#' + psg.domId + '-main').find('p').not('.outOfChar').each(
        function(index, element) {
            pars.push(element.innerText);
        }
    );
    pars = pars.filter(function(element) {
        return element !== '';
    });
    return s.splitArr(pars, '****');
}

s.Page.prototype.pushHistory = function(psg) {
    /*Looks at the node associated with the given passage and all nodes
    embedded within it, ignoring nodes whose `_outOfChar` attribute is
    true, extracts the scenes as an array of arrays of paragraph text,
    then adds that array of scenes to the end of calling instance's
    `_history` array.

    Does nothing if the array of scenes is "empty" in the generalized
    sense (i.e. of length zero, or containing only arrays that are
    "empty").

    Args:
        psg (<<SC Passage>>): The passage associated to the node from
            which textual content will be extracted.

    Returns:
        Page: The calling instance.

    */
    var scenes = this.getScenes(psg);
    if (!s.isEmpty(scenes)) {
        this._history.push(this.getScenes(psg));
    }
    return this;
}

s.Page.prototype.updateHistory = function(psg) {
    /*Looks at the node associated with the given passage and all nodes
    embedded within it, ignoring nodes whose `_outOfChar` attribute is
    true, extracts the scenes as an array of arrays of paragraph text,
    then replaces the last element of the calling instance's `_history`
    array with that array of scenes.

    If the array of scenes is "empty" in the generalized sense (i.e. of
    length zero, or containing only arrays that are "empty"), deletes
    the last element of the calling instance's `_history` array.

    Does nothing if the calling instance's `_history` array has length
    zero.

    Args:
        psg (<<SC Passage>>): The passage associated to the node from
            which textual content will be extracted.

    Returns:
        Page: The calling instance.

    */
    if (this._history.length === 0) {
        return;
    }

    var scenes = this.getScenes(psg);
    if (!s.isEmpty(scenes)) {
        this._history[this._history.length - 1] = scenes;
    } else {
        this._history.pop();
    }
    return this;
}

s.Page.prototype.pages = function() {
    /*Returns the number of pages in history.

    Returns:
        int: The length of the calling instance's `_history` attribute.

    */
    return this._history.length;
}

s.Page.prototype.pageToHTML = function(index) {
    /*Returns that page stored in history at the given index in HTML
    format. Encloses each paragraph in HTML `p` tags and separates
    scenes with centered scene breaks.

    Args:
        index (int): The index in history of the page to convert to
            HTML.

    Returns:
        str: The page, in HTML, as a single string.

    */
    var scenes = this._history[index];
    scenes = scenes.map(function(scene) {
        return scene.map(function(par) {
            return '<p>' + par + '</p>';
        });
    });
    scenes = scenes.map(function(scene) {
        return scene.join('\n\n');
    });
    return scenes.join('\n\n<p style="text-align:center">****</p>\n\n');
}

s.Page.prototype.innerPsg = function() {
    /*Returns the innermost passage on the page as a SC Passage object.

    Returns:
        <<SC Passage>>: The current passage if `_embeddedPsgs` is empty;
            otherwise, the last element of `_embeddedPsgs`
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
    /*Inserts the given passage into the given shell passage, preceded
    by a scene break ("****"). The scene break is omitted if the
    optional `nobreak` is true.

    The optional `time` parameter is used to set the moment in SC's
    history from which to draw the values of variables. It allows for
    the use of variables in passage content. It should be a nonnegative
    integer. A value of 0 denotes the current moment. Defaults to zero.

    After processing the node markup, sets the `_excerpt` attribute of
    the node associated with the given passage in the same way that SC's
    `Passage.render()` does to `Passage._excerpt`. (See
    https://github.com/tmedwards/sugarcube-2/blob/
    7e13f2665c2df989ccd498d2d7162f58b9392192/src/passage.js#L220)

    Uses `Page.ready()` to check if the incoming passage corresponds to
    a node.

    Args:
        psg (<<SC Passage>>): The passage to embed.
        shellPsg (<<SC Passage>>): The passage into which to embed.
        time (int, optional): A nonnegative integer that defaults to
            zero. Sets the moment in history to use when parsing.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break.

    Returns:
        Page: The calling `Page` instance.
    */
    this.ready();

    time = time || 0;
    if (time < 0) {
        s.loadVars(time);
    }

    var sceneBreak = nobreak ? '' : '<p style="text-align:center">****</p>';
    $('#' + shellPsg.domId + '-next').wiki(
        sceneBreak + st.parser.procAllMarkup(psg.title, psg.text)
    );

    var element = document.getElementById(psg.domId + '-body');
    var excerpt = element.textContent.trim();
    if (excerpt !== '') {
        const excerptRe = new RegExp(`(\\S+(?:\\s+\\S+){0,${7}})`);
        excerpt = excerpt.replace(/\s+/g, ' ').match(excerptRe);
    }
    s.nodes.get(psg)._excerpt = excerpt ? `${excerpt[1]}\u2026` : '\u2026';

    if (time < 0) {
        s.loadVars(0);
    }

    return this;
}

s.Page.prototype.execute = function(node, action, outcome) {
    /*Adds the given outcome to the recorded path and carries it out.
    
    Args:
        node (Node): The node containing the chosen action.
        action (Action): The chosen action.
        outcome (Outcome): The resulting outcome.
    */
    st.path.addEdge(
        node.length(),
        node.indexOf(action),
        action.length(),
        action.indexOf(outcome)
    );
    return outcome.carryOut();
}

s.Page.prototype.takeAction = function(psgTitle, index) {
    /*Called when the player selects an action from a node. Uses
    `Page.ready()` to check if the current passage corresponds to a
    node. Before carrying out the resulting outcome, adds to the node
    history (i.e. adds to `st.path`).

    Args:
        psgTitle (str): The title of the passage whose node contains the
            actions to choose from.
        index (integer): The index of the action to take. (Recall that a
            node is a list of actions.)
    */
    this.ready();

    var psg = Story.get(psgTitle);
    var node = s.nodes.get(psg);
    var action = node.get(index);
    var outcome = action.choose();
    return this.execute(node, action, outcome);
}

s.Page.prototype.insertActions = function(psg) {
    /*Takes the given SC Passage object, finds the node associated with
    it, and retrieves the actions from that node. For each action,
    checks if the action should be displayed. If it passes the check,
    adds a link for the corresponding action to the node's action div
    container.

    Uses `Page.ready()` to check if the incoming passage corresponds to
    a node.

    Args:
        psg (<<SC Passage>>): The passage into whose node to insert
            actions.

    Returns:
        Page: The calling `Page` instance.
    */
    this.ready();

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
                    '<<link "' + action.getText() + '">>' +
                        '<<run st.page.takeAction(' +
                            '"' + psgTitle + '", ' + i +
                        ')>>' +
                    '<</link>>' +
                '</p>'
            );
        }
    }
    return this;
}

s.Page.prototype.scrollToLast = function() {
    /*Scrolls to put the body of the innermost passage at the top. If
    currently viewing the 'History' passage, scrolls instead to put the
    actions of the innermost passage at the top.

    Uses `Page.ready()` to check if the incoming passage corresponds to
    a node.

    Returns:
        Page: The calling `Page` instance.
    */
    this.ready();

    var headerHeight;
    var header = document.getElementById('header');
    if (header == null) {
        headerHeight = 0;
    } else {
        headerHeight = header.offsetHeight;
    }

    var section = (passage() === 'History') ? '-actions' : '-body';
    $('html, body').animate({
        scrollTop: (
            $('#' + this.innerPsg().domId + section).position().top -
            headerHeight - 16
        )
    }, 0);
    return this;
}

s.Page.prototype.scrollToFirst = function() {
    /*Scrolls to put the outermost passage at the top.

    Uses `Page.ready()` to check if the incoming passage corresponds to
    a node.

    Returns:
        Page: The calling `Page` instance.
    */
    this.ready();

    jQuery('html,body').animate({scrollTop:0},0);
    return this;
}

s.Page.prototype.embedPsg = function(node, nobreak) {
    /*Removes the current actions from the page, inserts the given node
    into the bottom of the page, appends the page's list of embedded
    passages, updates the page's `_history` attribute, and adds a new
    moment to SC's history. The embedded passage is preceded by a scene
    break ("****") unless the optional `nobreak` argument is true.
    Finally, calls the `offerChoices()` method, whose behavior depends
    on whether there is a 'path' stored in metadata (which should only
    be the case if in autoplay mode).

    Uses `Page.ready()` to check if the incoming passage corresponds to
    a node.

    Args:
        node (Node): The node to embed.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break.

    Returns:
        Page: The calling `Page` instance.

    Raises:
        Error: If trying to embed a passage into itself.
    */
    this.ready();

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
    this.insertPsgText(nodePsg, latestPsg, 0, nobreak);
    this._embeddedPsgs.push(nodePsg.title);
    this._noBreakFlags.push(nobreak);

    this.updateHistory(Story.get(passage()));

    State.create(State.passage);
    Save.autosave.save();
    this.offerChoices();
    return this;
}

s.Page.prototype.offerChoices = function() {
    /*If there is no stored 'path' metadata, inserts action links and
    scrolls to the bottom of the page. Otherwise, enacts the autoplay
    process, using the stored 'path' metadata. Specifically, will read
    the 'pointer' location from metadata and use it to extract from the
    stored 'path' which outcome to carry out. Carries out the outcome
    and updates the 'pointer'.
    */
    var path = recall('path', null);
    if (path === null) {
        this.insertActions(this.innerPsg());
        this.scrollToLast();
        return;
    } else {
        var node = s.nodes.get(this.innerPsg());
        var pointer = recall('pointer');
        var action = node.get(path.getActionIndex(pointer));
        var outcome = action.get(path.getOutcomeIndex(pointer));
        pointer += 1;
        if (pointer < path.length()) {
            memorize('pointer', pointer);
        } else {
            forget('path');
            forget('pointer');
        }
        return this.execute(node, action, outcome);
    }
}

s.Page.prototype.load = function(node, embed, nobreak) {
    /*Checks the debug controller's cheat code and toggles debug mode if
    necessary, runs the given node's `onLoad` function, then renders the
    node's passage.

    If the optional parameter `embed` is true, then rather than
    rendering the passage, the passage's contents are appended to the
    end of the last embedded passage, the page is scrolled to put the
    new passage content at the top, and a new moment is added to SC's
    history. The appended content is preceded by a scene break ("****"),
    unless the optional `nobreak` parameter is true.

    If `node` is an info node or the current passage is not associated
    with a node, `embed` and `nobreak` have no effect.

    Args:
        node (Node): The node to load.
        embed (bool, optional): If `true`, the node's passage will be
            embedded in the currently loaded page. Defaults to the value
            of the calling `Page` instance's `_continuous` attribute.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break when embedding.

    Returns:
        Page: The calling `Page` instance.
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

    if (embed == null) {
        embed = this._continuous;
    }
    if (!this.ready(true) || node instanceof s.InfoNode) {
        embed = false;
    }

    node.onLoad();
    var nodePsg = node.getPassage();
    if (embed) {
        this.embedPsg(node, nobreak);
    } else {
        this._embeddedPsgs = [];
        this._noBreakFlags = [];
        Engine.play(nodePsg.title);
    }
    return this;
}

st.page = new s.Page();
s.preProcText = [];

s.history = new s.InfoNode('History');
s.preProcText.push(['History', function(text) {
    /*Adds the pages in the `_history` attribute of `st.page` to the
    'History' passage, separated by centered scene breaks.

    Args:
        text (str): The passage text to process.

    Returns:
        str: The processed text.

    */
    var arr = [];
    for (var i = 0; i < st.page.pages(); i++) {
        arr.push(st.page.pageToHTML(i));
    }
    return arr.join('\n\n<p style=\"text-align:center\">****</p>\n\n');
}]);

Config.passages.onProcess = function(p) {
    /*Performs all the necessary pre-processing on the passage text.
    Does nothing further if the current passage is not associated with a
    node.

    Rewinds variables to a previous moment to account for embedded
    passages. Variables will be restored on `:passagedisplay`. Then
    processes the node markup.

    Args:
        p (<<abbr SC Passage>>): The abbreviated SC Passage object
            representing the passage being processed.

    Returns:
        str: The processed text.
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

    s.loadVars(st.page.length());
    var processedText = st.parser.procAllMarkup(p.title, text);
    return processedText;
};

s.onStoryReady = function() {
    /*Executes `st.page.scrollToLast()` upon browser refresh. Other,
    more straightforward attempts to code this failed. According to
    Akjosch in the Twine Games Discord server, "The 'problem' here is
    that the modern browsers don't bother to calculate the sizes of
    things which they don't have to render if they can help it, so while
    the structure is there, it's all kinda hidden and wishy-washy until
    the data-init value gets removed, which (via CSS rules) prompts the
    browser to recalculate all relevant sizes and positions. And then
    you can scroll."
    */
    if (!st.page.ready(true)) {
        return;
    }
    var observer = new MutationObserver(function(m) {
        for(var mut of m) {
            if(mut.type === "attributes" && mut.attributeName === "data-init") {
                st.page.scrollToLast();
                observer.disconnect();
            }
        }
    });
    
    observer.observe(document.scrollingElement, {attributes: true});
}

$(document).one(':storyready', s.onStoryReady);

s.onPsgDisplay = function(ev) {
    /*Triggered by the `:passagedisplay` event. First resets variables
    to the current time, to undo any changes made by
    `Config.passages.onProcess`. If loading a new page with nothing
    embedded, adds to the `_history` attribute of `st.page`. Otherwise,
    re-inserts embedded passage text one at a time. Finally, calls the
    `offerChoices()` method, whose behavior depends on whether there is
    a 'path' stored in metadata (which should only be the case if in
    autoplay mode). Does nothing if the current passage is not
    associated with a node.

    Args:
        ev (<<SC passagedisplay event obj>>): The event object passed to
            the  passagedisplay event handler.
    */
    if (s.getNode(ev.passage.title) === undefined) {
        return;
    }

    s.loadVars(0);

    var currentPsg = ev.passage;

    if (st.page.length() === 0) {
        st.page.pushHistory(currentPsg);
    } else {
        var nextPsg, time;
        for (var i = 0; i < st.page.length(); i++) {
            nextPsg = Story.get(st.page.getPsg(i));
            time = st.page.length() - (i + 1)
            st.page.insertPsgText(
                nextPsg, currentPsg, time, st.page.getFlag(i)
            );
            currentPsg = nextPsg;
        }
    }

    st.page.offerChoices();
    return;
}

$(document).on(':passagedisplay', s.onPsgDisplay);

Config.passages.descriptions = function() {
    /*Provides a description of the `this` passage. If `this` is the
    outermost passage of the current page and the node associated with
    the innermost passage has a non-null `_excerpt` attribute, returns
    that attribute as the description. Otherwise, returns `null`,
    triggering SugarCube to use its default excerpt as the description.

    (SC's `Passage.description()` returns the passage object's
    `_excerpt` attribute, if that attribute is not null. See
    https://github.com/tmedwards/sugarcube-2/blob/
    7e13f2665c2df989ccd498d2d7162f58b9392192/src/passage.js#L145)

    Returns:
        str or null: The passage description, if the given passage is
        the current passage and the inner node's `_excerpt` attribute is
        non-null; otherwise, null.
    */
    if (this.title !== passage()) {
        return null;
    }
    var psg = st.page.innerPsg();
    return s.nodes.get(psg).getExcerpt();
}
