/*
 * ogrid.Search
 *
 * Search utils
 */


ogrid.Search = {};

ogrid.Search._getParams = function(filter) {
    return 'q=' + encodeURI(JSON.stringify(filter));
};

ogrid.Search._getOpts = function(geoFilter) {
    if (geoFilter) {
        var f = {"geoFilter": geoFilter};
        return '&opts=' + encodeURI(JSON.stringify(f));
    } else
        return '';
};

ogrid.Search._preProcess = function(data, renditionOptions) {
    if (renditionOptions)
        //apply rendition options to returning json
        data.meta.view.options.rendition = $.extend(data.meta.view.options.rendition, renditionOptions);

    //timestamp data
    data.lastRefreshed = ogrid.now();
};

ogrid.Search._onAjaxSuccess = function (opName, data, options, jqXHR, txtStatus, passThroughData) {
    //for service implementations that don't return an error status (i.e. ( status >= 200 && status < 300 || status === 304 ))
    // even for error conditions, we need to extract error details using error handlers
    var err = ogrid.Config.service.errorHandler.getError(data);
    if (err) {
        //redirect to the error function
        this._onAjaxError(opName, err, options, passThroughData, jqXHR, txtStatus);
    } else {
        if (options.success) {
            if (options.rendition) {
                //data is array of geojson objects
                this._preProcess(data, options.rendition);
            }
            options.success(data, passThroughData);
        }
    }
};

ogrid.Search._onAjaxError = function (opName, err, options, passThroughData, jqXHR, txtStatus, errorThrown) {
    if (options.error) {
        //let caller handle/display error message, if a callback was passed
        ogrid.Config.service.errorHandler.callErrorCallback(err, options.error, jqXHR, txtStatus, errorThrown, passThroughData);
    } else {
        //default error handling
        if (txtStatus === 'timeout') {
            ogrid.Alert.error(opName + ' has timed out.');
        } else if (txtStatus !== 'error') {
            ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
        }
    }
};


/* renditionOptions override default rendition options on the response json
 */
ogrid.Search.exec = function(options, passThroughData) {
    //options {dataSetId, filter, geoFilter, renditionOptions, success, error}
    //passThroughData is additional info from the caller that is passed to success and error callbacks
    var me = this;
    var q = this._getParams(options.filter);
    var opts = this._getOpts(options.geoFilter);

    var url = ogrid.Config.service.endpoint + '/datasets/' + options.dataSetId + '/query?' + q  +
        '&n=' + (!ogrid.isNull(options.maxResults) ?  options.maxResults : ogrid.Config.service.maxresults)  + opts;
    if (!ogrid.isNull(options.sort)) {
        url +='&s=' + encodeURI(options.sort);
    }
    $.ajax({
        url:  url,
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
        success: function(data, txtStatus, jqXHR) {
            me._onAjaxSuccess('Search', data, options, jqXHR, txtStatus, passThroughData);
        },

        error: function(jqXHR, txtStatus, errorThrown) {
            me._onAjaxError('Search', {}, options, passThroughData, jqXHR, txtStatus, errorThrown);
        },

        statusCode: {
            //placeholder
            404: function() {
                ogrid.Alert.error("The search service cannot be reached at this time. Make sure an internet connection is available then try again.");
            }
        }
    });
};

ogrid.Search.save = function(options) {
    //options {query, success, error}
    var me = this;

    var payLoad = {o: options.query};

    if (options.query._id) {
        payLoad.id = options.query._id;
    }
    $.ajax({
        url: ogrid.Config.service.endpoint + '/queries' + (payLoad.id ? '/' + JSON.stringify(payLoad.id) : '' ),
        type: (options.query._id ? 'PUT': 'POST'),
        async: true,
        contentType: 'application/json',
        timeout: ogrid.Config.service.timeout,
        processData: false, //make sure our payload does not get encoded
        data: JSON.stringify(payLoad),
        xhrFields: {
            withCredentials: false
        },
        headers: {
            // Set any custom headers here.
            // If you set any non-simple headers, your server must include these
            // headers in the 'Access-Control-Allow-Headers' response header.
        },
        success: function(data, txtStatus, jqXHR) {
            //no passthrough data
            me._onAjaxSuccess('Query save', data, options, jqXHR, txtStatus);
        },
        error: function(jqXHR, txtStatus, errorThrown) {
            me._onAjaxError('Query save', {}, options, null, jqXHR, txtStatus, errorThrown);
        },
        statusCode: {
            //placeholder
            404: function() {
                ogrid.Alert.error("The query service cannot be reached at this time. Make sure an internet connection is available then try again.");
            }
        }
    });
};


ogrid.Search.list = function(options) {
    var me = this;
    var q = this._getParams(options.filter);

    $.ajax({
        url: ogrid.Config.service.endpoint + '/queries/?' + q +
            '&n=' + (!ogrid.isNull(options.maxResults) ?  options.maxResults : ogrid.Config.service.maxresults),
        type: 'GET',
        async: true,
        contentType: 'application/json',
        timeout: ogrid.Config.service.timeout,
        success: function(data, txtStatus, jqXHR) {
            //no passthrough data
            me._onAjaxSuccess('Query listing', data, options, jqXHR, txtStatus);
        },
        error: function(jqXHR, txtStatus, errorThrown) {
            me._onAjaxError('Query listing', {}, options, null, jqXHR, txtStatus, errorThrown);
        },
        statusCode: {
            //placeholder
            404: function() {
                ogrid.Alert.error("The search service cannot be reached at this time. Make sure an internet connection is available then try again.");
            }
        }
    });
};
