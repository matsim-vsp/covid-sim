<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private outOfHomeDuration!: boolean
  @Prop({ required: true }) private yAxisName!: string

  private dataLines: any[] = []

  private mounted() {
    this.updateMobilityData()
  }

  @Watch('data') private updateMobilityData() {
    var mobilityData: any[] = []

    const date = []
    const sevenDaysDates = []
    const sevenDays = 7

    if (this.data.length == 0) {
      return false
    }

    for (let i = 0; i < this.data[0].date.length; i++) {
      date.push(this.data[0].date[i])
    }

    for (let j = sevenDays + 5; j < this.data[0].date.length; j += sevenDays) {
      sevenDaysDates.push(this.data[0].date[j - 3])
    }

    for (let i = 0; i < this.data.length; i++) {
      const outOfHomeDuration = []
      const sevenDayOutOfHomeDuration = []

      if (this.outOfHomeDuration) {
        for (let j = 0; j < this.data[i].date.length; j++) {
          outOfHomeDuration.push(this.data[i].outOfHomeDuration[j])
        }

        for (let j = sevenDays + 5; j < this.data[i].date.length; j += sevenDays) {
          let avgSum = 0
          for (let k = j - sevenDays; k < j; k += 1) {
            avgSum += this.data[i].outOfHomeDuration[k]
          }
          let avgerage = avgSum / 7
          const rate = 0.1 * Math.round(10.0 * avgerage)
          sevenDayOutOfHomeDuration.push(rate)
        }
      } else {
        for (let j = 0; j < this.data[i].date.length; j++) {
          outOfHomeDuration.push(this.data[i].percentageChangeComparedToBeforeCorona[j])
        }

        for (let j = sevenDays + 5; j < this.data[i].date.length; j += sevenDays) {
          let avgSum = 0
          for (let k = j - sevenDays; k < j; k += 1) {
            avgSum += this.data[i].percentageChangeComparedToBeforeCorona[k]
          }
          let avgerage = avgSum / 7
          const rate = 0.1 * Math.round(10.0 * avgerage)
          sevenDayOutOfHomeDuration.push(rate)
        }
      }

      mobilityData.push({
        name: this.data[i].name,
        x: sevenDaysDates,
        y: sevenDayOutOfHomeDuration,
        fill: 'none',
        marker: { size: 2 },
        opacity: '0.5',
        line: {
          dash: 'dot',
          width: 1.5,
          color: this.data[i].name,
        },
      })
    }

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
      title: this.yAxisName,
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
