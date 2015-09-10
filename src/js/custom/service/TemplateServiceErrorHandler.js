/*
 * ogrid.TemplateServiceErrorHandler
 *
 * Base class for error response handler
 */


ogrid.TemplateServiceErrorHandler = ogrid.BaseServiceErrorHandler .extend({
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
    //OpenGrid Template Service implementation
    getError: function(responseBody) {
        if (responseBody && responseBody.error) {
            //return error info
            //other implementations must return the same error object as part of the contract
            //{code:<errorCode>, message:<errorMessage>}
            return responseBody.error;
        }

        //no error, successful response
        return null;
    },

    makeSystemError: function(message) {
        //use the same system error code as our template service
        return this.makeError('0101', message);
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.templateServiceErrorHandler = function (options) {
    return new ogrid.TemplateServiceErrorHandler(options);
};