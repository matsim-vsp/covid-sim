<template lang="pug">
vue-plotly(:data="dataMatrix" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'
import { log, transpose } from 'mathjs'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: string
  @Prop({ required: true }) private endDate!: string
  @Prop({ required: false }) private heatMapMaxValue!: number

  private maximumValue = 2000

  private isResizing = false
  @Watch('$store.state.isWideMode') async handleWideModeChanged() {
    this.isResizing = true
    await this.$nextTick()
    this.layout = Object.assign({}, this.layout)
    this.isResizing = false
  }

  private dataMatrix: any[] = []

  // log of 'Hot' Colorscale from
  // https://github.com/plotly/plotly.js/blob/master/src/components/colorscale/scales.js
  // [0.0, 'rgb(255,255,255)'],
  // [0.4, 'rgb(255,210,0)'],
  // [0.7, 'rgb(230,0,0)'],
  // [1.0, 'rgb(0,0,0)'],

  private logColorScale = [
    [0.0, 'rgb(255,255,255)'],
    [0.01, 'rgb(250,210,0)'],
    [0.1, 'rgb(240,120,0)'],
    [0.2, 'rgb(230,0,0)'],
    [0.99999999, 'rgb(0,0,0)'],
    [1.0, 'rgb(255,255,255)'],
    //[1.0, 'rgb(0,0,0)'], // comment this line out and add the two above will fix the "color bug"
  ]

  private mounted() {
    this.buildHeatMap()
  }

  @Watch('data') private updateModelData() {
    this.buildHeatMap()
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
    matrix[0][0] = this.maximumValue

    this.dataMatrix = [
      {
        type: 'heatmap',
        x,
        y,
        z: matrix,
        colorscale: this.logColorScale, // 'Hot', // 'YlOrRed', // 'Hot',
        // reversescale: true,
        showscale: false,
        hoverongaps: false,
      },
    ]
  }

  private layout = {
    showlegend: false,
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
    yaxis: {
      title: 'Age',
      fixedrange: true,
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
    // legend: { orientation: 'h' },
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
      filename: 'heatmap',
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
