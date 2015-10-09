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

    session:{
        //timeout: 2, //2 minutes for testing
        timeout: 30, //30 minutes

        //token renewal interval in minutes, should be shorter than expiration time set by service (currently 4 hours)
        tokenRenewalInterval: 180 //3 hours
    },


    alerts: {
        autoCloseDuration: 15000 //in ms
    },

    table: {
        height: '40%', //height of the table in px or %, if px, just use value without 'px' at the end

        //static options
        bootstrapTableOptions: {
            classes: 'table table-hover table-condensed',
            striped: true,
            reorderableColumns: true,
            maxMovingRows: 5,
            pagination: true,
            flat: true, //activate flatJson plug-in to enable use of dot notation
            pageList: [10, 25, 50, 100, 'All'],

            //toolbar
            search: true,
            showColumns: true,
            showExport: true,
            exportTypes: ['csv', 'excel', 'pdf'],
            jspdf: {
                orientation: 'p', unit:'pt', format:'a4',
                margins: {left: 20, right: 10, top: 10, bottom: 10},
                autotable: {padding: 2, lineHeight: 120, fontSize: 8}

            },
            exportOptions: {
                jspdf: {
                    orientation: 'l', unit:'pt', format: 'a4',
                    margins: {left: 20, right: 10, top: 10, bottom: 10},
                    autotable: {padding: 2, lineHeight: 12, fontSize: 8},
                    htmlContent: true
                }
            },
            showHeatmap: true,
            showTilemap: true,
            showGraph: true,
            resizable: true
        }
    },

    map: {
        //first base layer becomes base layer selected by default
        baseLayers:[{
            name: 'Streets',
            url:'https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
            //flag to indicate whether Esri's tiledMapLayer plug-in class will be used
            useEsri: true,
            options: {
                attribution: 'City of Chicago, Esri, HERE, DeLorme, METI/NASA, USGS, USDA, EPA'
            }
        }, {
            name: 'Aerial',
            url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            useEsri: false,
            options: {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }
        }
        ],
        //additional layers
        //can be a service URL or an object with the same structure as the base layer objects
        overlayLayers: [{
            groupName: 'Open Weather Layers',
            name: 'Cloud Cover',
            url: 'http://{s}.tile.openweathermap.org/clouds/precipitation/{z}/{x}/{y}.png',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.40
            }
        },{
            groupName: 'Open Weather Layers',
            name: 'Quantity of Precipitation',
            url: 'http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.40
            }
        }, {
            groupName: 'Open Weather Layers',
            name: 'Sea Level Pressure',
            url: 'http://{s}.tile.openweathermap.org/map/pressure_cntr/{z}/{x}/{y}.png',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.65
            }
        }, {
            groupName: 'Open Weather Layers',
            name: 'Temperature',
            url: 'http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.40
            }
        },
        ],

        mapLibraryOptions : {
            center: [41.88432, -87.65211],
            zoom: 14,
            minZoom: 3,
            imagePath: 'images'
        },
        //flag to indicate if we're going to auto-zoom after a 'manual' search (via quick or advanced search, not auto-refresh)
        zoomToResultsExtent: true,

        measureOptions: {
            activeColor: '#fc9272',
            completedColor: '#fc9272'
        },

        tileMapOptions: {
            zip: {
                label: 'By ZipCode',
                shapeMap: ogrid.chicagoZipShapeMap()
            },
            //mock for testing
            ward: {
                label: 'By Ward',
                shapeMap: ogrid.chicagoWardsShapeMap()
            },
            none: {
                label: "None"
            }
        }

    },

    //quick search plug-ins
    quickSearch: {
        mock: false,
        plugins: [
            ogrid.QSearchProcessor.latLng(),
            ogrid.QSearchProcessor.flexData() //this replaces the Tweet and Weather Quick Search processors

            //Place/Address search is built-in
        ],
        helpFile: 'templates/qsearch-help.html'
    },

    //advanced search options
    advancedSearch: {
        geoFilterBoundaries: [
            {id:'citywide', displayName:'Citywide', data:ogrid.chicagoCityShapeMap().getData()},
            {id:'zip-code', displayName:'Zip Code', data: ogrid.chicagoZipShapeMap().getData()},
            {id:'ward', displayName:'Ward', data: ogrid.chicagoWardsShapeMap().getData()}
        ]
    },


    //commandbar buttons
    commandBar: {
        // TODO: implement command plug-ins
        commands: [
            {name:'Advanced Search', tooltip:'', handler: null,
                requiredAccess: [ ogrid.SecuredFunctions.ADVANCED_SEARCH  ]
            },
            {name:'Clear Data', tooltip:'', handler: null},
            {name:'Manage', tooltip:'', handler: null,
                requiredAccess: [ ogrid.SecuredFunctions.MANAGE  ]
            }
        ],
        //should be in sync with the BootStrap custom setting used for media breakpoint (currently 840px)
        //TODO: find out if there is a more dynamic way to read the media breakpoint used in BS
        mobileBreakPointWidth: 845
    },

    service: {
        endpoint: 'http://localhost:8080/opengridservice/rest',
        timeout: 60000,  //timeout in ms
        maxresults: 6000,
        authUrl: 'users/token',
        authRenewUrl: 'users/renew',

        //object for detecting and extracting error info from service response
        //this one is specific to our template service implementation
        errorHandler: ogrid.templateServiceErrorHandler(),

        //used for converting string to data value for comparing dates on auto-refresh highlighting
        //date format is determined by the service
        dateFormat: 'MM/DD/YYYY hh:mm:ss aa'
    }
};