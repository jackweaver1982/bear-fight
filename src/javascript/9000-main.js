/* Builds the node structure for the game. Nodes, Actions, and Outcomes
should never be created dynamically. They should all be constructed
here, prior to the start of play. Use an Action's check function to hide
or show possible actions, depending on conditions. Use an Actions's
choose function to select between different possible outcomes, depending
on conditions.
*/

s.version.set(0,5,6);
s.savesMgr.setBlock(true); // block loading of saves from old versions
s.savesMgr.setBkMarks(8); // allow 8 bookmarks instead of 1
st.page.setContinuous(true); // make embedding passages the default

// build menu
s.menu.addInfoNode('info', 'help');
s.menu.addInfoNode('bio', 'bio');

// set cheat code for debug mode
s.debCon.setCheat([
    'help', 'help', 'help', 'bio', 'help', 'bio', 'help', 'help', 'bio'
]);

// make initial links
s.addLink('Root', 'continue', null, 'RNG warning');
s.addLink(
    'RNG warning', 'got it', null, 'who you are', null
).setEmbed(false); // don't embed
s.addLink('who you are', 'take a look around', null, 'bedroom');

// bedroom actions

    // take the knife
    s.addLink(
        'bedroom',
        'take the knife',
        function() {
            // carry out
            v.containedIn.delete('knife');
            v.inventory.add('knife');
        },
        'Taking knife',
        function() {
            // check
            return (v.containedIn.get('knife') === 'bedroom');
        }
    ).setEmbed(true, true); // embed without scene break

    // search the body
    s.setSubCount('Cops bust in', 2);
    s.addLink(
        'bedroom',
        'search the body',
        function() {
            // carry out
            v.body.searched = true;
            v.pounding = false;
            st.parser.setSubs(
                'Cops bust in',
                [
                    '',

                    'As you bend down to take a closer look at the body, ' +
                    'the bedroom door bursts open. '
                ]
            );
        },
        'Cops bust in',
        function() {
            // check
            return !v.body.searched;
        }
    );
    s.getAction('bedroom', 'search the body').addOutcome(
        null,
        'Cat involved',
        'random'
    );

// Taking knife actions
s.copyActions('bedroom', 'Taking knife');

// Cops bust in actions
s.addLink('Cops bust in', 'continue', null, 'Next');
