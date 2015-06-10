/*
 * ogrid.QSearchProcessor
 *
 * Base class for Quick Search processor classes
 */

ogrid.QSearchProcessor = ogrid.Class.extend({
    //private attributes
    _options:{},
    _pattern: '',
    _input: '',
    _onSuccess: null,
    _onError: null,

    //public attributes


    //constructor
    init: function(inputString, options) {
        if (options)
            ogrid.mixin(this._options);
        _input = inputString;
    },


    //private methods


    //public methods

    //returns RegEx pattern for supported command
    getPattern: function() {
        return _pattern;
    },

    //returns RegEx pattern for supported command
    exec: function(onSuccess, onError) {

    }
});