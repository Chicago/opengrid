/*
 * ogrid.Config
 *
 * Application configuration
 */

ogrid.Config = {
    brand: {
        applicationName: 'OpenGrid',
        copyright: '(c) 2015',
        version: '0.0.1',
        logo:''
    },

    alerts: {
        autoCloseDuration: 15000 //in ms
    },

    table: {
        height: '33%' //height of the table in px or %, if px, just use value without 'px' at the end
    },

    map: {
        baseMapUrl: 'http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
        baseLayers:[],
        center: [41.88432, -87.65211],
        zoom: 14,
        minZoom: 5,

        //indicator to use Esri's Leaflet plug-in
        useEsri: true
    },

    //quick search plug-ins
    quickSearch: {
        mock: false,
        plugins: [
            'ogrid.QSearchProcessor.LatLng',
            'ogrid.QSearchProcessor.Weather',
            'ogrid.QSearchProcessor.Tweet'

            //Place/Address search is built-in
        ]
    },

    //commandbar buttons
    commandBar: {
        commands: [
            {name:'Advanced Find', tooltip:'', handler: null},
            {name:'Reset Search', tooltip:'', handler: null},
            {name:'Manage', tooltip:'', handler: null}
        ]
    },

    service: {
        endpoint: 'http://localhost:8080/opengridservice/rest',
        timeout: 60000,  //timeout in ms
        maxresults: 6000
    }
}