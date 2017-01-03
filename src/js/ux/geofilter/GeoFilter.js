/*
 * ogrid.GeoFilter
 *
 * GeoFilter Widget (meant to be used in Advanced Search)
 */

//TODO: implement GeoFilters using plug-in architecture
ogrid.GeoFilter = ogrid.Class.extend({
    //private attributes
    _options:{
        defaultPolyColor: '#f768a1',
        geoLocationControl: null
    },
    _container: null,
    _withinBounds: [
        {id:'_map-extent', displayName:'Map Extent'},
        {id:'_drawn-extent', displayName:'Drawn Extent'}
    ],
    _nearBounds: [
        {id:'_me', displayName:'Me'},
        {id:'_marker', displayName:'Marker'},
    ],
    _drawFull: null,
    _drawMarker: null,
    _lastLocationFound: null,

    //public attributes

    //constructor
    init: function(container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._container = container;

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('adv-search-geofilter');

        if (options.bounds) {
            this._withinBounds = this._withinBounds.concat(options.bounds);
        }
        $('#jqtmpl-geofilter-within-bounds').tmpl(this._withinBounds).appendTo('#geofilter-within-bounds');

        $('#jqtmpl-geofilter-near-bounds').tmpl(this._nearBounds).appendTo('#geofilter-near-bounds');

        //populate distance default to feet
        this._onDistanceUnitChange({target: $('#geofilter-near-bounds-maxradius input[value="feet"]')});

        //setup event handlers
        $('#geofilter-within-bounds').change($.proxy(this._onBoundaryChange, this));
        $('#geofilter-near-bounds').change($.proxy(this._onNearReferenceChange, this));
        $('#geofilter-near-bounds-maxradius input:radio').click($.proxy(this._onDistanceUnitChange, this));

        $('.adv-search-geofilter input[name="boundaryOption"]').click($.proxy(this._onGeoFilterRadioClick, this));

        this._createHelperDrawTools();

        this._options.map.on('locationfound', $.proxy(this._onMapLocationFound, this));
    },

    //private methods
    _onMapLocationFound: function(e) {
        this._lastLocationFound = e.latlng;
    },

    _onMapLocationError: function(e) {
        //???
    },

    _safeRemoveDrawControl: function(control, featureGroup) {
        try {
            //clear feature group
            if (featureGroup)
                featureGroup.clearLayers();

            this._options.map.removeControl(control);
        } catch (e) {
            //ignore error as control may not be currently present
            //console.log('warning: ' + e)
        }
    },

    _onGeoFilterRadioClick: function(e) {
        console.log('_onGeoFilterRadioClick');
        //manually trigger change event handler
        if ($(e.target).attr('id') === 'geofilter-within-radio')
            this._onBoundaryChange({target: $('#geofilter-within-bounds')});
        else if ($(e.target).attr('id') === 'geofilter-near-radio')
            this._onNearReferenceChange({target: $('#geofilter-near-bounds')});
    },

    _createHelperDrawTools: function() {
        // Initialise the FeatureGroup to store editable layers
        var drawnItemsFull = new L.FeatureGroup();

        //need to tag our layers so they're not cleared by map (we are responsible for clearing it)
        drawnItemsFull.isGeoFilter = true;

        this._drawnItemsMarker = new L.FeatureGroup();
        this._drawnItemsMarker.isGeoFilter = true;

        this._lookupWithinBounds('_drawn-extent').data = drawnItemsFull;

        this._options.map.addLayer(drawnItemsFull);
        this._options.map.addLayer(this._drawnItemsMarker);

        this._drawFull = new L.Control.Draw({
            draw: {
                marker: false,
                polyline: false,
                polygon: {
                    shapeOptions: {
                        color: this._options.defaultPolyColor
                    }
                },
                rectangle: {
                    shapeOptions: {
                        color: this._options.defaultPolyColor
                    }
                },
                //circle does not work (does not translate well to geoJson); disable for now
                circle: false
            },
            edit: {
                featureGroup: drawnItemsFull
            }
        });

        this._drawMarker = new L.Control.Draw({
            draw: {
                marker: true,
                circle: false,
                polygon: false,
                polyline: false,
                rectangle: false
            },
            edit: {
                featureGroup: this._drawnItemsMarker
            }
        });

        var me = this;
        this._options.map.on('draw:created', function (e) {
            //separate this from the main one
            var type = e.layerType,
                layer = e.layer;
            console.log('layer type: ' + type);
            if (type === 'marker') {
                // Do marker specific actions
                me._drawnItemsMarker.addLayer(e.layer);
            } else
                drawnItemsFull.addLayer(e.layer);
            // Do whatever else you need to. (save to db, add to map etc)
            me._options.map.addLayer(layer);

            //need to tag our layers so they're not cleared by map (we are responsible for clearing it)
            layer.isGeoFilter = true;
        });
    },

    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div class="form-inline"><div class="form-group"><label for="geofilter-within-bounds"  style="width:65px"><input id="geofilter-within-radio" value="within" name="boundaryOption" type="radio" checked> Within</label><select id="geofilter-within-bounds" class="form-control"><option value="">SELECT BOUNDARY</option><script type="text/x-jquery-tmpl" id="jqtmpl-geofilter-within-bounds"><option value="${id}">${displayName}</option></script></select></div><div id="geofilter-within-bounds-values-group" class="form-group hidden"><label for="geofilter-within-bounds-values">Value</label><select id="geofilter-within-bounds-values" class="form-control"><option value=""></option><script type="text/x-jquery-tmpl" id="jqtmpl-geofilter-within-bounds-values"><option value="${$data}">${$data}</option></script></select></div><div id="geofilter-within-bounds-draw-message" class="form-group hidden" >Use the drawing tools on the map to specify boundaries</div></div><div class="form-inline"><div class="form-group"><label for="geofilter-near-bounds"  style="width:65px"><input id="geofilter-near-radio" value="near" name="boundaryOption" type="radio"> Near</label><select id="geofilter-near-bounds" class="form-control"><option value="">SELECT POINT</option><script type="text/x-jquery-tmpl" id="jqtmpl-geofilter-near-bounds"><option value="${id}">${displayName}</option></script></select></div><div id="geofilter-near-bounds-message" class="form-group hidden" >Use the marker tool on the map to specify point(s)</div></div><div class="form-inline"><div id="geofilter-near-bounds-maxradius" class="form-group hidden"><label for="geofilter-near-bounds-maxdistance">with max. radius of&nbsp</label><select id="geofilter-near-bounds-maxdistance" class="form-control"><option value=""></option><script type="text/x-jquery-tmpl" id="jqtmpl-geofilter-max-distance"><option value="${value}">${displayName}</option></script></select>&nbsp<input name="distanceOption" type="radio" checked value="feet"> Feet</label>&nbsp<input name="distanceOption" type="radio" value="miles"> Miles</label><label id="geofilter-near-radius-label">&nbspfrom each point</label></div></div>';
    },

    //event handlers
    _populateDistanceValues: function(values) {
        //clear first
        $('#geofilter-near-bounds-maxdistance option').remove();

        $('#jqtmpl-geofilter-max-distance').tmpl(values).appendTo('#geofilter-near-bounds-maxdistance');
    },

    _onDistanceUnitChange: function(e) {
        //populate dropdown depending on unit selected
        //move to external config later?
        if ($(e.target).val() === 'feet') {
            this._populateDistanceValues([
                {value: 100, displayName: '100'},
                {value: 200, displayName: '200'},
                {value: 300, displayName: '300'},
                {value: 400, displayName: '400'},
                {value: 500, displayName: '500'},
                {value: 600, displayName: '600'},
                {value: 700, displayName: '700'},
                {value: 800, displayName: '800'},
                {value: 900, displayName: '900'},
                {value: 1000, displayName: '1000'}
            ]);
        } else if ($(e.target).val() === 'miles') {
            this._populateDistanceValues([
                {value: 1/8, displayName: '1/8'},
                {value: 1/4, displayName: '1/4'},
                {value: 1/2, displayName: '1/2'},
                {value: 3/4, displayName: '3/4'},
                {value: 1, displayName: '1'}
            ]);
        }
    },

    _populateWithinBoundValues: function(data) {
        //clear first
        $('#geofilter-within-bounds-values option').remove();
        $('#jqtmpl-geofilter-within-bounds-values').tmpl(data).appendTo('#geofilter-within-bounds-values');
    },

    _onBoundaryChange: function(e) {
        var featureGroup = this._lookupWithinBounds('_drawn-extent').data;
        this._safeRemoveDrawControl(this._drawMarker, this._drawnItemsMarker);
        this._activateGeoLocationControl(false);
        switch($(e.target).val()) {
            case '':
                $('#geofilter-within-bounds-values-group').addClass('hidden');
                $('#geofilter-within-bounds-draw-message').addClass('hidden');
                this._safeRemoveDrawControl(this._drawFull, featureGroup);
                //this._safeRemoveDrawControl(this._drawMarker, this._drawnItemsMarker);
                break;
            case '_map-extent':
                $('#geofilter-within-bounds-values-group').addClass('hidden');
                $('#geofilter-within-bounds-draw-message').addClass('hidden');
                this._safeRemoveDrawControl(this._drawFull, featureGroup);
                break;

            case '_drawn-extent':
                $('#geofilter-within-bounds-values-group').addClass('hidden');
                $('#geofilter-within-bounds-draw-message').removeClass('hidden');
                this._options.map.addControl(this._drawFull);
                //this._safeRemoveDrawControl(this._drawMarker, this._drawnItemsMarker);
                break;
            default:
                //need special logic for 'non-built-in' boundaries
                var o = this._lookupWithinBounds($(e.target).val());
                if (o) {
                    //data is the geoJson structure of an ogrid.ShapeMap object
                    var keys = Object.keys(o.data);
                    this._populateWithinBoundValues(keys);

                    if (keys.length > 1) {
                        //if there is only 1 value, no need to show the values dropdown
                        $('#geofilter-within-bounds-values-group').removeClass('hidden');
                    } else
                        $('#geofilter-within-bounds-values-group').addClass('hidden');

                    $('#geofilter-within-bounds-draw-message').addClass('hidden');
                    this._safeRemoveDrawControl(this._drawFull, featureGroup);
                    //this._safeRemoveDrawControl(this._drawMarker, this._drawnItemsMarker);
                }

                //populate values
        }
        $('#geofilter-within-radio').prop('checked', true);
    },

    _onNearReferenceChange: function(e) {
        var featureGroup = this._lookupWithinBounds('_drawn-extent').data;
        if ($(e.target).val() !=='') {
            if ($(e.target).val() ==='_marker') {
                $('#geofilter-near-bounds-message').removeClass('hidden');
                $('#geofilter-near-bounds-maxradius').removeClass('hidden');

                //set appropriate message
                this._setNearMessage('Use the marker tool on the map to specify point(s)');
                this._setNearRadiusLabel('&nbspfrom each point');
                this._options.map.addControl(this._drawMarker);
                this._safeRemoveDrawControl(this._drawFull, featureGroup);
                this._activateGeoLocationControl(false);
            } else if ($(e.target).val() ==='_me') {
                //near Me selected
                $('#geofilter-near-bounds-message').removeClass('hidden');
                $('#geofilter-near-bounds-maxradius').removeClass('hidden');

                //set appropriate message
                this._setNearMessage('The Geo-location marker on the map will be used');
                this._setNearRadiusLabel('&nbspfrom current location');

                //turn on Geo-location control
                this._activateGeoLocationControl(true);
                this._safeRemoveDrawControl(this._drawFull, featureGroup);
            }
        } else {
            $('#geofilter-near-bounds-message').addClass('hidden');
            $('#geofilter-near-bounds-maxradius').addClass('hidden');
            this._safeRemoveDrawControl(this._drawFull, featureGroup);
            this._safeRemoveDrawControl(this._drawMarker, this._drawnItemsMarker);
            this._activateGeoLocationControl(false);
        }
        $('#geofilter-near-radio').prop('checked', true);
    },


    _setNearMessage: function(txt) {
        $('#geofilter-near-bounds-message').text(txt);
    },

    _setNearRadiusLabel: function(label) {
        $('#geofilter-near-radius-label').html(label);
    },


    _activateGeoLocationControl: function(flag) {
        if (this._options.geoLocationControl)
            if (flag)
                this._options.geoLocationControl.start();
            else
                this._options.geoLocationControl.stop();
    },

    //returns all boundary shapes drawn
    _getDrawnExtentValue: function() {
        //data contains the feature group that stores all the poly layers
        return this._lookupWithinBounds('_drawn-extent').data.toGeoJSON();
    },


    //returns all boundary shapes drawn
    _getMarkerValue: function() {
        return this._drawnItemsMarker.toGeoJSON();
    },


    _lookupWithinBounds: function(boundId) {
        var o = $.grep(this._withinBounds, function(p){ return (p.id === boundId); });
        if (o && o[0]) {
            return o[0];
        }
        return null;
    },

    _getShapeMap: function(settings) {
        if (settings.boundaryType ==='within') {
            var o = this._lookupWithinBounds(settings.boundary);
            if (o) return o.data;
        } else if ( settings.boundaryType ==='near') {
            if (settings.boundary === '_marker') {
                return this._drawnItemsMarker;
            } else if (settings.boundary === '_me') {
                //shape map for Near Me is the last LatLng found
                return this._lastLocationFound;
            }
        }
        return null;
    },


    _restoreWithinSettings: function(settings) {
        this.setWithinBoundaryOption(settings.boundary);

        //manually trigger boundary change to refresh UI
        this._onBoundaryChange({target: $('#geofilter-within-bounds')});

        //do this last so it reflects last on UI
        this.setWithinBoundaryValue(settings);
    },

    _restoreNearSettings: function(settings) {
        this.setNearBoundaryOption(settings.boundary);

        //manually trigger boundary change to refresh UI
        this._onNearReferenceChange({target: $('#geofilter-near-bounds')});

        //do this last so it reflects last on UI
        this.setNearBoundaryValue(settings);
    },


    //o is array of geoJson long,lat arrays
    _lngLat2LatLng: function(o) {
        var a = $.map(o, function(v, i) {
            //flip coordinates
            return [ [v[1], v[0]] ];
        });
        return a;
    },

    //featureGroup - group to add new rendered geoJson object to
    _renderGeoJson: function(geoJson, featureGroup) {
        featureGroup.clearLayers();
        var me = this;
        $.each(geoJson.features, function(i, v) {
            var p = null;
            if (v.geometry.type === 'Polygon') {
                //render a polygon
                p = L.polygon(me._lngLat2LatLng((v.geometry.coordinates[0])), {color: me._options.defaultPolyColor});
            } else if (v.geometry.type === 'Point') {
                //render a point
                p = L.marker( L.latLng(v.geometry.coordinates[1], v.geometry.coordinates[0]));
            }
            if (p) {
                //need to tag our layers so they're not cleared by map (we are responsible for clearing it)
                p.isGeoFilter = true;
                p.addTo(me._options.map);
                featureGroup.addLayer(p);
            }
        });
    },


    //public methods
    reset: function() {
        //clear Near option
        this.setNearBoundaryOption('');

        //manually trigger event on change in option value
        this._onNearReferenceChange({target: $('#geofilter-near-bounds')});

        //clear Within option
        this.setBoundaryType('within');

        this.setWithinBoundaryOption('_map-extent');

        //manually trigger event on change in option value
        this._onBoundaryChange({target: $('#geofilter-within-bounds')});
    },

    setWithinBoundaryValue: function(settings) {
        if (settings.boundary === '_drawn-extent') {
            //value is geoJson of polygon features
            this._renderGeoJson(settings.value, this._lookupWithinBounds('_drawn-extent').data);
        } else  {
            //actual value
            $('#geofilter-within-bounds-values').val(settings.value);
        }
    },

    setNearBoundaryValue: function(settings) {
        if (settings.boundary === '_marker') {
            //value is geoJson of marker features
            this._renderGeoJson(settings.value, this._drawnItemsMarker);

            //set radius values
            $('.adv-search-geofilter input[name="distanceOption"][value="' + settings.maxRadiusUnit + '"]').prop('checked', true);

            //need to manually trigger re-population of distance values
            this._onDistanceUnitChange({target: $('#geofilter-near-bounds-maxradius input[value="' + settings.maxRadiusUnit + '"]')});

            $('#geofilter-near-bounds-maxdistance').val(settings.maxRadius);
        } else if (settings.boundary === '_me') {
            //no value for Near Me
            //set radius values
            $('.adv-search-geofilter input[name="distanceOption"][value="' + settings.maxRadiusUnit + '"]').prop('checked', true);

            //need to manually trigger re-population of distance values
            this._onDistanceUnitChange({target: $('#geofilter-near-bounds-maxradius input[value="' + settings.maxRadiusUnit + '"]')});

            $('#geofilter-near-bounds-maxdistance').val(settings.maxRadius);
        }
    },


    //returns geoJson object filtered against boundaries selected/drawn
    filterData: function(data) {
        var settings = this.getSettings();
        var f = ogrid.geoFilterFactory({
            map: this._options.map,
            shapeMap: this._getShapeMap(settings)
        }).getFilter(settings);
        return f.filter(data);
    },


    //returns geometry objects for sending to service
    getGeoFilter: function() {
        var settings = this.getSettings();
        var f = ogrid.geoFilterFactory({
            map: this._options.map,
            shapeMap: this._getShapeMap(settings)
        }).getFilter(settings);
        console.log(f.getGeometry());
        return f.getGeometry();
    },


    setBoundaryType: function(boundaryType) {
        $('.adv-search-geofilter input[name="boundaryOption"][value="' + boundaryType + '"]').prop('checked', true);
    },

    setWithinBoundaryOption: function(boundary) {
        $('#geofilter-within-bounds').val(boundary);
    },

    setNearBoundaryOption: function(boundary) {
        $('#geofilter-near-bounds').val(boundary);
    },

    //can be used to restore the geo filters from a DB
    restoreSettings: function(settings) {
        this.setBoundaryType(settings.boundaryType);
        if (settings.boundaryType === 'within')
            this._restoreWithinSettings(settings);
        else if (settings.boundaryType === 'near')
            this._restoreNearSettings(settings);
        else
            throw ogrid.error('Advanced Search (ogrid.GeoFilter)', 'Unknown boundary type \'' + settings.boundary + '\'');
    },




    //can be used to get an object that represents the state of geoFilters that can be saved
    getSettings: function() {
        var o = {};
        o.boundaryType = $('.adv-search-geofilter input[name="boundaryOption"]:checked').val();
        if (o.boundaryType === 'within') {
            o.boundary = $('#geofilter-within-bounds').val();
            switch(o.boundary) {
                case '':
                    break;
                case '_map-extent':
                    //no value, dynamic boundary
                   break;
                case '_drawn-extent':
                    o.value = this._getDrawnExtentValue();
                    break;
                default:
                    o.value = $('#geofilter-within-bounds-values').val();
            }
        } else {
            //near
            o.boundary = $('#geofilter-near-bounds').val();
            if (o.boundary==='_marker') {
                o.value = this._getMarkerValue();
                o.maxRadius = $('#geofilter-near-bounds-maxdistance').val();
                o.maxRadiusUnit = $('#geofilter-near-bounds-maxradius input[name="distanceOption"]:checked').val();
            } else if (o.boundary==='_me') {
                o.value = null; //no value needed as we'll be getting the location LatLng realtime
                o.maxRadius = $('#geofilter-near-bounds-maxdistance').val();
                o.maxRadiusUnit = $('#geofilter-near-bounds-maxradius input[name="distanceOption"]:checked').val();
            }

        }
        return o;
    },

    getBoundaryType: function() {
        return $('.adv-search-geofilter input[name="boundaryOption"]:checked').val();
    },

    getWithinBoundaryOption: function() {
        return $('#geofilter-within-bounds').val();
    },

    getNearBoundaryOption: function() {
        return $('#geofilter-near-bounds').val();
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.geoFilter = function (container, options) {
    return new ogrid.GeoFilter(container, options);
};