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