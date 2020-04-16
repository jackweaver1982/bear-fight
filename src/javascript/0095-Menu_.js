/*
The `Menu` object will contain functionality to resume the story by
loading a save file. As such we need to instantiate the `SavesManager`
object and set some SC save configurations.

The `Menu` object will also contain functionality to restart the story.
But because of a technical issue, we need to redefine how SC restarts
the story. Hence, we do both these things before defining the `Menu`
class.

The normal (and preferred) behavior in SC is for a browser refresh to
leave the story in the same state, essentially reloading the current
moment. But with embedded passages, the current displayed text could be
quite long and it's important that at the end of reloading, the page is
scrolled to the bottom.

In it's current implementation, the browser refresh takes too long, so
the scroll function is executed too early and has no effect. There
doesn't seem to be any way to time it reliably, so the workaround is to
have the story restart upon browser refresh, and have the `Start`
passage offer a way to resume the story by loading the autosave.

Ideally, the behavior of the 'Restart' button in the UI bar should be
modified to accommodate this change. But its behavior is fixed, so we
instead opt to remove it. A custom restart button should be added to
preserve the desired functionality.
*/

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

$('#menu-item-restart').remove() // remove default Restart button

$(window).bind('beforeunload pagehide', function(){
    Engine.restart();
});

$(document).one(':enginerestart', function (ev) {
    /*
    To perform a 'hard restart' (i.e. to delete the autosave before
    restarting), set 'hardRestart' to true in the metadata before
    restarting.
    */
    if (recall('hardRestart', false)) {
        Save.autosave.delete();
        forget('hardRestart');
    }
});

st.page = new s.Page(); // need the Page instance in the below function

s.restart = function() {
    /*
    In general, this custom restart function is preferred over
    `Engine.restart()` and is what should be triggered by any 'restart'
    menu items.

    In general, this function performs a hard restart. If it was called
    from the `Start` passage with no embedded nodes, sets 'autoBegin' to
    true in the metadata. The start passage can use this metadata to
    avoid needing to click both restart and begin.
    */
    memorize('hardRestart', true);
    if (passage() === 'Start' && st.page.length() === 0) {
        memorize('autoBegin', true);
    }
    Engine.restart();
}

s.Menu = function() {
    /*
    A `Menu` object is an `ActionList` with built-in `begin`, `resume`,
    and `restart` actions. The `restart` method is kept at the end of
    the list. The `begin` method is customizable. These actions are
    automatically inserted into various areas of the story (such as the
    header under normal circumstance, the UI bar in debug mode, and the
    bottom of the `Start` passage.)
    */
    s.ActionList.call(this, true);
    this.addAction(
        'restart',
        function() {
            if (confirm('Really restart?')) {
                s.restart();
            }
        },
        function() {
            return (
                passage() !== 'Start' ||
                st.page.length() > 0 ||
                Save.autosave.has()
            );
        }
    );
    this.addAction(
        'begin',
        null,
        function() {
            return (
                passage() === 'Start' &&
                st.page.length() === 0 &&
                !Save.autosave.has()
            );
        }
    );
    this.addAction(
        'resume',
        function() {
            s.savesMgr.load(0);
        },
        function() {
            return (
                passage() === 'Start' &&
                st.page.length() === 0 &&
                Save.autosave.has()
            );
        }
    );
    return this;
};

s.Menu.prototype = Object.create(s.ActionList.prototype);

Object.defineProperty(s.Menu.prototype, 'constructor', {
    value: s.Menu,
    enumerable: false,
    writable: true
});

s.Menu.prototype.addAction = function(text, carryOutFunc, checkFunc) {
    /*
    @override

    This method is for adding a simple action with one outcome to the
    list. It creates an outcome that executes `carryOutFunc`, adds it as
    the single outcome to a new action with link text `text` and check
    function `checkFunc`. The default behavior of `checkFunc` is to
    allow the action if not on the start screen.
    */
    if (checkFunc === undefined) {
        checkFunc = function() {
            return (passage() !== `Start` || st.page.length() > 0);
        }
    }
    return s.ActionList.prototype.addAction.call(
        this, text, carryOutFunc, checkFunc
    );
}

s.Menu.prototype.onBegin = function(func) {
    /*
    Sets the `begin` action to carry out the given function.
    */
    this.delete(0);
    this.addAction('begin', func, function() {
            return (
                passage() === 'Start' &&
                st.page.length() === 0 &&
                !Save.autosave.has()
            );
        }, 0);
    return this;
}