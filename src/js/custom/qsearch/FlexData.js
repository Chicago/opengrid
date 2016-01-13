/*
 * ogrid.QSearchProcessor.FlexData
 *
 * Extension class to support any non-LatLong/Place quick searches
 */

ogrid.QSearchProcessor.FlexData = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{
        datasets: []
    },

    //used by the factory to determine if we need to process a certain input
    //we'll need to build this on the fly
    _matchPattern: null,

    //for parsing, different from the one used by the factory class
    //we may not have to use this
    _parsePattern: null,

    _input: '',
    _flexBuilder: ogrid.flexSearchBuilder(),

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods
    _processData: function(data) {
        if (data.features.length >= 1) {
            //auto-pop up first element
            //data.features[0].autoPopup = true;
        }
    },

    _getParams: function(input) {
        //this is where we need the FlexQueryBuilder
    },

    //determine dataset based on trigger word or alias
    _getDatasetByTrigger: function(trigger) {
        var ds = null;
        $.each(this._options.datasets, function(i, v) {
            if (v.quickSearch && v.quickSearch.enable) {
                if (v.quickSearch.triggerWord === trigger || v.quickSearch.triggerAlias === trigger) {
                    ds = v;
                    return false; //break
                }
            }
        });
        if (ds === null) {
            throw new ogrid.error('Quick Search', "No matching dataset can be found for trigger '" + trigger + "'");
        }
        return ds;
    },

    _getDatasetByDatasetId: function(dsId) {
        var ds = null;
        $.each(this._options.datasets, function(i, v) {
            if (v.quickSearch && v.quickSearch.enable) {
                if (v.id === dsId) {
                    ds = v;
                    return false; //break
                }
            }
        });
        if (ds === null) {
            throw new ogrid.error('Quick Search', "No matching dataset can be found for id '" + dsId + "'");
        }
        return ds;
    },

    _resolveColumnAliases: function(ds, params) {
        var me = this;

        //replace keys with real field names if shortcut names were used
        //assumption no other fields with the same names are in the DB collection (e.g. what.x1, where.x1)
        $.each(params, function(i, v) {

            if (v.key !== null) {
                //key-value pairs only
                var found = false;

                if (me._flexBuilder.isSystemColumn(v.key)) {
                    found = true;
                } else {
                    //look up from dataset columns
                    $.each(ds.columns, function(j, w) {
                        if (w.quickSearch) {
                            //only for columns available for quicksearch filtering
                            if (v.key === w.id) {
                                found = true;
                                //do nothing, break
                                return false;
                            } else {
                                //match by qualified column name
                                var a = w.id.split('.');
                                if (a[a.length -1] === v.key) {
                                    v.key = w.id;
                                    found = true;
                                    return false;
                                } else {
                                    //do nothing, continue
                                }
                            }
                        }
                    });
                }
                if (!found)
                    throw new ogrid.error('Quick Search', "Invalid column id '" + v.key  + "'");
            }
        });
    },


    _getQuickSearchColumns:function(ds) {
        return $.map(ds.columns, function(v,i){
            if (v.quickSearch) {
                return v.id;
            }
        });
    },

    //public methods
    test: function(input) {
        //dynamically determine pattern based on available datasets
        var triggers = [];

        $.each(this._options.datasets, function(i, v) {
            //only those available for quickSearch
            if (v.quickSearch && v.quickSearch.enable) {
                triggers.push(v.quickSearch.triggerWord);
                if (v.quickSearch.triggerAlias) {
                    //add alias as a valid trigger word too
                    triggers.push(v.quickSearch.triggerAlias);
                }
            }
        });
        return this._flexBuilder.matchesInput(input, triggers);
    },

    validate: function(input) {
        //return this._parsePattern.test(input);
        //we can implement this later, exec validates the input anyway
        return false;
    },


    exec: function(input, onSuccess, onError) {
        var ds = null;
        try {
            //pass true to parse only main tokens to get the trigger
            this._flexBuilder.parse(input, true);
            ds = this._getDatasetByTrigger(this._flexBuilder.getTrigger());

            var params = this._flexBuilder.getParams();
            this._resolveColumnAliases(ds, params);

            //var filter = this._flexBuilder.getFilterFromParams(params, this._getQuickSearchColumns(ds), ds.quickSearch.baseClientFilter);
            /*if ($.isEmptyObject(filter)) {
                //use base client filter for this ds, if any
                if (ds.quickSearch.baseClientFilter) {
                    filter = this._flexBuilder.expandBaseFilter(ds.quickSearch.baseClientFilter);
                }
            }*/

            var request = {
                dataSetId: ds.id,
                filter: this._flexBuilder.getFilterFromParams(params, this._getQuickSearchColumns(ds), ds.quickSearch.baseClientFilter),
                success: onSuccess,
                error: onError
            };

            //max if specified on input, else dstaset default max, else service default max
            request.maxResults = this._flexBuilder.getLimit() || ds.quickSearch.defaultMax ||  ogrid.Config.service.maxresults;
            request.sort = ds.quickSearch.defaultSort || null;
            ogrid.Search.exec( request, {origin: 'qsearchFlex'});

        } catch (ex) {
            if (ex.message.indexOf('invalid filter')> -1) {
                if (ds)
                    throw new ogrid.error('Quick Search', ds.displayName + ' quick search input is invalid');
                else
                    throw new ogrid.error('Quick Search', 'Quick Search input is invalid');
            } else
                throw ex;
        }
    },

    getFlexSearchBuilder: function() {
        return this._flexBuilder;
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.flexData = function (options) {
    return new ogrid.QSearchProcessor.FlexData(options);
};