<script setup lang="ts">
import { ref, onMounted } from 'vue'

export type ChartData = [number, number][]

export interface ChartOptions {
  title: string
  width: number
  height: number
  barChart: {
    visible: boolean
    fillStyle: string
  }
  lineChart: {
    visible: boolean
    strokeStyle: string
    lineWidth: number
    marker: {
      shape: 'circle' | 'square'
      size: number
      fillStyle: string
      strokeStyle: string
    }
  }
  text: {
    font: string
    fillStyle: string
  }
}

const { data, options } = defineProps<{
  data: ChartData
  options: ChartOptions
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const devicePixelRatio = window.devicePixelRatio || 1

  const { width, height } = options

  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  ctx.scale(devicePixelRatio, devicePixelRatio)

  // calculate origin and box size
  const originX = 80
  const originY = height - 40
  const boxWidth = width - 70 - originX
  const boxHeight = originY - 80

  // draw title
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font = '24px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = options.text.fillStyle
  ctx.fillText(options.title, width / 2, 55)

  ctx.translate(originX, originY)

  // draw background
  ctx.fillStyle = '#f7f7f7'
  ctx.fillRect(0, 0, boxWidth, -boxHeight)

  // draw x-axis
  ctx.fillStyle = '#a5bce4'
  ctx.strokeStyle = '#a5bce4'
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
  const yStep = boxHeight / (1.2 * yMax)

  // draw x-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = options.text.font
  ctx.fillStyle = options.text.fillStyle
  data.forEach(([x, ], i) => {
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
    data.forEach(([x, y], i) => {
      // draw bar
      ctx.fillStyle = options.barChart.fillStyle
      ctx.fillRect((i + 0.25) * xStep, 0, 0.5 * xStep, -y * yStep)

      // draw bar value
      ctx.fillStyle = options.text.fillStyle
      ctx.fillText(`${y}`, (i + 0.5) * xStep, -y * yStep - 5)
    })
  }
})
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
    border: 1px solid #dddddd;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  canvas {
    display: block;
    image-rendering: optimizeQuality;
  }
</style>
