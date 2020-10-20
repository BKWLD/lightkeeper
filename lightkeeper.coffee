# Deps
{ program } = require '@caporal/core'
lighthouse = require 'lighthouse'
chromeLauncher = require 'chrome-launcher'
createProgressBar = require 'progress-estimator'
defaultProgressTheme = require 'progress-estimator/src/theme'
Table = require 'cli-table'
chalk = require 'chalk'

# Load Lighthouse configs
configs =
	desktop: require 'lighthouse/lighthouse-core/config/lr-desktop-config.js'
	mobile: require 'lighthouse/lighthouse-core/config/lr-mobile-config.js'

# On cntrl-c, trigger normal exit behavior
process.on 'SIGINT', -> process.exit(0)

# Setup CLI
program
.description 'Averages multiple successive Lighthouse tests'
.argument '<url>', 'The URL to test'
.option '-t, --times <count>', 'The number of tests to run', default: 10
.option '-d, --desktop', 'Test only desktop'
.option '-m, --mobile ', 'Test only mobile'

# Map args and begin running
.action ({ args: { url }, options: { times, desktop, mobile }}) ->
	devices = switch
		when mobile then ['mobile']
		when desktop then ['desktop']
		else ['desktop', 'mobile']
	startUp { url, times, devices }
program.run()

# Boot up the runner
startUp = ({ url, times, devices }) ->

	# Create shared progress bar
	theme = defaultProgressTheme
	theme.asciiInProgress = chalk.hex '#00de6d'
	progress = createProgressBar { theme }
	console.log "" # Adds a newline

	# Create chrome instance that runs test
	bootChrome = chromeLauncher.launch chromeFlags: ['--headless']
	chrome = await progress bootChrome, 'Booting Chrome', estimate: 1000
	process.on 'exit', -> chrome.kill() # Cleanup

	# Loop through each device and run tests
	for device in devices
		await analyzeUrl {url, times, device, chrome, progress }

	# Close Chrome
	chrome.kill()

# Analyze a URL a certain number of times for the provided device
analyzeUrl = ({ url, times, device, chrome, progress }) ->

	# Make the lighthouse config
	settings =
		onlyCategories: ['performance']
		port: chrome.port

	# Run tests one at a time and collect results
	results = []
	for time in [1..times]
		{ report } =  await progress lighthouse(url, settings, configs[device]),
			"Testing #{ucFirst device} #{time}/#{times}", estimate: 10000
		results.push JSON.parse report

	# Create output of all results
	columns = ['Score', 'FCP', 'SI', 'LCP', 'TTI', 'TBT', 'CLS']
	table = new Table
		head: ['', ...columns]
		style: head: ['green']
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
		avgs[i] += row[i]/times for val, i in avgs

		# Format for humans and add to table
		table.push "##{index + 1}": formatRow row

	# Add averages and output table
	table.push [chalk.bold('AVG')]: formatRow(avgs).map (val) -> chalk.bold val
	console.log "\n\n" + chalk.green.bold "#{ucFirst device} Results"
	console.log table.toString() + "\n"

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

# Capitalize first letter
ucFirst = (str) -> str.charAt(0).toUpperCase() + str.slice(1)
