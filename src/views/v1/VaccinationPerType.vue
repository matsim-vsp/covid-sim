<template lang="pug">
.my-vue-component(v-if="!isResizing")
  vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@/components/VuePlotly.vue'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private logScale!: boolean
  @Prop({ required: true }) private vaccinations!: any[]
  @Prop({ required: true }) private endDate!: any

  private dataLines: any[] = []

  private mounted() {
    try {
      this.calculateValues()
    } catch (e) {
      console.warn('VACCINATIONS PER TYPE data not found')
      // maybe this run doesn't have vaccinations or boosters
    }
  }

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  @Watch('vaccinations') private updateModelData() {
    this.calculateValues()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis.type = this.logScale ? 'log' : 'linear'
  }

  private calculateValues() {
    if (this.vaccinations.length === 0) return

    this.dataLines = []

    // set end date
    this.layout.xaxis.range[0] = this.$store.state.graphStartDate
    this.layout.xaxis.range[1] = this.endDate

    let formattedData = {
      names: [],
      date: [],
      values: [],
    } as {
      [id: string]: any[]
    }

    const header = Object.keys(this.vaccinations[0])

    // Skip date and day column
    for (let i = 2; i < header.length; i++) {
      formattedData.names.push(header[i])
      formattedData.values.push([])
    }

    for (let i = 7; i < this.vaccinations.length; i = i += 7) {
      for (let j = 2; j < header.length; j++) {
        const value =
          this.vaccinations[i][header[j]] +
          this.vaccinations[i - 1][header[j]] +
          this.vaccinations[i - 2][header[j]] +
          this.vaccinations[i - 3][header[j]] +
          this.vaccinations[i - 4][header[j]] +
          this.vaccinations[i - 5][header[j]] +
          this.vaccinations[i - 6][header[j]]
        formattedData.values[j - 2].push(value / 7)
      }
      formattedData.date.push(this.vaccinations[i].date)
    }

    for (let i = 0; i < formattedData.names.length; i++) {
      this.dataLines.push({
        name: formattedData.names[i],
        x: formattedData.date,
        y: formattedData.values[i],
      })
    }
  }

  private layout = {
    height: 240,
    autosize: true,
    showlegend: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 10, b: 0, l: 60 },
    xaxis: {
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      range: ['2020-02-09', '2020-12-31'],
      type: 'date',
    },
    yaxis: {
      // note this gets overwritten when the scale changes - see updateScale()
      //fixedrange: window.innerWidth < 700,
      fixedrange: true,
      type: this.logScale ? 'log' : 'linear',
      autorange: true,
      //range: [0, 100],
      title: '7-Day Vaccinations per Day',
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

@media only screen and (max-width: 640px) {
}
</style>
