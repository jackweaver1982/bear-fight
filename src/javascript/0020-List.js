s.List = function() {
    /*
    A wrapper around an array with methods for controlling manipulation
    and access of elements.

    @property {Object array} _array - The list's array of objects. In
    subclasses, it is typically an array of strings representing object
    ids. Defaults to an empty array.
    */
    this._array = [];
}

s.List.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.List.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.List())._init(this);
};

s.List.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('(new s.List())._init($ReviveData$)', newPC);
};

s.List.prototype._check = function(obj) {
    /*
    Checks if `obj` qualifies to be in the list. Should be overridden
    by subclasses.

    @param {Object} obj - The object to check.

    @return {Boolean}
    */
    return true;
}

s.List.prototype.push = function() {
    /*
    Takes any number of objects as parameters. If any given object
    fails the `_check` test, throws an error. Otherwise, adds all
    objects to `_array` and returns the calling `List` object.

    @param {Object} arguments[n] - The arguments passed to this method
    are accessed by JavaScript's `arguments` object.

    @return {List}
    */
    if (arguments.length > 0) {
        var args = Array.prototype.slice.call(arguments);
        var arg = args.shift();
        if (this._check(arg)) {
            this._array.push(arg);
        } else {
            throw new Error(
                'List.push():\n' +
                'object does not qualify for list'
            );
        }
        this.push.apply(this, args);
    }
    return this;
}

s.List.prototype.delete = function(index) {
    /*
    Deletes the list element at the given index and returns the modified
    `List` object. Throws an error if index is out of range.

    @param {Integer} index - The index of the object to delete.

    @return {List}
    */
    if (index !== parseInt(index, 10) || index < 0 ||
        index >= this._array.length) {
        throw new Error(
            'List.delete():\n' +
            'invalid index'
        );
    }
    this._array.splice(index, 1);
    return this;
}

s.List.prototype.get = function(index) {
    return this._array[index];
}

s.List.prototype.indexOf = function(obj) {
    return this._array.indexOf(obj);
}

s.List.prototype.length = function() {
    return this._array.length;
}