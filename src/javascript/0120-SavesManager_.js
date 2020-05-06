/*Uses: Version

Builds and instantiates the `SavesManager` class.

Attributes:
    s.savesMgr (SavesManager): A `SavesManager` instance for use by
        other classes.
*/

s.SavesManager = function(block) {
    /*Manages the autosave, bookmark(s), and checkpoints.

    Args:
        block (bool, optional): Assigned to the `_block` attribute.
            Defaults to `false`.

    Attributes:
        _block (bool): If `true`, will block the loading of saves whose
            version does not match the current version.
    */
    if (block == null) {
        this._block = false;
    } else {
        this._block = block;
    }
    return this;    
};

s.SavesManager.prototype.setBlock = function(block) {
    /*Sets the `_block` attribute.

    Args:
        block (bool): Assigned to the `_block` attribute of the calling
            instance.

    Returns:
        SavesManager: The calling instance.
    */
    this._block = block;
    return this;
}

s.SavesManager.prototype.get = function(num) {
    /*Fetches save objects by their label in the saves dialog box. Saves
    are numbered in the saves dialog box starting with 1.

    Args:
        num (int): The label whose save to retrieve. If 0, retrieves the
            autosave.

    Returns:
        <<SC save obj>>: The retrieved save object.
    */
    if (num === 0) {
        return Save.autosave.get();
    } else {
        return Save.slots.get(num - 1);
    }
}

s.SavesManager.prototype.load = function(num) {
    /*Loads save objects by their label in the saves dialog box. Saves
    are numbered in the saves dialog box starting with 1.

    Blocks the load if the calling instance's `_block` is true and the
    version number of the save object doesn't match the current version
    number.

    Args:
        num (int): The label whose save to load. If 0, loads the
            autosave.

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
    return;
}

s.savesMgr = new s.SavesManager();