/*
 * ogrid.ShapeGeoFilter
 *
 * Geo-filter processor based markers geoJson shape objects, could end up with the same implementation as DrawnGeoFilter
 */


ogrid.ShapeGeoFilter = ogrid.BaseGeoFilter.extend({
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
        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.ShapeGeoFilter)','Shape object is not initialized');
        }

        //shapeMap is geoJson object
        var filtered = [];

        //value should have the value for boundary value
        if (this._options.shapeMap[this._settings.value]) {
            var layer = L.geoJson(this._options.shapeMap[this._settings.value]);
            $.each(data.features, function( i, v ) {
                //test if in layer
                var r = leafletPip.pointInLayer(L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]), layer);
                if (r && (r.length > 0)) {
                    filtered.push(v);
                }
            });
        }

        //create clone
        var o = $.extend(true, {}, data);
        o.features = filtered;
        return o;
    },

    getGeometry: function() {
        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.ShapeGeoFilter)','Shape object is not initialized');
        }
        if (this._options.shapeMap[this._settings.value]) {
            var me = this;
            var geoJSON = me._options.shapeMap[this._settings.value];
            var multiGeo =  me._getEmptyMultiPolygon();
            $.each(geoJSON.features, function( i, v ) {
                multiGeo.features[0].geometry.coordinates.push(v.geometry.coordinates);
            });
            return multiGeo.features[0].geometry;
        } else
            throw ogrid.error('Advanced Search (ogrid.ShapeGeoFilter)','Shape object is not initialized');

    }

});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.shapeGeoFilter = function (settings, options) {
    return new ogrid.ShapeGeoFilter(settings, options);
};