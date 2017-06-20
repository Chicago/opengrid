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
        groupBy: '',
        xAxisField: null,
        dataName: null,
        groupByFields: null,
        xAxisLabel: null
    },
    _container: null,
    _chart: null,
    _containerClone: null,

    //public attributes


    //constructor
    init: function(container, options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }

        this._container = container;

        //save original copy of the parent div
        this._containerClone = $(this._container).clone();

        //update DOM from template
        this._container.html(this._getTemplate());

        //stamp container with our class for our styles to work
        this._container.addClass('ogrid-chart modal fade');

        this._container.on('shown.bs.modal', $.proxy(this._onModalShown, this));
        $(window).resize($.proxy(this._onResize, this));

        $('.ogrid-chart-body input[name="chartType"]').click($.proxy(this._onChartTypeClick, this));

        //init group by dropdown
        if (this._options.groupByFields) {
            $('#jqtmpl-chart-groupby').tmpl(this._options.groupByFields).appendTo('#chart-groupby');

            //always pick (None) by default
            //$('#chart-groupby').val(this._options.groupByFields[0].name);
            $('#chart-groupby').val('');
        }
        $('#chart-groupby').change($.proxy(this._onGroupByChange, this));
    },


    //private methods
    _onGroupByChange: function(e, done) {
        switch ($(e.target).val()) {
            case '':
                //$('#optionDoughnut').addClass('disabled');
                //$("#typeDoughnut").prop('disabled', true);
                if ($('.ogrid-chart-body :checked').attr('id') === 'typeDoughnut') {
                    //auto-pick one of the other options
                    $("#typeLine").prop('checked', true);
                }
                break;
            default:
            //$('#optionDoughnut').removeClass('disabled');
            //$("#typeDoughnut").prop('disabled', false);
        }
        //manually trigger to effect change
        this._onChartTypeClick({target: $('.ogrid-chart-body :checked')});

    },

    _nest: function (seq, keys) {
        var me = this;
        if (!keys.length)
            return seq;
        var first = keys[0];
        var rest = keys.slice(1);
        return _.mapValues(_.groupBy(seq, first), function (value) {
            return me._nest(value, rest);
        });
    },

    _onChartTypeClick: function(e) {
        this._options.groupBy = $("#chart-groupby").val();
        if ($(e.target).attr('value') !== 'doughnut') {
            this._generateTimeSeriesChart($(e.target).attr('value'), false);
            this._chart.update();
        } else {
            //if group by is (None), autoselect first group by field
            if (this._options.groupBy ==='' && this._options.groupByFields) {
                $('#chart-groupby').val(this._options.groupByFields[0].name);
                this._options.groupBy = $("#chart-groupby").val();
            }
            this._generateDoughnut(true);
        }
        if (this._options.groupBy && this._options.groupByFields) {
            this._setModalTitle(this._options.dataName + ' Data Grouped By ' + _.find(this._options.groupByFields, {name:this._options.groupBy}).label);
        } else {
            this._setModalTitle(this._options.dataName + ' Data Grouped By Day');
        }
    },

    _onResize: function() {
        //this._chart.resize();
        //this._chart.update();
        this._centerModalY();
    },

    _onModalShown: function() {
        //select line by default
        //$('.ogrid-chart-body input[id="typeLine"]').prop('checked', true);
        $("#typeLine").prop('checked', true);
        if (!this._options.groupByFields) {
            $("#typeDoughnut").prop('disabled', true);
        }
        //manually trigger to initialize display
        this._onChartTypeClick({target: $('.ogrid-chart-body :checked')});
    },


    _getTemplate: function() {
        //return static string so there is no additional external file dependency
        //  and to keep this widget more self-contained (may use an external file later if this becomes cumbersome)
        //we can use build-tools later to automate reading this from template to embedded string in our class
        return '<div class="modal-dialog ogrid-chart-modal"><div class="modal-content"><div class="modal-header">' +
            this._options.title +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="ogrid-chart-body"><div class="ogrid-chart-options"><div class="row"><div class="col-xs-5"><div class="form-group"><p class="form-control-static">Chart type:</p><label id="optionDoughnut" class="radio-inline"><input type="radio" name="chartType" id="typeDoughnut" value="doughnut" checked>Doughnut</label><label class="radio-inline"><input type="radio" name="chartType" id="typeLine" value="line">Line</label><label class="radio-inline"><input type="radio" name="chartType" id="typeBar" value="bar">Bar</label></div></div><div class="col-xs-7"><div class="form-group"><p class="form-control-static">Group by:</p><select id="chart-groupby" class="form-control">><option value="">(None)<script type="text/x-jquery-tmpl" id="jqtmpl-chart-groupby"><option value="${name}">${label}</option></script></select></div></div></div></div><canvas class="ogrid-chart-canvas"></canvas></div></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div><!-- /.modal-content --></div><!-- /.modal-dialog -->';
    },

    _setModalTitle: function(title) {
        $('.ogrid-chart-modal .modal-header').html(title + '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    },

    _getChartDataForDoughnut: function(rawData, groupField) {
        var me = this;

        //group data by selected field
        var groupedData = this._nest(rawData.features, ['properties["' + groupField + '"]']);

        var sortedValues = _.keys(groupedData).sort();
        var colors = _.map(sortedValues, function(v) {
            return chroma.random().hex();
        });

        return {
            datasets: [{
                data: _.map(sortedValues,
                    function(v){
                        return groupedData[v].length;
                    } ),
                backgroundColor: colors,
                hoverBackgroundColor: _.map(colors, function(c) {
                    return chroma(c).luminance(0.5).hex();
                }),
                label: 'Dataset 1'
            }],
            labels: sortedValues
        };
    },

    _sortDays: function(a, b) {
        if (!a || !b)
            return 0;

        if (moment(a, 'M/D/YYYY').isAfter(moment(b), 'M/D/YYYY')) return 1;
        if (moment(a, 'M/D/YYYY').isBefore(moment(b), 'M/D/YYYY')) return -1;
        return 0;
    },

    //updates dataset object
    //if grouped is null, resetVal is used as a constant value
    _populateTimeSeriesData: function(dataset, values, grouped, resetVal) {
        _.each( values, function(w) {
            if (!dataset.hasOwnProperty(w)) {
                var c = chroma.random().hex();

                dataset[w] = {
                    label: w, //grouping field
                    backgroundColor: chroma(c).luminance(0.5).hex(),
                    borderColor: c,
                    fill: false,
                    data: [],

                    //turn off line smoothing for line graphs
                    lineTension: 0
                };
            }
            if (grouped) {
                if (!_.isArray(grouped)) {
                    dataset[w].data.push(grouped[w].length);
                } else {
                    //no group field specified
                    dataset[w].data.push(grouped.length);
                }
            } else {
                dataset[w].data.push(resetVal);
            }

        });
    },

    _getTimeSeriesData: function(rawData, groupField) {
        var me = this;

        //group data by day
        var groupByList = [
            function(feature) {
                //grouping by day
                return moment(feature.properties[me._options.xAxisField]).format("M/D/YYYY");
            }
        ];

        if (groupField) groupByList.push('properties["' + groupField + '"]');

        //group data
        var groupedDataByDay = this._nest(rawData.features, groupByList);

        //array of unique days, sorted asc
        var labels = _.keys(groupedDataByDay).sort(this._sortDays);

        var allGroupingValues = null;
        if (groupField) {
            //array of unique group values
            allGroupingValues = _.uniq(_.map(rawData.features, 'properties["' + groupField + '"]')).sort();
        }

        var dataset={};

        _.each(labels, function(v) {
            var byDay = groupedDataByDay[v];
            var valuesWithData = ['All'];

            if (groupField) {valuesWithData = _.keys(byDay).sort();}
            me._populateTimeSeriesData(dataset, valuesWithData, byDay);

            if (groupField) {
                //we have to fill non-existent counts with 0
                var valuesWithNoData = _.difference(allGroupingValues, valuesWithData);
                me._populateTimeSeriesData(dataset, valuesWithNoData, null, 0);
            }
        });

        return {
            labels: labels,
            //transform to an array
            datasets: _.map(dataset, function(v) {
                return v;
            })
        };
    },

    _getChartDataForLine: function(rawData, groupField) {
        var me = this;
        var counts = {};
        //count occurrences by grouping field
        $.each(rawData.features, function(i, v){
            var fieldVal = 'Unknown';
            if (v.properties.hasOwnProperty(groupField) && v.properties[groupField] !==''  && v.properties[groupField] !== null) {
                //record has a value on grouping field + creation date
                fieldVal = v.properties[groupField] + ',' + moment(v.properties[me._options.xAxisField]).format("M/D/YYYY");
            }
            if (counts.hasOwnProperty(fieldVal)) {
                counts[fieldVal].value++;
            } else {
                //not in our map yet, initialize
                counts[fieldVal] = {
                    value: 1,
                    label: fieldVal
                };
            }
        });

        var dataset={};
        $.each(counts, function(i, v) {
            var key = v.label;
            var a = key.split(',');
            var groupField = a[0];
            //var groupField = key; (if grouping by day only)

            if (!dataset.hasOwnProperty(groupField)) {
                var c = chroma.random().hex();
                dataset[groupField] = {
                    label: groupField, //grouping field
                    backgroundColor: chroma(c).luminance(0.5).hex(),
                    borderColor: c,
                    fill: false,
                    data: [],

                    //turn off line smoothing
                    lineTension: 0
                };
            }
            dataset[groupField].data.push({
                x: a[1],
                //x: groupField, (if grouping by day only)
                y: counts[key].value
            });
        });
        return {
            //transform to an array
            datasets: $.map(dataset, function(v, i) {
                return v;
            })
        };
    },

    _generateTimeSeriesChart: function(type, groupByDayOnly) {
        this._resetChart();

        var ctx = $('.ogrid-chart-canvas')[0].getContext("2d");

        //this._options.groupBy can be passed as null, if we want just counts by day
        //var data = this._getTimeSeriesData(this._options.data, this._options.groupBy);
        var data = this._getTimeSeriesData(this._options.data, (groupByDayOnly ? null :  this._options.groupBy) );

        var stepSize = 1;
        var unit = 'day';
        if (data.labels.length >=30) {
            if (data.labels.length >=60) {
                if (data.labels.length >=120) {
                    unit = 'quarter';
                } else {
                    unit = 'month';
                }
            } else {
                unit = 'week';
            }
        } else {
            stepSize = Math.floor(data.labels.length /7);
        }
        //unit = 'quarter';

        var options = {
            legend: {
                position: 'top'
            },
            responsive: true,
            scales: {
                xAxes: [{
                    type: "time",
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: this._options.xAxisLabel || 'Creation Date'
                    },
                    time: {
                        unit: unit, //month, week, day, hour, quarter, year
                        displayFormats: {
                            quarter: '[Q]Q/YYYY',
                            month: 'M/YYYY',
                            week: '[W]W/YYYY',
                            day: 'M/D/YYYY',
                            hour: 'M/D/YYYY H:m'
                        },
                        //1 week is max, otherwise adjust step size
                        unitStepSize: stepSize || 1
                    },
                    ticks: { callback: function( tick, index, ticks ){
                        if(!(index % parseInt(ticks.length / 15))) { //15 max ticks regardless of unit
                            return tick;
                        }
                        return null;
                        }
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: this._options.dataName + ' Records'
                    }
                }]
            }
        };

        this._chart = new Chart(ctx, {
                type: type,
                data: data,
                options: options
            }
        );
        //adjust modal layout
        $('.ogrid-chart-modal').css("width", "60%");
        $('.ogrid-chart-modal').css("height", "auto");
        this._centerModalY();
    },

    _centerModalY: function() {
        setTimeout(function() {
            //let the height refresh first
            $('.ogrid-chart-modal').css("margin", (window.innerHeight - $('.ogrid-chart-modal .modal-content').height())/2 +  "px auto auto auto");
        }, 200);
    },

    _generateDoughnut: function() {
        this._resetChart();

        var ctx = $('.ogrid-chart-canvas')[0].getContext("2d");

        var data = this._getChartDataForDoughnut(this._options.data, this._options.groupBy);

        var options = {
            legend: {
                position: 'top'
            },

            animation: {
                animateScale: true,
                animateRotate: true,
                animationEasing: "easeOutBounce",
                animationSteps: 100
            },
            responsive: true

        };

        //this._chart = new Chart(ctx).Pie(data, options);
        this._chart = new Chart(ctx,
            {
                type: 'doughnut',
                data: data,
                options: options
            }
        );

        //adjust modal layout
        //TODO implement in plain css later
        if (window.innerWidth < 1300) {
            $('.ogrid-chart-modal').css("width", "50%");
        } else {
            $('.ogrid-chart-modal').css("width", "35%");
        }
        this._centerModalY();
    },

    //use this to prevent issue with painting new chart (Chart.js has a tendency to keep previous chart)
    _resetChart: function(){

        //copy with current styles to prevent Chart.js errors
        //var $c = $('.ogrid-chart-canvas').clone();

        //try {
        if (this._chart) this._chart.destroy();
        //} catch (ex) {

        //}

        $('.ogrid-chart-canvas').remove();
        $('.ogrid-chart-body').append('<canvas class="ogrid-chart-canvas"><canvas>');
        //$c.appendTo($('.ogrid-chart-body'));
    },


    //public methods
    showModal: function() {
        var me = this;
        var p = $(this._container).parent();
        this._container.modal({show: true});
        this._container.on('hidden.bs.modal', function () {
            //clean destroy
            $(me._container).remove();
            me._container = $(me._containerClone).clone();

            //re-add restored copy
            $(p).append(me._containerClone);
            me._container = me._containerClone;
        });
    }

});

//support syntax without 'new' keyword (note: camel-back name)
ogrid.chart = function (container, options) {
    return new ogrid.Chart(container, options);
};