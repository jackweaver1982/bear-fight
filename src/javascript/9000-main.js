v.version.set(0,1,4);

/*
Sample code demonstrating the node system.
*/

v.XP = 0;
v.knowledge = [];

s.makeNode('root');

    f.build('remember', 'Action');
    v.remember.setText(
        'Calmly stand still and try to remember something ' +
        'about how to survive a bear encounter'
    );
    v.root.push('remember');

        f.build('rememberSpray', 'Outcome');
        v.rememberSpray.carryOut = function() {
            v.XP += 1;
            v.knowledge.push('spray');
            v.bearCharges.load();
        }
        v.remember.push('rememberSpray');

    f.build('runAway', 'Action');
    v.runAway.setText(
        'Turn around and run down the hall'
    );
    v.root.push('runAway');

        f.build('tooSlow', 'Outcome');
        v.tooSlow.carryOut = function() {
            v.XP += 1;
            v.bearChases.setTextSubs(['down the hall']);
            v.bearChases.load();
        }
        v.runAway.push('tooSlow');

    f.build('runToLounge', 'Action');
    v.runToLounge.setText(
        'Run to the faculty lounge'
    );
    v.root.push('runToLounge');

        f.build('tooSlow2', 'Outcome');
        v.tooSlow2.carryOut = function() {
            v.XP += 1;
            v.bearChases.setTextSubs(['toward the lounge']);
            v.bearChases.load();
        }
        v.runToLounge.push('tooSlow2');

s.makeNode('bearCharges');

s.makeNode('bearChases');
v.bearChases.setSubCount(1);