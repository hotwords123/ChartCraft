const TOLERANCE = 1e-6

export default class TickLocator {
  maxTicks = 10 // Maximum number of ticks.

  // Sequence where the values are choices for tick multiples.
  steps = [1, 2, 2.5, 5]

  /**
   * Finds a set of ticks that are appropriate for the given range.
   * @param vmin the lower bound of the range
   * @param vmax the upper bound of the range
   * @returns the selected ticks
   */
  getTicks(vmin: number, vmax: number): number[] {
    if (vmin > vmax) throw new Error('vmin must be less than or equal to vmax')
    if (vmin === vmax) return [vmin]

    const bestStep = this.getBestStep(vmin, vmax)
    const lbound = Math.floor(vmin / bestStep + TOLERANCE)
    const ubound = Math.ceil(vmax / bestStep - TOLERANCE)

    const ticks = []
    for (let i = lbound; i <= ubound; i++) {
      ticks.push(i * bestStep)
    }

    return ticks
  }

  /**
   * Finds the step size that covers [vmin, vmax] with the shortest total length.
   * @param vmin the lower bound of the range
   * @param vmax the upper bound of the range
   */
  private getBestStep(vmin: number, vmax: number): number {
    const range = vmax - vmin
    const rawStep = range / this.maxTicks
    const magnitude = Math.floor(Math.log10(rawStep))
    const multiplierBase = Math.pow(10, magnitude)

    let bestStep = 0
    let bestLength = Number.MAX_VALUE
    for (let multiplier = multiplierBase; ; multiplier *= 10) {
      for (const step of this.steps) {
        const stepSize = multiplier * step
        if (stepSize > range) {
          if (bestStep === 0) throw new Error('failed to find a suitable step size')
          return bestStep
        }

        const lbound = Math.floor(vmin / stepSize + TOLERANCE)
        const ubound = Math.ceil(vmax / stepSize - TOLERANCE)
        const tickCount = ubound - lbound + 1
        if (tickCount > this.maxTicks) continue

        const length = tickCount * stepSize
        if (bestLength > length + TOLERANCE) {
          bestStep = stepSize
          bestLength = length
        }
      }
    }
  }
}
