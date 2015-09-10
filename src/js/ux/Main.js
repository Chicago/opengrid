/*
 * ogrid.Main
 *
 * Main application entry point class
 */


ogrid.Main = ogrid.Class.extend({
    //private attributes
    _options:{},
    _map: null,
    _qs: null,
    _cb: null,
    _tv: null,
    _adv: null,
    _session: null,
    _timedOut: false,
    _mobileMode: false,

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
        this._session = new ogrid.Session(
            $('#loginForm'),
            $('#ogrid-container'),
            ogrid.Config.service.endpoint + '/' + ogrid.Config.service.authUrl,
            ogrid.Config.service.endpoint + '/' + ogrid.Config.service.authRenewUrl,
            $.proxy(this._onSessionTimeout, this)
        );

        //set branding on title
        document.title = ogrid.Config.brand.applicationName;
        $('.navbar-brand').text(ogrid.Config.brand.applicationName);

        //init alert
        ogrid.Alert.init(options.alert_div, options.alert_txt);
        this._setupGlobalAjaxOptions();

        //subscribe to applicable opengrid client events
        ogrid.Event.on(ogrid.Event.types.LOGGED_OUT, $.proxy(this._onLoggedOut, this));

        //setup pur keyboard/mouse hook for detecting user activity
        this._setupActivityHooks();

        $(window).resize($.proxy(this._onWindowResize, this));

        //manually trigger resize handler to refresh flags
        this._onWindowResize();
    },

    //private methods
    _setupActivityHooks: function() {
        //reset session timer when there is keyboard and mouse activity
        var me = this;
        $(document).mousemove(function (e) {
            me._session.resetTimeoutTimer();
        });
        $(document).keyup(function (e) {
            me._session.resetTimeoutTimer();
        });
    },

    _setNavBarBehavior: function() {
        //Stack menu when collapsed
        $('#ogrid-menu').on('show.bs.collapse', function() {
            $('#ogrid-search').addClass('col-xs-7');
        });

        //Unstack menu when not collapsed
        $('#ogrid-menu').on('hide.bs.collapse', function() {
            $('#ogrid-search').removeClass('col-xs-7');
        });
    },


    _initUx: function() {
        //init map
        this._map = new ogrid.Map(
            this._options.map,
            //map options
            ogrid.Config.map
        );

         //init quick search
        this._qs = new ogrid.QSearch(
            this._options.qsearch_div,
             this._options.qsearch_input,
             this._options.qsearch_button);

        //init commandbar
        this._cb = new ogrid.CommandBar(this._options.commandbar);

         //init table view
        this._tv = new ogrid.TableView($('#tableview'), $('#ogrid-nav-tabs'), $('#ogrid-tab-content'),
            {map: this._map}
        );

        //nav menu tweaks
        this._setNavBarBehavior();

        //init advanced search
        this._adv = new ogrid.AdvancedSearch({map: this._map});

        //init manage UI
        ogrid.adminUI($('#ogrid-admin-ui'));

        this._timedOut =  false;
        //broadcast that we're finished logged in, passing user profile
        ogrid.Event.raise(ogrid.Event.types.LOGGED_IN, this._session.getCurrentUser());
    },

    _postLogin: function() {
        //broadcast that we're finished logged in, passing user profile
        ogrid.Event.raise(ogrid.Event.types.LOGGED_IN, this._session.getCurrentUser());
    },

    _onLoggedOut: function() {
        //show log in page
        ogrid.App.getSession().showLogin($.proxy(this._postLogin, this));

        if (this._timedOut) {
            ogrid.App.getSession().showInfo('Your session has timed out. For your security, you have been logged out automatically.');
            this._timedOut = false;
        } else
            ogrid.App.getSession().showInfo('You have been logged out.');
    },

    _setupGlobalAjaxOptions: function() {
        var me = this;
        $.ajaxSetup({
            beforeSend: function(xhr, options) {
                //do this only if URL is not the auth URL and if it's our secure service only
                if ( (options.url.indexOf(ogrid.Config.service.authUrl) === -1) &&
                    (options.url.indexOf(ogrid.Config.service.endpoint) > -1) ) {

                    if (options.url.indexOf(ogrid.Config.service.authRenewUrl) === -1) {
                        //there is activity, make sure our session does not timeout, except when the activity is
                        //  for our token renewal timer
                        me._session.resetTimeoutTimer();
                    }

                    var token = me._session.token();
                    if (token) {
                        ogrid.Alert.busy('Working...');

                        //insert our auth token into the request header
                        xhr.setRequestHeader('X-AUTH-TOKEN', token);
                        return true;
                    } else  {
                        //if not auth URL, display login form
                        //post successful login, the token is stored in the token DB
                        me._session.showLogin($.proxy(me._postLogin, me));
                        return false;
                    }
                } else
                    return true;
            },
            complete:function(){
                //$("#ogrid-busy").hide();
                ogrid.Alert.idle();
            }
        });

        //global error handler for HTTP errors
        $( document ).ajaxError(function( event, jqxhr, settings, exception ) {
            console.log('HTTP ' +  jqxhr.status + ': ' + jqxhr.responseText);
            if (me._isMainAppContainerVisible()) {
                //display errors only when main app is displayed (past login)
                if ( jqxhr.status === 401 ) {
                    //ogrid.Alert.error("Unauthorized")
                } else if ( jqxhr.status === 403 ) {
                    ogrid.Alert.error("You do not have the appropriate permissions to perform this operation or access this resource. This can also be caused by the authentication database being unavailable.");
                } else if ( jqxhr.status === 404 ) {
                    ogrid.Alert.error("The service cannot be reached at this time. Make sure an internet connection is available then try again.");
                } else if ( jqxhr.status === 500 ) {
                    ogrid.Alert.error("A general service error has occurred. The browser's log can be inspected for more detail on this error.");
                } if ( jqxhr.status === 0 && jqxhr.statusText==='error') {
                    ogrid.Alert.error("A system error was encountered while performing the requested operation. The service may be unavailable.");
                } else {
                    //fallback error handler
                }
            }
        });
    },

    _onWindowResize: function() {
        //communicate to rest of the UI that mobile mode has been triggered or 'turned off'
        var mobileNow = false;
        if (window.matchMedia('(max-width: ' + ogrid.Config.commandBar.mobileBreakPointWidth + 'px)').matches) {
            mobileNow = true;
        } else {
            mobileNow = false;
        }
        if (this._mobileMode !== mobileNow) {
            this._mobileMode = mobileNow;
            //trigger change event, passing new mobile mode state
            ogrid.Event.raise(ogrid.Event.types.MOBILE_MODE_CHANGED,  mobileNow);
        }
    },



    _onSessionTimeout: function() {
        //logout session
        ogrid.App.getSession().logout();

        this._timedOut = true;

        //broadcast that we're logged out
        ogrid.Event.raise(ogrid.Event.types.LOGGED_OUT);
    },

    _isMainAppContainerVisible: function() {
        return !$("#ogrid-container").hasClass('hide');
    },

    //public methods
    getSession: function() {
        return this._session;
    },


    run: function() {
        //display login page if no authorization token is active
        if (!this._session.token()) {
            this._session.showLogin($.proxy(this._initUx, this));
        } else {
            //make sure app container is displayed
            this._session.popAppState();

            this._initUx();
        }
    },

    map: function() {
        return this._map;
    },

    //returns a flag indicating if we're in 'mobile-view' i.e. nav menu graphic is visible
    mobileView: function() {
        return this._mobileMode;
    }
});