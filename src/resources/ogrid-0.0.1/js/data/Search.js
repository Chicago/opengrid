/*
 * ogrid.Search
 *
 * Search utils
 */


ogrid.Search = {};

ogrid.Search._getParams = function(filter) {
    return 'q=' + encodeURI(JSON.stringify(filter));
}

ogrid.Search._preProcess = function(data, renditionOptions) {
    if (renditionOptions)
        //apply rendition options to returning json
        data.meta.view.options.rendition = $.extend(data.meta.view.options.rendition, renditionOptions);
},


/* renditionOptions override default rendition options on the response json
 */
ogrid.Search.exec = function(options) {
    //options {dataSetId, filter, renditionOptions, success, error}
    var me = this;
    var q = this._getParams(options.filter);

    $.ajax({
        url: ogrid.Config.service.endpoint + '/datasets/' + options.dataSetId + '/query?' + q
            + '&n=' + (!ogrid.isNull(options.maxResults) ?  options.maxResults : ogrid.Config.service.maxresults),
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
            me._preProcess(data, options.rendition);
            options.success(data);
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
}

ogrid.Search.save = function(options) {
    //options {query, success, error}
    var me = this;

    var payLoad = {o: options.query};

    if (options.query._id) {
        payLoad.id = options.query._id;
    }
    $.ajax({
        url: ogrid.Config.service.endpoint + '/queries',
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
        success: function(data) {
            //no response right now, to be added later
            options.success(data);
        },
        error: function(jqXHR, txtStatus, errorThrown) {
            if (txtStatus === 'timeout') {
                ogrid.Alert.error('Save has timed out.');
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
}


ogrid.Search.list = function(options) {
    var me = this;
    var q = this._getParams(options.filter);

    $.ajax({
        url: ogrid.Config.service.endpoint + '/queries/?' + q
        + '&n=' + (!ogrid.isNull(options.maxResults) ?  options.maxResults : ogrid.Config.service.maxresults),
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
            //no response right now, to be added later
            options.success(data);
        },
        error: function(jqXHR, txtStatus, errorThrown) {
            if (txtStatus === 'timeout') {
                ogrid.Alert.error('Save has timed out.');
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
}