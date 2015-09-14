/*
 * ogrid.TileMapByBoundary
 *
 * Class for generating tile map/chropleth based on geographic boundary and density/frequency of values within boundaries
 */

ogrid.TileMapByBoundary = ogrid.Class.extend({
    //private attributes
    _map: null,
    _points: null,
    _options:{
        //default options
        chromaColors: ['#f7fcf5', '#00441b'],
        dataClasses: 5,
        borderColor: '#525252'
    },
    _layerGroup: null,

    //public attributes


    //constructor
    init: function(map, points, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._map = map;
        this._points = points;

    },


    //private methods
    _validate: function() {
        //make sure we have all the data that we needed

        //later
    },

    _getCountsByBoundary: function(latlngs, layers) {
        var c={};
        $.each(latlngs, function(i, v) {
            //t1 = (new Date()).getTime();
            $.each(layers, function (j, w) {
                var r = leafletPip.pointInLayer(v, w.layer);
                if (r && (r.length > 0)) {
                    //c[w.boundaryId] = (c[w.boundaryId] ? c[w.boundaryId]++ : 1);
                    if (c.hasOwnProperty(w.boundaryId)) {
                        c[w.boundaryId]++;
                    } else {
                        c[w.boundaryId] = 1;
                    }

                    //we're only expecting 1 hit per point
                    return;
                }
            });
            //t2 = (new Date()).getTime();
            //console.log('pointInLayer per point: ' + (t2 - t1));
        });
        return c;
    },

    _getColorMap: function(max, dataClasses, scale) {
        var k = Math.floor(max/dataClasses)+1;
        var j = 0;
        var m = [];
        for (var i=1;i<=dataClasses; i++) {
            //console.log(scale(j+1).hex() + ':' +  (j+1) + '-' + (j + k));
            m.push({color: scale(j+1).hex(), min: (j+1), max: (j + k)});
            j+=k;
        }
        return m;
    },

    _showGeoJsonLayer: function(boundId, layer, count, color) {
        if (!this._layerGroup) {
            this._layerGroup = new L.LayerGroup();

            var opt = {};
            if (this._layerGroup.hasOwnProperty('options')) {
                opt = this._layerGroup.options;
            }
            this._layerGroup.options = $.extend(opt, {className: 'layer-opengrid'});
        }
        layer.setStyle({
            color: this._options.borderColor,
            fillColor: color,
            weight: 2,
            opacity: 1,
            fillOpacity:0.85
        });
        layer.bindPopup('<b>Boundary ID:</b>&nbsp' + boundId + '<br><b>Color:</b>&nbsp' + color + '<br><b>Occurences:</b>&nbsp' + (typeof count!='undefined' ? count : 0));
        //layer.addTo(this._map);

        layer.addTo(this._layerGroup);
        return L.Util.stamp(layer);
    },

    //public methods

    //Leaflet map
    getMap: function() {
        return this._map;
    },

    setMap: function(map) {
        this._map = map;
    },

    //array of boundary ids to group data/points by
    //if not passed shape map data is used
    getBoundaryKeys: function() {
        return this._options.boundaryKeys;
    },

    setBoundaryKeys: function(keys) {
        this._options.boundaryKeys = keys;
    },

    //shape geoJson data by boundary id
    getShapeMap: function() {
        return this._options.shapeMap;
    },

    setShapeMap: function(shapeMap) {
        this._options.shapeMap = shapeMap;
    },

    //share service Url to call when boundary id geoJson is not on the shapeMap data
    getShapeServiceUrl: function() {
        return this._options.shapeServiceUrl;
    },


    setShapeServiceUrl: function(shapeServiceUrl) {
        this._options.shapeServiceUrl = shapeServiceUrl;
    },

    getPoints: function() {
        return this._points;
    },

    setPoints: function(points) {
        this._points = points;
    },


    getDataClasses: function() {
        return this._options.dataClasses;
    },

    setDataClasses: function(dataClasses) {
        this._options.dataClasses = dataClasses;
    },

    //starting and ending chroma colors to use (2-element array)
    getChromaColors: function() {
        return this._options.chromaColors;
    },

    setChromaColors: function(chromaColors) {
        this._options.chromaColors = chromaColors;
    },

    //returns array of colors and ranges used by data class/level
    //useful for building legends
    generate: function() {
        this._validate();

        //create map layers and store them in an array
        var layers = [];
        var me = this;
        $.each(this.getBoundaryKeys(), function(i,v) {
            var o = me.getShapeMap().getShapeByBoundaryId(v);
            if (ogrid.isNull(o)) {
                //call service to get shape data
            }
            if (o) {
                layers.push({boundaryId: v, layer: L.geoJson(o, {className: 'layer-opengrid'})});
            }
        });

        //get count of points per boundary
        //this logic may need to change if gradient won't be based on density
        var counts = this._getCountsByBoundary(this.getPoints(), layers);

        //get max count from summary counts
        var max=0;
        $.each(counts, function(i, v) {
            if (v > max)
                max = v;
        });

        //construct our chroma based on max, # of data classes and chroma colors
        var scale = chroma.scale(
            this.getChromaColors()
        ).domain([0, max], this.getDataClasses());

        //build color map to return to called for legend
        var colorMap = this._getColorMap(max, this.getDataClasses(), scale);


        var ids = [];

        //show styled geoJsonlayers
        $.each(layers, function(i, v) {
            //only show zip codes with data
            //if (counts.hasOwnProperty(v.boundaryId) && counts[v.boundaryId] > 0) {
            ids.push ( me._showGeoJsonLayer(v.boundaryId, v.layer, counts[v.boundaryId], scale(counts[v.boundaryId]).hex()) );
            //} else {
            //    console.log('No data for zip ' + v.boundaryId);
            //}
        });

        //returns color map used (for legend) and leaflet layer IDs
        return {colorMap: colorMap, layerIds: ids, layerGroup: this._layerGroup };
    }

});