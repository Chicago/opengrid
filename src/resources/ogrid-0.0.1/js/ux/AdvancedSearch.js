/*
 * ogrid.AdvancedSearch
 *
 * <description of class>
 */

// Template class code
// Copy this when creating a new class

ogrid.AdvancedSearch = ogrid.Class.extend({
    //private attributes
    _options:{},

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = options;
        }

        //init UI elements
        $('#beginDate').datetimepicker();
        $('#endDate').datetimepicker();

        $('#sizeSpinUp').on('click', function() {
            $('#sizeSpin').val( parseInt($('#sizeSpin').val(), 10) + 1);
        });
        $('#sizeSpinDn').on('click', function() {
            $('#sizeSpin').val( parseInt($('#sizeSpin').val(), 10) - 1);
        });

        $('#opacitySpinUp').on('click', function() {
            $('#opacitySpin').val( parseInt($('#opacitySpin').val(), 10) + 1);
        });
        $('#opacitySpinDn').on('click', function() {
            $('#opacitySpin').val( parseInt($('#opacitySpin').val(), 10) - 1);
        });

        $('#colorPicker').colorselector("setColor", "#DC143C");

        $('.panel-heading span.clickable').on("click", function (e) {
            if ($(this).hasClass('panel-collapsed')) {
                // expand the panel
                $(this).parents('.panel').find('.panel-body').slideDown();
                $(this).removeClass('panel-collapsed');
                $(this).find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
            else {
                // collapse the panel
                $(this).parents('.panel').find('.panel-body').slideUp();
                $(this).addClass('panel-collapsed');
                $(this).find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }
        });
    }


    //private methods


    //public methods

});