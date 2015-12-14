'use strict';

var between = function(d, min, max) {
  return d >= min && d < max;
}

var nyisoPriceLabels = {
  0: '< 0',
  1: '20',
  2: '40',
  3: '70',
  4: '100',
  5: '150',
  6: '200',
  7: '500',
  8: '1000',
  9: '> 1000'
};

var nyisoPriceAggregation = function(d) {
  if (between(d, -1e6, 0)) return 0;
  if (between(d, 0, 20)) return 1;
  if (between(d, 20, 40)) return 2;
  if (between(d, 40, 70)) return 3;
  if (between(d, 70, 100)) return 4;
  if (between(d, 100, 150)) return 5;
  if (between(d, 150, 200)) return 6;
  if (between(d, 200, 500)) return 7;
  if (between(d, 500, 1000)) return 8;
  if (between(d, 1000, 1e6)) return 9;
}

exports.nyisoPriceLabels = nyisoPriceLabels;
exports.nyisoPriceAggregation = nyisoPriceAggregation;
