<template lang="pug">
vue-plotly(:data="dataMatrix" :layout="layout" :options="options" @relayout="handleRelayout")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { log, transpose } from 'mathjs'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: true }) private logScale!: boolean

  private dataMatrix: any[] = []

  private mounted() {
    this.buildHeatMap()
  }

  private handleRelayout(event: any) {
    if (event['xaxis.range[0]'] == '2020-02-09' && event['xaxis.range[1]'] == '2020-12-31') {
      this.buildHeatMap()
    }
  }

  @Watch('$store.state.isWideMode') handleWideModeChanged() {
    this.layout = Object.assign({}, this.layout)
  }

  @Watch('data') private updateModelData() {
    this.buildHeatMap()
  }

  @Watch('logScale') updateScale() {
    this.layout.yaxis = this.logScale
      ? {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'log',
          //range: [Math.log10(2), Math.log10(5000)],
          title: 'Incidence',
        }
      : {
          //fixedrange: window.innerWidth < 700,
          fixedrange: true,
          type: 'linear',
          //autorange: true,
          title: 'Incidence',
        }
  }

  private buildHeatMap() {
    this.dataMatrix = []

    if (!this.data) return

    const x: string[] = []
    let matrix: any[] = []

    const lines = this.data.split('\n')

    // get column names (not including date)
    const y: string[] = lines[0].split('\t').splice(1)

    // build matrix
    for (const line of lines.splice(1)) {
      const cells = line.split('\t')
      const date = cells[0]
      if (date) {
        x.push(date)
        const values = cells.splice(1)
        matrix.push(values)
      }
    }

    matrix = transpose(matrix)

    for (var i = matrix.length - 1; i >= 0; i--) {
      this.dataMatrix.push({
        x,
        y: matrix[i],
        name: y[i],
      })
    }
  }

  private layout = {
    autosize: true,
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 10, r: 10, b: 30, l: 60 },
    xaxis: {
      type: 'date',
      range: [this.$store.state.graphStartDate, this.endDate],
      fixedrange: true,
    },
    legend: {
      orientation: 'h',
    },
    yaxis: {
      title: 'Incidence',
      type: 'log',
      fixedrange: true,
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
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
      filename: 'incidenceByAgeGroupOverTime',
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
