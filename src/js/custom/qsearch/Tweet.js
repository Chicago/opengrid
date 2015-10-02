/*
 * ogrid.QSearchProcessor.Twitter
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.Tweet = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //used by the factory to determine if we need to process a certain input
    _matchPattern: /^(tweet|twe).*$/i,

    //for parsing, different from the one used by the factory class
    _parsePattern: /^(tweet|twe)(\s)*((\s)+((\w+)|(\"(.*)\")))*$/i,

    _input: '',

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods
    _processData: function(data) {
        if (data.features.length >= 1) {
            //auto-pop up first element
            //data.features[0].autoPopup = true;
        }
    },

    _getParams: function(input) {
        var matches = this._parsePattern.exec(input);

        if (!matches) {
            throw ogrid.error('Quick Search Error', 'Twitter quick search input is invalid. Syntax: tweet &lt;keyword&gt; or &quot;key phrase&quot;.');
        }
        //match group 5 captures bare keyword
        //match group 8 captures quoted phrase
        var n = 'n=' + ogrid.Config.service.maxresults;

        if (!matches[5] && !matches[8]) {
            //no match will return most recent
            //for now, we are returning all with no filter
            //throw ogrid.error('Quick Search Error', 'Twitter quick search parameter is invalid. Syntax: tweet &lt;keyword&gt; or &quot;key phrase&quot;.');
            return {};
        } else {
            //return 'q=' + encodeURI('{"text" : {$regex : ".*' + (matches[8] ? matches[8] : matches[5]) + '.*"}}') + '&' + n;
            return {"text" : {$regex : '.*' + (matches[8] ? matches[8] : matches[5]) + '.*'}};
        }
        //{"text" : {$regex : ".*son.*"}}

    },

    //public methods
    test: function(input) {
        return this._matchPattern.test(input);
    },

    validate: function(input) {
        return this._parsePattern.test(input);
    },


    exec: function(input, onSuccess, onError) {
        ogrid.Search.exec( {
            dataSetId: 'twitter',
            filter: this._getParams(input),
            success: onSuccess,
            error: onError
        }, {origin: 'qsearchTweet'});

    },

    execOld: function(onSuccess, onError) {
        //call opengrid service
        var me = this;
        var q = this._getParams();

        if (!ogrid.Config.quickSearch.mock) {
            $.ajax({
                url: ogrid.Config.service.endpoint + '/datasets/twitter/query?' + q,
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
                    me._processData(data);
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
            onSuccess(ogrid.Mock.data.tweet);
        }
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.tweet = function (options) {
    return new ogrid.QSearchProcessor.Tweet(options);
};
