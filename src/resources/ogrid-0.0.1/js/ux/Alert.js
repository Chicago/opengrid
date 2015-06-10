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
        this._alert_txt.html(divHtml)

        //auto-hide in 3.5 seconds
        var me = this;
        setTimeout(function() {
            try {
                //_alert_div.removeClass('in')
                me._alert_div.attr('class', me._ALERT_BASE);
            } catch (e) {
                //do nothing
            }
        }, 3500);
    },

    //publics
    modal: function (title, msgTxt) {
        bootbox.dialog({
            message: msgTxt,
            title: (ogrid.isNull(title)) ? 'OpenGrid Message' : title,
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


    busy: function (msgTxt) {
        //$( "p" ).hide( "slow" );
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
        $.ajaxSetup({
            beforeSend:function(){
                $("#ogrid-busy").show();
            },
            complete:function(){
                $("#ogrid-busy").hide();
            }
        });
    }
};