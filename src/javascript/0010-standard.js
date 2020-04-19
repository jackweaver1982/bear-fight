/*
Establishes shorthand aliases for commonly used namespaces, and sets
other basic properties.
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

v.static = {}; // We will occasionally make temporary journeys in time
               // via SC's history. This namespace is for variables that
               // should be unaffected by those journeys.

Object.defineProperty(window, "st", {
    get: function() {
        return State.variables.static;
    }
});

s.loadVars = function(time) {
    // Replaces `v` with a copy of `State.variables` from the moment
    // with index `time`. Does not touch `v.static`.
    //
    // @param {Integer} time - A nonpositive integer representing the
    // time from which to take the variable data. A value of 0 denotes
    // the present.
    var oldVars = State.peek(-time).variables;
    Object.keys(v).forEach(function(pn) {
        if (pn !== 'static') {
            delete v[pn];
        }
    });
    Object.keys(oldVars).forEach(function(pn) {
        if (pn !== 'static') {
            v[pn] = clone(oldVars[pn]);
        }
    });
    return;
}

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

Config.saves.autosave = true; // turn on autosave feature

s.autosave = {
    sufficient: [], // array of Boolean-valued functions giving
                    // sufficient conditions to allow autosaving
    necessary: []   // array of Boolean-valued functions giving
                    // necessary conditions to allow autosaving
}

Config.saves.isAllowed = function () {
    var i;
    for (i = 0; i < s.autosave.sufficient.length; i++) {
        // passing any sufficient check allows the save
        if (!s.autosave.sufficient[i]()) {
            continue;
        }
        return true;
    }
    for (i = 0; i < s.autosave.necessary.length; i++) {
        // failing any necessary check prevents the save
        if (s.autosave.necessary[i]()) {
            continue;
        }
        return false;
    }
    return true; // otherwise defaults to true
};

s.autosave.necessary.push(function() {
    // do not autosave at the 'Start' passage
    return (passage() !== 'Start');
});