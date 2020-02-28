---
title: Change Log
---

# Change Log

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
