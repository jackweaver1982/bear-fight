s.menu = new s.Menu();

s.menuMarkup = function() {
    /*
    Returns the text of the SC markup that renders the links in the
    displayed menu bar.
    */
    var text = '';
    var action;
    for (var i = 0; i < s.menu.length(); i++) {
        action = s.menu.get(i);
        if (!action.check()) {
            continue;
        }
        if (text !== '') {
            text += ' / ';
        }
        text += (
            '<<link "' + action.getText() + '">>' +
                '<<run s.menu.get(' + i + ').choose().carryOut()>>' +
            '<</link>>'
        );
    }
    return text;
}

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

s.preProcText.push(['StoryMenu', function(text) {
    /*
    Adds the menu to the UI bar if it is visible and the current passage
    allows the menu.
    */
    if (!UIBar.isHidden() && !tags().includes('no-menu')) {
        return s.menuMarkup();
    } else {
        return '';
    }
}]);

s.preProcText.push(['PassageHeader', function(text) {
    /*
    Adds the menu to the header with the sticky class if the current passage
    allows it, unless currently at the Start passage. Otherwise, adds a
    line break to compensate for the reduced upper margin (needed to
    have the sticky class work as intended).
    */
    return (
        '<<if !tags().includes("no-menu") && passage() !== "Start">>' +
            '<div class="sticky"><br>' +
                s.menuMarkup() + '<br><hr>' +
            '</div>' +
        '<<else>>' +
            '<br>' +
        '<</if>>'
    );
}]);

s.preProcText.push(['Start', function(text) {
    /*
    Adds the menu to the bottom of the Start passage.
    */
    return text += (
        '<br><div style="text-align:center">' +
        s.menuMarkup() +
        '</div>'
    );
}]);

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