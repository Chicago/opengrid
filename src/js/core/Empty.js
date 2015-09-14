/*
 * ogrid.<Class Name>
 *
 * <description of class>
 */

// Template class code
// Copy this when creating a new class

ogrid.Empty = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    }


    //private methods


    //public methods

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.empty = function (options) {
    return new ogrid.Empty(options);
};