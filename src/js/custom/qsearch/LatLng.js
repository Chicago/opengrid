/*
 * ogrid.QSearchProcessor.LatLng
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.LatLng = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //customize this RegEx pattern for this processor
    _pattern: /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/i,
    _input:'',

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods


    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },

    test: function(input) {
        return this._pattern.test(input);
    },

    exec: function(input, onSuccess, onError) {
        var latlng = L.latLng(input.split(','));

        //create a geojson object
        var o = {
                "type" : "FeatureCollection",
                "features" : [
                    {
                        "type": "Feature",
                        "id": ogrid.guid(),
                        "properties": {
                            "_id": "197479705333600260", //some arbitrary number
                            "lat": latlng.lat,
                            "long": latlng.lng
                        },
                        //"geometry": {"type": "Point", "coordinates": [-87.61846, 41.88563]},
                        "geometry": {"type": "Point", "coordinates": [latlng.lng, latlng.lat]},
                        "autoPopup": true
                    }
                ],
                //meta view formatting overrides default from dataset descriptor
                "meta": {
                    "view": {
                        "id": "latlng",
                        "displayName": "Latitude/Longitude",
                        "options": {
                            "rendition": {
                                "icon":"marker"
                            }
                        },
                        "columns": [
                            {"id":"_id", "displayName":"ID", "dataType":"string", "filter":false, "popup":false, "list":false},
                            {"id":"lat", "displayName":"Latitude", "dataType":"float", "popup":true, "list":true, "sortOrder":1},
                            {"id":"long", "displayName":"Longitude", "dataType":"float", "popup":true, "list":true, "sortOrder":2}
                        ]
                    }
                }
            };

        onSuccess(o);
    }
});


//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.latLng = function (options) {
    return new ogrid.QSearchProcessor.LatLng(options);
};