/*
 * ogrid.User
 *
 * Holds user profile data
 */

ogrid.User = ogrid.Class.extend({
    //private attributes
    _options:{},
    _profile: null,
    _decodedToken: null,

    //public attributes


    //constructor
    init: function(token, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        //creates a user profile from authorization token
        var d = jwt_decode(token);

        this._profile = {
            userId: d.jti,
            loginId: d.sub,
            firstName: d.fname,
            lastName: d.lname,
            roles: d.roles.split(',')
        };
        this._decodedToken = d;
    },


    _commonErrorHandler: function (opName, err, rawErrorData, passThroughData) {
        //no use for pass through data right now (more used on success case)
        if (err && !$.isEmptyObject(err)) {
            //ogrid.Alert.error(err.message + '(' + 'Code: ' + err.code + ')');
            console.log(err.message + '(' + 'Code: ' + err.code + ')');
        } else {
            if (rawErrorData.txtStatus === 'timeout') {
                //ogrid.Alert.error(opName + ' has timed out.');
                console.log(opName + ' has timed out.');
            } else {
                //ogrid.Alert.error( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
                console.log( (rawErrorData.jqXHR.responseText) ? rawErrorData.jqXHR.responseText : rawErrorData.txtStatus);
            }
        }
    },

    _onGroupListError: function (err, rawErrorData, passThroughData) {
        this._commonErrorHandler('Group listing', err, rawErrorData, passThroughData);
    },

    //private methods
    _getGroups: function(groupIds, success) {
        ogrid.admin("groups").listItems({
            filter: {"groupId": { $in: groupIds } },
            maxResults: 100,
            success: success,
            error: $.proxy(this._onGroupListError, this)
        });
    },

    //public methods
    //returns a consolidated list of objects this user has access to given current group membership
    getAccessList: function(success) {
        if (this._profile.roles) {
            this._getGroups(this._profile.roles,  function(data) {
                var a = [];
                $.each (data, function(i, v) {
                    if (v && v.functions) {
                        $.each (v.functions, function(j, x) {
                            if ($.inArray(x, a) === -1) {
                                a.push(x);
                            }
                        });
                    }
                });
                success(a);
            });
        } else
            return [];
    },

    getProfile: function() {
        return this._profile;
    },

    isAdmin: function() {
        if (this._decodedToken && this._decodedToken.resources) {
            //$admin is a reserved opengrid resource name
            return ($.inArray('$admin', this._decodedToken.resources) === -1);
        }

    }
});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.user = function (options) {
    return new ogrid.User(options);
};