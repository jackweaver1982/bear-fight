s.makeLink('Start', 'begin', 'intro').setAlign('center');
s.makeLink('intro', 'continue', 'RNG warning');
s.makeLink('RNG warning', 'got it', 'who you are');
s.makeLink('who you are', 'take a look around', 'bedroom');

s.searchBody = new s.Action(
    'search the body',
    function() {
        return !v.body.searched;
    }
).push(new s.Outcome(function() {
    v.body.searched = true;
    v.textSubs = [
        '',

        'As you bend down to take a closer look at the body, the bedroom ' +
        'door bursts open. ' 
    ];
    s.copsBustIn.load();
}));

s.getNode('bedroom').push(s.searchBody);

s.copsBustIn = new s.Node('Cops bust in', 2, function() {
    v.detective.discovered = true;
    return;
});
