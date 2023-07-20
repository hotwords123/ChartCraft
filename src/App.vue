<script setup lang="ts">
import { ref } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NGrid,
  NFormItemGi,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NColorPicker,
  NScrollbar,
} from 'naive-ui'
import MyChart from './components/MyChart.vue'
import type { ChartData, ChartOptions } from './chart'
import { DASH_PATTERNS } from './chart'

const DASH_OPTIONS = Object.keys(DASH_PATTERNS).map((name) => ({ label: name, value: name }))

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
      ],
    },
  },
  lineChart: {
    visible: true,
    strokeStyle: '#6495ed',
    lineWidth: 1.5,
    lineDash: 'solid',
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
    <MyChart class="chart" :data="data" :options="options" />
    <n-card class="settings" title="图表设置">
      <n-tabs type="line" animated pane-class="pane">
        <n-tab-pane name="data" tab="数据">
          <!-- TODO -->
        </n-tab-pane>
        <n-tab-pane name="appearance" tab="外观">
          <n-form label-placement="top">
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="24" label="图表标题">
                <n-input v-model:value="options.title" />
              </n-form-item-gi>
              <n-form-item-gi :span="7" label="图表宽度">
                <n-input-number v-model:value="options.width" :min="360" :max="1024" />
              </n-form-item-gi>
              <n-form-item-gi :span="7" label="图表高度">
                <n-input-number v-model:value="options.height" :min="240" :max="720" />
              </n-form-item-gi>
              <n-form-item-gi :span="5" label="柱状图">
                <n-switch v-model:value="options.barChart.visible" />
              </n-form-item-gi>
              <n-form-item-gi :span="5" label="折线图">
                <n-switch v-model:value="options.lineChart.visible" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="bar-chart" tab="柱状图"> </n-tab-pane>
        <n-tab-pane name="line-chart" tab="折线图">
          <n-form label-placement="top">
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="8" label="线条颜色">
                <n-color-picker v-model:value="options.lineChart.strokeStyle" :show-alpha="false" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="线条粗细">
                <n-input-number
                  v-model:value="options.lineChart.lineWidth"
                  :min="1"
                  :max="5"
                  :step="0.1"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="线条类型">
                <n-select v-model:value="options.lineChart.lineDash" :options="DASH_OPTIONS" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="JSON" tab="JSON">
          <n-scrollbar style="max-height: 400px">
            <pre>{{ JSON.stringify(options, null, 2) }}</pre>
          </n-scrollbar>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </main>
</template>

<style scoped>
header {
  margin-bottom: 1rem;
}

main {
  display: flex;
  flex-direction: row;
  column-gap: 24px;
  align-items: stretch;
}

main .settings {
  flex: 1 1;
  min-height: 320px;
}

main .settings .pane {
  padding-left: 4px;
  padding-right: 4px;
}

@media screen and (max-width: 1200px) {
  main {
    flex-direction: column;
  }

  main .chart {
    margin: 0 auto;
  }

  main .settings {
    margin-top: 24px;
  }
}
</style>
