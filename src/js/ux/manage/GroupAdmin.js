/*
 * ogrid.GroupAdmin
 *
 * Group Admin UI class
 */

ogrid.GroupAdmin = ogrid.EntityAdmin.extend({
    //private attributes
    _options: {
        postDelete: null,
        postUpdate: null,
        datasets: null
    },
    _container: null,

    //public attributes


    //constructor
    init: function (container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        this._container = container;

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('ogrid-manage-groups');

        this.initTable();

        this._modal = $('#group-edit-modal').modal({show: false});
        $('#ogrid-manage-group-modal-submit').click($.proxy(this._onModalSubmit, this));

    },


    //private methods
    _onModalSubmit: function () {
        var a = new ogrid.Admin('groups');

        //validate later

        if (this._modal.find('input[name="groupId"]').attr('readonly')) {
            //for update
            a.updateItem(this._modal.data('_id'), this._getGroup(), {
                success: $.proxy(this._onSaveSuccess, this),
                error: $.proxy(this._onSaveError, this)
            });
        } else {
            //new
            a.updateItem(null, this._getGroup(), {
                success: $.proxy(this._onSaveSuccess, this),
                error: $.proxy(this._onSaveError, this)
            });
        }
    },

    _getGroup: function () {
        return {
            groupId: this._modal.find('input[name="groupId"]').val(),
            name: this._modal.find('input[name="name"]').val(),
            description: this._modal.find('input[name="description"]').val(),
            enabled: this._modal.find('input[name="enabled"]').prop('checked'),
            isAdmin: this._modal.find('input[name="isAdmin"]').prop('checked'),
            functions: ( this._modal.data('functions') ? this._modal.data('functions') : [] ),
            datasets: ( this._modal.data('datasets') ? this._modal.data('datasets') : [] )
        };
    },

    _onSaveSuccess: function () {
        this._modal.modal('hide');

        //refresh list
        this.refreshGroups();
        if (this._options.postUpdate) {
            this._options.postUpdate();
        }
    },

    _onSaveError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Group save', err, rawErrorData, passThroughData);
    },

    _onDeleteError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Group delete', err, rawErrorData, passThroughData);
    },


    _getMultiPickerFormatter: function (title, name, options) {
        return function (value, row, index) {
            return '<div>' +
                '<select class="selectpicker" data-id="' + JSON.stringify(row._id) + '"' +
                ' data-selection="' + value + '"' +
                ' name="' + name + '"' +
                ' multiple title="' + title + '">' +
                $.map(options, function (v, i) {
                    return '<option>' + v + '</option>';
                }).join() +
                '</select>' +
                '</div>';
        };
    },

    _deleteItem: function (row) {
        ogrid.admin('groups').deleteItem(row._id, {
            success: $.proxy(this._onDeleteSuccess, this),
            error: $.proxy(this._onDeleteError, this)
        });
    },

    _onDeleteSuccess: function () {
        //refresh list
        this.refreshGroups();
        if (this._options.postDelete) {
            this._options.postDelete();
        }
    },

    initTable: function () {
        var me = this;

        var dataTypes = me._options.datasets;
        var accessFormatter = me._getMultiPickerFormatter(
            'Choose functions...',
            'functionsPicker',
            //sample UI security
            [ogrid.SecuredFunctions.ADVANCED_SEARCH, ogrid.SecuredFunctions.MANAGE]
        );

        var dataTypesFormatter = me._getMultiPickerFormatter(
            'Choose data types...',
            'dataTypesPicker',
            $.map(dataTypes, function (v, i) {
                return v.id;
            })
        );

        var viewFormatter = function (data, row, index) {
            return '<div>' +
                '<b>' + row.name + '</b><br>' +
                row.description +
                '</div>';
        };

        var actionFormatter = function (value) {
            return [
                '<a class="update" href="javascript:" title="Update Item"><i class="glyphicon glyphicon-edit"></i></a>',
                '<a class="remove" href="javascript:" title="Delete Item"><i class="glyphicon glyphicon-remove-circle"></i></a>',
            ].join('');
        };

        var actionEvents = {
            'click .update': function (e, value, row) {
                me._showModal($(this).attr('title'), 'groupId', 'name', row);
            },
            'click .remove': function (e, value, row) {
                ogrid.Alert.modalPrompt('Manage Groups', 'Are you sure you want to delete this group?', function (selected) {
                    //'ok' or 'cancel'
                    if (selected === 'ok') {
                        me._deleteItem(row);
                    }
                });
            }
        };

        var pickerEvents = {
            'change .selectpicker': function (e, value, row) {
                //var r = $.extend(true, {}, row);
                if ($(e.target).attr('title').indexOf('functions') > -1) {
                    row.functions = $(e.target).selectpicker('val');
                } else {
                    row.datasets = $(e.target).selectpicker('val');
                }
                ogrid.admin('groups').updateItem(row._id, row, {
                    success: $.proxy(this._onSaveSuccess, this),
                    error: $.proxy(this._onSaveError, this)
                });
            }
        };

        var cols = [
            {field: 'action', align: 'left', valign: 'middle', formatter: actionFormatter, events: actionEvents},
            {field: 'view', title: 'Group Details', formatter: viewFormatter},
            {field: '_id', title: 'Internal ID', visible: false},
            //{field: 'groupId', title: 'ID', visible: false},
            //{field: 'name', title: 'Name', visible: false},
            //{field: 'description', title: 'Description', visible: false},
            {field: 'functions', title: 'Functions', formatter: accessFormatter, events: pickerEvents},
            {field: 'datasets', title: 'Data Types', formatter: dataTypesFormatter, events: pickerEvents},
            //{field: 'enabled', title: 'Enabled', visible: false}
        ];

        $('#ogrid-table-groups').bootstrapTable({
            classes: 'table table-hover table-condensed',

            columns: cols,

            //TODO: make responsive later
            height: $(window).height() - 160,

            //pagination: true,
            toolbar: "#manage-group-toolbar"
        });
        $(window).resize(me._onWindowResize);
        $('.ogrid-manage-groups .create').click(function () {

            me._showModal($(this).text(), 'groupId');
        });
        me.refreshGroups();
    },

    _onWindowResize: function () {
        var options = $('#ogrid-table-groups').bootstrapTable('getOptions');
        $('#ogrid-table-groups').bootstrapTable('refreshOptions',
            $.extend(options, {height: $(window).height() - 160})
        );
        $('#ogrid-table-groups').bootstrapTable('resetView');
    },

    //input1 is the initial element to get focus if 'new'
    //input1 is the element to get focus if 'updating'
    _showModal: function (title, input1, input2, row) {
        var me = this;
        var r = row || {
                groupId: '',
                name: '',
                description: '',
                isAdmin: false,
                enabled: true
            }; // default row value

        //if update, disable ID
        if (row) {
            this._modal.find('input[name="' + input1 + '"]').attr('readonly', true);
            setTimeout(function () {
                me._modal.find('input[name="' + input2 + '"]').focus();
            }, 200);

            this._modal.data('functions', r.functions);
            this._modal.data('datasets', r.datasets);
        } else {
            var id = this._modal.find('input[name="' + input1 + '"]');
            id.removeAttr('readonly');
            setTimeout(function () {
                id.focus();
            }, 200);
            this._modal.data('functions', []);
            this._modal.data('datasets', []);
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


    _getTemplate: function () {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div id="manage-group-toolbar"><div class="form-inline" role="form"><div class="form-group"><button type="button" class="create btn btn-success">New group</button><!--<button type="button" class="btn btn-danger disabled">Delete group</button>--></div></div></div><table id="ogrid-table-groups"></table><div id="group-edit-modal" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div><div class="modal-body"><div class="form-group"><label>ID</label><input type="text" class="form-control" name="groupId" placeholder="ID"></div><div class="form-group"><label>Name</label><input type="text" class="form-control" name="name" placeholder="Name"></div><div class="form-group"><label>Description</label><input type="text" class="form-control" name="description" placeholder="Description"></div><div class="checkbox"><label><input type="checkbox" name="isAdmin"> Is Admin Group</label></div><div class="checkbox"><label><input type="checkbox" name="enabled"> Enabled</label></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button id="ogrid-manage-group-modal-submit" type="button" class="btn btn-primary submit">Submit</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog --></div><!-- /.modal -->';
    },


    _onGroupListSuccess: function (data) {
        this.setData(data);
    },


    _onGroupListError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Group listing', err, rawErrorData, passThroughData);
    },

    _getGroups: function () {
        ogrid.admin("groups").listItems({
            filter: {},
            maxResults: 200,
            success: $.proxy(this._onGroupListSuccess, this),
            error: $.proxy(this._onGroupListError, this)
        });
    },

    //public methods
    setData: function (data) {
        $('#ogrid-table-groups').bootstrapTable('load', data);
        $('#ogrid-table-groups select').each(function () {
            $(this).selectpicker();
            if ($(this).data('selection'))
                $(this).selectpicker('val', $(this).data('selection').split(','));
        });
        //force reset of layout
        this._onWindowResize();
    },

    refreshGroups: function () {
        this._getGroups();
    },

    refreshLayout: function () {
        this._onWindowResize();
    },

    refreshDatasets: function () {
        //get datasets
        var me = this;
        var dsCall = $.ajax(ogrid.Config.service.endpoint + '/datasets');
        dsCall.then(function (data) {
            $('#ogrid-table-groups select[name="dataTypesPicker"] ').each(function () {
                var val = $(this).selectpicker('val');
                $(this).find('option').remove();

                var me = this;
                $.each(data, function (i, v) {
                    $(me).append('<option>' + v.id + '</option>');
                });
                $(this).selectpicker('val', val);
                $(this).selectpicker('refresh');
            });
        });
    }
});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.groupAdmin = function (container, options) {
    return new ogrid.GroupAdmin(container, options);
};