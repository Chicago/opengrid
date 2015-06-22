/*
 * ogrid.CommandBar
 *
 * Commandbar UX component
 */


ogrid.CommandBar = ogrid.Class.extend({
    //private attributes
    _options:{},
    _clrbutton: null,

    //public attributes


    //constructor
    init: function(clrbutton, options) {
        if (options) {
            //ogrid.mixin(this._options);
            this._options = options;
        }

        this._clrbutton = clrbutton;

        //setup event handlers on each button
        this._clrbutton.click($.proxy(this._onClearClick, this));

        $("#commandbar-advanced").click(function() {
            //if ($("#ogrid-task-advanced-search").css('right') === -$("#ogrid-task-advanced-search").css('right')) {
            //if negative right value, must be hidden
            if ($("#ogrid-task-advanced-search").css('right').substring(0,1) === '-') {
                $("#ogrid-task-advanced-search").animate({'right':'0'}, 500);

                $(".ogrid-nav-btn").find(".active").removeClass("active");
                $("#commandbar-advanced").addClass('active');
            } else {
                //programmatically get width later and set to negative
                $("#ogrid-task-advanced-search").animate({'right': '-700px'}, 500);
                $("#commandbar-advanced").removeClass('active');

                //remove focus from button
                $('#commandbar-advance').blur();
            }
            //prevent default event processing
            return false;
        });

    },


    //private methods
    _onClearClick: function() {
        //console.log("Clear clicked");
        ogrid.Event.raise(ogrid.Event.types.CLEAR);
    }

    //public methods

});