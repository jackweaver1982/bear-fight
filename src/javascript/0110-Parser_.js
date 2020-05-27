/*Uses: Node_.

Build the `Parser` class and instantiates it.

Attributes:
    st.parser (Parser): A `Parser` instance for use by other classes.

*/

s.Parser = function() {
    /*Prepares passage text for use by SugarCube.

    A Parser object manages the conversion of the given passage text to
    the actual passage text used by SugarCube to display information.

    There is one instance (`st.parser`), built in State.variables, so
    its state can be stored in SugarCube's history. (This is needed,
    because the parser tracks dynamically generated text substitutions.)
    The class must therefore be made compatible with SugarCube by having
    `clone ()` and `toJSON()` methods, and no recursive objects or
    object sharing. To achieve this, we also require it to have a
    constructor with no arguments and to have all its properties be SC
    supported types.

    Attributes:
        _textSubMap (map of str to arr of (str or func)): Maps passage
            titles to arrays of text subs. A text sub can be a simple
            string or a functions returning a string.
            
    */

    this._textSubMap = new Map();
    return this;    
};

s.Parser.prototype._init = function(obj) {
    /* Needed for SugarCube compatibility. */
    Object.keys(obj).forEach(function (pn) {
        this[pn] = clone(obj[pn]);
    }, this);
    return this;
};

s.Parser.prototype.clone = function () {
    /* Needed for SugarCube compatibility. */
    return (new s.Parser())._init(this);
};

s.Parser.prototype.toJSON = function () {
    /* Needed for SugarCube compatibility. */
    var newPC = {};
    Object.keys(this).forEach(function (pn) {
        newPC[pn] = clone(this[pn]);
    }, this);
    return JSON.reviveWrapper(
        '(new s.Parser())._init($ReviveData$)', newPC
    );
};

s.Parser.prototype.getSubs = function(psgTitle) {
    /*Fetches the array of text subs associated with the given passage
    title.

    Args:
        psgTitle (str): The title of the passage whose text subs to
            fetch.

    Returns:
        arr of (str or func): The array of text subs associated with the
            given passage title.
    */
    return this._textSubMap.get(psgTitle);
}

s.Parser.prototype.setSubs = function(psgTitle, subArray) {
    /*Sets the text subs for the given passage.

    Args:
        psgTitle (str): The title of the passage whose text subs are to
            be set.
        subArray (arr of (str or func)): The array of text subs to
            assign to the given passage.

    Returns:
        Parser: The calling instance.

    Raises:
        Error: If the given passage is not associated with a node, the
            number of given text substitutions does not match the given
            passage, or any of the given text substitutions is the wrong
            data type.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        throw new Error(
            'Parser.setSubs():\n' +
            '"' + psgTitle + '" does not correspond to a node.'
        );
    }
    if (node.getSubCount() !== subArray.length) {
        throw new Error(
            'Parser.setSubs():\n' +
            'unexpected number of text substitutions'
        );
    }
    if (!subArray.every(function(element) {
        return (typeof(element) === 'string' ||
                typeof(element) === 'function');
    })) {
        throw new Error(
            'Parser.setSubs():\n' +
            'text substitutions must be strings or' +
            'functions that return strings'
        );
    }
    this._textSubMap.set(psgTitle, subArray);
    return this;
}

s.Parser.prototype.insertTextSubs = function(psgTitle, text) {
    /*Fetches the array of text substitutions corresponding to
    `psgTitle` from the instance's `_textSubMap` attribute (or `[]` if
    there is no such array), then replaces occurrences of `{<number>}`
    in the given text with corresponding elements from that array.

    Does nothing if the node associated with `psgTitle` has a sub count
    of 0.

    Args:
        psgTitle (str): The title of the passage being processed. This
            passage title must correspond to a node. Passing a title
            that does not correspond to a node could have unexpected
            behavior.
        text (str): The text to process.

    Returns:
        str: The processed text.

    Raises:
        Error: If the passage's node expects more substitutions than are
            provided in the the parser's `_textSubMap` attribute.
        Error: If the passage text contains markup of the form '{n}',
            where n is larger than expected by the passage's node.
        Error: If the passage text contains markup of the form '{n}'
            repeated more than once with the same value of n.
    */
    var subArray = (this.getSubs(psgTitle) || []);
    subArray = subArray.map(function(element) {
        if (typeof(element) === 'function') {
            return element();
        } else {
            return element;
        }
    });

    var psg = Story.get(psgTitle);
    var node = s.nodes.get(psg);
    var subCount = node.getSubCount();
    if (subCount === 0) {
        return text;
    }

    var psgId = psg.domId;
    var subsFound = new Set();
    var regex = /\{(\d+?)\}/;
    var processedText = text;
    var result, index;
    while (true) {
        result = regex.exec(processedText);
        if (result === null) {
            if (subsFound.size < subCount) {
                throw new Error(
                    'too few text substitutions in passage, "' +
                    psgTitle + '"'
                );
            }
            return processedText;
        }
        index = parseInt(result[1], 10);
        if (index >= subCount) {
            throw new Error(
                'text substitution index out of range in passage, "' +
                psgTitle + '"'
            );
        }
        if (subsFound.has(index)) {
            throw new Error(
                'duplicate text substitution index in passage, "' +
                passage.title + '"'
            );
        }
        subsFound.add(index);
        processedText = (
            processedText.slice(0, result.index) +
            subArray[index] +
            processedText.slice(result.index + result[0].length)
        );
    }
}

s.Parser.prototype.showDetails = function(description, id) {
    /*Inserts the given description into the element with the given id
    and clears all other elements with class `.description`. If the
    element with the given id already contains the given description,
    the function simply clears it.

    Args:
        description (str): The description to insert.
        id (str): The HTML element id of the container into which to
            insert the description.
    */
    var text = jQuery("#" + id).html();     // store the current content
                                            // for comparison

    jQuery(".description").empty()          // clear all elements

    jQuery("#" + id).wiki(description);     // insert the description

    if (text === jQuery("#" + id).html()) { // empty content if already
        jQuery("#" + id).empty();           // present
    }

    return;
}

s.Parser.prototype.procDetailMarkup = function(psgTitle, text) {
    /*Replaces occurrences of `{<link text>|id}` in text with links that
    reveal a description. The description is found in a corresponding
    occurrence of `{?id|description}` which is replaced by a div element
    into which the description appears. The HTML id of the div element
    is determined by both the id in the markup and the given `psgTitle`.
    The appearance of the description is controlled by the parser's
    `showDetails` method.

    The link text cannot begin with a `?` and cannot contain a `|`. The
    id must contain only letters, numbers, and `_`, and must begin with
    a letter.

    Args:
        psgTitle (str): The title of the passage being processed.
        text (str): The text of the passage being processed.

    Returns:
        str: The processed text.
    */
    var psg = Story.get(psgTitle);
    var psgId = psg.domId;

    var linkRegex = /\{(.+?)\|([a-zA-Z][0-9a-zA-Z_]*?)\}/;

    var processedText = text;

    var cut = [0,0,0,0];         // indices at which to cut the given
                                 // text

    var part = ['','','','','']; // substrings to concatenate in order
                                 // to build the new text

    var j;                       // temporary storage, used in building
                                 // `cut`

    var linkResult, linkText, linkId, elementId;
    var descRegex, descResult, descText, descLoc;
    while (true) {
        linkResult = linkRegex.exec(processedText);

        if (linkResult === null) {
            return processedText.replace(
                /\{\?([a-zA-Z][0-9a-zA-Z_]*?)\|(.+?)\}/g, ''
            );
        }
        
        linkId = linkResult[2];
        descRegex = new RegExp(
            '\\{\\?' + linkId + '\\|(.+?)\\}'
        );
        descResult = descRegex.exec(processedText);

        if (descResult === null) {
            throw new Error(
                'link markup without description markup in passage, "' +
                psgTitle + '"'
            );
        }

        linkText = linkResult[1];
        descText = descResult[1];
        elementId = psgId + '-examine-' + linkId;

        j = linkResult.index < descResult.index ? 0 : 2;
        cut[j] = linkResult.index;
        cut[j+1] = linkResult.index + linkResult[0].length;
        cut[2-j] = descResult.index;
        cut[3-j] = descResult.index + descResult[0].length;

        part[0] = processedText.slice(0, cut[0]);
        part[2] = processedText.slice(cut[1], cut[2]);
        part[4] = processedText.slice(cut[3])

        part[j+1] = (
            '<<link "' + linkText + '">>' +
                '<<run st.parser.showDetails(' + 
                    '"' + descText + '", "' + elementId + '"' +
                ')>>' +
            '<</link>>'
        );

        part[3-j] = (
            '<div id="' + elementId + '" class="description">' +
            '</div>'
        );

        processedText = part.join('');
    }
}

s.Parser.prototype.addContainers = function(psgTitle, text) {
    /*Wraps the given text in a `body` container; adds an `action`
    container for the action links; adds a `next` container in case the
    next node is to be loaded without a passage transition. The HTML id
    of the containers is determined by `psgTitle`.

    Args:
        psgTitle (str): The title of the passage being processed.
        text (str): The text to process.

    Returns:
        str: The processed text.
    */
    var psg = Story.get(psgTitle);
    return (
        '<div id="' + psg.domId + '-body">\n\n' +
            text + '\n\n' +
        '</div>\n\n' + 
        '<div id="' + psg.domId + '-actions"></div>\n\n' +
        '<div id="' + psg.domId + '-next"></div>'
    );

}

s.Parser.prototype.removeBreaks = function(text) {
    /*Removes line breaks from the given text.

    Args:
        text (str): The text to process.

    Returns:
        str: The processed text.
    */
    var processedText = text.replace(/\r/g, '');
    processedText = processedText.replace(/^\n+|\n+$/g, '');
    processedText = processedText.replace(/\n+/g, ' ');
    return processedText;
}

s.Parser.prototype.procAllMarkup = function(psgTitle, text, time) {
    /*Processes the special node markup in the given passage (inserts
    text subs, processes the detail markup, adds the containers, and
    removes breaks. Does nothing if the given passage is not associated
    with a node. Returns the processed text.

    The optional `time` parameter is used to set the moment in SC's
    history from which to draw the values of variables. It allows for
    the use of variables in passage content.

    Args:
        psgTitle (str): The title of the passage being processed.
        text (str): The text of the passage being processed.
        time (int, optional): A nonnegative integer that defaults to
            zero. Sets the moment in history to use when parsing. A
            value of 0 denotes the current moment. A value of n > 0
            means to go back n moments in SC's history.
    */
    var node = s.getNode(psgTitle);
    if (node === undefined) {
        return text;
    }

    time = time || 0;
    if (time > 0) {
        s.loadVars(time);
    }

    var processedText = text;
    processedText = this.insertTextSubs(psgTitle, processedText);
    processedText = this.procDetailMarkup(psgTitle, processedText);
    processedText = this.addContainers(psgTitle, processedText);
    processedText = this.removeBreaks(processedText);

    if (time > 0) {
        s.loadVars(0);
    }

    return processedText;
}

st.parser = new s.Parser();
