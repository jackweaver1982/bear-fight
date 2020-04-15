s.version.set(0,4,2);

s.savesMgr.setBlock(true);

st.page.setContinuous(true);

s.menuBar.addAction('info', function() {
    s.loadInfoNode('help');
});
s.menuBar.addAction('bio', function() {
    s.loadInfoNode('bio');
});
s.menuBar.addAction(
    'restart',
    function() {
        if (confirm('Really restart?')) {
            s.restart();
        }
    }
);

s.menu = new s.Menu(function() {
    s.loadNode('intro', false);
});
s.menu.addAction('info', function() {
    s.loadInfoNode('help');
});
s.menu.addAction('bio', function() {
    s.loadInfoNode('bio');
});
s.menu.addAction(
    'restart',
    function() {
        if (confirm('Really restart?')) {
            s.restart();
        }
    }
);

s.debCon.setCheat([
    'help', 'help', 'help', 'bio', 'help', 'bio', 'help', 'help', 'bio'
]);

s.addLink('intro', 'continue', 'RNG warning');
s.addLink('RNG warning', 'got it', 'who you are', null, null, false);
// s.addLink('RNG warning', 'got it', 'who you are');
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
    }, true, true);

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