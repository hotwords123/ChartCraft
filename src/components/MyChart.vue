<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { type ChartData, type ChartOptions, DASH_PATTERNS } from '@/chart'

const props = defineProps<{
  data: ChartData
  options: ChartOptions
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctxRef = ref<CanvasRenderingContext2D | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctxRef.value = ctx

  resizeCanvas()
  render()
})

let oldWidth = 0
let oldHeight = 0

function resizeCanvas() {
  const canvas = canvasRef.value
  const ctx = ctxRef.value
  if (!canvas || !ctx) return

  const { width, height } = props.options
  oldWidth = width
  oldHeight = height

  const devicePixelRatio = window.devicePixelRatio || 1

  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx.resetTransform()
  ctx.scale(devicePixelRatio, devicePixelRatio)
}

function render() {
  const ctx = ctxRef.value
  if (!ctx) return

  const { data, options } = props
  const { width, height } = options

  if (width !== oldWidth || height !== oldHeight) {
    resizeCanvas()
  }

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // calculate origin and box size
  const originX = 80
  const originY = height - 40
  const boxWidth = width - 70 - originX
  const boxHeight = originY - 80

  // draw title
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font = options.text.titleFont
  ctx.fillStyle = options.text.fillStyle
  ctx.fillText(options.title, width / 2, 55)

  ctx.translate(originX, originY)

  // draw background
  ctx.fillStyle = options.background
  ctx.fillRect(0, 0, boxWidth, -boxHeight)

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
  ctx.lineTo(0, -boxHeight - 10)
  ctx.lineTo(-4, -boxHeight)
  ctx.lineTo(4, -boxHeight)
  ctx.lineTo(0, -boxHeight - 10)
  ctx.fill()
  ctx.stroke()

  // calculate layout
  const xStep = boxWidth / data.length
  const yMax = Math.max(...data.map(([, y]) => y))
  const yStep = boxHeight / (1.4 * yMax)

  // draw x-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = options.text.font
  ctx.fillStyle = options.text.fillStyle
  data.forEach(([x], i) => {
    ctx.fillText(`${x}`, (i + 0.5) * xStep, 8)
  })

  // draw x-axis title
  ctx.textAlign = 'left'
  ctx.fillText('Year', boxWidth + 15, 8)

  // draw y-axis labels
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= yMax; i++) {
    ctx.fillText(`${i}`, -8, -i * yStep)
  }

  // draw y-axis title
  ctx.fillText('Count', -12, -boxHeight)

  // draw bar chart
  if (options.barChart.visible) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    let barFillStyle: string | CanvasGradient
    if (typeof options.barChart.fillStyle === 'string') {
      barFillStyle = options.barChart.fillStyle
    } else {
      const { stops } = options.barChart.fillStyle
      const gradient = ctx.createLinearGradient(0, 0, 0, -boxHeight)
      for (const { offset, color } of stops) {
        gradient.addColorStop(offset, color)
      }
      barFillStyle = gradient
    }

    data.forEach(([, y], i) => {
      // draw bar
      ctx.fillStyle = barFillStyle
      ctx.fillRect((i + 0.25) * xStep, 0, 0.5 * xStep, -y * yStep)

      // draw bar value
      ctx.fillStyle = options.text.fillStyle
      ctx.fillText(`${y}`, (i + 0.5) * xStep, -y * yStep - 5)
    })
  }

  // draw line chart
  if (options.lineChart.visible) {
    // generate data points
    const total = data.reduce((sum, [, y]) => sum + y, 0)
    const percentages = data.map(([, y]) => (y / total) * 100)

    // calculate layout
    const maxPercentage = Math.max(...percentages)
    const yOffset = 80
    const yStep = (boxHeight - yOffset) / (1.2 * maxPercentage)
    ctx.save()
    ctx.translate(0, -yOffset)

    // draw lines
    ctx.strokeStyle = options.lineChart.strokeStyle
    ctx.lineWidth = options.lineChart.lineWidth
    if (Array.isArray(options.lineChart.lineDash)) {
      ctx.setLineDash(options.lineChart.lineDash)
    } else {
      ctx.setLineDash(DASH_PATTERNS[options.lineChart.lineDash])
    }

    ctx.beginPath()
    percentages.forEach((y, i) => {
      const x0 = (i + 0.5) * xStep
      const y0 = -y * yStep
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
      const x0 = (i + 0.5) * xStep
      const y0 = -y * yStep

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
      }
      ctx.fill()
      ctx.stroke()

      // draw marker value
      ctx.fillStyle = options.text.fillStyle
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`${y.toFixed(0)}%`, x0, y0 - 15)
    })

    ctx.restore()
  }

  ctx.restore()
}

watch(props, () => nextTick(render))
</script>

<template>
  <div class="container">
    <canvas ref="canvasRef"></canvas>
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
