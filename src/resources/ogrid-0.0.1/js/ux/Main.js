/*
 * ogrid.Main
 *
 * Main application entry point class
 */


ogrid.Main = ogrid.Class.extend({
    //private attributes
    _options:{},
    _map: null,
    _qs: null,
    _cb: null,
    _tv: null,
    _adv: null,

    //public attributes


    //constructor
    init: function(options) {
        //if (options)
        //    ogrid.mixin(this._options);

        //init alert
        ogrid.Alert.init(options.alert_div, options.alert_txt);

        //init map
        this._map = new ogrid.Map(
            options.map,

            //map options
            ogrid.Config.map
        );

        //init quick search
        this._qs = new ogrid.QSearch(
            options.qsearch_div,
            options.qsearch_input,
            options.qsearch_button);

        //init commandbar
        this._cb = new ogrid.CommandBar(options.commandbar);

        //init table view
        this._tv = new ogrid.TableView($('#tableview'), $('#ogrid-nav-tabs'), $('#ogrid-tab-content'));

        //nav menu tweaks
        this._setNavBarBehavior();

        //init advanced search
        this._adv = new ogrid.AdvancedSearch();

    },


    //private methods
    _setNavBarBehavior: function() {
        //Stack menu when collapsed
        $('#ogrid-menu').on('show.bs.collapse', function() {
            $('#ogrid-search').addClass('col-xs-7');
        });

        //Unstack menu when not collapsed
        $('#ogrid-menu').on('hide.bs.collapse', function() {
            $('#ogrid-search').removeClass('col-xs-7');
        });
    },

    //public methods
    run: function() {
        //do nothing at the moment
    },

    map: function() {
        return this._map;
    }
});