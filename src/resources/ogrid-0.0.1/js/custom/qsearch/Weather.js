/*
 * ogrid.QSearchProcessor.Weather
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.Weather = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //for parsing, different from the one used by the factory class
    _pattern: /^(weather|wea)(\s)*((\s)+(\d{5})+)*$/i,
    _input: '',

    //public attributes


    //constructor
    init: function(inputString, options) {
        if (options)
            this._options = options;

        //validate input string
        this._validateInput(inputString);
        this._input = inputString;
    },


    //private methods
    _validateInput: function(input) {
        var matches = this._pattern.exec(input);
        //match group 5 captures the zip code
        if (!matches || !matches[5]) {
            throw ogrid.error('Quick Search Error', 'No zip code specified or search parameter is invalid. Syntax: weather &lt;5-digit zipcode&gt;.');
        }
    },

    _processWeatherData: function(data) {
        //reference global map object here
        var center = ogrid.App.map().getMapCenter();

        //auto-open if weather data has only one element
        for (var i=0; i < data.features.length; i++) {
            //force the latlng to be center of the map
            if (data.features.length === 1) {
                data.features[i].autoPopup = true;
            }
            data.features[i].geometry['coordinates'] = [center.lng, center.lat];
        }
    },


    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },


    exec: function(onSuccess, onError) {
        var me=this;

        if (!ogrid.Config.quickSearch.mock) {
            $.ajax({
                //should really be datasets/twitter/query/filter...
                url: ogrid.Config.service.endpoint + '/datasets/weather/query',
                type: 'GET',
                async: true,
                contentType: 'application/json',
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
                    me._processWeatherData(data);
                    onSuccess(data);
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
                        ogrid.Alert.error( "Page not found" );
                    }
                }
            });
        } else {
            this._processWeatherData(ogrid.Mock.data.weather);
            onSuccess(ogrid.Mock.data.weather);
        }
    }


});

//supported syntax (regex)
//RegEx pattern by which the QuickSearch Prcoessor factory can recognize this
ogrid.QSearchProcessor.Weather.pattern = /^(weather|wea).*$/i;
