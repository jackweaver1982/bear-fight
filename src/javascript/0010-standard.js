/*Establishes shorthand aliases for commonly used namespaces, and sets
other basic properties.

Attributes:
    s (obj): Alias for `setup`.
    ss (obj): Alias for `settings`.
    v (obj): Alias for `State.variables`.
    t (obj): Alias for `State.temporary`.
    v.static (obj): We will occasionally make temporary journeys in time
       via SC's history. This namespace is for variables that should be
       unaffected by those journeys.
    st (obj): Alias for `v.static`.
    Config.passages.nobr (bool): Set to true, which applies `nobr` to
        all SC passages.
    Config.saves.autosave (bool): Set to true, which turns on SC's
        autosave feature.
    s.autosave.sufficient (array of functions): Array of Boolean-valued
        functions giving sufficient conditions to allow autosaving.
    s.autosave.necessary (array of functions): Array of Boolean-valued
        functions giving necessary conditions to allow autosaving.

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

v.static = {}; 

Object.defineProperty(window, "st", {
    get: function() {
        return State.variables.static;
    }
});

s.loadVars = function(time) {
    /*Replaces `v` with a copy of `State.variables` from the moment with
    index `time`. Does not touch `v.static`.

    Note:
        This function originally required `time` to be a nonpositive
        integer. For compatibility with code that may use the original
        version of this function, a negative value of `time` is still
        accepted, but immediately replaced by its absolute value.

    Args:
        time (int): A nonnegative integer representing the time from
        which to take the variable data. A value of 0 denotes the
        present. A value of n > 0 means to go back n moments in SC's
        history.
    */
    time = (time < 0) ? -time : time

    var oldVars = State.peek(time).variables;
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

Config.passages.nobr = true;

window.onerror = function(msg, url, linenumber) {
    /*Ensures that errors appear in a pop-up for greater visibility.
    Works in Firefox, but doesn't seem to work in Safari. Be sure to do
    testing in Firefox.

    Args:
        msg (str): Error message.
        url (str): Error URL.
        linenumber (int): Error line number.

    Returns:
        bool: Returns `true`.
    */
    alert(
        'Error message: ' + msg + '\n' +
        'URL: ' + url + '\n' +
        'Line Number: ' + linenumber
    );
    return true;
}

Config.saves.autosave = true;

s.autosave = {
    sufficient: [],
    necessary: []
}

Config.saves.isAllowed = function () {
    /*Uses `s.autosave` to determine if the autosave is allowed. Passing
    any sufficient check allows the save; failing any necessary check
    prevents the save. Otherwise, save is allowed.

    Returns:
        bool: `true` if the the save is allowed, `false` otherwise.
    */
    var i;
    for (i = 0; i < s.autosave.sufficient.length; i++) {
        if (!s.autosave.sufficient[i]()) {
            continue;
        }
        return true;
    }
    for (i = 0; i < s.autosave.necessary.length; i++) {
        if (s.autosave.necessary[i]()) {
            continue;
        }
        return false;
    }
    return true;
};

s.autosave.necessary.push(function() {
    /*Prevents autosave at the 'Start' passage.

    Returns:
        bool: `true` if current passage title is not `Start`.
    */
    return (passage() !== 'Start');
});