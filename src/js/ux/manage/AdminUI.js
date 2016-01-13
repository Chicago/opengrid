/*
 * ogrid.AdminUI
 *
 * UI for admin pages
 */


ogrid.AdminUI = ogrid.Class.extend({
    //private attributes
    _options:{
        datasets: null
    },
    _container: null,
    _groupAdmin: null,
    _userAdmin: null,

    //public attributes


    //constructor
    init: function(container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._container = container;

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('ogrid-admin-ui');

        this._groupAdmin = new ogrid.GroupAdmin($('#ogrid-manage-groups'),{
            postDelete: $.proxy(this._postGroupUpdate, this),
            postUpdate: $.proxy(this._postGroupUpdate, this),
            datasets: this._options.datasets
        });
        this._groupAdmin.refreshGroups();

        this._userAdmin = new ogrid.UserAdmin($('#ogrid-manage-users'));

        var me = this;

        $('.ogrid-admin-ui a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            //fix layout of tabs (height of table) switching tabs
            if ($(e.target).attr('href') === '#ogrid-manage-groups')
                me._groupAdmin.refreshLayout();
            else
                me._userAdmin.refreshLayout();
        });

        //subscribe to applicable opengrid client events
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));
        ogrid.Event.on(ogrid.Event.types.LOGGED_IN, $.proxy(this._onLoggedIn, this));
    },

    _onLoggedIn: function(e) {
        //this._groupAdmin.refreshGroups();
        //this._groupAdmin.refreshDatasets();
        this._groupAdmin.initTable();
    },

    _onClear: function() {
        //set active tab to Build Query
        $('.ogrid-admin-ui a[href="#ogrid-manage-groups"]').tab('show');
    },

    _postGroupUpdate: function() {
        //refresh users panel when group is deleted
        this._userAdmin.refreshGroups();
    },


    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div id="ogrid-admin-ui-body" class="panel-body"><ul id="ogrid-adv-tabs" class="nav nav-tabs" role="tablist"><li class="active"><a  href="#ogrid-manage-groups" role="tab" data-toggle="tab">Manage Groups</a></li><li><a href="#ogrid-manage-users" role="tab" data-toggle="tab">Manage Users</a></li></ul><div id="ogrid-manage-content" class="tab-content"><div class="tab-pane active" id="ogrid-manage-groups"></div><div class="tab-pane" id="ogrid-manage-users"></div></div></div>';
    }


    //private methods


    //public methods

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.adminUI = function (container, options) {
    return new ogrid.AdminUI(container, options);
};