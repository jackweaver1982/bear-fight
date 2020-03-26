v.page.setContinuous(true);

s.makeLink(
    'Start', 'begin', 'intro', s.none, true, true
).setAlign('center');
s.makeLink('intro', 'continue', 'RNG warning');
s.makeLink('RNG warning', 'got it', 'who you are');
s.makeLink('who you are', 'take a look around', 'bedroom', s.none, false);

s.getNode('bedroom').push((new s.Action(
    'take the knife',
    function() {
        return (v.containedIn.get('knife') === 'bedroom');
    }
)).push(new s.Outcome(function() {
    v.containedIn.delete('knife');
    v.inventory.add('knife');
    v.parser.setSubs('Taking knife', [' You may need this for later.']);
    v.page.load(s.takingKnife, true, true);
    return;
})));

s.getNode('bedroom').push((new s.Action(
    'search the body',
    function() {
        return !v.body.searched;
    }
)).push(new s.Outcome(function() {
    v.body.searched = true;
    v.parser.setSubs('Cops bust in', [
        '',

        'As you bend down to take a closer look at the body, the bedroom ' +
        'door bursts open. ' 
    ]);
    v.page.load(s.copsBustIn, true);
    return;
})));



s.copsBustIn = new s.Node('Cops bust in', 2, function() {
    v.detective.discovered = true;
    return;
});



s.takingKnife = new s.Node('Taking knife', 1);

s.bedroom = s.getNode('bedroom')
for (var i = 0; i < s.bedroom.length(); i++) {
    s.takingKnife.push(s.bedroom.get(i));
}

s.makeLink('Cops bust in', 'continue', 'Next');