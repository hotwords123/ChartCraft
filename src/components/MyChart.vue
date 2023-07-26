<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { type ChartData, type ChartOptions, DASH_PATTERNS, type FontOptions } from '@/chart'
import TickLocator from '@/TickLocator'
import { formatFloat } from '@/util'

const props = defineProps<{
  data: ChartData
  options: ChartOptions
}>()

/* ==== canvas DOM ==== */

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas()
  render(ctx)
})

watch(props, () => {
  nextTick(() => ctx && render(ctx))
})

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  const { width, height } = props.options

  const devicePixelRatio = window.devicePixelRatio || 1

  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx.resetTransform()
  ctx.scale(devicePixelRatio, devicePixelRatio)
}

/* ==== line chart data ==== */

let percentages: number[] = []

function prepareData() {
  const { data } = props
  if (data.length === 0) return

  // generate line chart data points
  const total = data.reduce((sum, [, y]) => sum + y, 0)
  percentages = data.map(([, y]) => (y / total) * 100)
}

/* ==== chart layout ==== */

let oldWidth = 0
let oldHeight = 0

let originX: number
let originY: number
let boxWidth: number
let boxHeight: number

let stepX: number

let barBoxHeight: number
let barOffsetY: number
let barStepY: number

let lineBoxHeight: number
let lineOffsetY: number
let lineStepY: number

let xTickIndices: number[]
let yTicks: number[]

function calculateLayout(ctx: CanvasRenderingContext2D) {
  const { data, options } = props
  const { width, height } = options

  // calculate origin and box size
  originX = 80
  originY = height - 40
  boxWidth = width - 70 - originX
  boxHeight = originY - 80

  if (data.length === 0) return

  // calculate step size
  stepX = boxWidth / data.length

  // calculate x-axis tick step
  const xTickStep = binarySearchMin(1, data.length, (step) => {
    const width = step * stepX
    for (let i = 0; i < data.length; i += step) {
      const labelWidth = ctx.measureText(data[i][0]).width
      if (labelWidth + 15 > 0.9 * width) {
        return false
      }
    }
    return true
  })

  // generate x-axis tick indices
  xTickIndices = []
  for (let i = 0; i < data.length; i += xTickStep) {
    xTickIndices.push(i)
  }

  // for bar chart
  const yMin = Math.min(...data.map(([, y]) => y))
  const yMax = Math.max(...data.map(([, y]) => y))

  const locator = new TickLocator()
  if (yMin === yMax || yMin < 0.6 * yMax) {
    locator.maxTicks = 10
    yTicks = locator.getTicks(0, yMax)
    barOffsetY = 0
  } else {
    locator.maxTicks = 7
    yTicks = locator.getTicks(yMin, yMax)
    barOffsetY = 0.2 * boxHeight
  }

  barBoxHeight = 0.75 * boxHeight
  barStepY = (barBoxHeight - barOffsetY) / (yTicks[yTicks.length - 1] - yTicks[0])

  // for line chart
  const maxPercentage = Math.max(...percentages)
  lineOffsetY = 0.25 * boxHeight
  lineBoxHeight = boxHeight - 50 - lineOffsetY
  lineStepY = lineBoxHeight / maxPercentage
}

/**
 * Finds the smallest integer that satisfies the given predicate.
 * @param lbound the lower bound of the search range
 * @param ubound the upper bound of the search range
 * @param predicate the predicate to test
 * @returns the result integer
 */
function binarySearchMin(
  lbound: number,
  ubound: number,
  predicate: (value: number) => boolean,
): number {
  while (lbound < ubound) {
    let mid = Math.floor((lbound + ubound) / 2)
    if (predicate(mid)) {
      ubound = mid
    } else {
      lbound = mid + 1
    }
  }
  return lbound
}

/**
 * Returns the y coordinate of the given bar chart value.
 * @param y bar chart value
 */
function barChartY(y: number): number {
  return -barOffsetY - (y - yTicks[0]) * barStepY
}

/**
 * Returns the y coordinate of the given line chart value.
 * @param y line chart value (percentage)
 */
function lineChartY(y: number): number {
  return -lineOffsetY - y * lineStepY
}

/* ==== zoom ==== */

// the transform matrix is:
// [scale, 0, translateX]
// [0, scale, translateY]
// [0, 0, 1]

let scale = 1
let translateX = 0
let translateY = 0

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function clampTransform() {
  const { width, height } = props.options
  const borderX = width - width * scale
  const borderY = height - height * scale
  if (scale < 1) {
    translateX = clamp(translateX, 0, borderX)
    translateY = clamp(translateY, 0, borderY)
  } else {
    translateX = clamp(translateX, borderX, 0)
    translateY = clamp(translateY, borderY, 0)
  }
}

function mouseMoveHandler(evt: MouseEvent) {
  if (!ctx) return

  const { movementX, movementY, buttons } = evt
  if (buttons & 1) {
    translateX += movementX
    translateY += movementY
    clampTransform()
    render(ctx)
  }
}

function wheelHandler(evt: WheelEvent) {
  if (!ctx) return

  const { offsetX, offsetY, deltaY } = evt

  let newScale = deltaY < 0 ? scale + 0.05 : scale - 0.05
  newScale = Math.max(0.25, Math.min(4, newScale))

  if (Math.abs(newScale - 1) < 1e-3) newScale = 1

  // invariant: the point (offsetX, offsetY) is fixed after zooming
  // offsetX = x * scale + translateX = x * scale' + translateX'
  // offsetY = y * scale + translateY = y * scale' + translateY'

  const multiplier = newScale / scale
  scale = newScale

  // solve for translateX' and translateY'
  translateX = offsetX - (offsetX - translateX) * multiplier
  translateY = offsetY - (offsetY - translateY) * multiplier
  clampTransform()

  render(ctx)
}

/* ==== render ==== */

function applyFontOptions(ctx: CanvasRenderingContext2D, fontOptions: FontOptions) {
  const { family, size, fillStyle } = fontOptions
  ctx.font = `${size}px ${family}`
  ctx.fillStyle = fillStyle
}

function render(ctx: CanvasRenderingContext2D) {
  const { options } = props
  const { width, height } = options

  prepareData()

  if (width !== oldWidth || height !== oldHeight) {
    resizeCanvas()

    oldWidth = width
    oldHeight = height
  }

  calculateLayout(ctx)

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // apply transform
  ctx.transform(scale, 0, 0, scale, translateX, translateY)

  // draw background
  ctx.fillStyle = options.background
  ctx.fillRect(0, 0, width, height)

  // draw title
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  applyFontOptions(ctx, options.text.title)
  ctx.fillText(
    options.title,
    originX + boxWidth / 2,
    (originY - boxHeight) * 0.5,
    originX + boxWidth / 2,
  )

  ctx.translate(originX, originY)

  // draw box background
  ctx.fillStyle = options.boxBackground
  ctx.fillRect(0, 0, boxWidth, -boxHeight)

  if (props.data.length === 0) {
    // no data is available
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    applyFontOptions(ctx, options.text.labels)
    ctx.fillText('No data', boxWidth / 2, -boxHeight / 2)
  } else {
    drawAxes(ctx)
    if (options.barChart.visible) {
      drawBarChart(ctx)
    }
    if (options.lineChart.visible) {
      drawLineChart(ctx)
    }
  }

  ctx.restore()

  // draw zoom indicator
  drawZoomIndicator(ctx)
}

function drawZoomIndicator(ctx: CanvasRenderingContext2D) {
  const FONT_SIZE = 12
  const INDICATOR_X = 10
  const INDICATOR_Y = 10
  const PADDING_X = 8
  const PADDING_Y = 6

  if (scale === 1) return

  ctx.font = `${FONT_SIZE}px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  const text = `${Math.round(scale * 100)}%`
  const textMetrics = ctx.measureText(text)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.beginPath()
  ctx.roundRect(
    INDICATOR_X,
    INDICATOR_Y,
    2 * PADDING_X + textMetrics.width,
    2 * PADDING_Y + textMetrics.actualBoundingBoxDescent,
    4,
  )
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.fillText(text, INDICATOR_X + PADDING_X, INDICATOR_Y + PADDING_Y)
}

function drawAxes(ctx: CanvasRenderingContext2D) {
  const { data, options } = props

  // draw x-axis
  ctx.fillStyle = options.axes.color
  ctx.strokeStyle = options.axes.color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(boxWidth + 10, 0)
  ctx.lineTo(boxWidth, -4)
  ctx.lineTo(boxWidth, 4)
  ctx.lineTo(boxWidth + 10, 0)
  ctx.fill()
  ctx.stroke()

  // draw y-axis
  ctx.beginPath()
  ctx.moveTo(0, 0)
  if (barOffsetY > 0) {
    ctx.setLineDash([5])
    ctx.lineTo(0, -barOffsetY + 15)
    ctx.stroke()

    ctx.setLineDash([])
    ctx.beginPath()
    ctx.moveTo(0, -barOffsetY + 15)
  }
  ctx.lineTo(0, -boxHeight - 10)
  ctx.lineTo(-4, -boxHeight)
  ctx.lineTo(4, -boxHeight)
  ctx.lineTo(0, -boxHeight - 10)
  ctx.fill()
  ctx.stroke()

  // draw x-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  applyFontOptions(ctx, options.text.ticks)
  for (let i of xTickIndices) {
    ctx.fillText(`${data[i][0]}`, (i + 0.5) * stepX, 8)
  }

  // draw x-axis title
  ctx.textAlign = 'left'
  ctx.fillText('Year', boxWidth + 15, 8)

  // draw y-axis labels
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  if (barOffsetY > 0) {
    ctx.fillText('0', -8, 0)
  }
  for (let y of yTicks) {
    ctx.fillText(`${formatFloat(y)}`, -8, barChartY(y))
  }

  // draw y-axis title
  ctx.fillText('Count', -12, -boxHeight)
}

function drawBarChart(ctx: CanvasRenderingContext2D) {
  const { data, options } = props

  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  let barFillStyle: string | CanvasGradient | CanvasPattern

  if (options.barChart.fillType === 'pattern') {
    if (typeof options.barChart.fillStyle === 'string') {
      const img = new Image()
      img.src = options.barChart.fillStyle
      img.onload = function() {
        const pattern = ctx.createPattern(img, 'repreat')
        if (pattern) {
          barFillStyle = pattern
        } else {
          console.error('Failed to create pattern')
        }
      }
    }
  } else {
    if (typeof options.barChart.fillStyle === 'string') {
      barFillStyle = options.barChart.fillStyle
    } else {
      const { stops } = options.barChart.fillStyle
      const gradient = ctx.createLinearGradient(0, -barOffsetY, 0, -barOffsetY - barBoxHeight)
      for (const { offset, color } of stops) {
        gradient.addColorStop(offset, color)
      }
      barFillStyle = gradient
    }
  }

  data.forEach(([, y], i) => {
    // draw bar
    ctx.fillStyle = barFillStyle
    ctx.fillRect((i + 0.25) * stepX, 0, 0.5 * stepX, barChartY(y))

    // draw bar value
    applyFontOptions(ctx, options.text.labels)
    ctx.fillText(`${formatFloat(y)}`, (i + 0.5) * stepX, barChartY(y) - 5)
  })
}

function drawLineChart(ctx: CanvasRenderingContext2D) {
  const { options } = props

  // draw lines
  ctx.strokeStyle = options.lineChart.strokeStyle
  ctx.lineWidth = options.lineChart.lineWidth
  ctx.lineJoin = 'round'
  if (Array.isArray(options.lineChart.lineDash)) {
    ctx.setLineDash(options.lineChart.lineDash)
  } else {
    ctx.setLineDash(DASH_PATTERNS[options.lineChart.lineDash])
  }

  ctx.beginPath()
  percentages.forEach((y, i) => {
    const x0 = (i + 0.5) * stepX
    const y0 = lineChartY(y)
    if (i === 0) {
      ctx.moveTo(x0, y0)
    } else {
      ctx.lineTo(x0, y0)
    }
  })
  ctx.stroke()
  ctx.setLineDash([])

  // draw markers
  const { shape, size, fillStyle, strokeStyle, lineWidth } = options.lineChart.marker
  percentages.forEach((y, i) => {
    const x0 = (i + 0.5) * stepX
    const y0 = lineChartY(y)

    ctx.fillStyle = fillStyle
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    switch (shape) {
      case 'circle':
        ctx.arc(x0, y0, size, 0, 2 * Math.PI)
        break
      case 'square':
        ctx.rect(x0 - size, y0 - size, 2 * size, 2 * size)
        break
      case 'triangle':
        ctx.moveTo(x0, y0 - size)
        ctx.lineTo(x0 - size, y0 + size)
        ctx.lineTo(x0 + size, y0 + size)
        ctx.closePath()
        break
      case 'diamond':
        ctx.moveTo(x0, y0 - size)
        ctx.lineTo(x0 - size, y0)
        ctx.lineTo(x0, y0 + size)
        ctx.lineTo(x0 + size, y0)
        ctx.closePath()
        break
    }
    ctx.fill()
    if (lineWidth > 0) ctx.stroke()

    // draw marker value
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    applyFontOptions(ctx, options.text.labels)
    ctx.fillText(`${y.toFixed(0)}%`, x0, y0 - 15)
  })
}
</script>

<template>
  <div class="container">
    <canvas
      ref="canvasRef"
      @mousemove.prevent="mouseMoveHandler"
      @wheel.prevent="wheelHandler"
    ></canvas>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: fit-content;
  height: fit-content;
  border: 1px solid #dddddd;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.container canvas {
  display: block;
  image-rendering: optimizeQuality;
}
</style>
