/*
Global objects scattered throughout code:
----
from Node.js:
    s.nodes : Map(<<SC Passage obj>> : Node)
    s.getNode(psgTitle: String): Node
    s.specialPassages : String[]
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

s.makeLink = function(startPsgTitle, text, endPsgTitle, func) {
    /*
    Calls the `addLink` method of the node associated with
    `startPsgTitle`, passing it the other parameters. If no such node
    exists, one is created.
    */
    var startNode = s.nodes.get(Story.get(startPsgTitle));
    if (startNode === undefined) {
        startNode = new s.Node(startPsgTitle);
    }

    return startNode.addLink(text, endPsgTitle, func);
}

v.parser = new s.Parser();

Config.passages.onProcess = function (p) {
    var processedText = v.parser.procAllMarkup(p.title, p.text);
    return processedText;
};

v.page = new s.Page();

$(window).on('beforeunload', function(){
    State.metadata.set('reloading', true);
    return;
});

s.rebuildPage = function(ev) {
    /*
    Pauses before rebuilding page if page was just reloaded. Otherwise,
    the scrollToLast method executes too soon and has no effect.
    */
    if (State.metadata.get('reloading')) {
        setTimeout(function() {
            v.page.rebuildPage(ev.passage);
            return;
        }, 500);
        State.metadata.set('reloading', false);
    } else {
        v.page.rebuildPage(ev.passage);
    }
    return;
}

$(document).on(':passagedisplay', s.rebuildPage);