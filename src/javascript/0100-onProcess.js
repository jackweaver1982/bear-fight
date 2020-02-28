/*
This files records the `onProcess` event handlers, which are triggered
just before SugarCube processes the raw text of an incoming passage.
*/

//----------------------------------------------------------------------

s.addContainers = function(text) {
    /*
    Take the given text, which represents the raw text of a passage, and
    wraps it in a container for grabbing the narrative content later. It
    then adds containers for the header, the footer, and the action
    links.

    Returns the modified text.
    */
    console.log('Original:\n' + text);
    var modifiedText = (
        '<div id="header"></div>' +
        '<div id="narrative">' + text + '</div>' +
        '<div id="actions"></div>' +
        '<div id="footer"></div>'
    );
    console.log('Modified:\n' + modifiedText);
    return modifiedText;
}

//----------------------------------------------------------------------

Config.passages.onProcess = function(passage) {
    return s.addContainers(passage.text);
};
