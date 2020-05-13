/*Uses: standard.

Builds the `DebugController` class and instantiates it. Then adds the
`debugOn` boolean variable to `settings`, adds a toggle switch for it to
the setting menu in the UI Bar, and binds the relevant methods to the UI
toggle switch.

Attributes:
    s.debCon (DebugController): A `DebugController` instance for use by
        other classes.
    ss.debugOn (bool): `true` if debug mode is on, `false` otherwise.
*/

s.DebugController = function() {
    /*The Debug Controller controls debug mode, a developer mode that
    can be used to activate certain capabilities and functionalities not
    present in ordinary gameplay. The state of debug mode is stored in
    the boolean property `debugOn` in SugarCube's `settings` namespace,
    which has `ss` as an alias.

    Attributes:
        _cheaCode (arr of str): An array of passage title strings.
            Loading the nodes associated to these passage titles in the
            given order toggles the state of debug mode.
    */
    this._cheatCode = [];
    return this;    
};

s.DebugController.prototype.getCheat = function() {
    /*Fetches the `_cheaCode` attribute.

    Returns:
        arr of str: The `_cheatCode` attribute of the calling
            instance.
    */
    return this._cheatCode;
}

s.DebugController.prototype.setCheat = function(psgTitles) {
    /*Sets the `_cheatCode` attribute.

    Args:
        psgTitles (arr of str): Assigned to the `_cheatCode` attribute
            of the calling instance.

    Returns:
        DebugController: The calling instance.
    */
    this._cheatCode = psgTitles;
    return this;
}

s.DebugController.prototype.checkUIBar = function() {
    /*By default, SugarCube's UI Bar is only visible during debug mode.
    This method ensures that the UI Bar is in the correct state.

    Returns:
        DebugController: The calling instance.
    */
    if (ss.debugOn) {
      UIBar.unstow().show();
    } else {
      UIBar.hide().stow();
    }
    return this;
}

s.DebugController.prototype.onInit = function() {
    /*Runs on story initialization.
    */
    this.checkUIBar();
    return;
}

s.DebugController.prototype.onChange = function() {
    /*Runs when the debug state changes. Refreshes the current passage
    in order to display visible changes that might occur with the state
    change.
    */
    this.checkUIBar();
    Engine.show();
    return;
}

s.DebugController.prototype.toggle = function() {
    /*Toggles the debug state.

    Returns:
        DebugController: The calling instance.
    */
    ss.debugOn = !ss.debugOn;
    Setting.save();
    this.onChange();
    return this;
}

s.debCon = new s.DebugController();

Setting.addToggle('debugOn', {
    label:      'debug mode',
    onInit:     s.debCon.onInit.bind(s.debCon),
    onChange:   s.debCon.onChange.bind(s.debCon)
});
