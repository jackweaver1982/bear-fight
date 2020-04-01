/*
Global objects scattered throughout code:
----
from Node.js:
    s.nodes : Map(<<SC Passage obj>> : Node)
    s.getNode(psgTitle: String): Node
    s.specialPassages : String[]
from Parser.js:
    st.parser : Parser
*/

Config.passages.nobr = true; // sets all passages to `nobr`

window.onerror = function(msg, url, linenumber) {
    /*
    Ensures that errors appear in a pop-up for greater visibility. Works
    in Firefox, but doesn't seem to work in Safari. Be sure to do
    testing in Firefox.
    */
    alert(
        'Error message: ' + msg + '\n' +
        'URL: ' + url + '\n' +
        'Line Number: ' + linenumber
    );
    return true;
}

s.makeLink = function(startPsgTitle, text, endPsgTitle,
                      func, embed, nobreak) {
    /*
    Creates a new Outcome that runs `func`, then loads the node
    associated with `endPsgTitle`. Then adds that Outcome to a new
    Action with the given `text` as its link text. Then adds that Action
    to the associated with `startPsgTitle`. The target node is loaded
    with the optional `embed` and `nobreak` parameters.

    If there are no nodes associated with the given passage titles, they
    will be created.

    Returns the newly created action.
    */
    var startNode = s.nodes.get(Story.get(startPsgTitle));
    if (startNode === undefined) {
        startNode = new s.Node(startPsgTitle);
    }

    var targetNode = s.nodes.get(Story.get(endPsgTitle));
    if (targetNode === undefined) {
        targetNode = new s.Node(endPsgTitle);
    }

    var outcome;
    if (func === undefined) {
        outcome = new s.Outcome(function() {
            st.page.load(targetNode);
        });
    } else {
        outcome = new s.Outcome(function() {
            func();
            st.page.load(targetNode, embed, nobreak);
        });
    }

    var action = new s.Action(text).push(outcome);
    startNode.push(action);
    return action;
}

s.none = function() { return; } // for convenience when passing an empty
                                // function as a parameter

st.page = new s.Page();

Config.passages.onProcess = function(p) {
    /*
    Rewinds variables to a previous moment to account for embedded
    passages. Variables will be restored on `:passagedisplay`. Then
    processes the node markup.
    */
    s.loadVars(-st.page.length());
    var processedText = st.parser.procAllMarkup(
        p.title, p.text
    );
    return processedText;
};

s.onPsgDisplay = function(ev) {
    /*
    Triggered by the `:passagedisplay` event. Rebuilds the current page.
    */
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

Config.saves.autosave = true;

Config.saves.isAllowed = function () {
    return (passage() !== 'Start' || st.page.length() > 0);
};

$(window).bind('beforeunload pagehide',function(){
   Engine.restart();
});