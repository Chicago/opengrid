/*
 * ogrid.PointGeoFilter
 *
 * Geo-filter processor based markers put on a map and max radius setting
 */


ogrid.PointGeoFilter = ogrid.BaseGeoFilter.extend({
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
        throw ogrid.error('Advanced Search (ogrid.PointGeoFilter)', 'Unsupported radius unit \'' + this._settings.maxRadiusUnit  + '\'');
    },

    //public methods
    filter: function(data) {
        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.PointGeoFilter)','Shape object is not initialized');
        }
        //shapeMap is of class L.featureGroup
        var filtered = [];

        var me = this;
        $.each(data.features, function( i, v ) {
            //check with each marker on the feature group
            $.each(me._options.shapeMap.getLayers(), function(j, w) {
                var c = L.circle(w.getLatLng(), me._getRadius());
                //for debugging only
                //c.addTo(me._options.map);

                var b = c.getBounds();
                if (b.contains(L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]))) {
                    filtered.push(v);

                    //get out of each loop since this data point is already in our array
                    return false;
                }
            });
        });
        //create clone
        var o = $.extend(true, {}, data);
        o.features = filtered;
        return o;
    },

    getGeometry: function() {
        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.PointGeoFilter)','Shape object is not initialized');
        }
        var me = this;
        var multiGeo =  me._getEmptyMultiPolygon();
        $.each(me._options.shapeMap.getLayers(), function(i, v) {
            var c = L.circle(v.getLatLng(), me._getRadius());

            var coordinates = me._getCoordinatesFromLatLngBounds(c.getBounds());
            multiGeo.features[0].geometry.coordinates.push(coordinates);
        });
        return multiGeo.features[0].geometry;
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.pointGeoFilter = function (settings, options) {
    return new ogrid.PointGeoFilter(options);
};