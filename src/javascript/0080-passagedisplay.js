/*
This file records the `:passagedisplay` event handlers.
*/

//----------------------------------------------------------------------

s.insertTextSubstitutions = function(ev) {
    /*
    Inserts the text substitutions for the node corresponding to the
    incoming passage. Silently fails if there is no such node.
    */
    try {
        var node = s.getNode(ev.passage.title);
    }
    catch (e) {
        return;
    }
    var subCount = node.getSubCount();
    for (var i = 0; i < subCount; i++) {
        $.wiki(
            '<<append "#sub' + i.toString() + '">>' +
            node.getTextSub(i) +
            '<</append>>'
        );
    }
    return;
}

$(document).on(':passagedisplay', s.insertTextSubstitutions);

//----------------------------------------------------------------------

s.insertActionDiv = function(ev) {
    /*
    Insert a container to hold the action links.
    */
    $.wiki(
        '<<append "#' + ev.passage.domId + '">>' +
            '<div id="actions"></div>' +
        '<</append>>'
    );
}

$(document).on(':passagedisplay', s.insertActionDiv);

//----------------------------------------------------------------------

s.refreshActionLinks = function(ev) {
    /*
    Deletes the contents of the action container, then inserts links for
    the actions contained in the node corresponding to the incoming
    passage. Silently fails if there is no such node.
    */
    $.wiki('<<replace "#actions">><</replace>>');
    try {
        var node = s.getNode(ev.passage.title);
    }
    catch (e) {
        return;
    }
    for (var i = 0; i < node.length(); i++) {
        var actionId = node.get(i);
        var text = v[actionId].getText();
        $.wiki(
            '<<append "#' + ev.passage.domId + '">>' +
                '<p><<link "' + text + '">>' +
                    '<<run v["' + actionId + '"].choose().carryOut()>>' + 
                '<</link>></p>' +
            '<</append>>'
        );
    }
}

$(document).on(':passagedisplay', s.refreshActionLinks);

