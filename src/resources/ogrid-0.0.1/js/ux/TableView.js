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
            $('.panel-heading').animate({
                backgroundColor: "#515151"
            }, 500);
            //$('#panel-caret').removeClass('fa-caret-square-o-up').addClass('fa-caret-square-o-down');
            //glyphicon glyphicon-chevron-down
            $('#panel-caret').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        });

        this._tabViewPanel.on('hide.bs.collapse', function () {
            $('.panel-heading').animate({
                backgroundColor: "#00B4FF"
            }, 500);
            $('#panel-caret').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        });

        ogrid.Event.on(ogrid.Event.types.REFRESH_DATA, $.proxy(this._onRefreshData, this));
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));


        //temp for testing
        //var id = this.loadData(ogrid.Mock.data.tweet, true);
        //this.loadData(ogrid.Mock.data.weather);
        //this.activateTab(id);
    },


    //private methods
    _onRefreshData: function (evtData) {
        try {
            console.log('map refresh: ' + JSON.stringify(evtData));
            var data = evtData.message;

            //auto-clear grid for now every new data
            this._onClear();

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

        $('#' + tableId).DataTable( {
            "aaData": data,
            "aoColumns": columns,
            "pageLength": 10, //make part of config later
            "responsive": true,
            //"scrollY": "200px",
            "dom": 'Rlfrtip', //does not seem to work
            //"dom": 'ftip',
            "lengthChange": false
            //"deferRender": true
            //"paging": false
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

    //public methods

    //loads new data on new tab
    //data is in geojson format
    loadData: function(data, activate) {
        var id = ogrid.guid();
        var o = {
            id: id,
            linkId: this._getTabLinkName(id),
            tabId: this._getTabName(id),
            tableId: this._getTableName(id)
        };

        //controller tab
        $('<li id="' + o.linkId + '" class="ogrid-tab-link"><a href=#' + o.tabId + ' role="tab" data-toggle="tab">' + data.meta.view.displayName + '</a></li>').appendTo(this._tabs);

        //tab content panel
        var s = '<div id="' + o.tabId + '" class="tab-pane ogrid-table table-responsive">';
        //var s = '<div id="' + o.tabId + '" class="tab-pane ogrid-table">';
        s += '<table id="' + o.tableId +  '" class="table table-hover table-striped table-bordered table-condensed" cellspacing="0" width="100%">';
        //s += '<table id="' + o.tableId +  '" class="display" cellspacing="0" width="100%">';
        s += '<thead>';

        //generate header row
        s += '<tr>';

        //sort later using sortOrder view attribute
        var a=[];
        for (var i in data.meta.view.columns) {
            if (data.meta.view.columns[i].list) {
                s += '<th>' + data.meta.view.columns[i].displayName + '</th>';
                //build datatables column map at the same time
                a.push({ mDataProp: "properties." + data.meta.view.columns[i].id});
            }
        }

        s += '</tr>';
        $(s).appendTo(this._tabContent);

        //populate datatable objects
        this._populateTableRows(o.tableId, a, data.features);
        if (activate) {
            this.activateTab(o.id);
            /*$('#' + o.tabId).addClass('active');
            $('#' + o.linkId).addClass('active');*/
        }

        this._tableRefs.push(o);

        //return tab id
        return o.id;
    },

    activateTab: function(id) {
        $(".ogrid-tab-link").find(".active").removeClass("active");
        $(".ogrid-table").find(".active").removeClass("active");

        $('#' + this._getTabLinkName(id) ).addClass('active');
        $('#' + this._getTabName(id) ).addClass('active');
    },

    //updates data on an existing tab
    updateData: function(data) {

    }


});