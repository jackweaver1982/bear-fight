v.version.set(0,1,6);

/*
Sample code demonstrating the node system.
*/

v.XP = 0;
v.knowledge = [];

s.makeNode('root');

v.root.addLink(
    'Calmly stand still and try to remember something ' +
    'about how to survive a bear encounter',

    'bearCharges',

    function() {
        v.XP += 1;
        v.knowledge.push('spray');
    }
);

v.root.addLink(
    'Turn around and run down the hall',

    'bearChases',

    function() {
        v.XP += 1;
        v.bearChases.setTextSubs(['down the hall']);
    }
);
v.bearChases.setSubCount(1);

v.root.addLink(
    'Run to the faculty lounge',

    'bearChases',

    function() {
        v.XP += 1;
        v.bearChases.setTextSubs(['toward the lounge']);
    }
);
