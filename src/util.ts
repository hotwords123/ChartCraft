export function formatFloat(value: number): string {
  let i = 0
  for (; i < 6; i++) {
    const error = (value * Math.pow(10, i)) % 1
    if (error < 1e-6) break
  }
  return value.toFixed(i)
}
