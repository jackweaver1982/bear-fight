// standard

s.DebugController = function() {
    /*
    The Debug Controller controls debug mode, a developer mode that can
    be used to activate certain capabilities and functionalities not
    present in ordinary gameplay. The state of debug mode is stored in
    the boolean property `debugOn` in SugarCube's `settings` namespace,
    which has `ss` as an alias.

    @property {Array} _cheatCode - An array of passage title strings.
    Loading the nodes associated to these passage titles in the given
    order toggles the state of debug mode.
    */
    this._cheatCode = [];
    return this;    
};

s.DebugController.prototype.getCheat = function() {
    return this._cheatCode;
}

s.DebugController.prototype.setCheat = function(psgTitles) {
    this._cheatCode = psgTitles;
    return this;
}

s.DebugController.prototype.checkUIBar = function() {
    /*
    By default, SugarCube's UI Bar is only visible during debug mode.
    This method ensures that the UI Bar is in the correct state.
    */
    if (ss.debugOn) {
      UIBar.unstow().show();
    } else {
      UIBar.hide().stow();
    }
    return this;
}

s.DebugController.prototype.onInit = function() {
    /*
    Runs on story initialization.
    */
    this.checkUIBar();
    return;
}

s.DebugController.prototype.onChange = function() {
    /*
    Runs when the debug state changes. Refreshes the current passage in
    order to display visible changes that might occur with the state
    change.
    */
    this.checkUIBar();
    Engine.show();
    return;
}

s.DebugController.prototype.toggle = function() {
    /*
    Toggles the debug state.
    */
    ss.debugOn = !ss.debugOn;
    Setting.save();
    this.onChange();
    return this;
}

s.debCon = new s.DebugController();

Setting.addToggle('debugOn', {
    /*
    Adds the `debugOn` boolean variable to `settings` and adds a toggle
    switch for it to the setting menu in the UI Bar. Binds the relevant
    `debCon` methods to the UI toggle switch.
    */
    label:      'debug mode',
    onInit:     s.debCon.onInit.bind(s.debCon),
    onChange:   s.debCon.onChange.bind(s.debCon)
});