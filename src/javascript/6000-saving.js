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

$(window).bind('beforeunload pagehide', function(){
    /*
    Restarts story on browser refresh.

    The normal (and preferred) behavior in SC is for a browser refresh
    to leave the story in the same state, essentially reloading the
    current moment. But with embedded passages, the current displayed
    text could be quite long and it's important that at the end of
    reloading, the page is scrolled to the bottom.

    In it's current implementation, the browser refresh takes too long,
    so the scroll function is executed too early and has no effect.
    There doesn't seem to be any way to time it reliably, so the
    workaround is to have the story restart upon browser refresh, and
    have the `Start` passage offer a way to resume the story by loading
    the autosave.
    */
    Engine.restart();
});