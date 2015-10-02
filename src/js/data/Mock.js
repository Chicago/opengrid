/*
 * ogrid.Mock.js
 */


ogrid.Mock = {
    //mock data for testing
    data:  {
        address: {

        },
        place: {

        },
        tweet: {
            "type" : "FeatureCollection",
            "features" : [
                {
                    "type": "Feature",
                    "properties": {
                        "_id": "197479705333600257",
                        "date": "01/01/2014 05:01 pm",
                        "screenName": "MissSticker",
                        "text": "@KarynTeaches @mentortexts @howeprincipal LOVE. This.",
                        "city": "Chicago, IL",
                        "bio": "National Board Certified First Grade Teacher",
                        "hashtags": "#love #howeprincipal",
                        "lat": 41.87817, //41.87817, -87.62766 -> Jackson and State
                        "long": -87.62766
                    },
                    "geometry": {"type": "Point", "coordinates": [-87.62766, 41.87817]},
                    "autoPopup": true
                },
                {
                    "type": "Feature",
                    "properties": {
                        "_id": "197479705333600258",
                        "date": "01/01/2014 05:10 pm",
                        "screenName": "CynderRoach",
                        "text": "@Kickintheeteeth :D",
                        "city": "Chicago, IL",
                        "bio": "National Board Certified First Grade Teacher",
                        "hashtags": "#love #howeprincipal",
                        "lat": 41.88563,
                        "long":-87.61846
                    },
                    //42.00543, -88.53882 - outside city
                    //"geometry": {"type": "Point", "coordinates": [-87.61846, 41.88563]},
                    //"geometry": {"type": "Point", "coordinates": [-88.53882, 42.00543]},
                    //41.89402, -87.63264 -> zip 60654
                    //Near Me
                    //Near Home
                    //41.92145, -88.36

                    //Monroe and state
                    //41.88073, -87.62782
                    "geometry": {"type": "Point", "coordinates": [-87.62782, 41.88073]},
                    "autoPopup": true
                }
            ],
            //meta view formatting overrides default from dataset descriptor
            "meta": {
                "view": {
                    "id": "twitter", "displayName": "Twitter",
                    "options": {
                        "rendition": {
                            "icon":"default",
                            "color": "cyan",
                            "fillColor": "yellow",
                            "opacity":85,
                            "size":10
                        }
                    },
                    "columns": [
                        {"id":"_id", "displayName":"ID", "dataType":"string", "filter":false, "popup":false, "list":false},
                        {"id":"date", "displayName":"Date", "dataType":"date", "filter":true, "popup":true, "list":true, "sortOrder":1},
                        {"id":"screenName", "displayName":"Screen Name", "dataType":"string", "filter":true, "popup":true, "list":true, "sortOrder":2},
                        {"id":"text", "displayName":"Text", "dataType":"string", "filter":true, "popup":true, "list":true, "sortOrder":3},
                        {"id":"city", "displayName":"City", "dataType":"string", "filter":true, "popup":true, "list":true, "sortOrder":4},
                        {"id":"bio", "displayName":"Bio", "dataType":"string","sortOrder":5},
                        {"id":"hashtags", "displayName":"Hashtags", "dataType":"string", "sortOrder":6},
                        {"id":"lat", "displayName":"Latitude", "dataType":"float", "list":true, "sortOrder":7},
                        {"id":"long", "displayName":"Longitude", "dataType":"float", "list":true, "sortOrder":8}
                    ]
                }
            }
        },
        weather: {
            "type" : "FeatureCollection",
            "features" : [
                {
                    "type": "Feature",
                    "properties": {
                        "_id": "197479705333600260",
                        "temp": 54.5 ,
                        "windspeed": 5,
                        "condition": "Mostly Cloudy",
                        "humidity": 0.73,
                        "precipIntensity": 0,
                        "date": "05/20/2015 4:56 pm",
                        "zipcode": 60601,
                        "forecast": "Mixed precipitation in the morning and evening",
                        "icon": "partly-cloudy-day",
                        "lat": 41.88563,
                        "long":-87.61846
                    },
                    "geometry": {"type": "Point", "coordinates": [-87.61846, 41.88563]},
                    "autoPopup": true
                }
            ],
            //meta view formatting overrides default from dataset descriptor
            "meta": {
                "view": {
                    "id": "weather",
                    "displayName": "Weather",
                    "options": {
                        "rendition": {
                            "icon":"marker",
                            "color": "cyan",
                            "fillColor": "#f03",
                            "opacity":85,
                            "size":10
                        }
                    },
                    "columns": [
                        {"id":"_id", "displayName":"ID", "dataType":"string", "filter":false, "popup":false, "list":false},
                        {"id":"temp", "displayName":"Temperature", "dataType":"float", "filter":true, "popup":true, "list":true, "sortOrder":1},
                        {"id":"windspeed", "displayName":"Wind Speed", "dataType":"float", "filter":true, "popup":true, "list":true, "sortOrder":2},
                        {"id":"condition", "displayName":"Condition", "dataType":"string", "filter":true, "popup":true, "list":true, "sortOrder":3},
                        {"id":"humidity", "displayName":"Humidity", "dataType":"float", "filter":true, "popup":true, "list":true, "sortOrder":4},
                        {"id":"precipIntensity", "displayName":"Precipitation Intensity", "dataType":"float", "filter":true, "popup":true, "list":true, "sortOrder":5},
                        {"id":"date", "displayName":"Date", "dataType":"date", "filter":true, "popup":true, "list":true, "sortOrder":5},
                        {"id":"zipcode", "displayName":"Zip Code", "dataType":"number", "filter":true, "popup":true, "list":true, "sortOrder":6, "values":[60601,60602]},
                        {"id":"forecast", "displayName":"Today's Forecast", "dataType":"string", "popup":true, "list":true, "sortOrder":7},
                        {"id":"icon", "displayName":"Icon", "dataType":"graphic", "popup":true, "sortOrder":7},
                        {"id":"lat", "displayName":"Latitude", "dataType":"float", "list":true, "sortOrder":8},
                        {"id":"long", "displayName":"Longitude", "dataType":"float", "list":true, "sortOrder":9}
                    ]
                }
            }
        },
        longlat: {
            //old bad structure
            "type" : "FeatureCollection",
            "features" : [
                {
                    "type": "Feature",
                    "properties": { "date": "Daley Center", "amenity": "Government Offices",  "popupContent": "This is where DoIT lives!",  "style": "{color:green}" },
                    "geometry": { "type": "Point", "coordinates": [-87.63024, 41.88406] }
                }
            ]
        },
        datasets: [{
            "id" : "twitter",
            "displayName" : "Twitter",
            "options" : {
                "rendition" : {
                    "icon" : "default",
                    "color" : "#001F7A",
                    "fillColor" : "#00FFFF",
                    "opacity" : 85,
                    "size" : 6
                }
            },
            "dataSource" : {
                "sourceName" : "opengrid_data",
                "dbConnectionString" : "Bacon ipsum dolor amet doner chuck tail bresaola",
                "baseFilter" : "{'type' : 'tweet'}"
            },
            "quickSearch" : {
                "enable" : true,
                "triggerWord": 'tweet',
                "triggerAlias": 'twe'
            },
            "columns" : [{
                "id" : "_id",
                "displayName" : "ID",
                "dataType" : "string",
                "filter" : false,
                "popup" : false,
                "list" : false
            }, {
                "id" : "date",
                "displayName" : "Date",
                "dataType" : "date",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 1
            }, {
                "id" : "screenName",
                "displayName" : "Screen Name",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 2,
                "groupBy" : true,
                "quickSearch" : true
            }, {
                "id" : "text",
                "displayName" : "Text",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 3,
                "quickSearch" : true
            }, {
                "id" : "city",
                "displayName" : "City",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 4,
                "groupBy" : true,
                "quickSearch" : true
            }, {
                "id" : "bio",
                "displayName" : "Bio",
                "dataType" : "string",
                "sortOrder" : 5
            }, {
                "id" : "hashtags",
                "displayName" : "Hashtags",
                "dataType" : "string",
                "sortOrder" : 6
            }, {
                "id" : "lat",
                "displayName" : "Latitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 7
            }, {
                "id" : "long",
                "displayName" : "Longitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 8
            }]
        }, {
            "id" : "weather",
            "displayName" : "Weather",
            "options" : {
                "rendition" : {
                    "icon" : "default",
                    "color" : "#8c2d04",
                    "fillColor" : "#fdae6b",
                    "opacity" : 85,
                    "size" : 6
                }
            },
            "dataSource" : {
                "sourceName" : "opengrid_data",
                "dbConnectionString" : "Bacon ipsum dolor amet doner chuck tail bresaola",
                "baseFilter" : "{'type' : 'weather'}"
            },
            "quickSearch" : {
                "enable" : true,
                "triggerWord": 'weather',
                "triggerAlias": 'wea'
            },
            "columns" : [{
                "id" : "_id",
                "displayName" : "ID",
                "dataType" : "string",
                "filter" : false,
                "popup" : false,
                "list" : false
            }, {
                "id" : "temp",
                "displayName" : "Temperature",
                "dataType" : "float",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 1,
                "quickSearch" : true
            }, {
                "id" : "windspeed",
                "displayName" : "Wind Speed",
                "dataType" : "float",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 2
            }, {
                "id" : "condition",
                "displayName" : "Condition",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 3,
                "quickSearch" : true
            }, {
                "id" : "humidity",
                "displayName" : "Humidity",
                "dataType" : "float",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 4
            }, {
                "id" : "precipIntensity",
                "displayName" : "Precipitation Intensity",
                "dataType" : "float",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 5
            }, {
                "id" : "date",
                "displayName" : "Date",
                "dataType" : "date",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 5
            }, {
                "id" : "zipcode",
                "displayName" : "Zip Code",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "sortOrder" : 6,
                "groupBy" : true,
                "quickSearch" : true
            }, {
                "id" : "forecast",
                "displayName" : "Today's Forecast",
                "dataType" : "string",
                "popup" : true,
                "list" : true,
                "sortOrder" : 7
            }, {
                "id" : "icon",
                "displayName" : "Icon",
                "dataType" : "graphic",
                "popup" : true,
                "sortOrder" : 7
            }, {
                "id" : "lat",
                "displayName" : "Latitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 8
            }, {
                "id" : "long",
                "displayName" : "Longitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 9
            }]
        },{
            "id" : "business_licenses",
            "displayName" : "Business Licenses",
            "options" : {
                "rendition" : {
                    "icon" : "default",
                    "color" : "#001F7A",
                    "fillColor" : "#00FFFF",
                    "opacity" : 85,
                    "size" : 6
                },
                "latLong" : "where.latitude,where.longitude"
            },
            "dataSource" : {
                "sourceName" : "business_licenses",
                "dbConnectionString" : "Bacon ipsum dolor amet doner chuck tail bresaola"
            },
            "quickSearch" : {
                "enable" : true,
                "triggerWord": 'license',
                "triggerAlias": 'lic'
            },
            "columns" : [{
                "id" : "_id",
                "displayName" : "ID",
                "dataType" : "string",
                "filter" : false,
                "popup" : false,
                "list" : false
            }, {
                "id" : "what.legal_name",
                "displayName" : "Legal Name",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "quickSearch" : true
            }, {
                "id" : "what.doing_business_as",
                "displayName" : "Doing Business As",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "quickSearch" : true
            }, {
                "id" : "where.address",
                "displayName" : "Address",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "quickSearch" : true
            }, {
                "id" : "what.lic_description",
                "displayName" : "Description",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "quickSearch" : true
            }, {
                "id" : "what.lic_status",
                "displayName" : "Status",
                "dataType" : "string",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "quickSearch" : true,
                "groupBy" : true
            }, {
                "id" : "when.shardtime",
                "displayName" : "Issued Date",
                "dataType" : "date",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "groupBy" : true
            }, {
                "id" : "when.expiration_date",
                "displayName" : "Expiration Date",
                "dataType" : "date",
                "filter" : true,
                "popup" : true,
                "list" : true,
                "groupBy" : true
            }, {
                "id" : "where.lat",
                "displayName" : "Latitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 8
            }, {
                "id" : "where.long",
                "displayName" : "Longitude",
                "dataType" : "float",
                "list" : true,
                "sortOrder" : 9
            }]
        }
        ]
    }
};