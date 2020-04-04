s.addLink('intro', 'continue', 'RNG warning');
s.addLink('RNG warning', 'got it', 'who you are');
s.addLink('who you are', 'take a look around', 'bedroom');

s.addLink('bedroom', 'take the knife', 'Taking knife', function() {
    v.containedIn.delete('knife');
    v.inventory.add('knife');
    st.parser.setSubs('Taking knife', [' You may need this for later.']);
}, function() {
    return (v.containedIn.get('knife') === 'bedroom');
}, true, true)

s.setSubCount('Taking knife', 1);

s.addLink('bedroom', 'search the body', 'Cops bust in', function() {
    v.body.searched = true;
    v.pounding = false;
    st.parser.setSubs('Cops bust in', [
        '',

        'As you bend down to take a closer look at the body, the bedroom ' +
        'door bursts open. ' 
    ]);
}, function() {
    return !v.body.searched;
})

s.setSubCount('Cops bust in', 2);

s.copyActions('bedroom', 'Taking knife');

s.addLink('Cops bust in', 'continue', 'Next', function() {
    v.inventory.delete('knife');
});