s.List = function() {
    /*
    A wrapper around an array with methods for controlling manipulation
    and access of elements.
    */
    this._array = [];
    return this;
}

s.List.prototype._verify = function(obj) {
    /*
    Checks if `obj` qualifies to be in the list. Should be overwritten
    by subclasses.
    */
    return true;
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