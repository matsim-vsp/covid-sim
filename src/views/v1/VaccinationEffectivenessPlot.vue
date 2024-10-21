<template lang="pug">
.vue-component(v-if="!isResizing")
  vue-plotly.plot1(
      :class="{'mrna': vaccineType=='mRNA'}"
      :data="dataLines"
      :layout="layout"
      :options="options"
  )

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@/components/VuePlotly.vue'
import Papaparse from '@simwrapper/papaparse'

import { PUBLIC_SVN } from '@/Globals'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private startDate!: any
  @Prop({ required: true }) private endDate!: any
  @Prop({ required: true }) private vaccineEffectivenessData!: any[]
  @Prop({ required: true }) private vaccineEffectivenessFields!: string[]
  @Prop({ required: true }) private vaccineType!: string

  private logScale = false

  private color = ['#094', '#0c4']

  private lagDays = 1

  private observedColumn = {
    mRNA: 'mRNA-Delta',
    vector: 'Vector-Delta',
  } as any

  private dataLines: any[] = []

  private mounted() {
    this.calculateValues()
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('vaccineEffectivenessData') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          range: [Math.log10(2), Math.log10(10000)],
          title: 'Hospitalizations / 100k Pop.',
        }
      : {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          autorange: true,
          title: 'Hospitalizations / 100k Pop.',
        }
  }

  private calculateValues() {
    if (this.vaccineEffectivenessData.length === 0) return

    // set end date
    // this.layout.xaxis.range = ['2020-02-09', this.endDate]

    const lines = { day: [] } as { [id: string]: any[] }

    const columns = this.vaccineEffectivenessFields
      .filter(col => col.startsWith(this.vaccineType))
      .sort()
    columns.forEach(col => (lines[col] = [] as number[]))

    for (const row of this.vaccineEffectivenessData) {
      // if all we have is a day and a blank record, skip it
      if (Object.keys(row).length === 1) continue

      lines.day.push(row.day)

      columns.forEach(col => {
        // lines[col].push(100.0 * row[col])
        let v = row[col]
        if (v == undefined) {
          lines[col].push(NaN)
        } else {
          lines[col].push(Math.round(10000 * row[col]) / 100)
        }
      })
    }

    this.dataLines = []
    this.isObservedAdded = false

    columns.forEach(col => {
      this.dataLines.push({
        name: col,
        x: lines.day,
        y: lines[col],
        line: { width: 1 },
      })
    })

    this.addObservedData()
  }

  private observedLine: any
  private isObservedAdded = false

  private async addObservedData() {
    // already have it?
    if (this.observedLine && !this.isObservedAdded) {
      this.dataLines.push(this.observedLine)
      return
    }

    try {
      const url = PUBLIC_SVN + 'original-data/vaccine-effectiveness/nordstroem-paper.tsv'
      const data = await (await fetch(url)).text()

      const rows = Papaparse.parse(data, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      }).data

      const columnName = this.observedColumn[this.vaccineType]

      this.observedLine = {
        name: 'Nordström: ' + columnName,
        x: rows.map(row => row.day),
        y: rows.map(row => 100 * row[columnName]),
        line: {
          dash: 'dot',
          width: 2,
          color: '#f4c',
        },
      }
    } catch (e) {
      console.warn(e)
    }

    if (!this.isObservedAdded) {
      this.dataLines.push(this.observedLine)
      this.isObservedAdded = true
    }
  }

  private reformatDate(day: string) {
    const pieces = day.split('.')
    const date = pieces[2] + '-' + pieces[1] + '-' + pieces[0]
    return date
  }

  private layout = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'v',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 35, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      autorange: true,
      title: 'Days since vaccination',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: 'linear',
      // autorange: true,
      range: [0, 100],
      title: this.vaccineType + ' Effectiveness',
    } as any,
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    // displayModeBar: true,
    displaylogo: false,
    responsive: true,
    modeBarButtonsToRemove: [
      'pan2d',
      'zoom2d',
      'select2d',
      'lasso2d',
      'zoomIn2d',
      'zoomOut2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'resetScale2d',
      'toggleSpikelines',
      'resetViewMapbox',
    ],
    toImageButtonOptions: {
      format: 'svg', // one of png, svg, jpeg, webp
      filename: 'daily-cases',
      width: 1200,
      height: 600,
      scale: 1.0, // Multiply title/legend/axis/canvas sizes by this factor
    },
  }
}
</script>

<style scoped lang="scss">
@import '@/styles.scss';

.vue-component {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plot1 {
  flex: 1;
}

.mrna {
  margin-bottom: 1rem;
}

@media only screen and (max-width: 640px) {
}
</style>
