s.Version = function(major, minor, patch) {
    /*
    Keeps track of a three-part version number and returns it in
    multiple useful formats. There is one predefined instance,
    `version`. (See below.)

    @property {Integer} _major - Should be a nonnegative integer less
    than 1000. Defaults to 0.
    @property {Integer} _minor - Should be a nonnegative integer less
    than 1000. Defaults to 0.
    @property {Integer} _patch - Should be a nonnegative integer less
    than 1000. Defaults to 1, if others are zero; otherwise, defaults to
    0.
    */
    major = major || 0;
    minor = minor || 0;
    patch = patch || ((major === 0 && minor === 0) ? 1 : 0);
    this.set(major, minor, patch);
    return this;
}

s.Version.prototype.asArray = function() {
    /*
    Returns the version number as an array of three integers.
    */
    return [this._major, this._minor, this._patch];
}

s.Version.prototype._arrToStr = function(arr) {
    /*
    Converts a version number formatted as an array to a string. Returns
    the string. If the patch part is 0, it is not included in the
    string.
    */
    var string = arr[0].toString() + '.' + arr[1].toString();
    if (arr[2] > 0) {
        string += '.' + arr[2].toString();
    }
    return string;
}

s.Version.prototype._strToArr = function(string) {
    /*
    Converts a version number formatted as a string to an array. Returns
    the array.
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
    /*
    Converts a version number formatted as an array to an integer.
    Returns the integer.
    */
    return 1000000 * arr[0] + 1000 * arr[1] + arr[2];
}

s.Version.prototype._intToArr = function(num) {
    /*
    Converts a version number formatted as an integer to an array.
    Returns the array.
    */
    var arr = [0,0,0];
    arr[2] = num % 1000;
    num = (num - arr[2])/1000;
    arr[1] = num % 1000;
    arr[0] = (num - arr[1])/1000;
    return arr;
}

s.Version.prototype.intToStr = function(num) {
    /*
    Converts a version number formatted as an integer to an object with
    `major`, `minor`, and `parts` properties. Returns the object.
    */
    return this._arrToStr(this._intToArr(num));
}

s.Version.prototype.asString = function() {
    /*
    Returns the version number as a string, such as `'2.113.86'`. If the
    `_patch` parameter is 0, it is not included in the string.
    */
    return this._arrToStr(this.asArray());
}

s.Version.prototype.asInteger = function() {
    /*
    Returns the version number as a potentially nine-digit integer. For
    example, 32.3.86 corresponds to 32003086.
    */
    return this._arrToInt(this.asArray());
}

s.Version.prototype.set = function(major, minor, patch) {
    /*
    Sets the corresponding properties. Throws an error if any
    parameter is not a nonnegative integer less than 1000, or if all
    parameters are 0. Returns the `Version` object.

    @param {Integer} major - A nonnegative integer less than 1000.
    @param {Integer} minor - A nonnegative integer less than 1000.
    @param {Integer} patch - A nonnegative integer less than 1000.
    Cannot be zero if both major and minor are zero.

    @return {Version}
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