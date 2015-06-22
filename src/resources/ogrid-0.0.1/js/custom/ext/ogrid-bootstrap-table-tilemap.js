/**
 * @author rladines
 */

(function ($) {
    'use strict';

    var TILEMAP_AREA = {
        zip: 'By Zipcode',
        none: 'None'
    };

    $.extend($.fn.bootstrapTable.defaults, {
        showTilemap: false,
        tilemapArea: ['zip', 'none'],
        tilemapOptions: {}
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initToolbar = BootstrapTable.prototype.initToolbar;

    BootstrapTable.prototype.initToolbar = function () {
        this.showToolbar = true;

        _initToolbar.apply(this, Array.prototype.slice.apply(arguments));

        if (this.options.showTilemap) {
            var that = this,
                $btnGroup = this.$toolbar.find('>.btn-group'),
                $div = $btnGroup.find('div.tilemap');

            if (!$div.length) {
                $div = $([
                    '<div class="tilemap btn-group" title="Tile Map">',
                     '<button class="btn btn-default dropdown-toggle" ' +
                    'data-toggle="dropdown" type="button">',
                    '<i class="glyphicon glyphicon-equalizer"></i> ',
                    '<span class="caret"></span>',
                    '</button>',
                    '<ul class="dropdown-menu" role="menu">',
                    '</ul>',
                    '</div>'].join('')).appendTo($btnGroup);

                var $menu = $div.find('.dropdown-menu'),
                    tilemapArea = this.options.tilemapArea;

                if (typeof this.options.tilemapArea === 'string') {
                    var types = this.options.tilemapArea.slice(1, -1).replace(/ /g, '').split(',');

                    tilemapArea = [];
                    $.each(types, function (i, value) {
                        tilemapArea.push(value.slice(1, -1));
                    });
                }
                $.each(tilemapArea, function (i, type) {
                    if (TILEMAP_AREA.hasOwnProperty(type)) {
                        //default selection to 'none'
                        var sel = (type === 'none') ? 'checked' : '';

                        $menu.append(['<li data-type="' + type + '">',
                            '<label><input type="radio" name="optTileMap"',
                            sel,
                            '>',
                            TILEMAP_AREA[type],
                            '</label>',
                            '</li>'].join(''));
                    }
                });

                $menu.find('li').click(function () {
                    console.log('tilemap ' + $(this).data('type'));
                    try {
                         var type = $(this).data('type');
                        var m = (type === 'none' ? 'Clearing tile map...' : 'Generating tile map...');

                        ogrid.Alert.busy(m, this, function() {
                            //<that> points to our parent BS table
                            //invoke map to generate tile map
                            if (that.options.tilemapOptions.map) {
                                var a = null;
                                var prevTilemapIds = null;

                                if (that.tilemapData && that.tilemapData.prevTilemapIds)
                                    prevTilemapIds = that.tilemapData.prevTilemapIds;
                                if (type !== 'none') {
                                    a = _getTileMapData(that.options.origData);
                                }

                                //that.options.tilemapOptions.map.addTileMapLayerFromData(a);
                                prevTilemapIds = that.options.heatmapOptions.map.addTileMapLayerFromData(a, prevTilemapIds);
                                that.tilemapData = {prevTilemapIds: prevTilemapIds};
                                ogrid.Alert.idle();
                            } else {
                                throw ogrid.error('Tile Map Error', 'Map parameter is not properly initialized');
                            }
                        });
                    } catch (e) {
                        ogrid.Alert.error(e.message);
                        ogrid.Alert.idle();
                    }

                });
            }
        }
    };

    var _getTileMapData = function(geoJsonFeatures) {
        var a = [];
        $.each(geoJsonFeatures, function( index, value ) {
            a.push(L.latLng( value.geometry.coordinates[1], value.geometry.coordinates[0]));
        });
        return a;
    };
})(jQuery);
