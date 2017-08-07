/*
 * ogrid.AdvancedSearch
 *
 * <description of class>
 */

/*jshint  expr: true */

ogrid.AdvancedSearch = ogrid.Class.extend({
    //private attributes
    _options:{
        defaultPointColor: '#DC143C',
        allDataTypes: null,
        datasets: null
    },

    _geoFilter: null,
    _pendingQueries: 0,
    _queryScheduler: null,

    //holds copy of loaded query
    _activeQuery: null,

    _queryAdmin: null,


    _isLoadingQuery: false,
    _isLoggedIn: false,
    _geoFilterInitDeferred: $.Deferred(),

    //cache for lookup values
    _lookup: {

    },

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = $.extend(this._options, options);
        }

        //init UI elements
        this._initEventHandlers();

        this._setupWindowResizeHandler();

        //manually trigger resize handler to refresh layout
        this._onWindowResize();

        //init geofilter panel
        this._geoFilter = ogrid.geoFilter($('#geo-filter'), {
                bounds: ogrid.Config.advancedSearch.geoFilterBoundaries,

                //no additional near refs aside from _map-click
                nearReferences: null,

                //pass the true map object
                map: options.map.getMap(),
                geoLocationControl: options.map.getGeoLocationControl()
            }
        );

        this._queryScheduler = new ogrid.QueryScheduler();

        this._queryAdmin = new ogrid.QueryAdmin(
            $('#ogrid-admin-queries'),
            ogrid.App.getSession().getCurrentUser(), {
                onOpen: $.proxy(this._onManageQueryOpenSetUrl(false, this), this),
                onPlay: $.proxy(this._onManageQueryOpenSetUrl(true, this), this),
                postDelete: $.proxy(this._postManageQueryDelete, this)
            }
        );
    },


    //private methods
    _postManageQueryDelete: function() {
        //force refresh of queries
        this._onReset();
    },

    _postQueryOpen: function(context, query, autoexec) {
        if (autoexec) {
            context._executeSearch(query);
        } else {
            //set our active tab to Build Query
            $('#ogrid-adv-tabs a[href="#build-query"]').tab('show');

            //focus on query name for now
            //avoid annoying keyboard popup when on mobile mode
            if (!ogrid.App.mobileView()) $('#saveQueryAs').focus();
        }
    },

    //set map center and zoom level, then wait
    //we need to wait here until the view has been set to our desired center and zoom level
    _setMapViewWithWait: function(me, loc) {
        //disable map change event handler
        me._options.map.enableMapViewChangeHandler(false);

         //move our map first
         var a = loc.split(',');
         me._options.map.setMapView(
             L.latLng(a[0], a[1]), //lat,long
             a[2] //zoom
         );

         //wait for a max of 5 secs
        return ogrid.waitForCondition(5000, function(deferred) {
            var c = me._options.map.getMapCenter();
            if (c.lng == a[1] && c.lat == a[0] && me._options.map.getMapZoom() == a[2]) {
                me._options.map.enableMapViewChangeHandler(true);

                //we're done waiting, signal calling thread
                deferred.resolve('done');
            }
        });
     },

    _openQuery: function(context, query, loc, autoexec) {
        context._loadQuery(query);
        //if shared query and we're not the owner, create a 'copy' of the query
        if (context._sharedNotOwned(query)) {
            context._activeQuery = null;
        }
        if (loc) {
            //map extent (map center) was passed
            $.when( context._setMapViewWithWait(context, loc) ).done(function ( result ) {
                //now we're ready to submit our query
                context._postQueryOpen(context, query, autoexec);
            });
        } else {
            context._postQueryOpen(context, query, autoexec);
        }
    },

    _onManageQueryOpenSetUrl: function(autoexec, context) {
        return function(query) {
            context._updateHashWithQuery(query, autoexec);
        };
    },


    _onManageQueryOpen: function(autoexec, context) {
        //query-> query def, optional loc->map center and zoom
        return function(query, loc) {
            //this can be called while the page is still loading
            if (!context._isLoggedIn) {
                ogrid.Event.on(ogrid.Event.types.ADVANCED_INIT_DONE, function() {
                    context._openQuery(context, query, loc, autoexec);

                    if (autoexec) {
                        //after 1 second get rid of focus on "Find Data" due to timing issue
                        setTimeout(context._hideMe, 1000);
                    }
                });
            } else {
                context._openQuery(context, query, loc, autoexec);
            }
        };
    },

    _sharedNotOwned: function(query) {
        return (query.sharedWith &&
            (query.sharedWith.groups || query.sharedWith.users) &&
            (query.owner !== ogrid.App.getSession().getCurrentUser().getProfile().loginId) );
    },

    _commonNotOwned: function(query) {
        return (query.isCommon &&
        (query.owner != ogrid.App.getSession().getCurrentUser().getProfile().loginId) );
    },



    _setupWindowResizeHandler: function() {
        $(window).resize(this._onWindowResize);
    },

    _onWindowResize: function() {
        //dynamically set scrollbar visibility condition
        $('#build-query').css('height', $(window).height()- 145);
    },


    _populateExistingQueries: function() {

        this._populateCommonQueries();
        this._populateRecentlySavedQueries();
    },


    _populateCommonQueries: function() {
        //clear all options except for blank item
        //$('#commonlyUsedQueries option[value!=""]').remove();

        ogrid.Search.list({
            filter: {isCommon: true},
            success: $.proxy(this._onPopSuccess('#commonlyUsedQueries'), this),
            error: $.proxy(this._onPopError, this)
        });
    },


    _populateRecentlySavedQueries: function() {
        //clear all options except for blank item
        //$('#lastSavedQueries option[value!=""]').remove();

        ogrid.Search.list({
            filter: {isCommon: false, owner: ogrid.App.getSession().getCurrentUser().getProfile().loginId},
            maxResults: 10,
            success: $.proxy(this._onPopSuccess('#lastSavedQueries'), this),
            error: $.proxy(this._onPopError, this)
        });
    },


    _onPopSuccess: function(selectId) {
        //$('#queryOptionTemplate').tmpl(data).appendTo('#commonlyUsed');
        //use closure to our advantage to make this a generic callback
        return function(data) {
            //clear dropdown first
            $(selectId + ' option[value!=""]').remove();

            //getting [object object] with spec data, need to massage data
            var d = [];
            $.each(data, function(i, v) {
                //query definition gets loaded with each list item
                d.push({
                        _id: JSON.stringify(v._id),
                        spec: JSON.stringify(v.spec),
                        name: v.name,
                        owner: v.owner,
                        isCommon: v.isCommon,
                        geoFilter: JSON.stringify(v.geoFilter),
                        autoRefresh: ( v.autoRefresh ? true : false),
                        refreshInterval: (v.refreshInterval ? v.refreshInterval : 0)
                    }
                );
            });
            //note: we need to keep the data attributes in sync on the HMTL file template
            $('#queryOptionTemplate').tmpl(d).appendTo(selectId);
        };
    },


    _onPopError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Query listing', err, rawErrorData, passThroughData);
    },

    _onQueryNameKeyup: function() {
        //we need to handle common queries especially
        if ( this._activeQuery && this._activeQuery.isCommon ) {
            //enable save only when query name is different or when the current user is the owner
            if ( (this._getQueryName().trim() ===  this._activeQuery.name)  &&
                (this._commonNotOwned(this._activeQuery))
            ) {
                $('#advSearchSave').addClass('disabled');
                return;
            }
        }

        //default is to enable
        $('#advSearchSave').removeClass('disabled');
    },


    _initEventHandlers: function() {
        $('#beginDate').datetimepicker();
        $('#endDate').datetimepicker();

        $('.panel-heading span.clickable, #ogrid-adv-content .panel-heading').on("click", function (e) {
             if ($(this).hasClass('panel-collapsed')) {
                // expand the panel, excluding color options which is independently controlled
                $(this).parents('.panel').find('.panel-body').not('.ogrid-color-options-panel-body').slideDown();
                $(this).removeClass('panel-collapsed');
                $(this).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
            else {
                // collapse the panel, excluding color options which is independently controlled
                $(this).parents('.panel').find('.panel-body').not('.ogrid-color-options-panel-body').slideUp();
                $(this).addClass('panel-collapsed');
                $(this).find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }
        });


        //handler for submit button
        $('#advSearchSubmit').click($.proxy(this._onSubmit, this));

        //save button event handler
        $('#advSearchSave').click($.proxy(this._onSave, this));

        $('#advSearchReset').click($.proxy(this._onReset, this));

        //handler for submit button
        $('#lastSavedQueries').change($.proxy(this._onQueryLoad, this));

        $('#commonlyUsedQueries').change($.proxy(this._onQueryLoad, this));

        $('#autoRefreshSpinUp').click(this._getSpinEventHandler('#autoRefreshInterval', 1));
        $('#autoRefreshSpinDn').click(this._getSpinEventHandler('#autoRefreshInterval', -1));


        $('#saveQueryAs').keyup($.proxy(this._onQueryNameKeyup, this));

        if (ogrid.Config.map.zoomToResultsExtent)
            ogrid.Event.on(ogrid.Event.types.MAP_RESULTS_DONE, $.proxy(this._onMapResultsDone, this));

        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));
        ogrid.Event.on(ogrid.Event.types.LOGGED_IN, $.proxy(this._onLoggedIn, this));
        ogrid.Event.on(ogrid.Event.types.MAP_EXTENT_CHANGED, $.proxy(this._onMapExtentChanged, this));
    },


    _onMapExtentChanged: function() {
        if (this._isMapExtentSelected()) {
            //re-invoke submit
            //TODO re-submit only when query has been run at least once
            this._onSubmit();
        }
    },

    _isMapExtentSelected: function() {
        return (this._geoFilter.getBoundaryType() === 'within' &&
        this._geoFilter.getWithinBoundaryOption() === '_map-extent');
    },


	_expandPane: function(pane) {
        //exclude color options which is independently controlled
        pane.parents('.panel').find('.panel-body').not('.ogrid-color-options-panel-body').slideDown();
        pane.removeClass('panel-collapsed');
        pane.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    },

    _onLoggedIn: function(e) {
        //refresh available queries as logged user might have changed
        this._onReset();

        $('#ogrid-dtlist').find('li').remove();
        this._options.allDataTypes = null;
        this._populateDataTypes();

        //refvresh query list
        this._queryAdmin.setUser(e.message);
        this._queryAdmin.refreshQueries();

        if (ogrid.Config.service.autologin) {
            //disable dropdown list of saved queries
            $('#load-savedqueries').addClass('hide');

            //logged in as anonymous user, disable saving of query
            $('#savequery-panel').addClass('hide');

            //disable tab to manage saved queries
            $('#ogrid-manage-queries').addClass('hide');
        }
		
		// load auto-load query if option is set
		if (ogrid.Config.advancedSearch.autoLoadQuery) {
			this._loadQuery(ogrid.Config.advancedSearch.autoLoadQuery);

            //auto-open Select Data pane
            this._expandPane($("#ogrid-select-data-pane"));
		}
        this._isLoggedIn = true;
        ogrid.Event.raise(ogrid.Event.types.ADVANCED_INIT_DONE);

    },


    _onClear: function(e) {
        if ( ! (e.message && e.message.fromAdvancedSearch) )
            //same as on reset
            //this only gets executed when the CLEAR event is generated outside of Advanced Search
            this._onReset();

        //turn off any nonitoring query anytime clear is called
        this._queryScheduler.clear();

        //set active tab to Build Query
        $('#ogrid-adv-tabs a[href="#build-query"]').tab('show');
    },

    _onMapResultsDone: function(e) {
        //message will have the resultsetId and some passthroughdata (misc data that gets passed from the Search caller)
        if (e.message.passthroughData) {
            if (e.message.passthroughData.origin === 'queryScheduler') {
                //do not auto-zoom if from query scheduler
                return;
            }
        }

        //e.message contains the result id
        if (this._pendingQueries > 0 ) {
            this._pendingQueries--;
            if (this._pendingQueries === 0) {
                //no more pending queries, we're ready to auto-zoom
                if (!this._isMapExtentSelected()) {
                    this._options.map.zoomToResultBounds();
                }
            }
        } else {
            //not exactly our responsibility but might as well do it to work for quick search results
            if (!this._isMapExtentSelected()) {
                this._options.map.zoomToResultBounds();
            }
        }
    },

    _onReset: function() {
        this._clear();
        this._resetHash();
    },

    _onQueryLoad: function(e) {
        try {
            if ($(e.target).children(":selected").val()==='') {
                //selected blank, clear screen
                this._clearQueryElements();
            } else {
                this._loadQuery({
                    _id:  $(e.target).children(":selected").data('queryId'),
                    spec: $(e.target).children(":selected").data('qspec'),
                    owner: $(e.target).children(":selected").data('owner'),
                    name: $(e.target).children(":selected").text(),
                    geoFilter: $(e.target).children(":selected").data('geoFilter'),
                    isCommon: $(e.target).children(":selected").data('isCommon'),
                    autoRefresh: $(e.target).children(":selected").data('autoRefresh'),
                    refreshInterval: $(e.target).children(":selected").data('refreshInterval')
                });
            }
        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    _clear: function() {
        //refresh the existing query dropdowns
        this._populateCommonQueries();
        this._populateRecentlySavedQueries();

        this._clearQueryElements();
        if (this._geoFilter) this._geoFilter.reset();

        //reset auto-refresh UI elements
        $('#autoRefreshCheckbox').prop('checked', false);
        $('#autoRefreshInterval').val(30); //30 is default; add to config later
    },

    _clearQueryElements: function() {
        //clear all tabs
        $('#ogrid-ds-tabs li.regtab').remove();
        $('#ogrid-ds-content :not(script)').remove();

        $('#saveQueryAs').val('');

        this._activeQuery = null;
    },

    //load query definition into the UI
    //geo-filter is on the query level (not on data type/set level)
    _loadQuery: function(query) {
        try {
            this._isLoadingQuery = true;
            this._clearQueryElements();

            this._activeQuery = query;

            //load filter tabs
            var me = this;
            $.each(query.spec, function(i, v) {
                me._loadNewTab(v);
            });

            //always clear geoFilter
            this._geoFilter.reset();
            if (query.geoFilter) {
                this._geoFilter.restoreSettings(query.geoFilter);
            }

            //load auto-refresh attributes
            if (query.autoRefresh)
                $('#autoRefreshCheckbox').prop('checked', true);
            else
                $('#autoRefreshCheckbox').prop('checked', false);

            if (query.refreshInterval)
                $('#autoRefreshInterval').val(query.refreshInterval);

            $('#saveQueryAs').val(query.name);

            //disable save as if common query
            if ( this._commonNotOwned(query) )
                $('#advSearchSave').addClass('disabled');
            else
                $('#advSearchSave').removeClass('disabled');
        } catch (e) {
            ogrid.Alert.error(e.message);
        } finally {
            this._isLoadingQuery = false;
        }
    },

    //support dot sizer option now
    _getSize: function(tabId) {
        if ($('#spinnerGroup_' + tabId).hasClass('hidden')) {
            //dot sizer must have been selected
            var s = $("#dotSizerFields_" + tabId).val();
            if (s === '') {
                throw ogrid.error('Save Error', 'No available field for dot size');
            } else {
                return {
                    columnId: $("#dotSizerFields_" + tabId).children(":selected").val(),
                    calculator: $("#dotSizerFields_" + tabId).children(":selected").data('calc')
                };
            }
        } else {
            return $('#sizeSpin_' + tabId).val();
        }
    },

    _getRendition: function(tabId) {
        var c = $('#colorPicker_' + tabId + ' option').filter(':selected').data('color');

        if (c === undefined || c === null)
        {c = 'indianred';}

        return {
            color: c,
            fillColor: chroma.scale(['white', c])(0.5).hex(),
            opacity: $('#opacitySpin_' + tabId).val(),
            size: this._getSize(tabId)
        };
    },

    _getQueryName: function() {
        return $('#saveQueryAs').val();
    },

    _validateBeforeSave: function() {
        // do nothing for now
        if (this._getQueryName().trim() === '') {
            $('#saveQueryAs').focus();
            throw ogrid.error('Save Error', 'Query name cannot be blank.');
        }
    },


    _onSave: function(e) {
        try {
            this._validateBeforeSave();
            this._checkQueryExistence(this._getQueryName(), $.proxy(this._saveCurrentQuery, this));
        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    _getQuerySpec: function(queryId, isCommon) {
        var me = this;
        var q = {
            name: this._getQueryName(),
            owner: ogrid.App.getSession().getCurrentUser().getProfile().loginId,
            spec: [],
            sharedWith: {users:[], groups:[]}, //no sharing implemented for Sprint 2
            isCommon: isCommon ? isCommon : false, //make sure the isCommonFlag is not discarded
            autoRefresh: $('#autoRefreshCheckbox').prop('checked'),
            refreshInterval: $("#autoRefreshInterval").val()
        };

        if (queryId)
            q._id = queryId;

        //get all query builders
        $.each($('#ogrid-ds-content').find('.query-builder'), function(i,v) {
            //for each data type selected, build query to save
            var typeId = $(v).data('typeId');
            var tabId = $(v).data('parentId');
            var r = me._getRendition(tabId);
            delete r.fillColor; //fillColor is calculated, no need to save

            $(v)[0].queryBuilder.setOptions({display_errors: !me._hasEmptyFilter(v)});
            //get mongo-specific query
            var f = $(v).queryBuilder('getMongo');

            console.log("filter: " + JSON.stringify(f));
            if (!ogrid.isNull(f) && !$.isEmptyObject(f)) {
                console.log(JSON.stringify($(v).queryBuilder('getRules')));
                //alert(JSON.stringify($(v).queryBuilder('getRules')));
                q.spec.push({
                    dataSetId: typeId,
                    filters: $(v).queryBuilder('getRules'),
                    rendition: r
                });
            } else if (me._hasEmptyFilter(v)) {
                q.spec.push({
                    dataSetId: typeId,
                    filters: {},
                    rendition: r
                });
            } else {
                throw ogrid.error('Search Error', 'Search criteria is invalid.');
            }
        });

        //get geo-filter settings
        q.geoFilter = this._geoFilter.getSettings();
        return q;
    },

    //the parameters passed are attributes from original query that we want to keep and cannot be changed from the UI
    _saveCurrentQuery: function(queryId, isCommon) {
        try {
            var q = this._getQuerySpec(queryId, isCommon);

            ogrid.Search.save({
                query: q,
                success: $.proxy(this._onSaveSuccess, this),
                error: $.proxy(this._onSaveError, this)
            });
        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    _onSaveSuccess: function(data) {
        ogrid.Alert.success('Query was saved successfully.');

        //refresh recently saved
        this._populateRecentlySavedQueries();

        //on successful save of query, we always get back the query object
        //refresh our 'current' data
        this._activeQuery = data;

        //refresh Manage Queries tab
        this._queryAdmin.refreshQueries();
    },

    //find a query with given name
    _findQueryWithName: function(name, cb) {
        ogrid.Search.list({
            filter: {name: name, owner: ogrid.App.getSession().getCurrentUser().getProfile().loginId},
            success: function(data) {
                if ($.isArray(data)) {
                    if (data.length > 0) {
                        //data is an array of query defs
                        //were only expecting one to return due to our uniqueness constraint on name and owner
                        cb(data[0]._id);
                    } else {
                        //does not exist
                        cb(null);
                    }
                } else {
                    this._commonErrorHandler('Query save',
                        ogrid.Config.service.errorHandler.makeSystemError('An invalid response was received from the service when checking for existing queries.'));
                }
            },
            error: function(err, rawErrorData) {
                this._commonErrorHandler('Query save', err, rawErrorData);
            }
        });
    },

    _okToOverlay: function(name) {

    },

    _checkQueryExistence: function(name, cb) {
        try {
            var me = this;
            if (this._activeQuery && this._activeQuery._id && !this._savedAsNewName(name)) {
                //existing query, let it through as this will get handled as an update
                cb(this._activeQuery._id, this._activeQuery.isCommon);
            } else {
                //check if the same query name exists for this user, if so prompt the user if he wants to overlay it
                this._findQueryWithName(name, function(queryId) {
                    if (queryId) {
                        //pop dialog box
                        ogrid.Alert.modalPrompt('Query Save', 'A query with name \'' + name + '\' already exists. This will overwrite the existing query. Continue?', function(selected) {
                            //'ok' or 'cancel'
                            if (selected === 'ok') {
                                //force an update by passing existing query Id to the callback (instead of deleting and adding a new one)
                                //call callback to actually save current query definition
                                cb(queryId);
                            }
                        });
                    } else {
                        cb(null);
                    }
                });
            }
        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    _savedAsNewName: function(name) {
        return (this._activeQuery.name !== name);
    },


    _commonErrorHandler: function (opName, err, rawErrorData, passThroughData) {
        //no use for pass through data right now (more used on success case)
        if (err && !$.isEmptyObject(err)) {
            ogrid.Alert.error(err.message + '(' + 'Code: ' + err.code + ')');
        } else {
            if (rawErrorData.txtStatus === 'timeout') {
                ogrid.Alert.error(opName + ' has timed out.');
            } else {
                ogrid.Alert.error( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
            }
        }
    },

    _onSaveError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Query save', err, rawErrorData, passThroughData);
    },

    _hideMe: function() {
        $("#ogrid-task-advanced-search").switchClass('visible','hide', 500);
        $("#ogrid-advanced-btn").removeClass('active');

        //remove focus from button
        $('#ogrid-advanced-btn').blur();
        console.log("_hideMe");
    },

    _getMapLocation: function() {
        //lat,long,zoom
        var c = this._options.map.getMapCenter();
        return (
            c.lat + ',' +
            c.lng + ',' +
            this._options.map.getMapZoom()
        );
    },

    _updateHashWithQuery: function(query, autoexec) {
        //we need to add some random value on the URL so it will always trigger a hasher change
        var randomData = '&_=' + Math.floor(new Date().valueOf() * Math.random());

        //#issue 115; replace hash here since Hasher does not do it

        //register with browser history
        if (query.geoFilter && query.geoFilter.boundary === '_map-extent') {
            hasher.setHash("query?q=" + JSON.stringify(query).replace(/#/g, encodeURIComponent('#')) + "&loc=" + this._getMapLocation() + "&run=" + autoexec + randomData);
        } else {
            hasher.setHash("query?q=" + JSON.stringify(query).replace(/#/g, encodeURIComponent('#')) + "&run=" + autoexec + randomData);
        }
    },

    _resetHash: function() {
        hasher.setHash("");
    },

    _isShapeDataLoaded: function(me, query) {
        //wait for a max of 5 secs
        return ogrid.waitForCondition(10000, function(deferred) {
            try {
                //try restore again
                me._geoFilter.restoreSettings(query.geoFilter);

                me._geoFilter.getGeoFilter();
                deferred.resolve('done');
            } catch (ex) {
                console.log(ex.message);
            }
        });
    },

    _doSearch: function(me, search, e) {
        //if geoSpatial filtering is supported by service, send geoSpatial filters
        if ( ogrid.App.serviceCapabilities().geoSpatialFiltering && me._geoFilter.getSettings().boundary) {
            search.geoFilter = me._geoFilter.getGeoFilter();
        }
        //immediate execution
        ogrid.Search.exec(search, {origin: 'advancedSearch', search: search,
            //set new object to handle refresh on map extent change
            //  only on map extent location and if callback function is passed as param
            regenerator: (me._isMapExtentSelected()) ? {handler: me, id: ogrid.guid()} : null,

            //new done callback for map extent change
            done: (typeof e == 'function') ? e : null
        });
    },

    _executeSearch: function(query) {
        try {
            var me = this;

            //clear first
            //we need to bypass this CLEAR event, pass a message that only we care about
            ogrid.Event.raise(ogrid.Event.types.CLEAR, {fromAdvancedSearch: true} );

            //count pending queries for post-map auto-zoom to work
            //optimize later (we're doing this 2x)
            this._pendingQueries = 0; //re-init list
            $.each($('#ogrid-ds-content').find('.query-builder'), function(i,v) {
                var f = $(v).queryBuilder('getMongo');

                //allow empty filters
                //Issue #118
                //if (!ogrid.isNull(f) && !$.isEmptyObject(f)) {
                me._pendingQueries++;
                //}
            });

            //get all query builders
            $.each($('#ogrid-ds-content').find('.query-builder'), function(i,v) {
                //for each data type selected, build query
                var typeId = $(v).data('typeId');

                //do not show error on UI if empty (Issue #118)
                $(v)[0].queryBuilder.setOptions({display_errors: !me._hasEmptyFilter(v)});

                //get mongo-specific query
                var f = $(v).queryBuilder('getMongo');

                console.log("filter: " + JSON.stringify(f));

                var tabId = $(v).data('parentId');

                //allow empty filters
                //Issue #118
                var search = {
                    dataSetId: typeId,
                    //default to no filter
                    filter: {},
                    rendition: me._getRendition(tabId),
                    success: $.proxy(me._onSubmitSuccess, me),
                    error: $.proxy(me._onSubmitError, me)
                };

                if (!ogrid.isNull(f) && !$.isEmptyObject(f)) {
                    console.log(JSON.stringify($(v).queryBuilder('getRules')));

                    //execute query
                    search.filter = f;
                } else if (!me._hasEmptyFilter(v)) {
                    //not blank condition and in error state
                    throw ogrid.error('Search Error', 'Search criteria is invalid.');
                }

                //var wait = 0;
                //if (me._geoFilter.getSettings().boundary && !me._isShapeDataLoaded()) {wait = 5000; console.log("Shape data not loaded yet. Waiting for X seconds");}

                //now that we are supporting invoking query via URL, we have to handle condition
                // where boundaries are not quite loaded yet
                if ( me._geoFilter.getSettings().boundary) {
                    $.when( me._isShapeDataLoaded(me, query) ).done(function () {
                        me._doSearch(me, search);
                    });
                } else {
                    me._doSearch(me, search);
                }

            });

            //auto-hide Advanced Search pane after Submit (no longer done in mobile mode only)
            me._hideMe();

        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    //now query submission is just triggering hash change
    _onSubmit: function(e) {
        try {
            var id = null;
            //if loaded from a previously saved query, maintain the query ID
            if (this._activeQuery && this._activeQuery._id) {
                id = this._activeQuery._id;
            }
            var q = this._getQuerySpec(id);
            this._updateHashWithQuery(q, true);
        } catch (ex) {
            ogrid.Alert.error(ex.message);
        }
    },

    _hasEmptyFilter: function(qbuilder) {
        var r = true;
        //if operator container is empty, it must be an empty filter
        $.each($(qbuilder).find('.rule-operator-container'), function(i, v) {
            //loop through each rule container, in case there are more than 1
            if ($(v).html() !== '') {
                r = false;
                return false;
            }
        });
        return r;
    },

    _onSubmitSuccess: function(data, passThroughData) {
        try {
           //if geoSpatial filtering is not supported by service, implement filtering locally
            if ( !ogrid.App.serviceCapabilities().geoSpatialFiltering ) {
                //apply additional geo-spatial filter, if any is specified
                if (this._geoFilter.getSettings().boundary) {
                    console.time("geoFilter.filterData:" + data.meta.view.id);
                    data = this._geoFilter.filterData(data);
                    console.timeEnd("geoFilter.filterData:" + data.meta.view.id);
                }
            }

            var rsId = ogrid.guid();

            //some fudge here because monitorData does not get populated until the first auto-refresh search execution
            var enableAutoRefresh = false;

            if (passThroughData && !passThroughData.monitorData) {
                //enable auto-refresh/minitoring if not already running for this query
                //monitor data is being populated by Query Scheduler
                if ( $('#autoRefreshCheckbox').prop('checked') ) {
                    //monitoring query/scheduled execution
                    this._queryScheduler.addQuery({
                        //search is passed from initial exec call
                        searchOptions: passThroughData.search,
                        schedule: {
                            every: $('#autoRefreshInterval').val(),
                            unit:'s'
                        },
                        //we are able to pre-determine the Id for our monitor/timer
                        overrideId: rsId
                    });
                    enableAutoRefresh = true;
                }
            } else
                enableAutoRefresh = (passThroughData && passThroughData.monitorData);

            ogrid.Event.raise(ogrid.Event.types.REFRESH_DATA, {resultSetId: rsId, data: data,
                options: {
                    clear: false,

                    //some fudge here because monitorData does not get populated until the first auto-refresh search execution
                    //we need to let our table know beforehand
                    enableAutoRefresh: enableAutoRefresh,
                    passthroughData: passThroughData
                }
            } );
        } catch (ex) {
            //we're expecting the geofilter class to raise some exceptions
            ogrid.Alert.error(ex.message);
        }
    },

    _onSubmitError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Search', err, rawErrorData, passThroughData);
    },

    _populateDataTypes: function () {
        var me = this;

        //get all data types
        if (!this._options.allDataTypes) {
            //get all available data type descriptors from the service
            //ogrid.ajax(this, function(data) {
                me._options.allDataTypes = this._options.datasets;
                $('#dtTemplate').tmpl(this._options.datasets).appendTo('#ogrid-dtlist');

                $('#ogrid-dtlist').find('li').click($.proxy(me._onDataTypeAdd, me));
            //}, {url: '/datasets'});
        }
    },

    _lookupDataType: function(typeId) {
        var t = null;

        $.each(this._options.allDataTypes, function(i, v) {
            //we don't want an exact type equality (i.e. 311 will not match '311')
            if (v.id == typeId) {
                t = v;
                return;
            }
        });
        if (ogrid.isNull(t))
            throw ogrid.error('System Error','Descriptor for data type \'' + typeId + '\' cannot be found. Make sure you have the appropriate permissions to access this dataset and try again.');
        return t;
    },

    //caches look up values
    _lookupLov: function(listId, done, me) {
        if (me._lookupLov[listId]) {
            done(me._lookupLov[listId]);
        } else {
            $.ajax(ogrid.Config.service.endpoint + '/autocomplete/' + listId)
                .done(function (data) {
                    var a = $.map(data, function (v, i) {
                        return {value: v.value, data: v.key};

                    });
                    me._lookupLov[listId] = a;
                    done(me._lookupLov[listId]);
                })
                .fail(function (jqXHR, txtStatus, errorThrown) {
                    //ogrid.App.handleError('User save', errorThrown, {jqXHR: jqXHR, txtStatus:txtStatus});
                });
        }
    },

    _getAutoComplete2: function(filter, column, me) {
        me._lookupLov(column.listOfValuesId,
            function(data){
                filter.autocomplete =  {
                    lookup: data,
                    onSelect: function (suggestion) {
                        //alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
                    }
                };
            },
            me);
    },

    _filterSuggestions: function(query, data) {
        var a =  $.map(data.suggestions, function(v, i) {
            if ( v.value.match(new RegExp(query, 'i')) ) {
                return v;
            }
        });
        return {suggestions: a};
    },

    _getAutoComplete: function(filter, column, me) {
        var listId = column.listOfValuesId;

        filter.autocomplete = {
            lookup: function (query, done) {

                if (me._isLoadingQuery) {
                    //handle issue where the auto-complete box pops up when we load an existing query
                    done({suggestions: []}); return;
                }

                console.log(query);
                if (me._lookupLov[listId]) {
                    done( me._filterSuggestions(query, me._lookupLov[listId]) );
                } else {
                    $.ajax(ogrid.Config.service.endpoint + '/autocomplete/' + listId)
                        .done(function (data) {
                            var a = $.map(data, function (v, i) {
                                return {value: v.value, data: v.key};
                            });
                            me._lookupLov[listId] = {suggestions: a};
                            done( me._filterSuggestions(query, me._lookupLov[listId]) );
                        })
                        .fail(function (jqXHR, txtStatus, errorThrown) {
                            //ogrid.App.handleError('User save', errorThrown, {jqXHR: jqXHR, txtStatus:txtStatus});
                        });
                }
            },
            onSelect: function (suggestion) {
                console.log($(this).val());
                //trigger change so the query builder can reclc it's model
                $(this).trigger("change");
            }
        };
    },

    _getSupportedOps: function(ds, dataType, defaultOperators) {
        var ret = null;
        if (ds.options.supportedOperators) {
            $.each(ds.options.supportedOperators, function(i, v) {
                if (v.dataType === dataType) {
                    ret = v.operators;

                    //break
                    return false;
                }
            });
            if (ret) {
                return ret;
            }
        }
        //return default set of operators
        return defaultOperators;
    },


    _getFilters: function(typeId) {
        var a = [];

        //default operators
        var date_ops = ['between', 'greater', 'less'];
        var numops = ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between'];
        var strops =  ['equal', 'not_equal', 'contains', 'begins_with'];

        var me = this;
        var defaultOps;
        $.each(this._options.allDataTypes, function(i, ds) {
            //we don't want an exact type equality (i.e. 311 will not match '311')
            if (ds.id == typeId) {
                $.each(ds.columns, function(i, v) {
                    //add only filterable properties
                    if (v.filter) {
                        var f = {
                            id: v.id,
                            label: v.displayName,
                            type: v.dataType
                        };
                        if (v.dataType==='string') {
                            //add auto-complete if configured
                            if (v.listOfValuesId) {
                                //f.autocomplete =  me._getAutoComplete(v, me);
                                me._getAutoComplete(f, v, me);
                            }
                            //use default widget operators for strings
                            defaultOps = null;

                        } else if (v.dataType==='float') {
                            f.type = 'double';
                            f.validation = {step: 0.01};
                            f.operators = me._getSupportedOps(ds, v.dataType, strops);
                            defaultOps = numops;

                        } else if (v.dataType==='number') {
                            f.type = 'integer';
                            f.validation = {step: 1};
                            defaultOps = numops;

                        } else if (v.dataType==='date') {
                            f.validation = {format: 'MM/DD/YYYY hh:mm:ss a'};
                            f.plugin =  'datetimepicker';
                            f.plugin_config = {
                                //added to support non-date/time value (natural language date expression)
                                keepInvalid: true,

                                //prevent natural language date from being parsed
                                useStrict: true,
                                widgetPositioning: {vertical: 'bottom', horizontal: 'auto'},
                                keyBinds: {
                                    left: function (widget) {
                                        return true;
                                    },
                                    right: function (widget) {
                                        return true;
                                    },
                                    t: null,
                                    'delete': function () {
                                        return true;
                                    }
                                }
                            };
                            defaultOps = date_ops;

                        } else {
                            defaultOps = strops;
                        }
                        //if default ops is available, set the operators, otherwise leave to use widget defaults
                        var ops = me._getSupportedOps(ds, v.dataType, defaultOps);
                        ops && (f.operators = ops);

                        a.push(f);
                    }
                });
                return;
            }
        });
        return a;
    },

    _getDotSizers: function(ds) {
        var a = [];
        $.each(ds.columns, function(i, v) {
            if (v.dotSizer) {
                a.push ({
                    columnId: v.id,
                    displayName: v.displayName,
                    calculator: v.dotSizer.calculator
                });
            }
        });
        if (a.length === 0) {
            //default
            a.push ({
                columnId: '',
                displayName: '(No fields available)',
                calculator: ''
            });
        }
        return a;
    },

    _onColorOptionsClick: function(e) {
        if ($(e.target).hasClass('panel-collapsed')) {
            // expand the panel
            $(e.target).parent().find('.panel-body').slideDown();
            $(e.target).removeClass('panel-collapsed');
            $(e.target).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
        else {
            // collapse the panel
            $(e.target).parent().find('.panel-body').slideUp();
            $(e.target).addClass('panel-collapsed');
            $(e.target).find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        }
    },

    _getDotSizersSelect: function(ds) {
        var a = this._getDotSizers(ds);
        var s = "";
        $.each(a, function(i, v) {
            s+='<option value="' + v.columnId + '" data-calc="' + v.calculator  + '">' + v.displayName  +  '</option>"';
        });
        return s;
    },

    _loadNewTab: function(qspec) {
        $('#ogrid-ds-tabs').find('li').removeClass('active');
        $('#ogrid-ds-content .tab-pane').removeClass('active');

        var tabId = ogrid.guid();
        var ds = this._lookupDataType(qspec.dataSetId);

        $('#newDTTemplate').tmpl({
            tabName: tabId,
            label: ds.displayName
        }).prependTo('#ogrid-ds-tabs');

        //setup close event handler for X button on each data type tab
        //not efficient to do this everytime, but this is the only logical place to put this
        //try to attach to specific instance of the X button later
        $(".closeTab").click(function () {
            //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
            var tabContentId = $(this).parent().attr("href");
            $(this).parent().parent().remove(); //remove li of tab
            $('#myTab a:last').tab('show'); // Select first tab
            $(tabContentId).remove(); //remove respective tab content
        });

        //add content of tab for new data type selected
        $('#dtTabTemplate').tmpl({ tabName: tabId}).prependTo('#ogrid-ds-content');

        var b = {
            filters: this._getFilters(qspec.dataSetId)
        };
        if (!$.isEmptyObject(qspec.filters)) {
            b.rules = qspec.filters;
        }
        $('#builder_' + tabId).queryBuilder(b);
        $('#builder_' + tabId)[0].queryBuilder.setOptions({display_errors: false});

        //store reference to the data set type for easily building actual query later
        $('#builder_' + tabId).data('typeId', qspec.dataSetId);
        $('#builder_' + tabId).data('parentId', tabId);

        //set default color picker color (randomize for uniqueness later)
        $('#colorPicker_' + tabId).colorselector("setColor", chroma(qspec.rendition.color).hex().toUpperCase());

        //handle spinners for newly created instances
        $('#sizeSpinUp_' + tabId).click(this._getSpinEventHandler('#sizeSpin_' + tabId, 1));
        $('#sizeSpinDn_' + tabId).click(this._getSpinEventHandler('#sizeSpin_' + tabId, -1));


        $('#opacitySpinUp_' + tabId).click(this._getSpinEventHandler('#opacitySpin_' + tabId, 1));
        $('#opacitySpinDn_' + tabId).click(this._getSpinEventHandler('#opacitySpin_' + tabId, -1));


        //set values
        $('#opacitySpin_' + tabId).val(qspec.rendition.opacity);

        //assign click handler for this clickable link
        $("#colorOptions_" + tabId).click(this._onColorOptionsClick);

        //hide color options explicitly
        $("#colorOptions_" + tabId).addClass("panel-collapsed");
        $("#colorOptions_" + tabId).parent().find('.panel-body').css("display", "none!important");

        $("#sizeSwitch_" + tabId).bootstrapToggle();

        //populate dot sizer fields
        //use raw Html, using nested jquery template does not seem to be working
        $("#dotSizerFields_" + tabId).append(this._getDotSizersSelect(ds));

        $("#sizeSwitch_" + tabId).change(function() {
            if ($(this).prop('checked')) {
                $("#spinnerGroup_" + tabId).addClass('hidden');
                $("#dotSizerFields_" + tabId).removeClass('hidden');
            } else {
                $("#dotSizerFields_" + tabId).addClass('hidden');
                $("#spinnerGroup_" + tabId).removeClass('hidden');
            }
        });

        if (_.isObject(qspec.rendition.size)) {
            //dot sizer was selected
            $("#sizeSwitch_" + tabId).bootstrapToggle('on');
            $("#dotSizerFields_" + tabId).val(qspec.rendition.size.columnId);
            //$("#spinnerGroup_" + tabId).addClass('hidden');
            //$("#dotSizerFields_" + tabId).removeClass('hidden');
        } else {
            $('#sizeSpin_' + tabId).val(qspec.rendition.size);
            //$("#dotSizerFields_" + tabId).addClass('hidden');
            //$("#spinnerGroup_" + tabId).removeClass('hidden');
        }
    },

    _getSpinEventHandler: function(inputSelector, delta) {
        return function() {
            $(inputSelector).val( parseInt($(inputSelector).val(), 10) + delta);
        };
    },

    //event handler when adding a new data type from the drop down list
    _onDataTypeAdd: function(e) {
        var q = {
            dataSetId:  $(e.target).data('typeId'),
            name: '',
            filters: {},
            rendition: {
                //color: this._options.defaultPointColor,
            	color: $(e.target).data('color'),
               	opacity: $(e.target).data('opacity'),
               	size: $(e.target).data('size')
            }
        };
        $('#ogrid-ds-tabs').find('li').removeClass('active');
        $('#ogrid-ds-content .tab-pane').removeClass('active');

        this._loadNewTab(q);
    },


    //public methods

    //call back for map extent change, invoked by map component
    regenerate: function(done) {
        console.log("Regenerate called");
        if (this._isMapExtentSelected()) {
            //re-invoke submit, passing along done callback
            this._onSubmit(done);
        }
    },

    getQueryOpener: function(autorun, context) {
        return this._onManageQueryOpen(autorun, context);
    }
});
