/**
 * Returns the timestamp of the first day of a year.
 * @param year the year
 * @returns the timestamp
 */
export function getYearTimestamp(year: number): number {
  return new Date(year, 0).getTime()
}

/**
 * Formats a float to a string with a maximum of 6 decimal places.
 * @param value the float to format
 * @returns the formatted string
 */
export function formatFloat(value: number): string {
  let i = 0
  for (; i < 6; i++) {
    const error = (value * Math.pow(10, i)) % 1
    if (error < 1e-6) break
  }
  return value.toFixed(i)
}

/**
 * Clamps a value between a minimum and maximum.
 * @param value the value to clamp
 * @param min the minimum value
 * @param max the maximum value
 * @returns the clamped value
 */
export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

/**
 * Finds the smallest integer that satisfies the given predicate.
 * @param lbound the lower bound of the search range
 * @param ubound the upper bound of the search range
 * @param predicate the predicate to test
 * @returns the result integer
 */
export function binarySearchMin(
  lbound: number,
  ubound: number,
  predicate: (value: number) => boolean,
): number {
  while (lbound < ubound) {
    const mid = Math.floor((lbound + ubound) / 2)
    if (predicate(mid)) {
      ubound = mid
    } else {
      lbound = mid + 1
    }
  }
  return lbound
}
