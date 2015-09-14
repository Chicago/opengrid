/*
 * ogrid.BaseGeoFilter
 *
 * Base class for geographic filters
 */

ogrid.BaseGeoFilter = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(settings, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods


    //public methods
    filter: function(data) {

    }

});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.baseGeoFilter = function (options) {
    return new ogrid.BaseGeoFilter(options);
};