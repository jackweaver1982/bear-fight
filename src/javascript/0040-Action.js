/*Uses: List.

Builds the `Action` class.

*/

s.Action = function(text, checkFunc, chooseFunc) {
    /*A `List` of `Outcome`s representing an action the user may take.

    In a given passage, the reader will choose from a list of actions.
    Each action can be displayed as a link, and when it is selected,
    the story will choose from a list of that action's possible
    outcomes. An `Action` object represents one of these actions.

    Structurally, an action object is a list of outcomes with a display
    text for the link, and some additional methods available. As such,
    it is implemented as a subclass of `List`.

    Args:
        text (str): Assigned to the `_displayText` attribute.
        checkFunc (func or bool, optional): Assigned to the
            `_userScriptCheck` attribute. Defaults to `true`.
        chooseFunc (func, optional): Assigned to the `_userScriptChoose`
            attribute. Defaults to a function that returns the first
            outcome in the list.

    Attributes:
        _array (arr): The embedded array of `Outcome` objects.
        _fixedEnd (int): Indicates how many elements at the end of the
            array to keep fixed in place. Set to 0 by the constructor.
        _displayTest (str): The text to appear in the link.
        _userScriptCheck (func or bool): The function to call when
            checking if the action should be displayed. Should take no
            parameters and return a boolean. If it is a boolean, simply
            returns that boolean.
        _userScriptChoose (func): The function to call when choosing an
            outcome. Should take no parameters and return an outcome
            from the action.
        _align (str): The CSS text-align value for the link associated
            with this action. Defaults to 'left'.

    */

    s.List.call(this);
    this._displayText = text;

    if (checkFunc == null)  {
        this._userScriptCheck = true;
    } else {
        this._userScriptCheck = checkFunc;
    }

    this._userScriptChoose = chooseFunc || function() {
        return this._array[0];
    }
    this._align = 'left';
    return this;
};

s.Action.prototype = Object.create(s.List.prototype);

Object.defineProperty(s.Action.prototype, 'constructor', {
    value: s.Action,
    enumerable: false,
    writable: true
});

s.Action.prototype._verify = function(obj) {
    /*(override) Members of an `Action` must be `Outcome` objects.

    Args:
        obj (obj): The object to test.

    Returns:
        bool: `true` if the object is an `Outcome`, `false` otherwise.
    */
    return (obj instanceof s.Outcome);
}

s.Action.prototype.getText = function() {
    /*Fetches the `_displayText` attribute.

    Returns:
        str: The `_displayText` attribute of the calling instance.
    */
    return this._displayText;
}

s.Action.prototype.getAlign = function() {
    /*Fetches the `_align` attribute.

    Returns:
        str: The `_align` attribute of the calling instance.
    */
    return this._align;
}

s.Action.prototype.setAlign = function(align) {
    /*Sets the `_align` attribute.

    Args:
        align (str): Assigned to the `_align` attribute of the calling
            instance.

    Returns:
        Action: The calling instance.
    */
    this._align = align;
    return this;
}

s.Action.prototype.setChoose = function(chooseFunc) {
    /*Sets the `_userScriptChoose` attribute.

    Args:
        chooseFunc (func, optional): The function to assign to the
            calling instance's `_userScriptChoose` attribute. Defaults
            to a function that returns the first element in the `_array`
            attribute.
    */
    this._userScriptChoose = chooseFunc || function() {
        return this._array[0];
    }
    return this;
}

s.Action.prototype.check = function() {
    /*Uses the `_userScriptCheck` attribute to check whether the
    action's link should be displayed.

    Returns:
        bool: The value of the attribute `_userScriptCheck`, if it is a
            boolean, or the return value of `_userScriptCheck`, if it is
            a function.
    */
    if (typeof(this._userScriptCheck) === 'boolean') {
        return this._userScriptCheck;
    } else {
        return this._userScriptCheck();
    }
}

s.Action.prototype.choose = function() {
    /*Uses the `_userScriptChoose` attribute to choose an outcome from
    the action.

    Returns:
        Outcome: `null`, if the action is empty, otherwise return the
            value of `_userScriptChoose`.
    */
    if (this.length() === 0) {
        return null;
    } else {
        return this._userScriptChoose();
    }
}

s.Action.prototype.addOutcome = function(
        func, targetPsg, chooseFunc, embed, nobreak
    ) {
    /*Adds an outcome to the calling instance.

    Args:
        func (func, optional): If provided, this function will be
            carried out just prior to loading the node associated with
            `targetPsg`.
        targetPsg (str, optional): The title of a passage. If provided,
            the outcome will end by loading the node associated with
            this passage. If no such node exists, one will be created.
        chooseFunc (func or string, optional): If a function is
            provided, will replace the calling instance's current
            `_userScriptChoose` attribute. If the string, 'random', is
            provided, it will be converted to a function that chooses
            an outcome uniformly from all possible outcomes.
        embed (bool, optional): If `true`, the node associated with 
            `endPsgTitle` will be embedded in the currently loaded page.
            Defaults to the value of `st.page._continuous`.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break when embedding.

    Returns:
        Action: The calling instance.

    Raises:
        Error: If neither the `targetPsg` nor the `func` arguments are
            provided.
    */
    if (targetPsg == null && func == null) {
        throw new Error(
            's.addOutcome():\n' +
            'outcome must load a node or execute a function'
        );
    }

    if (chooseFunc === 'random') {
        chooseFunc = function() {
            return this._array.random();
        }
    }

    var targetNode;
    if (targetPsg != null) {
        targetNode = s.getNode(targetPsg);
        if (targetNode === undefined) {
            targetNode = new s.Node(targetPsg);
        }
    }

    var carryOutFunc;
    if (targetPsg == null) {
        carryOutFunc = func;
    } else if (func == null) {
        carryOutFunc = function() {
            st.page.load(targetNode, embed, nobreak);
        }
    } else {
        carryOutFunc = function() {
            func();
            st.page.load(targetNode, embed, nobreak);
        }
    }

    this.push(new s.Outcome(carryOutFunc));
    if (chooseFunc != null) {
        this.setChoose(chooseFunc);
    }

    return this;
}
