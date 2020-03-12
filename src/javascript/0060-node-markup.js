/*
This file encodes the special text processing done by the node system on
the passage text.
*/

s.procTextSubContainers = function(psgTitle, psgText) {
    /*
    Replaces instances of `{<number>}` in the passage text with span
    containers for inserting the passages text substitutions. Throws an
    error if any index is out of bounds, if any index is repeated, or if
    there are not enough indices. Returns the processed text.

    @param {String} psgTitle - The title of the passage being processed.
    @param {String} psgText - The text of the passage being processed.
    */
    var passage = Story.get(psgTitle);
    var psgId = passage.domId;

    var node = s.nodes.get(passage);
    var subCount = node.getSubCount();
    var subsFound = 0;

    var regex = /\{(\d+?)\}/;

    var processedText = psgText;
    var result, spanText;
    while (true) {
        result = regex.exec(processedText);

        if (result === null) {
            if (subsFound < subCount) {
                throw new Error(
                    'too few text substitutions in passage, "' +
                    psgTitle + '"'
                );
            }

            return processedText;
        }

        if (parseInt(result[1], 10) >= subCount) {
            throw new Error(
                'text substitution index out of range in passage, "' +
                psgTitle + '"'
            );
        }

        spanText = (
            '<span id="' + psgId + '-sub-' + result[1] + '"></span>'
        );

        if (processedText.indexOf(spanText) >= 0) {
            throw new Error(
                'duplicate text substitution index in passage, "' +
                passage.title + '"'
            );
        }

        subsFound += 1;
        processedText = (
            processedText.slice(0, result.index) +
            spanText +
            processedText.slice(result.index + result[0].length)
        );
    }
}

s.examine = function(description, id) {
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

s.procExamineLinks = function(psgTitle, psgText) {
    /*
    Replaces instances of `{text|id}` with links that reveal a
    description. The description is found in a corresponding instance of
    `{?id|description}` which is replaced by a div element into which
    the description appears. The appearance of the description is
    controlled by the function `s.examine()`.

    The text in the link markup cannot begin with a `?` and cannot
    contain a `|`. The id in the link markup must contain only letters,
    numbers, and `_`, and must begin with a letter.

    @param {String} psgTitle - The title of the passage being processed.
    @param {String} psgText - The text of the passage being processed.
    */
    var passage = Story.get(psgTitle);
    var psgId = passage.domId;

    var linkRegex = /\{(.+?)\|([a-zA-Z][0-9a-zA-Z_]*?)\}/;

    var processedText = psgText;

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
                '<<run s.examine(' + 
                    '"' + descText + '", "' + elementId + '"' +
                ')>>' +
            '<</link>>'
        );

        part[3-j] = (
            '<p><span id="' + elementId + '" class="description">' +
            '</span></p>'
        );

        processedText = part.join('');
    }
}

s.addNodeContainers = function(psgTitle, psgText) {
    var passage = Story.get(psgTitle);
    return (
        '<div id="' + passage.domId + '-body">\n' +
            psgText + '\n' +
        '</div>\n' + 
        '<div id="' + passage.domId + '-actions"></div>\n' +
        '<div id="' + passage.domId + '-next"></div>\n'
    );
}

s.procNodeMarkup = function(psgTitle, psgText) {
    /*
    Processes the special node markup in the given passage. Does nothing
    if the given passage is not associated with a node. Returns the
    processed text.

    @param {String} psgTitle - The title of the passage being processed.
    @param {String} psgText - The text of the passage being processed.
    */
    var node = s.nodes.get(Story.get(psgTitle));
    if (node === undefined) {
        return psgText;
    }

    var processedText = psgText;
    processedText = s.procTextSubContainers(psgTitle, processedText);
    processedText = s.procExamineLinks(psgTitle, processedText);
    processedText = s.addNodeContainers(psgTitle, processedText);

    return processedText;
}

Config.passages.onProcess = function (p) {
    return s.procNodeMarkup(p.title, p.text);
};