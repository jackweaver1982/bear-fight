/*
This file records the `:passagestart` event handlers.
*/

//----------------------------------------------------------------------

s.insertHeader = function(content) {
    /*
    Inserts the custom header passage, `:: NodeHeader`.
    */
    if (Story.has('NodeHeader')) {
        $(content).wiki(
            '<<include "NodeHeader">>'
        );
    }
    return;
}

$(document).on(':passagestart', function(ev) {
    s.insertHeader(ev.content);
    return;
});