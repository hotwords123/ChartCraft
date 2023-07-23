export type ChartDataItem = [string, number]
export type ChartData = ChartDataItem[]

export interface ChartOptions {
  title: string
  width: number
  height: number
  background: string
  boxBackground: string
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
      shape: 'circle' | 'square' | 'triangle' | 'diamond'
      size: number
      fillStyle: string
      strokeStyle: string
      lineWidth: number
    }
  }
  text: {
    title: FontOptions
    ticks: FontOptions
    labels: FontOptions
  }
}

export interface FontOptions {
  family: string
  size: number
  fillStyle: string
}

export interface GradientOptions {
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

export const MARKER_SHAPE = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'square' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
]

export const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Times', value: 'Times' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Courier', value: 'Courier' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Arial Black', value: 'Arial Black' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
  { label: 'Lucida Grande', value: 'Lucida Grande' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Geneva', value: 'Geneva' },
  { label: 'Helvetica Neue', value: 'Helvetica Neue' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Optima', value: 'Optima' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '微软正黑体', value: 'Microsoft JhengHei' },
  { label: '新宋体', value: 'NSimSun' },
  { label: '新细明体', value: 'PMingLiU' },
  { label: '细明体', value: 'MingLiU' },
  { label: '仿宋', value: 'FangSong' },
  { label: '楷体', value: 'KaiTi' },
  { label: '华文宋体', value: 'STSong' },
  { label: '华文黑体', value: 'STHeiti' },
  { label: '华文仿宋', value: 'STFangsong' },
  { label: '华文楷体', value: 'STKaiti' },
  { label: '华文中宋', value: 'STZhongsong' },
  { label: '华文行楷', value: 'STXingkai' },
  { label: '华文新魏', value: 'STXinwei' },
]
