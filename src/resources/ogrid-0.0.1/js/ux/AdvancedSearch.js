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

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = $.extend(this._options, options);
        }

        //init UI elements
        this._initEventHandlers();

        this._populateDataTypes();

        this._populateExistingQueries();
        this._setupWindowResizeHandler();
    },


    //private methods
    _setupWindowResizeHandler: function() {
        var me = this;

        $(window).resize(function () {
            //dynamically set scrollbar visibility condition
            $('#build-query').css('height', $(window).height()- 145);
        });
    },


    _populateExistingQueries: function() {

        this._populateCommonQueries();
        this._populateRecentlySavedQueries();
    },


    _populateCommonQueries: function() {
        //clear all options except for blank item
        $('#commonlyUsedQueries option[value!=""]').remove();

        ogrid.Search.list({
            filter: {isCommon: true},
            success: $.proxy(this._onPopSuccess('#commonlyUsedQueries'), this),
            error: $.proxy(this._onPopError, this)
        });
    },


    _populateRecentlySavedQueries: function() {
        //clear all options except for blank item
        $('#lastSavedQueries option[value!=""]').remove();

        ogrid.Search.list({
            filter: {isCommon: false, owner:'jsmith'},
            maxResults: 10,
            success: $.proxy(this._onPopSuccess('#lastSavedQueries'), this),
            error: $.proxy(this._onPopError, this)
        });
    },

    _onPopSuccess: function(selectId) {
        //$('#queryOptionTemplate').tmpl(data).appendTo('#commonlyUsed');
        //use closure to our advantage to make this a generic callback
        return function(data) {
            //getting [object object] with spec data, need to massage data
            var d = [];
            $.each(data, function(i, v) {
                d.push({spec: JSON.stringify(v.spec), name: v.name});
            });
            $('#queryOptionTemplate').tmpl(d).appendTo(selectId);
        };
    },

    _onPopError: function() {

    },

    _initEventHandlers: function() {
        $('#beginDate').datetimepicker();
        $('#endDate').datetimepicker();

        $('.panel-heading span.clickable').on("click", function (e) {
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
                var q = $(e.target).children(":selected").data('qspec');
                this._loadQuery(q);
                $('#saveQueryAs').val($(e.target).children(":selected").text());
            }
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _clear: function() {
        //refresh the existing query dropdowns
        this._populateCommonQueries();
        this._populateRecentlySavedQueries();

        this._clearQueryElements();
    },

    _clearQueryElements: function() {
        //clear all tabs
        $('#ogrid-ds-tabs li.regtab').remove();
        $('#ogrid-ds-content :not(script)').remove();

        $('#saveQueryAs').val('');
    },

    //load query definition into the UI
    _loadQuery: function(spec) {
        try {
           this._clearQueryElements();

            //load filter tabs
            var me = this;
            $.each(spec, function(i, v) {
                me._loadNewTab(v);
            });
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
            var me = this;

            me._validateBeforeSave();

            var q = {
                name: this._getQueryName(),
                owner: 'jsmith', //hard-coded right now until we implement sessions
                spec: [],
                sharedWith: {users:[], groups:[]}, //no sharing implemented for Sprint 2
                isCommon: false
            };
            //get all query builders
            $.each($('#ogrid-ds-content').find('.query-builder'), function(i,v) {
                //for each data type selected, build query to save
                var typeId = $(v).data('typeId');

                //get mongo-specific query
                var f = $(v).queryBuilder('getMongo');
                if (!ogrid.isNull(f) && !$.isEmptyObject(f)) {
                    console.log(JSON.stringify($(v).queryBuilder('getRules')));
                    //alert(JSON.stringify($(v).queryBuilder('getRules')));
                    //execute query
                    var tabId = $(v).data('parentId');

                    var r = me._getRendition(tabId);
                    delete r.fillColor; //fillColor is calculated, no need to save
                    q.spec.push({
                        dataSetId: typeId,
                        filters: $(v).queryBuilder('getRules'),
                        rendition: r
                    });
                } else {
                    throw ogrid.error('Search Error', 'No search criteria specified or search criteria is invalid.');
                }
            });

            ogrid.Search.save({
                query: q,
                success: $.proxy(me._onSaveSuccess, me),
                error: $.proxy(me._onSaveError, me)
            });
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _onSaveSuccess: function(data) {
        ogrid.Alert.success('Query was saved successfully.');

        //refresh recently saved
        this._populateRecentlySavedQueries();
    },

    _onSaveError: function() {

    },


    _onSubmit: function(e) {
        try {
            var me = this;

            //clear first
            ogrid.Event.raise(ogrid.Event.types.CLEAR);

            //get all query builders
            $.each($('#ogrid-ds-content').find('.query-builder'), function(i,v) {
                //for each data type selected, build query
                var typeId = $(v).data('typeId');

                //get mongo-specific query
                var f = $(v).queryBuilder('getMongo');
                if (!ogrid.isNull(f) && !$.isEmptyObject(f)) {
                    console.log(JSON.stringify($(v).queryBuilder('getRules')));
                    //alert(JSON.stringify($(v).queryBuilder('getRules')));
                    //execute query
                    var tabId = $(v).data('parentId');

                    ogrid.Search.exec( {
                        dataSetId: typeId,
                        filter: f,
                        rendition: me._getRendition(tabId),
                        success: $.proxy(me._onSubmitSuccess, me),
                        error: $.proxy(me._onSubmitError, me)
                    });
                } else {
                    throw ogrid.error('Search Error', 'No search criteria specified or search criteria is invalid.');
                }
            });
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _onSubmitSuccess: function(data) {
        ogrid.Event.raise(ogrid.Event.types.REFRESH_DATA, {data: data, options: {clear: false}} );
    },

    _onSubmitError: function() {

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
            throw ogrid.Error('System Error','Descriptor for data type \'' + typeId + '\' cannot be found.');
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
                                todayHighlight: true,
                                autoclose: true
                            }
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

        //store reference to the data set type for easily building actual query later
        $('#builder_' + tabId).data('typeId', qspec.dataSetId);
        $('#builder_' + tabId).data('parentId', tabId);

        //set default color picker color (randomize for uniqueness later)
        $('#colorPicker_' + tabId).colorselector("setColor", chroma(qspec.rendition.color).hex().toUpperCase());

        //handle spinners for newly created instances
        $('#sizeSpinUp_' + tabId).on('click', function() {
            $('#sizeSpin_' + tabId).val( parseInt($('#sizeSpin_' + tabId).val(), 10) + 1);
        });
        $('#sizeSpinDn_' + tabId).on('click', function() {
            $('#sizeSpin_' + tabId).val( parseInt($('#sizeSpin_' + tabId).val(), 10) - 1);
        });

        $('#opacitySpinUp_' + tabId).on('click', function() {
            $('#opacitySpin_' + tabId).val( parseInt($('#opacitySpin_' + tabId).val(), 10) + 1);
        });
        $('#opacitySpinDn_' + tabId).on('click', function() {
            $('#opacitySpin_' + tabId).val( parseInt($('#opacitySpin_' + tabId).val(), 10) - 1);
        });

        //set values
        $('#sizeSpin_' + tabId).val(qspec.rendition.size);
        $('#opacitySpin_' + tabId).val(qspec.rendition.opacity);

        //$('#saveQueryAs').val(qspec.name);
    },

    //event handler when adding a new data type form the drop down list
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