/*
 * ogrid.Event
 *
 *  Event-related util methods
 */

ogrid.Event = {
    //types of events
    types: {
        REFRESH_DATA: 'refresh_data',
        CLEAR: 'clear'
    }
};

ogrid.Event.raise =  function (evtName, evtData) {
    $.event.trigger({
        type: evtName,
        message: evtData,
        time: new Date()
    });
}

//subscribe
ogrid.Event.on =  function(evtName, evtHandler) {
    $(document).on(evtName, evtHandler);
}

    //unsubscribe
ogrid.Event.off = function(evtName) {
        $(document).off(evtName);
}