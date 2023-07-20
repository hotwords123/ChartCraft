<script setup lang="ts">
import { ref } from 'vue'
import MyChart, { type ChartData, type ChartOptions } from './components/MyChart.vue'

const data = ref<ChartData>([
  [2019, 2],
  [2020, 3],
  [2021, 5],
  [2022, 4],
])

const options = ref<ChartOptions>({
  title: 'My Chart',
  width: 640,
  height: 480,
  background: '#f7f7f7',
  axes: {
    color: '#a5bce4',
  },
  barChart: {
    visible: true,
    fillStyle: {
      stops: [
        { offset: 0, color: '#6096e6' },
        { offset: 1, color: '#81eeaa' },
      ]
    },
  },
  lineChart: {
    visible: true,
    strokeStyle: '#6495ed',
    lineWidth: 1.5,
    lineDash: "solid",
    marker: {
      shape: 'circle',
      size: 5,
      fillStyle: '#6096e6',
      strokeStyle: '#5682c3',
      lineWidth: 1.5,
    },
  },
  text: {
    font: '14px "Segoe UI", Arial, sans-serif',
    titleFont: '24px "Segoe UI", Arial, sans-serif',
    fillStyle: '#222',
  },
})
</script>

<template>
  <header>
    <h1>Hello, world!</h1>
  </header>
  <main>
    <MyChart :data="data" :options="options" />
  </main>
</template>

<style scoped>
header {
  margin-bottom: 1rem;
}
</style>
