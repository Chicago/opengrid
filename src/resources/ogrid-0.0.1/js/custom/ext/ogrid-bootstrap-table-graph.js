/**
 * @author rladines
 */

(function ($) {
    'use strict';

    var GRAPH_BY = {
        //dynamically generated
        grp1: 'Group field 1',
        grp2: 'Group field 2'
    };

    $.extend($.fn.bootstrapTable.defaults, {
        showGraph: false,
        // 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'powerpoint', 'pdf'
        graphBy: ['grp1', 'grp2'],
        graphOptions: {}
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar;

    BootstrapTable.prototype.initToolbar = function () {
        this.showToolbar = true;

        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (this.options.showGraph) {
            var that = this,
                $btnGroup = this.$toolbar.find('>.btn-group'),
                $div = $btnGroup.find('div.graph');

            if (!$div.length) {
                $div = $([
                    '<div class="graph btn-group" title="Graph">',
                    '<button class="btn btn-default dropdown-toggle" ' +
                    'data-toggle="dropdown" type="button">',
                    '<i class="fa fa-pie-chart"></i> ',
                    '<span class="caret"></span>',
                    '</button>',
                    '<ul class="dropdown-menu" role="menu">',
                    '</ul>',
                    '</div>'].join('')).appendTo($btnGroup);

                var $menu = $div.find('.dropdown-menu'),
                    graphBy = this.options.graphBy;

                if (typeof this.options.graphBy === 'string') {
                    var types = this.options.graphBy.slice(1, -1).replace(/ /g, '').split(',');

                    graphBy = [];
                    $.each(types, function (i, value) {
                        graphBy.push(value.slice(1, -1));
                    });
                }
                $.each(graphBy, function (i, type) {
                    if (GRAPH_BY.hasOwnProperty(type)) {
                        $menu.append(['<li data-type="' + type + '">',
                            '<a href="javascript:void(0)">',
                            GRAPH_BY[type],
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
