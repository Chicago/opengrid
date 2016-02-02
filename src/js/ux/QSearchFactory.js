/*
 * ogrid.QSearchFactory
 *
 * Factory for Quick Search classes
 */


ogrid.QSearchFactory = {};

//returns quick search object given a quick search input string
ogrid.QSearchFactory.parse = function(inputString) {
    if (ogrid.Config.quickSearch.mock) {
        return ogrid.QSearchFactory.mockParse(inputString);
    } else {
        var qsProvider = null;

        //match with regex from plug-ins
        $.each(ogrid.Config.quickSearch.plugins, function(i, v) {
            if (v.test(inputString)) {
                qsProvider = v;

                //break from each loop
                return false;
            }
        });
        if (qsProvider) return qsProvider;
    }
    //default provider
    if (ogrid.Config.quickSearch.plugInOptions) {
        return ogrid.QSearchProcessor.place(ogrid.Config.quickSearch.plugInOptions.places);
    }
    return ogrid.QSearchProcessor.place();

    //throw ogrid.error('Quick Search Error', 'Unrecognized command \'' + inputString + '\'.');
};


ogrid.QSearchFactory.mockParse = function(inputString) {
    //mock this up for now
    var o = null;

    //use regex pattern later
    if (inputString.indexOf(',') > -1 ) {
        o = new ogrid.QSearchProcessor.LatLng(inputString);
    } else if (inputString === 'tweet') {
        o = new ogrid.QSearchProcessor.Tweet(inputString);
    } else if (inputString === 'weather') {
        o = new ogrid.QSearchProcessor.Weather(inputString);
    } else
        //default is geo-search
        throw ogrid.error('Quick Search Error', 'Unrecognized command \'' + inputString + '\'.');
        //o = new ogrid.QSearchProcessor.Place(inputString);

    return o;
};