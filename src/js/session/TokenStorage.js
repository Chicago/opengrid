/*
 * ogrid.TokenStorage
 *
 * Class for storing security tokens
 */


ogrid.TokenStorage = ogrid.Class.extend({
    //private attributes
    _options:{},
    _STORAGE_KEY: 'auth_token',

   //public attributes

    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods

    //public methods
    store : function(token) {
        return sessionStorage.setItem(this._STORAGE_KEY, token);
    },

    retrieve : function() {
        return sessionStorage.getItem(this._STORAGE_KEY);
    },

    clear : function() {
        return sessionStorage.removeItem(this._STORAGE_KEY);
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.tokenStorage = function (options) {
    return new ogrid.TokenStorage(options);
};