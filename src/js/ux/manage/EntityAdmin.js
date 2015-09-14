/*
 * ogrid.EntityAdmin
 *
 * Base class for admin UIs
 */

ogrid.EntityAdmin = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods
    _commonErrorHandler: function (opName, err, rawErrorData, passThroughData) {
        //no use for pass through data right now (more used on success case)
        if (err && !$.isEmptyObject(err)) {
            ogrid.Alert.error(err.message + '(' + 'Code: ' + err.code + ')');
            //console.log(err.message + '(' + 'Code: ' + err.code + ')');
        } else {
            if (rawErrorData.txtStatus === 'timeout') {
                ogrid.Alert.error(opName + ' has timed out.');
                //console.log(opName + ' has timed out.');
            } else {
                ogrid.Alert.error( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
                //console.log( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
            }
        }
    }

    //public methods

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.entityAdmin = function (options) {
    return new ogrid.EntityAdmin(options);
};