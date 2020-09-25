#!/usr/bin/env coffee

# Deps
{ program } = require '@caporal/core'
lighthouse = require 'lighthouse'
chromeLauncher = require 'chrome-launcher'
createProgressBar = require 'progress-estimator'
Table = require 'cli-table'

# On cntrl-c, trigger normal exit behavior
process.on 'SIGINT', -> process.exit(0)

# Const

# Setup CLI
program
.description 'Averages multiple successive Lighthouse tests'
.argument '<url>', 'The URL to test'
.option '-t, --times <count>', 'The number of tests to run', default: 10
.action ({ args: { url }, options: { times }, logger }) ->

	# Create storage for
	progress = createProgressBar()

	# Create chrome instance that runs test
	bootChrome = chromeLauncher.launch chromeFlags: ['--headless']
	chrome = await progress bootChrome, 'Booting Chrome', estimate: 1000
	process.on 'exit', -> chrome.kill() # Cleanup

	# Run tests one at a time and collect results
	results = []
	for time in [1..times]
		benchmark = lighthouse url,
			onlyCategories: ['performance']
			onlyAudits: ['first-contentful-paint', 'speed-index',
				'largest-contentful-paint', 'interactive', 'total-blocking-time',
				'cumulative-layout-shift']
			port: chrome.port
		{ report } =  await progress benchmark, "Test #{time}/#{times}",
			estimate: 6000
		results.push JSON.parse report

	# Close Chrome
	chrome.kill()

	# Create output of all results
	columns = ['Score', 'FCP', 'SI', 'LCP', 'TTI', 'TBT', 'CLS']
	table = new Table head: ['', ...columns]
	avgs = Array(columns.length).fill(0)
	for result, index in results

		# Build row content
		row = [
			result.categories.performance.score
			result.audits['first-contentful-paint'].numericValue
			result.audits['speed-index'].numericValue
			result.audits['largest-contentful-paint'].numericValue
			result.audits['interactive'].numericValue
			result.audits['total-blocking-time'].numericValue
			result.audits['cumulative-layout-shift'].numericValue
		]

		# Add to averages list
		avgs[i] = row[i]/times for val, i in avgs

		# Format for humans and add to table
		table.push "##{index + 1}": formatRow row

	# Add averages and output table
	table.push 'AVG': formatRow avgs
	console.log table.toString()

# Helper function to format a row of table output for human readibility
formatRow = (row) ->
	[score, fcp, si, lcp, tti, tbt, cls] = row
	[
		formatValue score * 100
		formatTime fcp
		formatTime si
		formatTime lcp
		formatTime tti
		formatTime tbt
		formatValue cls, 3
	]

# Convert ms to s
formatTime = (ms) ->
	if ms >= 1000 then formatValue(ms / 1000) + 's'
	else Math.round(ms) + 'ms'

# Round to a decimal value
formatValue = (num, depth = 1) -> num.toLocaleString 'en-US',
	minimumFractionDigits: 0
	maximumFractionDigits: depth

# Start it
program.run()
