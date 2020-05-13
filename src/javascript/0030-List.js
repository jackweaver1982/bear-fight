/*Uses: standard

Creates the `List` class.
*/

s.List = function(fixedEnd) {
    /*A wrapper around an array.

    The `List` class offers methods for controlling manipulation of and
    access to elements in the embedded array.

    Args:
        fixedEnd (int or bool, optional): If an integer, assigned to
            `_fixedEnd` attribute. If a boolean value, converted to 0 or
            1 before being assigned. Defaults to 0.

    Attributes:
        _array (arr): The embedded array.
        _fixedEnd (int): Indicates how many elements at the end of the
            array to keep fixed in place.
    */
    this._array = [];
    if (fixedEnd === undefined) {
        this._fixedEnd = 0;
    } else if (typeof fixedEnd === 'boolean') {
        this._fixedEnd = fixedEnd ? 1 : 0;
    } else {
        this._fixedEnd = fixedEnd;
    }
    return this;
}

s.List.prototype._verify = function(obj) {
    /*Checks if `obj` qualifies to be in the list. Should be overridden
    by subclasses.

    Args:
        obj (obj): The object to test.

    Returns:
        bool: `true` if the object qualifies, `false` otherwise.
    */
    return true;
}

s.List.prototype.insert = function(index, obj) {
    /*If the object passes the `_verify` test, inserts it at index. (E.g.,
    an index of 0 inserts it at the beginning, and index equal to the
    length of _array inserts it at the end.)

    If _fixedEnd is positive and you try to insert past a fixed element,
    will insert just before the first fixed element instead.

    Args:
        index (int): The index at which to insert.
        obj (obj): The object to insert.

    Returns:
        List: The calling instance.

    Raises:
        Error: If `obj` fails the `_verify` test.
    */
    if (this._verify(obj)) {
        var end = Math.max(0,this._array.length - this._fixedEnd);
        index = Math.min(index, end);
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
    /*Takes any number of objects as parameters and passes them, in
    order, to the `insert` method, inserting each one at the end of the
    embedded array.

    Args:
        arguments (array): The objects to insert, in order, at the end
        of the embedded array.

    Returns:
        List: The calling instance.
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
    /*Deletes the list element at the given index of the embedded array.

    Args:
        index (int): The index of the element to delete.

    Returns:
        List: The calling instance.

    Raises:
        Error: If `index` is out of range.
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
    /*Gets an element from the embedded array.

    Args:
        index (int): The index of the element to get.

    Returns:
        obj: The element gotten.
    */
    return this._array[index];
}

s.List.prototype.indexOf = function(obj) {
    /*Finds the given object in the embedded array.

    Args:
        obj (obj): The object to look for.

    Returns:
        int: The index of the object if found; -1 otherwise.
    */
    return this._array.indexOf(obj);
}

s.List.prototype.length = function() {
    /*Gets the length of the embedded array.

    Returns:
        int: The length of the embedded array.
    */
    return this._array.length;
}