export type ChartDataItem = [string, number]
export type ChartData = ChartDataItem[]

export interface ChartOptions {
  title: string
  width: number
  height: number
  background: string
  axes: {
    color: string
  }
  barChart: {
    visible: boolean
    fillStyle: string | GradientOptions
  }
  lineChart: {
    visible: boolean
    strokeStyle: string
    lineWidth: number
    lineDash: DashPattern | number[]
    marker: {
      shape: 'circle' | 'square'
      size: number
      fillStyle: string
      strokeStyle: string
      lineWidth: number
    }
  }
  text: {
    font: string
    titleFont: string
    fillStyle: string
  }
}

interface GradientOptions {
  stops: {
    offset: number
    color: string
  }[]
}

type DashPattern = keyof typeof DASH_PATTERNS
export const DASH_PATTERNS = {
  solid: [],
  dashed: [5],
  dotted: [2, 5],
  dashDotted: [5, 5, 2, 5],
}
