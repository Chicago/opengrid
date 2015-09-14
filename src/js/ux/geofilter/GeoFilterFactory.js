/*
 * ogrid.GeoFilterFactory
 *
 * Factory class for getting appropriate geo filter object based on current settings
 */

ogrid.GeoFilterFactory = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods


    //public methods
    getFilter: function(settings) {
        if (settings.boundaryType==='within') {
            switch(settings.boundary) {
                case '':
                    throw ogrid.error('Advanced Search', 'Invalid Within option \'' + settings.boundary + '\'');
                case '_map-extent':
                    return new ogrid.MapExtentGeoFilter(settings, this._options);

                case '_drawn-extent':
                    return new ogrid.DrawnGeoFilter(settings, this._options);
                default:
                    return new ogrid.ShapeGeoFilter(settings, this._options);
            }
        } else {
            //near
            if (settings.boundary === '_marker')
                return new ogrid.PointGeoFilter(settings, this._options);
            else if (settings.boundary === '_me') {
                return new ogrid.GeoLocationGeoFilter(settings, this._options);
            } else {
                throw ogrid.error('Advanced Search', 'Invalid Near option \'' + settings.boundary + '\'');
            }
        }

    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.geoFilterFactory = function (options) {
    return new ogrid.GeoFilterFactory(options);
};