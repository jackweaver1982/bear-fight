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

s.savesMgr = new s.SavesManager();