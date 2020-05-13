/*Uses: Page_.

Defines a collection of useful functions for designing a story with the
node system.
*/

s.addLink = function(startPsgTitle, text, endPsgTitle,
                      func, checkFunc, embed, nobreak) {
    /*Creates a link (i.e. an action with a single outcome) in the node
    associated with the given passage title.

    Args:
        startPsgTitle (str): The title of the passage on which to create
            the link. If this passage is not associated to a node, a
            new node will be created and associated with it.
        text (str): The text of the link.
        endPsgTitle (str, optional): If provided, the link will load the
            node associated with this passage title. If no such node
            exists, one will be created.
        func (func, optional): If provided, this function will be
            carried out just prior to loading the node associated with
            `endPsgTitle`.
        checkFunc (func or bool, optional): Used to determine whether
            the link should be displayed. Defaults to `true`.
        embed (bool, optional): If `true`, the node associated with 
            `endPsgTitle` will be embedded in the currently loaded page.
            Defaults to the value of `st.page._continuous`.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break when embedding.

    Raises:
        Error: If neither the `endPsgTitle` nor the `func` arguments are
            provided..
    */
    if (endPsgTitle == null && func == null) {
        throw new Error(
            'addLink():\n' +
            'link must load a node or execute a function'
        );
    }

    var startNode = s.nodes.get(Story.get(startPsgTitle));
    if (startNode === undefined) {
        startNode = new s.Node(startPsgTitle);
    }

    var targetNode;
    if (endPsgTitle != null) {
        targetNode = s.nodes.get(Story.get(endPsgTitle));
        if (targetNode === undefined) {
            targetNode = new s.Node(endPsgTitle);
        }
    }

    var carryOutFunc;
    if (endPsgTitle == null) {
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

    startNode.addAction(text, carryOutFunc, checkFunc);
    return;
}

s.loadNode = function(psgTitle, embed, nobreak) {
    /*A shortcut for `Page.load()` which allows a passage title to be
    passed as an argument.

    Args:
        psgTitle (str): The passage title associated with the node that
            will be loaded.
        embed (bool, optional): If `true`, the passage will be embedded
            in the currently loaded page. Defaults to the value of
            `st.page._continuous`.
        nobreak (bool, optional): Defaults to false. Set to true to omit
            the scene break when embedding.
    */
    st.page.load(s.getNode(psgTitle), embed, nobreak);
    return;
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
