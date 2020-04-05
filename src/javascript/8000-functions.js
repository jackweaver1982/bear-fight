s.addLink = function(startPsgTitle, text, endPsgTitle,
                      func, checkFunc, embed, nobreak) {
    /*
    Creates a new Outcome that runs `func`, then loads the node
    associated with `endPsgTitle`. Then adds that Outcome to a new
    Action with the given `text` as its link text. Then adds that Action
    to the associated with `startPsgTitle`. The target node is loaded
    with the optional `embed` and `nobreak` parameters. The action is
    given `checkFunc` as its check function.

    If there are no nodes associated with the given passage titles, they
    will be created.
    */
    var startNode = s.nodes.get(Story.get(startPsgTitle));
    if (startNode === undefined) {
        startNode = new s.Node(startPsgTitle);
    }

    var targetNode = s.nodes.get(Story.get(endPsgTitle));
    if (targetNode === undefined) {
        targetNode = new s.Node(endPsgTitle);
    }

    var carryOutFunc;
    if (func == null) {
        carryOutFunc = function() {
            st.page.load(targetNode);
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

s.setSubCount = function(psgTitle, num) {
    /*
    Sets the sub count of the node associated with `psgTitle` to `num`.
    If no such node exists, creates one. Returns the associated node.
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
    /*
    For each action in the node associated with `fromPsgTitle`, pushes
    that action to the node associated with `toPsgTitle`.
    */
    var fromNode = s.getNode(fromPsgTitle);
    var toNode = s.getNode(toPsgTitle);
    for (var i = 0; i < fromNode.length(); i++) {
        toNode.push(fromNode.get(i));
    }
    return;
}

s.loadNode = function(psgTitle) {
    st.page.load(s.getNode(psgTitle));
    return;
}

s.loadInfoNode = function(psgTitle, checkFunc) {
    /*
    If `psgTitle` is associated with an info node, loads the info node.
    If `psgTitle` is associated with a non-info node, throws an error.
    If `psgTitle` is not associated with a node, creates a new info
    node with the given parameters and loads it.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        var newNode = new s.InfoNode(psgTitle, checkFunc);
        st.page.load(newNode);
        return;
    }
    if (node instanceof s.InfoNode) {
        st.page.load(node);
        return;
    }
    throw new Error(
        'loadInfoNode():\n' +
        '"' + psgTitle + '" is not an info node'
    );
}