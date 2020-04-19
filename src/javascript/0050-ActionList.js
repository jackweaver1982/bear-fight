// List, Action

s.ActionList = function(fixedEnd) {
    /*
    Action List is a subclass of List whose instance can contain only
    actions.
    */
    s.List.call(this, fixedEnd);
    return this;
};

s.ActionList.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.ActionList.prototype, 'constructor', {
    value: s.ActionList,
    enumerable: false,
    writable: true
});

s.ActionList.prototype._verify = function(obj) {
    /*
    @override
    */
    return (obj instanceof s.Action);
}

s.ActionList.prototype.addAction = function(
    text, carryOutFunc, checkFunc, index
) {
    /*
    This method is for adding a simple action with one outcome to the
    list. It creates an outcome that executes `carryOutFunc`, adds it as
    the single outcome to a new action with link text `text` and check
    function `checkFunc`. The `checkFunc` parameter defaults to true.

    If an `index` parameter is given, will insert the action at the
    given index, otherwise will push the action.
    */
    if (index == null) {
        index = this.length();
    }
    var outcome = new s.Outcome(carryOutFunc);
    var action = new s.Action(text, checkFunc);
    action.push(outcome);
    this.insert(index, action);
    return this;
}