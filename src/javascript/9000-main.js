s.version.set(0,4,5);
s.savesMgr.setBlock(true); // block loading of saves from old versions
st.page.setContinuous(true); // make embedding passages the default

// build menu
s.menu.onBegin(function() {
    s.loadNode('intro');
});
s.menu.addAction('info', function() {
    s.loadInfoNode('help');
});
s.menu.addAction('bio', function() {
    s.loadInfoNode('bio');
});

// set cheat code for debug mode
s.debCon.setCheat([
    'help', 'help', 'help', 'bio', 'help', 'bio', 'help', 'help', 'bio'
]);

// make initial links
s.addLink('intro', 'continue', 'RNG warning');
s.addLink(
    'RNG warning', 'got it', 'who you are', null, null, false // don't embed
);
s.addLink('who you are', 'take a look around', 'bedroom');

// bedroom actions

    // take the knife
    s.addLink('bedroom', 'take the knife', 'Taking knife', function() {
        // carry out
        v.containedIn.delete('knife');
        v.inventory.add('knife');
    }, function() {
        // check
        return (v.containedIn.get('knife') === 'bedroom');
    }, true, true); // embed with scene break

    // search the body
    s.setSubCount('Cops bust in', 2);
    s.addLink('bedroom', 'search the body', 'Cops bust in', function() {
        // carry out
        v.body.searched = true;
        v.pounding = false;
        st.parser.setSubs('Cops bust in', [
            '',

            'As you bend down to take a closer look at the body, ' +
            'the bedroom door bursts open. '
        ]);
    }, function() {
        // check
        return !v.body.searched;
    });

    s.addLink('bedroom', 'mark body as searched', null, function() {
        v.body.searched = true;
        State.create(State.passage);
        st.page.refreshActions();
    }, function() {
        return !v.body.searched;
    });

    s.addLink('bedroom', 'mark body as not searched', null, function() {
        v.body.searched = false;
        State.create(State.passage);
        st.page.refreshActions();
    }, function() {
        return v.body.searched;
    });

// Taking knife actions
s.copyActions('bedroom', 'Taking knife');

// Cops bust in actions
s.addLink('Cops bust in', 'continue', 'Next');