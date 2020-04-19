// SavesManager_, ActionList, Page_

/*
The `Menu` object will contain functionality to restart the story. But
because of a technical issue, we need to redefine how SC restarts the
story. Hence, we do both these things before defining the `Menu` class.

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
                Save.autosave.has()
            );
        }
    );
    this.onBegin();
    this.addAction(
        'resume',
        function() {
            s.savesMgr.load(0);
        },
        function() {
            return (
                passage() === 'Start' &&
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

s.Menu.prototype.addAction = function(text, carryOutFunc, checkFunc, index) {
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
            return (passage() !== `Start`);
        }
    }
    return s.ActionList.prototype.addAction.call(
        this, text, carryOutFunc, checkFunc, index
    );
}

s.Menu.prototype.onBegin = function(func) {
    /*
    Sets the `begin` action to carry out the given function.
    */
    if (this.get(0).getText() === 'begin') {
        this.delete(0);
    }
    this.addAction('begin', func, function() {
        return (
            passage() === 'Start' &&
            !Save.autosave.has()
        );
    }, 0);
    return this;
}

s.menu = new s.Menu();

s.menuMarkup = function() {
    /*
    Returns the text of the SC markup that renders the links in the
    displayed menu bar.
    */
    var text = '';
    var action;
    for (var i = 0; i < s.menu.length(); i++) {
        action = s.menu.get(i);
        if (!action.check()) {
            continue;
        }
        if (text !== '') {
            text += ' / ';
        }
        text += (
            '<<link "' + action.getText() + '">>' +
                '<<run s.menu.get(' + i + ').choose().carryOut()>>' +
            '<</link>>'
        );
    }
    return text;
}

s.preProcText.push(['StoryMenu', function(text) {
    /*
    Adds the menu to the UI bar if it is visible and the current passage
    allows the menu.
    */
    if (!UIBar.isHidden() && !tags().includes('no-menu')) {
        return s.menuMarkup();
    } else {
        return '';
    }
}]);

s.preProcText.push(['PassageHeader', function(text) {
    /*
    Adds the menu to the header with the sticky class if the current passage
    allows it, unless currently at the Start passage. Otherwise, adds a
    line break to compensate for the reduced upper margin (needed to
    have the sticky class work as intended).
    */
    return (
        '<<if !tags().includes("no-menu") && passage() !== "Start">>' +
            '<div class="sticky"><br>' +
                s.menuMarkup() + '<br><hr>' +
            '</div>' +
        '<<else>>' +
            '<br>' +
        '<</if>>'
    );
}]);

s.preProcText.push(['Start', function(text) {
    /*
    Adds the menu to the bottom of the Start passage.
    */
    return (
        text + '<br>' +
        '<div style="text-align:center">' +
            s.menuMarkup() +
        '</div>'
    );
}]);