/*
 * ogrid.MapExtentGeoFilter
 *
 * Geo-filter processor based on map extent
 */


ogrid.MapExtentGeoFilter = ogrid.BaseGeoFilter.extend({
    //private attributes
    _options:{},
    _settings: null,
    //public attributes


    //constructor
    init: function(settings, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._settings = settings;
    },


    //private methods


    //public methods
    filter: function(data) {
        //filter is dynamic and extent is calculated in real-time
        if (!this._options.map) {
            throw ogrid.error('Advanced Search (ogrid.MapExtentGeoFilter)','Map object is not initialized');
        }
        var b = this._options.map.getBounds();
        var filtered = [];
        $.each(data.features, function( i, v ) {
            //test if in bounds
            if (b.contains(L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0])))
                filtered.push(v);
        });
        //create clone
        var o = $.extend(true, {}, data);
        o.features = filtered;
        return o;
    },

    getGeometry: function() {
        //filter is dynamic and extent is calculated in real-time
        if (!this._options.map) {
            throw ogrid.error('Advanced Search (ogrid.MapExtentGeoFilter)','Map object is not initialized');
        }
        var coordinates = this._getCoordinatesFromLatLngBounds(this._options.map.getBounds());
        var multiGeo =  this._getEmptyMultiPolygon();
        multiGeo.features[0].geometry.coordinates.push(coordinates);
        return multiGeo.features[0].geometry;
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.mapExtentGeoFilter = function (settings, options) {
    return new ogrid.MapExtentGeoFilter(settings, options);
};