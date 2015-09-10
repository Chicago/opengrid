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

        //hint icon
        $.get(ogrid.Config.quickSearch.helpFile, function(data) {
            $("[data-toggle=popover]").popover({
                html: true,
                content: data
                }
            );
        });

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
        ogrid.Event.on(ogrid.Event.types.LOGGED_IN, $.proxy(this._onLoggedIn, this));

    },



    //private methods
    _onLoggedIn: function(e) {
        //set initial focus to Quick Search input
        try {
            //avoid annoying keyboard popup when on mobile mode
            if (!ogrid.App.mobileView()) this._input.focus();
        } catch (ex) {
            console.log(ex.message);
        }
    },

    _onClear: function (evtData) {
        this._input.val('');
        try {
            //avoid annoying keyboard popup when on mobile mode
            if (!ogrid.App.mobileView()) this._input.focus();
        } catch (e) {
            console.log(e.message);
        }
    },

    _onSearch: function() {
        //console.log("Quick Search clicked");
        if (this._input.val().trim().length === 0 ) {
            ogrid.Alert.error('No quick search command was entered.');
        } else {
            this._execSearch(this._input.val());
        }
    },

    _execSearch: function ( searchInput ) {
        //console.log('Quick search entered:' + searchInput);

        try {
            //parse and exec async
            ogrid.QSearchFactory.parse(searchInput).exec(searchInput, this._onExecDone, this._onExecError);
        } catch (e) {
            //ogrid.Alert.modal('OpenGrid Error', e.message);
            ogrid.Alert.error(e.message);
        }
    },

    _onExecDone: function (results) {
        ogrid.Event.raise(ogrid.Event.types.REFRESH_DATA, {resultSetId:ogrid.guid(), data: results, options: {clear:true}} );
    },

    _onExecError: function (err, rawErrorData, passThroughData) {
        //err, {jqXHR: jqXHR, txtStatus: txtStatus, errorThrown: errorThrown}, passThroughData
        //ogrid.events.raise(ogrid.events.O.REFRESH_DATA, results);
        //default error handling
        if (rawErrorData.txtStatus === 'timeout') {
            ogrid.Alert.error('Quick search has timed out.');
        } else {
            ogrid.Alert.error( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
        }
    }



    //public methods

});