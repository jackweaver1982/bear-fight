/*Uses: Page_.

Defines a collection of useful functions for designing a story with the
node system.

*/

s.getAction = function(actionPsg, actionText) {
    /*Get an `Action` object.

    Args:
        actionPsg (str): The title of the passage containing the action.
        actionText (str): The text of the action to get.

    Returns:
        Action: The action object determined by the arguments.
    */
    return s.getNode(actionPsg).getAction(actionText);
}

s.addLink = function(startPsg, text, func, targetPsg, checkFunc) {
    /*Creates a link (i.e. an action with a single Directed Outcome) in
    the node associated with the given passage title.

    Args:
        startPsg (str): The title of the passage on which to create
            the link. If this passage is not associated to a node, a
            new node will be created and associated with it.
        text (str): The text of the link.
        func (func or null): If not null, this function will be carried
            out just prior to loading the node associated with
            `targetPsg`.
        targetPsg (str): The passage title of the node the link will
            load. If the passage title is not associated with a node, a
            node will be created.
        checkFunc (func or bool, optional): Used to determine whether
            the link should be displayed. Defaults to `true`.
    */
    var startNode = s.getNode(startPsg);
    if (startNode === undefined) {
        startNode = new s.Node(startPsg);
    }

    var action = new s.Action(text, checkFunc);

    startNode.push(action);

    var targetNode = s.getNode(targetPsg);
    if (targetNode === undefined) {
        targetNode = new s.Node(targetPsg);
    }

    var outcome = new s.DirectedOutcome(targetNode, func);

    action.push(outcome);

    return outcome;
}

s.setSubCount = function(psgTitle, num) {
    /*Sets the sub count of the node associated with the given passage
    title. If no such node exists, one is created. Returns the
    associated node.

    Args:
        psgTitle (str): A passage title.
        num (int): The number of sub counts to assign to the passage's
            node.

    Returns:
        Node: The node, after its sub count is set.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        node = new s.Node(psgTitle, num);
        return node;
    } else {
        return node.setSubCount(num);
    }
}

s.copyActions = function(fromPsgTitle, toPsgTitle) {
    /*Copies actions from one node to another.

    Args:
        fromPsgTitle (str): The title of the passage associated with the
            node whose actions are to be copied.
        toPsgTitle (str): The title of the passage associated with the
            node into which the copied actions are to be inserted.
    */
    var fromNode = s.getNode(fromPsgTitle);
    var toNode = s.getNode(toPsgTitle);
    for (var i = 0; i < fromNode.length(); i++) {
        toNode.push(fromNode.get(i));
    }
    return;
}
