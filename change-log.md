---
title: Change Log
---

# Change Log

## Version 0.3.10

* Added an `ActionList` class between `List` and `Node`. Moved `Node`'s `_verify` and `addAction` methods to the new class.
* Made a `MenuBar` class.
* Added `s.menuBar` and `s.menuMarkup()` to `rendering.js` to have the menu bar items automatically added to the header.

## Version 0.3.9

* Rearranged methods and "uses" arrows in UML diagram.

## Version 0.3.8

* Added CSS code to make the header float on top of the page as you scroll.
* Added CSS code to remove the upper margin of the story, so the header remains fixed as you scroll. (Without doing this, the header would start a margin away from the top, then scroll to the top before beginning to float.)
* Added a `refreshActions` method to `Page` which simply erase and reinserts the current actions. It is meant to be run after dynamically changing variables on which action check functions depend.
* Edited `Config.passages.onProcess` to automatically wrap `PassageHeader` so that it inherits the floating CSS code and so that it doesn't display when a passage is tagged with `no-header`.
* Edited `Config.passages.onProcess` to automatically insert an HTML `<br>` in the top of `PassageHeader` and the top of any passage tagged `no-header`. This is to compensate for the fact that the upper margin of the story has been removed.
* Edited `s.addLink()` so that it accepted `null` or `undefined` for `endPsgTitle`. This allows for links that execute functions but do not load a new node.
* Edited `s.loadNode()` so that it accepts an optional `embed` parameter.

## Version 0.3.7

* Added `DebugController`; built `s.deCon` instance and added `debugOn` to SC's `settings`.

## Version 0.3.6

* Edited `s.setSubCount()` so it makes the node if no such node exists.
* Edited `main.js` to make it cleaner and more human-readable.

## Version 0.3.5

* Reorganized JavaScript files. Capitalized file names not ending in an underscore define only a class. Capitalized file names ending in an underscore also contain global variables and functions, which are always included in the beginning of the file, before the class definition. Uncapitalized file names contain only global variables and functions. `main.js` is the file which connects the JavaScript tools to the twee file.

## Version 0.3.4

* Edited the `Outcome`, `Action`, and `Node` classes, as well as the `addLink` global function, so that `null` can be passed as a function parameter, instead of a useless call to a function that returns nothing. Also changed the `Outcome.choose` method so that `_userScript` is not called when `_array` is empty.
* Deleted the `none` global function.

## Version 0.3.3

* Added css for headings in help screen. Added comments to css.
* Added `outOfChar` flag to Node.
* Added `setSubCount` and `addAction` method to Node.
* Added `InfoNode` class.
* Edited `Page.load` so that info nodes cannot be embedded.
* Added global functions `addLink`, `setSubCount`, `copyActions`, `loadNode`, and `loadInfoNode`. Removed `makeLink`.
* Edited `Config.saves.isAllowed` to prevent autosaving on an info node.
* Edited `Config.passages.onProcess` and `s.onPsgDisplay` to do nothing when passage is not a node.

## Version 0.3.2

* Despite what the change log says, `:: StoryDisplayTitle` didn't make it into the compiled HTML file in the last commit. It is only in the source code. That is fixed now.
* Added `pagehide` to the `beforeunload` event that restarts the story, in an attempt to get this behavior implemented in Safari on iOS.

## Version 0.3.1

* Upgraded SugarCube to 2.31.0
* Added the newly supported `:: StoryDisplayTitle` special passage to the twee template, and to `s.specialPsgs`.
* Enabled autosaves and arranged via the `beforeunload` event for story to restart upon browser refresh. A link to resume using the autosave is placed in the `:: Start` passage. This resolves the issue of `Page.scrollToLast()` not firing soon enough on browser refresh or story restart.

## Version 0.3.0

* Was scrolling to second-to-last passage upon following a link. Moved `scrollToLast()` call in `Page.embedPsg()` to fix this.
* Removed `Node.addLink()` and added its code to `s.makeLink()`.
* Added the `v.static` namespace, with shortcut, `st`.
* Added `s.loadVars()` for loading variables from earlier moments. Does not touch the `st` namespace.
* Moved `v.parser` and `v.page` to `st.parser` and `st.page`.
* Allowed text substitutions to be functions that return strings.
* Allowed more description markups than link markups, to allow for link markups to appear in text substitutions.
* Added a `time` parameter to `Parser.procAllMarkup()` so the method can rewind the variables to an earlier moment before doing its markup. At present, this is unnecessary, since the text subs are stored in `st.parser`, which is not rewound, and no other part of the markup processing relies on dynamically changing data.
* Added `length()`, `getPsg()`, and `getFlag()` methods to `Page`.
* Changed the name of `Page.insertPsg()` to `Page.insertPsgText()`.
* Added a `time` parameter to `Page.insertPsgText()` so the method can rewind the variables to an earlier moment before doing its markup. This is necessary to allow SC markup in passage text which relies on variables, such as the `<<if>>` macro.
* Added a `time` parameter to `Page.embedPsg()`, which uses `Page.insertPsgText()`.
* Modified `Config.passages.onProcess` so that it rewinds variables. Does not reset variables to current time. Leaves them rewound for SC to use them as it renders the passage.
* Removed the `reEmbedPsgs()` and `rebuildPage()` methods from `Page` and moved their code to the global function `s.onPsgDisplay()` which is triggered by the `:passagedisplay` event. `s.onPsgDisplay()` begins by resetting the variables to the current moment.

## Version 0.2.8

* Added `nobreak` parameter to `Page.insertPsg()` to suppress the printing of the scene break.
* Added `nobreak` parameter to `Page.embedPsg()` and the property `Page._noBreakFlags` to track which embedded passages were inserted without scene breaks.
* Added `nobreak` parameter to `Page.load()`.
* Edited `Page.reEmbedPsgs()` to take `this._noBreakFlags` into account when re-embedding the passages.
* Added `embed` and `nobreak` parameters to `Node.addLink()` and `makeLink()`.
* Added `none()` for convenience in passing an empty function as a parameter.

## Version 0.2.7

* Deleted unused variable `v.embeddedPsgs`.
* Changed `html` to `html, body` in scrolling animation to support Safari.
* Renamed `Page.scrollToTop` to `scrollToLast`.
* Added metadata to track if the page is being reloaded. If reloading, inserted a pause before rebuilding the page during the `:passagedisplay` event. This is to prevent the `scrollToLast` method from firing too early, and thereby having no effect.

## Version 0.2.6

* Moved `load()` method to `Page` object. Added `onLoad()` method to `Node` for storing the user script.
* Built `Parser` object to handle parsing markup.
* Built `Page` object to handle managing the passage content on the screen.

## Version 0.2.5

* Added an `embed` (Boolean) parameter to `Node.load()` to indicate that the incoming node's passage should be loading inside the current page.
* Changed `textSubs` to a map, mapping passage titles to text substitution arrays. That way, more of them are stored in memory at a time, making embedded loading easier.
* Added `s.embedPsgs()` to `:passagedisplay`, a function to re-embed passages when loading a save or refreshing the browser.

## Version 0.2.4

* Added an `_align` property, with getter and setter, to `Action` for the display of its link. Edited `passagedisplay` to use this property.
* Added an `s.getNode()` function for easier node retrieval.
* Edited `s.Node.load()` to automatically include the loading of the passage, so it does not have to be included in the user script.
* Created `s.Node.addLink()` and `s.makeLink()` to streamline the making of simple links.

## Version 0.2.3

* Edited `node-markup.js` so that it inserts the text subs directly, rather than creating spans for later insertion.
* Edited example in `bear-fight.tw` to match the new text subs.
* Added a `window.onerror` function so that errors appear as pop-ups. Doesn't work in Safari. Need to develop in Firefox.
* Edited `addNodeContainers` so that they are added with more white space for human readability.

## Version 0.2.2

* Developed the node markup system. Edited `9000-main.js` and `bear-fight.tw` to lay out an example of using it.

## Version 0.2.1

* Copied and revised `List.js` from version 0.1.6.
* Copied old UML diagram from version 0.1.6 for piecemeal pasting into new, blank UML diagram.
* Added `List` to UML diagram.
* Copied and revised `Outcome.js` from version 0.1.6.
* Added `Outcome` to UML diagram.
* Copied and revised `Action.js` from `_archive`.
* Added `Action` to UML diagram.
* Copied and revised `Node.js` from `_archive`.
* Added `Node` and `Global` to UML diagram.
* Created a JS file that will process the special markup unique to this node system. For now, the file does nothing. It is just a placeholder for future code.
* Added some example code for using and testing what is here so far.

## Version 0.2.0

* Local storage is a problem. Decided to completely redo the object structure. Nodes, Actions, and Outcomes will be stored on `setup`. I will need to surgically included certain things in `v` so that loading save files and reloading the browser work correctly. Since these objects will not be put in `v` and will not be written to JSON, they do not need the `clone()` and `toJSON()` methods, and they can contain shared references.
* Moved the contents of `_archive` (ignored by git) to a subarchive, making a fresh space for all the things I'm about to delete.
* Deleted all JS files but `0010-standard.js`.
* Deleted the UML diagram and made a new blank one.
* Changed the main Twee file to contain only the bare-bones basic.

## Version 0.1.7

* Added a list of reserved HTML element ids in a comment in the main Twee file.
* Reordered JS files.
* Added a `NodeHistory` class for greater control over history tracking.
* Added event handlers that wrap the narrative content of the passage in a `div`.
* Added an event handler that pushes the node's narrative content to the history object.
* Added a Python script to renumber JS files.
* Renumbered JS files.
* Added an `info` folder to project, for text files with useful information.
* Added to `info` an example of the markup parsing I have planned for the node system.
* Added to `info` a list of SugarCube's special passage names, for when I make code that avoids applying certain markup parsing to those passages.

## Version 0.1.6

* Added custom header and footer passages for greater control over managing the rendering of passages.

## Version 0.1.5

* Added `_userScript()` and related methods to outcomes, actions, and nodes, for greater flexibility in making subclasses.
* Made a `DirectedOutcome` subclass that contains a target node and automatically loads it after being carried out.
* Added an `addLink()` method to `Node` to automate the creation of a simple link (an action with one directed outcome).

## Version 0.1.4

* Added a change log.
* Factory now throws an error if `id` is not a valid JS identifier.
* added `makeNode()` function as a shorthand for making a node and assigning it to a passage. Uses `id` as default for associated passage title.

## Version 0.1.3

* Upgraded SugarCube to 2.30.0.
* Fixed an issue where action links would appear below the header.

## Version 0.1.2

* Edited example code so that it outputs to the page rather than the console. (The console is not easily viewable on mobile.)
* Added an index.html page for use when viewing GitHub pages.

## Version 0.1.1

* Minor changes to JS files.
* Fixed an error where the links were being appended to the end of the passage, rather than into the 'actions' container.

## Version 0.1

The basic structure of the node/action/outcome system for managing passage transitions is set up and ready to use. It includes support for text substitutions into the narrative content of passages, as well as automatic insertion of action links.
