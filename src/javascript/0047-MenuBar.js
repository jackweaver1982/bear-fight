s.MenuBar = function() {
    /*
    A `MenuBar` instance is a list of actions to be included in the
    header of the story.
    */
    s.ActionList.call(this);
    return this;
};

s.MenuBar.prototype = Object.create(s.ActionList.prototype);

Object.defineProperty(s.MenuBar.prototype, 'constructor', {
    value: s.MenuBar,
    enumerable: false,
    writable: true
});