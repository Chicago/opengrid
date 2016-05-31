/*
 * ogrid.PointGeoFilter
 *
 * Geo-filter processor based markers put on a map and max radius setting
 */


ogrid.GeoLocationGeoFilter = ogrid.BaseGeoFilter.extend({
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
    _getRadius: function() {
        if (!this._settings.maxRadius || !this._settings.maxRadiusUnit) {
            throw ogrid.error('Advanced Search (ogrid.PointGeoFilter)', 'Radius data is not initialized');
        }
        if (this._settings.maxRadiusUnit === 'miles')
            //convert to meters
            return (this._settings.maxRadius * 1609.34);
        else if (this._settings.maxRadiusUnit === 'feet')
            //convert to meters
            return (this._settings.maxRadius * 0.3048);
        throw ogrid.error('Advanced Search (ogrid.GeoLocationGeoFilter)', 'Unsupported radius unit \'' + this._settings.maxRadiusUnit  + '\'');
    },

    //public methods
    filter: function(data) {
        if (!this._settings.maxRadius || !this._settings.maxRadiusUnit) {
            throw ogrid.error('Advanced Search (ogrid.GeoLocationGeoFilter)', 'Radius data is not initialized');
        }

        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.GeoLocationGeoFilter)', 'No Geo-location coordinates were detected. Please allow geo-location detection in your browser.');
        }

        var filtered = [];

        var me = this;
        $.each(data.features, function( i, v ) {
            //check each data point against location LatLng + radius

            //shapeMap for Near Me will contain the LatLng of the last location found
            var c = L.circle(me._options.shapeMap, me._getRadius());
            //for debugging only
            //c.addTo(me._options.map);

            var b = c.getBounds();
            if (b.contains(L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]))) {
                filtered.push(v);
            }
        });
        //create clone
        var o = $.extend(true, {}, data);
        o.features = filtered;
        return o;
    },

    getGeometry: function() {
        if (!this._settings.maxRadius || !this._settings.maxRadiusUnit) {
            throw ogrid.error('Advanced Search (ogrid.GeoLocationGeoFilter)', 'Radius data is not initialized');
        }

        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.GeoLocationGeoFilter)', 'No Geo-location coordinates were detected. Please allow geo-location detection in your browser.');
        }

        //shapeMap for Near Me will contain the LatLng of the last location found
        var c = L.circle(this._options.shapeMap, this._getRadius());

        var coordinates = this._getCoordinatesFromLatLngBounds(c.getBounds());
        var polyGeo =  this._getEmptyPolygon();
        polyGeo.features[0].geometry.coordinates = coordinates;
        return polyGeo.features[0].geometry;
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.geoLocationGeoFilter = function (settings, options) {
    return new ogrid.GeoLocationGeoFilter(options);
};