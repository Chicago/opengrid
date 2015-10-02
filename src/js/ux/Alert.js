/*
 * ogrid.Alert
 *
 *  Alert-related util methods
 */

ogrid.Alert = {
    _alert_div: null,
    _alert_txt: null,

    _ALERT_BASE: 'alert flyover flyover-bottom',

    //privates
    _show: function (alertClass, divHtml) {
        this._alert_div.addClass("in " + alertClass);
        //_alert_txt.text(txt);
        this._alert_txt.html(divHtml);

        //auto-hide in 3.5 seconds
        var me = this;
        setTimeout(function() {
            try {
                //_alert_div.removeClass('in')
                me._alert_div.attr('class', me._ALERT_BASE);
            } catch (e) {
                //do nothing
            }
        }, ogrid.Config.alerts.autoCloseDuration);
    },

    //publics
    modal: function (title, msgTxt) {
        bootbox.dialog({
            message: msgTxt,
            title: (ogrid.isNull(title)) ? ogrid.Config.brand.applicationName + ' Message' : title,
            buttons: {
                main: {
                    label: "OK",
                    className: "btn-primary",
                    callback: function() {
                        //Example.show("Primary button");
                    }
                }
            }
        });
    },


    modalPrompt: function (title, msgTxt, cb) {
        bootbox.dialog({
            message: msgTxt,
            title: (ogrid.isNull(title)) ? ogrid.Config.brand.applicationName + ' Message'  : title,
            buttons: {
                ok: {
                    label: "OK",
                    className: "btn-primary submit",
                    callback: function() {
                        if (cb) {
                            cb('ok');
                        }
                    }
                },
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: function() {
                        if (cb) {
                            cb('cancel');
                        }
                    }
                }
            }
        }).find('.modal-content').css({
            top: function () {
                //TODO: derive dialog height from CSS
                var modal_height = 300;
                var window_height = $(window).height();
                return ((window_height/2) - (modal_height/2));
            }
        });

    },

    error: function (msgTxt) {
        var divHtml = '<strong>Error:</strong> ' + msgTxt;
        this._show('alert-danger', divHtml);
    },

    warning: function (msgTxt) {
        var divHtml = '<strong>Warning:</strong> ' + msgTxt;
        this._show('alert-warning', divHtml);
    },

    info: function (msgTxt) {
        var divHtml = '<strong>Info:</strong> ' + msgTxt;
        this._show('alert-info', divHtml);
    },

    success: function (msgTxt) {
        var divHtml = '<strong>Success:</strong> ' + msgTxt;
        this._show('alert-success', divHtml);
    },


    busy: function (msgTxt, context, callback) {
        try {
            //$('#btn-busy').html('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> ' + msgTxt);
            $('#btn-busy').html('<span class="fa fa-refresh fa-spin"></span> ' + msgTxt);

            //auto-center the busy div
            $("#ogrid-busy").css('left', ( ($(window).width() - $("#ogrid-busy").width()) /2 ));

            $("#ogrid-busy").show();
            setTimeout(function() {
                //if callback is specified, we reset the busy div; otherwise, it is expected that the caller will reset it
                if (callback) {
                    callback.call(context);
                    //$("#ogrid-busy").hide();
                }
            }, 500);
        } catch (ex) {
            //this used to be in 'finally' block but timing in 'finally' isn't what we're expecting
            $("#ogrid-busy").hide();

            //bubble up exception
            throw ex;
        }
    },


    idle: function () {
        $("#ogrid-busy").hide();
    },

    init: function(container, txt){
        this._alert_div = container;
        this._alert_txt = txt;

        var me = this;
        $('.alert .close').on('click', function(e) {
            me._alert_div.removeClass('in');
            return false;
        });

        //setup busy message for ajax calls
        $("#ogrid-busy").hide();

        /*$("body").on("shown.bs.modal", ".modal", function() {
            $(this).find('div.modal-content').css({
                'top': function () {
                    var modal_height = $('.modal-dialog').first().height();
                    var window_height = $(window).height();
                    return ((window_height/2) - (modal_height/2));
                }
            });
        });*/
    }
};