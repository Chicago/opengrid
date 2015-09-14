/**
 * @author rladines
 */

(function ($) {
    'use strict';

    var REFRESH_ACTION = {
        //dynamically generated
        pause: 'Pause',
        resume: 'Resume',
        now: 'Refresh now'
    };

    $.extend($.fn.bootstrapTable.defaults, {
        showAutorefresh: false,
        refreshActions: ['pause', 'resume', 'now'],
        refreshOptions: {}
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar;

    BootstrapTable.prototype.initToolbar = function () {
        this.showToolbar = true;

        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (this.options.showAutorefresh) {
            var that = this,
                $btnGroup = this.$toolbar.find('>.btn-group'),
                $div = $btnGroup.find('div.autorefresh');

            if (!$div.length) {
                $div = $([
                    '<div class="autorefresh btn-group" title="Auto-refresh">',
                    '<button class="btn btn-default dropdown-toggle" ' +
                    'data-toggle="dropdown" type="button">',
                    '<i class="fa fa-refresh"></i> ',
                    '<span class="caret"></span>',
                    '</button>',
                    '<ul class="dropdown-menu" role="menu">',
                    '</ul>',
                    '</div>'].join('')).appendTo($btnGroup);

                var $menu = $div.find('.dropdown-menu'),
                    actions = this.options.refreshActions;

                if (typeof this.options.graphBy === 'string') {
                    var types = this.options.refreshActions.slice(1, -1).replace(/ /g, '').split(',');

                    actions = [];
                    $.each(types, function (i, value) {
                        actions.push(value.slice(1, -1));
                    });
                }
                $.each(actions, function (i, type) {
                    if (REFRESH_ACTION.hasOwnProperty(type)) {
                        $menu.append(['<li data-type="' + type + '">',
                            '<a href="javascript:void(0)">',
                            REFRESH_ACTION[type],
                            '</a>',
                            '</li>'].join(''));
                    }
                });

                $menu.find('li').click(function () {
                    /*that.$el.tableExport($.extend({}, that.options.heatmapOptions, {
                        type: $(this).data('type'),
                        escape: false
                    }));*/

                    //put some code here to invoke heat map
                });
            }
        }
    };
})(jQuery);
