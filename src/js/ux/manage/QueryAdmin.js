/*
 * ogrid.QueryAdmin
 *
 * QueryAdmin UI class for managing queries
 */

ogrid.QueryAdmin = ogrid.EntityAdmin.extend({
    //private attributes
    _options:{
        //event handler when play button is clicked
        //row data is passed
        onOpen: null,
        onPlay: null,
        postDelete: null
    },
    _container: null,
    _user: null,

    //public attributes


    //constructor
    init: function(container, currentUser, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        this._container = container;

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('ogrid-manage-queries');
        this._user = currentUser;

        this._initTable();
    },

    //private methods
     _deleteItem: function(row) {
        ogrid.admin('queries').deleteItem(row._id, {
            success: $.proxy(this._onSaveSuccess, this),
            error: $.proxy(this._onDeleteError, this)
        });
    },

    _onDeleteError:  function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Query delete', err, rawErrorData, passThroughData);
    },

    _onSaveSuccess: function() {
        //refresh list
        this.refreshQueries();
        if (this._options.postDelete) {
            this._options.postDelete();
        }
    },


    _initTable: function() {
        var me = this;
        var actionFormatter = function(value, row) {
            var a = [];
            var isOwned = ((row.owner) === me._user.getProfile().loginId);

            a.push('<a class="play" href="#" title="Submit"><i class="glyphicon glyphicon-play-circle"></i></a>&nbsp');
            if (isOwned) {
                //can only share and delete if we're the owner
                a.push('<a class="share" href="#" title="Share"><i class="glyphicon glyphicon-share"></i></a>&nbsp');
                a.push('<a class="remove" href="#" title="Delete"><i class="glyphicon glyphicon-remove-circle"></i></a>');
            }
            return a.join('');
        };
        var actionEvents = {
            'click .play': function (e, value, row) {
                //me._showModal($(this).attr('title'), 'userId', 'password', row);
                if (me._options.onPlay) {
                    me._options.onPlay(row);
                }
            },
            'click .share': function (e, value, row) {
                alert('This feature is not yet implemented.');
            },
            'click .remove': function (e, value, row) {
                ogrid.Alert.modalPrompt('Manage Queries', 'Are you sure you want to delete this query?', function(selected) {
                    //'ok' or 'cancel'
                    if (selected === 'ok') {
                        me._deleteItem(row);
                    }
                });
            }
        };

        var nameFormatter = function(value, row, index) {
            //display 'Shared' icon if current user is not the owner of the query
            var sharedIcon = '<i class="fa fa-users" title="Shared with you or one of your groups by ' + row.owner + '"></i>';
            return '<a class="open" href="#" title="Open query">' +
                    value + '&nbsp' +
                    ( ((row.owner) !== me._user.getProfile().loginId) ? sharedIcon : '' ) +
                    '</a>';
        };

        var nameEvents = {
            'click .open': function (e, value, row) {
                //me._showModal($(this).attr('title'), 'userId', 'password', row);
                if (me._options.onOpen) {
                    me._options.onOpen(row);
                }
            }
        };

        var cols = [
            {field: '_id', title: 'Internal ID', visible: false},
            {field: 'name', title: 'Query Name', formatter: nameFormatter, events: nameEvents},
            {field: 'action', align: 'left', valign: 'center', formatter: actionFormatter, events: actionEvents},
        ];

        $('#ogrid-table-queries').bootstrapTable({
            classes: 'table table-hover table-condensed',
            columns: cols,

            //TODO: make responsive later
            height: $(window).height() - 160
            //pagination: true,
            //toolbar: "#manage-user-toolbar"
        });

        $(window).resize(this._onWindowResize);
     },

    _onWindowResize: function() {
        var options = $('#ogrid-table-queries').bootstrapTable('getOptions');
        $('#ogrid-table-queries').bootstrapTable('refreshOptions',
            $.extend(options, {height: $(window).height() - 160})
        );
        $('#ogrid-table-queries').bootstrapTable('resetView');
    },

    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<table id="ogrid-table-queries"></table>';
    },


    _onQueriesListSuccess: function(data) {
        this.setData(data);
    },


    _onQueriesListError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('User listing', err, rawErrorData, passThroughData);
    },




    _getQueryFilter: function() {
        //queries that the logged in user owns or shared with him/his directly or with one of his groups

        return {
            $or: [
                {"owner": this._user.getProfile().loginId},
                {"sharedWith.users": {$in: [this._user.getProfile().loginId]}},
                //{"sharedWith.groups": { $in: ["opengrid_users","opengrid_users_L2"]} }
                {"sharedWith.groups": {$in: this._user.getProfile().roles }}
            ]
        };
    },

    _getQueries: function() {
        ogrid.admin("queries").listItems({
            filter: this._getQueryFilter(),
            maxResults: 500, //add to config later
            success: $.proxy(this._onQueriesListSuccess, this),
            error: $.proxy(this._onQueriesListSuccess, this)
        });
    },

    //public methods
    setData: function(data) {
        $('#ogrid-table-queries').bootstrapTable('load', data);
        $('#ogrid-table-queries').bootstrapTable('resetView');
    },

    refreshQueries: function() {
        this._getQueries();
    },


    setUser: function(user) {
        //leaves it to caller to refresh the list
        this._user = user;
    }
});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.queryAdmin = function (container, currentUserId, options) {
    return new ogrid.QueryAdmin(container,currentUserId,  options);
};