s.Factory = function() {
    /*
    The factory is used to build and catalog objects. There is one
    predefined instance, `factory`. (See below.) Other classes will use
    this instance, so there should not be any other instances created.

    The factory catalogs objects using a list of unique string id's. It
    is therefore implemented as a subclass of `List`.
    */
    s.List.call(this);
    return this;    
};

s.Factory.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Factory.prototype, 'constructor', {
    value: s.Factory,
    enumerable: false,
    writable: true
});

s.Factory.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Factory())._init(this);
};

s.Factory.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.Factory())._init($ReviveData$)', newPC
    );
};

s.Factory.prototype.build = function(id, class_) {
    /*
    If the factory's catalog does not already contain `id`, this
    method builds a new instance of class `class_`, adds an `_id`
    property to the instance with value `id`, as well as a `getId()`
    method. The newly created object is assigned to the variable
    `v[id]`, and `id` is added to the catalog. Returns the newly created
    instance. Throws an error if `id` is not a nonempty string, or if it
    is already in the catalog.


    @param {String} id - The _id property of the newly created object.
    @param (String) class_ - The name of the class of the newly created
    object. Specifically, this method will call `new s[class_]()`.

    @return {Object}
    */
    if (typeof(id) !== 'string' || id == '' ||
        this.indexOf(id) >= 0) {
        throw new Error(
            'Factory.build():\n' +
            '`id` must be a nonempty string that does not match any ' +
            'previously used ids'
        );
    }
    v[id] = new s[class_]();
    v[id]._id = id;
    v[id].getId = function() {
        return this._id;
    }
    this._array.push(id);
    return v[id];
}

s.Factory.prototype.push = function() {
    /*
    @override
    */
    throw new Error(
        'Factory.push():\n' +
        'use the `build()` method to add to the factory'
    );
}

s.Factory.prototype.delete = function() {
    /*
    @override
    */
    throw new Error(
        'Factory.delete():\n' +
        'items cannot be deleted from the factory'
    );
}

v.factory = new s.Factory(); // The unique instance of the Factory
                             // class, built with default values.

/*
Established `f` as a shorthand alias for `v.factory`.
*/
Object.defineProperty(window, "f", {
    get: function() {
        return v.factory;
    }
});