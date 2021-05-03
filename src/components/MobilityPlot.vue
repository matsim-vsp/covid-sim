<template lang="pug">
vue-plotly(:data="dataLines" :layout="layout" :options="options")

</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import VuePlotly from '@statnett/vue-plotly'

@Component({ components: { VuePlotly }, props: {} })
export default class VueComponent extends Vue {
  @Prop({ required: true }) private data!: any[]
  @Prop({ required: true }) private outOfHomeDurationPlot!: boolean
  @Prop({ required: true }) private yAxisName!: string
  @Prop({ required: true }) private plotInterval!: any[]
  @Prop({ required: true }) private activity!: string

  private dataLines: any[] = []
  private holidays = [
    '2020-04-10',
    '2020-04-13',
    '2020-05-01',
    '2020-05-21',
    '2020-06-01',
    '2020-12-25',
    '2021-01-01',
    '2021-04-02',
    '2021-04-05',
    '2021-05-13',
    '2021-05-24',
  ]

  private mounted() {
    this.updateMobilityData()
  }

  @Watch('activity') private changeActivity() {
    this.layout.yaxis.title = this.yAxisName
    this.updateMobilityData()
  }

  @Watch('data') private updateMobilityData() {
    var mobilityData: any[] = []

    var plotIntervalData = this.plotInterval

    const date = []
    const sevenDaysDates = []
    const sevenDays = 7

    if (this.data.length == 0) {
      return false
    }

    for (let i = 0; i < this.data[0].date.length; i++) {
      date.push(this.data[0].date[i])
    }

    for (let j = sevenDays + plotIntervalData[0]; j < this.data[0].date.length; j += sevenDays) {
      sevenDaysDates.push(this.data[0].date[j - 3])
    }

    for (let i = 0; i < this.data.length; i++) {
      const outOfHomeDuration = []
      const sevenDayOutOfHomeDuration = []

      if (this.outOfHomeDurationPlot) {
        for (let j = 0; j < this.data[i].date.length; j++) {
          if (this.activity == 'outOfHomeDuration') {
            outOfHomeDuration.push(this.data[i].outOfHomeDuration[j])
          } else if (this.activity == 'dailyRangePerPerson') {
            outOfHomeDuration.push(this.data[i].dailyRangePerPerson[j])
          } else if (this.activity == 'sharePersonLeavingHome') {
            outOfHomeDuration.push(this.data[i].sharePersonLeavingHome[j])
          }
        }

        for (
          let j = sevenDays + plotIntervalData[0];
          j < this.data[i].date.length;
          j += sevenDays
        ) {
          let avgSum = 0
          let average = 0
          let foundDaysWeek = 0
          for (let k = j - plotIntervalData[1] - 3; k <= j + plotIntervalData[2] - 3; k += 1) {
            if (this.activity == 'outOfHomeDuration') {
              avgSum += this.data[i].outOfHomeDuration[k]
            } else if (this.activity == 'dailyRangePerPerson') {
              avgSum += this.data[i].dailyRangePerPerson[k]
            } else if (this.activity == 'sharePersonLeavingHome') {
              avgSum += this.data[i].sharePersonLeavingHome[k]
            }
            if (plotIntervalData[0] == -2) {
              if (this.data[i].holidays.includes(this.data[i].date[k])) {
                foundDaysWeek += 1
                if (this.activity == 'outOfHomeDuration') {
                  avgSum -= this.data[i].outOfHomeDuration[k]
                } else if (this.activity == 'dailyRangePerPerson') {
                  avgSum -= this.data[i].dailyRangePerPerson[k]
                } else if (this.activity == 'sharePersonLeavingHome') {
                  avgSum -= this.data[i].sharePersonLeavingHome[k]
                }
              }
            }
          }
          if (plotIntervalData[0] == 2) {
            let foundDays = 0
            for (let k = -7; k <= -4; k++) {
              if (j - plotIntervalData[1] - k >= 0) {
                if (
                  this.data[i].holidays.includes(this.data[i].date[j - plotIntervalData[1] + k])
                ) {
                  // is thuesday-fridays holiday?
                  foundDays += 1
                  if (this.activity == 'outOfHomeDuration') {
                    avgSum += this.data[i].outOfHomeDuration[j - plotIntervalData[1] + k]
                  } else if (this.activity == 'dailyRangePerPerson') {
                    avgSum += this.data[i].dailyRangePerPerson[j - plotIntervalData[1] + k]
                  } else if (this.activity == 'sharePersonLeavingHome') {
                    avgSum += this.data[i].sharePersonLeavingHome[j - plotIntervalData[1] + k]
                  }
                }
              }
            }
            if (this.data[i].holidays.includes(this.data[i].date[j + plotIntervalData[2] - 2])) {
              // is monday holiday?
              foundDays += 1
              if (this.activity == 'outOfHomeDuration') {
                avgSum += this.data[i].outOfHomeDuration[j + plotIntervalData[2] - 2]
              } else if (this.activity == 'dailyRangePerPerson') {
                avgSum += this.data[i].dailyRangePerPerson[j + plotIntervalData[2] - 2]
              } else if (this.activity == 'sharePersonLeavingHome') {
                avgSum += this.data[i].sharePersonLeavingHome[j + plotIntervalData[2] - 2]
              }
            }
            average = avgSum / (plotIntervalData[1] + plotIntervalData[2] + 1 + foundDays)
          } else {
            average = avgSum / (plotIntervalData[1] + plotIntervalData[2] + 1 - foundDaysWeek)
          }
          const rate = 0.1 * Math.round(10.0 * average)
          sevenDayOutOfHomeDuration.push(rate)
        }
      } else {
        for (let j = 0; j < this.data[i].date.length; j++) {
          outOfHomeDuration.push(this.data[i].percentageChangeComparedToBeforeCorona[j])
        }

        for (
          let j = sevenDays + plotIntervalData[0];
          j < this.data[i].date.length;
          j += sevenDays
        ) {
          let avgSum = 0
          let average = 0
          for (let k = j - plotIntervalData[1] - 3; k <= j + plotIntervalData[2] - 3; k += 1) {
            avgSum += this.data[i].percentageChangeComparedToBeforeCorona[k]
          }
          average = avgSum / (plotIntervalData[1] + plotIntervalData[2] + 1)
          const rate = 0.1 * Math.round(10.0 * average)
          sevenDayOutOfHomeDuration.push(rate)
        }
      }

      if (this.data[i].name == 'Deutschland') {
        mobilityData.push({
          name: this.data[i].name,
          x: sevenDaysDates,
          y: sevenDayOutOfHomeDuration,
          fill: 'none',
          marker: { size: 4 },
          line: {
            dash: 'line',
            width: 2,
            color: 'black',
          },
        })
      } else {
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
      //range: ['2020-03-02', '2021-04-26'],
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
