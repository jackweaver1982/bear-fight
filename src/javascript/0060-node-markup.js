/*
This file encodes the special text processing done by the node system on
the passage text. The text substitutions are stored in `v` so that they
are saved to the history. SugarCube's `onProcess` method triggers after
the `:passagestart` event, to the text substitutions should be loaded in
before the node text processing takes places.
*/

v.textSubstitutions = []; // the string array used in text substitutions
                          // for the current passage

s.processNodeMarkup = function(passage) {
    /*
    Processes the special node markup in the given passage. Does nothing
    if the given passage is any special passage other that `Start`.
    Returns the processed text.

    @param passage - An abbreviated instance of SC's `Passage` object,
    containing only the `tags`, `text`, and `title` properties.
    */
    if (s.specialPassages.indexOf(passage.title) >= 0) {
        return passage.text;
    }

    var processedText = passage.text; // a placeholder for now, while I
                                      // work on this function

    return processedText;
}

Config.passages.onProcess = function (passage) {
    return s.processNodeMarkup(passage);
};