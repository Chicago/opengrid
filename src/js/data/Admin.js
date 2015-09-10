/*
 * ogrid.Admin
 *
 * Admin model class that talks to the admin service
 */

ogrid.Admin = ogrid.Class.extend({
    //private attributes
    _options:{},
    _objectType: null,

    //public attributes


    //constructor
    init: function(objectType, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._objectType = objectType;
    },


    //private methods
    _getFilter: function(filter) {
        if (filter)
            return 'q=' + encodeURI(JSON.stringify(filter));
        else
            return '';
    },

    _onAjaxSuccess: function (opName, data, options, jqXHR, txtStatus, passThroughData) {
        //for service implementations that don't return an error status (i.e. ( status >= 200 && status < 300 || status === 304 ))
        // even for error conditions, we need to extract error details using error handlers
        var err = ogrid.Config.service.errorHandler.getError(data);
        if (err) {
            //redirect to the error function
            this._onAjaxError(opName, err, options, passThroughData, jqXHR, txtStatus);
        } else {
            if (options.success) {
                options.success(data, passThroughData);
            }
        }
    },

    _onAjaxError: function (opName, err, options, passThroughData, jqXHR, txtStatus, errorThrown) {
        if (options.error) {
            //let caller handle/display error message, if a callback was passed
            ogrid.Config.service.errorHandler.callErrorCallback(err, options.error, jqXHR, txtStatus, errorThrown, passThroughData);
        } else {
            //default error handling
            if (txtStatus === 'timeout') {
                ogrid.Alert.error(opName + ' has timed out.');
            } else {
                ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
            }
        }
    },

    //public methods
    listItems: function(options) {
        var me = this;

        var q = this._getFilter(options.filter);
        $.ajax({
            url: ogrid.Config.service.endpoint + '/' + this._objectType + '?' + q
                + '&n=' + (!ogrid.isNull(options.maxResults) ?  options.maxResults : ogrid.Config.service.maxresults),
            type: 'GET',
            timeout: ogrid.Config.service.timeout,
            success: function(data, txtStatus, jqXHR) {
                me._onAjaxSuccess('Group listing', data, options, jqXHR, txtStatus);
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                me._onAjaxError('Group listing', {}, options, null, jqXHR, txtStatus, errorThrown);
            },
            statusCode: {
                404: function() {
                    ogrid.Alert.error("The admin service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    },


    deleteItem: function(id, options) {
        var me = this;

        $.ajax({
            url: ogrid.Config.service.endpoint + '/' + this._objectType + '/' + encodeURI(JSON.stringify(id)),
            type: 'DELETE',
            contentType: 'application/json',
            timeout: ogrid.Config.service.timeout,
            processData: false, //make sure our payload does not get encoded
            success: function(data, txtStatus, jqXHR) {
                me._onAjaxSuccess('Group delete', data, options, jqXHR, txtStatus);
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                me._onAjaxError('Group delete', {}, options, null, jqXHR, txtStatus, errorThrown);
            },
            statusCode: {
                404: function() {
                    ogrid.Alert.error("The admin service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    },

    //used for both add and update
    updateItem: function(id, o, options) {
        var me = this;

        $.ajax({
            url: ogrid.Config.service.endpoint + '/' + this._objectType + ( id ? '/' + encodeURI(JSON.stringify(id)) : ''),
            type: (id ? 'PUT': 'POST'),
            contentType: 'application/json',
            timeout: ogrid.Config.service.timeout,
            processData: false, //make sure our payload does not get encoded
            data: JSON.stringify( {id: id, o: o}),
            success: function(data, txtStatus, jqXHR) {
                me._onAjaxSuccess('Group save', data, options, jqXHR, txtStatus);
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                me._onAjaxError('Group save', {}, options, null, jqXHR, txtStatus, errorThrown);
            },
            statusCode: {
                404: function() {
                    ogrid.Alert.error("The admin service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.admin = function (objectType, options) {
    return new ogrid.Admin(objectType, options);
};