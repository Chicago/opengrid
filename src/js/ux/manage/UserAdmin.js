/*
 * ogrid.UserAdmin
 *
 * UserAdmin UI class
 */

ogrid.UserAdmin = ogrid.EntityAdmin.extend({
    //private attributes
    _options:{},
    _container: null,

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
        this._container.addClass('ogrid-manage-users');

        this._initTable();

        this._modal = $('#user-edit-modal').modal({show: false});
        $('#ogrid-manage-user-modal-submit').click($.proxy(this._onModalSubmit, this));
    },



    //private methods
    _onModalSubmit: function() {
        var a = new ogrid.Admin('users');

        //validate later

        if (this._modal.find('input[name="userId"]').attr('readonly')) {
            //for update
            a.updateItem(this._modal.data('_id'), this._getUser(), {
                success: $.proxy(this._onSaveSuccess, this),
                error: $.proxy(this._onSaveError, this)
            });
        } else {
            //new
            a.updateItem(null, this._getUser(), {
                success: $.proxy(this._onSaveSuccess, this),
                error: $.proxy(this._onSaveError, this)
            });
        }
    },

    _getUser: function() {
        return {
            userId: this._modal.find('input[name="userId"]').val(),
            password: this._modal.find('input[name="password"]').val(),
            firstName:  this._modal.find('input[name="firstName"]').val(),
            lastName:  this._modal.find('input[name="lastName"]').val(),
            groups: ( this._modal.data('groups') ? this._modal.data('groups') : [] )
        };
    },

    _onSaveSuccess: function() {
        this._modal.modal('hide');

        //refresh list
        this.refreshUsers();
    },

    _onSaveError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('User save', err, rawErrorData, passThroughData);
    },


    _getMultiPickerFormatter: function(title, options) {
        return function(value, row, index) {
            return '<div>' +
                '<select class="selectpicker" data-id="' + JSON.stringify(row._id)  + '"' +
                ' data-selection="' + value  + '"' +
                ' multiple title="' + title + '">' +
                $.map(options, function(v, i) {
                    return '<option>' + v + '</option>';
                }).join() +
                '</select>' +
                '</div>';
        };
    },

    _deleteItem: function(row) {
        ogrid.admin('users').deleteItem(row._id, {
            success: $.proxy(this._onSaveSuccess, this),
            error: $.proxy(this._onDeleteError, this)
        });
    },

    _onDeleteError:  function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('User delete', err, rawErrorData, passThroughData);
    },


    _onGroupListError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Group listing', err, rawErrorData, passThroughData);
    },

    _initTable: function() {
        //get groups
        ogrid.admin("groups").listItems({
            filter: {},
            maxResults: 200,
            success: $.proxy(this._initTableContinue,this),
            error: $.proxy(this._onGroupListError, this)
        });
    },

    _initTableContinue: function(groups) {
        var me = this;
        var a = $.map(groups, function(v, i) {
            return v.groupId;
        });
        var groupsFormatter = this._getMultiPickerFormatter(
            'Choose groups...',
            a
        );

        var actionFormatter = function(value) {
            return [
                '<a class="update" href="javascript:" title="Update Item"><i class="glyphicon glyphicon-edit"></i></a>',
                '<a class="remove" href="javascript:" title="Delete Item"><i class="glyphicon glyphicon-remove-circle"></i></a>',
            ].join('');
        };

        var actionEvents = {
            'click .update': function (e, value, row) {
                me._showModal($(this).attr('title'), 'userId', 'password', row);
            },
            'click .remove': function (e, value, row) {
                ogrid.Alert.modalPrompt('Manage Users', 'All queries saved by this users will deleted as well. Continue?', function(selected) {
                    //'ok' or 'cancel'
                    if (selected === 'ok') {
                        me._deleteItem(row);
                    }
                });
            }
        };

        var pickerEvents = {
            'change .selectpicker': function (e, value, row) {
                row.groups = $(e.target).selectpicker('val');
                ogrid.admin('users').updateItem(row._id, row, {
                    success: $.proxy(this._onSaveSuccess, this),
                    error: $.proxy(this._onSaveError, this)
                });
            }
        };

        var cols = [
            {field: 'action', align: 'left', valign: 'middle', formatter: actionFormatter, events: actionEvents, width: 50},
            {field: '_id', title: 'Internal ID', visible: false},
            {field: 'userId', title: 'User ID'},
            {field: 'firstName', title: 'First Name'},
            {field: 'lastName', title: 'Last Name'},
            {field: 'groups', title: 'Groups', formatter: groupsFormatter, events: pickerEvents}
        ];

        $('#ogrid-table-users').bootstrapTable({
            classes: 'table table-hover table-condensed',

            columns: cols,

            //TODO: make responsive later
            //height: $(window).height() - 160,
            //pagination: true,
            toolbar: "#manage-user-toolbar"
        });

        $(window).resize(this._onWindowResize);

        $('.ogrid-manage-users .create').click(function () {
            me._showModal($(this).text(), 'userId');
        });

        this.refreshUsers();
    },

    _onWindowResize: function() {
        var options = $('#ogrid-table-users').bootstrapTable('getOptions');
        $('#ogrid-table-users').bootstrapTable('refreshOptions',
            $.extend(options, {height: $(window).height() - 160})
        );
        $('#ogrid-table-users').bootstrapTable('resetView');
    },

    //input1 is the initial element to get focus if 'new'
    //input1 is the element to get focus if 'updating'
    _showModal: function(title, input1, input2, row) {
        var me = this;
        var r = row || {
                userId: '',
                password: '',
                firstName: '',
                lastName: ''
            }; // default row value

        //if update, disable ID
        if (row) {
            this._modal.find('input[name="' + input1 + '"]').attr('readonly', true);
            setTimeout(function() {
                me._modal.find('input[name="' + input2 + '"]').focus();
            }, 200);

            this._modal.data('groups', r.groups);
        } else {
            var id = this._modal.find('input[name="' + input1 + '"]');
            id.removeAttr('readonly');
            setTimeout(function() {
                id.focus();
            }, 200);
            this._modal.data('groups', []);
        }

        this._modal.data('_id', r._id);
        this._modal.find('.modal-title').text(title);
        for (var name in r) {
            var o = this._modal.find('input[name="' + name + '"]');
            if (o.attr('type') === 'checkbox') {
                o.prop('checked', r[name]);
            } else {
                o.val(r[name]);
            }
        }
        this._modal.modal('show');
    },


    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div id="manage-user-toolbar"><div class="form-inline" role="form"><div class="form-group"><button type="button" class="create btn btn-success">New user</button></div></div></div><table id="ogrid-table-users"></table><div id="user-edit-modal" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body"><div class="form-group"><label>User ID</label><input type="text" class="form-control" name="userId" placeholder="User ID"></div><div class="form-group"><label>Password</label><input type="password" class="form-control" name="password" placeholder="Password"></div><div class="form-group"><label>First Name</label><input type="text" class="form-control" name="firstName" placeholder="First Name"></div><div class="form-group"><label>Last Name</label><input type="text" class="form-control" name="lastName" placeholder="Last Name"></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button id="ogrid-manage-user-modal-submit" type="button" class="btn btn-primary submit">Submit</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal -->';
    },


    _onUserListSuccess: function(data) {
        this.setData(data);
    },

    _onUserListError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('User listing', err, rawErrorData, passThroughData);
    },

    _getUsers: function() {
        ogrid.admin("users").listItems({
            filter: {},
            maxResults: 1000,
            success: $.proxy(this._onUserListSuccess, this),
            error: $.proxy(this._onUserListError, this)
        });
    },

    //public methods
    setData: function(data) {
        $('#ogrid-table-users').bootstrapTable('load', data);
        $('#ogrid-table-users select').each(function () {
            $(this).selectpicker();
            if ($(this).data('selection'))
                $(this).selectpicker('val', $(this).data('selection').split(','));
        });

        //force reset of layout
        this._onWindowResize();
    },

    refreshUsers: function() {
        this._getUsers();
    },

    refreshGroups: function() {
        //get groups
        ogrid.admin("groups").listItems({
            filter: {},
            maxResults: 200,
            success: function(data) {
                $('#ogrid-table-users .selectpicker').each(function () {
                    var val = $(this).selectpicker('val');
                    $(this).find('option').remove();

                    var me = this;
                    $.each(data, function(i, v) {
                        $(me).append('<option>' + v.groupId + '</option>');
                    });
                    $(this).selectpicker('val', val);
                    $(this).selectpicker('refresh');
                });
            },
            error: $.proxy(this._onGroupListError, this)
        });
    },

    refreshLayout: function() {
        this._onWindowResize();
    }
});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.userAdmin = function (container, options) {
    return new ogrid.UserAdmin(container, options);
};