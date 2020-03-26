/*
A Parser object manages the conversion of the given passage text to the
actual passage text used by SugarCube to display information.

There is one instance (see Global.js), built on State.variables, so its
state can be stored in SugarCube's history. (This is needed, because the
parser tracks dynamically generated text substitutions.) The class must
therefore be made compatible with SugarCube by having `clone()` and
`toJSON()` methods, and no recursive objects or object sharing. To
achieve this, we also require it to have a constructor with no arguments
and to have all its properties be SC supported types.

There are various methods for processing different kinds of markup. The
method, `procMarkup()`, runs them all in the appropriate order. Through
`Config.passages.onProcess`, we instruct SugarCube to apply
`procMarkup()` to passage text whenever a passage is rendered.
*/

s.Parser = function() {
    this._textSubMap = new Map(); // Maps passage titles to arrays of
                                  // text subs.
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
    return this._textSubMap.get(psgTitle);
}

s.Parser.prototype.setSubs = function(psgTitle, subArray) {
    /*
    Adds `psgTitle` key to `_textSubMap` with value `subArray`. Throws
    an error if `psgTitle` doesn't correspond to a node, length of
    `subArray` does match the sub count of the node, or `subArray` is
    not a string array. Returns the calling Parser object.
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
        return (typeof(element) === 'string');
    })) {
        throw new Error(
            'Parser.setSubs():\n' +
            'text substitutions must be strings'
        );
    }
    this._textSubMap.set(psgTitle, subArray);
    return this;
}

s.Parser.prototype.insertTextSubs = function(psgTitle, text) {
    /*
    Fetches the array of text substitutions corresponding to `psgTitle`,
    or `[]` if there is no such array, then replaces instances of
    `{<number>}` in the given text with corresponding elements from that
    array.

    Does nothing if the node associated with `psgTitle` has a sub count
    of 0. Throws an error if the sub count doesn't match the length of
    the substitution array, if any index is out of bounds, if any index
    is repeated, or if there are not enough indices. Returns the
    processed text.

    @param {String} psgTitle - The title of the passage being processed.
    This passage title must correspond to a node. Passing a title that
    does not correspond to a node could have unexpected behavior.
    @param {String} text - The text to process.
    */
    var subArray = (this.getSubs(psgTitle) || []);
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
    /*
    Inserts the given description into the element with the given id and
    clears all other elements with class `.description`. If the element
    with the given id already contains the given description, the
    function simply clears it.

    @param {String} description - the description to insert
    @param {String} id - the id of the containing element
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
    /*
    Replaces instances of `{<link text>|id}` in text with links that
    reveal a description. The description is found in a corresponding
    instance of `{?id|description}` which is replaced by a div element
    into which the description appears. The html id of the div element
    is determined by both the id in the markup and the given `psgTitle`.
    The appearance of the description is controlled by the method
    `Parser.showDetails()`.

    The link text cannot begin with a `?` and cannot contain a `|`. The
    id must contain only letters, numbers, and `_`, and must begin with
    a letter.

    @param {String} psgTitle - The title of the passage being processed.
    @param {String} text - The text of the passage being processed.
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
            if (/\{\?([a-zA-Z][0-9a-zA-Z_]*?)\|(.+?)\}/.test(processedText)) {
                throw new Error(
                    'description markup without link markup in passage, "' +
                    psgTitle + '"'
                );
            }
            return processedText;
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
                '<<run v.parser.showDetails(' + 
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
    /*
    Wraps the given text in a `body` container; adds an `action`
    container for the action links; adds a `next` container in case the
    next node is to be loaded without a passage transition. The html id
    of the containers is determined by `psgTitle`.

    @param {String} psgTitle - The title of the passage being processed.
    This passage title must correspond to a node. Passing a title that
    does not correspond to a node could have unexpected behavior.
    @param {String} text - The text to process.
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
    /*
    Removes line breaks from the given text.
    */
    var processedText = text.replace(/\r/g, '');
    processedText = processedText.replace(/^\n+|\n+$/g, '');
    processedText = processedText.replace(/\n+/g, ' ');
    return processedText;
}

s.Parser.prototype.procAllMarkup = function(psgTitle, text) {
    /*
    Processes the special node markup in the given passage (inserts text
    subs, processes the detail markup, adds the containers, and removes
    breaks. Does nothing if the given passage is not associated with a
    node. Returns the processed text.

    @param {String} psgTitle - The title of the passage being processed.
    @param {String} text - The text of the passage being processed.
    */
    var node = s.nodes.get(Story.get(psgTitle));
    if (node === undefined) {
        return text;
    }

    var processedText = text;
    processedText = this.insertTextSubs(psgTitle, processedText);
    processedText = this.procDetailMarkup(psgTitle, processedText);
    processedText = this.addContainers(psgTitle, processedText);
    processedText = this.removeBreaks(processedText);

    return processedText;
}