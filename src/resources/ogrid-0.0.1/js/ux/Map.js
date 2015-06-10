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

    _options:{},

    //public attributes


    //constructor
    init: function(mapContainer, options) {
        if (options) {
            //ogrid.setOptions(options);
            this._options = options;
        }
        this._mapContainer = mapContainer;

        this._map = L.map(this._mapContainer.attr('id'), this._options);

        //try other base maps later
        this._baseLayer = L.esri.tiledMapLayer(this._options.baseMapUrl, {});
        this._map.addLayer(this._baseLayer);

        //subscribe to applicable opengrid client events
        ogrid.Event.on(ogrid.Event.types.REFRESH_DATA, $.proxy(this._onRefreshData, this));
        ogrid.Event.on(ogrid.Event.types.CLEAR, $.proxy(this._onClear, this));
    },

    //private methods
    _onRefreshData: function (evtData) {
    	try {
            console.log('map refresh: ' + JSON.stringify(evtData));

            var data = evtData.message;

            //will only render GeoJson FeatureCollections, for now
            this._validateData(data);

            //auto-clear map for now every new data
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


    //public methods
    getMapCenter: function () {
        return this._map.getCenter();
    },

    getMap: function () {
        return this._map();
    }
});
