/*
 * ogrid.QSearchFactory
 *
 * Factory for Quick Search classes
 */


ogrid.QSearchFactory = {};

//returns quick search object given a quick search input string
ogrid.QSearchFactory.parse = function(inputString) {
    if (ogrid.Config.quickSearch.mock) {
        return ogrid.QSearchFactory.mockParse(inputString)
    } else {
        //match with regex from plug-ins
        for (var i=0; i < ogrid.Config.quickSearch.plugins.length; i++) {
            //use eval until we find another method that works (new window['class name'] does not work for some reason
            if ( eval(ogrid.Config.quickSearch.plugins[i] + '.pattern.test(inputString)') ) {
                return eval('new ' + ogrid.Config.quickSearch.plugins[i] + '(inputString)');
            }
        }
    }
    //default provider
    return new ogrid.QSearchProcessor.Place(inputString);

    //throw ogrid.error('Quick Search Error', 'Unrecognized command \'' + inputString + '\'.');
}

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
}