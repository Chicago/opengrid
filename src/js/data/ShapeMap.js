/*
 * ogrid.ShapeMap
 *
 * Base shape map for boundaries
 */

ogrid.ShapeMap = ogrid.Class.extend({
    //private attributes
    _options:{},
    _geoJson: null,


    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            //one of the options is the service URL to call if id cannot be looked up
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods


    //public methods
    getData: function () {
        return this._geoJson;
    },

    setData: function (map) {
        this._geoJson = map;
    },


    getShapeByBoundaryId: function(id) {
        //if id cannot be found in the offline map, use service Url later
        return this._geoJson[id];
    }

});