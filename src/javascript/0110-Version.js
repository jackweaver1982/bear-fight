/*Uses: standard.

Builds and instantiates the `Version` class.

Attributes:
    s.version (Version): A `Version` instance for other classes to use.
*/

s.Version = function(major, minor, patch) {
    /*Keeps track of a three-part version number.

    The version number is converted to a single integer and stored in
    `Config.saves.version`.

    Args:
        major (int, optional): Assigned to `_major`. Defaults to 0.
        minor (int, optional): Assigned to `_minor`. Defaults to 0.
        patch (int, optional): Assigned to `_patch`. Defaults to 1, if
            both `_major` and `_minor` are 0; otherwise, defaults to 0.

    Attributes:
        _major (int): A nonnegative integer less than 1000.
        _minor (int): A nonnegative integer less than 1000.
        _patch (int): A nonnegative integer less than 1000. Cannot be 0
            if both `_major` and `_minor` are 0.
    */
    major = major || 0;
    minor = minor || 0;
    patch = patch || ((major === 0 && minor === 0) ? 1 : 0);
    this.set(major, minor, patch);
    return this;
}

s.Version.prototype.asArray = function() {
    /*Fetches the version number as an array.

    Returns:
        arr of int: The version number as an array of three integers.
    */
    return [this._major, this._minor, this._patch];
}

s.Version.prototype._arrToStr = function(arr) {
    /*Converts a version number formatted as an array to a string,
    formatted with dot separators. If the `_patch` attribute is 0, it is
    not included in the string.

    Args:
        arr (arr of int): The version number array to format.

    Returns:
        str: The formatted version number.
    */
    var string = arr[0].toString() + '.' + arr[1].toString();
    if (arr[2] > 0) {
        string += '.' + arr[2].toString();
    }
    return string;
}

s.Version.prototype._strToArr = function(string) {
    /*Converts a version number formatted as a string to an array.

    Args:
        string (str): The string to convert.

    Returns:
        arr of int: The converted string.
    */
    var arr = string.split('.').map(function(part) {
        return parseInt(part, 10);
    });
    if (arr.length === 2) {
        arr.push(0);
    }
    return arr;
}

s.Version.prototype._arrToInt = function(arr) {
    /*Converts a version number formatted as an array to a single
    integer.

    Args:
        arr (arr of int): The version number array to convert.

    Returns:
        int: The converted integer.
    */
    return 1000000 * arr[0] + 1000 * arr[1] + arr[2];
}

s.Version.prototype._intToArr = function(num) {
    /*Converts a version number formatted as an integer to an array.

    Args:
        num (int): The version number integer to convert.

    Returns:
        arr of int: The converted array.
    */
    var arr = [0,0,0];
    arr[2] = num % 1000;
    num = (num - arr[2])/1000;
    arr[1] = num % 1000;
    arr[0] = (num - arr[1])/1000;
    return arr;
}

s.Version.prototype.intToStr = function(num) {
    /*Converts a version number formatted as an integer to a string with
    dot separators.

    Args:
        num (int): The version number integer to convert.

    Returns:
        str: The converted string.
    */
    return this._arrToStr(this._intToArr(num));
}

s.Version.prototype.asString = function() {
    /*Returns the version number as a string, with dot separators. If
    the `_patch` attribute is 0, it is not included in the string.

    Returns:
        str: The version number as a string.
    */
    return this._arrToStr(this.asArray());
}

s.Version.prototype.asInteger = function() {
    /*Fetches the version number as a potentially nine-digit integer.
    For example, 32.3.86 corresponds to 32003086.

    Returns:
        int: The version number as an integer.
    */
    return this._arrToInt(this.asArray());
}

s.Version.prototype.set = function(major, minor, patch) {
    /* Sets the version number.

    Args:
        major (int): Assigned to calling instance's `_major` attribute.
        minor (int): Assigned to calling instance's `_minor` attribute.
        patch (int): Assigned to calling instance's `_patch` attribute.

    Returns:
        Version: The calling instance.

    Raises:
        Error: If any parameter is not a nonnegative integer less than
            1000, or if all parameters are 0.
    */
    for (var i = 0; i < 3; i++) {
        if (arguments[i] !== parseInt(arguments[i], 10) ||
            arguments[i] < 0 ||
            arguments[i] > 999) {
            throw new Error(
                'Version._init():\n' +
                'numbers must be nonnegative integers less than 1000'
            );
        }
    }
    if (major + minor + patch === 0) {
        throw new Error(
            'Version._init():\n' +
            'parts cannot all be 0'
        );
    }
    this._major = major;
    this._minor = minor;
    this._patch = patch;
    Config.saves.version = this.asInteger();
    return this;
}

s.version = new s.Version();