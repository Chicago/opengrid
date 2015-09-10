
var ogrid = {
    version: '0.0.1',

    //ogrid globals
    App:{} //init in main HTML
};

function expose() {
    var oldOgrid = window.ogrid;

    ogrid.noConflict = function () {
        window.ogrid = oldOgrid;
        return this;
    };

    window.ogrid = ogrid;
}

// define as a global ogrid variable, saving the original value to restore later if needed
if (typeof window !== 'undefined') {
    expose();
}
