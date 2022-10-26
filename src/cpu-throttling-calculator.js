// See: https://github.com/patrickhulce/lighthouse-cpu-throttling-calculator/blob/master/pages/index.js
// AKA: https://lighthouse-cpu-throttling-calculator.vercel.app/

/**
 * Returns the multipliers and error messages for the BenchmarkIndex.
 * @see https://docs.google.com/spreadsheets/d/1E0gZwKsxegudkjJl8Fki_sOwHKpqgXwt8aBAfuUaB8A/edit#gid=0
 */
exports.computeMultiplierMessages = function (benchmarkIndex) {
  if (!Number.isFinite(benchmarkIndex)) return undefined
  if (benchmarkIndex >= 1300) {
    // 2000 = 6x slowdown
    // 1766 = 5x slowdown
    // 1533 = 4x slowdown
    // 1300 = 3x slowdown
    const excess = (benchmarkIndex - 1300) / 233
    const multiplier = 3 + excess
    const confidenceRange = Math.min(Math.max(excess, 1.5, multiplier * 0.3))
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else if (benchmarkIndex >= 800) {
    // 1300 = 3x slowdown
    // 800 = 2x slowdown
    const excess = (benchmarkIndex - 800) / 500
    const multiplier = 2 + excess
    const confidenceRange = 1.5
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else if (benchmarkIndex >= 150) {
    // 800 = 2x slowdown
    // 150 = 1x
    const excess = (benchmarkIndex - 150) / 650
    const multiplier = 1 + excess
    const confidenceRange = 0.5
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else {
    return {message: 'This device is too slow to accurately emulate the target Lighthouse device.'}
  }
}
