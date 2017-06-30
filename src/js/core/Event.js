/*
 * ogrid.Event
 *
 *  Event-related util methods
 */

ogrid.Event = {
    //types of events
    types: {
        REFRESH_DATA: 'refresh_data',
        CLEAR: 'clear',
        MAP_OVERLAY_ADD: 'map_overlay_add',
        MAP_OVERLAY_REMOVE: 'map_overlay_remove',
        MAP_RESULTS_DONE: 'map_results_done',
        LOGGED_IN: 'logged_in',
        LOGGED_OUT: 'logged_out',
        MOBILE_MODE_CHANGED: 'mobile_mode_changed',
        MAP_EXTENT_CHANGED: 'map_extent_changed',
        ADVANCED_INIT_DONE: 'advanced_init_done'
    }
};

ogrid.Event.raise =  function (evtName, evtData) {
    $.event.trigger({
        type: evtName,
        message: evtData,
        time: new Date()
    });
};

//subscribe
ogrid.Event.on =  function(evtName, evtHandler) {
    $(document).on(evtName, evtHandler);
};

    //unsubscribe
ogrid.Event.off = function(evtName) {
        $(document).off(evtName);
};