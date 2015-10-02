/*
 * ogrid.Chart
 *
 * Class for generating and presenting graph
 */

ogrid.Chart = ogrid.Class.extend({
    //private attributes
    _options:{
        title: '',
        data: null,
        groupBy: ''
    },
    _container: null,
    _chart: null,

    //public attributes


    //constructor
    init: function(container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        this._container = container;

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('ogrid-chart modal fade');

        this._container.on('shown.bs.modal', $.proxy(this._onModalShown, this));
        $(window).resize($.proxy(this._onResize, this));
    },


    //private methods
    _onResize: function() {
        /*if (this._chart) {
            this._chart.update();
        }*/
        //this._generate(false);
        if ($('.ogrid-chart-legend').css('visibility') === 'hidden') {
            //center the chart canvas (not happening with just css media query)
            $('.ogrid-chart-canvas').css('margin-left', 'calc( 50% - 300px / 2)');
            $('.ogrid-chart-canvas').css('left', '0px');

            //$(".ogrid-chart-canvas").attr("width", width);
            //$(".ogrid-chart-canvas").attr("height", height);
        } else {
            $('.ogrid-chart-canvas').css('margin-left', '30px');
            $('.ogrid-chart-canvas').css('left', 'auto');
        }
        //this._chart.resize();
        //this._chart.update();
    },

    _onModalShown: function() {
        this._generate(true);
    },


    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div class="modal-dialog ogrid-chart-modal"><div class="modal-content"><div class="modal-header">' +
                this._options.title +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="ogrid-chart-body"><canvas class="ogrid-chart-canvas"></canvas><div class="ogrid-chart-legend"></div></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog -->';
    },

    _getChartData: function(rawData, groupField) {
        var counts = {};
        //count occurrences by grouping field
        $.each(rawData.features, function(i, v){
            var fieldVal = 'Unknown';
            if (v.properties.hasOwnProperty(groupField) && v.properties[groupField] !==''  && v.properties[groupField] !== null) {
                //record has a value on grouping field
                fieldVal = v.properties[groupField];
            }
            if (counts.hasOwnProperty(fieldVal)) {
                counts[fieldVal].value++;
            } else {
                var color = chroma.random().hex();

                //not in our map yet, initialize
                counts[fieldVal] = {
                    value: 1,
                    color: color,
                    highlight: chroma(color).luminance(0.5).hex(),
                    label: fieldVal
                };
            }
        });
        return $.map(counts, function(v, i) {
           return v;
        });
    },

    _generate: function(animate) {
        var ctx = $('.ogrid-chart-canvas')[0].getContext("2d");

        var data = this._getChartData(this._options.data, this._options.groupBy);

        var options = {
            //Boolean - Whether we should show a stroke on each segment
            segmentShowStroke: true,

            //String - The colour of each segment stroke
            segmentStrokeColor: "#fff",

            //Number - The width of each segment stroke
            datatrokeWidth: 2,

            //Number - The percentage of the chart that we cut out of the middle
            percentageInnerCutout: 50, // This is 0 for Pie charts

            //Number - Amount of animation steps
            animationSteps: 100,

            //Maximum - Number in display
            MAXNUMBER: 100,

            //String - Animation easing effect
            animationEasing: "easeOutBounce",

            //Boolean - Whether we animate the rotation of the Doughnut
            animateRotate: animate,

            //Boolean - Whether we animate scaling the Doughnut from the centre
            //animateScale: animate,

            //responsive: true,

            //String - A legend template
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

        };

        this._chart = new Chart(ctx).Pie(data, options);

        //then you just need to generate the legend
        var legend = this._chart.generateLegend();

        //and append it to your page somewhere
        $('.ogrid-chart-legend').html('<b>Legend</b>' + legend);
    },


    //public methods
    showModal: function() {
        this._container.modal({show: true});
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.chart = function (container, options) {
    return new ogrid.Chart(container, options);
};