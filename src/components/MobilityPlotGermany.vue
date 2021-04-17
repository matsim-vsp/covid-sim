<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import Papa from 'papaparse'
import VuePlotly from '@statnett/vue-plotly'

interface City {
  fromModel: string[]
  fromCSV: string[]
  csvLineNames: string[]
  dateFormatter: Function
  dateColumn: string
}

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private endDate!: string

  private dataLines: any[] = []

  private mounted() {
    this.buildPlot()
  }

  private buildPlot() {
    this.updateMobilityData()
  }

  @Watch('data') private updateMobilityData() {
    var mobilityData: any[] = []
    const sevenDays = 7

    const date = []
    const sevenDayDate = []
    const outOfHomeDuration = []
    const sevenDayOutOfHomeDuration = []
    const percentageChangeComparedToBeforeCorona = []
    const sevenDayPercentageChangeComparedToBeforeCorona = []

    for (let i = 0; i < this.data[16].date.length; i++) {
      date.push(this.data[16].date[i])
      outOfHomeDuration.push(this.data[16].outOfHomeDuration[i])
      percentageChangeComparedToBeforeCorona.push(
        this.data[16].percentageChangeComparedToBeforeCorona[i]
      )
    }

    mobilityData.push({
      name: 'outOfHomeDuration',
      x: date,
      y: outOfHomeDuration,
      fill: 'none',
      marker: { size: 2 },
      opacity: '0.3',
      line: {
        dash: 'dot',
        width: 2,
        color: '#707',
      },
    })

    for (let j = sevenDays + 5; j < outOfHomeDuration.length; j += sevenDays) {
      let avgSum = 0
      for (let k = j - sevenDays; k < j; k += 1) {
        avgSum += outOfHomeDuration[k]
      }
      let avgerage = avgSum / 7
      const rate = 0.1 * Math.round(10.0 * avgerage)
      sevenDayOutOfHomeDuration.push(rate)
      sevenDayDate.push(date[j - 3])
    }
    mobilityData.push({
      name: 'outOfHomeDuration (7 day average)',
      x: sevenDayDate,
      y: sevenDayOutOfHomeDuration,
      fill: 'none',
      marker: { size: 2 },
      line: {
        dash: 'line',
        width: 2,
        color: '#067',
      },
    })

    for (let j = sevenDays + 5; j < outOfHomeDuration.length; j += sevenDays) {
      let avgSum = 0
      for (let k = j - sevenDays; k < j; k += 1) {
        avgSum += percentageChangeComparedToBeforeCorona[k]
      }
      let avgerage = avgSum / 7
      const rate = 0.1 * Math.round(10.0 * avgerage)
      sevenDayPercentageChangeComparedToBeforeCorona.push(rate)
    }

    mobilityData.push({
      name: 'percentageChangeComparedToBeforeCorona',
      x: sevenDayDate,
      y: sevenDayPercentageChangeComparedToBeforeCorona,
      fill: 'none',
      yaxis: 'y2',
      marker: { size: 2 },
      line: {
        dash: 'line',
        width: 2,
        color: '#090',
      },
    })

    this.dataLines = mobilityData
  }

  private layout = {
    showlegend: true,
    autosize: true,
    legend: {
      orientation: 'h',
    },
    font: {
      family: 'Roboto,Arial,Helvetica,sans-serif',
      size: 12,
      color: '#000',
    },
    margin: { t: 5, r: 60, b: 0, l: 60 },
    xaxis: {
      fixedrange: window.innerWidth < 700,
      range: ['2020-03-02', '2021-04-12'],
      type: 'date',
    },
    yaxis: {
      fixedrange: window.innerWidth < 700,
      type: 'linear',
      autorange: true,
      title: 'outOfHomeDuration',
    },
    yaxis2: {
      fixedrange: window.innerWidth < 700,
      type: 'linear',
      autorange: true,
      title: 'percentageChangeComparedToBeforeCorona',
      side: 'right',
      overlaying: 'y',
    },
    plot_bgcolor: '#f8f8f8',
    paper_bgcolor: '#f8f8f8',
  }

  private options = {
    responsive: true,
    // displayModeBar: true,
    displaylogo: false,
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
      filename: 'custom_image',
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
