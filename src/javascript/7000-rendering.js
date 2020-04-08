st.page = new s.Page();

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
    if (p.title === 'PassageHeader') {
        text = (
            '<<if !tags().includes("no-header")>><div class="sticky"><br>' +
            text +
            '</div><</if>>'
        );
    }
    if (p.tags.includes('no-header')) {
        text = '<br>\n' + text;
    }

    if (s.getNode(p.title) === undefined) {
        return text;
    }

    s.loadVars(-st.page.length());
    var processedText = st.parser.procAllMarkup(p.title, text);
    return processedText;
};

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