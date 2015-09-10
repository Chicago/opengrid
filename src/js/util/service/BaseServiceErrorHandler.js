/*
 * ogrid.BaseErrorHandler
 *
 * Base class for error response handler
 */


ogrid.BaseServiceErrorHandler = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods


    //public methods

    //there can be various implementations of this depending on the service error schema
    getError: function(responseBody) {

    },

    //re-packages raw data into the error object to be passed to the error callback
    callErrorCallback: function (err, errcb, jqXHR, txtStatus, errorThrown, passThroughData) {
        if (errcb) {
            //our error detail, raw response from jQuer ajax call and passthrough data
            errcb(err, {jqXHR: jqXHR, txtStatus: txtStatus, errorThrown: errorThrown}, passThroughData);
        }
    },

    makeError: function(code, message) {
        return {code: code, message: message};
    },

    makeSystemError: function(message) {
        //some arbitrary code to indicate system error (for now corresponds to the same system error code as our template service)
        return {code: '0101', message: message};
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.baseServiceErrorHandler  = function (options) {
    return new ogrid.BaseServiceErrorHandler (options);
};