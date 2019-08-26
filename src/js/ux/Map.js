/*
 * ogrid.Map
 *
 * Map UX component
 */

ogrid.Map = ogrid.Class.extend({
    _GENERATED_LAYERS_LABEL: "Generated Layers",

    //private attributes
    _mapContainer: null,
    _map: null,
    _baseMapLayer: null,
    _markers: {},
    _locateControl: null,
    _legend: null,
    _lastZoom: 0,
    _handleMapViewChange: false,

    _options: {
        //lime
        newDataHighLightColor: '#00FF00'
    },

    _heatmapTypes: {},

    //public attributes


    //constructor
    init: function(mapContainer, options) {
        if (options) {
            //ogrid.setOptions(options);
            this._options = $.extend(this._options, options);
        }
        this._mapContainer = mapContainer;

        //temporary invocation method for PDF export
        //this._addContextMenu(this._options.mapLibraryOptions);

        //had to do this now as leaflet is unable to derive the default path if JS is minified
        //as of Leaflet 1.0.1, the '/' is needed
        L.Icon.Default.imagePath = this._options.mapLibraryOptions.imagePath + "/";

        this._map = L.map(this._mapContainer.attr('id'), this._options.mapLibraryOptions);

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
        this._initLayerControl();

        this._addVariousControls();

        //handle overlay events
        this._map.on("overlayremove", $.proxy(this._onOverlayRemove, this));
        this._map.on("overlayadd", $.proxy(this._onOverlayAdd, this));

        if (ogrid.Config.map.autoRequery) {
            this._map.on("moveend", $.proxy(this._onMapViewChanged, this));
            //this._map.on("zoomend", $.proxy(this._onMapViewChanged, this));
            //this._map.on("dragend", $.proxy(this._onMapViewChanged, this));
        }
        this._map.on("popupopen", $.proxy(this._onPopupOpen, this));

        ogrid.Event.on(ogrid.Event.types.LOGGED_IN, $.proxy(this._onLoggedIn, this));
        this._lastZoom = this._map.getZoom();
    },

    //private methods
    _onLoggedIn: function() {
        //make sure we reset the zoom level, when newly logged in
        this._resetZoom();
    },

    _onPopupOpen: function() {
        try {
            //temporarily set flag to let _onMapViewChanged that it got triggered due to popup appearing
            this._handleMapViewChange = false;
        } finally {
            var me = this;
            setTimeout(function() {
                me._handleMapViewChange = true;
            }, 1000);
        }
    },

    _onMapViewChanged: function() {
        //if movement is due to our popping marker, ignore
        if (!this._handleMapViewChange) return;

        console.log('map view changed');
        /*if (this._lastZoom !==0) {
         if (this._map.getZoom() > this._lastZoom) {
         console.log("zoomed in")
         } else if (this._map.getZoom() < this._lastZoom) {
         console.log("zoomed out")
         }
         }*/
        this._lastZoom = this._map.getZoom();

        //broadcast event only if results are active on the map
        //if (this._hasActiveResults() ) {
        //    ogrid.Event.raise(ogrid.Event.types.MAP_EXTENT_CHANGED);
        //}

        var me = this;
        var regen = null;
        var tileMapActive = false;
        var heatMapActive = false;

        this._map.eachLayer(function (layer) {
            if (me._isOpenGridLayer(layer) ) {
                if (layer.options.regenerator) {
                    if (!regen) {
                        //store regenerator object
                        //assumption: only 1 regenerator is possible
                        regen = layer.options.regenerator;
                    }
                    me._layerControl.removeLayer(layer);
                    me._map.removeLayer(layer);
                }
            }
        });
        me._clearLegend();

        //begin regeneration
        if (regen) {
            regen.handler.regenerate( function(evtData) {
                //regenerate heatmap/tile map if previously active
                console.log('Regeneration done. will Regen heat map or tile map');
            });
        }


    },

    _hasActiveResults: function() {
        var me = this;
        var r = false;
        this._map.eachLayer(function (layer) {

            if (me._isOpenGridLayer(layer) ) {
                //found at least 1 results layer
                r = true;
                return;
            }
        });
        return r;
    },

    _onZoomEnd: function() {
        /*if (this._lastZoom !==0) {
            if (this._map.getZoom() > this._lastZoom) {
                console.log("zoomed in")
            } else {
                console.log("zoomed out")
            }
        } else {
            console.log("zoomed init")
        }*/
        this._lastZoom = this._map.getZoom();
    },


    _addContextMenu: function(options) {
        options.contextmenu = true;
        options.contextmenuWidth = 140;
        options.contextmenuItems =  [{
                text: 'Export to PDF',
                callback: $.proxy(this._exportToPDF, this)
        }];
        options.contextmenuItems[0].callback = $.proxy(this._exportToPDF, this);
    },

    _addVariousControls: function() {
        var me = this;

        //group 2 related easy butons
        L.easyBar([
            L.easyButton('fa-home fa-lg', function(btn, map){
                me._resetZoom();
            }, 'Reset map view'),

            L.easyButton('fa-dot-circle-o fa-lg', function(btn, map){
                me.zoomToResultBounds();
            }, 'Zoom to include all query results')
        ]).addTo(this._map);


        //Zoom Home
        //var zoomHome = L.Control.zoomHome();
        //zoomHome.addTo(this._map);

        var zoomBoxCtl = L.control.zoomBox({
            modal: true,  // If false (default), it deactivates after each use.
                          // If true, zoomBox control stays active until you click on the control to deactivate.
            position: "topleft"
        });
        this._map.addControl(zoomBoxCtl);

        //Full Screen
        L.control.fullscreen().addTo(this._map);

        //measuring tools
        this._measureTool = L.control.measure(ogrid.Config.map.measureOptions);
        this._measureTool.addTo(this._map);

        this._locateControl =  L.control.locate();
        this._locateControl.options.strings.title = 'Show current location';

        //we have to do this explicitly now bause the default icon changed and it's causing a dup icon on our toolbar
        this._locateControl.options.icon = 'fa fa-location-arrow';
        this._locateControl.addTo(this._map);
		
		 //create legend
        this._legend = L.control({position: 'bottomright'});

        this._legend.onAdd = function (map) {
            //hidden initially
            var div = L.DomUtil.create('div', 'map-info legend hide');
            return div;
        };
        this._legend.addTo(this._map);

    },
	
	

    _resetZoom: function() {
        //this._map.setZoom(this._options.mapLibraryOptions.zoom);
        this._map.setView(
            this._options.mapLibraryOptions.center,
            this._options.mapLibraryOptions.zoom
        );
    },

    _getGroupedLayer: function(layerConfig, autoAddFirst) {
        var gl = {};
        var me = this;

        if (layerConfig) {
            $.each(
                layerConfig,
                function(i, v) {
                    v.layer = ( v.useEsri ? L.esri.tiledMapLayer(v.url, v.options) :  L.tileLayer(v.url, v.options) );
                    if (autoAddFirst && i===0) {
                        //first baselayer is treated as default; auto-add to map
                        me._map.addLayer(v.layer);
                    }
                    if (v.groupName) {
                        if (!gl.hasOwnProperty(v.groupName))
                            gl[v.groupName] = {};
                        gl[v.groupName][v.name] = v.layer;
                    } else
                        gl[v.name] = v.layer;
                }
            );
        }
        return gl;
    },

    _initLayerControl: function() {
        //populate our base layers from the options
        var bl = this._getGroupedLayer(this._options.baseLayers, true);
		var options = {
            container_width 	: "250px",
            group_maxHeight     : "1000px",
            //container_maxHeight : "800px",
			position			: 'bottomleft',
            exclusive       	: false,
        };

        //No support for service URL overlays yet
        if (this._options.overlayLayers && ( typeof this._options.overlayLayers==='object') ) {
            var ol = this._getGroupedLayer(this._options.overlayLayers, false);
            this._layerControl = L.control.groupedLayers(bl, ol, options);
        } else {
            //no overlays
            this._layerControl = L.control.groupedLayers(bl, null, options);
        }

        this._map.addControl(this._layerControl);
    },


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

                var doc = new jsPDF('landscape');
                doc.addImage(imgData, "JPG", 15, 15, 270, 180);
                doc.save('map.pdf');
                ogrid.Alert.idle();
            } catch (e) {
                ogrid.Alert.error(e.message);
                ogrid.Alert.idle();
            }
        });

    },

    _getBorderColor: function(renditionColor, feature, options, lastRefreshed) {
        //check if there is a column designated as creation time whose value we can use to compare with last refresh timestamp
        //   for auto-highlighting
        if (options.creationTimestamp && lastRefreshed) {
            //highlight new rows on auto-refresh using Bootstrap's success style
            if (moment(feature.properties[options.creationTimestamp], ogrid.Config.service.dateFormat) > lastRefreshed) {
                return this._options.newDataHighLightColor;
            }
        }
        //default
        return renditionColor;
    },

    _getLatestDataTs: function(data) {
        var options = data.meta.view.options;
        if (options.creationTimestamp) {
            //check if a property is designated as cretion timestamp

            if (data.features && data.features.length > 0) {
                //assume sort by the creation timestamp, descending
                return moment(data.features[0].properties[options.creationTimestamp], ogrid.Config.service.dateFormat);
            }
        }
        return null;

    },

    _getCalcCircleSize: function(sz, datasetId, properties) {
        if (_.isObject(sz)) {
            //size based on dotsizer
            var n = properties[sz.columnId];
            if (n!==null) {
                //replace token with actual value, and evaluate expression
                try {
                    var v = eval(sz.calculator.replace("@v", n)); // jshint ignore:line
                    return v;
                } catch (ex) {
                    console.log("dot size evaluation error: "+ ex.message);
                }
            } else {
                console.log("Warning: Minimum dot size is being assigned due to NULL value. datasetId=" + datasetId + ", columnId=" + sz.columnId);
                return 2;
            }
        }
        return sz;
    },


    //override Leaflet circlemarker _empty method while we are investigating this more
    //regen is an indicator that auto-requery is turned on
    _getOverrideCircleMarkerIsEmpty: function (that, regen) {
        return $.proxy(function() {
            //if (!regen) {
            //    return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
            //} else {
                //TODO ignore render bound for the time being when auto-requery is on
                return !this._radius;
            //}
            /*//TODO Remove later - for debugging only
             if (this._radius && !this._renderer._bounds.intersects(this._pxBounds)) {
             console.log('!!!!- Empty circlemarker; radius=' + this._radius + ', pxBound=' + JSON.stringify(this._pxBounds) + ', renderer bounds: ' + JSON.stringify(this._renderer._bounds));
             } else {
             console.log('!!!!- Non-empty circlemarker; radius=' + this._radius + ', pxBound=' + JSON.stringify(this._pxBounds) + ', renderer bounds: ' + JSON.stringify(this._renderer._bounds));
             }
             return this._radius && !this._renderer._bounds.intersects(this._pxBounds);*/
        }, that);
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
                this._announceRecordCount(evtData.message,data.features.length);
                var me = this;

                //if data is from a monitoring query, use that as our resultSetId as that remains constant through out the monitoring/timer session
                var rsId = this._isMonitored(evtData.message) ? evtData.message.options.passthroughData.monitorData.monitorId : evtData.message.resultSetId;

                //we need this for highlighting new data
                var latestDataTs = me._getLatestDataTs(data);
                var resultsLayer = L.geoJson(data, {
                    style: function (feature) {
                        //can't use feature.properties.marker-color due to the dash on the name
                        //return {color: feature.properties['marker-color']};
                    },

                    pointToLayer: function(feature, latlng) {
                        //side effect, we're adding an id attribute to feature for table->map linkage
                        if (!feature.id) {
                            if (feature.properties.hasOwnProperty('_id'))
                                feature.id = feature.properties._id;
                            else
                                feature.id = ogrid.guid();
                        }

                        if (!me._markers[rsId])
                            me._markers[rsId] = {};

                        //use meta view info to format display
                        if (data.meta.view.options.rendition.icon==='marker') {
                            //default marker
                            var m = new L.marker(latlng);
                            me._markers[rsId][ogrid.oid(feature)] = m;
                            return m;
                        } else {
                            //default point rendering
                            //return new L.Circle(latlng, data.meta.view.size, {
                            var o = data.meta.view.options.rendition;

                            //TODO #239, bubbles on map prototype
                            var sz = me._getCalcCircleSize(o.size, data.meta.view.id, feature.properties);

                            var cm =  new L.CircleMarker(latlng, {
                                radius:       sz,
                                color:        me._getBorderColor(
                                    o.color,
                                    feature,
                                    data.meta.view.options,
                                    me._markers[rsId].latestDataTs
                                ),
                                fillOpacity:  (o.opacity/100), //pct
                                fillColor:    o.fillColor,
                                weight: data.meta.view.options.rendition.borderWidth
                            });
                            //TODO Temp solution, while we're investigating missing dots due to Leaflet renderer being out of sync
                            cm._empty = me._getOverrideCircleMarkerIsEmpty(cm, evtData.message.options.passthroughData.regenerator);

                            me._markers[rsId][ogrid.oid(feature)] = cm;

                            return cm;
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
                    },

                    className: 'layer-opengrid',

                    //additions to support refresh on map extent change
                    regenerator: evtData.message.options.passthroughData.regenerator
                });

                resultsLayer.addTo(this._map);

                //tag geoJson layer so we know this is a 'query results' layer
                resultsLayer.isOpenGridQueryResults = true;

                //we'll use the resultset Id to see if a layer for the same query needs to be replaced on our layer control
                resultsLayer.opengridResultsetId = rsId;

                //store latest data timestamp
                this._markers[rsId].latestDataTs = latestDataTs;

                //add query results to layer control
                this._addLayerToControl(resultsLayer, data.meta.view, 'Data', this._GENERATED_LAYERS_LABEL);

                ogrid.Event.raise(ogrid.Event.types.MAP_RESULTS_DONE, {resultSetId: evtData.message.resultSetId, passthroughData: evtData.message.options.passthroughData});

                //invoke call back for map extent change refresh
                if (evtData.message.options && evtData.message.options.passthroughData && evtData.message.options.passthroughData.done) {
                    evtData.message.options.passthroughData.done(evtData);
                }
            } else {
                this._announceRecordCount(evtData.message,data.features.length);
                ogrid.Event.raise(ogrid.Event.types.MAP_RESULTS_DONE, {resultSetId: evtData.message.resultSetId, passthroughData: evtData.message.options.passthroughData});
            }
    	} catch (e) {
            ogrid.Alert.error(e.message);
            ogrid.Event.raise(ogrid.Event.types.MAP_RESULTS_DONE, {resultSetId: evtData.message.resultSetId, passthroughData: evtData.message.options.passthroughData});
        }
    },

    _isMonitored: function(m) {
        return (m.options && m.options.passthroughData &&
        m.options.passthroughData.monitorData && m.options.passthroughData.monitorData.monitorId);
    },

    _isAutoRequery: function(m) {
        return (m.options && m.options.passthroughData && m.options.passthroughData.done);
    },

    _announceRecordCount: function(m, count) {
        if (!this._isMonitored(m) && !this._isAutoRequery(m)) {
            //don't be so chatty when we're in monitoring mode
            if (count === 0)
                ogrid.Alert.info('No results matched the search criteria.');
            else
                ogrid.Alert.info(count + ' records(s) found.');
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

    _linkify: function(txt) {
        // looks for urls and makes them links
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

       try {
           //open URL in new window or tab
           return txt.replace(exp, "<a href='$1' target=\"_blank\">$1</a>");
       } catch (ex) {
           return txt;
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
                        txt += this._linkify(feature.properties[p]) + '<br />';
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

    _clearLegend: function() {
        var legendDiv = this._legend.getContainer();
        legendDiv.innerHTML = '';

        //hide, since we have nothing to show
        $(legendDiv).addClass('hide');
    },

    _clear: function() {
        var me = this;
        this._map.eachLayer(function (layer) {
            //remove all layers except base layer (add more exceptions later)
            //if (layer !== me._baseMapLayer)
            //if (!me._isBaseLayer(layer) && !layer.isGeoFilter) {

            //only clear the layers that we created ourselves or we get in trouble with 3rd-party controls
            //if (layer.isOpenGridQueryResults || me._isMeasureLayer(layer)) {
            if (me._isOpenGridLayer(layer) || me._isMeasureLayer(layer)) {
                //remove from layer control as well
                me._layerControl.removeLayer(layer);

                me._map.removeLayer(layer);
            }
        });
        me._markers = {};

        //clear any remaining generated layers
        me._clearOwnLayersFromLayerControl();

        //clear legend
        me._clearLegend();
    },

    //clear our own generated layers if any remains (usually unchecked ones that do not appear as a layer on the map)
    _clearOwnLayersFromLayerControl: function() {
        var me = this;
        $.each(this._layerControl._layers, function(i, v) {
            if ( v.group.name === me._GENERATED_LAYERS_LABEL) {
                me._layerControl.removeLayer(v.layer);
            } else if (v.group.name !== '') {
                //uncheck any selected non-generated layer
                me._map.removeLayer(v.layer);
            }
        });
    },

    _isOpenGridLayer: function(layer) {
        return this._hasLayerClass(layer, 'layer-opengrid');
    },

    _hasLayerClass: function(layer, className) {
        return (layer &&
        layer.options &&
        layer.options.className &&
        layer.options.className.startsWith(className)
        );
    },

    _isMeasureLayer: function(layer) {
        return this._hasLayerClass(layer, 'layer-measure');
    },

    _clearLayers: function(layers) {
        var me = this;
        $.each(layers, function(i, v) {
            me._clearLayerById(v);
        });
    },

    //returns true if layer is one of the base layers
    _isBaseLayer: function(layer) {
        var r = false;

        $.each(this._options.baseLayers, function(i, v) {
            if (v.layer === layer) {
                r = true;
                return;
            }
        });
        return r;
    },


    _clearLayerById: function(leafletId) {
        var me = this;
        this._map.eachLayer(function (layer) {
            //remove all layers except base layer (add more exceptions later)
            if (L.Util.stamp(layer) === leafletId)
                me._map.removeLayer(layer);
        });
    },


    _findLayerById: function(leafletId) {
        var me = this;
        var l = null;

        this._map.eachLayer(function (layer) {
            //remove all layers except base layer (add more exceptions later)
            if (L.Util.stamp(layer) === leafletId) {
                l = layer;
                return;
            }
        });
        return l;
    },

    _findControlLayerById: function(leafletId) {
        var me = this;
        var l = null;

        $.each(this._layerControl._layers, function (i, v) {
            //remove all layers except base layer (add more exceptions later)
            if (L.Util.stamp(v.layer) === leafletId) {
                l = v.layer;
                return;
            }
        });
        return l;
    },

    _addLayerToControl: function(layer, dataView, postFix, group) {
        var me = this;
        //if resultset Id exists on our layer control, remove it as this will replace it
        $.each(this._layerControl._layers, function(i, v) {
            if (v.layer.opengridResultsetId && layer.opengridResultsetId) {
                if (v.layer.opengridResultsetId === layer.opengridResultsetId) {
                    //remove layer
                    me._layerControl.removeLayer(v.layer);
                    me._map.removeLayer(v.layer);
                    return;
                }
            }
        });

        //data view describes the rendition attributes of the data represented by the layer;
        // we'll use it to distinctly identify the layer on the control
        var name = dataView.displayName + ' ' + postFix;

        //color based on the same map rendition color
        var c = 'black';
        if (!ogrid.isNull(dataView.options.rendition.color)) {
            c = dataView.options.rendition.color;
        }
        var sp = '<i class="fa fa-circle-o" style="color:' + c + '"></i>&nbsp';
        this._layerControl.addOverlay(layer, sp + name, group);
		
		//add to legend as well
        //console.log(this._legend.getContainer());
        var legendElem = this._legend.getContainer();
        if ($(legendElem).hasClass('hide')) {
            //show legend, if hidden
            $(legendElem).removeClass('hide');
        }

        //only add if not already there
        var item = '<i class="ogrid-legend-circle" style="background:' + c + '"></i> ' +
            (dataView.displayName ? dataView.displayName + '<br>' : '+');
        if (legendElem.innerHTML.indexOf(item) == -1) {
            legendElem.innerHTML += item;
        }
    },

    _onOverlayAdd: function(e) {
        //if (e.layer === theaterLayer) {
        //}
        if (e.layer._leaflet_id)
            ogrid.Event.raise(ogrid.Event.types.MAP_OVERLAY_ADD, e.layer._leaflet_id);
    },

    _onOverlayRemove: function(e) {
        //if (e.layer === theaterLayer) {
        //}
        if (e.layer._leaflet_id)
            ogrid.Event.raise(ogrid.Event.types.MAP_OVERLAY_REMOVE, e.layer._leaflet_id);
    },

    //use the bigger geo box used in QuickSearch
    _withinMaxBounds: function(resultBounds) {
        var b = this._getMaxBounds();
        return b.contains(resultBounds);
    },

    _getMaxBounds: function() {
        var a = ogrid.Config.quickSearch.plugInOptions.places.esriGeocodeBBox.split(',');
        return L.latLngBounds(
            L.latLng(a[1], a[0]), //southwest
            L.latLng(a[3], a[2]) //northeast
        );
    },


    //public methods
    getMapCenter: function () {
        return this._map.getCenter();
    },

    getMapZoom: function () {
        return this._map.getZoom();
    },

    getMap: function () {
        return this._map;
    },

    addHeatMapLayerFromExistingLayer: function(layer) {

    },

    //adds a heatmap layer from LatLng array
    addHeatMapLayerFromData: function(dataView, prevHeatmapId, data, heatmapType) {
        /*var options =  {
         //     minOpacity: 0.05,
         //     maxZoom: 18,
         //     radius: 25,
         //     blur: 15,
         //     max: 1.0
         // }; */
        //if there is a previous heatmap id, clear and replace with this one
        if (prevHeatmapId) {
            //remove from layer control
            var l = this._findControlLayerById(prevHeatmapId);
            if (l) {
                this._layerControl.removeLayer(l);
                this._map.removeLayer(l);
            }
        }

        if (heatmapType !='none') {
            var options = {minOpacity: 0.25};

            if (this._heatmapTypes[heatmapType]) {
                options = $.extend(options, {gradient: this._heatmapTypes[heatmapType]});
            }
            options.className = 'layer-opengrid';

            var hl = L.heatLayer(data, options);

            hl.addTo(this._map);

            //store opengrid data on the layer for later retrieval
            hl.openGridData = {dataView: dataView, heatMapType: heatmapType};

            //hl.bringToFront();
            //this._map.addLayer(hl);

            //add heat map layer to layer control
            this._addLayerToControl(hl, dataView, 'Heatmap', this._GENERATED_LAYERS_LABEL);

            return L.Util.stamp(hl);
        }
    },

    addTileMapLayerFromData: function(dataView, data, layerData, shapeMap) {
        if (layerData.layerIds) {
            this._clearLayers(layerData.layerIds);

            //remove from layer control
            var l = this._findControlLayerById(layerData.layerGroupId);
            if (l) {
                this._layerControl.removeLayer(l);
                this._map.removeLayer(l);
            }
        }
        if (data) {
              var keys = $.map(shapeMap.getData(), function (v, i) {
                return i;
            });

            var t = new ogrid.TileMapByBoundary(this._map, data, {
                    //keys to tile, make zip code boundary params configurable
                    //we can really leave the boundary keys null as the TileMapByBoundary gets the keys from the raw geoJson by default
                    //only here to show that there is such an option
                    boundaryKeys: keys,

                    shapeMap: shapeMap,

                    shapeServiceUrl: null,

                    //colors same as default for now
                    chromaColors: ['#f7fcf5', '#00441b']
                }
            );
            //need to return layer group Id later (multiple layers of geoJson layers)
            var o = t.generate();

            //o has colorMap and layerIds attributes
            //displaying boundary layer, now shifted to caller for flexibility
            o.layerGroup.addTo(this._map);

            //add layer group to layer control
            this._addLayerToControl(o.layerGroup, dataView, 'Tilemap', this._GENERATED_LAYERS_LABEL);

            return {layerGroupId: L.Util.stamp(o.layerGroup), layerIds: o.layerIds};
        } else {
            return null;
        }
    },


    popupMarkerById: function(rsId, pointId) {
        //me._markers[evtData.message.resultSetId][ogrid.oid(feature)] = m;
        if (this._markers[rsId][pointId]) {
            //as of 11/14, we're not centering popups any more
            //this._map.setView(this._markers[rsId][pointId].getLatLng());
            this._markers[rsId][pointId].openPopup();
        }
    },

    popupMarkerByLatLng: function(rsId, pointId) {
        //me._markers[evtData.message.resultSetId][ogrid.oid(feature)] = m;
        if (this._markers[rsId][pointId]) {
            this._map.setView(this._markers[rsId][pointId].getLatLng());
            this._markers[rsId][pointId].openPopup();
        }
    },

    //Added auto zoom in search result set bounds control
    zoomToResultBounds: function() {
        //find all query results layers and add to a feature group
        var fg = L.featureGroup();

        this._map.eachLayer(function(layer) {
            //add each results layer (those layer with our custom attribute) to the feature group
            if (layer.isOpenGridQueryResults)
                fg.addLayer(layer);
        }, this);

        //fit map to bounds
        if (fg.getLayers().length > 0) {
            var b = fg.getBounds();
            if (!this._withinMaxBounds(b)) {
                b = this._getMaxBounds();
            }
            this._map.fitBounds(b);
            console.log('zoomToResultBounds: ' +  JSON.stringify(b));
        }
    },

    getGeoLocationControl: function() {
        return this._locateControl;
    },

    //for temporarily disabling _mapViewChange event handler
    enableMapViewChangeHandler: function(flag) {
        this._handleMapViewChange = flag;
    },


    setMapView: function(center, zoom) {
        console.log("map::setMapView");
        this._map.setView(
            center,
            zoom
        );
    }
});
