/*
 * ogrid.QueryScheduler
 *
 * Class for managing monitoring queries
 */

// Dependent on ogrid.Search

ogrid.QueryScheduler = ogrid.Class.extend({
    //private attributes
    _options:{},

    //hash map of scheduled objects
    //key is a guid
    _scheduled: {},

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods
    _execQuery: function(id, query) {
        var me = this;

        return function() {
            //do not execute if last one has not finished yet
            if (!me._scheduled[id].completed) {
                console.log("Query id " + id + ' has not finished yet.');
                return;
            }

            //our interceptors, we need to not let another query execute if the last has not finished yet
            var _good = function(targetSuccess) {
                return function(data, passThroughData) {
                    //perform some pre-processing
                    console.log(Date.now() + ': success pre-proc: ' + id);
                    me._scheduled[id].completed = true;

                    targetSuccess(data, passThroughData);
                };
            };

            var _bad = function(targetError) {
                return function(jqXHR, txtStatus, errorThrown, passThroughData) {
                    console.log(Date.now() + ': bad pre-proc: ' + id);
                    me._scheduled[id].completed = true;

                    targetError(jqXHR, txtStatus, errorThrown, passThroughData);
                };
            };
            console.log(Date.now() + ': ' + id);

            //clone search options
            var o = $.extend(true, {}, query.searchOptions);
            o.success = _good(o.success);
            o.error = _bad(o.error);

            //invoke search
            me._scheduled[id].completed = false;

            //pass additional data to success/error callbacks
            ogrid.Search.exec(o,
                //passthrough data passed to callback from Search caller
                {
                origin: 'queryScheduler',
                monitorData: {
                    //timer id
                    monitorId : id,

                    //search options and schedule
                    query: query
                }
            });
        };
    },

    //returns time interface in milliseconds
    _getMillis: function(schedule) {
        if (schedule.unit === 's') {
            return (schedule.every * 1000);
        } else if (schedule.unit === 'm') {
            return (schedule.every * 60000);
        } else
            throw ogrid.error('Query Scheduler', 'An interval unit of \'' + schedule.unit + '\' is not recognized.');
    },

    //public methods

    //adds a query definition to the schdule along with scheduling details
    addQuery: function(searchOptions) {
        //schedule: {every: X, unit: 's'/'m')

        var id = ogrid.guid();
        if (searchOptions.overrideId)
            //use-predetermined id instead
            id = searchOptions.overrideId;
        var timer = $.timer($.proxy(this._execQuery(id, searchOptions), this));

        //do not auto-start we'll start it when we're ready
        timer.set({ time : this._getMillis(searchOptions.schedule), autostart: false });

        //completed tells us if last execution finished
        this._scheduled[id] = { timer: timer, search: searchOptions, completed:true };
        timer.play();

        return id;
    },

    getQueries: function(options) {
        var me = this;
        //options: {runningOnly: true}
        return $.map(Object.keys(this._scheduled), function(v, i) {
            return (me._scheduled[v].search);
        });
    },

    //disables and removes all timers
    clear: function() {
        var me = this;
        $.each(Object.keys(this._scheduled), function(i,v) {
            me._scheduled[v].timer.stop();
        });
        this._scheduled = {};
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.queryScheduler = function (options) {
    return new ogrid.QueryScheduler(options);
};