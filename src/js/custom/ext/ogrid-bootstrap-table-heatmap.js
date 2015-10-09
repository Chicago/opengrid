/**
 * @author rladines
 */

(function ($) {
    'use strict';

    //populate this from Map class's supported heatmap types later
    var HEATMAP_STYLE = {
        rainbow: ' Rainbow',
        thermal: ' Thermal',
        wrb: ' White/Red/Blue',
        none: ' None'
    };

    $.extend($.fn.bootstrapTable.defaults, {
        showHeatmap: false,
        heatmapStyles: ['rainbow', 'thermal', 'wrb', 'none'],
        heatmapOptions: {
            map: null //pointer to our OGrid.Map object
        }
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar;

    BootstrapTable.prototype.initToolbar = function () {
        this.showToolbar = true;

        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (this.options.showHeatmap) {
            var that = this,
                $btnGroup = this.$toolbar.find('>.btn-group'),
                $div = $btnGroup.find('div.heatmap');

            if (!$div.length) {
                $div = $([
                    '<div class="heatmap btn-group" title="Heat Map">',
                    '<button class="btn btn-default dropdown-toggle" ' +
                    'data-toggle="dropdown" type="button">',
                    '<i class="glyphicon glyphicon-fire"></i> ',
                    '<span class="caret"></span>',
                    '</button>',
                    '<ul class="dropdown-menu dropdown-menu-form" role="menu">',
                    '</ul>',
                    '</div>'].join('')).appendTo($btnGroup);

                var $menu = $div.find('.dropdown-menu'),
                    heatmapStyles = this.options.heatmapStyles;

                if (typeof this.options.heatmapStyles === 'string') {
                    var types = this.options.heatmapStyles.slice(1, -1).replace(/ /g, '').split(',');

                    heatmapStyles = [];
                    $.each(types, function (i, value) {
                        heatmapStyles.push(value.slice(1, -1));
                    });
                }
                $.each(heatmapStyles, function (i, type) {
                    if (HEATMAP_STYLE.hasOwnProperty(type)) {
                        //default selection to 'none'
                        var sel = (type === 'none') ? 'checked' : '';

                        $menu.append(['<li data-type="' + type + '">',
                            '<label><input type="radio" name="optHeatMap"',
                            sel,
                            '>',
                            HEATMAP_STYLE[type],
                            '</label>',
                            '</li>'].join(''));
                    }
                });

                //we need to handle these events to keep in sync with the map display
                ogrid.Event.on(ogrid.Event.types.MAP_OVERLAY_ADD, function(e) {
                    var layerId = e.message;
                    if (that.heatmapData && that.heatmapData.prevHeatmapId && (layerId===that.heatmapData.prevHeatmapId)) {
                        console.log('Heatmap: Layer added ' + layerId);
                    }
                });

                ogrid.Event.on(ogrid.Event.types.MAP_OVERLAY_REMOVE, function(e) {
                    var layerId = e.message;
                    if (that.heatmapData && that.heatmapData.prevHeatmapId && (layerId===that.heatmapData.prevHeatmapId)) {
                        console.log('Heatmap: Layer removed ' + layerId);
                    }
                });

                $menu.find('li').click(function () {
                    try {
                        var type = $(this).data('type');
                        //<that> points to our parent BS table
                         //invoke map to generate heat map
                        if (that.options.heatmapOptions.map) {

                            var a = null;
                            var prevHeatmapId=null;

                            if (that.heatmapData && that.heatmapData.prevHeatmapId)
                                prevHeatmapId = that.heatmapData.prevHeatmapId;
                            if (type !== 'none') {
                                a = _getHeatMapData(that.options.origData.features);
                            }

                            //pass rendition options to map as well, in case it needs to use those attributes
                            prevHeatmapId = that.options.heatmapOptions.map.addHeatMapLayerFromData(that.options.origData.meta.view, prevHeatmapId, a, type);
                            that.heatmapData = {prevHeatmapId: prevHeatmapId};

                        } else {
                            throw ogrid.error('Heat Map Error', 'Map parameter is not properly initialized');
                        }
                    } catch (e) {
                        ogrid.Alert.error(e.message);
                    }

                });

                var _getHeatMapData = function(geoJsonFeatures) {
                    var a = [];
                    $.each(geoJsonFeatures, function( index, value ) {
                        a.push(L.latLng( value.geometry.coordinates[1], value.geometry.coordinates[0]));
                    });
                    return a;
                };
            }
        }
    };

})(jQuery);
