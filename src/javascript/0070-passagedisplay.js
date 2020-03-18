/*
This file encodes the passage post-processing of the node system,
including inserting action links for the corresponding node.
*/

s.insertActionLinks = function(passage) {
    /*
    For each action in the node corresponding to the incoming passage,
    this function checks if the action should be displayed. If it passes
    the check, it adds a link for the corresponding action. Does nothing
    if the incoming passage does not correspond to a node.

    @param {SC passage object} passage - the incoming passage
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

$(document).on(':passagedisplay', function (ev) {
    s.insertActionLinks(ev.passage);
});