/*Uses: DebugController_, Version

Builds and instantiates the `SavesManager` class. Then alters SC's
default saves dialog.

Attributes:
    s.savesMgr (SavesManager): A `SavesManager` instance for use by
        other classes.
*/

s.SavesManager = function(bkMarks, block) {
    /*Manages the autosave, bookmark(s), and checkpoints.

    Args:
        bkMarks (int): Assigned to the `_bkMarks` attribute. Defaults to
            1. Also synchronized to SC's maximum allowed save slots.
        block (bool, optional): Assigned to the `_block` attribute.
            Defaults to `false`.

    Attributes:
        _block (bool): If `true`, will block the loading of saves whose
            version does not match the current version.
        _bkMarks (int): The maximum number of allowed bookmarks.
    */
    this._block = (block == null) ? false : block;
    this._bkMarks = (bkMarks == null) ? 0 : bkMarks;
    this._setMaxSaves();
    return this;    
};

s.SavesManager.prototype._setMaxSaves = function() {
    /*Sets the maximum number of allows saves in SugarCube.
    */
    Config.saves.slots = this._bkMarks;
}

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

s.SavesManager.prototype.setBkMarks = function(bkMarks) {
    /*Sets the `_bkMarks` attribute and syncs it with SC's maximum
    allowed save slots.

    Args:
        bkMarks (int): Assigned to the `_bkMarks` attribute of the
            calling instance.

    Returns:
        SavesManager: The calling instance.
    */
    this._bkMarks = bkMarks;
    this._setMaxSaves();
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

s.SavesManager.prototype.saveBkMark = function() {
    /*If there is an empty bookmark slot, saves a bookmark after
    confirming with the player; otherwise, alerts that no bookmarks
    slots are available.

    Returns:
        SavesManager: The calling instance.
    */
    var filled = Save.slots.count();
    var empty = this._bkMarks - filled;
    if (empty > 0) {
        if (confirm(
            'Save bookmark? You have ' + empty + ' of ' + this._bkMarks +
                ' remaining.\n\n' +
            '(If you just want to quit and resume later, you should not need ' +
                'to save. See the info screen for details.)'
        )) {
            Save.slots.save(filled);
        }
    } else {
        alert('All bookmarks already filled. Restart to delete them.');
    }
    return this;
}

s.savesMgr = new s.SavesManager();

$(document).on(':dialogopened', function (ev) {
    /*Alters SC's saves dialog by changing the title to 'Bookmarks',
    showing only filled save slots, removing the autosave from the
    display, removing the bottom button bar, and removing the delete
    buttons if debug mode is not on.
    */
    if (Dialog.isOpen('saves')) {
        $('#ui-dialog-title').html('Bookmarks');
        $('#saves-list').find('tr:gt(' + Save.slots.count() + ')').remove();
        $('tr:first-child').remove();
        $(ev.target).children('ul.buttons').remove();
        if (!ss.debugOn) {
            $('button[id^="saves-delete"]').remove();
        }
    }
});
