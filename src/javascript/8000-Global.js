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

s.addLink = function(startPsgTitle, text, endPsgTitle,
                      func, checkFunc, embed, nobreak) {
    /*
    Creates a new Outcome that runs `func`, then loads the node
    associated with `endPsgTitle`. Then adds that Outcome to a new
    Action with the given `text` as its link text. Then adds that Action
    to the associated with `startPsgTitle`. The target node is loaded
    with the optional `embed` and `nobreak` parameters. The action is
    given `checkFunc` as its check function.

    If there are no nodes associated with the given passage titles, they
    will be created.
    */
    var startNode = s.nodes.get(Story.get(startPsgTitle));
    if (startNode === undefined) {
        startNode = new s.Node(startPsgTitle);
    }

    var targetNode = s.nodes.get(Story.get(endPsgTitle));
    if (targetNode === undefined) {
        targetNode = new s.Node(endPsgTitle);
    }

    var carryOutFunc;
    if (func == null) {
        carryOutFunc = function() {
            st.page.load(targetNode);
        }
    } else {
        carryOutFunc = function() {
            func();
            st.page.load(targetNode, embed, nobreak);
        }
    }

    startNode.addAction(text, carryOutFunc, checkFunc);
    return;
}

s.setSubCount = function(psgTitle, num) {
    /*
    Sets the sub count of the node associated with `psgTitle` to `num`.
    Returns the associated node.
    */
    return s.getNode(psgTitle).setSubCount(num);
}

s.copyActions = function(fromPsgTitle, toPsgTitle) {
    /*
    For each action in the node associated with `fromPsgTitle`, pushes
    that action to the node associated with `toPsgTitle`.
    */
    var fromNode = s.getNode(fromPsgTitle);
    var toNode = s.getNode(toPsgTitle);
    for (var i = 0; i < fromNode.length(); i++) {
        toNode.push(fromNode.get(i));
    }
    return;
}

Config.saves.autosave = true;

Config.saves.isAllowed = function () {
    var allowed = true;
    if (passage() ===  'Start' && st.page.length() === 0) {
        allowed = false;
    }
    if (s.getNode(passage()) instanceof s.InfoNode) {
        allowed = false;
    }
    return allowed;
};

$(window).bind('beforeunload pagehide',function(){
   Engine.restart();
});

st.page = new s.Page();

Config.passages.onProcess = function(p) {
    /*
    Rewinds variables to a previous moment to account for embedded
    passages. Variables will be restored on `:passagedisplay`. Then
    processes the node markup. Does nothing if the current passage is
    not associated with a node.
    */
    if (s.getNode(p.title) === undefined) {
        return p.text;
    }

    s.loadVars(-st.page.length());
    var processedText = st.parser.procAllMarkup(
        p.title, p.text
    );
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

s.loadNode = function(psgTitle) {
    st.page.load(s.getNode(psgTitle));
    return;
}

s.loadInfoNode = function(psgTitle, checkFunc) {
    /*
    If `psgTitle` is associated with an info node, loads the info node.
    If `psgTitle` is associated with a non-info node, throws an error.
    If `psgTitle` is not associated with a node, creates a new info
    node with the given parameters and loads it.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        var newNode = new s.InfoNode(psgTitle, checkFunc);
        st.page.load(newNode);
        return;
    }
    if (node instanceof s.InfoNode) {
        st.page.load(node);
        return;
    }
    throw new Error(
        'loadInfoNode():\n' +
        '"' + psgTitle + '" is not an info node'
    );
}