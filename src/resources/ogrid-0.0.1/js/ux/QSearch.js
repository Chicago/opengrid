/*
 * ogrid.QSearch
 *
 * Quick search UX component
 */


ogrid.QSearch = ogrid.Class.extend({
    //private attributes
    _options:{},
    _qsContainer: null,
    _input: null,
    _qsbutton: null,

    //public attributes


    //constructor
    init: function(qsdiv, qsinput, qsbutton, options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = options;
        }

        this._qsContainer = qsdiv;

        //setup event handlers on search control
        this._qsbutton = qsbutton;
        this._qsbutton.click($.proxy(this._onSearch, this));

        this._input = qsinput;
        var me = this;

        this._input.keypress(function (e) {
            if (e.which == 13) {
                me._onSearch();
                return false;
            }
        });

        //subscribe to applicable opengrid client events
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));

    },



    //private methods
    _onClear: function (evtData) {
        this._input.val('');
        try {
            this._input.focus();
        } catch (e) {
            console.log(e.message);
        }
    },

    _onSearch: function() {
        console.log("Quick Search clicked");

        this._execSearch(this._input.val());
    },

    _execSearch: function ( searchInput ) {
        console.log('Quick search entered:' + searchInput);

        try {
            //parse and exec async
            ogrid.QSearchFactory.parse(searchInput).exec(this._onExecDone, this._onExecError);
        } catch (e) {
            //ogrid.Alert.modal('OpenGrid Error', e.message);
            ogrid.Alert.error(e.message);
        }
    },

    _onExecDone: function (results) {
        ogrid.Event.raise(ogrid.Event.types.REFRESH_DATA, results);
    },

    _onExecError: function (e) {
        //ogrid.events.raise(ogrid.events.O.REFRESH_DATA, results);
    }



    //public methods

});