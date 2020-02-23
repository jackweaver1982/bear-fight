/*
This file records the `:passagerender` event handlers.
*/

//----------------------------------------------------------------------

s.insertActionsDiv = function(content) {
    /*
    Inserts the container into which action links will be placed.
    */
    $(content).wiki(
        '<div id="actions"></div>'
    );
    return;
}

s.insertFooter = function(content) {
    /*
    Inserts the custom header passage, `:: NodeFooter`.
    */
    if (Story.has('NodeFooter')) {
        $(content).wiki(
            '<<include "NodeFooter">>'
        );
    }
    return;
}

$(document).on(':passagerender', function(ev) {
    s.insertActionsDiv(ev.content);
    s.insertFooter(ev.content);
    return;
});