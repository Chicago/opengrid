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
            //hide some of the available buttons on the results grid by setting the flags below
            showHeatmap: true,
            showTilemap: false,
            showGraph: true,

            resizable: true
        },
        arrayPopoverMax: 100
    },

    map: {
        //first base layer becomes base layer selected by default
       baseLayers:[{
            name: 'Streets',
           // url:'https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
            //flag to indicate whether Esri's tiledMapLayer plug-in class will be used
           url:'https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFub2puZWxha3VydGhpIiwiYSI6ImNpcTJmcW96MDAxNDJmdG00MDV4dms1M2QifQ.Gac-ef2dr0xsmgkMbgD9zw',
			useEsri: false,
            options: {
                attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }}
        , 
		{
            name: 'Black and White',
           
           url:'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            useEsri: false,
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
        }, 
		
		{
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
            url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?APPID=8e0f9d1de886ff78c6bab40f2e6d1afe',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.40
            }
        },{
            groupName: 'Open Weather Layers',
            name: 'Quantity of Precipitation',
            url: 'http://{s}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?APPID=8e0f9d1de886ff78c6bab40f2e6d1afe',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.40
            }
        }, {
            groupName: 'Open Weather Layers',
            name: 'Sea Level Pressure',
            url: 'http://{s}.tile.openweathermap.org/map/pressure_cntr/{z}/{x}/{y}.png?APPID=8e0f9d1de886ff78c6bab40f2e6d1afe',
            useEsri: false,
            options: {
                attribution: 'Map data (c) OpenWeatherMap',
                maxZoom: 18,
                opacity: 0.65
            }
        }, {
            groupName: 'Open Weather Layers',
            name: 'Temperature',
            url: 'http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?APPID=8e0f9d1de886ff78c6bab40f2e6d1afe',
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
            completedColor: '#fc9272',
			position: 'bottomleft'
			
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
        },

        //flag to indicate whether to auto-resubmit query when map extent changes
        autoRequery: true
    },

    //quick search plug-ins
    quickSearch: {
        mock: false,
        plugins: [
            ogrid.QSearchProcessor.latLng(),
            ogrid.QSearchProcessor.flexData() //this replaces the Tweet and Weather Quick Search processors

            //Place/Address search is built-in
        ],
        helpFile: 'templates/qsearch-help.html',
        plugInOptions: {
            places: {
                //slightly larger than Chicago
                //around E. Central Rd (Mt. Prospect)&290 and Rt 80 and Rt 65
                esriGeocodeBBox: '-88.02864,42.06663,-87.30011,41.56614',

                //add this for more Chicago-centric results esp. with POIs
                esriGeocodeLocation: '-87.63940, 41.87440',
                esriGeocodeMaxResults: 20,

                //filter non-POI results using this geoJson shape
                esriGeocodeFilterUsingShape: ogrid.chicagoCityShapeMap().getData().chicago,
            }
        },
    },

    //advanced search options
    advancedSearch: {
        geoFilterBoundaries: [
            {id:'citywide', displayName:'Citywide', data:ogrid.chicagoCityShapeMap().getData()},
            {id:'zip-code', displayName:'Zip Code', data: ogrid.chicagoZipShapeMap().getData()},
            {id:'ward', displayName:'Ward', data: ogrid.chicagoWardsShapeMap().getData()}
        ],
        //customize this with a query definition/object to autoload on start up
        //sample query object is returned from /queries resource
        autoLoadQuery: null
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
        //turn autologin for use cases where service is public or not secured
        autologin: true,
        autologinUserId: "NoAuth",
        autologinPassword: "NoAuth",

        //default endpoint to the same context root, customize as needed
        //or override in config/EnvSettings.js if there are environment-specific endpoints
        endpoint: document.location.href.split("/opengrid/")[0]+"/opengrid-service/rest",
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
    },
    help: {
        //by default, the OpenGrid User documentation URL is on the main HTML file
        //this setting overrides that
        url: 'http://opengrid.readthedocs.org/en/latest/User%20Documentation',
        type: 'icon' //valid values are 'button' or 'icon'
    }
};
