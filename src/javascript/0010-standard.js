/*
Establishes shorthand aliases for the following namespaces in
SugarCube: `setup`, `settings`, `State.variables`, and
`State.temporary`.

All classes and functions are built on the `s` namespace. All instances
are built on the `v` namespace.
*/

Object.defineProperty(window, "s", {
    get: function() {
        return setup;
    }
});

Object.defineProperty(window, "ss", {
    get: function() {
        return settings;
    }
});

Object.defineProperty(window, "v", {
    get: function() {
        return State.variables;
    }
});

Object.defineProperty(window, "t", {
    get: function() {
        return State.temporary;
    }
});

Config.passages.nobr = true; // sets all passages to `nobr`

window.onerror = function(msg, url, linenumber) {
    /*
    Ensures that errors appear in a pop-up for greater visibility. Works
    in Firefox, but doesn't seem to work in Safari. Be sure to do
    testing in Firefox.
    */
    alert(
        'Error message: ' + msg + '\n' +
        'URL: ' + url + '\n' +
        'Line Number: ' + linenumber
    );
    return true;
}