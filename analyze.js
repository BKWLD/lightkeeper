#!/usr/bin/env node
;
var Table, analyzeUrl, chalk, chromeLauncher, configs, createProgressBar, defaultProgressTheme, formatRow, formatTime, formatValue, lighthouse, program, startUp, ucFirst;

// Deps
({program} = require('@caporal/core'));

lighthouse = require('lighthouse');

chromeLauncher = require('chrome-launcher');

createProgressBar = require('progress-estimator');

defaultProgressTheme = require('progress-estimator/src/theme');

Table = require('cli-table');

chalk = require('chalk');

// Load Lighthouse configs
configs = {
  desktop: require('lighthouse/lighthouse-core/config/lr-desktop-config.js'),
  mobile: require('lighthouse/lighthouse-core/config/lr-mobile-config.js')
};

// On cntrl-c, trigger normal exit behavior
process.on('SIGINT', function() {
  return process.exit(0);
});

// Setup CLI
program.description('Averages multiple successive Lighthouse tests').argument('<url>', 'The URL to test').option('-t, --times <count>', 'The number of tests to run', {
  default: 10
// Map args and begin running
}).option('-d, --desktop', 'Test desktop rather than mobile').option('-b, --both ', 'Test desktop and mobile').action(function({
    args: {url},
    options: {times, desktop, both}
  }) {
  var devices;
  devices = (function() {
    switch (false) {
      case !both:
        return ['desktop', 'mobile'];
      case !desktop:
        return ['desktop'];
      default:
        return ['mobile'];
    }
  })();
  return startUp({url, times, devices});
});

program.run();

// Boot up the runner
startUp = async function({url, times, devices}) {
  var bootChrome, chrome, device, j, len, progress, theme;
  // Create shared progress bar
  theme = defaultProgressTheme;
  theme.asciiInProgress = chalk.hex('#00de6d');
  progress = createProgressBar({theme});
  // Create chrome instance that runs test
  bootChrome = chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  chrome = (await progress(bootChrome, 'Booting Chrome', {
    estimate: 1000
  }));
  process.on('exit', function() {
    return chrome.kill(); // Cleanup
  });

  // Loop through each device and run tests
  for (j = 0, len = devices.length; j < len; j++) {
    device = devices[j];
    await analyzeUrl({url, times, device, chrome, progress});
  }
  // Close Chrome
  return chrome.kill();
};

// Analyze a URL a certain number of times for the provided device
analyzeUrl = async function({url, times, device, chrome, progress}) {
  var avgs, columns, i, index, j, k, l, len, len1, ref, report, result, results, row, settings, table, time, val;
  // Make the lighthouse config
  settings = {
    onlyCategories: ['performance'],
    port: chrome.port
  };
  // Run tests one at a time and collect results
  results = [];
  for (time = j = 1, ref = times; (1 <= ref ? j <= ref : j >= ref); time = 1 <= ref ? ++j : --j) {
    ({report} = (await progress(lighthouse(url, settings, configs[device]), `Testing ${ucFirst(device)} ${time}/${times}`, {
      estimate: 10000
    })));
    results.push(JSON.parse(report));
  }
  // Create output of all results
  columns = ['Score', 'FCP', 'SI', 'LCP', 'TTI', 'TBT', 'CLS'];
  table = new Table({
    head: ['', ...columns],
    style: {
      head: ['green']
    }
  });
  avgs = Array(columns.length).fill(0);
  for (index = k = 0, len = results.length; k < len; index = ++k) {
    result = results[index];
    // Build row content
    row = [result.categories.performance.score, result.audits['first-contentful-paint'].numericValue, result.audits['speed-index'].numericValue, result.audits['largest-contentful-paint'].numericValue, result.audits['interactive'].numericValue, result.audits['total-blocking-time'].numericValue, result.audits['cumulative-layout-shift'].numericValue];
    for (i = l = 0, len1 = avgs.length; l < len1; i = ++l) {
      val = avgs[i];
      // Add to averages list
      avgs[i] += row[i] / times;
    }
    // Format for humans and add to table
    table.push({
      [`#${index + 1}`]: formatRow(row)
    });
  }
  // Add averages and output table
  table.push({
    [chalk.bold('AVG')]: formatRow(avgs).map(function(val) {
      return chalk.bold(val);
    })
  });
  console.log("\n\n" + chalk.green.bold(`${ucFirst(device)} Results`));
  return console.log(table.toString() + "\n");
};

// Helper function to format a row of table output for human readibility
formatRow = function(row) {
  var cls, fcp, lcp, score, si, tbt, tti;
  [score, fcp, si, lcp, tti, tbt, cls] = row;
  return [formatValue(score * 100), formatTime(fcp), formatTime(si), formatTime(lcp), formatTime(tti), formatTime(tbt), formatValue(cls, 3)];
};

// Convert ms to s
formatTime = function(ms) {
  if (ms >= 1000) {
    return formatValue(ms / 1000) + 's';
  } else {
    return Math.round(ms) + 'ms';
  }
};

// Round to a decimal value
formatValue = function(num, depth = 1) {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: depth
  });
};

// Capitalize first letter
ucFirst = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
