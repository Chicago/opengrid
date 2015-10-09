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
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },




    //private methods


    //public methods

    //merge options with current
    setOptions: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

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