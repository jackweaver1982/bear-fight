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

$(window).bind('beforeunload pagehide',function(){
    /*
    Restarts story on browser refresh. Without this, refresh takes too
    long and that prevents the scrolling to the current content in long
    chains of embedded passages.
    */
    Engine.restart();
});