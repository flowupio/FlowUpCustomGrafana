///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import moment from 'moment';
import * as dateMath from './datemath';

var spans = {
  's': {display: 'second'},
  'm': {display: 'minute'},
  'h': {display: 'hour'},
  'd': {display: 'day'},
  'w': {display: 'week'},
  'M': {display: 'month'},
};

var rangeOptions = [
  { from: 'now/d',    to: 'now/d',    display: 'Today',                 section: 2 },
  { from: 'now/d',    to: 'now',      display: 'Today so far',          section: 2 },
  { from: 'now/w',    to: 'now/w',    display: 'This week',             section: 2 },
  { from: 'now/w',    to: 'now',      display: 'This week so far',           section: 2 },
  { from: 'now/M',    to: 'now/M',    display: 'This month',            section: 2 },

  { from: 'now-1d/d', to: 'now-1d/d', display: 'Yesterday',             section: 1 },
  { from: 'now-2d/d', to: 'now-2d/d', display: 'Day before yesterday',  section: 1 },
  { from: 'now-7d/d', to: 'now-7d/d', display: 'This day last week',    section: 1 },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Previous week',         section: 1 },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Previous month',        section: 1 },

  { from: 'now-5m',   to: 'now',      display: 'Last 5 minutes',        section: 3 },
  { from: 'now-15m',  to: 'now',      display: 'Last 15 minutes',       section: 3 },
  { from: 'now-30m',  to: 'now',      display: 'Last 30 minutes',       section: 3 },
  { from: 'now-1h',   to: 'now',      display: 'Last 1 hour',           section: 3 },
  { from: 'now-3h',   to: 'now',      display: 'Last 3 hours',          section: 3 },
  { from: 'now-6h',   to: 'now',      display: 'Last 6 hours',          section: 3 },
  { from: 'now-12h',  to: 'now',      display: 'Last 12 hours',         section: 3 },
  { from: 'now-24h',  to: 'now',      display: 'Last 24 hours',         section: 3 },

  { from: 'now-7d',   to: 'now',      display: 'Last 7 days',           section: 0 },
  { from: 'now-30d',  to: 'now',      display: 'Last 30 days',          section: 0 },
  { from: 'now-60d',  to: 'now',      display: 'Last 60 days',          section: 0 },
];

var absoluteFormat = 'MMM D, YYYY HH:mm:ss';

var rangeIndex = {};
_.each(rangeOptions, function (frame) {
  rangeIndex[frame.from + ' to ' + frame.to] = frame;
});

export  function getRelativeTimesList(timepickerSettings, currentDisplay) {
  var groups = _.groupBy(rangeOptions, (option: any) => {
    option.active = option.display === currentDisplay;
    return option.section;
  });

  // _.each(timepickerSettings.time_options, (duration: string) => {
  //   let info = describeTextRange(duration);
  //   if (info.section) {
  //     groups[info.section].push(info);
  //   }
  // });

  return groups;
}

function formatDate(date) {
  return date.format(absoluteFormat);
}

// handles expressions like
// 5m
// 5m to now/d
// now/d to now
// now/d
// if no to <expr> then to now is assumed
export function describeTextRange(expr: any) {
  if (expr.indexOf('now') === -1) {
    expr = 'now-' + expr;
  }

  let opt = rangeIndex[expr + ' to now'];
  if (opt) {
    return opt;
  }

  opt = {from: expr, to: 'now'};

  let parts = /^now-(\d+)(\w)/.exec(expr);
  if (parts) {
    let unit = parts[2];
    let amount = parseInt(parts[1]);
    let span = spans[unit];
    if (span) {
      opt.display = 'Last ' + amount + ' ' + span.display;
      opt.section = span.section;
      if (amount > 1) {
        opt.display += 's';
      }
    }
  } else {
    opt.display = opt.from + ' to ' + opt.to;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range) {
  var option = rangeIndex[range.from.toString() + ' to ' + range.to.toString()];
  if (option) {
    return option.display;
  }

  if (moment.isMoment(range.from) && moment.isMoment(range.to)) {
    return formatDate(range.from) + ' to ' + formatDate(range.to);
  }

  if (moment.isMoment(range.from)) {
    var toMoment = dateMath.parse(range.to, true);
    return formatDate(range.from) + ' to ' + toMoment.fromNow();
  }

  if (moment.isMoment(range.to)) {
    var from = dateMath.parse(range.from, false);
    return from.fromNow() + ' to ' + formatDate(range.to);
  }

  if (range.to.toString() === 'now') {
    var res = describeTextRange(range.from);
    return res.display;
  }

  return range.from.toString() + ' to ' + range.to.toString();
}

