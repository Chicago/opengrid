/*
 * ogrid.ChicagoZipShapeMap
 *
 * Base shape map for boundaries
 */


ogrid.ChicagoCityShapeMap = ogrid.ShapeMap.extend({
    //private attributes
    _geoJson: {
        "chicago":{"type":"FeatureCollection","features":[{
            "type" : "Feature",
            "properties" : { },
            "geometry" : {
                "type" : "Polygon",
                "coordinates" : [[[-87.963409423828125, 42.020732852644294], [-87.639312744140625, 42.03093424950211], [-87.584381103515625, 41.887965758804484], [-87.600860595703125, 41.846035700593518], [-87.507476806640625, 41.735454184907233], [-87.51434326171875, 41.631867410697481], [-87.757415771484375, 41.702652661174753], [-87.7587890625, 41.764141783336456], [-87.765655517578125, 41.845012672706922], [-87.842559814453125, 41.908409465911092], [-87.95928955078125, 41.9829734519797], [-87.963409423828125, 42.020732852644294]]]
            }
        }]}
    },

    //public attributes

    //constructor
    init: function( options) {
        if (options) {
            //one of the options is the service URL to call if id cannot be looked up
            this._options = ($.extend(this._options, options));
        }
        //this._super.prototype.setData(this._geoJson);
    },

    //private methods


    //public methods
});


//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.chicagoCityShapeMap = function (options) {
    return new ogrid.ChicagoCityShapeMap(options);
};
