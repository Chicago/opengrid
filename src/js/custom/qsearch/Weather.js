/*
 * ogrid.QSearchProcessor.Weather
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.Weather = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    _input: '',

    //used by the factory to determine if we need to process a certain input
    _matchPattern: /^(weather|wea).*$/i,

    //for parsing, different from the one used by the factory class
    _parsePattern: /^(weather|wea)(\s)*((\s)+(\d{5})+)*$/i,

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        /*if (inputString) {
            //validate input string
            this.validate(inputString);
            this._input = inputString;
        }*/
    },


    //private methods


    /*validate: function(input) {
        var matches = this._pattern.exec(input);
        //match group 5 captures the zip code
        if (!matches || !matches[5]) {
            throw ogrid.error('Quick Search Error', 'No zip code specified or search parameter is invalid. Syntax: weather &lt;5-digit zipcode&gt;.');
        }
    },*/

    _processWeatherData: function(data) {
        //reference global map object here
        var center = [0,0];
        if (!$.isEmptyObject(ogrid.App)) {
            center = ogrid.App.map().getMapCenter();
        }

        //auto-open if weather data has only one element
        for (var i=0; i < data.features.length; i++) {
            //force the latlng to be center of the map
            //if (data.features.length === 1) {
                data.features[i].autoPopup = true;
            //}
            data.features[i].geometry.coordinates = [center.lng, center.lat];

            //override rendition with marker for Quick Search instead of circle (default)
            data.meta.view.options.rendition = { "icon":"marker" };
        }
    },

    _getParams: function(input) {
        var matches = this._parsePattern.exec(input);

        if (!matches || !matches[5]) {
            throw ogrid.error('Quick Search Error', 'Weather quick search input is invalid. Syntax: weather &lt;zip code&gt; .');
        }
        /*return 'q=' + encodeURI('{ "zipcode": {"$eq": \'' + matches[5] + '\'} }')
            + '&n=1' //max of 1 record for current weather condition
            + '&s=' + encodeURI('{ "date": -1 }'); //sort by date descending; assume that's the most current weather record)
            */
        return { "zipcode": {"$eq": matches[5] } };
    },


    //public methods
    test: function(input) {
        return this._matchPattern.test(input);
    },

    validate: function(input) {
        return this._parsePattern.test(input);
    },

    exec: function(input, onSuccess, onError) {
        //ogrid.Search.exec('weather', this._getParams(), {}, onSuccess, onError);
        ogrid.Search.exec( {
            dataSetId: 'weather',
            maxResults: 1,
            filter: this._getParams(input),
            rendition: { "icon":"marker" },
            success: $.proxy(function(data) {
                this._processWeatherData(data);
                onSuccess(data);
            }, this),
            error: onError
        }, {origin: 'qsearchWeather'});
    },

    execOld: function(onSuccess, onError) {
        var me=this;
        var q = this._getParams();

        if (!ogrid.Config.quickSearch.mock) {
            $.ajax({
                //return just 1 max record (most current weather record)
                url: ogrid.Config.service.endpoint + '/datasets/weather/query?' + q,
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

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.weather = function (options) {
    return new ogrid.QSearchProcessor.Weather(options);
};