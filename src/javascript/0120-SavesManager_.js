// Version

s.SavesManager = function(block) {
    /*
    A `SavesManager` object manages the autosave, the bookmark(s), and
    any checkpoints that might have been created.

    @property {Boolean} block - If true, will block the loading of saves
    whose version does not match the current version. Defaults to false.
    */
    if (block == null) {
        this._block = false;
    } else {
        this._block = block;
    }
    return this;    
};

s.SavesManager.prototype.setBlock = function(bool) {
    this._block = bool;
    return this;
}

s.SavesManager.prototype.get = function(num) {
    /*
    Returns the save whose label in the saves dialog box matched `num`.
    If `num` is 0, returns the autosave.
    */
    if (num === 0) {
        return Save.autosave.get();
    } else {
        return Save.slots.get(num - 1);
    }
}

s.SavesManager.prototype.load = function(num) {
    /*
    Loads the save whose label in the saves dialog box matched `num`. If
    `num` is 0, loads the autosave.
    */
    if (this._block) {
        var verInt = this.get(num).version;
        if (verInt !== s.version.asInteger()) {
            var verStr = s.version.intToStr(verInt);
            alert(
                'save file is from version ' + verStr + ';\n' +
                'current version is ' + s.version.asString() + ';\n' + 
                'unable to load.'
            );
            return;
        }
    }
    if (num === 0) {
        Save.autosave.load();
    } else {
        Save.slots.load(num - 1);
    }
    return this;
}

s.savesMgr = new s.SavesManager();