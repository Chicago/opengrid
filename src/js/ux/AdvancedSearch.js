/*
 * ogrid.AdvancedSearch
 *
 * <description of class>
 */

// Template class code
// Copy this when creating a new class

ogrid.AdvancedSearch = ogrid.Class.extend({
    //private attributes
    _options:{
        defaultPointColor: '#DC143C',
        allDataTypes: null
    },

    _geoFilter: null,
    _pendingQueries: 0,
    _queryScheduler: null,
    _activeQueryId: null,

    //holds last saved name
    _activeQueryName: null,

    _queryAdmin: null,

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
                onOpen: $.proxy(this._onManageQueryOpen(false), this),
                onPlay: $.proxy(this._onManageQueryOpen(true), this),
                postDelete: $.proxy(this._postManageQueryDelete, this)
            }
        );
    },


    //private methods
    _postManageQueryDelete: function() {
        //force refresh of queries
        this._onReset();
    },

    _onManageQueryOpen: function(autoExec) {
        return function(query) {
            this._loadQuery(query);
            //if shared query and we're not the owner, create a 'copy' of the query
            if (this._sharedNotOwned(query)) {
                this._activeQueryId = null;
                this._activeQueryName = null;
            }
            if (autoExec) {
                this._onSubmit();
            } else {
                //set our active tab to Build Query
                $('#ogrid-adv-tabs a[href="#build-query"]').tab('show');

                //focus on query name for now
                //avoid annoying keyboard popup when on mobile mode
                if (!ogrid.App.mobileView()) $('#saveQueryAs').focus();
            }
        };
    },

    _sharedNotOwned: function(query) {
        return (query.sharedWith &&
            (query.sharedWith.groups || query.sharedWith.users) &&
            (query.owner !== ogrid.App.getSession().getCurrentUser().getProfile().loginId) );
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
                        geoFilter: JSON.stringify(v.geoFilter),
                        autoRefresh: ( v.autoRefresh ? true : false),
                        refreshInterval: (v.refreshInterval ? v.refreshInterval : 0)
                    }
                );
            });
            $('#queryOptionTemplate').tmpl(d).appendTo(selectId);
        };
    },


    _onPopError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Query listing', err, rawErrorData, passThroughData);
    },


    _initEventHandlers: function() {
        $('#beginDate').datetimepicker();
        $('#endDate').datetimepicker();

        $('.panel-heading span.clickable, #ogrid-adv-content .panel-heading').on("click", function (e) {
            if ($(this).hasClass('panel-collapsed')) {
                // expand the panel
                $(this).parents('.panel').find('.panel-body').slideDown();
                $(this).removeClass('panel-collapsed');
                $(this).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
            else {
                // collapse the panel
                $(this).parents('.panel').find('.panel-body').slideUp();
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

        if (ogrid.Config.map.zoomToResultsExtent)
            ogrid.Event.on(ogrid.Event.types.MAP_RESULTS_DONE, $.proxy(this._onMapResultsDone, this));

        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));
        ogrid.Event.on(ogrid.Event.types.LOGGED_IN, $.proxy(this._onLoggedIn, this));
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
                this._options.map.zoomToResultBounds();
            }
        } else {
            //not exactly our responsibility but might as well do it to work for quick search results
            this._options.map.zoomToResultBounds();
        }
    },

    _onReset: function() {
        this._clear();
    },

    _onQueryLoad: function(e) {
        try {
            if ($(e.target).children(":selected").text()==='') {
                //selected blank, clear screen
                this._clearQueryElements();
            } else {
                /*var q = $(e.target).children(":selected").data('qspec');
                var geoFilter = $(e.target).children(":selected").data('geoFilter');

                var autoRefresh = $(e.target).children(":selected").data('autoRefresh');
                var refreshInterval = $(e.target).children(":selected").data('refreshInterval');

                var queryId = $(e.target).children(":selected").data('queryId');
                var queryName = $(e.target).children(":selected").text();
                */
                this._loadQuery({
                    _id:  $(e.target).children(":selected").data('queryId'),
                    spec: $(e.target).children(":selected").data('qspec'),
                    name: $(e.target).children(":selected").text(),
                    geoFilter: $(e.target).children(":selected").data('geoFilter'),
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
        this._geoFilter.reset();

        //reset auto-refresh UI elements
        $('#autoRefreshCheckbox').prop('checked', false);
        $('#autoRefreshInterval').val(30); //30 is default; add to config later
    },

    _clearQueryElements: function() {
        //clear all tabs
        $('#ogrid-ds-tabs li.regtab').remove();
        $('#ogrid-ds-content :not(script)').remove();

        $('#saveQueryAs').val('');

        this._activeQueryId = null;
        this._activeQueryName = null;
    },

    //load query definition into the UI
    //geo-filter is on the query level (not on data type/set level)
    _loadQuery: function(query) {
        try {
           this._clearQueryElements();

            //think about storing a copy of the entire query object so we don't have to individually track attributes
            this._activeQueryId = query._id;
            this._activeQueryName = query.name;

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
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _getRendition: function(tabId) {
        var c = $('#colorPicker_' + tabId + ' option').filter(':selected').data('color');
        return {
                color: c,
                fillColor: chroma.scale(['white', c])(0.5).hex(),
                opacity: $('#opacitySpin_' + tabId).val(),
                size: $('#sizeSpin_' + tabId).val()
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

    _saveCurrentQuery: function(queryId) {
        try {
            var me = this;
            var q = {
                name: this._getQueryName(),
                owner: ogrid.App.getSession().getCurrentUser().getProfile().loginId,
                spec: [],
                sharedWith: {users:[], groups:[]}, //no sharing implemented for Sprint 2
                isCommon: false,
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

            ogrid.Search.save({
                query: q,
                success: $.proxy(me._onSaveSuccess, me),
                error: $.proxy(me._onSaveError, me)
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
        this._activeQueryId = data._id;
        this._activeQueryName = data.name;

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
            if (this._activeQueryId && !this._savedAsNewName(name)) {
                //existing query, let it through as this will get handled as an update
                cb(this._activeQueryId);
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
        return (this._activeQueryName !== name);
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


    _onSubmit: function(e) {
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
                //immediate execution
                ogrid.Search.exec(search, {origin: 'advancedSearch', search: search});
            });
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
            //apply additional geo-spatial filter, if any is specified
            if (this._geoFilter.getSettings().boundary)
                data = this._geoFilter.filterData(data);

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
            ogrid.ajax(this, function(data) {
                me._options.allDataTypes = data;
                $('#dtTemplate').tmpl(data).appendTo('#ogrid-dtlist');

                $('#ogrid-dtlist').find('li').click($.proxy(me._onDataTypeAdd, me));
            }, {url: '/datasets'});
        }
    },

    _lookupDataType: function(typeId) {
        var t = null;

        $.each(this._options.allDataTypes, function(i, v) {
            if (v.id === typeId) {
                t = v;
                return;
            }
        });
        if (ogrid.isNull(t))
            throw ogrid.error('System Error','Descriptor for data type \'' + typeId + '\' cannot be found. Make sure you have the appropriate permissions to access this dataset and try again.');
        return t;
    },



    _getFilters: function(typeId) {
        var a = [];
        var numops = ['equal', 'not_equal', 'less', 'less_or_equal', 'greater', 'greater_or_equal', 'between'];
        var strops =  ['equal', 'not_equal', 'contains', 'begins_with'];

        $.each(this._options.allDataTypes, function(i, v) {
            if (v.id === typeId) {
                $.each(v.columns, function(i, v) {
                    //add only filterable properties
                    if (v.filter) {
                        var f = {
                            id: v.id,
                            label: v.displayName,
                            type: v.dataType
                        };
                        if (v.dataType==='float') {
                            f.type = 'double';
                            f.validation = {step: 0.01};
                            f.operators = numops;

                        } else if (v.dataType==='number') {
                            f.type = 'integer';
                            f.validation = {step: 1};
                            f.operators = numops;

                        } else if (v.dataType==='date') {
                            f.validation = {format: 'MM/DD/YYYY'};
                            f.plugin =  'datepicker';
                            f.plugin_config = {
                                format: 'mm/dd/yyyy',
                                todayBtn: 'linked',
                                nowBtn: 'linked',
                                todayHighlight: true,
                                autoclose: true
                            };
                            f.operators = numops;

                        } else {
                            f.operators = strops;
                        }
                        a.push(f);
                    }
                });
                return;
            }
        });
        return a;
    },


    _loadNewTab: function(qspec) {
        $('#ogrid-ds-tabs').find('li').removeClass('active');
        $('#ogrid-ds-content .tab-pane').removeClass('active');

        var tabId = ogrid.guid();

        $('#newDTTemplate').tmpl({
            tabName: tabId,
            label: this._lookupDataType(qspec.dataSetId).displayName
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
        $('#sizeSpin_' + tabId).val(qspec.rendition.size);
        $('#opacitySpin_' + tabId).val(qspec.rendition.opacity);

        //$('#saveQueryAs').val(qspec.name);
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
                //defaults- get from config later
                color: this._options.defaultPointColor,
                opacity: 85,
                size: 6
            }
        };
        $('#ogrid-ds-tabs').find('li').removeClass('active');
        $('#ogrid-ds-content .tab-pane').removeClass('active');

        this._loadNewTab(q);
    }


    //public methods

});