/*
This file encodes the passage post-processing of the node system,
including inserting action links for the corresponding node.
*/

s.insertActionLinks = function(passage) {
    /*
    For each action in the node corresponding to the given SC passage
    object, this function checks if the action should be displayed. If
    it passes the check, it adds a link for the corresponding action.
    Does nothing if the incoming passage does not correspond to a node.
    */
    var node = s.nodes.get(passage);
    if (node === undefined) {
        return;
    }

    var psgTitle = passage.title;
    var psgId = passage.domId;
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
}

s.reEmbedPsgs = function(passage) {
    /*
    Re-embeds embedded passages when the main containing passage
    renders.
    */
    var currentPsg = passage;
    var nextPsg;
    for (var i = 0; i < v.embeddedPsgs.length; i++) {
        nextPsg = Story.get(v.embeddedPsgs[i]);
        $('#' + currentPsg.domId + '-next').wiki(
            nextPsg.processText()
        );
        currentPsg = nextPsg;
    }
}

$(document).on(':passagedisplay', function (ev) {
    s.reEmbedPsgs(ev.passage);

    var len = v.embeddedPsgs.length;
    var currentPsg;
    if (len == 0) {
        currentPsg = ev.passage;
    } else {
        currentPsg = Story.get(v.embeddedPsgs[len - 1]);
    }
    s.insertActionLinks(currentPsg);

    $('html').animate({
        scrollTop: $('#' + currentPsg.domId + '-body').position().top
    }, 0);

    return;
});