<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NGrid,
  NFormItemGi,
  NInputGroup,
  NInputGroupLabel,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NColorPicker,
  NCheckbox,
  NDynamicInput,
  NScrollbar,
  NDatePicker,
} from 'naive-ui'
import MyChart from './components/MyChart.vue'
import type { ChartDataItem, ChartOptions } from './chart'
import { DASH_PATTERNS } from './chart'

/* chart data */

interface DataItem {
  x: string
  y: number
  checked: boolean
}

const initialData = [
  ['2019', 2],
  ['2020', 3],
  ['2021', 5],
  ['2022', 4],
] as const
const data = ref<DataItem[]>(initialData.map(([x, y]) => ({ x, y, checked: true })))

const chartData = computed(() => {
  return data.value.filter((item) => item.checked).map((item) => [item.x, item.y] as ChartDataItem)
})

function getYearTimestamp(year: number): number {
  return new Date(year, 0).getTime()
}

function onUpdateX(index: number, value: string) {
  data.value[index].x = value
}

function onUpdateY(index: number, value: number | null) {
  if (value !== null) {
    data.value[index].y = value
  }
}

function onCreate(index: number): DataItem {
  let x = ''
  if (index > 0 && index <= data.value.length) {
    let prevX = parseInt(data.value[index - 1].x)
    if (!isNaN(prevX)) {
      x = `${prevX + 1}`
    }
  }
  return { x, y: 0, checked: true }
}

function applyYearFilter(filter: [number, number] | null) {
  // 在这里实现筛选逻辑
  if (!filter) return

  const [start, end] = filter
  data.value.forEach((item) => {
    const year = parseInt(item.x)
    const timestamp = getYearTimestamp(year)
    item.checked = timestamp >= start && timestamp <= end
  })
}

function clearYearFilter() {
  for (let item of data.value) {
    item.checked = true
  }
}

/* chart options */

const options = ref<ChartOptions>({
  title: 'My Chart',
  width: 640,
  height: 480,
  background: '#fafafa',
  boxBackground: '#f7f7f7',
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

function useNonNullNumber<K extends string>(object: Record<K, number>, key: K) {
  return computed({
    get() {
      return object[key] as number
    },
    set(value: number | null) {
      if (value !== null) {
        object[key] = value
      }
    },
  })
}

const chartWidth = useNonNullNumber(options.value, 'width')
const chartHeight = useNonNullNumber(options.value, 'height')
const lineChartLineWidth = useNonNullNumber(options.value.lineChart, 'lineWidth')

const DASH_OPTIONS = Object.keys(DASH_PATTERNS).map((name) => ({ label: name, value: name }))
</script>

<template>
  <header>
    <h1>Hello, world!</h1>
  </header>
  <main>
    <MyChart class="chart" :data="chartData" :options="options" />
    <n-card class="settings" title="图表设置">
      <n-tabs type="line" animated pane-class="pane">
        <n-tab-pane name="data" tab="数据">
          <n-input-group class="year-filter-container">
            <n-input-group-label>年份筛选</n-input-group-label>
            <n-date-picker
              @confirm="applyYearFilter"
              @clear="clearYearFilter"
              type="yearrange"
              start-placeholder="起始年份"
              end-placeholder="结束年份"
              clearable
              class="year-filter"
            />
          </n-input-group>
          <n-scrollbar class="scroll">
            <n-dynamic-input v-model:value="data" :on-create="onCreate" class="padding">
              <template #create-button-default>添加数据</template>
              <template #default="{ index, value }">
                <div class="data-item">
                  <n-checkbox v-model:checked="value.checked" class="checkbox" />
                  <n-date-picker
                    :value="getYearTimestamp(parseInt(value.x))"
                    @update:formatted-value="(value) => onUpdateX(index, value)"
                    type="year"
                    class="input-x"
                    placeholder="年份"
                  />
                  <n-input-number
                    :value="value.y"
                    @update:value="(value) => onUpdateY(index, value)"
                    class="input-y"
                    placeholder="产量"
                  />
                </div>
              </template>
            </n-dynamic-input>
          </n-scrollbar>
        </n-tab-pane>
        <n-tab-pane name="appearance" tab="外观">
          <n-form label-placement="top" class="padding">
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="24" label="图表标题">
                <n-input v-model:value="options.title" />
              </n-form-item-gi>
              <n-form-item-gi :span="7" label="图表宽度">
                <n-input-number v-model:value="chartWidth" :min="360" :max="1080" :step="20" />
              </n-form-item-gi>
              <n-form-item-gi :span="7" label="图表高度">
                <n-input-number v-model:value="chartHeight" :min="240" :max="720" :step="20" />
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
          <n-form label-placement="top" class="padding">
            <n-grid :cols="24" :x-gap="12">
              <n-form-item-gi :span="8" label="线条颜色">
                <n-color-picker v-model:value="options.lineChart.strokeStyle" :show-alpha="false" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="线条粗细">
                <n-input-number v-model:value="lineChartLineWidth" :min="1" :max="5" :step="0.1" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="线条类型">
                <n-select v-model:value="options.lineChart.lineDash" :options="DASH_OPTIONS" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="JSON" tab="JSON">
          <n-scrollbar class="scroll">
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
  margin: 0 auto;
  min-width: 400px;
  max-width: 640px;
  min-height: 320px;
}

main .settings .pane .padding {
  padding: 4px;
}

main .settings .pane :deep(.scroll) {
  max-height: 400px;
}

.year-filter-container {
  margin-bottom: 8px;
}

.year-filter {
  max-width: 256px;
}

.data-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 8px;
}

.data-item .checkbox {
  margin-right: 8px;
}

.data-item .input-x {
  max-width: 120px;
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
