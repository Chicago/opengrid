/*
 * ogrid.TableView
 *
 * Table View class for displaying tabular data
 */


ogrid.TableView = ogrid.Class.extend({
    //private attributes
    _options:{
        maxMobileRowsNoPagination: 500
    },
    _tabs: null,
    _tabContent: null,
    _tabViewPanel: null,

    _tableRefs: {},
    _tableOptions: null,

    //public attributes


    //constructor
    init: function(tabViewPanel, tabs, tabContent, options) {
        if (options)
            this._options = $.extend(this._options, options);
        this._tabs = tabs;
        this._tabContent = tabContent;
        this._tabViewPanel = tabViewPanel;

        //header panel collapse events
        $('#ogrid-panel-caret').click($.proxy(this._onTableViewCaretClick, this));
        this._tabViewPanel.on('show.bs.collapse hide.bs.collapse', this._toggleTablePanelCollapse);
        //this._tabViewPanel.on('hide.bs.collapse', this._toggleTablePanelCollapse);

        ogrid.Event.on(ogrid.Event.types.REFRESH_DATA, $.proxy(this._onRefreshData, this));
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));
        ogrid.Event.on(ogrid.Event.types.MOBILE_MODE_CHANGED, $.proxy(this._onMobileModeChanged, this));

        this._setupWindowResizeHandler();

        //manually trigger resize handler to refresh layout
        this._onWindowResize();
    },


    //private methods
    _toggleTablePanelCollapse: function() {
        if ($('#ogrid-panel-caret').hasClass('glyphicon-chevron-up')) {
            $('.ogrid-footer-panel-heading').animate({
                backgroundColor: "#E8E8E8"
            }, 500);
            //$('#panel-caret').removeClass('fa-caret-square-o-up').addClass('fa-caret-square-o-down');
            //glyphicon glyphicon-chevron-down
            $('#ogrid-panel-caret').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $('.ogrid-footer-panel-heading').animate({
                backgroundColor: "#E8E8E8"
            }, 500);
            $('#ogrid-panel-caret').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    },

    _onTableViewCaretClick: function(e) {
        //this._toggleTablePanelCollapse();
        if ($('#ogrid-panel-caret').hasClass('glyphicon-chevron-up')) {
            $('#tableview').collapse('show');
        } else {
            $('#tableview').collapse('hide');
        }
    },


    _getTableHeight: function() {
        //check if pct
        var s = ogrid.Config.table.height.trim();
        var i = s.indexOf('%');
        if ( i > -1) {
            return ( $(window).height() *
                ( ogrid.Config.table.height.substr(0, ogrid.Config.table.height.length -1 ) / 100 )
            );
        } else {
            return s;
        }
    },

    _setupWindowResizeHandler: function() {
       $(window).resize($.proxy(this._onWindowResize, this));
    },

    _onWindowResize: function() {
        //dynamically assign height of the table, and refresh header row column alignments
        //$('#table').bootstrapTable('resetView');
        var t = $('#ogrid-tab-content .bootstrap-table table');
        t.bootstrapTable('getOptions').height = this._getTableHeight();
        t.bootstrapTable('resetView');
    },

    _onRefreshData: function (evtData) {
        try {
            //console.log('map refresh: ' + JSON.stringify(evtData));
            var data = evtData.message.data;

            //clear map if clear flag is on
            if (!ogrid.isNull(evtData.message.options.clear) && evtData.message.options.clear) {
                this._onClear();
            }

            //result set ID is the unique id for every resultset from our Search component
            var rsId = evtData.message.resultSetId;

            //load data on new tab
            //if data is from a monitoring query, use that as our resultSetId as that remains constant through out the monitoring/timer session
            if (this._isMonitored(evtData.message))
                rsId = evtData.message.options.passthroughData.monitorData.monitorId;

            this.loadData(rsId, data, true, evtData.message.data.lastRefreshed, evtData.message.options);
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _onMobileModeChanged: function(e) {
        var me = this;
        $.each($('#ogrid-tab-content .bootstrap-table .fixed-table-body > table'), function(i, v) {
            var data = $(v).bootstrapTable('getData');
            $(v).bootstrapTable('toggleView');

            //if less than our pre-determined max rows
            if (data.length < me._options.maxMobileRowsNoPagination) {
                //there is performance issue when we don't have pagination and we have a lot of data
                $(v).bootstrapTable('togglePagination');
            }
            $(v).bootstrapTable('resetView');
        });
    },

    _isMonitored: function(m) {
        return (m.options && m.options.passthroughData &&
            m.options.passthroughData.monitorData && m.options.passthroughData.monitorData.monitorId);
    },

    _onClear: function (evtData) {
        this._clear();
    },


    _clear: function() {
        this._tabs.empty();
        this._tabContent.empty();

        //clear our resultset Id->table map
        this._tableRefs = {};
    },

    _getLatestDataTs: function(data) {
        var options = data.meta.view.options;
        if (options.creationTimestamp) {
            //check if a property is designated as cretion timestamp

            if (data.features && data.features.length > 0) {
                //assume sort by the creation timestamp, descending
                return moment(data.features[0].properties[options.creationTimestamp], ogrid.Config.service.dateFormat);
            }
        }
        return null;

    },

    _populateTableRows: function(resultSetId, tableId, columns, data, showAutorefresh, lastRefreshed, creationTSColumn) {
        //$('#' + tableId).addClass('no-wrap');

        this._tableOptions = $.extend(ogrid.Config.table.bootstrapTableOptions, {
            //our geoJson data in its original structure (data attribute is flattened post table creation)
            origData: data,
                data: data.features,
            heatmapOptions: {map: ogrid.App.map()},
            tilemapOptions: {
                //get tile areas from config file
                tileAreas: ogrid.Config.map.tileMapOptions,
                map: ogrid.App.map()
            },
            graphOptions: {
                groupFields: this._getGroupFields(data.meta.view.columns)
            },
            columns: columns,
            height: this._getTableHeight(),
            showAutorefresh: showAutorefresh,
            cardView: ogrid.App.mobileView(),
            pagination: !ogrid.App.mobileView() || data.features.length >= this._options.maxMobileRowsNoPagination,

            //for coloring new rows on auto-reresh
            rowStyle: this._getRowStyler(tableId, creationTSColumn)
        });

        var $t = $('#' + tableId).bootstrapTable(this._tableOptions);

        //add tooltip to Export extension
        $('div.export').attr('title', 'Export');

        if (showAutorefresh) {
            $('div.autorefresh').attr('title', 'Last auto-refreshed: ' + lastRefreshed.format('MM/DD/YYYY hh:mm:ss a'));

            //we need this for auto highlighting
            $('#' + tableId).data('latestDataTs', this._getLatestDataTs(data));
        }

        //console.log($t.bootstrapTable('getData'));
        var me = this;

        $t.data('resultSetId', resultSetId);
        $t.on('click-row.bs.table', function($e, rowData) {
            //rowData is our 'flattened' geoJson data for this row
            if (me._options.map) {
                //make this generic, right now, this is very specific to our Mongo data
                //pass composite key of resultset Id and point Id to map
                var idToUse = (rowData.hasOwnProperty('id.$oid') ? 'id.$oid' : 'id');

                me._options.map.popupMarkerById($(this).data('resultSetId'), rowData[idToUse]);
            }
        });

        //highlight of clicked row
        $t.on('click', 'tbody tr', function(e) {
            $(this).addClass('highlight').siblings().removeClass('highlight');
        });

        //workaround the table export limitation (Bootstrap table widget can only export one page at a time)
        //  by overriding existing event handler on export
        this._overrideExportBehavior($t);
    },


    _getGroupFields: function(columns) {
        return $.map(columns, function(v,i) {
            if (v.groupBy) {
                return {label: v.displayName, name: v.id };
            }
        });
    },


    _overrideExportBehavior: function(t) {
        //get original event handler for export option
        var tabId = $(t)[0].id.replace('ogrid-table', 'ogrid-tab');
        var oldClickFn = jQuery._data( $('#' + tabId).find('div.export li')[0], "events").click[0].handler;
        $('#' + tabId).find('div.export li').off('click');

        //setup our own click event handler
        $('#' + tabId).find('div.export li').click(function(e) {
            ogrid.Alert.busy('Exporting table data...', this, function() {
                //temporarily turn off pagination when exporting all records
                t.bootstrapTable('togglePagination');

                try {
                    //call original event handler
                    oldClickFn.apply(this, arguments);
                } finally {
                    ogrid.Alert.idle();
                    //always put pagination back the way it was
                    t.bootstrapTable('togglePagination');

                }
            });
        });
    },

    _getTabLinkName: function(id) {
        return 'ogrid-tablink-' + id;
    },

    _getTabName: function(id) {
        return 'ogrid-tab-' + id;
    },

    _getTableName: function(id) {
        return 'ogrid-table-' + id;
    },

    _sortDateValues: function(a, b) {
        if (!a || !b)
            return 0;

        //use moment js to compare date values
        var aVal = moment(a, ogrid.Config.service.dateFormat);
        var bVal = moment(b, ogrid.Config.service.dateFormat);

        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;

        return 0;
    },

    _transformData: function(data) {
        var a = [];
        for (var i in data.meta.view.columns) {
            if (data.meta.view.columns[i].list) {
                //s += '<th>' + data.meta.view.columns[i].displayName + '</th>';
                //build datatables column map at the same time
                var col = {field: 'properties.' + data.meta.view.columns[i].id, title: data.meta.view.columns[i].displayName, sortable:true};
                if ( data.meta.view.columns[i].dataType === 'date' ) {
                    //add a custom sorter for date columns
                    col.sorter = $.proxy(this._sortDateValues, this);
                }
                a.push( col );
            }
        }
        return a;
    },

    _getRowStyler:function(tableId, creationTSColumn) {
        return function(row, index) {
            var lastRefreshed = $('#' + tableId).data('latestDataTs');
            if (lastRefreshed) {
                //highlight new rows on auto-refresh using Bootstrap's success style
                if (creationTSColumn && moment(row[creationTSColumn], ogrid.Config.service.dateFormat) > lastRefreshed) {
                    return {
                        classes: 'success'
                    };
                }
            }
            return {};
        };
    },

    _getCreationTsColumn: function(data) {
        if (data.meta.view.options.creationTimestamp) {
            return 'properties.' + data.meta.view.options.creationTimestamp;
        }
        return null;
    },

    //public methods

    //loads new data on new tab
    //data is in geojson format
    //convert to use jQuery templates later (using string + now)
    loadData: function(resultSetId, data, activate, lastRefreshed, options) {
        var o = {};

        var enableAutoRefresh = (options && options.enableAutoRefresh);

        //check if resultsetId exists, if it does, then we just need to refresh our table with new data
        //otherwise, construct a brand-new table
        if (this._tableRefs.hasOwnProperty(resultSetId)) {
            //update
            o = this._tableRefs[resultSetId];
            this.updateData(o.tableId, data, enableAutoRefresh, lastRefreshed);
        } else {
            //new
            //var id = ogrid.guid();
            //use the resultSetId as our table Id
            var id = resultSetId;
            o = {
                id: resultSetId,
                linkId: this._getTabLinkName(id),
                tabId: this._getTabName(id),
                tableId: this._getTableName(id)
            };

            //color based on the same map rendition color
            var c = 'black';
            if (!ogrid.isNull(data.meta.view.options.rendition.color)) {
                c = data.meta.view.options.rendition.color;
            }
            var sp = '<i class="fa fa-circle-o" style="color:' + c + '"></i>&nbsp';

            //controller tab
            $('<li id="' + o.linkId + '" class="ogrid-tab-link"><a href=#' + o.tabId + ' role="tab" data-toggle="tab">' + sp + data.meta.view.displayName + '</a></li>').appendTo(this._tabs);

            //tab content panel
            var s = '<div id="' + o.tabId + '" class="tab-pane ogrid-table table-responsive">';
            s += '<table id="' + o.tableId + '"></table>';

            //sort later using sortOrder view attribute
            var a = this._transformData(data);
            s+= '</div>';
            $(s).appendTo(this._tabContent);

            //we need to send this along now for the auto-highlighting to work
            var creationTSColumn = this._getCreationTsColumn(data);

            //populate datatable objects
            this._populateTableRows(resultSetId, o.tableId, a, data, enableAutoRefresh, lastRefreshed, creationTSColumn);
            if (activate) {
                this.activateTab(o.id);
                /*$('#' + o.tabId).addClass('active');
                 $('#' + o.linkId).addClass('active');*/
            }

            this._tableRefs[resultSetId] = o;
        }
        return o.id;
    },

    activateTab: function(id) {
        $("#ogrid-nav-tabs li").removeClass("active");
        $("#ogrid-tab-content .ogrid-table").removeClass("active");

        $('#' + this._getTabLinkName(id) ).addClass('active');
        $('#' + this._getTabName(id) ).addClass('active');
    },

    //updates data on an existing tab
    updateData: function(tableId, data, showAutorefresh, lastRefreshed) {
        var a = this._transformData(data);

        //we need this for auto highlighting
        //get the newest timestamp prior to refresh
        var currentOptions =  $('#' + tableId).bootstrapTable('getOptions');

        $('#' + tableId).data('latestDataTs', this._getLatestDataTs( currentOptions.origData ));

        var $t = $('#' + tableId).bootstrapTable('refreshOptions', {
            origData: data,
            data: data.features,
            height: this._getTableHeight(),
            showAutorefresh: showAutorefresh
        });

        if (showAutorefresh) {
            $('div.autorefresh').attr('title', 'Last auto-refreshed: ' + lastRefreshed.format('MM/DD/YYYY hh:mm:ss a'));
        }
    }
});