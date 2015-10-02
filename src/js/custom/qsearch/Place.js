/*
 * ogrid.QSearchProcessor.Place
 *
 * Extension class to support geo search for Quick Search classes
 */

ogrid.QSearchProcessor.Place = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //customize this RegEx pattern for this processor
    _pattern: '',
    _input:'',

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods
    _getInitialGeoJson: function() {
        //create a geojson object
        return {
            "type" : "FeatureCollection",
            "features" : [],
            //meta view formatting overrides default from dataset descriptor
            "meta": {
                "view": {
                    "id": "place",
                    "displayName": "Place/Address",
                    "options": {
                        "rendition": {
                            "icon":"marker"
                        }
                    },
                    "columns": [
                        {"id":"name", "displayName":"Name", "dataType":"string", "popup":true, "list":true, "sortOrder":1},
                        {"id":"score", "displayName":"Score", "dataType":"number", "popup":true, "list":true, "sortOrder":2},
                        {"id":"type", "displayName":"Type", "dataType":"string", "popup":true, "list":true, "sortOrder":3},
                        {"id":"lat", "displayName":"Latitude", "dataType":"float", "popup":true, "list":true, "sortOrder":4},
                        {"id":"long", "displayName":"Longitude", "dataType":"float", "popup":true, "list":true, "sortOrder":5}
                    ]
                }
            }
        };
    },

    _processData: function(data) {
        var o = this._getInitialGeoJson();

        if (data.locations.length >= 1) {
            for (var i in data.locations) {
                //need an Id for interaction between table and map to work
                var id = ogrid.guid();

                if (data.locations[i].feature) {
                    o.features.push( {
                        type:"Feature",
                        id: id,
                        "properties": {
                            "name":  data.locations[i].name,
                            "score": data.locations[i].feature.attributes.Score,
                            "type": data.locations[i].feature.attributes.Type,
                            "lat": data.locations[i].feature.geometry.y,
                            "long": data.locations[i].feature.geometry.x
                        },
                        "geometry": {"type": "Point", "coordinates": [data.locations[i].feature.geometry.x, data.locations[i].feature.geometry.y]}
                    });
                }
            }

        }
        return o;
    },

    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },


    exec: function(input, onSuccess, onError) {
        var me = this;

        //force to look within chicago (make configurable later)
        var txt = encodeURI(input);
        $.ajax({
            //use ArcGIS online's geocoder server
            url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?outSr=4326&forStorage=false&outFields=*&maxLocations=20&text=' + txt + '&magicKey=GST7YMc0AM9UOsE3GY8tIS9GOghnYnwZGPTp7P9PCZc0YiD7DsKGCZyAOh5-Dn47Z5Et1bWtHghnCbWQ&f=json',
            type: 'GET',
            async: true,
            timeout: ogrid.Config.service.timeout,
            xhrFields: {
                withCredentials: false
            },
            headers: {
                // Set any custom headers here.
                // If you set any non-simple headers, your server must include these
                // headers in the 'Access-Control-Allow-Headers' response header.
            },
            success: function(data) {
                //data coming back is string
                onSuccess(me._processData(JSON.parse(data)));
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                if (txtStatus === 'timeout') {
                    ogrid.Alert.error('Search has timed out.');
                } else {
                    ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
                }
            },
            statusCode: {
                //placeholder
                404: function() {
                    ogrid.Alert.error("ArcGIS Online Geocoder service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.place = function (options) {
    return new ogrid.QSearchProcessor.Place(options);
};