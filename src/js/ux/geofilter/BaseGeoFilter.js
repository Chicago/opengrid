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
    _getEmptyMultiPolygon: function() {
        return {
            "type":"FeatureCollection",
            "features":[{
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates":[
                    ]
                }
            }]
        };
    },

    _getEmptyPolygon: function() {
        return {
            "type":"FeatureCollection",
            "features":[{
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates":[
                    ]
                }
            }]
        };
    },

    //returns array of coordinates from latLngBounds
    _getCoordinatesFromLatLngBounds: function(latLngBounds) {
        return [
            [
                [latLngBounds.getWest(), latLngBounds.getNorth()],
                [latLngBounds.getEast(), latLngBounds.getNorth()],
                [latLngBounds.getEast(), latLngBounds.getSouth()],
                [latLngBounds.getWest(), latLngBounds.getSouth()],
                [latLngBounds.getWest(), latLngBounds.getNorth()]
            ]
        ];
    },

    //public methods
    filter: function(data) {

    },

    getGeometry: function() {

    }

});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.baseGeoFilter = function (options) {
    return new ogrid.BaseGeoFilter(options);
};