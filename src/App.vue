<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import {
  NButton,
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
  NRadioGroup,
  NSpace,
  NRadioButton,
} from 'naive-ui'
import MyChart from './components/MyChart.vue'
import type { ChartDataItem, ChartOptions } from './chart'
import {
  DASH_PATTERNS,
  FONT_FAMILIES,
  MARKER_SHAPE,
  FILL_TYPES,
  type GradientOptions,
} from './chart'
import { loadTextures, type TextureData } from './texture'

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

function showImportDialog() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.addEventListener('change', () => {
    const files = input.files
    if (files && files.length > 0) {
      loadDataFile(files[0]).catch((err) => {
        console.error(err)
      })
    }
  })
  input.click()
}

async function loadDataFile(file: File) {
  if (file.type !== 'application/json') throw new Error('unsupported file type')

  const text = await file.text()
  const json = JSON.parse(text) as [string, number][]

  data.value = json.map(([x, y]) => ({ x, y, checked: true }))
}

function showExportDialog() {
  const json = data.value
    .filter(({ checked }) => checked)
    .map(({ x, y }) => [x, y] as [string, number])
  const content = JSON.stringify(json)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()

  URL.revokeObjectURL(url)
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
    fillStyle: '',
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
      lineWidth: 1.6,
    },
  },
  text: {
    title: {
      family: 'Segoe UI',
      size: 24,
      fillStyle: '#222',
    },
    ticks: {
      family: 'Segoe UI',
      size: 14,
      fillStyle: '#222',
    },
    labels: {
      family: 'Segoe UI',
      size: 14,
      fillStyle: '#222',
    },
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
const TEXT_KEY_MAP = {
  title: '标题',
  ticks: '刻度',
  labels: '标签',
}

const PATTERNS = ref<TextureData[]>([])
loadTextures().then((textures) => {
  PATTERNS.value = textures
})

const patternOptions = computed(() => {
  return PATTERNS.value.map((texture) => ({
    label: texture.label,
    value: texture.id,
  }))
})

type BarFillType = 'single' | 'gradient' | 'pattern'

let barFillType = ref<BarFillType>('gradient')
let barSingleColor = ref('#6495ed')
let barGradientColor = ref<GradientOptions['stops']>([
  { offset: 0, color: '#6096e6' },
  { offset: 1, color: '#81eeaa' },
])
let barPatternSrc = ref('')

watchEffect(() => {
  const { barChart } = options.value

  switch (barFillType.value) {
    case 'single': {
      barChart.fillStyle = barSingleColor.value
      break
    }
    case 'gradient': {
      barChart.fillStyle = {
        stops: barGradientColor.value,
      }
      break
    }
    case 'pattern': {
      const texture = PATTERNS.value.find((texture) => texture.id === barPatternSrc.value)
      if (texture) barChart.fillStyle = texture.img
      break
    }
  }
})

function onCreateGradient() {
  return {
    color: '#6096e6',
    offset: 0,
  }
}
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
          <div class="padding">
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
            <n-space>
              <n-button @click="showImportDialog">导入数据</n-button>
              <n-button @click="showExportDialog">导出数据</n-button>
            </n-space>
          </div>
          <n-scrollbar class="scroll">
            <n-dynamic-input v-model:value="data" @create="onCreate" class="padding">
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
        <n-tab-pane name="bar-chart" tab="柱状图">
          <n-space vertical class="padding">
            <!-- type select -->
            <n-radio-group v-model:value="barFillType">
              <n-space>
                <n-radio-button v-for="item in FILL_TYPES" :key="item.value" :value="item.value">
                  {{ item.label }}
                </n-radio-button>
              </n-space>
            </n-radio-group>
            <!-- single -->
            <n-color-picker
              v-if="barFillType === 'single'"
              v-model:value="barSingleColor"
              :show-alpha="false"
            />
            <!-- gradient -->
            <n-dynamic-input
              v-if="barFillType === 'gradient'"
              v-model:value="barGradientColor"
              :on-create="onCreateGradient"
            >
              <template #create-button-default>添加渐变</template>
              <template #default="{ value }">
                <div class="data-item">
                  <n-color-picker v-model:value="value.color" :show-alpha="false" />
                  <n-input-number v-model:value="value.offset" :min="0" :max="1" :step="0.1" />
                </div>
              </template>
            </n-dynamic-input>
            <!-- pattern -->
            <n-select
              v-if="barFillType === 'pattern'"
              v-model:value="barPatternSrc"
              :options="patternOptions"
            />
          </n-space>
        </n-tab-pane>
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
              <n-form-item-gi :span="8" label="标记颜色">
                <n-color-picker
                  v-model:value="options.lineChart.marker.fillStyle"
                  :show-alpha="false"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="标记大小">
                <n-input-number
                  v-model:value="options.lineChart.marker.size"
                  :min="1"
                  :max="10"
                  :step="0.5"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="标记形状">
                <n-select v-model:value="options.lineChart.marker.shape" :options="MARKER_SHAPE" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="标记描边颜色">
                <n-color-picker
                  v-model:value="options.lineChart.marker.strokeStyle"
                  :show-alpha="false"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="标记描边粗细">
                <n-input-number
                  v-model:value="options.lineChart.marker.lineWidth"
                  :min="0"
                  :max="3"
                  :step="0.2"
                />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="text" tab="文本">
          <n-form label-placement="top" class="padding">
            <n-grid :cols="24" :x-gap="12">
              <template v-for="(fontOptions, key) in options.text" :key="key">
                <n-form-item-gi :span="8" :label="TEXT_KEY_MAP[key] + '字体'">
                  <n-select v-model:value="fontOptions.family" :options="FONT_FAMILIES" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="TEXT_KEY_MAP[key] + '颜色'">
                  <n-color-picker v-model:value="fontOptions.fillStyle" :show-alpha="false" />
                </n-form-item-gi>
                <n-form-item-gi :span="8" :label="TEXT_KEY_MAP[key] + '字体大小'">
                  <n-input-number v-model:value="fontOptions.size" :min="12" :max="36" :step="1" />
                </n-form-item-gi>
              </template>
            </n-grid>
          </n-form>
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
  max-height: 360px;
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
