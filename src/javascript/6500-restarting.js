/*
The normal (and preferred) behavior in SC is for a browser refresh to
leave the story in the same state, essentially reloading the current
moment. But with embedded passages, the current displayed text could be
quite long and it's important that at the end of reloading, the page is
scrolled to the bottom.

In it's current implementation, the browser refresh takes too long, so
the scroll function is executed too early and has no effect. There
doesn't seem to be any way to time it reliably, so the workaround is to
have the story restart upon browser refresh, and have the `Start`
passage offer a way to resume the story by loading the autosave.

Ideally, the behavior of the 'Restart' button in the UI bar should be
modified to accommodate this change. But its behavior is fixed, so we
instead opt to remove it. A custom restart button should be added to
preserve the desired functionality.
*/

$('#menu-item-restart').remove() // remove Restart button

$(window).bind('beforeunload pagehide', function(){
    Engine.restart();
});

$(document).one(':enginerestart', function (ev) {
    /*
    To perform a 'hard restart' (i.e. to delete the autosave before
    restarting), set 'hardRestart' to true in the metadata before
    restarting.
    */
    if (recall('hardRestart', false)) {
        Save.autosave.delete();
        forget('hardRestart');
    }
});

s.restart = function() {
    /*
    In general, this custom restart function is preferred over
    `Engine.restart()` and is what should be triggered by any 'restart'
    menu items.

    In general, this function performs a hard restart. If it was called
    from the `Start` passage with no embedded nodes, sets 'autoBegin' to
    true in the metadata. The start passage can use this metadata to
    avoid needing to click both restart and begin.
    */
    memorize('hardRestart', true);
    if (passage() === 'Start' && st.page.length() === 0) {
        memorize('autoBegin', true);
    }
    Engine.restart();
}