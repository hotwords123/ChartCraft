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
  barChart: {
    visible: true,
    fillStyle: '#81ceaa',
  },
  lineChart: {
    visible: true,
    strokeStyle: 'blue',
    lineWidth: 2,
    marker: {
      shape: 'circle',
      size: 5,
      fillStyle: '#6096e6',
      strokeStyle: '#5682c3',
    },
  },
  text: {
    font: '14px "Segoe UI", Arial, sans-serif',
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
