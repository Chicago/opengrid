/*
 * ogrid.FlexSearchBuilder
 *
 * Class for parsing flex quick search that supports searching on all available datasets
 */

ogrid.FlexSearchBuilder = ogrid.Class.extend({
    //private attributes
    _options:{},
    _input: null,
    _rawParamString: '',
    _trigger: '',
    _params: [],
    _highLevelSyntax: /^\s*(\S+)((\s+(\S)+)*)\s*$/i,

    //system field
    _MAX: '$max',

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },

    //private methods
    _validate: function(input) {
        //var r =  /^(\S)+\s+((("(.+)")|(\S+))|((\S+):(("(.+)")|(\S+))\s*)+)\s*$/i;
        //if (!r.test(input)) {
        //    throw new ogrid.error('Quick Search', 'Invalid quick search input');
        //}
    },

    _parseMain: function(input) {
        var r =  this._highLevelSyntax;
        var matches = r.exec(input);
        if (!matches)
            throw new ogrid.error('Quick Search', 'Invalid quick search input');
        return {trigger: matches[1], params: matches[2].trim() };
    },

    _parseValue: function(value) {
        //pre-condition: value is a single word or quoted string or set of strings
        //quoted string?
        if (/^\s*"(.+)\s*$/i.test(value)) {
            //quotes complete?
            var h = /^\s*"(.+)"\s*$/i.exec(params);
            if (h) {
                return h[1];
            } else
                throw new ogrid.error('Quick Search', 'Missing closing quote');
        } else
            return value;
    },

    _parseKeyValuePairs: function(input, params) {
        //1 or more key-value pairs?
        var r = /\s*(("([^"]+)")|([^\s"]+))\s*:\s*(("([^"]+)")|([^\s"]+))\s*/ig;
        var m = r.exec(input);
        if (m) {
            while (m !== null) {
                params.push({
                    key: this._parseValue(m[3] ? m[3].trim() : m[4].trim()),
                    value: this._parseValue(m[7] ? m[7].trim() : m[5].trim())
                });
                m = r.exec(input);
            }
        } else {
            throw new ogrid.error('Quick Search', 'Invalid quick search input');
        }
    },

    _pushContains: function(filters, value, columns) {
        if (!columns)
            throw new ogrid.error('Quick Search', 'List of columns is missing.');
        var me = this;
        $.each(columns, function(i,v) {
            var o = {};
            //case insensitive contains search
            o[v] = {"$regex":value, "$options": 'i'};
            filters.push( o );
        });
    },


    //public methods


    //mainonly - if true, do not parse params
    parse: function(input, mainonly) {
        this._input = '';
        this._trigger = '';
        this._rawParamString = '';
        this._params = [];

        var o = this._parseMain(input);
        this._trigger = o.trigger;
        this._rawParamString = o.params;

        if (!mainonly)
            this._params = this.parseParams(this._rawParamString);

        this._input = input;
        return this;
    },

    parseParams: function(params) {
        var p = [];
        if (params!=='') {
            //quoted string?
            if (/^\s*"(.+)\s*$/i.test(params)) {
                //quotes complete?
                //var h = /^\s*"(.+)"\s*$/i.exec(params);
                var h = /^\s*"([^"]+)"\s*((\s*(("\$([^"]+)")|(\$[^\s"]+))\s*:\s*(("([^"]+)")|([^\s"]+))\s*)*)$/i.exec(params);
                if (h) {
                    p.push({key: null, value: h[1]});
                    if (h[2]) {
                        //system filters
                        this._parseKeyValuePairs(h[2], p);
                    }
                } else
                    throw new ogrid.error('Quick Search', 'Missing closing quote or invalid filter on system field');
            } else {
                //check if single-bareword
                var r = /^\s*([^\s:"]+)\s*((\s*(("\$([^"]+)")|(\$[^\s"]+))\s*:\s*(("([^"]+)")|([^\s"]+))\s*)*)$/i;
                //if (/^[^\s:]+\s*/i.test(params)) {
                if (r.test(params)) {
                    //p.push({key: null, value: params});
                    var m = /^\s*([^\s:"]+)\s*((\s*(("\$([^"]+)")|(\$[^\s"]+))\s*:\s*(("([^"]+)")|([^\s"]+))\s*)*)$/i.exec(params);
                    if (m) {
                        p.push({key: null, value: m[1]});
                        if (m[2]) {
                            //system filters
                            this._parseKeyValuePairs(m[2], p);
                        }
                    }
                } else {
                    this._parseKeyValuePairs(params, p);
                }
            }
        }
        return p;
    },

    getTrigger: function() {
        return this._trigger;
    },

    //raw key value pair
    getParams: function() {
        if (this._rawParamString && this._rawParamString.trim().length > 0 && this._params.length===0)
            //force a parse
            this._params = this.parseParams(this._rawParamString);
        return this._params;
    },

    //returns Db filter give
    getFilterFromParams: function(params, columns) {
        var me = this;
        var f = {};
        $.each(params, function(i, v) {
            if (!me.isSystemColumn(v.key)) {
                if (v.key === null) {
                    //assume this can only happen when simple filter is typed in
                    var orFilters =  {$or: []};
                    me._pushContains(orFilters.$or, v.value, columns);
                    f = orFilters;
                    return false; //break
                } else {
                    var o = {};
                    o[v.key] = {"$regex": v.value, "$options": 'i'};
                    if ($.isEmptyObject(f))
                        f = {$and: []};
                    f.$and.push( o );
                }
            }
        });
        return f;
    },

    //returns actual DB filter
    getFilter: function(columns) {
        return this.getFilterFromParams(this._params, columns);
    },

    //returns limit, defaults to system setting if not specified
    getLimit: function() {
        var me = this;
        var lim = 0;
        $.each(this._params, function(i, v) {
            if (v.key === me._MAX) {
                lim = v.value;
                return false; //break
            }
        });
        return parseInt(lim);
    },

    //quick test function that goes against high-level syntax
    matchesInput: function(input, triggers) {
        var t = false;
        if (this._highLevelSyntax.test(input)) {
            var trigger = this.parse(input, true).getTrigger();

            //matches only if trigger word is on the list
            $.each(triggers, function(i,v){
                if (trigger === v) {
                    t = true;
                    return false; //break
                }
            });
        }
        return t;
    },

    isSystemColumn: function(name) {
        //add more later if needed
        return (name === this._MAX);
    },

    //merge options with current
    setOptions: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    }
});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.flexSearchBuilder = function (options) {
    return new ogrid.FlexSearchBuilder(options);
};