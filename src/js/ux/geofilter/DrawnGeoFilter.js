/*
 * ogrid.DrawnGeoFilter
 *
 * Geo-filter processor for drawn geometric objects
 */


ogrid.DrawnGeoFilter = ogrid.BaseGeoFilter.extend({
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
            throw ogrid.error('Advanced Search (ogrid.DrawnGeoFilter)','Shape object is not initialized');
        }
        //shapeMap is of class L.featureGroup
        //var shapeData = shapeMap.getData();
        var filtered = [];

        var me = this;
        var layer = L.geoJson(me._options.shapeMap.toGeoJSON());
        $.each(data.features, function( i, v ) {
            //test if in bounds
            //$.each(me._options.shapeMap.getLayers(), function(j, w) {
                var r = leafletPip.pointInLayer(L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]), layer);
                if (r && (r.length > 0)) {
                    filtered.push(v);
                    return;
                }
            //});
        });
        //create clone
        var o = $.extend(true, {}, data);
        o.features = filtered;
        return o;
    },

    //returns multipolygon for use with service-side geo-spatial filtering
    getGeometry: function() {
        if (!this._options.shapeMap) {
            throw ogrid.error('Advanced Search (ogrid.DrawnGeoFilter)','Shape object is not initialized');
        }
        //shapeMap is of class L.featureGroup
        var me = this;
        var geoJSON = me._options.shapeMap.toGeoJSON();
        var multiGeo =  me._getEmptyMultiPolygon();
        $.each(geoJSON.features, function( i, v ) {
            multiGeo.features[0].geometry.coordinates.push(v.geometry.coordinates);
        });
        return multiGeo.features[0].geometry;
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.drawnGeoFilter = function (settings, options) {
    return new ogrid.DrawnGeoFilter(settings, options);
};