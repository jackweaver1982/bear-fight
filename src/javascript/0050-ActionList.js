/*Uses: List, Action.

Builds the `ActionList` class.
*/

s.ActionList = function(fixedEnd) {
    /*A subclass of List whose instance can contain only actions.

    Args:
        fixedEnd (bool, optional): Assigned to `_fixedEnd` attribute.
            Defaults to `false`.

    Attributes:
        _array (arr): The embedded array of `Action` objects.
        _fixedEnd (bool): If `true`, the `push` method will keep the
            last element in the embedded array in the last position.
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
    /*(override) Members of an `ActionList` must be `Action` objects.

    Args:
        obj (obj): The object to test.

    Returns:
        bool: `true` if the object is an `Action`, `false` otherwise.
    */
    return (obj instanceof s.Action);
}

s.ActionList.prototype.addAction = function(
    text, carryOutFunc, checkFunc, index
) {
    /*This method is for adding a simple action with one outcome to the
    list.

    Args:
        text (str): The display text of the action.
        carryOutFunc (func, optional): The function to be executed when
            the action is taken. Defaults to a function that does
            nothing.
        checkFunc (func or bool, optional): Used to determine whether
            the action should be displayed. Defaults to `true`.
        index (int, optional): Where in the embedded array the new
            action should be inserted. Defaults to the end of the array.

    Returns:
        ActionList: The calling instance.
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

s.ActionList.prototype.getAction = function(actionText) {
    /*Returns the action from the list whose display text matches the
    given argument. If no such action exists, returns null.

    Args:
        actionText (str): The display text to search for.

    Returns:
        Action: The matching `Action` object, if found.
        null: If no match is found.
    */
    var action;
    for (var i = 0; i < this.length(); i++) {
        action = this.get(i);
        if (action.getText() === actionText) {
            return action;
        }
    }
    return null;
}