st.page.setContinuous(true);

s.makeLink(
    'Start', 'begin', 'intro', s.none, true, true
).setAlign('center');
s.makeLink('intro', 'continue', 'RNG warning');
s.makeLink('RNG warning', 'got it', 'who you are');

// s.bedroom = (new s.Node('bedroom', 2))
// v.parser.setSubs('bedroom', [
//     function() {
//         if (v.pounding) {
//             return 'You can hear the pounding on the front door coming from ' +
//                    'that direction. ';
//         } else if (v.crowbar) {
//             return 'Outside the bedroom, ' +
//                    (v.knowledge.has('policeAtDoor') ?
//                         'the police are' : 'someone is') +
//                    ' breaking into the house with a crowbar. ';
//         } else {
//             return '';
//         }
//     },
//     function() {
//         return (
//             v.containedIn.get('knife') == 'bedroom' ?
//             "What looks like a heavy-duty {chef's knife|D} is sticking out of"
//                 + 'his chest.' :
//             ''
//         );
//     }
// ]);
s.makeLink('who you are', 'take a look around', 'bedroom', s.none, false);

s.getNode('bedroom').push((new s.Action(
    'take the knife',
    function() {
        return (v.containedIn.get('knife') === 'bedroom');
    }
)).push(new s.Outcome(function() {
    v.containedIn.delete('knife');
    v.inventory.add('knife');
    st.parser.setSubs('Taking knife', [' You may need this for later.']);
    st.page.load(s.takingKnife, true, true);
    return;
})));

s.getNode('bedroom').push((new s.Action(
    'search the body',
    function() {
        return !v.body.searched;
    }
)).push(new s.Outcome(function() {
    v.body.searched = true;
    v.pounding = false;
    st.parser.setSubs('Cops bust in', [
        '',

        'As you bend down to take a closer look at the body, the bedroom ' +
        'door bursts open. ' 
    ]);
    st.page.load(s.copsBustIn, true);
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

s.makeLink('Cops bust in', 'continue', 'Next', function() {
    v.inventory.delete('knife');
});