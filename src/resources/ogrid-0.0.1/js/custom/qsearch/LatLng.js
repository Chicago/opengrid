/*
 * ogrid.QSearchProcessor.LatLng
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.LatLng = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //customize this RegEx pattern for this processor
    _pattern: '',
    _input:'',

    //public attributes


    //constructor
    init: function(inputString, options) {
        if (options)
            this._options = options;
        this._input = inputString;
    },


    //private methods


    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },


    exec: function(onSuccess, onError) {
        var latlng = L.latLng(this._input.split(','));

        //create a geojson object
        var o = {
                "type" : "FeatureCollection",
                "features" : [
                    {
                        "type": "Feature",
                        "properties": {
                            "_id": "197479705333600260",
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

//supported syntax (regex)
//RegEx pattern by which the QuickSearch Prcoessor factory can recognize this
ogrid.QSearchProcessor.LatLng.pattern = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/i;