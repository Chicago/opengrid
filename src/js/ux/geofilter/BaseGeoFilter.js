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

    //this one's more like a common private method
    _fixCircleGetBounds: function(c) {
        //overlay these Circle methods with code from Leaflet 0.73 that we know works previously
        c._getLatRadius =  function () {
            return (this._mRadius / 40075017) * 360;
        };

        if (!L.LatLng.DEG_TO_RAD) {
            L.LatLng.DEG_TO_RAD = (Math.PI / 180);
        }

        c._getLngRadius = function () {
            return this._getLatRadius() / Math.cos(L.LatLng.DEG_TO_RAD * this._latlng.lat);
        };

        c.getBounds = function () {
            var lngRadius = this._getLngRadius(),
                latRadius = (this._mRadius / 40075017) * 360,
                latlng = this._latlng;

            return new L.LatLngBounds(
                [latlng.lat - latRadius, latlng.lng - lngRadius],
                [latlng.lat + latRadius, latlng.lng + lngRadius]);
        };
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