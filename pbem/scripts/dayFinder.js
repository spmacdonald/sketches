'use strict';

var d3 = require('d3');
var dc = require('dc');
var nyisoGrouper = require('./nyisoGrouper');

function DayFinder() {

  var zoneChart = dc.barChart('#zone-container');
  var monthChart = dc.barChart('#month-container');
  var hourChart = dc.barChart('#hour-container');
  var daChart = dc.barChart('#da-container');
  var rtChart = dc.barChart('#rt-container');
  var dateChart = dc.lineChart('#date-container');
  var dataTable = dc.dataTable('#table-container');

  function type(d) {
    d3.keys(d).forEach(function(k) {
      if (k !== 'ts' && k !== 'zone_letter') d[k] = +d[k];
    });
    d.ts = new Date(d.ts);
    return d;
  };

  d3.csv('nyiso_small.csv', type, function(error, data) {
    if (error) { throw error; }

    var nyiso = crossfilter(data);
    var all = nyiso.groupAll();

    var zoneDimension = nyiso.dimension(function(d) {
      return d.zone_letter;
    });
    var zoneGroup = zoneDimension.group();

    var monthDimension = nyiso.dimension(function(d) {
      var month = d.ts.getMonth();
      return month;
    });
    var monthGroup = monthDimension.group();

    var hourDimension = nyiso.dimension(function(d) {
      return d.ts.getHours() + 1;
    });
    var hourGroup = hourDimension.group();

    var dateDimension = nyiso.dimension(function(d) {
      return d3.time.day(d.ts);
    });
    var dateGroup = dateDimension.group();

    var daDimension = nyiso.dimension(function(d) {
      // return Math.floor(d.da_lbmp / 50) * 50;
      return nyisoGrouper.nyisoPriceAggregation(d.da_lbmp);
    });
    var daGroup = daDimension.group();

    var rtDimension = nyiso.dimension(function(d) {
      return nyisoGrouper.nyisoPriceAggregation(d.rt_lbmp);
    });
    var rtGroup = rtDimension.group();

    var dayOfWeek = nyiso.dimension(function(d) {
      var day = d.ts.getDay();
      var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return day + '.' + name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();


    // Charts
    zoneChart
        .width(null)
        .height(null)
        .gap(1)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(zoneGroup)
        .dimension(zoneDimension)
        .elasticY(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .brushOn(true);

    var monthLabels = {
      0: 'Jan',
      1: 'Feb',
      2: 'Mar',
      3: 'Apr',
      4: 'May',
      5: 'Jun',
      6: 'Jul',
      7: 'Aug',
      8: 'Sep',
      9: 'Oct',
      10: 'Nov',
      11: 'Dec'
    };
    monthChart
        .width(null)
        .height(null)
        .gap(1)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(monthGroup)
        .dimension(monthDimension)
        .elasticY(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .brushOn(true)
        .xAxis().tickFormat(function(d) { return monthLabels[d]; });

    hourChart
        .width(null)
        .height(null)
        .gap(1)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(hourGroup)
        .dimension(hourDimension)
        .elasticY(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .brushOn(true);

    daChart
        .width(null)
        .height(null)
        .title(function(d) { return d.key; })
        .renderTitle(true)
        .gap(1)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(daGroup)
        .dimension(daDimension)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(d3.range(10)))
        .y(d3.scale.sqrt())
        .xUnits(dc.units.ordinal)
        .brushOn(true)
        .xAxis().tickFormat(function(d) { return nyisoGrouper.nyisoPriceLabels[d]; });

    rtChart
        .width(null)
        .height(null)
        .gap(1)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(rtGroup)
        .dimension(rtDimension)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(d3.range(10)))
        .y(d3.scale.sqrt())
        .xUnits(dc.units.ordinal)
        .brushOn(true)
        .xAxis().tickFormat(function(d) { return nyisoGrouper.nyisoPriceLabels[d]; });

    dateChart
        .width(null)
        .height(null)
        .margins({top: 20, left: 40, right: 10, bottom: 20})
        .group(dateGroup)
        .dimension(dateDimension)
        .interpolate('step')
        .renderArea(true)
        .elasticY(true)
        .x(d3.time.scale().domain(d3.extent(dateGroup.all().map(function(d) { return d.key; }))))
        .brushOn(true)
        .xAxis();

    dataTable
        .size(100)
        .columns(['ts', 'zone_letter', 'rt_lbmp'])
        .dimension(dateDimension)
        .group(function(d) {
          var format = d3.format('02d');
          return d.zone_letter + ' ' + d.ts.getFullYear() + '/' + format((d.ts.getMonth() + 1));
        })
        .sortBy(function (d) {
          return d.ts;
        })
        .order(d3.ascending);

    dc.renderAll();

  });

}

module.exports = DayFinder;
// }());
