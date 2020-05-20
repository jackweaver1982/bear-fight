/*Uses: SavesManager_, ActionList, Page_.

Builds and instantiates the `Menu` class. Removes the default 'Saves'
and 'Restart' buttons from SC's UI bar, since the menu object will
provide its own. Adds preprocessing arrays to `s.preProcText` from
`Page_.js` which write the menu to SC's UI bar, the header, and the
'Start' passage. A 'no-menu' tag on a passage will prevent the writing
of the menu.

Attributes:
    s.menu (Menu): A `Menu` instance for use by other classes.

*/

s.Menu = function() {
    /*A `Menu` object is an `ActionList` with built-in 'begin',
    'resume', 'save', 'load', and 'restart' actions. The 'save', 'load',
    and 'restart' methods are kept at the end of the list. The 'begin'
    method is customizable. These actions are automatically inserted
    into various areas of the story (such as the header, the UI bar, and
    the bottom of the 'Start' passage.)

    Attributes:
        _array (arr): The embedded array of `Action` objects.
        _fixedEnd (int): Indicates how many elements at the end of the
            array to keep fixed in place. Defaults to 3.

    */
    
    s.ActionList.call(this, 3);
    this.addAction(
        'restart',
        function() {
            if (ss.debugOn || confirm('Really restart?')) {
                Save.clear();
                if (passage() === 'Start') {
                    memorize('autoStart', true);
                }
                Engine.restart();
            }
        },
        function() {
            return (
                passage() !== 'Start' ||
                Save.autosave.has()
            );
        }
    );
    this.addAction(
        'load',
        function() {
            if (Save.slots.isEmpty()) {
                alert("No bookmark to load.");
            } else {
                UI.saves();
            }
        },
        Config.saves.isAllowed
    );
    this.addAction(
        'save',
        function() {
            s.savesMgr.saveBkMark();
        },
        Config.saves.isAllowed
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
    /*(override) This method is for adding a simple action with one
    outcome to the menu.

    Args:
        text (str): The display text of the action.
        carryOutFunc (func, optional): The function to be executed when
            the action is taken. Defaults to a function that does
            nothing.
        checkFunc (func or bool, optional): Used to determine whether
            the action should be displayed. Defaults to a function that
            returns `true` if the current passage is not the 'Start'
            passage.
        index (int, optional): Where in the embedded array the new
            action should be inserted. Defaults to the end of the array.

    Returns:
        Menu: The calling instance.
    */
    if (checkFunc == null) {
        checkFunc = function() {
            return (passage() !== 'Start');
        }
    }
    return s.ActionList.prototype.addAction.call(
        this, text, carryOutFunc, checkFunc, index
    );
}

s.Menu.prototype.addInfoNode = function(text, psgTitle) {
    /*Adds a link to an info node. If the given passage title is not
    associated to a node, an info node is created and associated with
    it.

    Args:
        text (str): The text of the link.
        psgTitle (str): The title of the info node passage to link to.

    Returns:
        Menu: The calling instance.

    Raises:
        Error: If the given passage title is associated to a node that
            is not an info node.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        node = new s.InfoNode(psgTitle);
    } else if (!(node instanceof s.InfoNode)) {
        throw new Error(
            'Menu.addInfoNode():\n' +
            psgTitle + ' is not an info node'
        );
    }
    this.addAction(text, function() {
        s.loadNode(psgTitle);
    });
    return this;
}

s.Menu.prototype.onBegin = function(func) {
    /*Sets the carry-out function of the 'begin' action.

    Args:
        func (function): The function to carry out upon selecting the
            'begin' action.

    Returns:
        Menu: The calling instance.
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
$('#menu-item-restart').remove()
$('#menu-item-saves').remove()

s.autoStart = function() {
    /*Check and carry out the 'begin' action.
    */
    var begin = s.menu.getAction('begin');
    if (begin.check()) {
        begin.choose().carryOut();
    }
}

s.menuMarkup = function() {
    /*Processes the menu actions to create SC markup.

    Returns:
        str: SC markup for menu links.
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
    /*Adds the menu to the UI bar if it is visible and the current
    passage allows the menu.

    Args:
        text (str): The passage text to process.

    Returns:
        str: The processed text.
    */
    if (!UIBar.isHidden() && !tags().includes('no-menu')) {
        return s.menuMarkup();
    } else {
        return '';
    }
}]);

s.preProcText.push(['PassageHeader', function(text) {
    /*Adds the menu to the header with the sticky class if the current
    passage allows it, unless currently at the Start passage. Otherwise,
    adds a line break to compensate for the reduced upper margin (needed
    to have the sticky class work as intended).

    Args:
        text (str): The passage text to process.

    Returns:
        str: The processed text.
    */
    var buttonMarkup = (
        '<span title="Scroll to top">' +
            '<<button &uarr;>>' +
                '<<run st.page.scrollToFirst()>>' +
            '<</button>>' +
        '</span>' +
        '<span title="Scroll to bottom">' +
            '<<button &darr;>>' +
                '<<run st.page.scrollToLast()>>' +
            '<</button>>' +
        '</span>'
    );

    return (
        '<<if !tags().includes("no-menu") && passage() !== "Start">>' +
            '<div id="header" class="sticky"><br>' +
                s.menuMarkup() +
                '<span style="float:right;">' +
                    buttonMarkup +
                '</span><br><hr>' +
            '</div>' +
        '<<else>>' +
            '<br>' +
        '<</if>>'
    );
}]);

s.preProcText.push(['Start', function(text) {
    /*Use the autoStart metadata from the restart action to skip the
    title page.

    Args:
        text (str): The passage text to process.

    Returns:
        str: The processed text.
    */
    return (
        '<<timed 0s>>' +
            '<<if ss.debugOn || recall("autoStart", false)>>' +
                '<<run forget("autoStart")>>' +
                '<<run s.autoStart()>>' +
            '<</if>>' +
        '<</timed>>' +
        text
    );
}])

s.preProcText.push(['Start', function(text) {
    /*Adds the menu to the bottom of the Start passage.

    Args:
        text (str): The passage text to process.

    Returns:
        str: The processed text.
    */
    return (
        text + '<br>' +
        '<div style="text-align:center">' +
            s.menuMarkup() +
        '</div>'
    );
}]);
