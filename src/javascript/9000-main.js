s.start = (new s.Node('Start')).push(
    (new s.Action('begin')).push(
        new s.Outcome(function() {
            s.intro.load()
        })
    )
);

s.intro = new s.Node('Intro')