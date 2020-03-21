s.makeLink('Start', 'begin', 'intro').setAlign('center');
s.makeLink('intro', 'continue', 'RNG warning');
s.makeLink('RNG warning', 'got it', 'who you are');
s.makeLink('who you are', 'take a look around', 'bedroom');

s.getNode('bedroom').push((new s.Action(
    'take the knife',
    function() {
        return (v.containedIn.get('knife') === 'bedroom');
    }
)).push(new s.Outcome(function() {
    v.containedIn.delete('knife');
    v.inventory.add('knife');
    v.textSubs.set('Taking knife', [' You may need this for later.']);
    s.takingKnife.load(true);
    return;
})));

s.getNode('bedroom').push((new s.Action(
    'search the body',
    function() {
        return !v.body.searched;
    }
)).push(new s.Outcome(function() {
    v.body.searched = true;
    v.textSubs.set('Cops bust in', [
        '',

        'As you bend down to take a closer look at the body, the bedroom ' +
        'door bursts open. ' 
    ]);
    s.copsBustIn.load(true);
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