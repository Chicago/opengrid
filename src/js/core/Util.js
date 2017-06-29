/*
 * Partly from of Leaflet's L.Util - for self-sufficiency in case we switch to another map library in the future
 */

ogrid.Util = {
	// extend an object with properties of one or more other objects
	mixin: function (dest) {
		var i, j, len, src;

		for (j = 1, len = arguments.length; j < len; j++) {
			src = arguments[j];
			for (i in src) {
				dest[i] = src[i];
			}
		}
		return dest;
	},

	// create an object from a given prototype
	create: Object.create || (function () {
		function F() {}
		return function (proto) {
			F.prototype = proto;
			return new F();
		};
	})(),

	// bind a function to be called with a given context
	bind: function (fn, obj) {
		var slice = Array.prototype.slice;

		if (fn.bind) {
			return fn.bind.apply(fn, slice.call(arguments, 1));
		}

		var args = slice.call(arguments, 2);

		return function () {
			return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
		};
	},

	// round a given number to a given precision
	formatNum: function (num, digits) {
		var pow = Math.pow(10, digits || 5);
		return Math.round(num * pow) / pow;
	},

	// trim whitespace from both sides of a string
	trim: function (str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	},

	// split a string into words
	splitWords: function (str) {
		return ogrid.Util.trim(str).split(/\s+/);
	},

	// set options to an object, inheriting parent's options as well
	setOptions: function (obj, options) {
		if (!obj.hasOwnProperty('options')) {
			obj.options = obj.options ? ogrid.Util.create(obj.options) : {};
		}
		for (var i in options) {
			obj.options[i] = options[i];
		}
		return obj.options;
	},

	// make a URL with GET parameters out of a set of properties/values
	getParamString: function (obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
			params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
		}
		return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	},

	isNull: function(v) {
		return ( (typeof(v) === 'undefined') || (v === null) );
	},

	error: function ( name_text, msg_text, data ) {
		var error     = new Error();
		error.name    = name_text;
		error.message = msg_text;

		if ( data ){ error.data = data; }

		return error;
	},

	_s4: function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	},

	guid: function() {
		return (ogrid.Util._s4() + ogrid.Util._s4() + "-" + ogrid.Util._s4() + "-4" + ogrid.Util._s4().substr(0,3) + "-" + ogrid.Util._s4() + "-" + ogrid.Util._s4() + ogrid.Util._s4() + ogrid.Util._s4()).toLowerCase();
	},

	ajax: function(context, success, options) {
		var opt = options; //default but override for some values
		$.ajax({
			//append relative url
			url: ogrid.Config.service.endpoint + opt.url,
			type: opt.type,
			async: true,
			contentType: 'application/json',
			timeout: ogrid.Config.service.timeout,
			xhrFields: {
				withCredentials: false
			},
			headers: {
				// Set any custom headers here.
				// If you set any non-simple headers, your server must include these
				// headers in the 'Access-Control-Allow-Headers' response header.
			},
			success: function(data) {
				success.call(context, data);
			},
			error: function(jqXHR, txtStatus, errorThrown) {
				if (txtStatus === 'timeout') {
					console.log('Service call has timed out.');
					//ogrid.Alert.error('Search has timed out.');
				} else {
					console.log( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
					//ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
				}
			},
			statusCode: {
				//placeholder
				404: function() {
					console.log("Page not found" );
					//ogrid.Alert.error( "Page not found" );
				}
			}
		});
	},

	getGeoJsonFeatureId: function(feature) {
		if (feature.id) {
			if (feature.id.hasOwnProperty('$oid')) {
				return feature.id.$oid;
			} else {
				return feature.id;
			}
		}
		return null;
	},

	hereDoc: function(f) {
		return f.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1].replace(/(\/\*[\s\S]*?\*) \//g, '$1/');
	},

	//current current day and time
	now: function() {
		/*Date.prototype.today = function () {
			//mm/dd/yyyy
			return (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) + "/"  + ((this.getDate() < 10)?"0":"") + this.getDate() + "/"+ this.getFullYear();
		};

		// For the time now
		Date.prototype.timeNow = function () {
			return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
		};

		return new Date().today() + " " + new Date().timeNow();*/
		return moment();
	},

	waitForCondition: function(maxTime, fn) {
		var d = $.Deferred();

		//async loop
		var _loop = function (i) {
			setTimeout(function() {
				if (d.state() === 'pending') {
					fn(d);
				}
			}, i * 500);
		};

		var n = (maxTime / 500);
		//max of 5 seconds, we're anticipating some wasted cycles here
		for (var i = 0; i < n; i++) {
			_loop(i);
		}
		return d;
	}
};

// shortcuts for most used utility functions
ogrid.mixin = ogrid.Util.mixin;
ogrid.bind = ogrid.Util.bind;
ogrid.setOptions = ogrid.Util.setOptions;
ogrid.formatNum = ogrid.Util.formatNum;
ogrid.trim = ogrid.Util.trim;
ogrid.splitWords = ogrid.Util.splitWords;
ogrid.isNull = ogrid.Util.isNull;
ogrid.error = ogrid.Util.error;
ogrid.guid = ogrid.Util.guid;
ogrid.ajax = ogrid.Util.ajax;
ogrid.oid = ogrid.Util.getGeoJsonFeatureId;
ogrid.hereDoc = ogrid.Util.hereDoc;
ogrid.now = ogrid.Util.now;
ogrid.waitForCondition = ogrid.Util.waitForCondition;

//more "native" bind implementation
if (!Function.prototype.bind) { // check if native implementation available
	Function.prototype.bind = function(){
		var fn = this, args = Array.prototype.slice.call(arguments),
			object = args.shift();
		return function(){
			return fn.apply(object,
				args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}