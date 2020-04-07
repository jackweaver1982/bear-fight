s.DebugController = function() {
    /*
    The Debug Controller controls debug mode, a developer mode that can
    be used to activate certain capabilities and functionalities not
    present in ordinary gameplay. The state of debug mode is stored in
    the boolean property `debugOn` in SugarCube's `settings` namespace,
    which has `ss` as an alias.
    */
    return this;    
};

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