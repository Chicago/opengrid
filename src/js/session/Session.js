/*
 * ogrid.Session
 *
 * Class for session-related functions
 */

ogrid.Session = ogrid.Class.extend({
    //private attributes
    _options:{
        sessionTimeout: ogrid.Config.session.timeout,  //timeout in ms
        tokenRenewalInterval: ogrid.Config.session.tokenRenewalInterval  //interval in hour
    },
    _tokenDB: null,

    //should be outside the app container
    _loginContainer: null,
    _appContainer: null,
    _authUrl: null,
    _authRenewUrl: null,
    _onTimeout: null,

    _postLogin: null,
    _sessionTimer: null,
    _tokenRenewalTimer: null,

   //public attributes

    //constructor
    init: function(loginContainer, appContainer, authUrl, authRenewUrl, onTimeout, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        this._tokenDB = new ogrid.TokenStorage();

        this._appContainer = appContainer;
        this._loginContainer = loginContainer;
        this._loginContainer.addClass('ogrid-login fade hide');

        this._authUrl = authUrl;
        this._authRenewUrl = authRenewUrl;

        this._loginContainer.html(this._getLoginFormTemplate());
        $('.login-panel .btn').click($.proxy(this._doLogin, this));

        $('#ogrid-login-username').keyup($.proxy(this._inputKeyup, this));
        $('#ogrid-login-password').keyup($.proxy(this._inputKeyup, this));

        //handle Enter key
        $('#ogrid-login-username').keypress($.proxy(this._inputKeypress, this));
        $('#ogrid-login-password').keypress($.proxy(this._inputKeypress, this));


        //setup ajax request interceptor
        //this._setupAjaxRequestInterceptor();

        this._onTimeout = onTimeout;
        this._sessionTimer = $.timer($.proxy(this._onTimer, this));
        this._sessionTimer.set({ time : this._options.sessionTimeout * 60 * 1000, autostart: false });

        this._tokenRenewalTimer = $.timer($.proxy(this._onRenew, this));

        //interval in minutes
        this._tokenRenewalTimer.set({ time : this._options.tokenRenewalInterval * 60 * 1000, autostart: false });
    },



    //private methods
    _onTimer: function() {
        //stop our timer
        this._sessionTimer.stop();
        if (this._onTimeout) {
            this._onTimeout();
        }
    },


    _onRenew: function() {
        this._tokenRenewalTimer.stop();
        if (this.token()) {
            console.log('Renewing auth token');
            this.renew();
        } else {
            //will be restarted on new login
            this._tokenRenewalTimer.stop();
        }
    },

    _inputKeyup: function() {
        if ( (this._getUserName().trim().length > 0) &&
            (this._getPassword().trim().length > 0) )
            //enable our submit button
            $('.login-panel .btn').removeClass('disabled');
        else
            $('.login-panel .btn').addClass('disabled');
    },


    _inputKeypress: function (e) {
        var me = this;

        if ( (e.which == 13) && ( !$('.login-panel .btn').hasClass('disabled')) )  {
            me._doLogin();
            return false;
        }
    },

    _doLogin: function() {
        try {
            this.showInfo("Logging in...");
            this.login( this._getUserName(), this._getPassword(),
                $.proxy(this._onLoginSuccess, this),
                $.proxy(this._onLoginError, this)
            );
        } catch (ex) {
            this.showError(ex.message);
        } finally {

        }
    },

    _validateToken: function(token) {
        try {
            //try to decode token
            var decoded = jwt_decode(token);
            console.log(decoded);
            console.log('Welcome, ' + decoded.fname + ' ' + decoded.lname);
        } catch (ex) {
            throw 'Invalid X-AUTH-TOKEN value from response header. ' + ex.message;
        }
    },

    _onLoginSuccess: function(data, txtStatus, jqXHR) {
        //we need to handle any exceptions here so they won't turn uncaught
        try {
            //console.log(data);
            //response header should have the security token
            console.log(jqXHR.getResponseHeader('X-AUTH-TOKEN'));

            var tokenValue = jqXHR.getResponseHeader('X-AUTH-TOKEN');
            if (!tokenValue) {
                throw 'Missing X-AUTH-TOKEN value from response header';
            }
            this._validateToken(tokenValue);

            //store token using TokenStorage object
            this._tokenDB.store(tokenValue);

            //start our session timer
            this._sessionTimer.play();

            this._tokenRenewalTimer.play();

            this.popAppState();

            //invoke client's post-login callback
            if (this._postLogin)
                this._postLogin();
        } catch (ex) {
            this.showError(ex);
        }
    },

    _onLoginError: function(jqXHR, txtStatus, errorThrown) {
        if (txtStatus === 'timeout') {
            this.showError('Authentication service call has timed out.');
        } else if (errorThrown === 'Unauthorized') {
            this.showError('Login failed due to invalid username or password.');
        } else if ( (jqXHR.status === 404) || (jqXHR.status === 500)) {
            this.showError('A system error was encountered while logging in. The authentication service may be unavailable.');
        } else {
            this.showError( jqXHR.responseText ? jqXHR.responseText : (txtStatus === 'error' ? 'A system error was encountered while logging in. The authentication service may be unavailable.' : txtStatus));
        }
        setTimeout(function() {
            $('#ogrid-login-username').focus();
            $('#ogrid-login-username').select();
        }, 100);
    },

    _validate: function(username, password) {
        //now button is disabled if both are blank, should not happen now but leaving this check here
        if (username === '') {
            throw "Username cannot be blank.";
        }
        if (password === '') {
            throw "Password cannot be blank.";
        }
    },

    _getUserName: function() {
        return $('#ogrid-login-username').val();
    },


    _getPassword: function() {
        return $('#ogrid-login-password').val();
    },

    showError: function(msg) {
        $('.login-panel .alert').removeClass('hide').removeClass('alert-info').addClass("in").addClass("alert-danger");
        $('.login-panel .alert').html(msg);
    },

    //get the error messaged currently displayed on alert panel
    //good helper method for testing
    getLastError: function(msg) {
        return $('.login-panel .alert').html();
    },

    showInfo: function(msg) {
        $('.login-panel .alert').removeClass('hide').removeClass('alert-danger').addClass("in").addClass("alert-info");
        $('.login-panel .alert').text(msg);
    },


    _getLoginFormTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div class="panel panel-default login-panel"><div class="panel-heading"><img src="images/OpenGrid_symbol_white.png" alt="Open Grid Logo" ><h2>' +
            ogrid.Config.brand.applicationName +
            '</h2></div><div class="panel-body"><!--<form method="post" action="" role="login"> --><div class="row"><div class="col-xs-12"><input id="ogrid-login-username" name="username" autocapitalize="off" placeholder="Username" class="form-control"/><span class="glyphicon glyphicon-user"></span></div><div class="col-xs-12"><input id="ogrid-login-password" type="password" name="password" placeholder="Password" class="form-control" /><span class="glyphicon glyphicon-lock"></span></div></div><button type="submit" name="go" class="btn btn-block btn-info disabled">LOG IN</button><div class="alert alert-danger fade hide">The login failed due to invalid username/password or you do not have permissions to access the system.</div><!--</form>--></div>';
    },


    _clearLoginForm: function() {

        if(ogrid.Config.service.autologin) {
            $(".login-panel").attr("style", "visibility: hidden");
            $('#ogrid-login-username').val('NoAuth');
            $('#ogrid-login-password').val('NoAuth');

            var me = this;
            me._doLogin();

        } else {
            //$(‘#loginForm').css('background-image', 'url("../dist/images/background_lake_east.jpg")');
            $('#ogrid-login-username').val('');
            $('#ogrid-login-password').val('');
        }
    },


    popAppState: function() {
        //hide login window
        this._loginContainer.addClass('hide');

        //show main app container
        this._appContainer.removeClass('hide');
    },


    pushAppState: function() {
        //hide main app container
        this._appContainer.addClass('hide');
    },

    _onAjaxError: function (opName, err, options, jqXHR, txtStatus, errorThrown) {
        if (options.error) {
            //let caller handle/display error message, if a callback was passed
            ogrid.Config.service.errorHandler.callErrorCallback(err, options.error, jqXHR, txtStatus, errorThrown);
        } else {
            //default error handling
            if (txtStatus === 'timeout') {
                ogrid.Alert.error(opName + ' has timed out.');
            } else {
                ogrid.Alert.error((jqXHR.responseText) ? jqXHR.responseText : txtStatus);
            }
        }
    },

    //public methods

    //renews token expiration
    renew: function(options) {
        var me = this;

        $.ajax({
            url: this._authRenewUrl,
            type: 'POST',
            timeout: 15000,
            success: function(data, txtStatus, jqXHR) {
                var err = ogrid.Config.service.errorHandler.getError(data);
                if (err) {
                    //redirect to the error function
                    this._onAjaxError('Authorization token renewal', err, options, jqXHR, txtStatus);
                } else {
                    //response header should have the renewed security token
                    me._tokenDB.store(jqXHR.getResponseHeader('X-AUTH-TOKEN'));

                    //restart our renewal timer
                    me._tokenRenewalTimer.play();
                }
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                me._onAjaxError('Authorization token renewal', {}, options, jqXHR, txtStatus, errorThrown);
            },
            statusCode: {
                401: function(jqXHR, txtStatus, errorThrown) {
                    if (jqXHR.responseJSON) {
                        var o = JSON.parse(jqXHR.responseJSON);
                        console.log(o);
                    }
                },
                //placeholder
                404: function() {
                    ogrid.Alert.error("The authentication service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    },

    showLogin: function(postLogin) {
        this.pushAppState();

        this._clearLoginForm();
        setTimeout(function() {
            $("#ogrid-login-username").focus();
        }, 200);

        //show login form on the container provided
        this._loginContainer.removeClass('hide');
        this._loginContainer.addClass('in');

        //hide alert panel
        $('.login-panel .alert').addClass('hide');

        //disable login button
        $('.login-panel .btn').addClass('disabled');

        this._postLogin = postLogin;
    },

    login: function(username, password, success, error) {
        var me = this;

        //assign defaults if no override callbacks are passed
        if (!success) {
            success = $.proxy(this._onLoginSuccess, this);
        }
        if (!error) {
            error = $.proxy(this._onLoginError, this);
        }

        this._validate(username, password);
        var payLoad = { username: username, password: password };

        $.ajax({
            url: this._authUrl,
            type: 'POST',
            async: true,
            //contentType: 'application/json',
            timeout: ogrid.Config.service.timeout,
            processData: false, //make sure our payload does not get encoded
            data: JSON.stringify(payLoad),
            success: function(data, txtStatus, jqXHR) {
                if (success) success(data, txtStatus, jqXHR);
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                if (error) error(jqXHR, txtStatus, errorThrown);
            },
            statusCode: {
                401: function(jqXHR, txtStatus, errorThrown) {
                    if (jqXHR.responseJSON) {
                        //var o = JSON.parse(jqXHR.responseJSON);
                        //console.log(o);
                    }
                },
                //placeholder
                404: function() {
                    //ogrid.Alert.error("The authentication service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    },


    logout: function() {
        this._tokenDB.clear();

        this._sessionTimer.stop();
        this._tokenRenewalTimer.stop();
    },

    token: function() {
        return this._tokenDB.retrieve();
    },


    getCurrentUser: function() {
        if ( this.token() ) {
            return new ogrid.User(this.token());
        } else
            return null;
    },

    //resets the timer for timing out session
    resetTimeoutTimer: function() {
        //console.log('Resetting session timer at ' + ogrid.now());
        this._sessionTimer.stop();

        if (this.token())
            this._sessionTimer.play(true);
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.session = function (loginContainer, appContainer, authUrl, authRenewUrl, onTimeout, options) {
    return new ogrid.Session(loginContainer, appContainer, authUrl, authRenewUrl, onTimeout, options);
};