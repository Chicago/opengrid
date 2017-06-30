/*
 * ogrid.QSearch
 *
 * Quick search UX component
 */

/*jshint  expr: true */

ogrid.QSearch = ogrid.Class.extend({
    //private attributes
    _options:{
        datasets: null
    },
    _qsContainer: null,
    _input: null,
    _qsbutton: null,
    _geoFilter: null,

    //public attributes


    //constructor
    init: function(qsdiv, qsinput, qsbutton, options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = $.extend(this._options, options);
        }

        this._qsContainer = qsdiv;

        //setup event handlers on search control
        this._qsbutton = qsbutton;
        this._qsbutton.click($.proxy(this._onSearch, this));

       this._initPopup();

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


    _initPopup: function(done) {
        var me = this;
        $.get(ogrid.Config.quickSearch.helpFile, function(data) {
            var $t = $('<div/>').html(data).contents();
            //var $t = $($.parseHTML(data));

            //builds html from new dataset quicksearch settings
            var hintHtml = '';
            if (me._options.datasets) {
                var hints = [];
                $.each(me._options.datasets, function(i, v) {
                    if (v.quickSearch && v.quickSearch.enable) {
                        v.quickSearch.hintCaption && (hintHtml += '<p><b>' + v.quickSearch.hintCaption + '</b><br>');
                        v.quickSearch.hintExample && (hintHtml += v.quickSearch.hintExample);
                        v.quickSearch.hintCaption && (hintHtml += '</p>');
                        v.quickSearch.hintDescription && (hintHtml += '<p><i>' + v.quickSearch.hintDescription + '</i><p>');
                    }
                });
            }
            $t.find('#ogrid-quicksearchhelp').append(hintHtml);
            var $o = $("[data-toggle=popover]").popover({
                html: true,
                content: $t.parent().html(),
                container: 'body'
                //title: 'Quick Search Help <a href="#" class="close" data-dismiss="alert">X</a>'
            });
        });
    },

    //private methods
    _findQSearchFlexDataPlugin: function() {
        var o = null;
        $.each(ogrid.Config.quickSearch.plugins, function(i,v) {
            if (v instanceof ogrid.QSearchProcessor.FlexData) {
                o = v;
                return false; //break
            }
        });
        return o;
    },


    _onLoggedIn: function(e) {
        //set initial focus to Quick Search input
        var me = this;
        try {
            this._input.prop('disabled', true);
            //set datasets option of FlexData quick search processor after login
            var o = this._findQSearchFlexDataPlugin();
            if (o) {
                //var dsCall = $.ajax(ogrid.Config.service.endpoint + '/datasets');
                //dsCall.then(function (dataTypes) {
                    o.setOptions({datasets: this._options.datasets});
                    me._input.prop('disabled', false);

                    //avoid annoying keyboard popup when on mobile mode
                    if (!ogrid.App.mobileView()) me._input.focus();
                //});
            }
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

        _onSearch: function(done) {
        // If main content is hidden remove it and disable help.
        if($("#ogrid-content").hasClass('hide')) {
            $("#ogrid-help").addClass('hide');
            $("#ogrid-content").removeClass('hide');
        }

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
            ogrid.QSearchFactory.parse(searchInput).exec(searchInput, this._onExecDone.bind(this), this._onExecError);
        } catch (e) {
            //ogrid.Alert.modal('OpenGrid Error', e.message);
            ogrid.Alert.error(e.message);
        }
    },

    _getGeoFilterWidget: function() {
        var fakeContainer = $();
        var o =  ogrid.geoFilter(fakeContainer, {
                bounds: ogrid.Config.advancedSearch.geoFilterBoundaries,

                //no additional near refs aside from _map-click
                nearReferences: null,

                //pass the true map object
                map: ogrid.App.map().getMap(),
                geoLocationControl: ogrid.App.map().getGeoLocationControl()
            }
        );
        //this makes it map-extent by default
        o.reset();
        return o;
    },

    _isGeoFilterableData: function(data) {
        //we are using this indicator for data to be geo-Filter in quick search; might change in the future
        return (data.meta.view.options.rendition.icon !== "marker");
    },

    _onExecDone: function (results) {
        var autoRequery = this._isGeoFilterableData(results);
        //if geoSpatial filtering is not supported by service, implement filtering locally
        if ( !ogrid.App.serviceCapabilities().geoSpatialFiltering && this._isGeoFilterableData(results)) {
            if ( !this._geoFilter ) {
                this._geoFilter = this._getGeoFilterWidget();
            }
            //apply additional geo-spatial filter, within map extent
            results = this._geoFilter.filterData(results);
        }

        //fix fillColor of points to make it consistent with Advanced Search
        if (this._isGeoFilterableData(results)) {
            var c = results.meta.view.options.rendition.color;
            results.meta.view.options.rendition.fillColor =  (chroma.scale(['white', c])(0.5)).hex();
        }

        //we're no longer sending clear flag after a quick search is executed
        //"no clear" disabled temporarily as of 08/19

        ogrid.Event.raise(ogrid.Event.types.REFRESH_DATA, {
            resultSetId:ogrid.guid(),
            data: results,
            options: {
                clear: true,

                //added support for refresh on map extent change
                passthroughData: {regenerator: {handler:this} }
            }
        } );
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
    },


    //public methods
    //call back for map extent change, invoked by map component
    regenerate: function(done) {
        console.log("Quick search - regenerate called");
        //re-invoke submit, passing along done callback
        this._onSearch(done);
    }

});