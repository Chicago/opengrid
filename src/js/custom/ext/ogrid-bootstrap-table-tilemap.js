/**
 * @author rladines
 */

(function ($) {
    'use strict';

    /*var TILEMAP_AREA = {
        zip: 'By Zipcode',
        none: 'None'
    };*/

    $.extend($.fn.bootstrapTable.defaults, {
        showTilemap: false,
        //tilemapArea: ['zip', 'none'],
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

                if(ogrid.Config.tileMapHide) {
                    $div.addClass('hide');
                } else {
                    $div.removeClass('hide');
                }

                //tilemapOptions.map
                //tilemapOptions.tileAreas

                var $menu = $div.find('.dropdown-menu'),
                    tilemapAreas = this.options.tilemapOptions.tileAreas,
                    areaKeys = $.map(this.options.tilemapOptions.tileAreas, function (v, i) {
                    return i;
                });

                $.each(tilemapAreas, function (i, type) {
                    //default selection to 'none'
                    var sel = (i === 'none') ? 'checked' : '';

                    $menu.append(['<li data-type="' + i + '">',
                        '<label><input type="radio" name="optTileMap"',
                        sel,
                        '>',
                        type.label,
                        '</label>',
                        '</li>'].join(''));
                });

                //we need to handle these events to keep in sync with the map display
                ogrid.Event.on(ogrid.Event.types.MAP_OVERLAY_ADD, function(e) {
                    var layerId = e.message;
                    console.log('Tilemap: Layer added ' + layerId);
                });

                ogrid.Event.on(ogrid.Event.types.MAP_OVERLAY_REMOVE, function(e) {
                    var layerId = e.message;
                    console.log('Tilemap: Layer removed ' + layerId);
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
                                var prevTilemapObject = {};

                                if (that.tilemapData && !$.isEmptyObject(that.tilemapData.prevTilemapObject))
                                    prevTilemapObject = that.tilemapData.prevTilemapObject;
                                if (type !== 'none') {
                                    a = _getTileMapData(that.options.origData.features);
                                }

                                try {
                                    //pass rendition options to map as well, in case it needs to use those attributes
                                    prevTilemapObject = that.options.tilemapOptions.map.addTileMapLayerFromData(
                                        that.options.origData.meta.view,
                                        a,
                                        prevTilemapObject,

                                        //shapemap as specified on config file
                                        tilemapAreas[type].shapeMap
                                    );
                                    that.tilemapData = {prevTilemapObject: prevTilemapObject};
                                } catch (e) {
                                    ogrid.Alert.error(e.message);
                                } finally {
                                    ogrid.Alert.idle();
                                }
                            } else {
                                throw ogrid.error('Tile Map Error', 'Map parameter is not properly initialized');
                            }
                        });
                    } catch (e) {
                        ogrid.Alert.error(e.message);
                        ogrid.Alert.idle();
                    }

                });

                var _getTileMapData = function(geoJsonFeatures) {
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
