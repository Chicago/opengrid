/**
 * @author rladines
 */

(function ($) {
    'use strict';

       $.extend($.fn.bootstrapTable.defaults, {
        showGraph: false,
        // 'json', 'xml', 'png', 'csv', 'txt', 'sql', 'doc', 'excel', 'powerpoint', 'pdf'
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
                    '</button>',
                    '</div>'].join('')).appendTo($btnGroup);

                var $menu = $div.find('.dropdown-menu'),
                    groupFields = this.options.graphOptions.groupFields;

                /*$.each(groupFields, function (i, type) {
                    $menu.append(['<li data-type="' + type.name + '">',
                        '<a href="javascript:void(0)">',
                        type.label,
                        '</a>',
                        '</li>'].join(''));
                });*/

                var groupByFields=null;

                if (that.options.graphOptions.groupFields && that.options.graphOptions.groupFields.length > 0) {
                    groupByFields = that.options.graphOptions.groupFields;
                }
                $div.find('button').click(function () {
                    //var fieldDisplayName = _getGroupField(that.options.graphOptions.groupFields, $(this).data('type')).label;
                    var g = new ogrid.Chart(
                        $('#table-chart'), {
                            data: that.options.origData,
                            //groupBy: $(this).data('type'),
                            //title: that.options.origData.meta.view.displayName + ' Data Grouped by ' + fieldDisplayName,

                            //TODO: use the creation time field as defined on the dataset
                            //dateField: 'when.shardtime',
                            xAxisField: that.options.graphOptions.xAxisField,
                            xAxisLabel: that.options.graphOptions.xAxisLabel,
                            dataName: that.options.origData.meta.view.displayName,
                            groupByFields: groupByFields
                        }
                    );
                    g.showModal();
                });

                var _getGroupField = function(groupFields, id) {
                    var o;
                    $.each(groupFields, function( index, type ) {
                        if (type.name === id) {
                            o = type;
                            return false;
                        }
                    });
                    return o;
                };
            }
        }
    };
})(jQuery);
