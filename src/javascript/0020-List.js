s.List = function(fixedEnd) {
    /*
    A wrapper around an array with methods for controlling manipulation
    and access of elements.

    @param {Boolean} fixedEnd - Defaults to false. If true, the `push`
    method will keep the last element is _array in the last position.
    */
    this._array = [];
    if (fixedEnd === undefined) {
        this._fixedEnd = false;
    } else {
        this._fixedEnd = fixedEnd;
    }
    return this;
}

s.List.prototype._verify = function(obj) {
    /*
    Checks if `obj` qualifies to be in the list. Should be overwritten
    by subclasses.
    */
    return true;
}

s.List.prototype._addItem = function(obj) {
    /*
    Adds an object to the end of the list. If _fixedEnd is true, adds it
    just before the last item. Does not verify object, so should not be
    used by external tools.
    */
    var pos = this._array.length;
    if (this._fixedEnd && pos > 0) {
        pos -= 1;
    }
    this._array.splice(pos, 0, obj);
    return this;
}

s.List.prototype.push = function() {
    /*
    Takes any number of objects as parameters. If any given object
    fails the `_verify` test, throws an error. Otherwise, adds all
    objects to `_array` and returns the calling `List` object.
    */
    if (arguments.length > 0) {
        var args = Array.prototype.slice.call(arguments);
        var arg = args.shift();
        if (this._verify(arg)) {
            this._addItem(arg);
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
    `List` object. Throws an error if index is out of range. Returns the
    calling `List` object.
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