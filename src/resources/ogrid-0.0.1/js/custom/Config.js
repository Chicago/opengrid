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

    map: {
        baseMapUrl: 'http://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
        baseLayers:[],
        center: [41.88432, -87.65211],
        zoom: 14,
        minZoom: 8,

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
        //endpoint: 'https://webapps1int.cityofchicago.org/opengridservice/rest',
        timeout: 60000 //timeout in ms
    }
}