/*
 * ogrid.TableView
 *
 * Table View class for displaying tabular data
 */


ogrid.TableView = ogrid.Class.extend({
    //private attributes
    _options:{},
    _tabs: null,
    _tabContent: null,
    _tabViewPanel: null,

    _tableRefs: [],

    //public attributes


    //constructor
    init: function(tabViewPanel, tabs, tabContent, options) {
        if (options)
            _options = options;
        this._tabs = tabs;
        this._tabContent = tabContent;
        this._tabViewPanel = tabViewPanel;

        this._tabViewPanel.on('show.bs.collapse', function () {
            $('.ogrid-footer-panel-heading').animate({
                backgroundColor: "#E8E8E8"
            }, 500);
            //$('#panel-caret').removeClass('fa-caret-square-o-up').addClass('fa-caret-square-o-down');
            //glyphicon glyphicon-chevron-down
            $('#panel-caret').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        });

        this._tabViewPanel.on('hide.bs.collapse', function () {
            $('.ogrid-footer-panel-heading').animate({
                backgroundColor: "#E8E8E8"
            }, 500);
            $('#panel-caret').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        });

        ogrid.Event.on(ogrid.Event.types.REFRESH_DATA, $.proxy(this._onRefreshData, this));
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));

        this._setupWindowResizeHandler();
    },


    //private methods
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
        var me = this;

        $(window).resize(function () {
            //dynamically assign height of the table, and refresh header row column alignments
            //$('#table').bootstrapTable('resetView');
            var t = $('#ogrid-tab-content .bootstrap-table table');
            t.bootstrapTable('getOptions').height = me._getTableHeight();
            t.bootstrapTable('resetView');
        });
    },

    _onRefreshData: function (evtData) {
        try {
            //console.log('map refresh: ' + JSON.stringify(evtData));
            var data = evtData.message.data;

            //clear map if clear flag is on
            if (!ogrid.isNull(evtData.message.options.clear) && evtData.message.options.clear) {
                this._onClear();
            }
            //load data on new tab
            this.loadData(data, true);
        } catch (e) {
            ogrid.Alert.error(e.message);
        }
    },

    _onClear: function (evtData) {
        this._clear();
    },


    _clear: function() {
        this._tabs.empty();
        this._tabContent.empty();
    },

    _populateTableRows: function(tableId, columns, data) {
        //$('#' + tableId).addClass('no-wrap');

        var t = $('#' + tableId).bootstrapTable( {
            //our geoJson data in its original structure (data attribute is flattened post table creation)
            origData: data,
            data: data,
            classes: 'table table-hover table-condensed',

            reorderableColumns: true,
            maxMovingRows: 5,
            columns: columns,
            height: this._getTableHeight(),
            pagination: true,
            flat: true,

            //toolbar
            search: true,
            showColumns: true,
            showExport: true,
            exportTypes: ['csv', 'excel', 'pdf'],

            showHeatmap: true,
            heatmapOptions: {map: ogrid.App.map()},

            showTilemap: true,
            tilemapOptions: {map: ogrid.App.map()},

            showGraph: true,
            resizable: true
        });

        //add tooltip to Export extension
        $('div.export').attr('title', 'Export');

        //console.log(t.bootstrapTable('getData'));
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

    //public methods

    //loads new data on new tab
    //data is in geojson format
    //convert to use jQuery templates later (using string + now)
    loadData: function(data, activate) {
        var id = ogrid.guid();
        var o = {
            id: id,
            linkId: this._getTabLinkName(id),
            tabId: this._getTabName(id),
            tableId: this._getTableName(id)
        };

        //color based on the same map rendition color
        var c = 'black';
        if (!ogrid.isNull(data.meta.view.options.rendition.color)) {
            c = data.meta.view.options.rendition.color;
        }
        var sp = '&nbsp<i class="fa fa-circle-o" style="color:' + c + '"></i>';

        //controller tab
        $('<li id="' + o.linkId + '" class="ogrid-tab-link"><a href=#' + o.tabId + ' role="tab" data-toggle="tab">' + data.meta.view.displayName +  sp + '</a></li>').appendTo(this._tabs);

        //tab content panel
        var s = '<div id="' + o.tabId + '" class="tab-pane ogrid-table table-responsive">';
        s += '<table id="' + o.tableId + '"></table>';

        //sort later using sortOrder view attribute
        var a=[];
        for (var i in data.meta.view.columns) {
            if (data.meta.view.columns[i].list) {
                //s += '<th>' + data.meta.view.columns[i].displayName + '</th>';
                //build datatables column map at the same time
                a.push( {field: 'properties.' + data.meta.view.columns[i].id, title: data.meta.view.columns[i].displayName, sortable:true} );
            }
        }
        s+= '</div>';
        $(s).appendTo(this._tabContent);

        //populate datatable objects
        this._populateTableRows(o.tableId, a, data.features);
        if (activate) {
            this.activateTab(o.id);
            /*$('#' + o.tabId).addClass('active');
            $('#' + o.linkId).addClass('active');*/
        }

        this._tableRefs.push(o);

        //not needed now
        /*$('#' + o.linkId  + ' a[href="#' + o.tabId + '"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href") // activated tab
            alert(target);
        });*/

        //return tab id
        return o.id;
    },

    activateTab: function(id) {
        $("#ogrid-nav-tabs li").removeClass("active");
        $("#ogrid-tab-content .ogrid-table").removeClass("active");

        $('#' + this._getTabLinkName(id) ).addClass('active');
        $('#' + this._getTabName(id) ).addClass('active');
    },

    //updates data on an existing tab
    updateData: function(data) {

    }





});