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

s.List.prototype.insert = function(index, obj) {
    /*
    If the object passes the `_verify` test, inserts it at index. (E.g.,
    an index of 0 inserts it at the beginning, and index equal to the
    length of _array inserts it at the end.)

    If you try to insert to the end of the list when _fixedEnd is true,
    will insert to the second to the last spot.
    */
    if (this._verify(obj)) {
        if (index === this._array.length && index > 0 && this._fixedEnd) {
            index -= 1;
        }
        this._array.splice(index, 0, obj);
    } else {
        throw new Error(
            'List.insert():\n' +
            'object does not qualify for list'
        );
    }
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
        this.insert(this._array.length, arg);
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