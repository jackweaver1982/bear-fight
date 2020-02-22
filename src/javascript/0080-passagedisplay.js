/*
This file records the `:passagedisplay` event handlers.
*/

//----------------------------------------------------------------------

s.insertTextSubstitutions = function(passage) {
    /*
    Inserts the text substitutions for the node corresponding to the
    incoming passage. Silently fails if there is no such node.

    @param {String} passage - Title of the incoming passage.
    */
    try {
        var node = s.getNode(passage);
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

$(document).on(':passagedisplay', function(ev) {
    s.insertTextSubstitutions(ev.passage.title);
    return;
});

//----------------------------------------------------------------------

s.insertActionDiv = function(psgObject) {
    /*
    Insert a container to hold the action links.

    @param {SugarCube Passage object} psgObject - The passage object
    corresponding to the incoming passage.
    */
    $.wiki(
        '<<append "#' + psgObject.domId + '">>' +
            '<div id="actions"></div>' +
        '<</append>>'
    );
}

$(document).on(':passagedisplay', function(ev) {
    s.insertActionDiv(ev.passage);
    return;
});

//----------------------------------------------------------------------

s.refreshActionLinks = function(passage) {
    /*
    Deletes the contents of the action container, then inserts links for
    the actions contained in the node corresponding to the incoming
    passage. Silently fails if there is no such node.

    @param {String} passage - Title of the incoming passage.
    */
    try {
        var node = s.getNode(passage);
    }
    catch (e) {
        return;
    }
    $.wiki('<<replace "#actions">><</replace>>');
    for (var i = 0; i < node.length(); i++) {
        var actionId = node.get(i);
        var text = v[actionId].getText();
        $.wiki(
            '<<append "#actions">>' +
                '<p><<link "' + text + '">>' +
                    '<<run v["' + actionId + '"].choose().carryOut()>>' + 
                '<</link>></p>' +
            '<</append>>'
        );
    }
}

$(document).on(':passagedisplay', function(ev) {
    s.refreshActionLinks(ev.passage.title);
    return;
});

