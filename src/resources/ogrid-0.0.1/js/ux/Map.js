/*
 * ogrid.Map
 *
 * Map UX component
 */

ogrid.Map = ogrid.Class.extend({
    //private attributes
    _mapContainer: null,
    _map: null,
    _baseLayer: null,

    _options: {
            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [
                {
                    text: 'Export to PDF',
                    callback: $.proxy(this._exportToPDF, this)
                }
            ] },

    _heatmapTypes: {},
    _zipShapeMap: null,

    //public attributes


    //constructor
    init: function(mapContainer, options) {
        if (options) {
            //ogrid.setOptions(options);
            this._options = $.extend(this._options, options);
        }
        this._mapContainer = mapContainer;

        this._options.contextmenuItems[0].callback = $.proxy(this._exportToPDF, this);
        this._map = L.map(this._mapContainer.attr('id'), this._options);

        //try other base maps later
        this._baseLayer = L.esri.tiledMapLayer(this._options.baseMapUrl, {});
        this._map.addLayer(this._baseLayer);

        //subscribe to applicable opengrid client events
        ogrid.Event.on(ogrid.Event.types.REFRESH_DATA, $.proxy(this._onRefreshData, this));
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));

        /*new L.Control.Button({
                'text': 'MyButton',  // string
                'iconUrl': 'images/myButton.png',  // string
                'onClick': $.proxy(this._printClick, this),  // callback function
                'hideText': true,  // bool
                'maxWidth': 30,  // number
                'doToggle': false,  // bool
                'toggleStatus': false  // bool
            }
        ).addTo(map);*/

        this._initHeatMapTypes();
    },

    //private methods
    _initHeatMapTypes: function() {
        var thermalScale = chroma.scale(['#fee5d9', '#a50f15']);
        var wrbScale = chroma.scale(['white', 'blue', 'red']);
        var steps = [0.2, 0.4, 0.6, 0.8, 1];

        this._heatmapTypes= {
            rainbow: null, //default rendering
            thermal: this._getGradient(steps, thermalScale),
            wrb: this._getGradient(steps, wrbScale)
        };
    },

    _getGradient: function(steps, scale) {
        var g = {};
        $.each(steps, function(i, v) {
            g[v] = scale(v).hex();
        });
        return g;
    },


    _exportToPDF: function() {
        try {
            ogrid.Alert.busy('Generating PDF...', this, function() {
                leafletImage(this._map, $.proxy(this._doImagePDF, this));
            });

        } catch (e) {
            ogrid.Alert.error(e.message);
            ogrid.Alert.idle();
        }

    },


    _doImagePDF: function (err, canvas) {
        ogrid.Alert.busy('Generating PDF...', this, function() {
            try {
                var img = document.createElement('img');
                var dimensions = this._map.getSize();
                img.width = dimensions.x;
                img.height = dimensions.y;
                img.src = canvas.toDataURL();
                imgData = canvas.toDataURL("image/png");

                doc = new jsPDF('landscape');
                doc.addImage(imgData, "JPG", 15, 15, 270, 180);
                doc.save('map.pdf');
                ogrid.Alert.idle();
            } catch (e) {
                ogrid.Alert.error(e.message);
                ogrid.Alert.idle();
            }
        });

    },

    _onRefreshData: function (evtData) {
    	try {
            //console.log('map refresh: ' + JSON.stringify(evtData));

            var data = evtData.message.data;

            //will only render GeoJson FeatureCollections, for now
            this._validateData(data);

            //clear map if clear flag is on
            if (!ogrid.isNull(evtData.message.options.clear) && evtData.message.options.clear)
                this._onClear();

            if (data.features.length > 0) {
                ogrid.Alert.info( data.features.length + ' records(s) found.');
                var me = this;
                L.geoJson(data, {
                    style: function (feature) {
                        //can't use feature.properties.marker-color due to the dash on the name
                        //return {color: feature.properties['marker-color']};
                    },

                    pointToLayer: function(feature, latlng) {
                        //use meta view info to format display
                        if (data.meta.view.options.rendition.icon==='marker') {
                            //default marker
                            return new L.marker(latlng);
                        } else {
                            //default point rendering
                            //return new L.Circle(latlng, data.meta.view.size, {
                            var o = data.meta.view.options.rendition;
                            return new L.CircleMarker(latlng, {
                                radius:       o.size,
                                color:        o.color,
                                fillOpacity:  (o.opacity/100), //pct
                                fillColor:    o.fillColor
                            });
                        }
                    },

                    onEachFeature: function (feature, layer) {
                        var pop = L.popup()
                            .setLatLng([feature.geometry.coordinates[1],  feature.geometry.coordinates[0]])
                            .setContent(me._popupText(feature, data.meta.view));

                        layer.bindPopup(pop);
                        if (!ogrid.isNull(feature.autoPopup) && feature.autoPopup) {
                            //automatically open the popup
                            me._map.openPopup(pop);
                        }
                    }
                }).addTo(this._map);
            } else {
                ogrid.Alert.info('No results matched the search criteria.');
            }
    	} catch (e) {
    		ogrid.Alert.error(e.message);
    	}
    },

    _onClear: function (evtData) {
        this._clear();
    },

    _validateData: function (data) {
        if ( ogrid.isNull(data) ||  ogrid.isNull(data.type) || ogrid.isNull(data.meta) || data.type !== 'FeatureCollection') {
            throw ogrid.error('Data Error', 'Non-geoJson feature collection received from the data service');
        }
    },

    _popupText: function (feature, view) {
        var txt ="";
        //iterate through geojson feature properties
        for (var p in feature.properties) {
            if (feature.properties.hasOwnProperty(p)) {
                var m = this._metaLookup(p, view);

                //display property on popup if marked so
                if (m.popup) {
                    if (m.dataType !== 'graphic') {
                        //graphic data types will be rendered differently on popup later
                        //other types to be supported later are link, etc.
                        txt += '<b>' + m.displayName + ': </b>';
                        txt += feature.properties[p] + '<br />';
                    }
                }
            }
        }
        return txt;
    },

    _metaLookup: function (p, view) {
        for (var i=0; i < view.columns.length; i++) {
            if ( view.columns[i].id === p) {
                return view.columns[i];
            }
        }
        throw ogrid.error('Data Error', 'GeoJson data is not formatted properly. Unable to find meta/view attributes for column \'' + p + '\'.');
    },

    _clear: function() {
        var me = this;
        this._map.eachLayer(function (layer) {
            //remove all layers except base layer (add more exceptions later)
            if (layer !== me._baseLayer)
                me._map.removeLayer(layer);
        });
    },

    _clearLayers: function(layers) {
        var me = this;
        $.each(layers, function(i, v) {
            me._clearLayerById(v);
        });
    },


    _clearLayerById: function(leafletId) {
        var me = this;
        this._map.eachLayer(function (layer) {
            //remove all layers except base layer (add more exceptions later)
            if (layer._leaflet_id === leafletId)
                me._map.removeLayer(layer);
        });
    },

    //public methods
    getMapCenter: function () {
        return this._map.getCenter();
    },

    getMap: function () {
        return this._map();
    },


    addHeatMapLayerFromExistingLayer: function(layer) {

    },

    //adds a heatmap layer from LatLng array
    addHeatMapLayerFromData: function(prevHeatmapId, data, heatmapType) {
        /*var options =  {
            //     minOpacity: 0.05,
            //     maxZoom: 18,
            //     radius: 25,
            //     blur: 15,
            //     max: 1.0
            // }; */
        //if there is a previous heatmap id, clear and replace with this one
        if (prevHeatmapId)
            this._clearLayerById(prevHeatmapId);

        if (heatmapType !='none') {
            var options = {minOpacity: 0.25};

            if (this._heatmapTypes[heatmapType]) {
                options = $.extend(options, {gradient: this._heatmapTypes[heatmapType]});
            }

            var l = L.heatLayer(data, options);
            l.addTo(this._map);
            //l.bringToFront();
            //this._map.addLayer(l);

            return l._leaflet_id;
        }
    },

    addTileMapLayerFromData: function(data, existingLayers) {
        if (existingLayers)
            this._clearLayers(existingLayers);

        if (data) {
            if (!this._zipShapeMap)
                this._zipShapeMap = new ogrid.ChicagoZipShapeMap();

            var keys = $.map(this._zipShapeMap.getData(), function (v, i) {
                return i;
            });

            var t = new ogrid.TileMapByBoundary(this._map, data, {
                    //keys to tile, make zip code boundary params configurable
                    //we can really leave the boundary keys null as the TileMapByBoundary gets the keys from the raw geoJson by default
                    //only here to show that there is such an option
                    boundaryKeys: keys,

                    shapeMap: this._zipShapeMap,

                    shapeServiceUrl: null,

                    //colors same as default for now
                    chromaColors: ['#f7fcf5', '#00441b']
                }
            );
            //need to return layer group Id later (multiple layers of geoJson layers)
            var o = t.generate();

            //o has colorMap and layerIds attributes
            return o.layerIds;
        } else {
            return null;
        }
    }
});
