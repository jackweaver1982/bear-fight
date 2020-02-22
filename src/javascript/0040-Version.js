s.Version = function() {
    /*
    Keeps track of a three-part version number and returns it in
    multiple useful formats. There is one predefined instance,
    `version`. (See below.)

    @property {Integer} _major - Should be a nonnegative integer less
    than 1000. Defaults to 0.
    @property {Integer} _minor - Should be a nonnegative integer less
    than 1000. Defaults to 0.
    @property {Integer} _patch - Should be a nonnegative integer less
    than 1000. Defaults to 0.
    */
    this._major = 0;
    this._minor = 0;
    this._patch = 1;
    return this;
}

s.Version.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.Version.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Version())._init(this);
};

s.Version.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newObj = {};
    Object.keys(this).forEach(function (pn) {
        newObj[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper('(new s.Version())._init($ReviveData$)', newObj);
};

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
        if (!(arguments[i] !== undefined &&
              arguments[i] === parseInt(arguments[i], 10) &&
              arguments[i] >= 0 &&
              arguments[i] < 1000)) {
            throw new Error(
                'Version.set():\n' +
                'numbers must be nonnegative integers less than 1000'
            );
        }
    }
    if (major + minor + patch === 0) {
        throw new Error(
            'Version.set():\n' +
            'parts cannot all be 0'
        );
    }
    this._major = major;
    this._minor = minor;
    this._patch = patch;
    return this;
}

s.Version.prototype.asString = function() {
    /*
    Returns the version number as a string, such as `'2.113.86'`. If the
    `_patch` parameter is 0, it is not included in the string.
    */
    var verString = this._major.toString() + '.' + this._minor.toString()
    if (this._patch > 0) {
        verString += '.' + this._patch.toString();
    }
    return verString;
}

s.Version.prototype.asInteger = function() {
    /*
    Returns the version number as a potentially nine-digit integer. For
    example, 32.3.86 corresponds to 32003086.
    */
    return 1000000 * this._major + 1000 * this._minor + this._patch;
}

f.build('version', 'Version');