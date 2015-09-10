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
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._input = inputString;
    },


    //private methods


    //public methods
    test: function(input) {

    },

    validate: function(input) {

    },


    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },

    //executes quick search
    exec: function(input, onSuccess, onError) {
    }

});